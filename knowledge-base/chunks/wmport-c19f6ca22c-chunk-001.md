---
chunk_id: wmport-c19f6ca22c-chunk-001
doc_id: wmport-c19f6ca22c
title: "ifndef WMPort_H"
semantic_key: "ifndef WMPort_H"
keywords: ["ifndef", "wmport_h", "raw", "github", "hiwonder-tonybot", "arduino", "led_matrix_display", "src", "wmmatrixled", "wmport"]
---

#ifndef WMPort_H
#define WMPort_H

#include <Arduino.h>
#include <stdint.h>
#include <stdlib.h>

typedef struct
{
	uint8_t pin1;
	uint8_t pin2;
}WMPin;

class WMPort
{
public:
	WMPort(void);

	void setOutput(uint8_t port);
	void setInput(uint8_t port);
	void setPuOn(uint8_t port);
	bool readDPort(uint8_t port);
	bool readDPuPort(uint8_t port);
	int16_t readAport(uint8_t port);
	void writeDport(uint8_t port,bool value);
	void writeAport(uint8_t port,int16_t value);
	
};
#endif
