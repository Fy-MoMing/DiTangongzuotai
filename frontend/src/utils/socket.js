import { io } from 'socket.io-client';

// 自动识别后端服务地址
// 若当前页面通过后端(3001端口)托管，则通过相对路径连接
// 若为开发环境(如5173端口)，则连接同域名的3001端口
const socketUrl = window.location.port === '3001' 
  ? window.location.origin 
  : `${window.location.protocol}//${window.location.hostname}:3001`;

const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  autoConnect: true
});

export default socket;