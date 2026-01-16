require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const os = require('os');
const config = require('../src/config'); // ajusta si tu ruta es distinta

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 👉 Sirve tus archivos estáticos desde /views (como ya lo tenías)
app.use(express.static(path.join(__dirname, 'views')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));

// ── Dispositivos conectados (para el contador/lista si lo quieres usar)
const devices = new Map();

// Utilidad: permite payload string "titulo='X' descripcion='Y'" o JSON {titulo, descripcion} / {title, body}
function normalizeFromAny(payload) {
  if (!payload) return { title: '', body: '', titulo: '', descripcion: '' };
  if (typeof payload === 'string') {
    const t = payload.match(/titulo='([^']+)'/);
    const d = payload.match(/descripcion='([^']+)'/);
    const titulo = t ? t[1] : payload;
    const descripcion = d ? d[1] : '';
    return { title: titulo, body: descripcion, titulo, descripcion };
  }
  const title = payload.title ?? payload.titulo ?? '';
  const body = payload.body ?? payload.descripcion ?? '';
  return { title, body, titulo: title, descripcion: body };
}

io.on('connection', (socket) => {
  const ua = socket.handshake.headers['user-agent'] || '';
  const ip = (socket.handshake.headers['x-forwarded-for']?.split(',')[0]?.trim()) || socket.handshake.address;

  devices.set(socket.id, { id: socket.id, ip, ua, connectedAt: new Date().toISOString() });
  io.emit('device:list', Array.from(devices.values()));

  console.log('Clientes conectados:', io.engine.clientsCount, ' id', socket.id);

  socket.on('pulsar', (msg) => console.log(' Mensaje pulsar ==> ', JSON.stringify(msg)));
  socket.on('event_name', (data) => console.log(' Mensaje entrante ==> ', JSON.stringify(data)));

  // ✅ Botón "Enviar a Android" desde tu HTML
  socket.on('android', (data) => {
    const msg = normalizeFromAny(data);
    const androidMsg = { titulo: msg.titulo, descripcion: msg.descripcion };
    io.emit('noti', androidMsg); // tus clientes Android escuchan "noti"
    // reflejo en web (por si tienes panel)
    io.emit('notify:message', { title: msg.title || 'Android', body: msg.body || '', from: socket.id, at: new Date().toISOString() });
    console.log('android =>', androidMsg);
  });

  // (Opcional) soporte para el panel nuevo que emite notify:all
  socket.on('notify:all', (payload) => {
    const msg = normalizeFromAny(payload);
    const webMsg = { title: msg.title || 'Notificación', body: msg.body || '' };
    const androidMsg = { titulo: msg.titulo || webMsg.title, descripcion: msg.descripcion || webMsg.body };
    io.emit('notify:message', { ...webMsg, from: socket.id, at: new Date().toISOString() });
    io.emit('noti', androidMsg);
    console.log('notify:all =>', webMsg);
  });

  socket.on('reenviar', async (nroDocumentoNit) => {
    console.log(' Mensaje reenviar  => ', nroDocumentoNit);
  });

  socket.on('disconnect', () => {
    devices.delete(socket.id);
    io.emit('device:list', Array.from(devices.values()));
    console.log('Cliente desconectado.', socket.id);
  });

  socket.on('error', (err) => console.log('Error de conexión ', err?.message || err));
});

console.log(' NetworkInterfaces ==> ', JSON.stringify(os.networkInterfaces()));

const PORT = process.env.PORT || config.PORT || 3000;
server.listen(PORT, () => {
  console.log('Servidor a la espera de conexion en http://localhost:' + PORT);
});
