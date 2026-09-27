---
doc_id: iic-sensor-task-c7a0052713
title: "ifndef __IIC_SENSOR_TASK_H_"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型应用课程/02 智慧交通行驶程序/line_follow/src/IMU/iic_sensor_task.h
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
