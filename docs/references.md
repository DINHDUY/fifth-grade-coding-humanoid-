**Note:** The product is **Tonybot** (Hiwonder humanoid robot; “TobyBot”/“TonyBot” appear to be variants or typos of the same ESP32-based biped platform). Official materials focus on the current Tonybot lineup (Standard/Advanced/Ultimate kits with optional AI vision, voice, and large AI model modules).

### Latest Official Documentation (Primary Knowledge Base Source)
These are the most up-to-date official references (wiki pages last showing updates around September 2026 / mid-2026 timestamps in results). They form a complete, structured course series and are the best starting point for a knowledge base. Access them online (HTML); content can be scraped/saved for offline use. Full source code, diagrams, and video references are integrated.

- **Main Documentation Hub**: https://wiki.hiwonder.com/projects/Tonybot/en/latest/  
  (Redirects to getting-started; comprehensive English docs covering hardware, software, and projects. Older/alternate mirror mentions at docs.hiwonder.com appear broken or redirected.)

Key sections (ordered roughly by curriculum progression; all under the same wiki base):
1. **1. Getting Ready** — Product introduction, packing lists (Standard vs Advanced), battery charging/usage guidelines, safety, copyright/disclaimer.  
   https://wiki.hiwonder.com/projects/Tonybot/en/latest/docs/1.getting_ready.html
2. **2. APP Control** — Wonderbot app installation (iOS/Android), Bluetooth connection, features (movement, obstacle avoidance, following, action groups, camera feed, reset). Includes program restore instructions.  
   https://wiki.hiwonder.com/projects/Tonybot/en/latest/docs/2.app_control.html
3. **3. PC Software Action Control Course** — Bus Servo Control software installation, connection, opening/running/downloading action groups, action editing (e.g., greeting sequences).  
   https://wiki.hiwonder.com/projects/Tonybot/en/latest/docs/3.pc_software_action_control_course.html (or docs.hiwonder.com variant).
4. **4. Large AI Model Basic Course** — Module intro (ESP32-S3 + CI1302 voice, camera, display), operating principle, wake-up (“Hello Hiwonder”), network config/device binding, hardware interfaces, firmware flashing (factory / Xiaozhi AI open-source), wake-word modification.  
   https://wiki.hiwonder.com/projects/Tonybot/en/latest/docs/4.%20Large%20AI%20Model%20Basic%20Course.html
5. **5. Scratch Programming Projects** — WonderCode (Scratch-based) installation, device connection/extensions (Tonybot), function overview, projects (breathing light/RGB ultrasonic, distance ranging & display, etc.).  
   https://wiki.hiwonder.com/projects/Tonybot/en/latest/docs/5.scratch_programming_projects.html
6. **6. Python Programming Projects** — Hiwonder Python Editor guide, secondary development (breathing light, sensors, serial/PC control, large AI model online/offline applications, image transmission, QR code, etc.). Includes MicroPython examples and communication protocols.  
   https://wiki.hiwonder.com/projects/Tonybot/en/latest/docs/6.python_programming_projects.html
7. **8. Group Control** — Multi-robot control via mobile app/Wi-Fi, action groups (default + custom).  
   https://wiki.hiwonder.com/projects/Tonybot/en/latest/docs/8.Group_Control.html

**Appendix / Resources Download Page** (central list of downloadable packages; updated ~August 2026):  
https://wiki.hiwonder.com/projects/Tonybot/en/latest/docs/resources_download.html  
Links to Google Drive folders for tools, firmware, programs, and action files.

### Downloadable Official Resources (Google Drive Links from Appendix)
These are the primary downloadable packages for offline knowledge-base construction (installers, firmware, source, action files). Master folder often referenced as “Tonybot 2025” resources (tutorials, software tools & programs, technical parameters & diagrams, FAQ; dated around early–mid 2025 with later tool updates).

