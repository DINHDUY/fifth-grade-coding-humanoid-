---
doc_id: esp-lcd-st77912-08141bab9b
title: "pragma once"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.5 二维码识别/02 二维码识别程序/01 WonderLLM二维码识别程序/code_recogniton/esp_lcd_st77912.h
source_type: official
status: processed
---

# pragma once

#pragma once

#include <stdint.h>

#include "esp_lcd_panel_vendor.h"

#ifdef __cplusplus
extern "C" {
#endif

#define ST77912_LCD_HOST               SPI2_HOST
#define ST77912_LCD_H_RES              (240)
#define ST77912_LCD_V_RES              (240)
#define ST77912_LCD_BIT_PER_PIXEL      (16)

#define ST77912_PIN_NUM_LCD_CS         (GPIO_NUM_2)
#define ST77912_PIN_NUM_LCD_PCLK       (GPIO_NUM_21)
#define ST77912_PIN_NUM_LCD_DATA0      (GPIO_NUM_47)
#define ST77912_PIN_NUM_LCD_RST        (-1)
#define ST77912_PIN_NUM_LCD_DC         (GPIO_NUM_1)
#define ST77912_PIN_NUM_LCD_BL         (GPIO_NUM_14)

typedef struct {
    int cmd;
    const void *data;
    size_t data_bytes;
    unsigned int delay_ms;
} st77912_lcd_init_cmd_t;

typedef struct {
    const st77912_lcd_init_cmd_t *init_cmds;
    uint16_t init_cmds_size;
    struct {
        unsigned int use_qspi_interface: 1;
    } flags;
} st77912_vendor_config_t;

esp_err_t esp_lcd_new_panel_st77912(const esp_lcd_panel_io_handle_t io, const esp_lcd_panel_dev_config_t *panel_dev_config, esp_lcd_panel_handle_t *ret_panel);

#define ST77912_PANEL_BUS_SPI_CONFIG(sclk, mosi, max_trans_sz)  \
    {                                                           \
        .sclk_io_num = sclk,                                    \
        .mosi_io_num = mosi,                                    \
        .miso_io_num = -1,                                      \
        .quadhd_io_num = -1,                                    \
        .quadwp_io_num = -1,                                    \
        .max_transfer_sz = max_trans_sz,                        \
    }
#define ST77912_PANEL_BUS_QSPI_CONFIG(sclk, d0, d1, d2, d3, max_trans_sz)\
    {                                                           \
        .sclk_io_num = sclk,
