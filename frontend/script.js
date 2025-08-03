// script.js - Lógica del frontend

// Conecta con el backend. Asegúrate de que la URL y el puerto coincidan.
const socket = io("http://localhost:3000");
const salasContainer = document.getElementById("salas-container");
const alertBox = document.getElementById("alert-box");

// Escucha el evento 'update-salas' que envía el servidor
socket.on("update-salas", (salas) => {
  console.log("Estado de salas recibido:", salas);
  salasContainer.innerHTML = ""; // Limpia el contenedor

  // Itera sobre cada sala recibida y crea su tarjeta HTML
  for (const salaId in salas) {
    const sala = salas[salaId];
    const salaDiv = document.createElement("div");
    salaDiv.classList.add("sala");
    salaDiv.classList.add(sala.ocupada ? "ocupada" : "libre");

    let content = `<h2>${salaId}</h2>`;
    if (sala.ocupada) {
      content += `<p><strong>Estado:</strong> Ocupada</p>`;
      content += `<p><strong>Usuario:</strong> ${sala.usuario.name}</p>`;
      content += `<p><strong>Tiempo:</strong> <span id="timer-${salaId}">Calculando...</span></p>`;
    } else {
      content += `<p><strong>Estado:</strong> Libre</p>`;
    }
    salaDiv.innerHTML = content;
    salasContainer.appendChild(salaDiv);
  }
});

// Escucha el evento de alerta de movimiento
socket.on("alerta-movimiento", (data) => {
  alertBox.textContent = data.msg;
  alertBox.style.display = "block";
  // Oculta la alerta después de 5 segundos
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 5000);
});

// Función para actualizar los timers cada segundo
setInterval(() => {
  // Busca todos los spans de timers que existen en el documento
  document.querySelectorAll('[id^="timer-"]').forEach((timerSpan) => {
    const salaId = timerSpan.id.split("-")[1];

    // El estado de las salas no está aquí, pero podemos obtener el tiempo de inicio
    // del evento 'update-salas' si lo guardamos.
    // Por simplicidad, este ejemplo no guarda el estado globalmente en el frontend,
    // pero en una app más compleja, lo harías.
    // La lógica de cálculo de duración iría aquí.
    timerSpan.textContent = "xx min xx seg";
  });
}, 1000);
