---
doc_id: iic-sensor-task-356db62132
title: "/**"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/温湿度检测/temperature_humidity/src/IMU/iic_sensor_task.cpp
source_type: official
status: processed
---

# /**

/**
 * @file imu_task.cpp
 * @author CuZn
 * 
 * @brief Qmi8658 task
 * 
 * @version 1.0
 * @date 2024-12-06
 * 
 * @copyright Copyright (c) 2024
 * 
 */

#include "iic_sensor_task.h"
#include "../../Hiwonder.hpp"

// extern SemaphoreHandle_t sp_IIC1;
// extern SemaphoreHandle_t sp_IIC2;

SensorQMI8658 qmi;
Madgwick filter;

static void task_process_handler(void *arg)
{
    
    static IMUdata gyr_offset;
    IMUdata acc;
    IMUdata gyr;
    static uint32_t lase_tick = 0;

    qmi.configAccelerometer(
        /*
         * ACC_RANGE_2G
         * ACC_RANGE_4G
         * ACC_RANGE_8G
         * ACC_RANGE_16G
         * */
        SensorQMI8658::ACC_RANGE_2G,
        /*
         * ACC_ODR_1000H
         * ACC_ODR_500Hz
         * ACC_ODR_250Hz
         * ACC_ODR_125Hz
         * ACC_ODR_62_5Hz
         * ACC_ODR_31_25Hz
         * ACC_ODR_LOWPOWER_128Hz
         * ACC_ODR_LOWPOWER_21Hz
         * ACC_ODR_LOWPOWER_11Hz
         * ACC_ODR_LOWPOWER_3H
        * */
        SensorQMI8658::ACC_ODR_1000Hz,
        /*
        *  LPF_MODE_0     //2.66% of ODR
        *  LPF_MODE_1     //3.63% of ODR
        *  LPF_MODE_2     //5.39% of ODR
        *  LPF_MODE_3     //13.37% of ODR
        * */
        SensorQMI8658::LPF_MODE_0,
        // selfTest enable
        true);

    qmi.configGyroscope(
        /*
        * GYR_RANGE_16DPS
        * GYR_RANGE_32DPS
        * GYR_RANGE_64DPS
        * GYR_RANGE_128DPS
        * GYR_RANGE_256DPS
        * GYR_RANGE_512DPS
        * GYR_RANGE_1024DPS
        * */
        SensorQMI8658::GYR_RANGE_256DPS,
        /*
         * GYR_ODR_7174_4Hz
         * GYR_ODR_3587_2Hz
         * GYR_ODR_1793_6Hz
         * GYR_ODR_896_8Hz
         * GYR_ODR_448_4Hz
         * GYR_ODR_224_2Hz
         * GYR_ODR_112_1Hz
         * GYR_ODR_56_05Hz
         * G
