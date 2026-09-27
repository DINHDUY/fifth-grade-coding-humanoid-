---
doc_id: camera-setting-2772368cb0
title: "include \"camera_setting.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.2 图像回传/02 图像回传程序/image/camera_setting.c
source_type: official
status: processed
---

#include "camera_setting.h"
#include "esp_log.h"
#include "esp_system.h"

static const char *TAG = "camera";
static bool ssss = true;
static QueueHandle_t xQueueFrameO = NULL;

static void task_process_handler(void *arg)
{
    int frame_count = 0;
    const int SKIP_FRAMES = 12; // 跳过前5帧不稳定的图像

    while (true)
    {
        camera_fb_t *frame = esp_camera_fb_get();
        if (frame)
        {
            frame_count++;
            if (frame_count > SKIP_FRAMES) {
                // 跳过前几帧后，正常发送帧数据
                xQueueSend(xQueueFrameO, &frame, portMAX_DELAY);
            } else {
                // 丢弃前几帧不稳定的图像
                esp_camera_fb_return(frame);
            }
        }

    }
}

void register_camera(const pixformat_t pixel_fromat,
                     const uint8_t fb_count,
                     const QueueHandle_t frame_o)

{
    ESP_LOGI(TAG, "Camera module is %s", CAMERA_MODULE_NAME);

#if CONFIG_CAMERA_MODULE_ESP_EYE || CONFIG_CAMERA_MODULE_ESP32_CAM_BOARD
    /* IO13, IO14 is designed for JTAG by default,
     * to use it as generalized input,
     * firstly declair it as pullup input */
    gpio_config_t conf;
    conf.mode = GPIO_MODE_INPUT;
    conf.pull_up_en = GPIO_PULLUP_ENABLE;
    conf.pull_down_en = GPIO_PULLDOWN_DISABLE;
    conf.intr_type = GPIO_INTR_DISABLE;
    conf.pin_bit_mask = 1LL << 13;
    gpio_config(&conf);
    conf.pin_bit_mask = 1LL << 14;
    gpio_config(&conf);
#endif

    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sccb_sda = SIOD_GPIO_NUM;
    config.pin_sccb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = XCLK_FREQ_HZ;
    config.frame_size = FRAMESIZE_240X240;
    config.pixel_format = pixel_fromat; // for streaming
    config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
    config.fb_location = CAMERA_FB_IN_PSRAM;
    config.jpeg_quality = 32;
    config.fb_count = fb_count;

    // camera init
    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Camera init failed with error 0x%x", err);
        return;
    }

    sensor_t *s = esp_camera_sensor_get();
    if (s->id.PID == OV3660_PID || s->id.PID == OV2640_PID) {
        s->set_vflip(s, 1); //flip it back    
    } else if (s->id.PID == GC0308_PID) {
        s->set_hmirror(s, 0);
    } else if (s->id.PID == GC032A_PID) {
        s->set_vflip(s, 1);
    }
    else if (s->id.PID == GC2145_PID) {
        s->set_vflip(s, 1);
    }
    //initial sensors are flipped vertically and colors are a bit saturated
    if (s->id.PID == OV3660_PID) {
        s->set_saturation(s, -2); //lower the saturation
    }

    xQueueFrameO = frame_o;
    xTaskCreatePinnedToCore(task_process_handler, TAG, 3 * 1024, NULL, 2, NULL, 1);
}
