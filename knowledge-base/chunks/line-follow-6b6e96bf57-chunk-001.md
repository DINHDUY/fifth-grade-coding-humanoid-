---
chunk_id: line-follow-6b6e96bf57-chunk-001
doc_id: line-follow-6b6e96bf57
title: "include \"base_config.h\""
semantic_key: "include \"base_config.h\""
keywords: ["include", "base_config", "raw", "github", "hiwonder-tonybot", "arduino", "line_follow", "ino"]
---

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
        if(s3_camera.red_block_detection(read_val, 4)) {
            body_follow(read_val[0]);
        }

        if(s3_camera.blue_block_detection(read_val, 4)) {
            if(read_val[1] >= 120) {
                stage = STAGE_WIATING;
                delay(500);
                tickstart1 = millis();
                tickstart2 = millis();
            }
        }
        break;

    case STAGE_WIATING:
        Serial.println("find yellow ");
        if(millis() - tickstart1 >= 1000) {
            WonderLLM_Request_Vision(vison_prompt);
            tickstart1 = millis();
        }

        if(millis() - tickstart2 >= 50) {
            WonderLLM_Info_Get(&WonderLLM_hiwonder); 
            if(WonderLLM_hiwonder.Frame_mode != Frame_NULL) {
                sprintf(info,"raw str:%s\r\n",WonderLLM_hiwonder.json_data_raw);
                if (strstr(WonderLLM_hiwonder.json_data_raw, "true") != NULL) {
                    Serial.println("find green light");
                    Serial.print(info);
                    stage = STAGE_CUSTOM;
                    // Controller.runActionGroup(1,3);
                    // delay(2800);
                    // Controller.runActionGroup(34,12);
                    // delay(12000);
                    Controller.runActionGroup(1,4);
                    delay(4000);
                    // Controller.runActionGroup(0,1);
                }
                memset(WonderLLM_hiwonder.json_data_raw,0,sizeof(WonderLLM_hiwonder.json_data_raw));
            }
            tickstart2 = millis();
        }
        break;

    case STAGE_CUSTOM:
        Serial.println("line follow end");
        Controller.runActionGroup(0,1);
        stage = STAGE_LINETRACKING;
        Serial.println("restart line follow");
        break;
  }


    
//   tonybot_camera.blue_block_detection(&red_val[4], 4);

//   Serial.printf("%d, %d, %d, %d\n", red_val[0], red_val[1], red_val[4], red_val[5]);
//   res = hw_cam.color_position(result);
//   //若获取到新的消息
//   if( res == true)
//   {
//     Serial.println("res");
//     res = false;
//     // 计算x中心
//     uint8_t x = result[0]+result[2]/2;
//     body_follow(x);
//   }
  delay(20);  //注意需要给相应的延时
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
    case 0:
      // 在中间，直走
      if(x > LEFT_MIN && x < RIGHT_MAX)
      {
        Controller.runActionGroup(GO_STRAIGHT, 1);
        delay(850);
      }else if(0 < x && x < LEFT_MIN){ // 左偏，左转
        Controller.runActionGroup(TURN_LEFT, 2);
        delay(2700);
        step = 1;
      }else{ //右偏
        Controller.runActionGroup(TURN_RIGHT, 2);  //转到右边
        delay(2850);
        step = 2;
      }
      break;
    case 1: //左偏
      if(0 < x && x < LEFT_MIN) //未调整
      {
        Controller.runActionGroup(TURN_LEFT, 1);
        delay(1350);
      }else{
        Controller.runActionGroup(GO_STRAIGHT, 1);
        delay(900);
        step = 0;
      }
      break;
    case 2: //右偏
      if(x > RIGHT_MAX)
      {
        Controller.runActionGroup(TURN_RIGHT, 1);  //转到右边
        delay(1450);
      }else{
        Controller.runActionGroup(GO_STRAIGHT, 1);
        delay(900);
        step = 0;
      }
      break;
    default:
      {
        step = 0;
      }break;
  }
}
