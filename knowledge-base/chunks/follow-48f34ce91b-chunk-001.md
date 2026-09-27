---
chunk_id: follow-48f34ce91b-chunk-001
doc_id: follow-48f34ce91b
title: "/**************************************************************"
semantic_key: "/**************************************************************"
keywords: ["raw", "github", "hiwonder-tonybot", "arduino", "follow", "ino"]
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

uint16_t Distance = 0;
uint16_t getDistance() {       //获得距离
  uint16_t distance1, distance2, distance3;
  distance1 = hwsensor.ultrasoundGetDistance();
  distance2 = hwsensor.ultrasoundGetDistance();
  distance3 = hwsensor.ultrasoundGetDistance();

  Distance = (distance1 + distance2 + distance3)/3;
  return Distance;
}


bool have_move = false;
/*定距行走任务*/
void Distancewalking()
{
  static uint8_t step = 0;
  static uint32_t last_tick = 0;
  if(millis() <= last_tick)
  {
    return;
  }
  switch(step) {
    case 0:
        // 若距离过近
        if (Distance > 30 && Distance < 180) {//亮红灯，执行过渡动作         
          hwsensor.ultrasoundColor(50, 0, 0, 50, 0, 0);  
          Controller.runActionGroup(18, 1);
          last_tick = millis()+350;
          have_move = true;
          step = 1;
        }
        // 若距离过远
        else if (Distance > 300 && Distance < 400) {//亮绿灯，执行过渡动作
          hwsensor.ultrasoundColor(0, 50, 0, 0, 50, 0);    
          Controller.runActionGroup(18, 1);  
          last_tick = millis()+400;
          have_move = true;
          step = 2;
        }
        else if (have_move) {
          step = 3;
        }
        else {
          hwsensor.ultrasoundColor(0, 0, 50, 0, 0, 50);            
        }
      break;
    case 1:
        if ((Distance > 30 && Distance < 180) || have_move) { //执行后退动作
          have_move = false;
          Controller.runActionGroup(22, 1);
          last_tick = millis()+1700;
        }
        else {
          step = 3;      
        }   
      break; 
    case 2:
        if ((Distance > 300 && Distance < 400) || have_move) { //执行前进动作
          have_move = false;
          Controller.runActionGroup(21, 1);
          last_tick = millis()+1300;
        }
        else {
          step = 3;      
        }   
      break;  
    case 3:
      Controller.runActionGroup(18, 1);//执行过渡动作
      Controller.waitForStop(2000);//等待动作执行完成，参数大于动作组执行的时间
      Controller.runActionGroup(19, 1);//执行快速立正动作
      hwsensor.ultrasoundColor(0, 0, 50, 0, 0, 50); 
      have_move = false;
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
  // 获取超声波测量距离
  getDistance();
  // 定距行走任务
  Distancewalking();
  delay(100);  //注意需要给相应的延时
}
