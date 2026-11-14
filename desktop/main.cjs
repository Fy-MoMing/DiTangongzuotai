const { app, BrowserWindow, Menu, protocol, net, shell, dialog, ipcMain, clipboard, ClipboardItem, nativeImage } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createPriceStore } = require('./price-config.cjs');
const { createWeatherService } = require('./weather.cjs');
const { createUpdateService } = require('./updates.cjs');
const { repository } = require('../config/github.json');
const { spawn } = require('node:child_process');

const APP_URL = 'app://carpet-studio/';
const APP_NAME = '地毯工作台';
let mainWindow;

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }
]);

app.setName(APP_NAME);
// Keep saved data at the same location for both the portable and installed editions.
app.setPath('userData', app.commandLine.getSwitchValue('user-data-dir') || path.join(app.getPath('appData'), 'CarpetStudio'));

function isAppUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'app:' && url.host === 'carpet-studio';
  } catch {
    return false;
  }
}

async function openExternal(value) {
  try {
    const url = new URL(value);
    if (['https:', 'http:'].includes(url.protocol)) await shell.openExternal(url.href);
  } catch (error) {
    console.error('Unable to open external link:', error.message);
  }
}

function readImage(event, dataUrl) {
  if (!isAppUrl(event.senderFrame?.url) || event.senderFrame !== event.sender.mainFrame) {
    throw new Error('Unsupported image source');
  }
  if (typeof dataUrl !== 'string' || dataUrl.length > 32 * 1024 * 1024 || !dataUrl.startsWith('data:image/png;base64,')) {
    throw new Error('Invalid PNG image');
  }
  const image = nativeImage.createFromDataURL(dataUrl);
  if (image.isEmpty()) throw new Error('Empty PNG image');
  return image;
}

function createMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: '文件', submenu: [{ label: '退出', role: 'quit' }] },
    { label: '编辑', submenu: [
      { label: '撤销', role: 'undo' }, { label: '重做', role: 'redo' }, { type: 'separator' },
      { label: '剪切', role: 'cut' }, { label: '复制', role: 'copy' },
      { label: '粘贴', role: 'paste' }, { label: '全选', role: 'selectAll' }
    ] },
    { label: '视图', submenu: [
      { label: '刷新', role: 'reload' }, { type: 'separator' },
      { label: '放大', role: 'zoomIn' }, { label: '缩小', role: 'zoomOut' },
      { label: '实际大小', role: 'resetZoom' }, { type: 'separator' },
      { label: '全屏', role: 'togglefullscreen' }
    ] },
    { label: '帮助', submenu: [{ label: '关于', click: () => dialog.showMessageBox(mainWindow, {
      type: 'info', title: APP_NAME, message: APP_NAME,
      detail: `版本 ${app.getVersion()}\n地毯报价、图片尺寸标记与尺寸价格查询。\n核心功能可离线使用，天气需要联网。`,
      buttons: ['确定']
    }) }] }
  ]));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: APP_NAME,
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#141a22', symbolColor: '#b5c0ce', height: 40 },
    show: false,
    backgroundColor: '#141a22',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isAppUrl(url)) {
      event.preventDefault();
      void openExternal(url);
    }
  });
  mainWindow.webContents.on('will-attach-webview', event => event.preventDefault());
  mainWindow.webContents.on('did-fail-load', (_event, code, description, _url, isMainFrame) => {
    if (isMainFrame && code !== -3) {
      dialog.showErrorBox('启动失败', `页面加载失败：${description}。请重新启动软件。`);
      app.quit();
    }
  });
  void mainWindow.loadURL(APP_URL);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    app.setAppUserModelId('com.carpetstudio.desktop');
    const rendererRoot = path.join(app.getAppPath(), 'frontend', 'dist');
    protocol.handle('app', request => {
      try {
        if (!isAppUrl(request.url)) return new Response('Forbidden', { status: 403 });
        const pathname = decodeURIComponent(new URL(request.url).pathname);
        const filePath = path.resolve(rendererRoot, `.${pathname === '/' ? '/index.html' : pathname}`);
        const relative = path.relative(rendererRoot, filePath);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
          return new Response('Forbidden', { status: 403 });
        }
        return net.fetch(pathToFileURL(filePath).href);
      } catch {
        return new Response('Invalid request', { status: 400 });
      }
    });

    const overrideDirectory = app.commandLine.getSwitchValue('user-data-dir');
    const weatherServiceReady = createWeatherService({ cachePath: path.join(app.getPath('userData'), 'weather-cache.json'), fetchImpl: (url, options) => net.fetch(url, options), locationFetchImpl: globalThis.fetch }).catch(() => null);
    let configPath = overrideDirectory
      ? path.join(overrideDirectory, 'prices.json')
      : process.env.PORTABLE_EXECUTABLE_DIR
        ? path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'prices.json')
        : app.isPackaged
          ? path.join(app.getPath('userData'), 'prices.json')
          : path.join(app.getAppPath(), 'config', 'prices.json');
    let priceStore;
    try {
      priceStore = await createPriceStore({ defaultPath: path.join(app.getAppPath(), 'config', 'prices.json'), configPath });
    } catch (error) {
      if (!['EACCES', 'EPERM', 'EROFS'].includes(error.code)) throw error;
      configPath = path.join(app.getPath('userData'), 'prices.json');
      priceStore = await createPriceStore({ defaultPath: path.join(app.getAppPath(), 'config', 'prices.json'), configPath });
    }
    function checkSender(event) {
      if (!isAppUrl(event.senderFrame?.url) || event.senderFrame !== event.sender.mainFrame) throw new Error('Unsupported request');
    }
    const updateService = createUpdateService({
      currentVersion: app.getVersion(), repository,
      portable: Boolean(process.env.PORTABLE_EXECUTABLE_DIR),
      fetchImpl: (url, options) => net.fetch(url, options),
      openExternal: url => shell.openExternal(url),
      onChange: state => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('updates:changed', state); }
    });
    ipcMain.handle('updates:status', event => { checkSender(event); return updateService.getStatus(); });
    ipcMain.handle('updates:check', (event, force) => {
      checkSender(event);
      if (typeof force !== 'boolean') throw new Error('Invalid update request');
      return updateService.check(force);
    });
    ipcMain.handle('updates:download', event => { checkSender(event); return updateService.openDownload(); });
    ipcMain.handle('updates:release', event => { checkSender(event); return updateService.openRelease(); });
    ipcMain.handle('weather:read', async (event, force) => {
      checkSender(event);
      if (typeof force !== 'boolean') throw new Error('Invalid weather request');
      const weatherService = await weatherServiceReady;
      return weatherService ? weatherService.getWeather(force) : { error: '天气暂不可用', cached: false };
    });
    ipcMain.handle('prices:read', event => { checkSender(event); return priceStore.read(); });
    ipcMain.handle('text:copy', (event, text) => {
      checkSender(event);
      if (typeof text !== 'string' || !text || text.length > 1000000) throw new Error('Invalid clipboard text');
      return clipboard.writeText(text);
    });
    ipcMain.handle('theme:set', (event, theme) => {
      checkSender(event);
      if (!['dark', 'light'].includes(theme)) throw new Error('Unsupported theme');
      const color = theme === 'light' ? '#f5f4f0' : '#141a22';
      mainWindow?.setTitleBarOverlay({ color, symbolColor: theme === 'light' ? '#526075' : '#b5c0ce', height: 40 });
      mainWindow?.setBackgroundColor(color);
    });
    ipcMain.handle('prices:save', (event, value) => { checkSender(event); return priceStore.save(value); });
    ipcMain.handle('prices:open', event => {
      checkSender(event);
      const editor = spawn(path.join(process.env.WINDIR || 'C:\\Windows', 'System32', 'notepad.exe'), [priceStore.path], { detached: true, stdio: 'ignore', windowsHide: false });
      editor.on('error', () => shell.showItemInFolder(priceStore.path));
      editor.unref();
      return priceStore.path;
    });

    ipcMain.handle('image:copy', (event, dataUrl) => {
      const image = readImage(event, dataUrl);
      return clipboard.write([new ClipboardItem({
        'image/png': new Blob([image.toPNG()], { type: 'image/png' })
      })]);
    });
    ipcMain.handle('image:save', async (event, dataUrl) => {
      const image = readImage(event, dataUrl);
      const result = await dialog.showSaveDialog(mainWindow, {
        title: '保存尺寸标记图片',
        defaultPath: path.join(app.getPath('pictures'), '地毯尺寸标记.png'),
        filters: [{ name: 'PNG 图片', extensions: ['png'] }]
      });
      if (result.canceled || !result.filePath) return false;
      await fs.writeFile(result.filePath, image.toPNG());
      return true;
    });

    const { session } = require('electron');
    session.defaultSession.setPermissionRequestHandler((_contents, permission, callback, details) => {
      callback(isAppUrl(details.requestingUrl) && permission === 'clipboard-sanitized-write');
    });
    session.defaultSession.setPermissionCheckHandler((_contents, permission, origin) => {
      return isAppUrl(origin) && permission === 'clipboard-sanitized-write';
    });
    createMenu();
    Menu.setApplicationMenu(null);
    createWindow();
  }).catch(error => {
    dialog.showErrorBox('启动失败', error.message);
    app.quit();
  });
  app.on('window-all-closed', () => app.quit());
}
