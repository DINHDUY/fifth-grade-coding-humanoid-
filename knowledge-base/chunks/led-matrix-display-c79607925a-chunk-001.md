---
chunk_id: led-matrix-display-c79607925a-chunk-001
doc_id: led-matrix-display-c79607925a
title: "/**************************************************************"
semantic_key: "/**************************************************************"
keywords: ["raw", "github", "hiwonder-tonybot", "arduino", "led_matrix_display", "ino"]
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
#include "src/WMMatrixLed/WMMatrixLed.h"

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例

#define DIN IO_2  //定义DIN
#define CLK IO_5 //定义CLK
// 初始化点阵对象
WMMatrixLed mx(CLK , DIN);

uint16_t getDistance() {       //获得距离
  uint16_t Distance = 0;
  uint16_t distance1, distance2, distance3;
  distance1 = hwsensor.ultrasoundGetDistance();
  distance2 = hwsensor.ultrasoundGetDistance();
  distance3 = hwsensor.ultrasoundGetDistance();

  Distance = (distance1 + distance2 + distance3)/3;
  return Distance;
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
  mx.setColorIndex(1);//设置颜色
  mx.setBrightness(4);//设置亮度8级可调
  delay(1500);
  Serial.println("start.");
}

void loop() {
  // 获取超声波检测距离
  int distance = getDistance();
  distance = distance > 1000 ? 1000 : distance;
  int color_diff = distance > 350 ? 350 : distance;
  color_diff = color_diff / 1.4;
  // 根据距离显示颜色
  hwsensor.ultrasoundColor(250-color_diff , color_diff , 0 ,250-color_diff , color_diff , 0);
  // 将距离显示在点阵上
  mx.showNum(distance);
  delay(200);  //注意需要给相应的延时
}
