---
chunk_id: breathing-light-d96d57bb75-chunk-001
doc_id: breathing-light-d96d57bb75
title: "import Hiwonder"
semantic_key: "import Hiwonder"
keywords: ["import", "hiwonder", "raw", "github", "hiwonder-tonybot", "python", "breathing_light"]
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
