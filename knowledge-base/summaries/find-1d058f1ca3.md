---
doc_id: find-1d058f1ca3
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/寻找宝盒/Find/Find.ino
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

#define TURN_RIGHT  35     /*右转动作组*/
#define TURN_LEFT   34     /*左转动作组*/
#define B 0               /*舵机偏差，根据实际情况调整大小以使超声波朝向正前方 -响右 +向左*/

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例


uint16_t getDistance() {       //获得距离
  uint16_t distance1, distance2, distance3;
  distance1 = hwsensor.ultrasoundGetDistance();
  distance2 = hwsensor.ultrasoundGetDistance();
  distance3 = hwsensor.ultrasoundGetDistance();

  distance1 = (distance1 + distance2 + distance3)/3;
  return distance1;
}

/*寻找宝盒任务*/
void find_(void)
{ 
  static uint8_t  step = 0;
  static uint16_t distance = 0;   //中间距离
  static uint16_t distanceL = 0;  //左边距离
  static uint16_t distanceR = 0;  //右边距离
  static uint16_t distanceLC = 0;  //左上边距离
  static uint16_t distanceRC = 0;  //右上边距离
  static uint32_t last_tick = 0;
  
  if(millis() <= last_tick)
  {
    return;
  }
  // 获取距离
  distance = getDistance();
  switch (step)
  {
    case 0:
      // 
      if (distance > 30 && distance <= 350)
      {
        sonarServo.detach();
        delay(100);
        hwsensor.ultrasoundColor(50, 50, 50, 50, 50, 50); //白色
        step = 0;
      } 
      else {
        sonarServo.attach(IO_Servo);
        hwsensor.ultrasoundColor(0, 50, 0, 0, 50, 0); //绿
        step = 1;
      }
      break;
    case 1:  
      sonarServo.write(45 + B);  //转到右边
      delay(400);
