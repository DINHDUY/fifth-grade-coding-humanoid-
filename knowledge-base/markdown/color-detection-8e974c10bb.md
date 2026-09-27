---
doc_id: color-detection-8e974c10bb
title: "pragma once"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.3 颜色识别/02 颜色识别程序/01 WonerLLM颜色识别程序/color_detection/color_detection.hpp
source_type: official
status: processed
---

#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

#define COLOR_RED 0x00F8
#define COLOR_YELLOW 0xE0FF
#define COLOR_GREEN 0xE007
#define COLOR_BLUE 0x1F00
#define COLOR_PURPLE 0x1EA1

#define COLOR_NUM 4


typedef struct
{
  uint8_t id;
  uint8_t center_x;
  uint8_t center_y;
  uint8_t width;
  uint8_t length;
}color_data_t;


void register_color_detection(const QueueHandle_t frame_i,
                              const QueueHandle_t event,
                              const QueueHandle_t result,
                              const QueueHandle_t frame_o,
                              const bool camera_fb_return);
