---
doc_id: say-hello-dfe1c06736
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/语音交互项目课程/测距播报/say_hello/say_hello.ino
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

#define MIN_DISTANCE 200

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例

int getDistance() {  //获得超声波距离
  uint16_t distance1, distance2, distance3;
  distance1 = hwsensor.ultrasoundGetDistance();
  distance2 = hwsensor.ultrasoundGetDistance();
  distance3 = hwsensor.ultrasoundGetDistance();

  float distance = (distance1 + distance2 + distance3) / 3;
  return distance;
}


bool have_move = true;
void sonar() //用户函数
{
  float distance = getDistance();
  if (distance < MIN_DISTANCE && distance > 0)  //如果测得距离小于指定距离
  {
    have_move = true;
    hwsensor.ultrasoundColor(0, 0, 50, 0, 0, 50);  //设置发光超声波颜色为蓝色
    Controller.runActionGroup(9, 1);  //运行9号动作组
    delay(500);
    hwsensor.asr_speak(ASR_ANNOUNCER , 0x0F); // 你好，欢迎光临
    delay(2000);
  } else {
    if (have_move) {
      have_move = false;
      hwsensor.ultrasoundBreathing(0, 20, 0, 0, 20, 0); //设置发光超声波颜色为绿色渐变
      Controller.runActionGroup(0, 1); //运行0号动作组
    }
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
  sonar(); //用户函数
  delay(50);
