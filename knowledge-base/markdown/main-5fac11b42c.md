---
doc_id: main-5fac11b42c
title: "﻿# Tonybot + WonderLLM + APP Remote (MicroPython)"
source_path: raw/github/Hiwonder-Tonybot/Python/AI大模型应用课程/01 大模型应用程序/main.py
source_type: official
status: processed
---

﻿# Tonybot + WonderLLM + APP Remote (MicroPython)

import _thread
import json
import machine
import time

import Hiwonder

import Hiwonder_IIC
from Hiwonder_BLE import BLE


def clamp(value, low, high):
    if value < low:
        return low
    if value > high:
        return high
    return value


class WonderLLMBridge:
    ADDR = 0x55

    def __init__(self, i2c_obj, i2c_mutex):
        self.i2c = i2c_obj
        self.i2c_mutex = i2c_mutex
        self.rx_parts = []
        self.expected_parts = 0



        self.tool_buzzer = {

            "tool_name": "set_buzzer",

            "command": "控制机器人的蜂鸣器时调用这个工具。count是蜂鸣器响的次数,freq是蜂鸣器频率,频率范围为100-5000",

            "params": [["count", "int"], ["freq", "int", 100, 5000]],
            "block": "true",
            "return": "false",
        }

        self.tool_led = {

            "tool_name": "set_led_color",

            "command": "设置左右RGB灯颜色。lr,lg,lb是左灯RGB, rr,rg,rb是右灯RGB, 范围0-255。",

            "params": [

                ["lr", "int", 0, 255],

                ["lg", "int", 0, 255],
                ["lb", "int", 0, 255],
                ["rr", "int", 0, 255],
                ["rg", "int", 0, 255],
                ["rb", "int", 0, 255],
            ],
            "block": "true",
            "return": "false",
        }
        self.tool_action_group = {
            "tool_name": "set_action_group",
            "command": "控制机器人执行动作组时调用这个工具。actionNum为动作组代号,0号立正(停下),1号前进,2号后退,3号左转,4号右转,7号俯卧撑,8号仰卧起坐,9号挥手,101号用于后倒时恢复,102号用于前倒时恢复,150号至158号都是舞蹈,executeNum为动作组运行次数",
            "params": [["actionNum", "int", 0, 200], ["executeNum", "int"]],
            "block": "true",
            "return": "false",
        }
        
        self.tool_mode = {
            "tool_name": "set_mode",
            "command": "切换机器人的模式时调用这个工具，可切换的模式包括避障、跟随:'avoid','follow','normal'",
            "params": [["running_mode", "string"]],
            "block": "true",
            "return": "false",

        }

        self.tool_status = {

            "tool_name": "self.robot.get_status",

            "command": "获取机器人的实时状态时调用这个工具。可查询'battery'(单位mV),'distance'(单位mm),'running_mode','Bodystate'(1前倒,0立正,2后倒)。",

            "params": [["status_name", "string"]],

            "block": "true",

            "return": "true",

        }

    def _xor_checksum(self, data):
        checksum = 0
        for b in data:
            checksum ^= b
        return checksum & 0xFF

    def _reset_fragments(self):
        self.rx_parts = []
        self.expected_parts = 0

    def _write_raw(self, raw):
        try:
            with self.i2c_mutex:
                self.i2c.writeto(self.ADDR, raw)
            return True
        except Exception:
            return False

    def send_json(self, obj):
        try:
            payload = json.dumps(obj).encode("utf-8")
        except Exception:
            return False
        return self._write_raw(payload)

    def ensure_online(self, timeout_ms=3000):
        end_tick = time.ticks_add(time.ticks_ms(), timeout_ms)
        while time.ticks_diff(end_tick, time.ticks_ms()) > 0:
            try:
                with self.i2c_mutex:
                    devices = self.i2c.scan()
                if self.ADDR in devices:
                    return True
            except Exception:
                pass
            time.sleep_ms(80)
        return False

    def register_tools(self):
        self.send_json(self.tool_buzzer)
        time.sleep_ms(20)
        self.send_json(self.tool_led)
        time.sleep_ms(20)
        self.send_json(self.tool_action_group)
        time.sleep_ms(20)
        self.send_json(self.tool_mode)
        time.sleep_ms(20)
        self.send_json(self.tool_status)
        time.sleep_ms(20)
        self.send_json({"command": "mcp_setting", "params": "true"})

    def send_action_finish(self):
        self.send_json({"command": "action_finish", "params": "true"})

    def send_status(self, pairs):
        self.send_json({"command": "status", "params": pairs})

    def _find_key(self, obj, key):
        if isinstance(obj, dict):
            if key in obj:
                return obj[key]
            for v in obj.values():
                ret = self._find_key(v, key)
                if ret is not None:
                    return ret
        elif isinstance(obj, list):
            for it in obj:
                ret = self._find_key(it, key)
                if ret is not None:
                    return ret
        return None

    def _to_int(self, value, default=0):
        try:
            return int(value)
        except Exception:
            return default

    def _read_one_payload(self):
        try:
            with self.i2c_mutex:
                header = self.i2c.readfrom(self.ADDR, 8)
            if len(header) != 8:
                return None

            if header[0] != 0xAA or header[1] != 0x55:
                self._reset_fragments()
                return None

            data_len = (header[2] << 8) | header[3]
            if data_len <= 0 or data_len > 512:
                self._reset_fragments()
                return None

            part_id = header[4] | (header[5] << 8)
            part_num = header[6] | (header[7] << 8)
            if part_id <= 0 or part_num <= 0 or part_id > part_num:
                self._reset_fragments()
                return None

            time.sleep_ms(2)
            with self.i2c_mutex:
                body = self.i2c.readfrom(self.ADDR, data_len + 1)
            if len(body) != data_len + 1:
                return None

            data = body[:-1]
            recv_checksum = body[-1]
            if self._xor_checksum(data) != recv_checksum:
                self._reset_fragments()
                return None

            if part_id == 1 or part_num != self.expected_parts:
                self.expected_parts = part_num
                self.rx_parts = [None] * part_num

            self.rx_parts[part_id - 1] = data

            if part_id == part_num:
                for item in self.rx_parts:
                    if item is None:
                        return None
                merged = b"".join(self.rx_parts)
                self._reset_fragments()
                return merged

        except Exception:
            self._reset_fragments()
            return None

        return None

    def _parse_payload(self, payload):
        if payload is None or len(payload) == 0:
            return None

        if len(payload) == 1:
            return None

        try:
            text = payload.decode("utf-8")
        except Exception:
            return None

        try:
            obj = json.loads(text)
        except Exception:
            return None

        status_name = self._find_key(obj, "status_name")
        if status_name is not None:
            return {"type": "status", "status_name": str(status_name)}

        lr = self._find_key(obj, "lr")
        if lr is not None:
            return {
                "type": "led",
                "lr": clamp(self._to_int(lr), 0, 255),
                "lg": clamp(self._to_int(self._find_key(obj, "lg")), 0, 255),
                "lb": clamp(self._to_int(self._find_key(obj, "lb")), 0, 255),
                "rr": clamp(self._to_int(self._find_key(obj, "rr")), 0, 255),
                "rg": clamp(self._to_int(self._find_key(obj, "rg")), 0, 255),
                "rb": clamp(self._to_int(self._find_key(obj, "rb")), 0, 255),
            }

        count = self._find_key(obj, "count")
        if count is not None:
            return {
                "type": "buzzer",
                "count": clamp(self._to_int(count), 0, 30),
                "freq": clamp(self._to_int(self._find_key(obj, "freq"), 1500), 100, 5000),
            }

        action_num = self._find_key(obj, "actionNum")
        if action_num is not None:
            return {
                "type": "action_group",
                "action_num": clamp(self._to_int(action_num), 0, 200),
                "execute_num": clamp(self._to_int(self._find_key(obj, "executeNum"), 1), 0, 100),
            }

        running_mode = self._find_key(obj, "running_mode")
        if running_mode is not None:
            return {
                "type": "mode",
                "running_mode": str(running_mode),
            }

        return None

    def poll_command(self):
        payload = self._read_one_payload()
        if payload is None:
            return None
        return self._parse_payload(payload)


