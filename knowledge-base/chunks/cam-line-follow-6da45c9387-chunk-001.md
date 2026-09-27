---
chunk_id: cam-line-follow-6da45c9387-chunk-001
doc_id: cam-line-follow-6da45c9387
title: "import Hiwonder"
semantic_key: "import Hiwonder"
keywords: ["import", "hiwonder", "raw", "github", "hiwonder-tonybot", "python", "cam_line_follow"]
---

import Hiwonder
import Hiwonder_IIC
from time import sleep_ms

# 初始化硬件
iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar = Hiwonder_IIC.I2CSonar(iic)
cam = Hiwonder_IIC.ESP32S3Cam(iic)  # ESP32S3Cam通讯对象
sonar.setRGB(0, 0, 0, 0)

# 动作组定义
TURN_RIGHT = 66    # 右转动作组
TURN_LEFT = 65     # 左转动作组
GO_STRAIGHT = 63   # 直走动作
RETREAT = 22       # 后退动作
TRANSITION = 18    # 过渡动作（右倾）

# 阈值定义
LEFT_MIN = 300//2 - 40   # 左临界值
RIGHT_MAX = 300//2 + 40  # 右临界值

# 初始化机器人
tony.runActionGroup(0, 1)  # 初始化机器人姿态
tony.attachHead()          # 设定舵机控制io口
tony.moveHeadAngle(90)
sleep_ms(200)             # 等待底板初始化完毕
sonar.setRGB(0, 0, 0, 0)  # 关闭LED
sleep_ms(2000)

print("start.")

step = 0  # 状态机步骤

def body_follow(x):
    """机体运动函数"""
    global step
    print(x)
    # 
    if not tony.isRunning():  # 若无动作进行
        if step == 0:
            # 在中间，直走
            if LEFT_MIN < x < RIGHT_MAX:
                tony.runActionGroup(GO_STRAIGHT, 1)
                sleep_ms(850)
            # 左偏，左转
            elif 0 < x < LEFT_MIN:
                tony.runActionGroup(TURN_LEFT, 2)
                sleep_ms(2700)
                step = 1
            # 右偏
            else:
                tony.runActionGroup(TURN_RIGHT, 2)
                sleep_ms(2850)
                step = 2
        elif step == 1:  # 左偏
            if 0 < x < LEFT_MIN:  # 未调整
                tony.runActionGroup(TURN_LEFT, 1)
                sleep_ms(1350)
            else:
                tony.runActionGroup(GO_STRAIGHT, 1)
                sleep_ms(900)
                step = 0
        elif step == 2:  # 右偏
            if x > RIGHT_MAX:  # 未调整
                tony.runActionGroup(TURN_RIGHT, 1)
                sleep_ms(1450)
            else:
                tony.runActionGroup(GO_STRAIGHT, 1)
                sleep_ms(900)
                step = 0
        else:
            step = 0

# 主循环
while True:
    # 获取线条位置
    result = cam.read_color(3)
    if result is not None:
        # 计算x中心
        x = result[0] + result[2]/2
        body_follow(x)
    sleep_ms(50)  # 注意需要给相应的延时
