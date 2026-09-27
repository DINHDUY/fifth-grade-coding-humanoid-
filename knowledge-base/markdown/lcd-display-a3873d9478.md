---
doc_id: lcd-display-a3873d9478
title: "pragma once"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.3 颜色识别/02 颜色识别程序/01 WonerLLM颜色识别程序/color_detection/lcd_display.h
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
