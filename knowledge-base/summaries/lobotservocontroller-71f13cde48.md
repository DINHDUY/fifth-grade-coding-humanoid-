---
doc_id: lobotservocontroller-71f13cde48
title: "include \"../../LobotServoController.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/呼吸灯/Breathing/src/LobotServoCtl/LobotServoController.cpp
source_type: official
status: processed
---

# include "../../LobotServoController.h"

#include "../../LobotServoController.h"
#include <Stream.h>

#define GET_LOW_BYTE(A) (uint8_t)((A))
//宏函数 获得A的低八位
#define GET_HIGH_BYTE(A) (uint8_t)((A) >> 8)
//宏函数 获得A的高八位
#define BYTE_TO_HW(A, B) ((((uint16_t)(A)) << 8) | (uint8_t)(B))
//宏函数 以A为高八位 B为低八位 合并为16位整形

LobotServoController::LobotServoController(HardwareSerial &A)
{
		//设运行中动作组号为0xFF，运行次数为0，运行中标识为false，电池电压为0
	numOfActinGroupRunning = 0xFF;
	actionGroupRunTimes = 0;
	isGetBatteryVolt = false;
	isRunning_ = false;
	batteryVoltage = 0;
	isUseHardwareSerial = true;
  SerialX = (Stream*)(&A);
}

/*******************************************************************************
 * Function:  moveServo
 * Description： 控制单个舵机转动
 * Parameters:   sevoID:舵机ID，Position:目标位置,Time:转动时间
                    舵机ID取值:0<=舵机ID<=31,Time取值: Time > 0
 * Return:       无返回
 * Others:
 ******************************************************************************/
void LobotServoController::moveServo(uint8_t servoID, uint16_t Position, uint16_t Time)
{
	uint8_t buf[11];
	if (servoID > 31 || !(Time > 0)) { //舵机ID不能打于31,可根据对应控制板修改
		return;
	}
	buf[0] = FRAME_HEADER;                   //填充帧头
	buf[1] = FRAME_HEADER;
	buf[2] = 8;                              //数据长度=要控制舵机数*3+5，此处=1*3+5
	buf[3] = CMD_SERVO_MOVE;                 //填充舵机移动指令
	buf[4] = 1;                              //要控制的舵机个数
	buf[5] = GET_LOW_BYTE(Time);             //填充时间的低八位
	buf[6] = GET_HIGH_BYTE(Time);            //填充时间的高八位
	buf[7] = servoID;                        //舵机ID
	buf[8] = GET_LOW_BYTE(Position);         //填充目标位置的低八位
	buf[9] = GET_HIGH_BYTE(Position);        //填充目标位置的高八位

	SerialX->write(buf, 10);
}

/*********************************************************************************
 * Function:  moveServos
 * Description： 控制多个舵机转动
 * Parameters:   servos[]:舵机结体
