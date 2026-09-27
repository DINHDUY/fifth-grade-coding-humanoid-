---
doc_id: temperature-humidity-e980c372a4
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/温湿度检测/temperature_humidity/temperature_humidity.ino
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
#include "src/WMMatrixLed/WMMatrixLed.h"
#include "MVstring.h"

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例

#define DIN IO_2  //定义DIN
#define CLK IO_5 //定义CLK
// 实例化点阵对象
WMMatrixLed mx(CLK , DIN);

int temperature , humidity;
uint32_t last_time = 0;
uint8_t step = 0;
uint8_t t_str[] = {0x40,0x1C,0x22,0x22}; //摄氏度符号
uint8_t b_str[] = {0x64,0x68,0x16,0x26}; //百分号

uint8_t send_data[16];

void setup() {
  // 初始化串口通信
  Serial.begin(115200);
  // 初始化与底板通信的串口
  Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
  sonarServo.attach(IO_Servo); //设定舵机控制io口
  sonarServo.write(90);
  delay(200); //等待底板初始化完毕
  // 初始化机器人姿态
  Controller.runActionGroup(0 , 1);
  delay(1500);
  mx.setColorIndex(1);//设置颜色
  mx.setBrightness(4);//设置亮度8级可调
  Serial.println("start.");
}


void loop() {
  Controller.receiveHandle();  //接收处理函数，从串口接收缓存中取出数据
  if(millis() > last_time)
  {
    last_time = millis() + 2000;
    switch(step)
    {
      case 0:{ //温度显示
        // 获取温度
        temperature = hwsensor.getTemperature();
        // 显示十位
        uint8_t index = temperature/10;
        if(index == 0){
          memcpy(&send_data[1] , nums[10] , 4);
        }else{
          memcpy(&send_data[1] , nums[index] , 4);
        }
        // 显示个位
        index = temperature%10;
        memcpy(&send_data[6] , nums[index] , 4);
        memcpy(&send_data[11] , t_str , 4);
        mx.drawBitmap(0,0,16,send_data);
        Serial.println((int)temperature);
        step = 1;
      }break;
      case 1:{ //湿度显示
        // 获取温度
        humidity = hwsensor.getHumidity();
        // 显示十位
        uint8_t index = humidity/10;
        if(index == 0){
          memcpy(&send_data[1] , nums[10] , 4);
        }else{
          memcpy(&send_data[1] , nums[index] , 4);
        }
        // 显示个位
        index = humidity%10;
        memcpy(&send_data[6] , nums[index] , 4);
        memcpy(&send_data[11] , b_str , 4);
        mx.drawBitmap(0,0,16,send_data);
        Serial.println((int)humidity);
        step = 0;
      }break;
      default:{
        step = 0;
      }break;
    }
  }
  delay(50);  //注意需要给相应的延时
}
