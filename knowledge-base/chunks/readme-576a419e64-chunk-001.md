---
chunk_id: readme-576a419e64-chunk-001
doc_id: readme-576a419e64
title: "人脸识别 IIC寄存器说明"
semantic_key: "人脸识别 IIC寄存器说明"
keywords: ["iic", "raw", "github", "hiwonder-tonybot", "arduino", "iot", "facedetection", "readme"]
---

# 人脸识别 IIC寄存器说明

## 设备地址：0x52



- ### 人脸识别

  | 寄存器地址 |                   数据格式(unsigned char)                    |
  | :--------: | :----------------------------------------------------------: |
  |    0x01    | data[0]:人脸中心X轴坐标<br/>data[1]:人脸中心Y轴坐标<br/>data[2]:检测框宽度<br/>data[3]:检测框长度<br/> |
