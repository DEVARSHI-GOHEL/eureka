@DeviceConnect
Feature: The React Native app can connect to LifeLeaf watch
  As a developer
  I would like to use native module
  To scan and connect to a watch over BT and get initial data sync

  Background:
    Given app creates native module

  @SEQ-18
  Scenario: Scan and connect success
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When watch was found
    And watch has 2 records of vital data
    And watch has 2 records of meal data
    Then event with message '197' - 'Discovering GATT services' should be emitted to the app
    And watch shall be connected
    And services and characteristics shall be discovered
    And notify should be set for 'STATUS' characteristic
    And notify should be set for 'MEAL_DATA' characteristic
    And notify should be set for 'STEP_COUNTER' characteristic
    And watch shall receive current time
    And watch shall receive time zone
    And watch shall receive step goal
    And characteristic 'STEP_COUNTER' value should be written
    And event with message '523' - 'Step goal updated successfully' should be emitted to the app
    And event with message '199' - 'Watch connected' should be emitted to the app
    And event with message '306' - 'offline data read started' should be emitted to the app
    And characteristic 'STATUS' value should be read
    And event with message '023' - 'Watch battery normal' should be emitted to the app
    And event with message '025' - 'Watch charger removed' should be emitted to the app
    And event with message '027' - 'Watch on wrist' should be emitted to the app
    And watch shall receive command 'GET_LAST_VITAL' on command characteristic
    And characteristic 'VITAL_DATA' value should be read
    And watch shall receive command 'GET_PREV_VITAL' on command characteristic
    And characteristic 'VITAL_DATA' value should be read
    And watch shall receive command 'GET_PREV_VITAL' on command characteristic
    And characteristic 'VITAL_DATA' value should be read
    And watch shall receive command 'GET_LAST_MEAL' on command characteristic
    And characteristic 'MEAL_DATA' value should be read
    And watch shall receive command 'GET_PREV_MEAL' on command characteristic
    And characteristic 'MEAL_DATA' value should be read
    And watch shall receive command 'GET_PREV_MEAL' on command characteristic
    And characteristic 'MEAL_DATA' value should be read
    And watch shall receive command 'GET_STEP_COUNTER_*' on command characteristic
    And characteristic 'STEP_COUNTER' value should be read
    And event with message '305' - 'offline data read complete' should be emitted to the app
    And characteristic 'FIRMWARE_REVISION' value should be read
    And characteristic 'USER_DATA' value should be written
    And event with message '299' - 'App Sync completed' should be emitted to the app
    And watch shall not receive any command on command characteristic

  @SEQ-30
  Scenario outline: Scan and connect failure
    Given app is busy with '<process>'
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall not be started

    Examples:
      | process           |
      | CONNECT           |
      | INSTANT_MEASURE   |
      | AUTO_MEASURE      |
      | STEP_COUNT        |
      | CALIBRATE         |
      | APP_SYNC          |
      | MEAL_DATA         |
      | READ_RAW_DATA     |
      | AUTO_MEASURE_SYNC |
