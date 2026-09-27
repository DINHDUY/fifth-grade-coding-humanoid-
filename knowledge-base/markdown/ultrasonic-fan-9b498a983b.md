---
doc_id: ultrasonic-fan-9b498a983b
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/智能风扇/ultrasonic_fan/ultrasonic_fan.ino
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

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例

uint16_t getDistance() {       //获得距离
  uint16_t Distance = 0;
  uint16_t distance1, distance2, distance3;
  distance1 = hwsensor.ultrasoundGetDistance();
  distance2 = hwsensor.ultrasoundGetDistance();
  distance3 = hwsensor.ultrasoundGetDistance();
  Distance = (distance1 + distance2 + distance3)/3;
  return Distance;
}

//风扇停:0 风扇正转:1  风扇反转:2
void set_fan(int flag)
{
  switch(flag)
  {
    case 0:
      digitalWrite(IO_32, LOW);
      digitalWrite(IO_33, LOW);
      break;
    case 1:
      digitalWrite(IO_32, LOW);
      digitalWrite(IO_33, HIGH);
      break;
    case 2:
      digitalWrite(IO_32, HIGH);
      digitalWrite(IO_33, LOW);
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
  // 初始化风扇接口
  pinMode(IO_32, OUTPUT);
  pinMode(IO_33, OUTPUT);
  // 初始化机器人姿态
  Controller.runActionGroup(0 , 1);
  delay(1500);
  Serial.println("start.");
}

void loop() {
  if(getDistance() < 300) //若距离<300mm
  {
    hwsensor.ultrasoundColor(0,250,0,0,250,0);
    Controller.moveServo(16, 670, 500);
    delay(500);
    //风扇开启
    set_fan(1);
    while(true)
    {
      delay(50);
      if(getDistance() > 300)
      {
        hwsensor.ultrasoundColor(0,0,250,0,0,250);
        // 风扇关闭
        set_fan(0);
        delay(500);
        Controller.moveServo(16, 275, 500);
        delay(500);
        break;
      }
    }
  }
  delay(100);  //注意需要给相应的延时
}
