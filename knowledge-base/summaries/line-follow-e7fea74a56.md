---
doc_id: line-follow-e7fea74a56
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI视觉项目课程/视觉巡线/line_follow/line_follow.ino
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

#define TURN_RIGHT  66     /*右转动作组 24 35 4*/
#define TURN_LEFT   65     /*左转动作组 23 34 3 */
#define GO_STRAIGHT 63     /*直走动作 21*/
#define RETREAT     22     /*后退动作*/
#define TRANSITION  18     /*过渡动作（右倾）*/

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例

//ESP32Cam通讯对象
HW_ESP32Cam hw_cam;

const uint16_t LEFT_MIN = 300 / 2 - 40;    //左临界值
const uint16_t RIGHT_MAX = 300 / 2 + 40;   //右临界值

void setup() {
  // 初始化串口通信
  Serial.begin(115200);
  // 初始化与底板通信的串口
  Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
  sonarServo.attach(IO_Servo);         //设定舵机控制io口
  sonarServo.write(90); 
  delay(200); //等待底板初始化完毕
  // 初始化机器人姿态
  Controller.runActionGroup(0 , 1);
  delay(1500);
  hwsensor.ultrasoundColor(0,0,0,0,0,0);
  delay(2000);
  Serial.println("start.");
}

uint8_t result[4];
bool res = false;

void loop() {
  // Controller.receiveHandle();  //接收处理函数，从串口接收缓存中取出数据
  res = hw_cam.color_position(result);
  //若获取到新的消息
  if( res == true)
  {
    Serial.println("res");
    res = false;
    // 计算x中心
    uint8_t x = result[0]+result[2]/2;
    body_follow(x);
  }
  delay(100);  //注意需要给相应的延时
}

/* 
 *  机体运动函数
 *  参数1：识别到的数据
 */
void body_follow(uint8_t x)
{
  static uint16_t flag = 0;
  static uint8_t step = 0;
  Serial.print(x);
  Serial.println(" ");
  switch(step)
  {
