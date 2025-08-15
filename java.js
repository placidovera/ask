const adivinanzaElem = document.getElementById("adivinanza");
const input = document.getElementById("input");
const boton = document.getElementById("boton");
const mensaje = document.getElementById("mensaje");
const jugarBtn = document.getElementById("jugar");
const aprenderBtn = document.getElementById("aprender");
const puntosElem = document.getElementById("puntos");

let preguntas = [];
let indice = 0;
let modo = "";
let puntos = 0; // contador de puntos

// Botón “Anterior”
const botonAnterior = document.createElement("button");
botonAnterior.textContent = "Anterior";
botonAnterior.className = "btn btn-secondary btn-lg me-2";
botonAnterior.style.display = "none";
boton.parentNode.insertBefore(botonAnterior, boton);

// Botón “Mostrar Respuesta” dinámico (abajo)
const botonMostrar = document.createElement("button");
botonMostrar.textContent = "Mostrar Respuesta";
botonMostrar.className = "btn btn-lg mt-3";
botonMostrar.style.backgroundColor = "#6f42c1"; // color morado
botonMostrar.style.color = "white";
botonMostrar.style.display = "none";
document.getElementById("contenedor").appendChild(botonMostrar); // agregar al final del contenedor

// Deshabilitar botones hasta cargar JSON
jugarBtn.disabled = true;
aprenderBtn.disabled = true;

function hablar(texto) {
  const mensajeVoz = new SpeechSynthesisUtterance(texto);
  mensajeVoz.lang = "en-US"; // Cambiado a inglés
  mensajeVoz.rate = 0.9;     // Velocidad más natural (opcional)
  mensajeVoz.pitch = 1.0;    // Tono de voz (opcional)
  window.speechSynthesis.speak(mensajeVoz);
}


// Cargar JSON
fetch('preguntas_limpias.json')
  .then(response => response.json())
  .then(data => {
    preguntas = data;
    jugarBtn.disabled = false;
    aprenderBtn.disabled = false;
  })
  .catch(err => console.error("Error cargando JSON:", err));

// Elegir modo
jugarBtn.addEventListener("click", () => {
  modo = "jugar";
  indice = 0;
  puntos = 0; 
  actualizarPuntos();
  botonAnterior.style.display = "none";
  input.style.display = "block";
  input.value = "";
  mostrarPregunta();
});

aprenderBtn.addEventListener("click", () => {
  modo = "aprender";
  indice = 0;
  botonAnterior.style.display = "inline-block";
  input.style.display = "none";
  mostrarPregunta();
});

// Mostrar pregunta
function mostrarPregunta() {
  if (!preguntas.length) return;

  if (indice >= preguntas.length) {
    const textoFinal = `¡Genial! Has terminado todas las palabras 🏆 Puntos: ${puntos}`;
    adivinanzaElem.textContent = textoFinal;
    mensaje.textContent = "";
    input.style.display = "none";
    boton.style.display = "none";
    botonAnterior.style.display = modo === "aprender" ? "inline-block" : "none";
    botonMostrar.style.display = "none";
    hablar(textoFinal);
    return;
  }

  const preguntaTexto = preguntas[indice].pregunta;
  const respuestaCorrecta = preguntas[indice].respuesta;

  adivinanzaElem.textContent = preguntaTexto;

  if (modo === "aprender") {
    mensaje.textContent = respuestaCorrecta;
    boton.style.display = "inline-block";
    boton.textContent = "Next";
    botonAnterior.style.display = indice > 0 ? "inline-block" : "none";
    botonMostrar.style.display = "none";

    setTimeout(() => hablar(respuestaCorrecta), 1000);

  } else { // modo jugar
    mensaje.textContent = "";
    input.style.display = "block";
    input.value = "";
    input.focus();
    boton.style.display = "inline-block";
    boton.textContent = "Responder";
    botonAnterior.style.display = "none";
    botonMostrar.style.display = "inline-block"; 
  }
}

// Función para actualizar puntos en pantalla
function actualizarPuntos() {
  puntosElem.textContent = `Puntos: ${puntos}`;
}

// Botón principal
boton.addEventListener("click", () => {
  if (!preguntas.length) return;

  if (modo === "aprender") {
    indice++;
    mostrarPregunta();
  } else if (modo === "jugar") {
    const respuestaUsuario = input.value.trim().toLowerCase();
    const respuestaCorrecta = preguntas[indice].respuesta.trim().toLowerCase();

    if (respuestaUsuario === respuestaCorrecta) {
      puntos++; 
      actualizarPuntos();
      mensaje.textContent = `¡Correcto! 🏆 La respuesta es "${preguntas[indice].respuesta}"`;
      hablar(preguntas[indice].respuesta);
      indice++;
      setTimeout(mostrarPregunta, 1500);
    } else {
      mensaje.textContent = "No es correcto. Intenta de nuevo.";
      input.value = "";
      input.focus();
    }
  }
});

// Botón "Anterior"
botonAnterior.addEventListener("click", () => {
  if (modo === "aprender" && indice > 0) {
    indice--;
    mostrarPregunta();
  }
});

// Botón "Mostrar Respuesta"
botonMostrar.addEventListener("click", () => {
  if (modo === "jugar") {
    const respuestaCorrecta = preguntas[indice].respuesta;
    mensaje.textContent = `La respuesta es: "${respuestaCorrecta}"`;
    hablar(respuestaCorrecta);
  }
});
