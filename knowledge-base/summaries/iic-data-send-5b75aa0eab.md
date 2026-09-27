---
doc_id: iic-data-send-5b75aa0eab
title: "pragma once"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.5 二维码识别/02 二维码识别程序/01 WonderLLM二维码识别程序/code_recogniton/iic_data_send.hpp
source_type: official
status: processed
---

# pragma once

#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

void register_iic_data_send(const QueueHandle_t result_i,
                            const QueueHandle_t result_o);
