---
chunk_id: color-follow-38f061fae0-chunk-001
doc_id: color-follow-38f061fae0
title: "import Hiwonder"
semantic_key: "import Hiwonder"
keywords: ["import", "hiwonder", "raw", "github", "hiwonder-tonybot", "python", "color_follow"]
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

# 初始化机器人
tony.runActionGroup(0, 1)  # 初始化机器人姿态
tony.attachHead()          # 设定舵机控制io口
tony.moveHeadAngle(90)
sleep_ms(200)             # 等待底板初始化完毕
sonar.setRGB(0, 0, 0, 0)  # 关闭LED
sleep_ms(2000)

print("start.")

# 全局变量
left = 90        # 左边界阈值
right = 150      # 右边界阈值
dev = 4         # 转动角度步长
angle = 90      # 舵机角度

# 主循环
while True:
    # 获取识别结果
    result = cam.read_color(1)
    if result:
        # 计算x中心
        x = result[0] + result[2]//2
        print(x)
        
        # 若偏右
        if x > right:
            dev = int((x - right)*0.04)
            angle = max(0, angle - dev)
            
        # 若偏左
        elif x < left:
            dev = int((left - x)*0.04)
            angle = min(180, angle + dev)
            
        # 设置舵机角度
        tony.moveHeadAngle(angle)
        
    sleep_ms(100)  # 注意需要给相应的延时
