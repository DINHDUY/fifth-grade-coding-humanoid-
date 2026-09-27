---
doc_id: iic-sensor-task-c8b48e6141
title: "ifndef __IIC_SENSOR_TASK_H_"
source_path: raw/github/Hiwonder-Tonybot/Arduino/语音交互项目课程/人机互动/Communicate/src/IMU/iic_sensor_task.h
source_type: official
status: processed
---

# ifndef __IIC_SENSOR_TASK_H_

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
