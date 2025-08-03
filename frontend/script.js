// script.js

const socket = io('http://localhost:3000');
const salasContainer = document.getElementById('salas-container');
const alertBox = document.getElementById('alert-box');

// 1. Creamos una variable fuera de las funciones para guardar el estado.
let estadoActualSalas = {};

// Escucha el evento 'update-salas' que envía el servidor
socket.on('update-salas', (salas) => {
    console.log('Estado de salas recibido:', salas);
    
    // 2. Actualizamos nuestra variable "recordatorio" con los datos frescos.
    estadoActualSalas = salas;

    salasContainer.innerHTML = ''; // Limpia el contenedor

    // Itera sobre cada sala recibida y crea su tarjeta HTML
    for (const salaId in salas) {
        const sala = salas[salaId];
        const salaDiv = document.createElement('div');
        salaDiv.classList.add('sala');
        salaDiv.classList.add(sala.ocupada ? 'ocupada' : 'libre');
        
        let content = `<h2>${salaId}</h2>`;
        if (sala.ocupada) {
            content += `<p><strong>Estado:</strong> Ocupada</p>`;
            content += `<p><strong>Usuario:</strong> ${sala.usuario.name}</p>`;
            // El span ahora tiene un ID único que usaremos para actualizar el timer
            content += `<p><strong>Tiempo:</strong> <span id="timer-${salaId}">0m 0s</span></p>`;
        } else {
            content += `<p><strong>Estado:</strong> Libre</p>`;
        }
        salaDiv.innerHTML = content;
        salasContainer.appendChild(salaDiv);
    }
});

// Escucha el evento de alerta de movimiento
socket.on('alerta-movimiento', (data) => {
    alertBox.textContent = data.msg;
    alertBox.style.display = 'block';
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
});

// 3. Esta función ahora puede "ver" el estado guardado en 'estadoActualSalas'.
setInterval(() => {
    // Itera sobre las salas que tenemos guardadas en nuestro estado
    for (const salaId in estadoActualSalas) {
        const sala = estadoActualSalas[salaId];
        // Busca el elemento del timer en el HTML
        const timerSpan = document.getElementById(`timer-${salaId}`);
        
        // Si la sala está ocupada y tiene un timer en el HTML
        if (sala.ocupada && timerSpan) {
            // Calcula la diferencia entre el ahora y la hora de inicio
            const duracionMs = Date.now() - sala.tiempoInicio;

            // Convierte milisegundos a minutos y segundos
            const minutos = Math.floor(duracionMs / 60000);
            const segundos = Math.floor((duracionMs % 60000) / 1000);

            // Actualiza el texto del timer
            timerSpan.textContent = `${minutos}m ${segundos}s`;
        }
    }
}, 1000); // Se ejecuta cada segundo