---
doc_id: color-detection-31cb822468
title: "pragma once"
source_path: raw/github/Hiwonder-Tonybot/Python/AI视觉项目课程/7.5 头部颜色追踪/ESP32S3Cam_ColorDetection/color_detection.hpp
source_type: official
status: processed
---

# pragma once

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

#define COLOR_NUM 3

typedef struct
{
  uint8_t center_x;
  uint8_t center_y;
  uint8_t width;
  uint8_t length;
}color_data_t;

/**
 * @brief Color detection result
 * 
 * @param color[0]     red
 * @param color[1]     yellow
 * @param color[2]     green
 * @param color[3]     blue
 * @param color[4]     purple
 */

void register_color_detection(const QueueHandle_t frame_i,
                              const QueueHandle_t event,
                              const QueueHandle_t result,
                              const QueueHandle_t frame_o,
                              const bool camera_fb_return);
