---
doc_id: color-recognition-6666afd275
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/AI视觉项目课程/7.4 颜色识别/color_recognition.py
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
cam = Hiwonder_IIC.ESP32S3Cam(iic)  # ESP32S3Cam通讯对象
mx = Hiwonder.Digitaltube(5, 2)   # 点阵显示模块
sonar.setRGB(0, 0, 0, 0)

# 初始化机器人
tony.runActionGroup(0, 1)  # 初始化机器人姿态
tony.attachHead()          # 设定舵机控制io口
tony.moveHeadAngle(90)
sleep_ms(200)             # 等待底板初始化完毕
tony.detachHead()         # 失能舵机接口

sleep_ms(2000)

print("start.")

def display_color(text):
    """显示颜色文字"""
    str_len = len(text)
    for i in range(16, -str_len*6, -1):  # 滚动显示
        mx.drawStr(0 , i, text)
        sleep_ms(40)      # 滚动速度
    sleep_ms(200)

def colorDetect():
    """颜色检测函数"""
    res = cam.read_color(1)
    if res is not None:
        if res[2] > 0:
            return 1
    res = cam.read_color(2)
    if res is not None:
        if res[2] > 0:
            return 2
    res = cam.read_color(3)
    if res is not None:
        if res[2] > 0:
            return 3
    return 0

# 主循环
while True:
    # 获取颜色检测数据
    res = colorDetect()
    
    if res == 0:  # 无检测到
        mx.clear()
        
    elif res == 1:  # 检测到红色
        display_color("Red")
        
    elif res == 2:  # 检测到绿色
        display_color("Green")
        
    elif res == 3:  # 检测到蓝色
        display_color("Blue")
        
    sleep_ms(100)  # 注意需要给相应的延时