# Hardware objects
mac = machine.unique_id()
ble = BLE(BLE.MODE_BLE_SLAVE, "Tonybot_{:02X}".format(mac[5]))
tonybot = Hiwonder.Tonybot()
beep = Hiwonder.Buzzer()
i2c_lock = _thread.allocate_lock()
i2c = Hiwonder_IIC.IIC(1, 23, 22, 400000)
i2csonar = Hiwonder_IIC.I2CSonar(i2c)
buzzer = Hiwonder.Buzzer()
llm_bridge = WonderLLMBridge(i2c, i2c_lock)
imu = None
try:
    imu = Hiwonder_IIC.MPU()
except Exception:
    imu = None

# Shared state for APP
status_motion = 0
status_action = 0xFF
status_func = 0

MODE_NORMAL = 0
MODE_AVOID = 1
MODE_FOLLOW = 2

MODE_NAME_TO_CODE = {
    "normal": MODE_NORMAL,
    "avoid": MODE_AVOID,
    "follow": MODE_FOLLOW
}

MODE_CODE_TO_NAME = {
    MODE_NORMAL: "normal",
    MODE_AVOID: "avoid",
    MODE_FOLLOW: "follow",
}

actfirst = 67
actgo = 63
actback = 96
actleftskate = 11
actrightskate = 12
actturnleft = 65
actturnright = 66
actstandquickly = 19
action_list = [actfirst, actgo, actback, actleftskate, actrightskate, actturnleft, actturnright]

