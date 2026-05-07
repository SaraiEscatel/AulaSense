const tempText = document.getElementById("temp");
const humedadText = document.getElementById("humedad");
const sonidoText = document.getElementById("sonido");
const personasText = document.getElementById("personas");

const canvas = document.getElementById("salon");
const ctx = canvas.getContext("2d");

//  Obtener datos del servidor
async function obtenerDatos() {
  const respuesta = await fetch("/datos");

  const datos = await respuesta.json();

  console.log(datos);

  // 🔊 sonido
  document.getElementById("sonido").innerText = datos.sonido;

  // 🚶 movimiento
  document.getElementById("movimiento").innerText =
    datos.movimiento == 1 ? "Detectado" : "Sin movimiento";
}

setInterval(obtenerDatos, 2000);

obtenerDatos();

//  Dibujar aula
function dibujarSalon(data) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // =========================
  // COLOR POR SONIDO
  // =========================
  const sonido = data.ambiente?.sonido || 0;

  if (sonido < 30) ctx.fillStyle = "#8BC34A";
  else if (sonido < 60) ctx.fillStyle = "#FFC107";
  else ctx.fillStyle = "#F44336";

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // =========================
  // PUERTA
  // =========================
  ctx.fillStyle = "#5D4037";

  ctx.fillRect(0, 140, 30, 120);

  // =========================
  // PERSONAS
  // =========================
  const personas = data.ocupacion?.personas || 0;

  for (let i = 0; i < personas; i++) {
    ctx.beginPath();

    ctx.arc(100 + i * 50, 200, 15, 0, Math.PI * 2);

    ctx.fillStyle = "#1565C0";

    ctx.fill();
  }
}

//  Actualizar cada segundo
setInterval(obtenerDatos, 1000);

obtenerDatos();
