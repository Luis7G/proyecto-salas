// server.js - Punto de entrada principal del backend

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const SalaController = require('./controllers/SalaController');

// --- CONFIGURACIÓN INICIAL ---
const app = express();
const server = http.createServer(app); // Servidor HTTP para Express
const io = new Server(server, { // Socket.IO necesita el servidor HTTP
  cors: {
    origin: "*", // Permite conexiones desde cualquier origen (para pruebas)
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Permite al servidor entender JSON en las peticiones

// --- INSTANCIA DEL CONTROLADOR ---
// Le pasamos la instancia 'io' al controlador para que pueda emitir eventos
const salaController = new SalaController(io);

// --- RUTAS DE LA API ---
// Cuando llegue una petición POST a esta ruta, se ejecutará el método correspondiente
app.post('/api/registro', salaController.handleRegistro);
app.post('/api/alerta-presencia', salaController.handleAlertaPresencia);

// --- LÓGICA DE SOCKET.IO ---
io.on('connection', (socket) => {
  console.log(`Un cliente web se ha conectado: ${socket.id}`);
  
  // Cuando un cliente se conecta, le enviamos el estado actual de las salas
  socket.emit('update-salas', salaController.salas);

  socket.on('disconnect', () => {
    console.log(`El cliente web se ha desconectado: ${socket.id}`);
  });
});

// --- INICIAR EL SERVIDOR ---
server.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});