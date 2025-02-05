// Піни для підключення
const int tempSensorPin = A0;       // Датчик температури підключений до A0
const int photoResistorPin = A1;    // Фоторезистор підключений до A1

// Критичні значення
const float criticalTemp = 100.0;         // Критична температура (>100°C)
const float criticalLiquidLevel = 20.0;   // Критичний рівень рідини (<20%)

void setup() {
  Serial.begin(9600);  // Запуск серійного монітора
}

void loop() {
  // Зчитування температури
  int tempValue = analogRead(tempSensorPin);
  float voltage = tempValue * (5.0 / 1023.0);
  float temperatureC = (voltage - 0.5) * 100.0;

  // Зчитування рівня рідини через фоторезистор
  int lightValue = analogRead(photoResistorPin);
  float liquidLevel = map(lightValue, 0, 1023, 100, 0);  // Перетворення в %

  // Виведення даних температури
  Serial.print("Temperature: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  // Виведення даних рівня рідини
  Serial.print("Liquid Level: ");
  Serial.print(liquidLevel);
  Serial.println(" %");

  // Перевірка критичних значень температури
  if (temperatureC > criticalTemp) {
    Serial.println("ALERT: High engine temperature detected!");  // Попередження про перегрів
  } else {
    Serial.println("Temperature is normal.");
  }

  // Перевірка критичних значень рівня рідини
  if (liquidLevel < criticalLiquidLevel) {
    Serial.println("ALERT: Low liquid level detected!");  // Попередження про низький рівень рідини
  } else {
    Serial.println("Liquid level is normal.");
  }

  delay(2000);  // Затримка 2 секунди
}
