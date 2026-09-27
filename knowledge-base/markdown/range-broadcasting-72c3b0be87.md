---
doc_id: range-broadcasting-72c3b0be87
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/语音交互项目课程/测距播报/Range_broadcasting.py
source_type: official
status: processed
---

import Hiwonder
import Hiwonder_IIC
from time import sleep_ms

MIN_DISTANCE = 200

iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar  = Hiwonder_IIC.I2CSonar(iic)
asr = Hiwonder_IIC.asr_module(iic)

tony.runActionGroup(0 , 1)
tony.attachHead()
sleep_ms(1000)
tony.detachHead()

have_move = True

def sonar_task():
    """用户函数"""
    global have_move
    distance = sonar.getDistance() * 10
    if distance < MIN_DISTANCE and distance > 0:  # 如果测得距离小于指定距离
        global have_move
        have_move = True
        sonar.setRGB(0 , 0, 0, 250)
        tony.runActionGroup(9, 1)  # 运行9号动作组
        sleep_ms(500)
        asr.speak(asr.ASR_ANNOUNCER, 0x0F)  # 你好，欢迎光临
        sleep_ms(2000)
    else:
        if have_move:
            have_move = False
            sonar.setRGB(0 , 20, 0, 0)  # 设置发光超声波颜d色为绿色渐变
            tony.runActionGroup(0, 1)  # 运行0号动作组


# 主循环
while True:
    sonar_task()  # 用户函数
    sleep_ms(50)  # 注意需要给相应的延时
