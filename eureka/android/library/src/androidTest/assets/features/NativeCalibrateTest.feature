@CalibrateTest
Feature: The React Native app can start calibrate in LifeLeaf watch
  As a developer
  I would like to use native module
  To start calibration

  Background:
    Given app creates native module

  @SEQ-33, @SEQ-413
  Scenario: Start calibration success
    Given watch with MSN '123456' is already connected
    When app requests start calibration with params
      | heartRate | respirationRate | oxygenSaturation | glucose | sysPressure | diaPressure |
      | 80        | 25              | 95               | 80      | 120         | 75          |
    Then calibration shall start
    And characteristic 'USER_INFO' value should be written
    And characteristic 'REFERENCE_VITAL_DATA' should be written with value '80,00,25,0,95,0,80,0,120,0,75,0'
    And characteristic 'STATUS' value should be read
    And watch shall receive command 'START_MEASUREMENT' on command characteristic
    When watch updates 'STATUS' characteristic value to 128
    And watch updates 'STATUS' characteristic value to 136
    And watch has 1 records of vital data
    And watch updates 'STATUS' characteristic value to 128
    Then watch shall receive command 'GET_LAST_VITAL' on command characteristic
    And characteristic 'VITAL_DATA' value should be read
    And characteristic 'USER_INFO' value should be written
    And characteristic 'LAST_MEASURE_TIME' value should be read
    And event with message '491: Calibration measure complete' should be emitted to the app
    And watch shall receive command 'GET_FIRST_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    And watch shall receive command 'GET_NEXT_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    When raw data index is 1500
    Then watch shall receive command 'GET_NEXT_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    And event with message '499: Calibration completed' should be emitted to the app

  @SEQ-413
  Scenario Outline: Start calibration success without reference vital data characteristic
    Given watch does not have 'REFERENCE_VITAL_DATA' characteristic
    And watch with MSN '123456' is already connected
    When app requests start calibration with '<valid>' params
    Then calibration shall start
    And characteristic 'USER_INFO' value should be written
    And characteristic 'REFERENCE_VITAL_DATA' should not be written
    And characteristic 'STATUS' value should be read
    And watch shall receive command 'START_MEASUREMENT' on command characteristic
    When watch updates 'STATUS' characteristic value to 128
    And watch updates 'STATUS' characteristic value to 136
    And watch has 1 records of vital data
    And watch updates 'STATUS' characteristic value to 128
    Then watch shall receive command 'GET_LAST_VITAL' on command characteristic
    And characteristic 'VITAL_DATA' value should be read
    And characteristic 'USER_INFO' value should be written
    And characteristic 'LAST_MEASURE_TIME' value should be read
    And event with message '491: Calibration measure complete' should be emitted to the app
    And watch shall receive command 'GET_FIRST_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    And watch shall receive command 'GET_NEXT_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    When raw data index is 1500
    Then watch shall receive command 'GET_NEXT_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    And event with message '499: Calibration completed' should be emitted to the app

    Examples:
      | valid               |
      | validIntGlucose     |
      | validDecimalGlucose |

  @SEQ-33
  Scenario Outline: Start calibration params failure
    Given watch with MSN '123456' is already connected
    When app requests start calibration with '<invalid>' params
    Then calibration shall not start

    Examples:
      | invalid           |
      | userId            |
      | deviceMsn         |
      | SPO2              |
      | RR                |
      | HR                |
      | SBP               |
      | DBP               |
      | Glucose           |
      | error id to throw |
      | json              |

  @SEQ-33
  Scenario Outline: Start calibration process failure
    Given watch with MSN '123456' is already connected
    And app is busy with '<process>'
    When app requests start calibration with 'valid' params
    Then calibration shall not start

    Examples:
      | process         |
      | CONNECT         |
      | INSTANT_MEASURE |
      | AUTO_MEASURE    |
      | STEP_COUNT      |
      | CALIBRATE       |
      | APP_SYNC        |
      | MEAL_DATA       |
      | READ_RAW_DATA   |
      | NOTIFICATION    |
