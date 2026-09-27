---
doc_id: iot-tonybot-68b252073b
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/IOT例程/IOT_Tonybot/IOT_Tonybot.ino
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

LobotServoController Controller(Serial2); //实例化二次开发通信库
IMU imu;  //实例化IMU控制对象
Buzzer_t buzzer_obj; //实例化蜂鸣器控制对象
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //实例化超声波云台舵机控制类
HW_ESP32Cam cam; //实例化ESP32S3视觉模块对象

// 视觉模块功能类型
uint8_t esp32s3_type = 0; // 1：face  2：color

void wifi_receive_Task(void);
void sensor_Task(void);

// 用于接收WIFI的数据
uint8_t read_data[2][20];
// 解析后的数据集
int16_t rec_data[5];

// 各个功能开启标志位
uint8_t onoff_face = 0;
uint8_t onoff_undef_obj = 0;
uint8_t onoff_hit = 0;
uint8_t onoff_color_detec = 0;
uint8_t onoff_distance = 0;

// 用于保存各个功能触发标志位和数据
uint8_t warn_face = 0;
uint8_t warn_undef_obj = 0;
uint8_t warn_hit = 0;
uint8_t color_detec_num = 0;
uint16_t sensor_distance = 0;
float roll = 0, pitch = 0;

// WiFi发送缓冲区
uint8_t wifi_send_data[20];

/*确定ESP32S3Cam的功能类型*/
int ESP32S3Cam_type(void)
{
  uint8_t color_data[4];
  cam.color_position(color_data); //修改为访问的颜色3
  //若获取到的数据都为0xFF（即255），即为人脸识别程序
  if(color_data[0] == 255 && color_data[1] == 255) 
  {
    Serial.println("type:face");
    return 1;
  }else{
    Serial.println("type:color");
    return 2;
  }
}

/*比较数组函数*/
int compare_data(uint8_t arr1[], uint8_t arr2[], uint8_t num) {
    for (int i = 0; i < num; i++) {
        if (arr1[i] != arr2[i]) {
            return -1;
        }
    }
    return 0;
}

void setup() {
  // 初始化串口通信
  Serial.begin(115200);
  delay(200);
