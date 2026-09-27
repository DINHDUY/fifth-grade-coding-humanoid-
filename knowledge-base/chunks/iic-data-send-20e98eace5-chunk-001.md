---
chunk_id: iic-data-send-20e98eace5-chunk-001
doc_id: iic-data-send-20e98eace5
title: "pragma once"
semantic_key: "pragma once"
keywords: ["pragma", "once", "raw", "github", "hiwonder-tonybot", "python", "wonerllm", "color_detection", "iic_data_send", "hpp"]
---

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
