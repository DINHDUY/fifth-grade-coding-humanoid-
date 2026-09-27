---
chunk_id: imu-43536c0eb5-chunk-001
doc_id: imu-43536c0eb5
title: "include \"Hiwonder.hpp\""
semantic_key: "include \"Hiwonder.hpp\""
keywords: ["include", "hiwonder", "hpp", "raw", "github", "hiwonder-tonybot", "arduino", "tonybot_ai", "imu", "cpp"]
---

#include "Hiwonder.hpp"

#include "Wire.h"

#include "base_config.h"
#include "src/IMU/MadgwickAHRS.h"
#include "SensorQMI8658.hpp"

namespace {

SensorQMI8658 qmi;
Madgwick filter;
bool imu_ready = false;
bool filter_ready = false;
float gyro_offset_x = 0.0f;
float gyro_offset_y = 0.0f;
float gyro_offset_z = 0.0f;
uint32_t last_update_ms = 0;
float cached_roll = 90.0f;
float cached_pitch = 0.0f;

void configureSensor() {
  qmi.configAccelerometer(
      SensorQMI8658::ACC_RANGE_2G,
      SensorQMI8658::ACC_ODR_1000Hz,
      SensorQMI8658::LPF_MODE_0,
      true);

  qmi.configGyroscope(
      SensorQMI8658::GYR_RANGE_256DPS,
      SensorQMI8658::GYR_ODR_896_8Hz,
      SensorQMI8658::LPF_MODE_3,
      true);

  qmi.enableGyroscope();
  qmi.enableAccelerometer();
  filter.begin(25);

  float gx = 0.0f;
  float gy = 0.0f;
  float gz = 0.0f;
  qmi.getGyroscope(gx, gy, gz);
  gyro_offset_x = gx;
  gyro_offset_y = gy;
  gyro_offset_z = gz;

  for (int i = 0; i < 10; ++i) {
    qmi.getGyroscope(gx, gy, gz);
    gyro_offset_x = (gyro_offset_x + gx) / 2.0f;
    gyro_offset_y = (gyro_offset_y + gy) / 2.0f;
    gyro_offset_z = (gyro_offset_z + gz) / 2.0f;
    delay(40);
  }

  filter_ready = true;
}

void updateFilter() {
  if (!imu_ready || !filter_ready) {
    return;
  }

  if (millis() - last_update_ms < 40) {
    return;
  }
  last_update_ms = millis();

  if (!qmi.getDataReady()) {
    return;
  }

  float ax = 0.0f;
  float ay = 0.0f;
  float az = 0.0f;
  float gx = 0.0f;
  float gy = 0.0f;
  float gz = 0.0f;

  qmi.getAccelerometer(ax, ay, az);
  qmi.getGyroscope(gx, gy, gz);
  filter.updateIMU(gx - gyro_offset_x, gy - gyro_offset_y, gz - gyro_offset_z, ax, ay, az);
  cached_roll = filter.getRoll();
  cached_pitch = filter.getPitch();
}

}  // namespace

void IMU::begin() {
  if (qmi.begin(Wire, QMI8658_H_SLAVE_ADDRESS, IO_SDA, IO_SCL)) {
    imu_ready = true;
    configureSensor();
    Serial.println("QMI8658 init.");
  } else {
    Serial.println("QMI8658 init fail.");
  }
}

void IMU::update() {
  updateFilter();
}

void IMU::get_angle(float* roll, float* pitch) {
  if (!imu_ready || !filter_ready) {
    *roll = 90.0f;
    *pitch = 0.0f;
    return;
  }

  updateFilter();
  *roll = cached_roll;
  *pitch = cached_pitch;
}
