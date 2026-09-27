---
chunk_id: iic-data-send-395f36bce5-chunk-001
doc_id: iic-data-send-395f36bce5
title: "pragma once"
semantic_key: "pragma once"
keywords: ["pragma", "once", "raw", "github", "hiwonder-tonybot", "arduino", "iot", "esp32s3-cam", "colordetection", "iic_data_send", "hpp"]
---

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
