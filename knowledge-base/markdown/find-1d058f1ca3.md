---
doc_id: find-1d058f1ca3
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/寻找宝盒/Find/Find.ino
source_type: official
status: processed
---

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
      delay(200);
      distanceR = getDistance();//测量右边距离
      
      sonarServo.write(0 + B);  //转到右上
      delay(400);
      delay(200);
      distanceRC = getDistance();//测量左上距离
      
      sonarServo.write(145 + B); //转到左说
      delay(600);
      delay(200);
      distanceL = getDistance();//测量左边距离

      sonarServo.write(180 + B);  //转到左边
      delay(400);
      delay(200);
      distanceLC = getDistance();//测量左边距离
              
      sonarServo.write(90 + B); //转回中间
      delay(400);
      delay(200);
      step = 2;  //转到case 2
      break;
    case 2:
      if (distanceL == 0)  //如果测到的距离等于0即代表距离超过设定的超声波量程，将距离指定为9999
        distanceL = 9999;
      if (distanceR == 0)
        distanceR = 9999;
      if (distance == 0)
        distance = 9999;
      if (distanceRC == 0)
        distanceRC = 9999;
      if (distanceLC == 0)
        distanceLC = 9999;
      if (distanceL < distance && distanceL < distanceR && distanceL < distanceLC && distanceL < distanceRC)  //左边的距离最小，左转
      {
        if (distanceL < 350) {
          hwsensor.ultrasoundColor(0, 0, 50, 0, 0, 50);
          Controller.runActionGroup(TURN_LEFT, 2);
          last_tick = millis()+2500;
        }
      } else if (distanceR < distance && distanceR < distanceL && distanceR < distanceLC && distanceR < distanceRC)  //右边的距离最小，右转
      {
        if (distanceR < 350) {
          hwsensor.ultrasoundColor(50, 0, 0, 50, 0, 0);
          Controller.runActionGroup(TURN_RIGHT, 2);
          last_tick = millis()+2500;
        }
      }
      if (distanceLC < distance && distanceLC < distanceR && distanceLC < distanceL && distanceLC < distanceRC)  //左上边的距离最小，左转
      {
        if (distanceLC < 350) {
          hwsensor.ultrasoundColor(0, 0, 50, 0, 0, 50);
          Controller.runActionGroup(TURN_LEFT, 4);
          last_tick = millis()+5000;
        }
      } else if (distanceRC < distance && distanceRC < distanceL && distanceRC < distanceLC && distanceRC < distanceL)  //右上边的距离最小，右转
      {
        if (distanceRC < 350) {
          hwsensor.ultrasoundColor(50, 0, 0, 50, 0, 0);
          Controller.runActionGroup(TURN_RIGHT, 4 );
          last_tick = millis()+5000;
        }
      }
      step = 0;
      break;
  }
}


void setup() {
  // 初始化串口通信
  Serial.begin(115200);
  // 初始化与底板通信的串口
  Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
  sonarServo.attach(IO_Servo);         //设定舵机控制io口
  sonarServo.write(90); 
  delay(200); //等待底板初始化完毕
  sonarServo.detach();
  // 初始化机器人姿态
  Controller.runActionGroup(0 , 1);
  delay(1500);
  Serial.println("start.");
}

void loop() {
  find_(); //寻找宝盒任务
  delay(100);  //注意需要给相应的延时
}
