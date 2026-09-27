---
doc_id: hwsensor-5e60b18564
title: "include <Wire.h>"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/温湿度检测/temperature_humidity/HWSensor.cpp
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
bool HWSensor::wireWriteData(uint8_t addr, uint8_t *val,unsigned int len)
{
    unsigned int i;

    Wire.beginTransmission(addr);
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
int HWSensor::wireReadData(uint8_t addr, uint8_t *val, unsigned int len)
{
    unsigned char i = 0;
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
        val[i] = Wir
