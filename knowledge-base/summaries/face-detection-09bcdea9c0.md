---
doc_id: face-detection-09bcdea9c0
title: "include \"camera_setting.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.4 人脸识别/02 人脸识别程序/01 WonderLLM人脸识别程序/face_detection/face_detection.ino
source_type: official
status: processed
---

# include "camera_setting.h"

#include "camera_setting.h"
#include "face_detection.hpp"
#include "lcd_display.h"
#include "iic_data_send.hpp"
#include "arduino.h"
static QueueHandle_t xQueueAIFrame = NULL;
static QueueHandle_t xQueueLCDFrame = NULL;
static QueueHandle_t xQueueIICData = NULL;

void setup() {
    xQueueAIFrame = xQueueCreate(2, sizeof(camera_fb_t *));
    xQueueLCDFrame = xQueueCreate(2, sizeof(camera_fb_t *));
    xQueueIICData = xQueueCreate(2, sizeof(target_face_information_t));

    register_camera(PIXFORMAT_RGB565, 4, xQueueAIFrame);
    register_human_face_detection(xQueueAIFrame, NULL, xQueueIICData, xQueueLCDFrame, false);
    register_lcd_display(xQueueLCDFrame, NULL, NULL, NULL, true);
    register_iic_data_send(xQueueIICData, NULL);
}

void loop() {
  // put your main code here, to run repeatedly:

}
