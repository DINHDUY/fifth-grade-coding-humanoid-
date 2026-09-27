---
doc_id: hiwonder-130a5a482b
title: "ifndef __HIWONDER_H"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.4 人脸识别/02 人脸识别程序/02 Tonybot人脸识别程序/demo/Hiwonder.hpp
source_type: official
status: processed
---

# ifndef __HIWONDER_H

#ifndef __HIWONDER_H
#define __HIWONDER_H

#include "stdint.h"
#include <Ticker.h>
// #include "src/IMU/iic_sensor_task.h"

#define CHANNEL_DEFAULT 10

#define ULTRASOUND_ADDR                     0x77  /* 超声波模块I2C从机地址 */
#define DISTANCE_REG                        0     /* 距离低8位，单位mm */
#define RGB_WORK_MODE_REG                   2     /*  RGB灯模式设置寄存器 */
#define RGB_WORK_SOLID_MODE                 0
#define RGB_WORK_BREATHING_MODE             1
#define SOLID_RGB_SET_REG                   3
#define BREATHING_RGB_SET_REG               9
#define FILTER_NUM                          3

typedef enum {
    BUZZER_STAGE_START_NEW_CYCLE,
    BUZZER_STAGE_WATTING_OFF,
    BUZZER_STAGE_WATTING_PERIOD_END,
    BUZZER_STAGE_IDLE,
} BuzzerStageEnum;

class Buzzer_t{
    public:
        void init(uint8_t pin , uint8_t channel = CHANNEL_DEFAULT , uint16_t frequency = 1500);
        void on_off(uint8_t state);
        void blink(uint16_t frequency , uint16_t on_time , uint16_t off_time , uint16_t count);

    public:
        uint8_t buzzer_pin;
        uint8_t buzzer_channel;
        Ticker timer_buzzer;
        uint8_t new_flag;
        uint16_t freq;
        uint16_t ticks_on;
        uint16_t ticks_off;
        uint16_t repeat;
        BuzzerStageEnum stage;
        uint32_t ticks_count;
};

class IMU{
  public:
    void begin();
    void get_angle(float* roll , float* pitch);
};

class Ultrasound_t{
  public:
    uint16_t _get_distance(void);
    uint16_t get_distance(void);
    void set_rgb(uint8_t mode, uint8_t *rgb1, uint8_t *rgb2); //r1，g1，b1表示右边rgb灯的呼吸周期，20表示2s一个周期

  private:
    uint16_t filter[FILTER_NUM + 1];
};

#endif //__HIWONDER_H
