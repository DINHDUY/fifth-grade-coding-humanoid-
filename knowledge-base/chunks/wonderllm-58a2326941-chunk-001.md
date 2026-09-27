---
chunk_id: wonderllm-58a2326941-chunk-001
doc_id: wonderllm-58a2326941
title: "include \"WonderLLM.h\""
semantic_key: "include \"WonderLLM.h\""
keywords: ["include", "wonderllm", "raw", "github", "hiwonder-tonybot", "arduino", "tonybot_ai", "cpp"]
---

#include "WonderLLM.h"

#include "Wire.h"

#include "base_config.h"
#include "hiwonder_i2c.h"

#define MAX_JSON_SIZE 256

WonderLLM_Info WonderLLM_hiwonder;

namespace {

const char tool_finish[] =
    "{\"command\":\"mcp_setting\",\"params\":\"true\"}";

const char tool_buzzer[] =
    "{\"tool_name\":\"set_buzzer\",\"command\":\"控制机器人的蜂鸣器时调用这个工具。count是蜂鸣器响的次数,freq是蜂鸣器频率,频率范围为100-5000\","
    "\"params\":[[\"count\",\"int\"],[\"freq\",\"int\",100,5000]],"
    "\"block\":\"true\",\"return\":\"false\"}";

const char tool_led[] =
    "{\"tool_name\":\"set_led_color\",\"command\":\"设置左右RGB灯颜色。lr,lg,lb是左灯RGB, rr,rg,rb是右灯RGB, 范围0-255。\","
    "\"params\":[[\"lr\",\"int\",0,255],[\"lg\",\"int\",0,255],"
    "[\"lb\",\"int\",0,255],[\"rr\",\"int\",0,255],[\"rg\",\"int\",0,255],"
    "[\"rb\",\"int\",0,255]],\"block\":\"true\",\"return\":\"false\"}";

const char tool_action_group[] =
    "{\"tool_name\":\"set_action_group\",\"command\":\"控制机器人执行动作组时调用这个工具。actionNum为动作组代号,0号立正(停下),1号前进,2号后退,3号左转,4号右转,7号俯卧撑,8号仰卧起坐,9号挥手,101号用于后倒时恢复,102号用于前倒时恢复,150号至158号都是舞蹈,executeNum为动作组运行次数\","
    "\"params\":[[\"actionNum\",\"int\",0,200],[\"executeNum\",\"int\"]],\"block\":\"true\",\"return\":\"false\"}";

const char tool_mode[] =
    "{\"tool_name\":\"set_mode\",\"command\":\"切换机器人的模式时调用这个工具，可切换的模式包括避障、跟随:'avoid','follow','normal'\","
    "\"params\":[[\"running_mode\",\"string\"]],\"block\":\"true\","
    "\"return\":\"false\"}";

const char tool_status[] =
    "{\"tool_name\":\"self.robot.get_status\",\"command\":\"获取机器人的实时状态时调用这个工具。可查询'battery'(单位mV),'distance'(单位mm),'running_mode','Bodystate'(1前倒,0立正,2后倒)。\",\"params\":[[\"status_name\",\"string\"]],\"block\":\"true\",\"return\":\"true\"}";

static void delay_ms(int ms_num) {
  delay(ms_num);
}

static uint32_t Get_time_now() {
  return millis();
}

static uint8_t calculate_checksum(const uint8_t* data, uint16_t len) {
  uint8_t checksum = 0;
  for (uint16_t i = 0; i < len; ++i) {
    checksum ^= data[i];
  }
  return checksum;
}

static void IIC_Config_MCP_Transmit() {
  Wire.setClock(400000);
}

static void IIC_Config_normal_Transmit() {
  Wire.setClock(100000);
}

static bool Detect_WonderLLM() {
  Wire.beginTransmission(WONDERLLM_SLAVE_ADDRESS);
  delay_ms(15);
  return Wire.endTransmission() == 0;
}

int WonderLLM_Send_Data(uint8_t* buffer, uint16_t len) {
  return wireWritemultiByte(WONDERLLM_SLAVE_ADDRESS, buffer, len) ? 0 : 4;
}

static int WonderLLM_Receive_Data(uint8_t* buffer, uint16_t size, bool stop_flag) {
  if (size == 0) {
    return 0;
  }

  uint16_t index = 0;
  const int receive_result =
      Wire.requestFrom((uint8_t)WONDERLLM_SLAVE_ADDRESS, (size_t)size, stop_flag);
  if (receive_result == 0) {
    return 1;
  }
  if (receive_result != size) {
    return 3;
  }

  const uint32_t start_time = Get_time_now();
  while (index < size && Wire.available()) {
    buffer[index++] = Wire.read();
    if (Get_time_now() - start_time > I2C_TIMEOUT) {
      return 2;
    }
  }

  return index == size ? 0 : 3;
}

static bool send_frame(const uint8_t* data, uint16_t len) {
  if (data == NULL || len == 0) {
    return false;
  }
  return WonderLLM_Send_Data((uint8_t*)data, len) == 0;
}

static bool receive_frame_head(uint16_t* part_ID, uint16_t* part_num, uint16_t* data_len) {
  uint8_t header[8];
  if (WonderLLM_Receive_Data(header, sizeof(header), true) != 0) {
    return false;
  }

  if (header[0] != 0xAA || header[1] != 0x55) {
    return false;
  }

  *data_len = ((uint16_t)header[2] << 8) | header[3];
  if (*data_len == 0 || *data_len > 31) {
    return false;
  }

  *part_ID = ((uint16_t)header[5] << 8) | header[4];
  *part_num = ((uint16_t)header[7] << 8) | header[6];
  return true;
}

static bool receive_frame(uint8_t* buffer, uint16_t* len) {
  uint16_t data_len = 0;
  uint16_t part_ID = 0;
  uint16_t part_num = 0;
  uint16_t buffer_index = 0;
  const uint16_t data_len_max = *len;

  *len = 0;
  if (!receive_frame_head(&part_ID, &part_num, &data_len)) {
    return false;
  }

  if (part_ID != 1) {
    return false;
  }

  *len += data_len;
  for (uint16_t i = 1; i <= part_num; ++i) {
    delay_ms(10);

    if ((buffer_index + data_len + 1) > data_len_max) {
      return false;
    }

    if (WonderLLM_Receive_Data(buffer + buffer_index, data_len + 1, true) != 0) {
      return false;
    }

    if (buffer[buffer_index + data_len] !=
        calculate_checksum(buffer + buffer_index, data_len)) {
      memset(buffer, 0, data_len_max);
      return false;
    }

    buffer_index += data_len;

    if (i < part_num) {
      uint16_t next_part_ID = 0;
      uint16_t next_part_num = 0;
      uint16_t next_data_len = 0;

      delay_ms(100);
      if (!receive_frame_head(&next_part_ID, &next_part_num, &next_data_len)) {
        return false;
      }
      if ((part_ID + 1) != next_part_ID || next_part_num != part_num) {
        return false;
      }

      part_ID = next_part_ID;
      data_len = next_data_len;
      *len += data_len;
    }
  }

  return true;
}

static bool register_tools() {
  const char* tools[] = {
      tool_buzzer,
      tool_led,
      tool_action_group,
      tool_mode,
      tool_status,
      tool_finish,
  };

  for (size_t i = 0; i < sizeof(tools) / sizeof(tools[0]); ++i) {
    if (!send_frame((uint8_t*)tools[i], strlen(tools[i]))) {
      return false;
    }
    delay_ms(20);
  }

  return true;
}

static int parse_command(WonderLLM_Info* obj, const char* json_str) {
  if (strstr(json_str, "status_name") != NULL) {
    if (strstr(json_str, "battery") != NULL) {
      return Frame_get_status_battery;
    }
    if (strstr(json_str, "distance") != NULL) {
      return Frame_get_status_distance;
    }
    if (strstr(json_str, "running_mode") != NULL) {
      return Frame_get_status_running_mode;
    }
    if (strstr(json_str, "Bodystate") != NULL) {
      return Frame_get_status_Bodystate;
    }
    return Frame_NULL;
  }

  if (strstr(json_str, "\"lr\"") != NULL) {
    char* ptr = strstr(json_str, "\"lr\"");
    if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_left[0]));
    ptr = strstr(json_str, "\"lg\"");
    if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_left[1]));
    ptr = strstr(json_str, "\"lb\"");
    if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_left[2]));
    ptr = strstr(json_str, "\"rr\"");
    if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_right[0]));
    ptr = strstr(json_str, "\"rg\"");
    if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_right[1]));
    ptr = strstr(json_str, "\"rb\"");
    if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_right[2]));
    return Frame_set_led_color;
  }

  if (strstr(json_str, "\"count\"") != NULL) {
    char* ptr = strstr(json_str, "\"count\"");
    if (ptr) sscanf(ptr, "%*[^:]:%hhd", &(obj->buzzer_count));
    ptr = strstr(json_str, "\"freq\"");
    if (ptr) sscanf(ptr, "%*[^:]:%hu", &(obj->buzzer_frequency));
    return Frame_set_buzzer;
  }

  if (strstr(json_str, "\"running_mode\"") != NULL) {
    char* ptr = strstr(json_str, "\"running_mode\"");
    int mode_value = 0;
    if (ptr == NULL) {
      return Frame_NULL;
    }

    if (strstr(ptr, "avoid") != NULL) {
      obj->running_mode = 1;
    } else if (strstr(ptr, "follow") != NULL) {
      obj->running_mode = 2;
    } else if (strstr(ptr, "normal") != NULL) {
      obj->running_mode = 0;
    } else if (sscanf(ptr, "%*[^:]:%d", &mode_value) == 1) {
      obj->running_mode = (char)mode_value;
    } else {
      return Frame_NULL;
    }

    return Frame_set_running_mode;
  }

  if (strstr(json_str, "\"actionNum\"") != NULL) {
    char* ptr = strstr(json_str, "\"actionNum\"");
    if (ptr) sscanf(ptr, "%*[^:]:%hhd", &(obj->ActionNum));
    ptr = strstr(json_str, "\"executeNum\"");
    if (ptr) sscanf(ptr, "%*[^:]:%hhd", &(obj->ExecuteActionNum));
    return Frame_ActionGroup;
  }

  if (strstr(json_str, "vision") != NULL) {
    return Frame_vision_analysis;
  }

  return Frame_NULL;
}

}  // namespace

