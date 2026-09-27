---
doc_id: iic-data-send-3996bde553
title: "include \"iic_data_send.hpp\""
source_path: raw/github/Hiwonder-Tonybot/Python/AI大模型离线课程/6.8.3 颜色识别/02 颜色识别程序/01 WonerLLM颜色识别程序/color_detection/iic_data_send.cpp
source_type: official
status: processed
---

# include "iic_data_send.hpp"

#include "iic_data_send.hpp"
#include "Wire.h"

#define I2C_SLAVE_ADDRESS 0x51

static QueueHandle_t xQueueResultI = NULL;
static QueueHandle_t xQueueResultO = NULL;

static const char *TAG = "iic_data_send";
static const int sdaPin = 38;
static const int sclPin = 48;
static const uint32_t i2cFrequency = 100000;

send_color_data_t send_color_data[4];

static uint8_t rec = 0xFF;
static uint8_t send_data[4] = {0};

static void iic_receive(int len)
{
  while(Wire.available())
  {
    rec = Wire.read();
  }  
}

static void iic_request()
{
    /* 发送红色色块数据 */
    if(rec == 0x00) 
    {
        send_data[0] = send_color_data[0].center_x;
        send_data[1] = send_color_data[0].center_y;
        send_data[2] = send_color_data[0].width;
        send_data[3] = send_color_data[0].length;
        /* 打包发送色块数据 */
        //Wire.slaveWrite(send_data, sizeof(send_data));
    }
    /* 发送绿色色块数据 */
    else if(rec == 0x01)
    {
        send_data[0] = send_color_data[1].center_x;
        send_data[1] = send_color_data[1].center_y;
        send_data[2] = send_color_data[1].width;
        send_data[3] = send_color_data[1].length;
        /* 打包发送色块数据 */
        //Wire.slaveWrite(send_data, sizeof(send_data));
    }
    /* 发送蓝色色块数据 */
    else if(rec == 0x02)
    {
        
        send_data[0] = send_color_data[2].center_x;
        send_data[1] = send_color_data[2].center_y;
        send_data[2] = send_color_data[2].width;
        send_data[3] = send_color_data[2].length;
        /* 打包发送色块数据 */
        //Wire.slaveWrite(send_data, sizeof(send_data));
    }
    /* 发送紫色色块数据 */
    else if(rec == 0x03)
    {
        send_data[0] = send_color_data[3].center_x;
        send_data[1] = send_color_data[3].center_y;
        send_data[2] = send_color_data[3].width;
        send_data[3] = send_color
