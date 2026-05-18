// =========================
// CANVAS
// =========================

const canvas = document.getElementById("salon");

const ctx = canvas.getContext("2d");

// =========================
// TEXTOS
// =========================

const sonidoText = document.getElementById("sonido");

const movimientoText = document.getElementById("movimiento");

const personasText = document.getElementById("personas");

// =========================
// OBTENER DATOS
// =========================

async function obtenerDatos() {
  try {
    const respuesta = await fetch("/datos");

    const datos = await respuesta.json();

    console.log(datos);

    // =====================
    // TEXTO
    // =====================

    sonidoText.innerText = datos.sonido || 0;

    movimientoText.innerText =
      datos.movimiento == 1 ? "Detectado" : "Sin movimiento";

    personasText.innerText = datos.personas || 0;

    // =====================
    // DIBUJAR
    // =====================

    dibujarSalon(datos);
  } catch (error) {
    console.log(error);
  }
}

// =========================
// DIBUJAR AULA
// =========================

function dibujarSalon(data) {
  // Limpiar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // =====================
  // COLOR SEGÚN SONIDO
  // =====================

  const sonido = data.sonido || 0;

  if (sonido < 30) {
    ctx.fillStyle = "#4CAF50";
  } else if (sonido < 60) {
    ctx.fillStyle = "#FFC107";
  } else {
    ctx.fillStyle = "#F44336";
  }

  // Fondo del aula
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // =====================
  // PIZARRÓN
  // =====================

  ctx.fillStyle = "#222";

  ctx.fillRect(250, 20, 200, 60);

  // =====================
  // PUERTA
  // =====================

  ctx.fillStyle = "#6D4C41";

  ctx.fillRect(0, 180, 40, 120);

  // =====================
  // PERSONAS
  // =====================

  const personas = data.personas || 0;

  for (let i = 0; i < personas; i++) {
    let x = 120 + (i % 5) * 100;

    let y = 160 + Math.floor(i / 5) * 100;

    // Cabeza
    ctx.beginPath();

    ctx.arc(x, y, 18, 0, Math.PI * 2);

    ctx.fillStyle = "#1565C0";

    ctx.fill();

    // Cuerpo
    ctx.fillRect(x - 10, y + 20, 20, 40);
  }

  // =====================
  // MOVIMIENTO PIR
  // =====================

  if (data.movimiento == 1) {
    ctx.fillStyle = "red";

    ctx.beginPath();

    ctx.arc(700, 80, 25, 0, Math.PI * 2);

    ctx.fill();

    ctx.fillStyle = "white";

    ctx.font = "20px Arial";

    ctx.fillText("MOVIMIENTO", 620, 130);
  }
}

// =========================
// ACTUALIZAR
// =========================

setInterval(obtenerDatos, 1000);

obtenerDatos();
