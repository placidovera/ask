const adivinanzaElem = document.getElementById("adivinanza");
const input = document.getElementById("input");
const mensaje = document.getElementById("mensaje");
const jugarBtn = document.getElementById("jugar");
const aprenderBtn = document.getElementById("aprender");
const puntosElem = document.getElementById("puntos");
const tituloElem = document.querySelector("h1.text-center"); // h1 principal

let preguntas = [];
let indice = 0;
let modo = "";
let puntos = 0;

// Ocultar input al iniciar la página
input.style.display = "none";

// temporizadores globales
let timeoutAvance;
let timeoutLectura;

// Botón “Anterior”
const botonAnterior = document.createElement("button");
botonAnterior.textContent = "Anterior";
botonAnterior.className = "btn btn-secondary btn-lg me-2";
botonAnterior.style.display = "none";
document.getElementById("contenedor").appendChild(botonAnterior);

// Botón “Mostrar Respuesta”
const botonMostrar = document.createElement("button");
botonMostrar.textContent = "Mostrar Respuesta";
botonMostrar.className = "btn btn-lg mt-3";
botonMostrar.style.backgroundColor = "#6f42c1";
botonMostrar.style.color = "white";
botonMostrar.style.display = "none";
document.getElementById("contenedor").appendChild(botonMostrar);

// Botón “Salir”
const botonSalir = document.createElement("button");
botonSalir.textContent = "Salir";
botonSalir.className = "btn btn-danger btn-lg mt-3 ms-2";
botonSalir.style.display = "none";
document.getElementById("contenedor").appendChild(botonSalir);
botonSalir.addEventListener("click", () => {
  modo = "";
  indice = 0;
  puntos = 0;
  actualizarPuntos();
  input.style.display = "none";
  botonAnterior.style.display = "none";
  botonMostrar.style.display = "none";
  botonSalir.style.display = "none";
  botonResponder.style.display = "none";
  traductorInput.style.display = "block";
  traductorBtn.style.display = "inline-block";
  cambiarDireccionBtn.style.display = "inline-block";
  adivinanzaElem.textContent = "";
  mensaje.textContent = "";
  // Restaurar título original
  tituloElem.textContent = "“How much English do you know?” ✅";
  jugarBtn.style.display = "inline-block";
  aprenderBtn.style.display = "inline-block";
});

// Input de búsqueda tipo traductor
const traductorInput = document.createElement("input");
traductorInput.type = "text";
traductorInput.placeholder = "Escribe la palabra en inglés";
traductorInput.className = "form-control mb-3";
traductorInput.style.display = "block";
document.getElementById("contenedor").prepend(traductorInput);

const traductorBtn = document.createElement("button");
traductorBtn.textContent = "Traducir";
traductorBtn.className = "btn btn-primary mb-3";
traductorBtn.style.display = "inline-block";
document.getElementById("contenedor").prepend(traductorBtn);

// Botón para cambiar dirección de traducción
let inglesAEspanol = true; // true: inglés→español, false: español→inglés
const cambiarDireccionBtn = document.createElement("button");
cambiarDireccionBtn.textContent = "Cambiar a Español → Inglés";
cambiarDireccionBtn.className = "btn btn-warning mb-3 ms-2";
document.getElementById("contenedor").prepend(cambiarDireccionBtn);

cambiarDireccionBtn.addEventListener("click", () => {
  inglesAEspanol = !inglesAEspanol;
  if (inglesAEspanol) {
    cambiarDireccionBtn.textContent ="Cambiar a Español → Inglés";
    traductorInput.placeholder = "Escribe la palabra en inglés";
  } else {
    cambiarDireccionBtn.textContent ="Cambiar a Inglés → Español";
    traductorInput.placeholder = "Escribe la palabra en español";
  }
});

// Deshabilitar botones hasta cargar JSON
jugarBtn.disabled = true;
aprenderBtn.disabled = true;
traductorBtn.disabled = true;

// Función para hablar
function hablar(texto, idioma = "auto") {
  window.speechSynthesis.cancel();
  const mensajeVoz = new SpeechSynthesisUtterance(texto);
  if (idioma === "auto") {
    if (/[áéíóúñ]/i.test(texto)) mensajeVoz.lang = "es-ES";
    else mensajeVoz.lang = "en-US";
  } else {
    mensajeVoz.lang = idioma;
  }
  mensajeVoz.rate = 1.0;
  mensajeVoz.pitch = 1.0;
  window.speechSynthesis.speak(mensajeVoz);
}

// Cargar JSON
fetch("preguntas_limpias.json")
  .then(res => res.json())
  .then(data => {
    preguntas = data;
    jugarBtn.disabled = false;
    aprenderBtn.disabled = false;
    traductorBtn.disabled = false;
  })
  .catch(err => console.error("Error cargando JSON:", err));

// Función de búsqueda
traductorBtn.addEventListener("click", () => {
  if (!preguntas.length) {
    mensaje.textContent = "El traductor aún no está listo, espera...";
    return;
  }

  const texto = traductorInput.value.trim().toLowerCase();
  if (!texto) return;

  let resultado = null;

  if (inglesAEspanol) {
    resultado = preguntas.find(p => p.respuesta.toLowerCase() === texto);
    if (resultado) {
      mensaje.textContent = `Traducción: "${resultado.pregunta}"`;
      hablar(resultado.pregunta, "es-ES");
    }
  } else {
    resultado = preguntas.find(p => p.pregunta.toLowerCase() === texto);
    if (resultado) {
      mensaje.textContent = `Traducción: "${resultado.respuesta}"`;
      hablar(resultado.respuesta, "en-US");
    }
  }

  if (!resultado) mensaje.textContent = "Palabra no encontrada.";
});

