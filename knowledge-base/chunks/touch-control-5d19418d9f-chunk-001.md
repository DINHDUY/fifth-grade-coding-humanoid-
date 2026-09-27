---
chunk_id: touch-control-5d19418d9f-chunk-001
doc_id: touch-control-5d19418d9f
title: "import Hiwonder"
semantic_key: "import Hiwonder"
keywords: ["import", "hiwonder", "raw", "github", "hiwonder-tonybot", "python", "touch_control"]
---

import Hiwonder
import Hiwonder_IIC
from time import ticks_ms, sleep_ms

# 初始化硬件
iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar = Hiwonder_IIC.I2CSonar(iic)
touch = Hiwonder.Button(13)  # 触摸传感器,使用IO13引脚

# 全局变量
enter_flag = False

# 初始化机器人
tony.runActionGroup(0, 1)  # 立正动作
tony.attachHead()  # 使能舵机
sleep_ms(1000)
tony.detachHead()  # 释放舵机
print("start.")

# 主循环
while True:
    if touch.read():  # 检测到触摸
        if not enter_flag:  # 避免重复触发
            enter_flag = True
            tony.runActionGroup(10, 1)  # 执行动作组10
    else:
        enter_flag = False
        
    sleep_ms(50)
