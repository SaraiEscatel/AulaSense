const http = require("http");

const host = "0.0.0.0";
const port = 8040;

//  Datos globales
let datos = {
  temperatura: 0,
  humedad: 0,
  sonido: 0,
  movimiento: 0,
};

const server = http.createServer((req, res) => {
  console.log(`Petición: ${req.method} ${req.url}`);

  // =========================
  // RECIBIR DATOS ESP32
  // =========================
  if (req.method === "POST" && req.url === "/data") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      console.log("Datos recibidos:");
      console.log(body);

      try {
        const json = JSON.parse(body);

        //  Guardar datos
        datos = {
          ...datos,
          ...json,
        };
      } catch (e) {
        console.log("Error JSON");
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(
        JSON.stringify({
          status: "ok",
        }),
      );
    });
  }

  // =========================
  // DASHBOARD
  // =========================
  else if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(`

      <html>

      <head>

        <title>AulaSense</title>

        <meta http-equiv="refresh" content="2">

        <style>

          body{
            background:#111;
            color:white;
            font-family:Arial;
            text-align:center;
          }

          .card{
            background:#222;
            width:250px;
            margin:auto;
            padding:20px;
            border-radius:20px;
            margin-top:20px;
          }

          h1{
            color:#00d9ff;
          }

        </style>

      </head>

      <body>

        <h1> AulaSense Dashboard</h1>

        <div class="card">

          <h2> Temperatura</h2>
          <p>${datos.temperatura} °C</p>

        </div>

        <div class="card">

          <h2> Humedad</h2>
          <p>${datos.humedad} %</p>

        </div>

        <div class="card">

          <h2> Sonido</h2>
          <p>${datos.sonido}</p>

        </div>

        <div class="card"></div>

          <h2> Movimiento</h2>
          <p>${datos.movimiento == 1 ? "Detectado" : "Sin movimiento"}</p>

      </body>

      </html>

    `);
  }

  // =========================
  // DEFAULT
  // =========================
  else {
    res.writeHead(404);

    res.end("Ruta no encontrada");
  }
});

server.listen(port, host, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
