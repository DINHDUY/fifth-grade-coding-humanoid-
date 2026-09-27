---
chunk_id: iic-data-send-c67b2e25e3-chunk-001
doc_id: iic-data-send-c67b2e25e3
title: "include \"iic_data_send.hpp\""
semantic_key: "include \"iic_data_send.hpp\""
keywords: ["include", "iic_data_send", "hpp", "raw", "github", "hiwonder-tonybot", "arduino", "wonderllm", "code_recogniton", "cpp"]
---

#include "iic_data_send.hpp"
#include "Wire.h"
#include "global.h"

#define I2C_SLAVE_ADDRESS 0x51

static QueueHandle_t xQueueResultI = NULL;
static QueueHandle_t xQueueResultO = NULL;

static const char *TAG = "iic_data_send";
static const int sdaPin = 38;
static const int sclPin = 48;
static const uint32_t i2cFrequency = 100000;

static uint8_t rec = 0xFF;

I2C_Data_t rec_val;
uint8_t send_data[sizeof(rec_val.data) + 1];    //字符串长度信息+字符串数据

// void print_info()
// {
//     uint8_t send_data[rec_val.datalen + 1];
//     send_data[0] = rec_val.datalen;
//     memcpy(&send_data[1], rec_val.data, rec_val.datalen);

//     for(uint8_t i = 0; i < sizeof(send_data); i++) {
//         printf("%d, ", send_data[i]);
//     }
//     printf("\n");
// }

static void iic_receive(int len)
{
    while(Wire.available())
    {
        rec = Wire.read();
    }  
}

static void iic_request()
{
    if(rec == 0x00) 
    {
        send_data[0] = rec_val.datalen;
        memcpy(&send_data[1], rec_val.data, rec_val.datalen);
        /* 打包发送色块数据 */
        Wire.slaveWrite(send_data, sizeof(send_data));
    }
}

static void task_process_handler(void *arg)
{
    memcpy(rec_val.data, "null", sizeof("null"));
    rec_val.datalen = 5;

    /* IIC初始化 */
    Wire.begin((uint8_t)I2C_SLAVE_ADDRESS, sdaPin, sclPin, i2cFrequency);
    /* 注册接收数据的回调函数 */
    Wire.onReceive(iic_receive);
    /* 注册请求数据的回调函数 */
    Wire.onRequest(iic_request);

    while (true)
    {
        if (xQueueReceive(xQueueResultI, &rec_val, portMAX_DELAY))
        {
            // print_info();
        }
    }
}

void register_iic_data_send(const QueueHandle_t result_i,
                            const QueueHandle_t result_o)
{
  xQueueResultI = result_i;
  xQueueResultO = result_o;

  xTaskCreatePinnedToCore(task_process_handler, TAG, 5 * 1024, NULL, 5, NULL, 1);
}
