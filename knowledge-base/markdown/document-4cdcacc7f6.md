---
doc_id: document-4cdcacc7f6
title: "1. 程序入口在 `line_follow.ino`，先导入底层配置、串口/动作组控制、传感器、摄像头与 WonderLLM 通信库，为后续状态机与外设调用做准备。"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型应用课程/02 智慧交通行驶程序/line_follow/工程程序分析.md
source_type: official
status: processed
---

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
  WonderLLM_Init(); //初始化WonderLLM模块	
  delay(13000);
  // 初始化机器人姿态
  Controller.runActionGroup(0 , 1);
  delay(1500);
  hwsensor.ultrasoundColor(0,0,0,0,0,0);
  Serial.println("start.");
}
```

4. `loop()` 用 `stage` 做三段式状态机：巡线阶段依赖本地摄像头检测红块并调用 `body_follow`；检测到蓝块且阈值满足则切到 WAITING 阶段，并初始化两路计时戳用于后续“1s 请求 + 50ms 轮询”节奏。

```67:84:C:\Users\Admin\Desktop\line_follow\line_follow.ino
void loop() {
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
```

5. WAITING 阶段的核心是“触发一次视觉请求 + 高频读取返回”：每 1 秒调用 `WonderLLM_Request_Vision(vison_prompt)` 让 WonderLLM 取图推理；每 50ms 调 `WonderLLM_Info_Get` 读取 I2C 结果，若 JSON 原串包含 `true` 就判定“绿灯”并触发动作组。

```86:113:C:\Users\Admin\Desktop\line_follow\line_follow.ino
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
                    Controller.runActionGroup(1,4);
                    delay(4000);
                }
                memset(WonderLLM_hiwonder.json_data_raw,0,sizeof(WonderLLM_hiwonder.json_data_raw));
            }
            tickstart2 = millis();
        }
        break;
```

6. CUSTOM 阶段用于执行结束/复位动作并回到巡线：本工程在这里执行一次立正（动作组 0），并把 `stage` 设回 `STAGE_LINETRACKING`，因此整个流程会循环重复（巡线 → 等灯 → 通过 → 再巡线）。

```115:120:C:\Users\Admin\Desktop\line_follow\line_follow.ino
    case STAGE_CUSTOM:
        Serial.println("line follow end");
        Controller.runActionGroup(0,1);
        stage = STAGE_LINETRACKING;
        Serial.println("restart line follow");
        break;
  }
```

7. `body_follow(x)` 是巡线控制：根据红块横向位置 `x` 与阈值 `LEFT_MIN/RIGHT_MAX` 的关系选择直走/左转/右转动作组，并用 `step` 做简单的两段修正（左偏/右偏时先大转再小转）。

```145:196:C:\Users\Admin\Desktop\line_follow\line_follow.ino
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
```

8. 本地摄像头色块检测由 `HW_ESP32S3Cam` 封装：`red_block_detection/blue_block_detection` 实际是在 I2C 地址 `0x52` 上读取不同寄存器（0x00/0x02），把识别结果写入 `read_val` 供 `loop()` 判断与巡线控制使用。

```4:24:C:\Users\Admin\Desktop\line_follow\hw_esp32cam_ctl.h
#define ESP32CAM_ADDR 0x52
#define COLOR_DETECTION_FIRST_COLOR_REG     0x00
#define COLOR_DETECTION_SECOND_COLOR_REG    0x01
#define COLOR_DETECTION_THIRD_COLOR_REG     0x02
#define COLOR_DETECTION_FOURTH_COLOR_REG    0x03
#define COLOR_DETECTION_ID_REG              0x04
#define FACE_DETECTION_REG                  0x01

class HW_ESP32S3Cam {
  public:
    void begin();
    uint16_t red_block_detection(uint8_t *buf, uint8_t buf_len);
    uint16_t green_block_detection(uint8_t *buf, uint8_t buf_len);
    uint16_t blue_block_detection(uint8_t *buf, uint8_t buf_len);
    uint16_t purple_block_detection(uint8_t *buf, uint8_t buf_len);
    uint16_t color_id_detection(uint8_t *buf, uint8_t buf_len); 
    uint16_t face_data_receive(uint8_t *buf, uint8_t buf_len);  
};
```

9. `HW_ESP32S3Cam::red_block_detection/blue_block_detection` 直接调用 `wire_read_array` 从对应寄存器读数组；因此 `line_follow.ino` 里对 `read_val[0]`（位置）和 `read_val[1]`（强度/面积等）阈值判断，最终都来源于这次 I2C 读回的数据内容。

```43:53:C:\Users\Admin\Desktop\line_follow\hw_esp32cam_ctl.cpp
uint16_t HW_ESP32S3Cam::red_block_detection(uint8_t *buf, uint8_t buf_len) {
    return (uint16_t)wire_read_array(ESP32CAM_ADDR, COLOR_DETECTION_FIRST_COLOR_REG, buf, buf_len);
}

uint16_t HW_ESP32S3Cam::blue_block_detection(uint8_t *buf, uint8_t buf_len) {
    return (uint16_t)wire_read_array(ESP32CAM_ADDR, COLOR_DETECTION_THIRD_COLOR_REG, buf, buf_len);
}
```

10. WonderLLM 的 I2C 地址与数据结构在 `WonderLLM.h` 中定义：`WONDERLLM_SLAVE_ADDRESS=0x55`，并用 `WonderLLM_Info` 的 `json_data_raw` 缓冲区承接模块回传的 JSON 原文，`Frame_mode` 则标记本次解析出的消息类型。

```8:47:C:\Users\Admin\Desktop\line_follow\WonderLLM.h
#define WONDERLLM_SLAVE_ADDRESS 0x55
#define I2C_TIMEOUT              10 // ms

