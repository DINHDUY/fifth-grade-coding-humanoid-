---
doc_id: tonybot-base-8ff2ba8231
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/串口通信实操课程/Tonybot_base/Tonybot_base.ino
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

#define UartRx IO_27
#define UartTx IO_19

#define TBSerial Serial1 //Tonybot通信串口

LobotServoController Controller(Serial2); //实例化二次开发通信库
IMU imu;  //实例化IMU控制对象
Buzzer_t buzzer_obj; //实例化蜂鸣器控制对象
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //实例化超声波云台舵机控制类

// 接收解析缓冲区
int16_t rec_data[2];
// 发送缓冲区
char buffer[30];
int16_t distance;
String IMUData[2];
float radianX;
float radianY;

/*串口通信任务*/
void uart_Task(void)
{
  uint8_t index = 0;
  // 若有接收到数据
  while (TBSerial.available() > 0) {
    String cmd = TBSerial.readString(); //读取串口数据
    if(cmd.startsWith("CMD") && cmd.endsWith("$")){ //进行数据校验
      cmd = cmd.substring(cmd.indexOf('|') + 1,cmd.indexOf('$'));
      while(cmd.indexOf("|") != -1){
        rec_data[index] = cmd.substring(0, cmd.indexOf('|')).toInt(); //提取数据字符串并转换为int类型
        cmd = cmd.substring(cmd.indexOf('|') + 1);
        index++;
      }
      switch(rec_data[0]){
        case 1: //动作组调用
          if(index == 2){
            Controller.runActionGroup(rec_data[1], 1); //执行动作组
            uint16_t timeout = 10000;  //动作组运行超时时间
            timeout += millis();
            while(Controller.isRunning()){  //等待动作组运行结束
              if(timeout < millis()){
                  break;
               }
              Controller.receiveHandle();
            }
          }
          break;

        case 2: //头部舵机控制
          if(index == 2){
            sonarServo.attach(IO_Servo);
            sonarServo.write(rec_data[1]);
            delay(200);
            sonarServo.detach();
          }
          break;

        case 3: //电池电量读取
          if(index == 1){
            Controller.sendCMDGetBatteryVolt();  //发送读取电压命令
            delay(200);
            Controller.receiveHandle();
            sprintf(buffer, "CMD|%d|%d|$",rec_data[0],Controller.getBatteryVolt());
            TBSerial.print(buffer); //发送读取的电池电量
          }
          break;

        case 4: //超声波数据
          if(index == 1){
            distance = hwsensor.ultrasoundGetDistance();
            sprintf(buffer, "CMD|%d|%d|$",rec_data[0],distance > 0 ? distance : -1);
            TBSerial.print(buffer); //发送读取的超声波数据
          }
          break;

        case 5: //IMU数据
          if(index == 1){
            imu.get_angle(&radianY , &radianX);
            sprintf(buffer, "CMD|%d|%s|%s|$",rec_data[0],String(radianX).c_str(),String(radianY).c_str());
            TBSerial.print(buffer);
          }
          break;
      }
    }
  }
}

void setup() {
  Serial.begin(9600);
  // 初始化IMU
  imu.begin();
  // 初始化蜂鸣器
  buzzer_obj.init(IO_BUZZER);
  // 初始化与底板通信的串口
  Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
  // 初始化通信串口
  TBSerial.begin(9600 , SERIAL_8N1 , UartRx , UartTx);
  sonarServo.attach(IO_Servo);         //设定舵机控制io口
  sonarServo.write(90); 
  delay(200); //等待底板初始化完毕
  sonarServo.detach();
  // 初始化机器人姿态
  Controller.runActionGroup(0 , 1);
  delay(1500);
  delay(2000); //等待IMU初始化完成
  buzzer_obj.blink(1500 , 100 , 100 , 1);
  Serial.println("start.");
}

void loop() {
  Controller.receiveHandle();  //接收处理函数，从串口接收缓存中取出数据
  uart_Task(); //串口通信控制任务
  delay(50);  //注意需要给相应的延时
}
