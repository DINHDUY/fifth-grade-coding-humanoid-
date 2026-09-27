---
doc_id: touch-action-abfe1ed638
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/触摸控制/touch_action/touch_action.ino
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

#define Touch_pin IO_19

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例

void setup() {
  // 初始化串口通信
  Serial.begin(115200);
  // 初始化与底板通信的串口
  Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
  sonarServo.attach(IO_Servo);         //设定舵机控制io口
  sonarServo.write(90); 
  delay(200); //等待底板初始化完毕
  sonarServo.detach();
  // 初始化触摸接口
  pinMode(Touch_pin , INPUT);
  // 初始化机器人姿态
  Controller.runActionGroup(0 , 1);
  delay(1500);
  Serial.println("start.");
}

bool enter_flag = false;

void loop() {
  // 若触摸了
  if(digitalRead(Touch_pin) == LOW)
  {
    // 消抖
    delay(20);
    if(digitalRead(Touch_pin) == LOW)
    {
      enter_flag = true;
    }
  }
  // 若确认按下了
  if(enter_flag == true)
  {
    enter_flag = false;
    Controller.runActionGroup(10, 1);
    delay(4000);
  }
  delay(50);  //注意需要给相应的延时
}