MIN_DISTANCE_TURN = 200
BIAS = 0

_obs_step = 0
gDistance = 0
gLDistance = 0
gRDistance = 0
have_move = False
lastActionIsGoBack = False
_walk_step = 0
battery_volt = 0
l_stop = False
r_stop = False
body_state = 0  # 0-stand, 1-front fall(prone), 2-back fall(overturned)
front_fall_count = 0
back_fall_count = 0

llm_queue_lock = _thread.allocate_lock()
llm_cmd_queue = []


def push_llm_cmd(cmd):
    if cmd is None:
        return
    with llm_queue_lock:
        llm_cmd_queue.append(cmd)


def pop_llm_cmd(allowed_types=None):
    with llm_queue_lock:
        if not llm_cmd_queue:
            return None

        if allowed_types is None:
            return llm_cmd_queue.pop(0)

        for index, item in enumerate(llm_cmd_queue):
            if item.get("type", "") in allowed_types:
                return llm_cmd_queue.pop(index)
    return None


def sonar_set_rgb_all(r, g, b):
    with i2c_lock:
        i2csonar.setRGB(0, int(r), int(g), int(b))


def sonar_set_rgb_lr(lr, lg, lb, rr, rg, rb):
    with i2c_lock:
        i2csonar.setRGB(1, int(lr), int(lg), int(lb))
        i2csonar.setRGB(2, int(rr), int(rg), int(rb))


def sonar_get_distance_mm():
    with i2c_lock:
        value = i2csonar.getDistance()
    return int(value * 10)


def play_buzzer(freq, count):
    if count <= 0:
        count = 1
    for _ in range(count):
        beep.playTone(freq, 200, True)
        time.sleep_ms(180)


def get_llm_status_pairs(status_name):
    global battery_volt, status_func, body_state

    name = status_name.lower()
    if "distance" in name:
        return [["distance", str(sonar_get_distance_mm())]]
    if "battery" in name:
        return [["battery", str(battery_volt)]]
    if "running_mode" in name:
        return [["running_mode", MODE_CODE_TO_NAME.get(status_func, "normal")]]
    if "bodystate" in name:
        return [["Bodystate", str(body_state)]]
    return [["unknown", "0"]]


def parse_running_mode(mode_value):
    if mode_value is None:
        return None

    try:
        mode_code = int(mode_value)
        if mode_code in MODE_CODE_TO_NAME:
            return mode_code
    except Exception:
        pass

    try:
        if isinstance(mode_value, bytes):
            mode_text = mode_value.decode("utf-8").strip().lower()
        else:
            mode_text = str(mode_value).strip().lower()
    except Exception:
        return None

    return MODE_NAME_TO_CODE.get(mode_text)


def set_running_mode(mode_value):
    global status_func, status_motion, status_action
    global l_stop, r_stop, _obs_step, _walk_step
    global have_move, lastActionIsGoBack


    mode_code = parse_running_mode(mode_value)
    if mode_code is None:
        return False

    status_func = mode_code
    status_motion = 0
    status_action = 0xFF
    l_stop = False
    r_stop = False

    if mode_code != MODE_AVOID:
        _obs_step = 0
        lastActionIsGoBack = False
    if mode_code != MODE_FOLLOW:
        _walk_step = 0
    have_move = False

    return True


