---
doc_id: hwsensor-339dbce915
title: "ifndef HWSENSOR_H"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/智能风扇/ultrasonic_fan/HWSensor.h
source_type: official
status: processed
---

#ifndef HWSENSOR_H
#define HWSENSOR_H

#include <Arduino.h>

#define ULTRASOUND_I2C_ADDR 0x77 

//寄存器
#define DISDENCE_L    0//距离低8位，单位mm
#define DISDENCE_H    1

#define RGB_BRIGHTNESS  50//0-255

#define RGB_WORK_MODE 2//RGB灯模式，0：用户自定义模式   1：呼吸灯模式  默认0

#define RGB1_R      3//1号探头的R值，0~255，默认0
#define RGB1_G      4//默认0
#define RGB1_B      5//默认255

#define RGB2_R      6//2号探头的R值，0~255，默认0
#define RGB2_G      7//默认0
#define RGB2_B      8//默认255

#define RGB1_R_BREATHING_CYCLE      9 //呼吸灯模式时，1号探头的R的呼吸周期，单位100ms 默认0，
                                      //如果设置周期3000ms，则此值为30
#define RGB1_G_BREATHING_CYCLE      10
#define RGB1_B_BREATHING_CYCLE      11

#define RGB2_R_BREATHING_CYCLE      12//2号探头
#define RGB2_G_BREATHING_CYCLE      13
#define RGB2_B_BREATHING_CYCLE      14

#define RGB_WORK_SIMPLE_MODE    0
#define RGB_WORK_BREATHING_MODE   1

/*
 * 只能识别汉字，将要识别的汉字转换成拼音字母，每个汉字之间空格隔开，比如：幻尔科技 --> huan er ke ji
 * 最多添加50个词条，每个词条最长为79个字符，每个词条最多10个汉字
 * 每个词条都对应一个识别号（1~255随意设置）不同的语音词条可以对应同一个识别号，
 * 比如“幻尔科技”和“幻尔”都可以将识别号设置为同一个值
 * 模块上的STA状态灯：亮起表示正在识别语音，灭掉表示不会识别语音，当识别到语音时状态灯会变暗，或闪烁，等待读取后会恢复当前的状态指示
 */
#define ASR_IIC_ADDR  0x79
#define ASR_MIC_VOL_ADDR  103
#define ASR_RESULT_ADDR           100
//识别结果存放处，通过不断读取此地址的值判断是否识别到语音，不同的值对应不同的语音，
#define ASR_WORDS_ERASE_ADDR      101//擦除所有词条
#define ASR_MODE_ADDR             102
//识别模式设置，值范围1~3
//1：循环识别模式。状态灯常亮（默认模式）    
//2：口令模式，以第一个词条为口令。状态灯常灭，当识别到口令词时常亮，等待识别到新的语音,并且读取识别结果后即灭掉
//3：按键模式，按下开始识别，不按不识别。支持掉电保存。状态灯随按键按下而亮起，不按不亮
#define ASR_ADD_WORDS_ADDR        160//词条添加的地址，支持掉电保存

#define TTS_MODULE_I2C_ADDR    0x40

class HWSensor {
  public:
    HWSensor();
    bool wireWriteByte(uint8_t addr, uint8_t val);
    bool wireWriteDataArray(uint8_t addr, uint8_t reg,uint8_t *val,unsigned int len);
    int wireReadDataArray(uint8_t addr, uint8_t reg, uint8_t *val, unsigned int len);
    
    /*语音识别模块*/
    void asrSetSensitivity(uint8_t vol);
    bool asrSetMode(uint8_t mode);
    bool asrAddWords(unsigned char idNum, unsigned char *words);
    void asrEraseWords(void);
    unsigned char asrGetResult(void);

    /*发光超声波*/
    void ultrasoundBreathing(uint8_t r1, uint8_t g1, uint8_t b1, uint8_t r2, uint8_t g2, uint8_t b2);
    void ultrasoundColor(uint8_t r1, uint8_t g1, uint8_t b1, uint8_t r2, uint8_t g2, uint8_t b2);
    uint16_t ultrasoundGetDistance();

    /*语音合成模块*/
    bool ttsSpeak(unsigned char *sign,unsigned char *words);

    /*温湿度传感器*/
    float getTemperature(void);// 获取温度值
    float getHumidity(void);// 获取湿度值
};
#endif
