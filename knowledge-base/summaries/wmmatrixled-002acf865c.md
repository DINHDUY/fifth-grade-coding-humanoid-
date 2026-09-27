---
doc_id: wmmatrixled-002acf865c
title: "include \"WMMatrixLed.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/语音交互项目课程/语音控制/ASRcontrol/src/WMMatrixLed/WMMatrixLed.cpp
source_type: official
status: processed
---

# include "WMMatrixLed.h"

#include "WMMatrixLed.h"


WMMatrixLed::WMMatrixLed(void)
{

}

WMMatrixLed::WMMatrixLed(uint8_t SCK_Pin, uint8_t DIN_Pin)
{
	u8_SCKPin = SCK_Pin; 
	u8_DINPin = DIN_Pin;

	writeDport(u8_SCKPin,1);
	writeDport(u8_DINPin,1);

    writeByte(Mode_Address_Auto_Add_1);
    setBrightness(Brightness_5);
    clearScreen();
}


void WMMatrixLed::reset(uint8_t port){
  //   u8_SCKPin = wmPort[port].pin1;
	// u8_DINPin = wmPort[port].pin2;

	writeDport(u8_SCKPin,1);
	writeDport(u8_DINPin,1);

    writeByte(Mode_Address_Auto_Add_1);
    setBrightness(Brightness_5);
    clearScreen();
}


void WMMatrixLed::writeByte(uint8_t data)
{
    //Start
	writeDport(u8_SCKPin,1);
	writeDport(u8_DINPin,0);
	
    for(char i=0;i<8;i++)
    {
        writeDport(u8_SCKPin, 0);
        writeDport(u8_DINPin, (data & 0x01));
        writeDport(u8_SCKPin, 1);
        data = data >> 1;
    }

    //End
    writeDport(u8_SCKPin, 0);
    writeDport(u8_DINPin, 0);
    writeDport(u8_SCKPin, 1);
    writeDport(u8_DINPin, 1);
}


void WMMatrixLed::writeBytesToAddress(uint8_t Address, const uint8_t *P_data, uint8_t count_of_data)
{
    uint8_t T_data;

    if(Address > 15 || count_of_data==0)
        return;

    Address = ADDRESS(Address);

    //Start
    writeDport(u8_SCKPin, 1);
    writeDport(u8_DINPin, 0);

    //write Address
    for(char i=0;i<8;i++)
    {
        writeDport(u8_SCKPin, 0);
        writeDport(u8_DINPin, (Address & 0x01));
        writeDport(u8_SCKPin, 1);
        Address = Address >> 1;
    }


    //write data
    for(uint8_t k=0; k<count_of_data; k++)
    {
        T_data = *(P_data + k);

        for(char i=0;i<8;i++)
        {
            writeDport(u8_SCKPin, 0);
            writeDport(u8_DINPin, (T_data & 0x80));
            writeDport(u8_SCKPin, 1);
            T_data = T_data <<
