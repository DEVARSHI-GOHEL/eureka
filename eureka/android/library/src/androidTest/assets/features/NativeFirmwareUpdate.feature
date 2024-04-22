@FirmwareUpdate
Feature: The React Native app can upload firmware to LifeLeaf watch
  As a user of the LifeLeaf mobile application
  I would like to update the watch firmware when one is available
  So that my watch can be up to date

  @SEQ-19, @SEQ-270
  Scenario Outline: App can complete firmware update, report update result and reconnect to watch
    Given app creates native module
    And watch with MSN '123456' is already connected
    And firmware update will complete with '<result>'
    When app requests to initiate DFU mode
    Then app shall initiate DFU mode on the watch
    And event with message '102: No watch available' should be emitted to the app
    And event with message '997: New GATT status (GATT status: Disconnected)' should be emitted to the app
    When watch enters DFU mode
    And user removes bluetooth bond
    And app requests to start firmware update
    And watch was found
    And app connects to watch
    Then event with message '197: Discovering GATT services ( ())' should be emitted to the app
    And event with message '997: New GATT status (GATT status: Connected)' should be emitted to the app
    And firmware update shall start
    And event with message '501: Firmware update started' should be emitted to the app
    And event with message '<message>' should be emitted to the app
    When watch reboots in standard mode
    Then event with message '102: No watch available' should be emitted to the app
    And event with message '997: New GATT status (GATT status: Disconnected)' should be emitted to the app
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When watch was found
    And app connects to watch
    Then event with message '197: Discovering GATT services ( ())' should be emitted to the app
    And watch shall be connected
    And event with message '997: New GATT status (GATT status: Connected)' should be emitted to the app

    Examples:
      | result             | message                                                |
      | FileParseError     | 502: Firmware update finished with file parse error    |
      | FileReadError      | 503: Firmware update finished with file read error     |
      | ConnectionError    | 504: Firmware update finished with connection error    |
      | CommunicationError | 505: Firmware update finished with communication error |
      | CrcError           | 506: Firmware update finished with CRC error           |
      | InstallationError  | 507: Firmware update finished with installation error  |
      | Success            | 509: Firmware update completed successfully            |

  @SEQ-19
  Scenario: App returns response with code 508 when invalid update file is used
    Given app creates native module
    And watch with MSN '123456' is already connected
    When app requests to start firmware update with invalid file path
    Then app shall receive response '508: Failed to read firmware update file'
