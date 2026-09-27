---
doc_id: tonybot-uart-70e7ebb072
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/串口通信实操课程/Tonybot_uart.py
source_type: official
status: processed
---

# import Hiwonder

import Hiwonder
import Hiwonder_IIC
from time import sleep_ms

# 初始化硬件
iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar = Hiwonder_IIC.I2CSonar(iic)
buzzer = Hiwonder.Buzzer()
imu = Hiwonder_IIC.MPU()
uart = Hiwonder.UART(9600 , 32 , 33)  # 初始化串口

# 初始化机器人
tony.runActionGroup(0, 1)  # 初始化机器人姿态
tony.attachHead()          # 设定舵机控制io口
tony.moveHeadAngle(90)
sleep_ms(200)             # 等待底板初始化完毕
tony.detachHead()         # 失能舵机接口
sleep_ms(2000)           # 等待IMU初始化完成
buzzer.playTone(1500, 100, False)

print("start.")

'''
串口指令示例：
CMD|1|9|$
CMD|2|90|$
CMD|2|180|$
CMD|2|0|$
CMD|3|$
CMD|4|$
CMD|5|$
'''

def start_main():
    """主函数"""
    while True:
        if uart.contains_data("CMD"):
            _BLE_REC_DATA = uart.read_uart_cmd()
            if not _BLE_REC_DATA:
                continue
            _DEAL_DATA = uart.parse_uart_cmd(_BLE_REC_DATA)
            _COMMAND = int(_DEAL_DATA[0])
            
            if _COMMAND == 1:  # 动作组调用
                tony.runActionGroup(int(_DEAL_DATA[1]), 1)
                tony.waitForStop(2000)
                
            elif _COMMAND == 2:  # 头部舵机控制
                tony.attachHead()
                tony.moveHeadAngle(int(_DEAL_DATA[1]))
                sleep_ms(500)
                tony.detachHead()
                
            elif _COMMAND == 3:  # 电池电量读取
                voltage = tony.getBatteryVolt(40)
                uart.send_data("CMD|3|{}|$".format(voltage))
                
            elif _COMMAND == 4:  # 超声波数据
                distance = (int)(sonar.getDistance() * 10)
                uart.send_data("CMD|4|{}|$".format(distance if distance > 0 else -1))
                
            elif _COMMAND == 5:  # IMU数据
                angle = imu.read_angle()
                uart.send_data("CMD|5|{}|{}|$".format((int
