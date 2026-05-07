#include <WiFi.h>
#include <HTTPClient.h>

// =========================
// WIFI
// =========================
const char *ssid = "ESP32_TEST2";
const char *password = "12345678";

//  IP de el servidor
const char *serverName =
    "http://172.20.10.2:8040/data";

// =========================
// PIR
// =========================
#define PIR_PIN 4

// =========================
// LED TWO COLOR
// =========================
#define LED_VERDE 18
#define LED_ROJO 19

void setup()
{

  Serial.begin(115200);

  // PIR
  pinMode(PIR_PIN, INPUT);

  // LEDS
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);

  // WIFI
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
  // LEER PIR
  // =========================
  int movimiento =
      digitalRead(PIR_PIN);

  // =========================
  // MOSTRAR
  // =========================
  Serial.print("Movimiento: ");
  Serial.println(movimiento);

  // =========================
  // LEDS
  // =========================
  if (movimiento == HIGH)
  {

    digitalWrite(LED_ROJO, HIGH);
    digitalWrite(LED_VERDE, LOW);
  }
  else
  {

    digitalWrite(LED_ROJO, LOW);
    digitalWrite(LED_VERDE, HIGH);
  }

  // =========================
  // ENVIAR
  // =========================
  if (WiFi.status() == WL_CONNECTED)
  {

    HTTPClient http;

    http.begin(serverName);

    http.addHeader(
        "Content-Type",
        "application/json");

    String json = "{";

    json += "\"id\":\"ocupacion\",";
    json += "\"movimiento\":";
    json += movimiento;

    json += "}";

    Serial.println(json);

    int response =
        http.POST(json);

    Serial.print("HTTP Response: ");
    Serial.println(response);

    http.end();
  }

  delay(2000);
}