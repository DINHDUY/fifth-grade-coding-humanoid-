---
chunk_id: face-detection-a6c5a4c5ab-chunk-001
doc_id: face-detection-a6c5a4c5ab
title: "include \"camera_setting.h\""
semantic_key: "include \"camera_setting.h\""
keywords: ["include", "camera_setting", "raw", "github", "hiwonder-tonybot", "python", "wonderllm", "face_detection", "ino"]
---

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