// Crear botón "Responder" dinámicamente si no existe
let botonResponder = document.getElementById("boton");
if (!botonResponder) {
  botonResponder = document.createElement("button");
  botonResponder.id = "boton";
  botonResponder.className = "btn btn-info btn-lg mt-3";
  botonResponder.textContent = "Responder";
  botonResponder.style.display = "none"; // inicialmente oculto
  document.getElementById("contenedor").appendChild(botonResponder);

  botonResponder.addEventListener("click", () => {
    const respuestaUsuario = input.value.trim().toLowerCase();
    const respuestaCorrecta = preguntas[indice].respuesta.trim().toLowerCase();

    if (respuestaUsuario === respuestaCorrecta) {
      puntos++;
      actualizarPuntos();
      mensaje.textContent = `¡Correcto! 🏆 La respuesta es "${preguntas[indice].respuesta}"`;
      hablar(preguntas[indice].respuesta, "es-ES");
      indice++;
      input.value = "";
      setTimeout(mostrarPregunta, 1500);
    } else {
      mensaje.textContent = "No es correcto. Intenta de nuevo.";
      input.value = "";
      input.focus();
    }
  });
}

// Modo jugar
jugarBtn.addEventListener("click", () => {
  modo = "jugar";
  indice = 0;
  puntos = 0;
  actualizarPuntos();
  botonAnterior.style.display = "none";
  botonMostrar.style.display = "inline-block";
  botonSalir.style.display = "inline-block";
  input.style.display = "block";
  input.value = "";
  mostrarPregunta();
  traductorInput.style.display = "none";
  traductorBtn.style.display = "none";
  cambiarDireccionBtn.style.display = "none";
  jugarBtn.style.display = "none";
  aprenderBtn.style.display = "none";
  tituloElem.textContent = "Como se dice...";

  // Mostrar el botón responder
  botonResponder.style.display = "inline-block";
});

// Modo aprender
aprenderBtn.addEventListener("click", () => {
  modo = "aprender";
  indice = 0;
  botonAnterior.style.display = "inline-block";
  botonMostrar.style.display = "none";
  botonSalir.style.display = "inline-block";
  input.style.display = "none";
  botonResponder.style.display = "none"; // oculto en aprender
  mostrarPregunta();
  traductorInput.style.display = "none";
  traductorBtn.style.display = "none";
  cambiarDireccionBtn.style.display = "none";
  jugarBtn.style.display = "none";
  aprenderBtn.style.display = "none";
  tituloElem.textContent = "Como se dice...";
});

// Mostrar pregunta
function mostrarPregunta() {
  if (!preguntas.length) return;

  window.speechSynthesis.cancel();
  clearTimeout(timeoutAvance);
  clearTimeout(timeoutLectura);

  if (indice >= preguntas.length) {
    const textoFinal = `¡Genial! Has terminado todas las palabras 🏆 Puntos: ${puntos}`;
    adivinanzaElem.textContent = textoFinal;
    mensaje.textContent = "";
    input.style.display = "none";
    botonAnterior.style.display = "none";
    botonMostrar.style.display = "none";
    botonResponder.style.display = "none";
    hablar(textoFinal, "es-ES");
    return;
  }

  const preguntaTexto = preguntas[indice].pregunta;
  const respuestaCorrecta = preguntas[indice].respuesta;
  adivinanzaElem.textContent = preguntaTexto;

  if (modo === "aprender") {
    mensaje.textContent = respuestaCorrecta;
    botonAnterior.style.display = indice > 0 ? "inline-block" : "none";
    botonMostrar.style.display = "none";
    input.style.display = "none";

    timeoutLectura = setTimeout(() => {
      hablar(respuestaCorrecta, "es-ES");
      timeoutAvance = setTimeout(() => {
        indice++;
        mostrarPregunta();
      }, 4000);
    }, 1000);
  } else if (modo === "jugar") {
    mensaje.textContent = "";
    input.style.display = "block";
    input.value = "";
    input.focus();
    botonAnterior.style.display = "none";
    botonMostrar.style.display = "inline-block";
    botonResponder.style.display = "inline-block"; // asegurar que el botón se vea
  }
}

// Actualizar puntos
function actualizarPuntos() {
  puntosElem.textContent = `Puntos: ${puntos}`;
}

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
    hablar(respuestaCorrecta, "es-ES");
  }
});

// Detectar respuesta de usuario en input
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && modo === "jugar") {
    const respuestaUsuario = input.value.trim().toLowerCase();
    const respuestaCorrecta = preguntas[indice].respuesta.trim().toLowerCase();

    if (respuestaUsuario === respuestaCorrecta) {
      puntos++;
      actualizarPuntos();
      mensaje.textContent = `¡Correcto! 🏆 La respuesta es "${preguntas[indice].respuesta}"`;
      hablar(preguntas[indice].respuesta, "es-ES");
      indice++;
      input.value = "";
      setTimeout(mostrarPregunta, 1500);
    } else {
      mensaje.textContent = "No es correcto. Intenta de nuevo.";
      input.value = "";
      input.focus();
    }
  }
});
