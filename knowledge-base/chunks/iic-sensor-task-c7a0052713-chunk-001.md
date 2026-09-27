---
chunk_id: iic-sensor-task-c7a0052713-chunk-001
doc_id: iic-sensor-task-c7a0052713
title: "ifndef __IIC_SENSOR_TASK_H_"
semantic_key: "ifndef __IIC_SENSOR_TASK_H_"
keywords: ["ifndef", "iic_sensor_task_h_", "raw", "github", "hiwonder-tonybot", "arduino", "line_follow", "src", "imu", "iic_sensor_task"]
---

#ifndef __IIC_SENSOR_TASK_H_
#define __IIC_SENSOR_TASK_H_

#include "Arduino.h"
#include "MadgwickAHRS.h"
#include "SensorQMI8658.hpp"

#ifdef __cplusplus
extern "C" 
{
#endif

void register_iic_sensor_task();

extern Madgwick filter;
extern SensorQMI8658 qmi;

#ifdef __cplusplus
} // extern "C"
#endif

#endif
