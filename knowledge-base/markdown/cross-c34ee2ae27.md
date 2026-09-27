---
doc_id: cross-c34ee2ae27
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/低空穿越/Cross/Cross.ino
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

#define H_STAND       0
#define L_STAND       30
#define H_GO_FORWARD  21
#define L_GO_FORWARD  31

#define MIN_DISTANCE 150//150mm

LobotServoController Controller(Serial2); //实例化二次开发通信库
Buzzer_t buzzer_obj; //初始化蜂鸣器
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例

float Distance = 0;   //全局变量，距离
int getDistance()
{
  uint16_t distance1, distance2, distance3;
  distance1 = hwsensor.ultrasoundGetDistance();
  distance2 = hwsensor.ultrasoundGetDistance();
  distance3 = hwsensor.ultrasoundGetDistance();
  Distance = (distance1 + distance2 + distance3)/3;
  return Distance;
}

void sonar()  //逻辑
{
  static uint8_t  step = 0;   //静态变量，用于记录步骤  
  uint8_t RGB[6];
  uint8_t breathing[6];
  uint8_t value;
  static uint32_t last_tick = 0;

  switch (step)  //根据步骤step做分支
  {
    case 0:   //步骤0
      if (Distance > MIN_DISTANCE || Distance == 0) //如果测到距离大于指定距离
      {  
        hwsensor.ultrasoundColor(0, 50, 0, 0, 50, 0); //绿色
        Controller.runActionGroup(18, 1);
        delay(400);
        step = 1;
      }
      break;
      
    case 1:
      if (Distance < MIN_DISTANCE  && Distance > 0) //如果测得距离小于指定距离
      {
        Controller.runActionGroup(18, 1);
        delay(2000);
        Controller.runActionGroup(19, 1);
        delay(2000);
        hwsensor.ultrasoundColor(50, 0, 0, 50, 0, 0); //红色
        buzzer_obj.blink(1500 , 100 , 100 , 1);
        Controller.runActionGroup(L_STAND, 1); //运行下蹲
        delay(1300);
        step = 2;  //转移到步骤2
      }else{
        Controller.runActionGroup(H_GO_FORWARD, 1); //正常前进
        delay(1200);
      }
      break;
    case 2: //步骤2
      if (Distance > MIN_DISTANCE  || Distance == 0) //距离大于指定的距离
      { 
        delay(500);
        hwsensor.ultrasoundColor(0, 0, 50, 0, 0, 50);
        Controller.runActionGroup(L_GO_FORWARD, 14);  //以下蹲姿态前进
        delay(28500);
        step = 3;
      }
      break;  //退出switch语句
    case 3: //步骤3  
      Controller.runActionGroup(L_STAND, 1); //运行下蹲
      delay(2000);
      delay(200);
      Controller.runActionGroup(H_STAND, 1);  //正常立正
      delay(2000);
      delay(200);
      step =  0;   //转动步骤0
      break;      
    default:
      step =  0;
      break;
  }
}


void setup() {
  // 初始化串口通信
  Serial.begin(115200);
  // 初始化蜂鸣器
  buzzer_obj.init(IO_BUZZER);
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
  getDistance();              //测量距离
  sonar();                    //逻辑实现
  delay(100);  //注意需要给相应的延时
}
