---
doc_id: lcd-display-8c80f4f6d9
title: "include \"lcd_display.h\""
source_path: raw/github/Hiwonder-Tonybot/Python/AI大模型离线课程/6.8.3 颜色识别/02 颜色识别程序/01 WonerLLM颜色识别程序/color_detection/lcd_display.c
source_type: official
status: processed
---

# include "lcd_display.h"

#include "lcd_display.h"
#include "esp_camera.h"
#include "fb_gfx.h"
#include "driver/spi_master.h"
#include "driver/gpio.h"
#include "esp_heap_caps.h"
#include "esp_log.h"
#include "esp_lcd_panel_io.h"
#include "esp_lcd_panel_ops.h"
#include "esp_lcd_panel_interface.h"
#include "esp_lcd_panel_commands.h"
#include "esp_lcd_st77912.h"

static const char *TAG = "lcd_display";

static bool gReturnFB = true;
static QueueHandle_t xQueueFrameI = NULL;
static QueueHandle_t xQueueEvent = NULL;
static QueueHandle_t xQueueFrameO = NULL;
static QueueHandle_t xQueueResult = NULL;



static void task_process_handler(void *arg)
{
    int pattern_count = 0;
    camera_fb_t *frame = NULL;
    esp_lcd_panel_handle_t panel_handle = NULL;

    // 1. 先初始化背光GPIO
    ESP_LOGI(TAG, "初始化背光GPIO");
    gpio_config_t io_conf = {
        .pin_bit_mask = 1ULL << ST77912_PIN_NUM_LCD_BL,
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };
    ESP_ERROR_CHECK(gpio_config(&io_conf));
    // 先关闭背光，等LCD初始化完成后再打开
    gpio_set_level(ST77912_PIN_NUM_LCD_BL, 0);
    vTaskDelay(pdMS_TO_TICKS(10));

    // 2. 初始化SPI总线
    spi_bus_config_t buscfg = {
        .mosi_io_num = ST77912_PIN_NUM_LCD_DATA0,
        .miso_io_num = -1,
        .sclk_io_num = ST77912_PIN_NUM_LCD_PCLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
        .data4_io_num = -1,
        .data5_io_num = -1,
        .data6_io_num = -1,
        .data7_io_num = -1,
        .max_transfer_sz = ST77912_LCD_H_RES * ST77912_LCD_V_RES * 2,
        .flags = 0,
        .isr_cpu_id = 1,
        .intr_flags = 0,
    };
    
    ESP_ERROR_CHECK(spi_bus_initialize(ST77912_LCD_HOST, &buscfg, SPI_DMA_CH_AUTO));
    vTaskDelay(pdMS_T
