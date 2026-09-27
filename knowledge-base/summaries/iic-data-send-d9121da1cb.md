---
doc_id: iic-data-send-d9121da1cb
title: "pragma once"
source_path: raw/github/Hiwonder-Tonybot/Python/IOT例程/02 ESP32S3-Cam颜色识别例程及工具/ColorDetection/iic_data_send.hpp
source_type: official
status: processed
---

# pragma once

#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "freertos/semphr.h"


typedef struct
{
  uint8_t center_x;
  uint8_t center_y;
  uint8_t width;
  uint8_t length;
}send_color_data_t;

/**
 * @brief Color detection result
 * 
 * @param color[0]     red
 * @param color[1]     yellow
 * @param color[2]     green
 * @param color[3]     blue
 * @param color[4]     purple
 */


void register_iic_data_send(const QueueHandle_t result_i,
                            const QueueHandle_t result_o);
