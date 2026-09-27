---
chunk_id: code-recogniton-655f85075b-chunk-001
doc_id: code-recogniton-655f85075b
title: "include \"camera_setting.h\""
semantic_key: "include \"camera_setting.h\""
keywords: ["include", "camera_setting", "raw", "github", "hiwonder-tonybot", "arduino", "wonderllm", "code_recogniton", "ino"]
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
