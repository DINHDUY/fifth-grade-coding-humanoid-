---
doc_id: iic-data-send-5b9739b64b
title: "pragma once"
source_path: raw/github/Hiwonder-Tonybot/Python/AI大模型应用课程/03 ESP32S3颜色识别程序/ColorDetection/iic_data_send.hpp
source_type: official
status: processed
---

# pragma once

#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

#define SEND_CLOLOR_NUM 4

typedef struct
{
  uint8_t id;
  uint8_t center_x;
  uint8_t center_y;
  uint8_t width;
  uint8_t length;
}send_color_data_t;


void register_iic_data_send(const QueueHandle_t result_i,
                            const QueueHandle_t result_o);
