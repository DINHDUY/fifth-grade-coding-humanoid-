---
doc_id: iic-data-send-9645688939
title: "pragma once"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.4 人脸识别/02 人脸识别程序/01 WonderLLM人脸识别程序/face_detection/iic_data_send.hpp
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
  uint8_t detection_width;
  uint8_t detection_length;
}iic_send_data_t;


void register_iic_data_send(const QueueHandle_t result_i,
                            const QueueHandle_t result_o);
