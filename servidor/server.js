const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "0.0.0.0";
const port = 8040;

// =========================
// DATOS GLOBALES
// =========================

let datos = {
  temperatura: 0,
  humedad: 0,
  sonido: 0,
  movimiento: 0,
  personas: 0,
};

// =========================
// SERVER
// =========================

const server = http.createServer((req, res) => {
  console.log(`Petición: ${req.method} ${req.url}`);

  // =====================
  // RECIBIR DATOS ESP32
  // =====================

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

  // =====================
  // ENVIAR DATOS
  // =====================
  else if (req.method === "GET" && req.url === "/datos") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(datos));
  }

  // =====================
  // HTML
  // =====================
  else if (req.method === "GET" && req.url === "/") {
    const filePath = path.join(__dirname, "../dashboard/index.html");

    fs.readFile(filePath, (err, content) => {
      res.writeHead(200, {
        "Content-Type": "text/html",
      });

      res.end(content);
    });
  }

  // =====================
  // CSS
  // =====================
  else if (req.method === "GET" && req.url === "/styles.css") {
    const filePath = path.join(__dirname, "../dashboard/styles.css");

    fs.readFile(filePath, (err, content) => {
      res.writeHead(200, {
        "Content-Type": "text/css",
      });

      res.end(content);
    });
  }

  // =====================
  // JS
  // =====================
  else if (req.method === "GET" && req.url === "/app.js") {
    const filePath = path.join(__dirname, "../dashboard/app.js");

    fs.readFile(filePath, (err, content) => {
      res.writeHead(200, {
        "Content-Type": "application/javascript",
      });

      res.end(content);
    });
  }

  // =====================
  // 404
  // =====================
  else {
    res.writeHead(404);

    res.end("Ruta no encontrada");
  }
});

// =========================
// INICIAR SERVER
// =========================

server.listen(port, host, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
