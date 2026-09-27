---
doc_id: hwsensor-73acd4fe4d
title: "include <Wire.h>"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/测距显示/LED_Matrix_display/HWSensor.cpp
source_type: official
status: processed
---

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
 */
bool HWSensor::asrAddWords(unsigned char idNum, unsigned char *words)
{
  Wire.beginTransmission(ASR_IIC_ADDR);
  Wire.write(ASR_ADD_WORDS_ADDR);
  Wire.write(idNum);
  Wire.write(words,strlen((const char*)words));
  if( Wire.endTransmission() != 0 )
    {
        delay(10);
        return false;
    }
    delay(10);
    return true;
}

//擦除添加的词条
void HWSensor::asrEraseWords(void)
{
  wireWriteDataArray(ASR_IIC_ADDR, ASR_WORDS_ERASE_ADDR,NULL,0);
  delay(60);  //至少延时60ms
}

//获取识别结果
unsigned char HWSensor::asrGetResult(void)
{
  unsigned char result;
  
  wireReadDataArray(ASR_IIC_ADDR, ASR_RESULT_ADDR,&result,1);
  return result;
}

//设置超声波rgb为呼吸灯模式
//r1，g1，b1表示右边rgb灯的呼吸周期，例如20，20，20，表示2s一个周期
//r2，g2，b2表示左边rgb灯的呼吸周期
void HWSensor::ultrasoundBreathing(uint8_t r1, uint8_t g1, uint8_t b1, uint8_t r2, uint8_t g2, uint8_t b2)
{
  uint8_t breathing[6]; 
  uint8_t value = RGB_WORK_BREATHING_MODE;
  
  wireWriteDataArray(ULTRASOUND_I2C_ADDR, RGB_WORK_MODE, &value, 1);
  breathing[0] = r1;breathing[1] = g1;breathing[2] = b1;//RGB1 蓝色
  breathing[3] = r2;breathing[4] = g2;breathing[5] = b2;//RGB2
  wireWriteDataArray(ULTRASOUND_I2C_ADDR, RGB1_R_BREATHING_CYCLE,breathing,6); //发送颜色值
}

//设置超声波rgb灯的颜色
//r1，g1，b1表示右边rgb灯的三原色的比例，范围0-255
//r2，g2，b2表示左边rgb灯的三原色的比例，范围0-255
void HWSensor::ultrasoundColor(uint8_t r1, uint8_t g1, uint8_t b1, uint8_t r2, uint8_t g2, uint8_t b2)
{
  uint8_t RGB[6]; 
  uint8_t value = RGB_WORK_SIMPLE_MODE;
  
  wireWriteDataArray(ULTRASOUND_I2C_ADDR, RGB_WORK_MODE,&value,1);
  RGB[0] = r1;RGB[1] = g1;RGB[2] = b1;//RGB1
  RGB[3] = r2;RGB[4] = g2;RGB[5] = b2;//RGB2
  wireWriteDataArray(ULTRASOUND_I2C_ADDR, RGB1_R,RGB,6);
}

//获取超声波测得的距离单位mm
uint16_t HWSensor::ultrasoundGetDistance()
{
  uint16_t distance;
  wireReadDataArray(ULTRASOUND_I2C_ADDR, 0,(uint8_t *)&distance,2);
  return distance;
}

//参数1表示文本控制标记，h[0]表示自动判断单词发音方式
//v[10]表示发育音量，更多的标记符可以查看数据手册，搜索"文本控制标记列表"
//参数2表示要播放的内容，支持中英文
bool HWSensor::ttsSpeak(unsigned char *sign,unsigned char *words) 
{
  unsigned short len,i;
  len = strlen((const char*)sign) + strlen((const char*)words) + 2;
  unsigned char head[] = {0xFD,0x00,0x02,0x01,0x01};   //发送数据文本编码为GB2312
  head[1] = len>>8;
  head[2] = len;

  Wire.beginTransmission(TTS_MODULE_I2C_ADDR);
  Wire.write(head,5);
  Wire.write(sign,strlen((const char*)sign));
  Wire.write(words,strlen((const char*)words));

  if( Wire.endTransmission() != 0 )
   {
        return false;
    }
    return true;
}

float HWSensor::getTemperature(void) {
  static float Temp = 0;
  float value = aht10.readTemperature();
  if (value != AHTXX_ERROR)
  {
    Temp = value;
  }
  return Temp;
}

float HWSensor::getHumidity(void)
{
  static float Humi = 0;
  float value = aht10.readHumidity();
  if (value != AHTXX_ERROR)
  {
    Humi = value;
  }
  return Humi;
}
