---
doc_id: up-da43bee5a4
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/跌倒起立/up/up.ino
source_type: official
status: processed
---

# /**************************************************************

/**************************************************************
 * company：深圳市幻尔科技有限公司
 * date&&author：20241128&&CuZn
 * description：
**************************************************************/
#include "base_config.h"
#include "HardwareSerial.h" //串口库
#include "LobotServoController.h" //舵机控制器库
#include "Arduino.h"
#include "Servo.h"
#include "HWSensor.h" //传感器库
#include "Hiwonder.hpp"

float radianX;
float radianY;

LobotServoController Controller(Serial2); //实例化二次开发通信库
IMU imu; //实例化IMU对象
Buzzer_t buzzer_obj; //实例化蜂鸣器对象
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例

/*跌倒起立任务*/
void tumble(void)
{
  static uint32_t Time;  //定义静态变量Time， 用于计时
  static uint8_t step = 0;
  static uint8_t count1 = 0;
  static uint8_t count2 = 0;

  if (Time > millis())       //Timer 大于 millis（）（运行的总毫秒数）时返回，
    return;
  switch (step)
  {
    case 0:
      // 获取IMU数据，判断是前倒还是后倒
      imu.get_angle(&radianX , &radianY);
      // Serial.printf("r:%d , p:%d\r\n",(int)radianX , (int)radianY);
      // 若为前倒
      if (radianX < 60 && radianX > -30)
      { 
        count1 += 1;
        Time = millis() + 50;
        if (count1 > 50) {
          count1 = 0;
          step = 1;
          buzzer_obj.blink(1500 , 100 , 100 , 1);
          Time = millis() + 1000;
        }
      }
      // 若为后倒
      else if (radianX > 120 || radianX < -140)
      {
        count2 += 1;
        Time = millis() + 50;
        if (count2 > 50) {
          count2 = 0;
          step = 2;
          buzzer_obj.blink(1500 , 100 , 100 , 1);
          Time = millis() + 1000;
        }
      }
      // 若没倒
      else {
        count1 = 0;
        count2 = 0;
      }
      break;

    case 1:
      Controller.runActionGroup(102, 1); //恢复立正状态 
      Time = millis() + 7000;
      step = 0;   
      break;

    c
