---
doc_id: code-recogniton-655f85075b
title: "include \"camera_setting.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.5 二维码识别/02 二维码识别程序/01 WonderLLM二维码识别程序/code_recogniton/code_recogniton.ino
source_type: official
status: processed
---

#include "camera_setting.h"
#include "code_recognition.hpp"
#include "lcd_display.h"
#include "iic_data_send.hpp"
#include "global.h"

static QueueHandle_t xQueueAIFrame = NULL;
static QueueHandle_t xQueueLCDFrame = NULL;
static QueueHandle_t xQueueIICData = NULL;

void setup() {
    xQueueAIFrame = xQueueCreate(2, sizeof(camera_fb_t *));
    xQueueLCDFrame = xQueueCreate(2, sizeof(camera_fb_t *));
    xQueueIICData = xQueueCreate(2, sizeof(I2C_Data_t));

    register_camera(PIXFORMAT_RGB565, 4, xQueueAIFrame);
    register_code_recognition(xQueueAIFrame, NULL, xQueueIICData, xQueueLCDFrame, false);
    // register_lcd_display(xQueueLCDFrame, NULL, NULL, NULL, true);
    register_iic_data_send(xQueueIICData, NULL);
}

void loop() {
  // put your main code here, to run repeatedly:

}
