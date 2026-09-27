---
doc_id: sonar-3e984db15b
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/摇头避障/Sonar/Sonar.ino
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

#define GO_FORWARD  21     /*直走的动作组*/
#define GO_BACK     22     /*后退动作组*/
#define TURN_LEFT   23     /*左转动作组*/
#define TURN_RIGHT  24     /*右转动作组*/

#define MIN_DISTANCE_TURN 150  /*避障距离，就是小于多少距离的时候进行避障*/
#define BIAS 0        /*舵机偏差，根据实际情况调整大小以使超声波朝向正前方 -右 +左*/

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例


int getDistance() {       //获得距离
  uint16_t Distance, distance1, distance2, distance3;
  distance1 = hwsensor.ultrasoundGetDistance();
  distance2 = hwsensor.ultrasoundGetDistance();
  distance3 = hwsensor.ultrasoundGetDistance();
  Distance = (distance1 + distance2 + distance3)/3;
  return Distance;
}


uint16_t gDistance;    //全局变量，用于存储中间位置超声波测得的距离
uint16_t gLDistance;   //用于存储机器人左侧测得的距离
uint16_t gRDistance;   //用于存储机器人右侧测得的距离
void getAllDistance()//获得前及左右三个方向的距离
{
  uint16_t tDistance;     //用于暂存测得距离
  
  hwsensor.ultrasoundColor(0, 50, 50, 0, 50, 50); //蓝绿混
  sonarServo.write(90 + BIAS);   //超声波云台舵机转到90度即中间位置
  delay(100);                    //等待100ms，等待舵机转动到位
  delay(100);
  gDistance = getDistance();     //测量距离，保存到全局变脸gDistance
  
  sonarServo.write(145 + BIAS);  //超声波云台舵机转到130度位置即机器人左面40度位置
  delay(400);     
  delay(100);//延时，等待舵机转动到位
  tDistance = getDistance();     //测量距离，保存到 tDistance
  
  sonarServo.write(180 + BIAS);  //转动到170度，即机器人左侧80度位置
  delay(400); 
  delay(100);//延时，等待舵机转动到位
  gLDistance
