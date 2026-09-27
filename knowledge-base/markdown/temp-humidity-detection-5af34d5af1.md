---
doc_id: temp-humidity-detection-5af34d5af1
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/传感器开发课程/温湿度检测/temp_humidity_detection.py
source_type: official
status: processed
---

import Hiwonder
import Hiwonder_IIC
from time import ticks_ms, sleep_ms

# 数字0-9的点阵数据(以及空白字符)
nums = [
    [0x7E, 0x42, 0x42, 0x7E],  # 0
    [0x00, 0x00, 0x7E, 0x00],  # 1
    [0x7A,0x4A,0x4A,0x4E],  # 2
    [0x4A,0x4A,0x4A,0x7E],  # 3
    [0x0E,0x08,0x08,0x7E],  # 4
    [0x4E,0x4A,0x4A,0x7A],  # 5
    [0x7E,0x4A,0x4A,0x7A],  # 6
    [0x02,0x02,0x02,0x7E],  # 7
    [0x7E,0x4A,0x4A,0x7E],  # 8
    [0x4E,0x4A,0x4A,0x7E],  # 9
    [0x00, 0x00, 0x00, 0x00]   # null
]

t_str = [0x02, 0x38, 0x44, 0x44] # 摄氏度符号
b_str = [0x26, 0x16, 0x68, 0x64] # 百分号

# 初始化硬件
iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
tmp = Hiwonder_IIC.AHTxx(iic)  # 温湿度传感器
mx = Hiwonder.Digitaltube(2 , 5)  # 点阵显示模块

# 全局变量
last_time = 0
step = 0
temperature = 0
humidity = 0

# 初始化机器人
tony.runActionGroup(0, 1)  # 立正动作
tony.attachHead()  # 使能舵机
sleep_ms(200)  # 等待初始化
tony.detachHead()  # 释放舵机

print("start.")

# 主循环
while True:
    if ticks_ms() > last_time:
        last_time = ticks_ms() + 2000
        mx_data = [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]
        if step == 0:  # 温度显示
            temperature = tmp.read_temperature()
            # 显示十位
            index = temperature // 10
            if index == 0:
                mx_data[1:5] = nums[10]  # 空白显示
            else:
                mx_data[1:5] = nums[index]
            
            # 显示个位
            index = temperature % 10
            mx_data[6:10] = nums[index]
            
            # 显示温度符号
            mx_data[11:15] = t_str
            print("Temperature: {}".format(temperature))
            step = 1
            
        else:  # 湿度显示
            humidity = tmp.read_humidity()
            # 显示十位
            index = humidity // 10
            if index == 0:
                mx_data[1:5] = nums[10]  # 空白显示
            else:
                mx_data[1:5] = nums[index]
            
            # 显示个位
            index = humidity % 10
            mx_data[6:10] = nums[index]
            
            # 显示百分比符号
            mx_data[11:15] = b_str
            print("Humidity: {}".format(humidity))
            step = 0
        
        mx.drawBitMap(mx_data)
            
    sleep_ms(50)  # 适当延时
