---
doc_id: breathing-light-d96d57bb75
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/传感器开发课程/呼吸灯/breathing_light.py
source_type: official
status: processed
---

import Hiwonder
import Hiwonder_IIC
import time

iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar  = Hiwonder_IIC.I2CSonar(iic)

tony.runActionGroup(0 , 1)
tony.attachHead()
time.sleep(1)
tony.detachHead()


sonar.setRGBBreathingValue(0, 0, 20, 0, 0, 20)
