const adivinanzaElem = document.getElementById("adivinanza");
const input = document.getElementById("input");
const mensaje = document.getElementById("mensaje");
const jugarBtn = document.getElementById("jugar");
const aprenderBtn = document.getElementById("aprender");
const puntosElem = document.getElementById("puntos");
const tituloElem = document.querySelector("h1.text-center"); 

let preguntas = [];
let indice = 0;
let modo = "";
let puntos = 0;

// Ocultar input al iniciar la página
input.style.display = "none";

// Logo
const logo = document.createElement("img");
logo.src="./WhatsApp Image 2025-08-15 at 21.36.40_0aa1d1a8.jpg";
logo.style.position = "absolute";
logo.style.top = "10px";
logo.style.right = "10px";
logo.style.width = "50px";
logo.style.height = "auto";
document.getElementById("contenedor").appendChild(logo);

// Temporizadores
let timeoutAvance;
let timeoutLectura;

// Botones dinámicos
const botonAnterior = document.createElement("button");
botonAnterior.textContent = "Anterior";
botonAnterior.className = "btn btn-secondary btn-lg me-2";
botonAnterior.style.display = "none";
document.getElementById("contenedor").appendChild(botonAnterior);

const botonMostrar = document.createElement("button");
botonMostrar.textContent = "Mostrar Respuesta";
botonMostrar.className = "btn btn-lg mt-3";
botonMostrar.style.backgroundColor = "#6f42c1";
botonMostrar.style.color = "white";
botonMostrar.style.display = "none";
document.getElementById("contenedor").appendChild(botonMostrar);

const botonSalir = document.createElement("button");
botonSalir.textContent = "Salir";
botonSalir.className = "btn btn-danger btn-lg mt-3 ms-2";
botonSalir.style.display = "none";
document.getElementById("contenedor").appendChild(botonSalir);

// Input traductor
const traductorInput = document.createElement("input");
traductorInput.type = "text";
traductorInput.placeholder = "Escribe la palabra en inglés";
traductorInput.className = "form-control mb-3";
traductorInput.style.display = "block";
document.getElementById("contenedor").prepend(traductorInput);

const traductorBtn = document.createElement("button");
traductorBtn.textContent = "Traducir";
traductorBtn.className = "btn btn-danger mb-3";
traductorBtn.style.display = "inline-block";
document.getElementById("contenedor").prepend(traductorBtn);

// Botón cambiar dirección
let inglesAEspanol = true;
const cambiarDireccionBtn = document.createElement("button");
cambiarDireccionBtn.textContent = "Cambiar a Español → Inglés";
cambiarDireccionBtn.className = "btn btn-light mb-3 ms-2";
traductorBtn.insertAdjacentElement('afterend', cambiarDireccionBtn);

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

// Función hablar siempre en inglés por defecto
function hablar(texto, idioma = "en-US") {
  window.speechSynthesis.cancel();
  const mensajeVoz = new SpeechSynthesisUtterance(texto);
  mensajeVoz.lang = idioma;
  mensajeVoz.rate = 1.0;
  mensajeVoz.pitch = 1.0;
  window.speechSynthesis.speak(mensajeVoz);
}

// Mezclar array
function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Carga JSON
fetch("preguntas_limpias.json")
  .then(res => res.json())
  .then(data => {
    preguntas = mezclarArray(data); 
    jugarBtn.disabled = false;
    aprenderBtn.disabled = false;
    traductorBtn.disabled = false;
  })
  .catch(err => console.error("Error cargando JSON:", err));

// --- BUSCADOR USA API ---
async function traducirConAPI(texto, source = "en", target = "es") {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(texto)}`);
    const data = await res.json();
    return data[0][0][0];
  } catch (err) {
    console.error("Error traduciendo:", err);
    return null;
  }
}

async function crearPregunta(palabra, source = "es", target = "en") {
  const traduccion = await traducirConAPI(palabra, source, target);
  if (!traduccion) return null;
  return { pregunta: palabra, respuesta: traduccion };
}

// Traductor / buscador
traductorBtn.addEventListener("click", async () => {
  const texto = traductorInput.value.trim();
  if (!texto) return;

  let source = inglesAEspanol ? "en" : "es";
  let target = inglesAEspanol ? "es" : "en";

  const resultado = await crearPregunta(texto, source, target);

  if (resultado) {
    mensaje.textContent = `Traducción: "${resultado.respuesta}"`;
    // SOLO CAMBIO: si estamos en modo inglés → español, leer en español
    hablar(resultado.respuesta, inglesAEspanol ? "es-ES" : "en-US");

    // Agregar al juego
    preguntas.push(resultado);
    jugarBtn.disabled = false;
    aprenderBtn.disabled = false;
  } else {
    mensaje.textContent = "No se pudo traducir la palabra.";
  }
});

// Botón "Responder"
let botonResponder = document.getElementById("boton");
if (!botonResponder) {
  botonResponder = document.createElement("button");
  botonResponder.id = "boton";
  botonResponder.className = "btn btn-info btn-lg mt-3";
  botonResponder.textContent = "Responder";
  botonResponder.style.display = "none";
  input.parentElement.insertAdjacentElement('afterend', botonResponder);

  botonResponder.addEventListener("click", () => {
    const respuestaUsuario = input.value.trim().toLowerCase();
    const respuestaCorrecta = preguntas[indice].respuesta.trim().toLowerCase();

    if (respuestaUsuario === respuestaCorrecta) {
      puntos++;
      actualizarPuntos();
      mensaje.textContent = `🏆¡Correcto! "${preguntas[indice].respuesta}"`;
      hablar(preguntas[indice].respuesta, "en-US");
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
  tituloElem.textContent = "Can you say…?";
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
  botonResponder.style.display = "none";
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
    hablar(textoFinal, "en-US");
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
      hablar(respuestaCorrecta, "en-US");
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
    botonResponder.style.display = "inline-block";
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
    hablar(respuestaCorrecta, "en-US");
  }
});

// Botón "Salir"
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
  tituloElem.textContent = "“How much English do you know?” ✅";
  jugarBtn.style.display = "inline-block";
  aprenderBtn.style.display = "inline-block";
});

// Detectar Enter en input
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && modo === "jugar") {
    const respuestaUsuario = input.value.trim().toLowerCase();
    const respuestaCorrecta = preguntas[indice].respuesta.trim().toLowerCase();
    if (respuestaUsuario === respuestaCorrecta) {
      puntos++;
      actualizarPuntos();
      mensaje.textContent = `"${preguntas[indice].respuesta}"`;
      hablar(preguntas[indice].respuesta, "en-US");
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
// Wake Lock
let wakeLock = null;

async function mantenerPantallaEncendida() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('Pantalla bloqueada evitada');
  } catch (err) {
    console.error('No se pudo mantener pantalla activa:', err);
  }
}

async function liberarPantalla() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

// En el modo jugar
jugarBtn.addEventListener("click", () => {
  mantenerPantallaEncendida();
});

// Al salir o finalizar el juego
botonSalir.addEventListener("click", () => {
  liberarPantalla();
});

// Al finalizar todas las preguntas en modo jugar
if (indice >= preguntas.length) {
  liberarPantalla();
}
