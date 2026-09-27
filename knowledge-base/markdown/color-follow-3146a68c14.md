---
doc_id: color-follow-3146a68c14
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI视觉项目课程/头部颜色追踪/color_follow/color_follow.ino
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
#include "hw_esp32cam_ctl.h" //导入ESP32Cam通讯库

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例

//ESP32Cam通讯对象
HW_ESP32Cam hw_cam;

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
  sonarServo.attach(IO_Servo);         //设定舵机控制io口
  sonarServo.write(90); 
  delay(200); //等待底板初始化完毕
  Controller.runActionGroup(0 , 1);
  delay(1500);
  hwsensor.ultrasoundColor(0,0,0,0,0,0);
  delay(2000);
  Serial.println("start.");
}

// 左边界阈值
const uint8_t left = 90;
// 右边界阈值
const uint8_t right = 150;
// 转动角度步长
uint8_t dev = 1;
// 数据缓冲区
uint8_t result[4];
// 舵机角度
uint8_t angle = 90;

void loop() {
  Controller.receiveHandle();  //接收处理函数，从串口接收缓存中取出数据
  // 获取识别结果
  bool res = hw_cam.color_position(result);
  if(res)
  {
    // 计算x中心
    uint8_t x = result[0] + result[2]/2;
    Serial.println(x);
    // 若偏右
    if(x > right)
    {
      dev = (x - right)*0.04;
      angle = (angle - dev) < 0 ? 0 : (angle - dev);
    }else if(x < left) //若偏左
    {
      dev = (left - x)*0.04;
      angle = (angle + dev) > 180 ? 180 : (angle + dev);
    }
    // 设置舵机角度
    sonarServo.write(angle);
  }
  delay(100);  //注意需要给相应的延时
}