- **Master Tonybot Resources folder**: https://drive.google.com/drive/folders/19Z4bLftxcqyEXROwatudhwp8MTWEHmWN  
- **PC Software Installation Package** (Bus Servo Control V3.5 setup.exe): https://drive.google.com/drive/folders/1Z1Q1itNnAltxmSNmQC3WH2Qg-ImfLCyc  
- **Action Files** (Action Files.zip): https://drive.google.com/drive/folders/1wBYhyoPotFX8Xtm63o5J473BqSTzyt5A  
- **WonderCode Installation Package** (Scratch editor): https://drive.google.com/drive/folders/1DvebM-ic0hn_MFobA7cVo24GZoXOLTgP  
- **Hiwonder Python Editor Installation Package** (Python Editor.exe): https://drive.google.com/drive/folders/1SEKEZvqae38Jf5IXCSFjdXkrQk-_U5w1  
- **Arduino IDE Installation Package** (.rar): https://drive.google.com/drive/folders/1L0oDe6uAvkiWgZLOXh2G2ArpgOHpIvWh  
- **Program Collection** (Tonybot source/programs): https://drive.google.com/drive/folders/1KLVJwr1NkqrMO6OvIcwcJ8H1oCfsxcH2  
- **ESP32Cam / ESP32 Firmware Flashing Tool** (flash_download_tool_3.9.7): https://drive.google.com/drive/folders/1iDdatjYswiquF1eNqKYVFBq68VrKZV_U  
- **Serial Port Utility** (serial_port_utility_latest.exe): https://drive.google.com/drive/folders/1HO5ttNryusZO6W0_7oEk6Nc61kw7Ji45  
- **Tonybot Firmware** (for Python and Scratch programming): https://drive.google.com/drive/folders/17KPJaJMB_pr6ZAkbkFbUSl_HfcXYj2E-  

Related voice/firmware materials (e.g., command phrase lists, .bin files for “Hello Hiwonder” / Chinese wake words, flashing tools) appear in appendix-style folders such as https://drive.google.com/drive/folders/1VTe8yt7n2AH0f7QZom3YlUlxeddfbKn6.

### Official Source Code & Community/Reference Repository
- **GitHub – Hiwonder/Tonybot**: https://github.com/Hiwonder/Tonybot  
  Open-source examples organized by environment:  
  - Scratch/ (sensor demos, vision, voice, serial, IoT, firmware binaries)  
  - Python/ (MicroPython: sensors, voice, AI vision, IoT)  
  - Arduino/ (sensors, serial, voice, AI vision, large AI model online/offline, IoT)  
  - Mobile_APP/  
  README covers product overview, dual-MCU architecture (ESP32 motion + ESP32-S3 AI), programming paths, official links, and getting-started steps. Ideal for code-level knowledge base.

### Product Page & Supporting Official Links
- **Product page** (specs, features, kits, resource pointer): https://www.hiwonder.com/products/tonybot  
  Points back to the wiki for full source code, schematics, and video guides. Includes technical parameters (17 DOF, high-voltage bus servos, battery, sensors, large AI module specs).
- **Official website / support**: https://www.hiwonder.com/ · support@hiwonder.com  
- **Wonderbot mobile app**: iOS App Store / Google Play (com.Wonder.bot or similar).  

### Additional Notes for Knowledge-Base Building
- **No standalone public PDFs** of the full user manual were prominently indexed beyond the online wiki + Drive packages (a physical “User Manual” is included in packing lists). The wiki chapters + Drive program/action/firmware packages + GitHub source form the complete official set.  
- **Community/secondary**: Limited public third-party guides; primary support is official (email, GitHub Issues). Related Hiwonder manuals (e.g., servos, other robots) exist on sites like manuals.plus but are not Tonybot-specific.  
- **Videos**: Referenced in docs/product page (assembly, demos); official YouTube channel exists for broader Hiwonder content.  
- **Order rationale**: Wiki pages and appendix (2026 timestamps) are the latest official structured docs; Drive packages and GitHub provide the downloadable/code assets that accompany them. Older mirrors or related-product docs (e.g., TonyPi) are secondary.  

Download the Drive folders and clone the GitHub repo first, then systematically archive the wiki chapters for a robust offline knowledge base covering hardware, app/PC control, Scratch/Python/Arduino programming, sensors, vision, voice, large AI models, and multi-robot control. Contact support@hiwonder.com for any missing course materials or latest firmware.