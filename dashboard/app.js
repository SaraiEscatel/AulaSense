// Configuración del lienzo HTML para dibujar el mapa
const canvas = document.getElementById("salon");
const ctx = canvas.getContext("2d");

// Historial para guardar lecturas de sonido y calcular promedios
let historialSonido = [];

// Coordenadas actuales del cursor del mouse dentro del aula
let mouseX = 0;
let mouseY = 0;

// Texto global que almacena el cálculo matemático bajo el cursor
let calculoFlotanteCompartido =
  "Mueva el cursor sobre el mapa para calcular...";

// Captura de los elementos de texto de la interfaz web (DOM)
const sonidoText = document.getElementById("sonido");
const movimientoText = document.getElementById("movimiento");
const personasText = document.getElementById("personas");
const tempText = document.getElementById("temperatura");
const humText = document.getElementById("humedad");
const co2Text = document.getElementById("co2");

// Detecta la posición del mouse y ajusta las coordenadas al lienzo
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
});

// Función principal que solicita los datos reales de la ESP32
async function obtenerDatos() {
  try {
    const respuesta = await fetch("/datos");
    const datos = await respuesta.json();

    // Asigna los valores del sensor físico a los textos de la página
    sonidoText.innerText = datos.sonido || 0;
    movimientoText.innerText =
      datos.movimiento == 1 ? "Activado" : "Desactivado";
    personasText.innerHTML = `${datos.personas || 0} <small>personas</small>`;

    // Verifica si existen los campos de clima y les da formato decimal
    if (tempText)
      tempText.innerText = datos.temperatura
        ? datos.temperatura.toFixed(1)
        : "0.0";
    if (humText) humText.innerText = datos.humedad || 0;

    // ALGORITMO DE SIMULACIÓN DE CO2: Explicación para tu exposición
    // Base: 400 ppm (aire limpio exterior). Sumamos 75 ppm por cada persona presente.
    const nPersonas = datos.personas || 0;
    const variacionAleatoria = Math.floor(Math.random() * 30) - 15; // Genera cambios de +/- 15 ppm para simular un sensor real
    let co2Estimado = 400 + nPersonas * 75 + variacionAleatoria;

    // Si el aula está vacía, el valor se estabiliza cerca del nivel del aire libre
    if (nPersonas === 0) co2Estimado = Math.max(400, 410 + variacionAleatoria);

    // Muestra el valor de CO2 calculado en la tarjeta de la página web
    if (co2Text) co2Text.innerText = co2Estimado;
    datos.co2Simulado = co2Estimado;

    // Llama a las funciones encargadas de actualizar los gráficos y fórmulas
    mostrarCalculosMatematicos(datos);
    dibujarRadarClimatico(datos);
  } catch (error) {
    console.log("Error al conectar con el servidor: ", error);
  }
}

// Devuelve un color semitransparente según el nivel de temperatura recibido
function obtenerColorPorTemperatura(t) {
  if (t < 22) return "rgba(56, 189, 248, 0.25)"; // Azul para clima frío
  if (t < 28) return "rgba(16, 185, 129, 0.25)"; // Verde para clima óptimo o templado
  if (t < 31) return "rgba(245, 158, 11, 0.35)"; // Naranja para clima cálido
  return "rgba(239, 68, 68, 0.4)"; // Rojo para calor excesivo
}

// Dibuja todo el mapa visual dentro del lienzo del aula
function dibujarRadarClimatico(data) {
  // Limpia el lienzo pintando el fondo de color azul oscuro técnico
  ctx.fillStyle = "#070a12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Activa el modo de fusión de color para crear un efecto de calor fluido
  ctx.globalCompositeOperation = "screen";

  // Dibuja las nubes de temperatura usando gradientes radiales para cada sensor
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
    let colorFusion = obtenerColorPorTemperatura(sensor.temp);

    gradienteLiquido.addColorStop(0, colorFusion);
    gradienteLiquido.addColorStop(
      0.3,
      colorFusion
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

  // Restaura el modo de dibujo estándar sobre el lienzo
  ctx.globalCompositeOperation = "source-over";

  // Dibuja una cuadrícula gris muy sutil que simula un radar tecnológico
  ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Dibuja las líneas exteriores que marcan las paredes del aula
  ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

  // Dibuja un rectángulo que representa la ubicación de la puerta del salón
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(16, 220, 10, 80);
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 220);
  ctx.lineTo(16, 300);
  ctx.stroke();

  // Dibuja un punto blanco y una etiqueta de texto para cada ESP32 física instalada
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

  // Distribuye círculos en el mapa para representar gráficamente a los alumnos presentes
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

  // Motor matemático (IDW) que calcula el clima exacto en el punto donde se sitúe el mouse
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
      let d = Math.sqrt(dx * dx + dy * dy) || 1; // Calcula la distancia geométrica al sensor usando Pitágoras

      // Aplica la fórmula IDW donde el peso matemático es el inverso del cuadrado de la distancia
      let peso = 1 / Math.pow(d, 2);
      sumaPesos += peso;
      sumaTemperaturas += sensor.temp * peso;

      logConsola.push(
        `  • Distancia a N${idx + 1}: <span style="color: #fff;">${Math.round(d)}px</span>`,
      );
    });

    // Realiza la interpolación final dividiendo el acumulado entre la suma de pesos ponderados
    let tempEstimada = (sumaTemperaturas / sumaPesos).toFixed(2);
    logConsola.push(
      `  <span style="color: #f59e0b;">> Interpolación: ${tempEstimada}°C</span>`,
    );

    calculoFlotanteCompartido = logConsola.join("<br>");

    // Dibuja una pequeña retícula en cruz sobre el cursor del mouse
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

  // Imprime los datos globales promediados en la esquina superior izquierda del mapa
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "600 12px 'Inter'";
  ctx.fillText(
    `PROMEDIO GENERAL: ${data.temperatura}°C | ${data.humedad}% RH | Est. CO2: ${data.co2Simulado} ppm`,
    40,
    50,
  );
}

// Muestra el desglose matemático detallado dentro del panel terminal negro
function mostrarCalculosMatematicos(datos) {
  // Extrae de forma segura los valores de temperatura de las ESP32 físicas conectadas
  const t1 =
    datos.sensoresFisicos && datos.sensoresFisicos[0]
      ? datos.sensoresFisicos[0].temp
      : datos.temperatura;
  const t2 =
    datos.sensoresFisicos && datos.sensoresFisicos[1]
      ? datos.sensoresFisicos[1].temp
      : datos.temperatura;

  const contenedorMetricas = document.getElementById("metricas-calculadas");
  if (contenedorMetricas) {
    contenedorMetricas.innerHTML = `
      • N1 Fijo: <span style="color: #fff;">${t1}°C</span> | N2 Fijo: <span style="color: #fff;">${t2}°C</span><br>
      • Calidad de Aire (Simulada): <span style="color: #a855f7;">${datos.co2Simulado} ppm</span><br>
      -----------------------------------------<br>
      ${calculoFlotanteCompartido}
    `;
  }
}

// Ejecuta de forma indefinida la recarga de datos cada 1.4 segundos
setInterval(obtenerDatos, 1400);
obtenerDatos();
