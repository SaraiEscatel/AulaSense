// ==========================================
// CONFIGURACIÓN DE RADAR & LIENZO (CANVAS)
// ==========================================
const canvas = document.getElementById("salon");
const ctx = canvas.getContext("2d");

// Historial en memoria para cálculos estadísticos
let historialSonido = [];

// Variables globales para registrar la posición del mouse dentro del aula
let mouseX = 0;
let mouseY = 0;

// Variables globales para compartir el cálculo del cursor con el panel matemático
let calculoFlotanteCompartido =
  "Mueva el cursor sobre el mapa para calcular...";

// Enlaces al DOM
const sonidoText = document.getElementById("sonido");
const movimientoText = document.getElementById("movimiento");
const personasText = document.getElementById("personas");
const tempText = document.getElementById("temperatura");
const humText = document.getElementById("humedad");

// Registrar el movimiento del mouse sobre el lienzo para corroborar datos
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
});

/** Funcion para obtener datos */
async function obtenerDatos() {
  try {
    const respuesta = await fetch("/datos");
    const datos = await respuesta.json();

    console.log("Datos recibidos del servidor:", datos);

    // Mapeo de variables reales de la ESP32 en el panel superior/lateral
    if (sonidoText) sonidoText.innerText = datos.sonido || 0;
    if (movimientoText) {
      movimientoText.innerText =
        datos.movimiento == 1 ? "Activado" : "Desactivado";
    }
    if (personasText) {
      personasText.innerHTML = `${datos.personas || 0} <small>personas</small>`;
    }

    // Captura de los sensores físicos de Clima
    if (tempText) {
      tempText.innerText = datos.temperatura
        ? datos.temperatura.toFixed(1)
        : "0.0";
    }
    if (humText) humText.innerText = datos.humedad || 0;

    // --- CORRECCIÓN CRÍTICA: VALIDAR O MAPEAR SENSORES FÍSICOS ---
    // Si tu backend no envía el arreglo 'sensoresFisicos', lo creamos dinámicamente
    // mapeando las coordenadas X, Y deseadas en el Canvas para cada ESP32.
    if (!datos.sensoresFisicos) {
      datos.sensoresFisicos = [
        {
          x: 150,
          y: 180,
          temp: datos.temperaturaN1 || datos.temperatura || 25.0,
        }, // Nodo ESP32 1
        {
          x: 500,
          y: 320,
          temp: datos.temperaturaN2 || datos.temperatura || 27.0,
        }, // Nodo ESP32 2
      ];
    }

    // Extraer t1 y t2 de forma segura para el panel matemático
    const t1 = datos.sensoresFisicos[0]
      ? datos.sensoresFisicos[0].temp
      : datos.temperatura;
    const t2 = datos.sensoresFisicos[1]
      ? datos.sensoresFisicos[1].temp
      : datos.temperatura;

    // Procesamiento de Render y Operaciones pasando las variables requeridas
    mostrarCalculosMatematicos(datos, t1, t2);
    dibujarRadarClimatico(datos);
  } catch (error) {
    console.error("Error al obtener o renderizar los datos:", error);
  }
}

// ==========================================
// MÓDULO MATEMÁTICO: DETERMINAR COLOR POR GRADOS
// ==========================================
function obtenerColorPorTemperatura(t) {
  if (t < 22) return "rgba(56, 189, 248, 0.25)";
  if (t < 28) return "rgba(16, 185, 129, 0.25)";
  if (t < 31) return "rgba(245, 158, 11, 0.35)";
  return "rgba(239, 68, 68, 0.4)";
}

