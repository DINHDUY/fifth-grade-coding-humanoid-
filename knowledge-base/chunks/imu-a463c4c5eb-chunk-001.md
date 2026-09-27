---
chunk_id: imu-a463c4c5eb-chunk-001
doc_id: imu-a463c4c5eb
title: "/**"
semantic_key: "/**"
keywords: ["raw", "github", "hiwonder-tonybot", "arduino", "iot", "iot_tonybot", "src", "imu", "cpp"]
---

/**
 * @file imu_task.cpp
 * @author CuZn
 * 
 * @brief imu
 * 
 * @version 1.0
 * @date 2024-12-06
 * 
 * @copyright Copyright (c) 2024
 * 
 */
#include "../../base_config.h"
#include "../../Hiwonder.hpp"

void IMU::begin()
{
  if(qmi.begin(Wire, QMI8658_H_SLAVE_ADDRESS, IO_SDA, IO_SCL))
  {
    register_iic_sensor_task();
    Serial.println("QMI8658 init.");
  }else{
    Serial.println("QMI8658 init fail.");
  }
}

void IMU::get_angle(float* roll , float* pitch)
{
  *roll = filter.getRoll();
  *pitch = filter.getPitch();
}
