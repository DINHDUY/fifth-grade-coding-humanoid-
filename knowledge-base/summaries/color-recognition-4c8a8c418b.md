---
doc_id: color-recognition-4c8a8c418b
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI视觉项目课程/颜色识别/color_recognition/color_recognition.ino
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
#include "hw_esp32cam_ctl.h" //导入ESP32Cam通讯库
#include "src/WMMatrixLed/WMMatrixLed.h"

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例

#define DIN IO_2  //定义DIN
#define CLK IO_5 //定义CLK
WMMatrixLed mx(CLK , DIN);

//ESP32Cam通讯对象
HW_ESP32Cam hw_cam;

void setup() {
  // 初始化串口通信
  Serial.begin(115200);
  // 初始化与底板通信的串口
  Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
  sonarServo.attach(IO_Servo);         //设定舵机控制io口
  sonarServo.write(90); 
  delay(200); //等待底板初始化完毕
  sonarServo.detach(); //失能舵机接口
  // 初始化机器人姿态
  Controller.runActionGroup(0 , 1);
  delay(1500);
  mx.setColorIndex(1);//设置颜色
  mx.setBrightness(4);//设置亮度8级可调
  delay(2000);
  Serial.println("start.");
}

void loop() {
  Controller.receiveHandle();  //接收处理函数，从串口接收缓存中取出数据
  int res = 0;
  // 获取颜色检测数据
  res = hw_cam.colorDetect();

  switch(res)
  {
    // 无检测到
    case 0:
    {
      hwsensor.ultrasoundColor(0,0,0,0,0,0);
      mx.clearScreen();
    }break;
    // 检测到红色
    case 1:
    {
      //RED
      hwsensor.ultrasoundColor(250,0,0,250,0,0);
      char *str_data = "Red";
      int str_len = strlen(str_data); //获取字符长度
      for (int i = 16; i > -str_len*6; i-- ){ //滚动显示
        mx.drawStr(i,7,str_data);
        delay(40);//滚动速度
      }
      delay(200);
      // res = 2;
    }break;
    // 检测到绿色
    case 2:
    {
      //GREEN
      hwsens
