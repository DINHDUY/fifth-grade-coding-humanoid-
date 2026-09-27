---
doc_id: color-detection-2ffd87819b
title: "include \"camera_setting.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.3 颜色识别/02 颜色识别程序/01 WonerLLM颜色识别程序/color_detection/color_detection.ino
source_type: official
status: processed
---

# include "camera_setting.h"

#include "camera_setting.h"
#include "color_detection.hpp"
#include "lcd_display.h"
#include "iic_data_send.hpp"

static QueueHandle_t xQueueAIFrame = NULL;
static QueueHandle_t xQueueLCDFrame = NULL;
static QueueHandle_t xQueueIICData = NULL;

void setup() {
    xQueueAIFrame = xQueueCreate(2, sizeof(camera_fb_t *));
    xQueueLCDFrame = xQueueCreate(2, sizeof(camera_fb_t *));
    xQueueIICData = xQueueCreate(2, sizeof(color_data_t *) * SEND_CLOLOR_NUM);
    
    register_camera(PIXFORMAT_RGB565, 4, xQueueAIFrame);
    register_color_detection(xQueueAIFrame, NULL, xQueueIICData, xQueueLCDFrame, false);
    // register_iic_data_send(xQueueIICData, NULL);
    register_lcd_display(xQueueLCDFrame, NULL, NULL, NULL, true);
    register_iic_data_send(xQueueIICData, NULL);
}

void loop() {
  // put your main code here, to run repeatedly:

}
