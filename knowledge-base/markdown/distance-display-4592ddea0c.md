---
doc_id: distance-display-4592ddea0c
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/传感器开发课程/测距显示/distance_display.py
source_type: official
status: processed
---

import Hiwonder
import Hiwonder_IIC
import time

iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar  = Hiwonder_IIC.I2CSonar(iic)
ledmatrix = Hiwonder.Digitaltube(2,5)

tony.runActionGroup(0 , 1)
tony.attachHead()
time.sleep(1)
tony.detachHead()

while True:
  distance = sonar.getDistance() * 10
  distance = distance if distance < 1000 else 1000
  color_diff = distance if distance < 250 else 250
  sonar.setRGB(0 , 250-color_diff , color_diff , 0)
  ledmatrix.showNum(distance)
  time.sleep_ms(200)
