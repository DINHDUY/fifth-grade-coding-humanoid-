---
chunk_id: iot-tonybot-68b252073b-chunk-001
doc_id: iot-tonybot-68b252073b
title: "/**************************************************************"
semantic_key: "/**************************************************************"
keywords: ["raw", "github", "hiwonder-tonybot", "arduino", "iot", "iot_tonybot", "ino"]
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
  // 设置Wifi名称和密码
  uint8_t wifi_name[30] = "NIOT_Tonybot|||12345678$$$";
  hwsensor.wifi_send(wifi_name , 30);
  // 初始化视觉模块
  cam.begin();
  // 初始化蜂鸣器
  buzzer_obj.init(IO_BUZZER);
  // 初始化与底板通信的串口
  Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
  // 初始化舵机
  sonarServo.attach(IO_Servo); //设定舵机控制io口
  sonarServo.write(90); //旋转到90度
  delay(200); //等待底板初始化完毕
  // 初始化机器人姿态
  Controller.runActionGroup(0 , 1); 
  delay(2000);
  // 初始化IMU
  imu.begin();
  delay(5000); //等待IMU初始化完成
  // 蜂鸣器鸣响1声
  buzzer_obj.blink(1500 , 100 , 100 , 1);
  Serial.println("start.");
  // 获取ESP32视觉模块的功能类型
  esp32s3_type = ESP32S3Cam_type();
}


void loop() {
  Controller.receiveHandle();  //接收处理函数，从串口接收缓存中取出数据
  wifi_receive_Task(); //WiFi接收任务
  sensor_Task(); //传感器任务
  delay(50);  //注意需要给相应的延时
}

/*WiFi接收任务*/
void wifi_receive_Task(void)
{
  static uint8_t array_index = 0;
  static uint8_t num = 0;
  uint8_t index = 0;
  // 判断使用哪个数组来接收数据
  if(array_index == 0){
    array_index = 1;
  }else{
    array_index = 0;
  }
  // 读取WiFi数据
  num = hwsensor.wifi_read(read_data[array_index] , 20);
  // 判断WiFi是否有新的数据
  if(compare_data(&read_data[0][4] , &read_data[1][4] , 15) != 0) //有数据
  {
    // 将WiFi数据转换为string类型
    String data;
    for(int i = 0 ; i < 20 ; i++){
      data += (char)read_data[array_index][i];
    }
    // 解析数据
    if(data.startsWith("CMD") && data.endsWith("$")) //进行数据校验
    {
      data = data.substring(data.indexOf('|') + 1,data.indexOf('$'));
      while(data.indexOf("|") != -1){
        rec_data[index] = data.substring(0, data.indexOf('|')).toInt(); //提取数据字符串并转换为int类型
        data = data.substring(data.indexOf('|') + 1);
        index++;
      }
      // 使用第一个数据来判断控制功能类型
      switch(rec_data[0]){
        // 人脸检测、不明物体检测、不明物体撞击检测功能
        case 1:{
          if(index == 4)
          {
            onoff_face = rec_data[1];
            onoff_undef_obj = rec_data[2];
            onoff_hit = rec_data[3];
          }
        }break;
        // 颜色检测功能
        case 2:{
          if(index == 2)
          {
            onoff_color_detec = rec_data[1];
          }
        }break;
        // 超声波测距功能
        case 3:{
          if(index == 2)
          {
            onoff_distance = rec_data[1];
          }
        }break;
        // 超声波颜色变化
        case 4:{
          if(index == 4)
          {
            hwsensor.ultrasoundColor(rec_data[1] , rec_data[2] , rec_data[3] , rec_data[1] , rec_data[2] , rec_data[3]);
          }
        }break;
        // 报警功能
        case 5:{
          if(index == 2)
          {
            if(rec_data[1] != 0)
            {
              buzzer_obj.blink(1500 , 400 , 500 , 0);
            }else{
              buzzer_obj.blink(1500 , 0 , 500 , 0);
            }
          }
        }break;
        // 动作组控制
        case 6:{
          static uint8_t last_action = 0;
          if(index == 3)
          {
            if(!Controller.isRunning())
            {
              // 若上次为下蹲姿态
              if(last_action == 16 || last_action == 30 || last_action == 77)
              {
                // 这次还是下蹲姿态动作
                if(rec_data[2] == 16 || rec_data[2] == 30 || rec_data[2] == 77)
                {
                  Controller.runActionGroup(rec_data[2] , 1);
                }else{
                  Controller.runActionGroup(19 , 1); //执行快速立正
                  delay(600);
                  Controller.runActionGroup(rec_data[2] , 1);
                }
              }else{
                Controller.runActionGroup(rec_data[2] , 1);
              }
              last_action = rec_data[2];
            }
          }
        }break;
        // 视觉模块类型询问
        case 7:{
          Serial.println("type");
          sprintf((char*)wifi_send_data , "CMD|7|%d|$", esp32s3_type);
          hwsensor.wifi_send(wifi_send_data , 20);
        }
      }
    }
  }
}

/*传感器任务*/
void sensor_Task(void)
{
  /* ESP32S3视觉模块检测 */
  // 若为人脸检测
  if(esp32s3_type == 1)
  {
    // 判断是否开启
    if(onoff_face != 0)
    {
      // 检测人脸
      if(cam.faceDetect())
      {
        warn_face = 1;
      }else{
        warn_face = 0;
      }
    }else{
      warn_face = 0;
    }
  }else if(esp32s3_type == 2) //若为颜色检测
  {
    // 判断是否开启
    if(onoff_color_detec != 0)
    {
      // 检测颜色
      color_detec_num = cam.colorDetect();
    }else{
      color_detec_num = 0;
    }
  }

  /* 超声波测距 */
  sensor_distance = hwsensor.ultrasoundGetDistance();
  //不明物体检测
  if(onoff_undef_obj != 0) 
  {
    if(sensor_distance < 200)
    {
      warn_undef_obj = 1;
    }else{
      warn_undef_obj = 0;
    }
  }else{
    warn_undef_obj = 0;
  }

  // 不明物体撞击检测
  if(onoff_hit != 0)
  {
    imu.get_angle(&roll , &pitch);
    if(roll < 70 || roll > 110)
    {
      warn_hit = 1;
    }else{
      warn_hit = 0;
    }
  }else{
    warn_hit = 0;
  }

  // 预警状态发送
  static uint32_t last_time = 0;
  static uint8_t step = 0;
  if(millis() > last_time)
  {
    last_time = millis() + 50;
    switch(step)
    {
      // 发送人脸检测、不明物体检测、不明物体撞击检测的状态
      case 0:{
        sprintf((char*)wifi_send_data, "CMD|1|%d|%d|%d|$" , warn_face , warn_undef_obj , warn_hit);
        hwsensor.wifi_send(wifi_send_data , 20);
        step = 1;
      }break;
      // 发送超声波检测的距离
      case 1:{
        sprintf((char*)wifi_send_data, "CMD|3|%d|$" , sensor_distance/10);
        hwsensor.wifi_send(wifi_send_data , 20);
        step = 2;
      }break;
      // 发送颜色检测数据
      case 2:{
        sprintf((char*)wifi_send_data, "CMD|2|%d|$" , color_detec_num);
        hwsensor.wifi_send(wifi_send_data , 20);
        step = 0;
      }
      default:{
        step = 0;
      }break;
    }
  }
}
