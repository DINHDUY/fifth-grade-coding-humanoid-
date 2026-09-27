---
doc_id: image-0c9fa7ad67
title: "include <WiFi.h>"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.2 图像回传/02 图像回传程序/image/image.ino
source_type: official
status: processed
---

#include <WiFi.h>
#include "camera_setting.h"
#include "lcd_display.h"

// ===========================
// WiFi 热点配置
// ===========================
const char* ssid = "HW_ESP32S3CAM";
const char* password = ""; // 留空表示无密码

// 按照程序一配置自定义 IP 地址 
IPAddress local_ip(192, 168, 5, 1);       
IPAddress gateway(192, 168, 1, 1);        
IPAddress subnet(255, 255, 255, 0);       

// 声明在 app_httpd.cpp 中定义的服务器启动函数
void startCameraServer();

static QueueHandle_t xQueueAIFrame = NULL;

void setup() {
    // 开启串口
    Serial.begin(115200);
    Serial.setDebugOutput(true);
    Serial.println();

    // 1. 初始化摄像头与 LCD
    xQueueAIFrame = xQueueCreate(3, sizeof(camera_fb_t *));
    register_camera(PIXFORMAT_RGB565, 4, xQueueAIFrame);
    register_lcd_display(xQueueAIFrame, NULL, NULL, NULL, true);

    // 2. 开启 WiFi 热点 (AP 模式)
    Serial.println("Starting WiFi AP...");
    WiFi.mode(WIFI_AP); // 设置为 AP 模式 
    
    // 配置 IP 地址 [cite: 32]
    if (!WiFi.softAPConfig(local_ip, gateway, subnet)) {
        Serial.println("Failed to configure IP"); // [cite: 32]
    }
    
    // 开启热点: SSID, 密码, 信道6, 不隐藏SSID, 最大连接数4 
    WiFi.softAP(ssid, password, 6, false, 4); 
    WiFi.setSleep(false); // 关闭 WiFi 休眠 

    Serial.println("WiFi AP Started!"); // [cite: 33]
    Serial.print("AP IP Address: "); // [cite: 33]
    Serial.println(WiFi.softAPIP()); // [cite: 33]

    // 3. 启动网页视频流服务器
    startCameraServer();

    Serial.print("Camera Web Server Ready! Use 'http://");
    Serial.print(WiFi.softAPIP());
    Serial.println("' to connect");
}

void loop() {
    // 主循环保持空闲即可
    delay(10000);
}
