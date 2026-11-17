const fs = require('node:fs/promises');
const { createReadStream, createWriteStream } = require('node:fs');
const { createHash } = require('node:crypto');
const { Readable, Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const path = require('node:path');

const MAX_PACKAGE_SIZE = 600 * 1024 * 1024;
async function sha256(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

function createUpdateFiles({ directory, fetchImpl = globalThis.fetch }) {
  async function download(asset, onProgress) {
    await fs.mkdir(directory, { recursive: true });
    let digest = asset.digest?.match(/^sha256:([a-f0-9]{64})$/i)?.[1].toLowerCase();
    if (!digest && asset.checksumUrl) {
      const response = await fetchImpl(asset.checksumUrl, { signal: AbortSignal.timeout(30000), cache: 'no-store' });
      if (!response.ok) throw new Error('无法获取更新校验信息，请稍后重试。');
      const length = Number(response.headers.get('content-length'));
      if (length > 65536) throw new Error('更新校验信息无效。');
      const body = await response.text();
      if (body.length > 65536) throw new Error('更新校验信息无效。');
      digest = body.replace(/^\uFEFF/, '').split(/\r?\n/).map(line => /^([a-f0-9]{64})\s+\*?(.+)$/.exec(line.trim()))
        .find(match => match && match[2] === asset.name)?.[1].toLowerCase();
    }
    if (!digest) throw new Error('新版缺少有效的校验信息，请前往发布页下载。');
    const file = path.join(directory, `${asset.version}-${asset.portable ? 'portable' : 'setup'}.exe`);
    try {
      const stat = await fs.stat(file);
      if ((!asset.size || stat.size === asset.size) && await sha256(file) === digest) {
        onProgress({ transferred: stat.size, total: stat.size, percent: 100 });
        return { file, digest };
      }
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const partial = `${file}.partial`;
    try {
      const response = await fetchImpl(asset.url, { signal: AbortSignal.timeout(20 * 60 * 1000), cache: 'no-store' });
      if (!response.ok || !response.body) throw new Error('更新下载失败，请检查网络后重试。');
      const total = asset.size || Number(response.headers.get('content-length')) || 0;
      if (total > MAX_PACKAGE_SIZE) throw new Error('更新文件大小异常。');
      let transferred = 0, notified = 0;
      const hash = createHash('sha256');
      const progress = new Transform({ transform(chunk, _encoding, callback) {
        transferred += chunk.length;
        if (transferred > MAX_PACKAGE_SIZE || total && transferred > total) return callback(new Error('更新文件大小异常。'));
        hash.update(chunk);
        if (Date.now() - notified > 200) {
          notified = Date.now();
          onProgress({ transferred, total, percent: total ? Math.min(99, transferred / total * 100) : 0 });
        }
        callback(null, chunk);
      } });
      await pipeline(Readable.fromWeb(response.body), progress, createWriteStream(partial, { flags: 'w' }));
      if (total && transferred !== total || hash.digest('hex') !== digest) throw new Error('更新文件校验失败，请重新下载。');
      await fs.rename(partial, file);
      onProgress({ transferred, total: transferred, percent: 100 });
      return { file, digest };
    } finally { await fs.rm(partial, { force: true }); }
  }
  return { download, verify: async artifact => await sha256(artifact.file) === artifact.digest };
}

module.exports = { createUpdateFiles };