def imu_state_loop():
    global body_state, front_fall_count, back_fall_count
    while True:
        if imu is None:
            body_state = 0
            time.sleep_ms(200)
            continue

        try:
            angle = imu.read_angle()
            radian_x = angle[0]

            # Same threshold logic as rise_after_fall.py
            if -30 < radian_x < 60:
                front_fall_count += 1
                back_fall_count = 0
                if front_fall_count > 5:
                    body_state = 1
            elif radian_x > 120 or radian_x < -140:
                back_fall_count += 1
                front_fall_count = 0
                if back_fall_count > 5:
                    body_state = 2
            else:
                front_fall_count = 0
                back_fall_count = 0
                body_state = 0
        except Exception:
            pass

        time.sleep_ms(50)


def handle_llm_command(cmd):
    cmd_type = cmd.get("type", "")

    if cmd_type == "led":
        sonar_set_rgb_lr(cmd["lr"], cmd["lg"], cmd["lb"], cmd["rr"], cmd["rg"], cmd["rb"])
        llm_bridge.send_action_finish()

    elif cmd_type == "buzzer":
        play_buzzer(cmd["freq"], cmd["count"])
        llm_bridge.send_action_finish()

    elif cmd_type == "action_group":
        llm_bridge.send_action_finish()
        tonybot.runActionGroup(cmd["action_num"], cmd["execute_num"])

    elif cmd_type == "mode":
        if set_running_mode(cmd.get("running_mode")):
            llm_bridge.send_action_finish()

    elif cmd_type == "status":
        pairs = get_llm_status_pairs(cmd.get("status_name", ""))
        llm_bridge.send_status(pairs)


def llm_receive_loop():
    while True:
        cmd = llm_bridge.poll_command()
        if cmd is not None:
            push_llm_cmd(cmd)
        time.sleep_ms(20)


def ble_receive():
    global status_motion, status_action, status_func
    global battery_volt, l_stop, r_stop

    while True:
        if ble.is_connected():
            if ble.contains_data(b"CMD"):
                ble_rec_data = ble.read_uart_cmd()
                if not ble_rec_data:
                    continue
                rec_parse_value = ble.parse_uart_cmd(ble_rec_data)
                _command = int(rec_parse_value[0])

                if (_command == 1) and (len(rec_parse_value) == 2):
                    cmd = int(rec_parse_value[1])
                    if cmd == 8:
                        l_stop = True
                    elif cmd == 9:
                        r_stop = True
                    elif cmd in [1, 2, 3, 4]:
                        l_stop = False
                    elif cmd in [5, 6]:
                        r_stop = False
                    status_motion = cmd

                elif (_command == 2) and (len(rec_parse_value) == 2):
                    status_action = int(rec_parse_value[1])

                elif _command == 3:
                    if int(rec_parse_value[1]) == 1:
                        distance = sonar_get_distance_mm()
                        distance = distance if distance < 500 else 500
                        ble.send_data("CMD|3|{}|$".format(distance))
                    elif int(rec_parse_value[1]) == 2 and len(rec_parse_value) == 5:
                        sonar_set_rgb_all(int(rec_parse_value[2]), int(rec_parse_value[3]), int(rec_parse_value[4]))

                elif (_command == 4) and (len(rec_parse_value) == 2):
                    set_running_mode(rec_parse_value[1])

                elif _command == 5:
                    ble.send_data("CMD|5|{}|$".format(battery_volt))
        else:
            time.sleep_ms(30)


def getAllDistance():
    global gDistance, gLDistance, gRDistance

    sonar_set_rgb_all(0, 50, 50)
    tonybot.moveHeadAngle(90 + BIAS)
    time.sleep_ms(200)
    gDistance = sonar_get_distance_mm()

    tonybot.moveHeadAngle(145 + BIAS)
    time.sleep_ms(400)
    tDistance = sonar_get_distance_mm()

    tonybot.moveHeadAngle(180 + BIAS)
    time.sleep_ms(400)
    gLDistance = sonar_get_distance_mm()
    if tDistance < gLDistance:
        gLDistance = tDistance

    tonybot.moveHeadAngle(45 + BIAS)
    time.sleep_ms(600)
    tDistance = sonar_get_distance_mm()

    tonybot.moveHeadAngle(0 + BIAS)
    time.sleep_ms(400)
    gRDistance = sonar_get_distance_mm()
    if tDistance < gRDistance:
        gRDistance = tDistance

    tonybot.moveHeadAngle(90 + BIAS)
    time.sleep_ms(400)