// ==========================================
// RENDERIZADO DEL MAPA DE CLIMA (FLUIDO HD)
// ==========================================
function dibujarRadarClimatico(data) {
  // 1. Limpiar lienzo técnico
  ctx.fillStyle = "#070a12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. CREAR NUBES TÉRMICAS FLUIDAS
  ctx.globalCompositeOperation = "screen";

  data.sensoresFisicos.forEach((sensor) => {
    let radioDifusion = 450;
    let gradienteLiquido = ctx.createRadialGradient(
      sensor.x,
      sensor.y,
      5,
      sensor.x,
      sensor.y,
      radioDifusion,
    );

    let colorFusión = obtenerColorPorTemperatura(sensor.temp);

    gradienteLiquido.addColorStop(0, colorFusión);
    gradienteLiquido.addColorStop(
      0.3,
      colorFusión
        .replace("0.25", "0.12")
        .replace("0.35", "0.15")
        .replace("0.4", "0.18"),
    );
    gradienteLiquido.addColorStop(0.6, "rgba(0, 0, 0, 0)");
    gradienteLiquido.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradienteLiquido;
    ctx.beginPath();
    ctx.arc(sensor.x, sensor.y, radioDifusion, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalCompositeOperation = "source-over";

  // 3. Rejilla de Radar de Fondo
  ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // 4. Arquitectura del Aula
  ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

  // Puerta Lateral
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(16, 220, 10, 80);
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 220);
  ctx.lineTo(16, 300);
  ctx.stroke();

  // 5. Nodos de Rastreo Físico
  data.sensoresFisicos.forEach((sensor, index) => {
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.arc(sensor.x, sensor.y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(sensor.x, sensor.y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px 'JetBrains Mono'";
    ctx.fillText(
      `[ESP32_N${index + 1}]: ${sensor.temp}°C`,
      sensor.x - 45,
      sensor.y - 15,
    );
  });

  // 6. Alumnos
  const personas = data.personas || 0;
  for (let i = 0; i < personas; i++) {
    let x = 160 + (i % 4) * 160;
    let y = 150 + Math.floor(i / 4) * 110;
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. CALCULO MATEMÁTICO BAJO EL CURSOR EN TIEMPO REAL
  if (
    mouseX > 15 &&
    mouseX < canvas.width - 15 &&
    mouseY > 15 &&
    mouseY < canvas.height - 15
  ) {
    let sumaPesos = 0;
    let sumaTemperaturas = 0;
    let logConsola = [];

    logConsola.push(
      `<span style="color: #10b981;"> X: ${Math.round(mouseX)}px | Y: ${Math.round(mouseY)}px</span>`,
    );

    data.sensoresFisicos.forEach((sensor, idx) => {
      let dx = mouseX - sensor.x;
      let dy = mouseY - sensor.y;
      let d = Math.sqrt(dx * dx + dy * dy) || 1;

      // Algoritmo de Ponderación del Inverso de la Distancia (IDW)
      let peso = 1 / Math.pow(d, 2);
      sumaPesos += peso;
      sumaTemperaturas += sensor.temp * peso;

      logConsola.push(
        `  • Distancia a N${idx + 1}: <span style="color: #fff;">${Math.round(d)}px</span> (W: ${peso.toExponential(2)})`,
      );
    });

    let tempEstimada = (sumaTemperaturas / sumaPesos).toFixed(2);
    logConsola.push(
      `  <span style="color: #f59e0b;">> Interpolación IDW: ${tempEstimada}°C</span>`,
    );

    // Guardamos la cadena HTML estructurada para la ventanita exterior
    calculoFlotanteCompartido = logConsola.join("<br>");

    // Dibujar una pequeña cruz sutil que siga al puntero sin estorbar el mapa
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mouseX - 5, mouseY);
    ctx.lineTo(mouseX + 5, mouseY);
    ctx.moveTo(mouseX, mouseY - 5);
    ctx.lineTo(mouseX, mouseY + 5);
    ctx.stroke();
  } else {
    calculoFlotanteCompartido =
      "<span style='color: #6b7280;'>Mueva el cursor dentro del mapa para iniciar el motor de cálculo matemático IDW en tiempo real...</span>";
  }

  // Encabezados superiores del Canvas
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "600 12px 'Inter'";
  ctx.fillText(
    `PROMEDIO GENERAL: ${data.temperatura || 0}°C | ${data.humedad || 0}% RH`,
    40,
    50,
  );
}

// ==========================================
// VENTANA DE CÁLCULOS MATEMÁTICOS EN TIEMPO REAL
// ==========================================
function mostrarCalculosMatematicos(datos, t1, t2) {
  historialSonido.push(datos.sonido || 0);
  if (historialSonido.length > 8) historialSonido.shift();

  const contenedorMetricas = document.getElementById("metricas-calculadas");
  if (contenedorMetricas) {
    contenedorMetricas.innerHTML = `
      • N1 Fijo: <span style="color: #fff;">${t1 ? t1.toFixed(1) : "0.0"}°C</span> | N2 Fijo: <span style="color: #fff;">${t2 ? t2.toFixed(1) : "0.0"}°C</span><br>
      --------------------------------------------------<br>
      ${calculoFlotanteCompartido}
    `;
  }
}

// ==========================================
// BUCLE DE BARRIDO CONTINUO (1.4 SEGUNDOS)
// ==========================================
setInterval(obtenerDatos, 1400);
obtenerDatos();
