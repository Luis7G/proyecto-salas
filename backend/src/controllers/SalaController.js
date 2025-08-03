// SalaController.js - Maneja la lógica de las salas de estudio

class SalaController {
  constructor(io) {
    // io es la instancia de Socket.IO, la necesitamos para emitir eventos
    this.io = io;

    // --- BASE DE DATOS SIMULADA ---
    // En un proyecto real, esto vendría de una base de datos.
    // Para el proyecto, este objeto es suficiente.
    this.users = {
      "A1B2C3D4": { name: "Ana Torres", initials: "AT" },
      "5E6F7G8H": { name: "Carlos Vera", initials: "CV" },
      // Agrega aquí los UIDs de tus tarjetas reales cuando las tengas
    };

    // Estado inicial de las salas. Esto es lo que se actualizará.
    this.salas = {
      "SALA-01": { ocupada: false, usuario: null, tiempoInicio: null },
    };

    // Es importante "atar" el 'this' a los métodos para que no pierdan el contexto
    this.handleRegistro = this.handleRegistro.bind(this);
    this.handleAlertaPresencia = this.handleAlertaPresencia.bind(this);
  }

  // Método que se ejecuta cuando el Wemos envía un registro RFID
  handleRegistro(req, res) {
    const { rfidTag, salaId } = req.body;

    // Validar que los datos llegaron
    if (!rfidTag || !salaId) {
      return res.status(400).json({ error: "Faltan datos (rfidTag o salaId)" });
    }

    const sala = this.salas[salaId];
    const user = this.users[rfidTag];

    // Si el tag no es de un usuario conocido
    if (!user) {
      return res.status(404).json({ error: "Usuario no reconocido" });
    }

    let responseToWemos = {};

    // Lógica de Check-in y Check-out
    if (sala.ocupada && sala.usuario.name === user.name) {
      // CHECK-OUT: La sala está ocupada por la misma persona
      console.log(`CHECK-OUT: ${user.name} ha salido de la ${salaId}`);
      sala.ocupada = false;
      sala.usuario = null;
      sala.tiempoInicio = null;
      responseToWemos = { status: "CHECK_OUT_SUCCESS", userName: user.name };
    } else if (!sala.ocupada) {
      // CHECK-IN: La sala está libre
      console.log(`CHECK-IN: ${user.name} ha entrado a la ${salaId}`);
      sala.ocupada = true;
      sala.usuario = user;
      sala.tiempoInicio = Date.now(); // Guarda el timestamp actual en milisegundos
      responseToWemos = { status: "CHECK_IN_SUCCESS", userName: user.name, initials: user.initials };
    } else {
      // La sala está ocupada por otra persona
      console.log(`ACCESO DENEGADO: ${salaId} ya está ocupada.`);
      return res.status(409).json({ error: `La sala ya está ocupada por ${sala.usuario.name}` });
    }

    // --- EMISIÓN DE EVENTO WEBSOCKET ---
    // Envía el estado actualizado de TODAS las salas a TODOS los clientes web
    this.io.emit('update-salas', this.salas);
    console.log('Estado de salas actualizado y enviado al frontend.');

    // Envía una respuesta al Wemos con las iniciales (si es un check-in)
    res.status(200).json(responseToWemos);
  }

  // Método para la interrupción del sensor de presencia
  handleAlertaPresencia(req, res) {
    const { salaId } = req.body;
    console.log(`ALERTA: Movimiento detectado en ${salaId}`);

    // Emite un evento de alerta al frontend
    this.io.emit('alerta-movimiento', { salaId, msg: `¡Movimiento detectado en la sala ${salaId}!` });

    // Responde al Wemos
    res.status(200).json({ status: "ALERTA_RECIBIDA" });
  }
}

// Exportamos la clase para poder usarla en server.js
module.exports = SalaController;