def obstacleAvoidance():
    global gDistance, gLDistance, gRDistance
    global _obs_step, have_move, lastActionIsGoBack

    distance = sonar_get_distance_mm()

    if _obs_step == 0:
        gDistance = distance
        if gDistance >= MIN_DISTANCE_TURN or gDistance == 0:
            if not tonybot.isRunning():
                sonar_set_rgb_all(0, 50, 0)
                tonybot.runActionGroup(actfirst, 1)
                tonybot.waitForStop(2000)
                tonybot.runActionGroup(actgo, 0)
                have_move = True
                _obs_step = 1
        else:
            _obs_step = 2

    elif _obs_step == 1:
        gDistance = distance
        if gDistance < MIN_DISTANCE_TURN and gDistance > 0:
            tonybot.runActionGroup(actgo, 1)
            tonybot.waitForStop(2000)
            tonybot.runActionGroup(actfirst, 1)
            tonybot.waitForStop(2000)
            tonybot.runActionGroup(actstandquickly, 1)
            _obs_step = 2

    elif _obs_step == 2:
        if not tonybot.isRunning():
            getAllDistance()
            _obs_step = 3

    elif _obs_step == 3:
        sonar_set_rgb_all(0, 0, 50)
        if ((gDistance > MIN_DISTANCE_TURN) or (gDistance == 0)) and (not lastActionIsGoBack):
            _obs_step = 0
            lastActionIsGoBack = False
            return

        if ((gLDistance > gRDistance and gLDistance > MIN_DISTANCE_TURN) or gLDistance == 0) and gDistance > 50:
            if have_move:
                tonybot.runActionGroup(36, 1)
                tonybot.waitForStop(1000)
            tonybot.runActionGroup(actturnleft, 4)
            lastActionIsGoBack = False
            _obs_step = 2

        elif ((gRDistance > gLDistance and gRDistance > MIN_DISTANCE_TURN) or gRDistance == 0) and gDistance > 50:
            if have_move:
                tonybot.runActionGroup(37, 1)
                tonybot.waitForStop(1000)
            tonybot.runActionGroup(actturnright, 4)
            lastActionIsGoBack = False
            _obs_step = 2

        else:
            tonybot.runActionGroup(actfirst, 1)
            tonybot.waitForStop(2000)
            tonybot.runActionGroup(actback, 2)
            tonybot.waitForStop(4000)
            tonybot.runActionGroup(actfirst, 1)
            tonybot.waitForStop(2000)
            tonybot.runActionGroup(actstandquickly, 1)
            lastActionIsGoBack = True
            _obs_step = 2

        have_move = False


def Distancewalking():
    global _walk_step, have_move

    distance = sonar_get_distance_mm()

    if _walk_step == 0:
        if 30 < distance < 180:
            sonar_set_rgb_all(50, 0, 0)
            tonybot.runActionGroup(actfirst, 1)
            tonybot.waitForStop(1000)
            have_move = True
            _walk_step = 1
        elif 300 < distance < 400:
            sonar_set_rgb_all(0, 50, 0)
            tonybot.runActionGroup(actfirst, 1)
            tonybot.waitForStop(1000)
            have_move = True
            _walk_step = 2
        elif have_move:
            _walk_step = 3
        else:
            sonar_set_rgb_all(0, 0, 50)


    elif _walk_step == 1:
        if (30 < distance < 180) or have_move:
            have_move = False
            tonybot.runActionGroup(actback, 1)
            tonybot.waitForStop(2000)
        else:
            _walk_step = 3

    elif _walk_step == 2:
        if (300 < distance < 400) or have_move:
            have_move = False
            tonybot.runActionGroup(actgo, 1)
            tonybot.waitForStop(2000)
        else:
            _walk_step = 3

    elif _walk_step == 3:
        tonybot.runActionGroup(actfirst, 1)
        tonybot.waitForStop(2000)
        tonybot.runActionGroup(actstandquickly, 1)
        sonar_set_rgb_all(0, 0, 50)
        tonybot.waitForStop(1000)
        have_move = False
        _walk_step = 0


