---
doc_id: hwsensor-62f436d56a
title: "include <Wire.h>"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/触摸控制/touch_action/HWSensor.cpp
source_type: official
status: processed
---

# include <Wire.h>

#include <Wire.h>
#include "HWSensor.h"
#include "base_config.h"
#include "src/Sensor/AHTxx.h"

AHTxx aht10(AHTXX_ADDRESS_X38, AHT1x_SENSOR);

HWSensor::HWSensor()
{
  Wire.begin(IO_SDA,IO_SCL);
}

//写字节
bool HWSensor::wireWriteByte(uint8_t addr, uint8_t val)
{
    Wire.beginTransmission(addr);
    Wire.write(val);
    if( Wire.endTransmission() != 0 ) 
    {
        return false;
    }
    return true;
}

//写多个字节
bool HWSensor::wireWriteDataArray(uint8_t addr, uint8_t reg,uint8_t *val,unsigned int len)
{
    unsigned int i;

    Wire.beginTransmission(addr);
    Wire.write(reg);
    for(i = 0; i < len; i++) 
    {
        Wire.write(val[i]);
    }
    if( Wire.endTransmission() != 0 ) 
    {
        return false;
    }
    return true;
}

//读指定长度字节
int HWSensor::wireReadDataArray(uint8_t addr, uint8_t reg, uint8_t *val, unsigned int len)
{
    unsigned char i = 0;  
    /* Indicate which register we want to read from */
    if (!wireWriteByte(addr, reg)) 
    {
        return -1;
    }
    Wire.requestFrom(addr, len);
    while (Wire.available()) 
    {
        if (i >= len) 
        {
            return -1;
        }
        val[i] = Wire.read();
        i++;
    }
    /* Read block data */    
    return i;
}

//设置灵敏度
//范围0x10-0x53
//默认0x45
void HWSensor::asrSetSensitivity(uint8_t vol)
{
  wireWriteDataArray(ASR_IIC_ADDR, ASR_MIC_VOL_ADDR, &vol, 1);
  delay(60); 
}

//设置模式
//1：循环识别模式    
//2：口令模式，以第一个词条为口令    
//3：按键模式，按下开始识别
//设置成功返回true
bool HWSensor::asrSetMode(uint8_t mode)
{
  bool result;
  result = wireWriteDataArray(ASR_IIC_ADDR, ASR_MODE_ADDR, &mode, 1);
  delay(60); //至少延时100ms
  return result;  
}

/*
 * 添加词条函数，
 * idNum：词条对应的识别号，1~255随意设置。识别到该号码对应的词条语音时，
 *        会将识别号存放到ASR_RESULT_ADDR处，等待主机读取，读取后清0
 * words：要识别汉字词条的拼音，汉字之间用空格隔开
 * 执行该函数，词条是自动往后排队添加的。
