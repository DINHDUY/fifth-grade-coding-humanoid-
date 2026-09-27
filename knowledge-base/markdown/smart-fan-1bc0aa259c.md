---
doc_id: smart-fan-1bc0aa259c
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/传感器开发课程/智能风扇/smart_fan.py
source_type: official
status: processed
---

import Hiwonder
import Hiwonder_IIC
from time import ticks_ms, sleep_ms

# 初始化硬件
iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar = Hiwonder_IIC.I2CSonar(iic)
fan = Hiwonder.Fan_IO(33,32)

# 全局变量
last_tick = 0

def getDistance():
    """获取距离"""
    Distance = sonar.getDistance() * 10
    return Distance

# 初始化
tony.runActionGroup(0, 1)  # 立正动作
tony.attachHead()  # 使能舵机
sleep_ms(1000)
tony.detachHead()  # 释放舵机
print("start.")

# 主循环
while True:
    if getDistance() < 300:  # 若距离<300mm
        sonar.setRGB(0, 0, 250, 0)  # 绿色
        tony.moveServo(16, 670, 500)  # 控制舵机
        sleep_ms(500)
        
        # 风扇开启
        fan.open()
        
        while True:
            sleep_ms(50)
            if getDistance() > 300:
                sonar.setRGB(0, 0, 0, 250)  # 蓝色
                # 风扇关闭
                fan.close()
                sleep_ms(500)
                tony.moveServo(16, 275, 500)
                sleep_ms(500)
                break
                
    sleep_ms(100)  # 适当延时
