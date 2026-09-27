---
doc_id: asrcontrol-3c756e56b3
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/语音交互项目课程/语音控制/ASRcontrol/ASRcontrol.ino
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

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例

void ASRrunAction()
{
  unsigned char result;
  static bool have_move = true;
  // 获取识别结果
  result = hwsensor.asrGetResult();
  // 若无动作进行
  if(!Controller.isRunning()){
    // 若有识别结果
    if(result)
    {
      Serial.print("ASR result is:");
      Serial.println(result);//返回识别结果，即识别到的词条编号
      if(result==0x71) //扭腰
      {
        Controller.runActionGroup(50, 1);
      }
      else if(result==0x72) //仰卧起坐
      {
      Controller.runActionGroup(8, 1); 
      }
      else if(result==0x73) //鞠躬
      {
      Controller.runActionGroup(10, 1); 
      }
      else if(result==0x74) //大鹏展翅
      {
        Controller.runActionGroup(17, 1); 
      }
      else if(result==0x75) //招手
      {
        Controller.runActionGroup(9, 1); 
      }
      else if(result==0x76) //原地踏步
      {
        Controller.runActionGroup(49, 1);
      }
      else if(result==0x01) //前进
      {
        Controller.runActionGroup(18, 1);
        Controller.waitForStop(2000);
        Controller.runActionGroup(21, 3); 
        Controller.waitForStop(5000);
        Controller.runActionGroup(18, 1);
        Controller.waitForStop(2000);
        Controller.runActionGroup(19, 1);
      }
      else if(result==0x02) //后退
      {
        Controller.runActionGroup(18, 1);
        Controller.waitForStop(2000);