def action_run():
    global status_motion, status_action, status_func
    global _obs_step, _walk_step, l_stop, r_stop, battery_volt

    step = 0
    tmp_action = 0
    last_tmp_action = 0
    flag_first_obs = True
    flag_first_walk = True
    last_time = 0
    last_time_2 = 0

    while True:
        if last_time < time.ticks_ms():
            last_time = time.ticks_ms() + 1000
            tonybot.sendCMDGetBatteryVolt()

        llm_cmd = pop_llm_cmd(("mode", "status"))
        if llm_cmd is not None:
            handle_llm_command(llm_cmd)
            continue

        if step == 0:
            llm_cmd = pop_llm_cmd()
            if llm_cmd is not None:
                handle_llm_command(llm_cmd)
                continue

            if status_motion in [1, 2, 3, 4, 5, 6]:
                tmp_action = status_motion
                step = 2
            elif status_action != 0xFF:
                tmp_action = status_action
                status_action = 0xFF
                step = 3
            elif status_func == MODE_AVOID:
                flag_first_obs = True
                step = 4
            elif status_func == MODE_FOLLOW:
                flag_first_walk = True
                step = 5
            else:
                time.sleep_ms(50)

        elif step == 2:
            if tmp_action in [1, 2, 3, 4]:
                if (status_motion != tmp_action) or (l_stop is True):
                    if tmp_action in [1, 2]:
                        tonybot.stopActionGroup()
                        time.sleep_ms(100)
                        tonybot.runActionGroup(actstandquickly, 1)
                        time.sleep_ms(520)
                    last_tmp_action = 0
                    tmp_action = 0
                    step = 0
                    continue

                if tmp_action == 1:
                    if last_tmp_action != tmp_action:
                        tonybot.runActionGroup(actfirst, 1)
                        tonybot.waitForStop(2000)
                        tonybot.runActionGroup(action_list[tmp_action], 0)
                        last_tmp_action = tmp_action

                    time.sleep_ms(100)
                elif tmp_action == 2:
                    if last_tmp_action != tmp_action:
                        tonybot.runActionGroup(action_list[tmp_action], 0)
                        last_tmp_action = tmp_action
                    time.sleep_ms(100)
                else:
                    tonybot.runActionGroup(action_list[tmp_action], 1)
                    tonybot.waitForStop(2000)
            else:
                if (status_motion != tmp_action) or (r_stop is True):
                    if last_tmp_action != 0:
                        tonybot.runActionGroup(action_list[last_tmp_action], 1)
                        tonybot.waitForStop(1000)
                        tonybot.runActionGroup(actstandquickly, 1)
                        tonybot.waitForStop(2000)
                        last_tmp_action = 0
                    tmp_action = 0
                    step = 0
                    continue
                if last_tmp_action != tmp_action:
                    tonybot.runActionGroup(action_list[tmp_action], 0)
                    tonybot.waitForStop(100)
                    last_tmp_action = tmp_action

        elif step == 3:
            tonybot.runActionGroup(tmp_action, 1)
            tonybot.waitForStop(2000)
            last_tmp_action = 0
            tmp_action = 0
            step = 0

        elif step == 4:
            if flag_first_obs:
                flag_first_obs = False
                tonybot.moveHeadAngle(90)
                _obs_step = 0
                tonybot.runActionGroup(0, 1)
                tonybot.waitForStop(2000)

            if status_func != MODE_AVOID:
                tonybot.stopActionGroup()
                tonybot.waitForStop(1000)
                tonybot.runActionGroup(0, 1)
                tonybot.moveHeadAngle(90)
                tonybot.waitForStop(2000)
                step = 0
                continue

            obstacleAvoidance()
            time.sleep_ms(50)

        elif step == 5:
            if flag_first_walk:
                flag_first_walk = False
                sonar_set_rgb_all(0, 0, 240)
                _walk_step = 0
                tonybot.runActionGroup(0, 1)
                tonybot.waitForStop(2000)


            if status_func != MODE_FOLLOW:
                sonar_set_rgb_all(0, 240, 0)
                tonybot.stopActionGroup()
                tonybot.waitForStop(1000)
                tonybot.runActionGroup(0, 1)
                tonybot.waitForStop(2000)
                step = 0
                continue

            Distancewalking()
            time.sleep_ms(50)

        else:
            step = 0

        if last_time_2 < time.ticks_ms():
            last_time_2 = time.ticks_ms() + 900
            tmp = tonybot.getBatteryVolt()
            if tmp != -1:
                battery_volt = tmp


beep.setVolume(500)
sonar_set_rgb_all(0, 240, 0)
tonybot.setActionGroupSpeed(actturnleft, 150)
tonybot.setActionGroupSpeed(actturnright, 150)

tonybot.moveHeadAngle(90)
tonybot.runActionGroup(0, 1)
time.sleep_ms(1500)
buzzer.playTone(1500, 100, False)

if llm_bridge.ensure_online(3000):
    llm_bridge.register_tools()

Hiwonder.startMain(ble_receive)
Hiwonder.startMain(action_run)
Hiwonder.startMain(llm_receive_loop)
Hiwonder.startMain(imu_state_loop)
