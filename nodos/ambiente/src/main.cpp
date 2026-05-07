#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// =========================
// WIFI
// =========================
const char *ssid = "ESP32_TEST2";
const char *password = "12345678";

//  IP de el servidor
const char *serverName =
    "http://172.20.10.2:8040/data";

// =========================
// DHT11
// =========================
#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

// =========================
// SOUND SENSOR
// =========================
#define SOUND_PIN 34

void setup()
{

  Serial.begin(115200);

  dht.begin();

  // =========================
  // WIFI
  // =========================
  WiFi.begin(ssid, password);

  Serial.print("Conectando WiFi");

  while (WiFi.status() != WL_CONNECTED)
  {

    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado");
}

void loop()
{

  // =========================
  // LEER DHT11
  // =========================
  float temperatura =
      dht.readTemperature();

  float humedad =
      dht.readHumidity();

  // =========================
  // LEER SONIDO
  // =========================
  int sonido =
      analogRead(SOUND_PIN);

  // =========================
  // MOSTRAR
  // =========================
  Serial.println("==============");

  Serial.print("Temperatura: ");
  Serial.println(temperatura);

  Serial.print("Humedad: ");
  Serial.println(humedad);

  Serial.print("Sonido: ");
  Serial.println(sonido);

  // =========================
  // ENVIAR AL SERVER
  // =========================
  if (WiFi.status() == WL_CONNECTED)
  {

    HTTPClient http;

    http.begin(serverName);

    http.addHeader(
        "Content-Type",
        "application/json");

    // 🔥 JSON
    String json = "{";

    json += "\"id\":\"ambiente\",";
    json += "\"temperatura\":";
    json += temperatura;
    json += ",";
    json += "\"humedad\":";
    json += humedad;
    json += ",";
    json += "\"sonido\":";
    json += sonido;

    json += "}";

    Serial.println(json);

    int response =
        http.POST(json);

    Serial.print("HTTP Response: ");
    Serial.println(response);

    http.end();
  }

  delay(3000);
}