bool WonderLLM_Init(void) {
  Wire.setPins(IO_SDA, IO_SCL);
  Wire.setBufferSize(1024);
  Wire.begin();

  const uint32_t start_tick = Get_time_now();
  while (true) {
    if (Detect_WonderLLM()) {
      IIC_Config_MCP_Transmit();
      delay_ms(5);
      register_tools();
      IIC_Config_normal_Transmit();
      return true;
    }

    if (Get_time_now() - start_tick > 3000) {
      return false;
    }
    delay_ms(100);
  }
}

void WonderLLM_Info_Get(WonderLLM_Info* obj) {
  obj->Frame_mode = Frame_NULL;

  if (!Detect_WonderLLM()) {
    obj->Detection_WonderLLM = 0;
    return;
  }

  obj->Detection_WonderLLM = 1;
  uint16_t received_len = sizeof(obj->json_data_raw) - 1;
  if (!receive_frame((uint8_t*)obj->json_data_raw, &received_len)) {
    return;
  }
  if (received_len == 0 || received_len >= sizeof(obj->json_data_raw)) {
    return;
  }

  obj->json_data_raw[received_len] = '\0';
  obj->Frame_mode = (FrameMode)parse_command(obj, obj->json_data_raw);
}

void WonderLLM_Send_Action_Finish(void) {
  char json_str[72];
  snprintf(json_str, sizeof(json_str), "{\"command\":\"action_finish\",\"params\":\"true\"}");
  send_frame((uint8_t*)json_str, strlen(json_str));
}

void WonderLLM_Send_Status(const char* params_str) {
  char json_str[128];
  snprintf(json_str, sizeof(json_str), "{\"command\":\"status\",\"params\":%s}", params_str);
  send_frame((uint8_t*)json_str, strlen(json_str));
}

void WonderLLM_Request_Vision(const char* prompt) {
  char json_str[MAX_JSON_SIZE];
  snprintf(json_str, sizeof(json_str),
           "{\"tool_name\":\"mcu.request\",\"command\":\"vision\",\"params\":\"%s\"}",
           prompt);

  IIC_Config_MCP_Transmit();
  delay_ms(5);
  send_frame((uint8_t*)json_str, strlen(json_str));
}
