---
chunk_id: demo-f9e52e215f-chunk-001
doc_id: demo-f9e52e215f
title: "include \"Hiwonder.hpp\""
semantic_key: "include \"Hiwonder.hpp\""
keywords: ["include", "hiwonder", "hpp", "raw", "github", "hiwonder-tonybot", "arduino", "tonybot", "demo", "ino"]
---

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

void code_detection() {
    if(tonybot_camera.code_data_detection(read_code_val, sizeof(read_code_val))) {   //二维码
        char code_val[read_code_val[0]];

        memcpy(code_val, &read_code_val[1], read_code_val[0]);
        if(strstr(code_val, "dance") != NULL) {
            Controller.runActionGroup(17, 1);
        }
        if(strstr(code_val, "gymnastics") != NULL) {
            Controller.runActionGroup(103, 1);
        }
        delay(2000);
        // printf("%s\n", code_val);
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
    code_detection();
    delay(30);
}
