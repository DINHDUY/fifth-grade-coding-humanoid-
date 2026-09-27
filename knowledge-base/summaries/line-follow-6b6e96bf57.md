---
doc_id: line-follow-6b6e96bf57
title: "include \"base_config.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型应用课程/02 智慧交通行驶程序/line_follow/line_follow.ino
source_type: official
status: processed
---

# include "base_config.h"

#include "base_config.h"
#include "HardwareSerial.h" //串口库
#include "LobotServoController.h" //舵机控制器库
#include "Arduino.h"
#include "HWSensor.h" //传感器库
#include "Hiwonder.hpp"
#include "hw_esp32cam_ctl.h" //导入ESP32Cam通讯库
#include "tonybot_camera.h" //导入ESP32Cam通讯库
#include "WonderLLM.h"

#define TURN_RIGHT  66     /*右转动作组 24 35 4*/
#define TURN_LEFT   65     /*左转动作组 23 34 3 */
#define GO_STRAIGHT 63     /*直走动作 21*/
#define RETREAT     22     /*后退动作*/
#define TRANSITION  18     /*过渡动作（右倾）*/

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
// Servo sonarServo; //超声波云台舵机控制类实例

//ESP32Cam通讯对象
HW_ESP32S3Cam s3_camera;
Tonybot_Camera tonybot_camera;

typedef enum {
    STAGE_LINETRACKING,
    STAGE_WIATING,
    STAGE_CUSTOM
}Stage_t;

uint8_t read_val[8]  ={0};

const uint16_t LEFT_MIN = 240 / 2 - 40;    //左临界值
const uint16_t RIGHT_MAX = 240 / 2 + 40;   //右临界值

uint32_t tickstart1 = 0;
uint32_t tickstart2 = 0;

static char info[128];
const char vison_prompt[] = "识别前方画面,如果前方有信号灯且信号灯亮绿灯就只返回true,没有就只返回false,不要返回任何其他信息";

Stage_t stage = STAGE_LINETRACKING;

void setup() {
  // 初始化串口通信
  tonybot_camera.begin();
  s3_camera.begin();
  Serial.begin(115200);
  // 初始化与底板通信的串口
  Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
//   sonarServo.attach(IO_Servo);         //设定舵机控制io口
//   sonarServo.write(90); 
  delay(200); //等待底板初始化完毕
  WonderLLM_Init(); //初始化WonderLLM模块	
  delay(13000);
  // 初始化机器人姿态
  Controller.runActionGroup(0 , 1);
  delay(1500);
  hwsensor.ultrasoundColor(0,0,0,0,0,0);
  Serial.println("start.");
}

uint8_t result[4];
bool res = false;

void loop() {
  // Controller.receiveHandle();  //接收处理函数，从串口接收缓存中取出数据
  switch(stage) {
    case STAGE_LINETRACKING:
        Serial.println("find black ");
        if(s3_camera.red_bloc
