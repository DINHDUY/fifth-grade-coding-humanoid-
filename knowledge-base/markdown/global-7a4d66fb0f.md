---
doc_id: global-7a4d66fb0f
title: "pragma once"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.5 二维码识别/02 二维码识别程序/01 WonderLLM二维码识别程序/code_recogniton/global.h
source_type: official
status: processed
---

#pragma once

#define MAX_STRING_LEN  20

typedef struct {
    char data[MAX_STRING_LEN];
    uint8_t datalen;
}I2C_Data_t;