typedef enum{
	Frame_NULL = 0,
	Frame_move = 1,
	Frame_get_status_battery = 2,
	Frame_get_status_distance,
	Frame_get_status_running_mode,
	Frame_get_status_Bodystate,
	Frame_set_running_mode,
	Frame_set_led_color,
	Frame_set_buzzer,
	Frame_vision_analysis,
	Frame_ActionGroup,
}FrameMode;

typedef struct{
		// ... 省略部分字段 ...
		FrameMode Frame_mode;                   /*当前MCP指令类型*/
		char json_data_raw[256];                /*存放MCP原始指令的缓冲区*/
}WonderLLM_Info;
```

11. WonderLLM 初始化 `WonderLLM_Init()` 会先配置 I2C 引脚与缓存，再循环检测从机是否存在；检测到后将 I2C 速率提升到 400kHz，调用 `register_tools()` 完成 MCP 工具注册，最后再把 I2C 速率切回 100kHz 以兼容其它低速设备。

```470:496:C:\Users\Admin\Desktop\line_follow\WonderLLM.cpp
bool WonderLLM_Init(void) {
    Wire.setPins(IO_SDA, IO_SCL);
    Wire.setBufferSize(1024);
    Wire.begin();
    uint32_t start_tick =  Get_time_now(); // 记录开始时间

    while (1) {
        // 1. 检查设备是否就绪
        if (Detect_WonderLLM() == true) {
            // 设备找到，执行初始化序列
			IIC_Config_MCP_Transmit();	
            delay_ms(5);
            register_tools(); // 调用MCP写入工具	
			IIC_Config_normal_Transmit();

			return true;
         }else{		// 2. 如果设备未找到，检查是否超时
			if(Get_time_now() - start_tick > 3000){
					return false;						
			}else{
			delay_ms(100); 						
			}
		}  
	}				        
}
```

12. 摄像头调用本体在 `WonderLLM_Request_Vision(prompt)`：MCU 将 `prompt` 组装进 `{"tool_name":"mcu.request","command":"vision","params":"..."}` 的 JSON，通过 I2C 发给 WonderLLM；这是一种“请求一次视觉识别”的 RPC 模式，工程在 WAITING 阶段按 1 秒节奏重复触发该请求。

```552:566:C:\Users\Admin\Desktop\line_follow\WonderLLM.cpp
void WonderLLM_Request_Vision(const char* prompt) {
    char json_str[256];
    
    // 使用 snprintf 安全地构建 JSON 字符串
    snprintf(json_str, sizeof(json_str), 
             "{\"tool_name\":\"mcu.request\",\"command\":\"vision\",\"params\":\"%s\"}", 
             prompt);
		
	IIC_Config_MCP_Transmit();				
    delay_ms(5);
		
    // 调用已有的 send_frame 函数发送这个请求
    send_frame((uint8_t*)json_str, strlen(json_str));
}
```

13. 结果读取在 `WonderLLM_Info_Get()`：从 I2C 收到完整分片帧后，把 JSON 原文写入 `json_data_raw` 并补 `\\0` 形成 C 字符串，再调用 `parse_command()` 识别消息类型；本工程在 `line_follow.ino` 中主要利用 `json_data_raw` 做 `true` 字符串判断。

```499:520:C:\Users\Admin\Desktop\line_follow\WonderLLM.cpp
void WonderLLM_Info_Get(WonderLLM_Info *obj) {
	obj->Frame_mode = Frame_NULL;
	if (Detect_WonderLLM() == true) {
		obj->Detection_WonderLLM = 1;

		uint16_t received_len = sizeof(obj->json_data_raw);
		//将wonderllm发来的json字符串原文同步拷贝至json_data_raw备份
		if (receive_frame((uint8_t*)obj->json_data_raw, &received_len)) {
			if (received_len > 0) {
				obj->json_data_raw[received_len] = '\0';
				obj->Frame_mode = (FrameMode)parse_command(obj,obj->json_data_raw);
			}
		}
	}else{
		obj->Detection_WonderLLM = 0;
	}
}
```

14. 动作组控制的底层含义在 `LobotServoController::runActionGroup`：向底板串口发送 `0x55 0x55` 帧头 + `CMD_ACTION_GROUP_RUN(0x06)` 命令 + 动作号 + 次数；因此 `line_follow.ino` 中的“直走/转向/立正”等都映射为不同的动作组编号下发。

```124:136:C:\Users\Admin\Desktop\line_follow\src\LobotServoCtl\LobotServoController.cpp
void LobotServoController::runActionGroup(uint8_t numOfAction, uint16_t Times)
{
	uint8_t buf[7];
	buf[0] = FRAME_HEADER;   //填充帧头
	buf[1] = FRAME_HEADER;
	buf[2] = 5;      //数据长度，数据帧除帧头部分数据字节数，此命令固定为5
	buf[3] = CMD_ACTION_GROUP_RUN; //填充运行动作组命令
	buf[4] = numOfAction;      //填充要运行的动作组号
	buf[5] = GET_LOW_BYTE(Times); //取得要运行次数的低八位
	buf[6] = GET_HIGH_BYTE(Times); //取得要运行次数的高八位
	isRunning_ = true;
	SerialX->write(buf, 7);      //发送数据帧
}
```
