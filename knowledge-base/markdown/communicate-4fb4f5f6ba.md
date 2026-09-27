---
doc_id: communicate-4fb4f5f6ba
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/语音交互项目课程/人机互动/Communicate/Communicate.ino
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

void communicate()
{
  unsigned char result;
  static bool have_move = true;

  delay(1);
  result = hwsensor.asrGetResult();  //获取语音识别模块数据
  if(result)
  {
    Serial.print("ASR result is:");
    Serial.println(result);

    if(result==0x1A) //你好
    {
      Controller.runActionGroup(10, 1);
      delay(1000);
    }
    else if(result==0x1B) //介绍自己
    {
      Controller.runActionGroup(48, 1);
      delay(4000);
    }
    
    else if(result==0x1C) //露一手
    {
      delay(500);
      Controller.runActionGroup(17, 1);
      delay(10000);
    }
    else if(result==0x1D) //走两步
    {
      delay(500);
      Controller.runActionGroup(18, 1);
      Controller.waitForStop(2000);
      Controller.runActionGroup(21, 3); 
      Controller.waitForStop(5000);
      Controller.runActionGroup(18, 1);
      Controller.waitForStop(2000);
      Controller.runActionGroup(19, 1);
    }
    else if(result==0x1E) //摇头
    {
      sonarServo.attach(IO_Servo);
      delay(1000);
      sonarServo.write(135);
      delay(400);
      sonarServo.write(45);
      delay(400);
      sonarServo.write(135);
      delay(400);
      sonarServo.write(90);
      delay(400);
      sonarServo.detach();
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
  communicate();  //语音识别函数
  delay(50);  //注意需要给相应的延时
}
