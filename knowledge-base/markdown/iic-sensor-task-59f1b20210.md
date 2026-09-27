---
doc_id: iic-sensor-task-59f1b20210
title: "ifndef __IIC_SENSOR_TASK_H_"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI视觉项目课程/人脸识别/face_hello/src/IMU/iic_sensor_task.h
source_type: official
status: processed
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
