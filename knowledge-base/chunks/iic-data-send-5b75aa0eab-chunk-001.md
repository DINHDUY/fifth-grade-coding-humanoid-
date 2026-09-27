---
chunk_id: iic-data-send-5b75aa0eab-chunk-001
doc_id: iic-data-send-5b75aa0eab
title: "pragma once"
semantic_key: "pragma once"
keywords: ["pragma", "once", "raw", "github", "hiwonder-tonybot", "arduino", "wonderllm", "code_recogniton", "iic_data_send", "hpp"]
---

#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

void register_iic_data_send(const QueueHandle_t result_i,
                            const QueueHandle_t result_o);
