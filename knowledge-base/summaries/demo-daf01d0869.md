---
doc_id: demo-daf01d0869
title: "include \"Hiwonder.hpp\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.4 人脸识别/02 人脸识别程序/02 Tonybot人脸识别程序/demo/demo.ino
source_type: official
status: processed
---

# include "Hiwonder.hpp"

#include "Hiwonder.hpp"
#include "LobotServoController.h" //舵机控制器库
#include "base_config.h"
#include "tonybot_camera.h" //导入ESP32Cam通讯库
#include "HWSensor.h" //传感器库

Ultrasound_t ultrasound;
LobotServoController Controller(Serial2); //实例化二次开发通信库
Tonybot_Camera tonybot_camera;
HWSensor hwsensor;  //实例化传感器类

uint8_t read_code_val[CODE_DETECTION_STRING_LEN];
uint8_t read_face_val[4];
uint8_t read_color_val[4];

void face_detection() {
    if(tonybot_camera.face_data_receive(read_face_val, 4)) {   //人脸识别
        if(read_face_val[0] != 0) {
            Controller.runActionGroup(9, 1);
            delay(5000);
        }
        printf("[0]:%d\n", read_face_val[0]);
    }
}

void setup() {
    delay(200); //等待底板初始化完毕
    // sonarServo.attach(IO_Servo, 0);         //设定舵机控制io口
    Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
    Controller.runActionGroup(0 , 1);
    delay(1000);
    Serial.begin(115200);
    hwsensor.ultrasoundColor(0,0,0,0,0,0);
    tonybot_camera.begin();
}


void loop() {
    face_detection();
    delay(30);
}
