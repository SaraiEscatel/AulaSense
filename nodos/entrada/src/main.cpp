#include <WiFi.h>
#include <HTTPClient.h>

// WIFI
const char *ssid = "ESP32_TEST2";
const char *password = "12345678";

//  IP de el servidor
const char *serverName =
    "http://172.20.10.2:8040/data";

// Pines
#define AVOID_PIN 18
#define TRACK_PIN 19

int personas = 0;

// Estados anteriores
int lastAvoid = 1;
int lastTrack = 1;

void setup()
{

  Serial.begin(115200);

  pinMode(AVOID_PIN, INPUT);
  pinMode(TRACK_PIN, INPUT);

  // WiFi
  WiFi.begin(ssid, password);

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

  int avoid =
      digitalRead(AVOID_PIN);

  int tracking =
      digitalRead(TRACK_PIN);

  // =====================
  // ENTRADA
  // =====================

  if (avoid == 0 && lastAvoid == 1)
  {

    personas++;

    Serial.println("Persona ENTRO");
  }

  // =====================
  // SALIDA
  // =====================

  if (tracking == 0 && lastTrack == 1)
  {

    personas--;

    if (personas < 0)
    {
      personas = 0;
    }

    Serial.println("Persona SALIO");
  }

  // Guardar estados
  lastAvoid = avoid;
  lastTrack = tracking;

  // JSON
  String json = "{";

  json += "\"id\":\"entrada\",";
  json += "\"avoid\":" + String(avoid) + ",";
  json += "\"tracking\":" + String(tracking) + ",";
  json += "\"personas\":" + String(personas);

  json += "}";

  Serial.println(json);

  // HTTP
  if (WiFi.status() == WL_CONNECTED)
  {

    HTTPClient http;

    http.begin(serverName);

    http.addHeader(
        "Content-Type",
        "application/json");

    int response =
        http.POST(json);

    Serial.print("HTTP: ");
    Serial.println(response);

    http.end();
  }

  delay(500);
}