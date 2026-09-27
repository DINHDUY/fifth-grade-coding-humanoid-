---
doc_id: document-4cdcacc7f6
title: "1. 程序入口在 `line_follow.ino`，先导入底层配置、串口/动作组控制、传感器、摄像头与 WonderLLM 通信库，为后续状态机与外设调用做准备。"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型应用课程/02 智慧交通行驶程序/line_follow/工程程序分析.md
source_type: official
status: processed
---

# 1. 程序入口在 `line_follow.ino`，先导入底层配置、串口/动作组控制、传感器、摄像头与 WonderLLM 通信库，为后续状态机与外设调用做准备。

1. 程序入口在 `line_follow.ino`，先导入底层配置、串口/动作组控制、传感器、摄像头与 WonderLLM 通信库，为后续状态机与外设调用做准备。

```1:10:C:\Users\Admin\Desktop\line_follow\line_follow.ino
#include "base_config.h"
#include "HardwareSerial.h" //串口库
#include "LobotServoController.h" //舵机控制器库
#include "Arduino.h"
// #include "Servo.h"
#include "HWSensor.h" //传感器库
#include "Hiwonder.hpp"
#include "hw_esp32cam_ctl.h" //导入ESP32Cam通讯库
#include "tonybot_camera.h" //导入ESP32Cam通讯库
#include "WonderLLM.h"
```

2. 全局对象与关键常量在文件顶部完成：`Controller(Serial2)` 负责给底板下发动作组；`s3_camera` 负责本地色块识别；`stage/tickstart` 构成三段式状态机与两路定时器。

```12:43:C:\Users\Admin\Desktop\line_follow\line_follow.ino
#define TURN_RIGHT  66     /*右转动作组 24 35 4*/
#define TURN_LEFT   65     /*左转动作组 23 34 3 */
#define GO_STRAIGHT 63     /*直走动作 21*/
#define RETREAT     22     /*后退动作*/
#define TRANSITION  18     /*过渡动作（右倾）*/

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类

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
```

3. `setup()` 完成三类初始化：摄像头 I2C begin、调试串口与底板串口（Serial2）启动；随后初始化 WonderLLM，并执行一次“立正”动作组作为初始姿态，最后打印 `start.` 表示进入主循环。

```45:62:C:\Users\Admin\Desktop\line_follow\line_follow.ino
void setup() {
  // 初始化串口通信
  tonybot_camera.begin();
  s3_camera.begin();
  Serial.begin(115200);
  // 初始化与底板通信的串口
  Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
  delay(200); //等待底板初始化完毕
  WonderLLM_Ini
