---
doc_id: lcd-display-88443ef5b0
title: "pragma once"
source_path: raw/github/Hiwonder-Tonybot/Python/AI大模型离线课程/6.8.5 二维码识别/02 二维码识别程序/01 WonderLLM二维码识别程序/color_detection/lcd_display.h
source_type: official
status: processed
---

#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

#ifdef __cplusplus
extern "C"
{
#endif

void register_lcd_display(const QueueHandle_t frame_i,
                            const QueueHandle_t event,
                            const QueueHandle_t result,
                            const QueueHandle_t frame_o,
                            const bool camera_fb_return);

#ifdef __cplusplus
}
#endif
