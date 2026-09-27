---
doc_id: lcd-display-4af45f8d84
title: "include \"lcd_display.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.5 二维码识别/02 二维码识别程序/01 WonderLLM二维码识别程序/code_recogniton/lcd_display.c
source_type: official
status: processed
---

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
    vTaskDelay(pdMS_TO_TICKS(10));

    // 3. 安装面板IO
    ESP_LOGI(TAG, "安装面板IO");
    esp_lcd_panel_io_handle_t io_handle = NULL;
    esp_lcd_panel_io_spi_config_t io_config = {
        .cs_gpio_num = ST77912_PIN_NUM_LCD_CS,
        .dc_gpio_num = ST77912_PIN_NUM_LCD_DC,
        .spi_mode = 0,
        .pclk_hz = 30 * 1000 * 1000,
        .trans_queue_depth = 10,
        .on_color_trans_done = NULL,
        .user_ctx = NULL,
        .lcd_cmd_bits = 8,
        .lcd_param_bits = 8,
        .flags = {
            .dc_high_on_cmd = 0,
            .dc_low_on_data = 0,
            .dc_low_on_param = 0,
            .octal_mode = 0,
            .quad_mode = 0,
            .sio_mode = 0,
            .lsb_first = 0,
            .cs_high_active = 0,
        },
    };
    ESP_ERROR_CHECK(esp_lcd_new_panel_io_spi((esp_lcd_spi_bus_handle_t)ST77912_LCD_HOST, &io_config, &io_handle));
    vTaskDelay(pdMS_TO_TICKS(10));

    // 4. 安装ST77912 LCD驱动
    ESP_LOGI(TAG, "安装ST77912 LCD驱动");
    
    esp_lcd_panel_dev_config_t panel_config = {
        .reset_gpio_num = ST77912_PIN_NUM_LCD_RST,
        .rgb_ele_order = LCD_RGB_ELEMENT_ORDER_RGB,
        .data_endian = LCD_RGB_DATA_ENDIAN_BIG,
        .bits_per_pixel = 16,
        .flags = {
            .reset_active_high = 0,
        },
        .vendor_config = NULL,
    };
    ESP_ERROR_CHECK(esp_lcd_new_panel_st77912(io_handle, &panel_config, &panel_handle));
    vTaskDelay(pdMS_TO_TICKS(10));
    
    // 5. 复位LCD
    ESP_LOGI(TAG, "复位LCD");
    ESP_ERROR_CHECK(esp_lcd_panel_reset(panel_handle));
    vTaskDelay(pdMS_TO_TICKS(100));
    
    // 6. 初始化LCD
    ESP_LOGI(TAG, "初始化LCD");
    ESP_ERROR_CHECK(esp_lcd_panel_init(panel_handle));
    vTaskDelay(pdMS_TO_TICKS(100));
    
    // 7. 填充初始颜色，防止花屏
    ESP_LOGI(TAG, "填充初始颜色");
    uint16_t *init_buffer = (uint16_t *)heap_caps_malloc(ST77912_LCD_H_RES * ST77912_LCD_V_RES * sizeof(uint16_t), MALLOC_CAP_DMA);
    if (init_buffer != NULL) {
        // 填充黑色
        for (int i = 0; i < ST77912_LCD_H_RES * ST77912_LCD_V_RES; i++) {
            init_buffer[i] = 0x0000;
        }
        esp_lcd_panel_draw_bitmap(panel_handle, 0, 0, ST77912_LCD_H_RES, ST77912_LCD_V_RES, init_buffer);
        heap_caps_free(init_buffer);
    }
    vTaskDelay(pdMS_TO_TICKS(50));
    
    // 8. 打开显示
    ESP_LOGI(TAG, "打开显示");
    ESP_ERROR_CHECK(esp_lcd_panel_disp_on_off(panel_handle, true));
    vTaskDelay(pdMS_TO_TICKS(10));

    // 9. 打开背光
    ESP_LOGI(TAG, "打开背光");
    gpio_set_level(ST77912_PIN_NUM_LCD_BL, 1);
    vTaskDelay(pdMS_TO_TICKS(10));

    while (true) {
        if (xQueueReceive(xQueueFrameI, &frame, portMAX_DELAY)) {
                // 直接使用frame->buf作为显示缓冲区
                esp_lcd_panel_draw_bitmap(panel_handle, 0, 0, ST77912_LCD_H_RES, ST77912_LCD_V_RES, frame->buf);
        }
        
        // 处理完帧数据后，根据配置进行相应操作
        if (xQueueFrameO) {
            xQueueSend(xQueueFrameO, &frame, portMAX_DELAY);
        }
        else if(gReturnFB) {
            esp_camera_fb_return(frame);
        }
        else {
            free(frame);
        }
        
        if (xQueueResult) {
        }  
    }
}

static void task_event_handler(void *arg)
{
    while (true);
}

void register_lcd_display(const QueueHandle_t frame_i,
                            const QueueHandle_t event,
                            const QueueHandle_t result,
                            const QueueHandle_t frame_o,
                            const bool camera_fb_return)
{
    xQueueFrameI = frame_i;
    xQueueFrameO = frame_o;
    xQueueEvent = event;
    xQueueResult = result;
    gReturnFB = camera_fb_return;
    
    xTaskCreatePinnedToCore(task_process_handler, TAG, 5 * 1024, NULL, 3, NULL, 1);
    // xTaskCreatePinnedToCore(task_event_handler, TAG, 4 * 1024, NULL, 5, NULL, 0);
}
