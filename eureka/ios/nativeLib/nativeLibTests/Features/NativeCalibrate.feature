@Calibrate
Feature: The React Native app can calibrate LifeLeaf watch
  As a developer
  I would like to use native module
  To calibrate watch over BT

  Background:
    Given app creates native module
    
  @SEQ-30, @SEQ-413
  Scenario: Calibration success
    Given watch is already connected
    And services and characteristics already discovered
    And notify set for 'STATUS' characteristic
    When app requests start calibration with params
      | heartRate | respirationRate | oxygenSaturation | glucose | sysPressure | diaPressure |
      | 80        | 25              | 95               | 80      | 120         | 75          |
    Then calibration shall start
    And characteristic 'USER_DATA' value should be written
    And characteristic 'REFERENCE_VITAL_DATA' should be written with value '80,0,25,0,95,0,80,0,120,0,75,0'
    And characteristic 'STATUS' value should be read
    And event with message '023' - 'Watch battery normal' should be emitted to the app
    And event with message '025' - 'Watch charger removed' should be emitted to the app
    And event with message '027' - 'Watch on wrist' should be emitted to the app
    And watch shall receive command 'START_MEASUREMENT' on command characteristic
    When watch updates 'STATUS' characteristic value to 128
    And watch updates 'STATUS' characteristic value to 136
    And watch has 1 records of vital data
    And watch updates 'STATUS' characteristic value to 128
    Then watch shall receive command 'GET_LAST_VITAL' on command characteristic
    And characteristic 'VITAL_DATA' value should be read
    And event with message '491' - 'Calibration measure complete' should be emitted to the app
    And characteristic 'USER_DATA' value should be written
    And watch shall receive command 'GET_FIRST_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    And watch shall receive command 'GET_NEXT_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    When raw data count is 1500
    Then watch shall receive command 'GET_NEXT_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    And event with message '499' - 'Calibration completed' should be emitted to the app

  @SEQ-413, @NoReferenceChar
  Scenario Outline: Calibration success with old watch firmware
    Given watch is already connected
    And services and characteristics already discovered
    And notify set for 'STATUS' characteristic
    When app requests calibration with '<valid>' params
    Then calibration shall start
    And characteristic 'USER_DATA' value should be written
    And characteristic 'REFERENCE_VITAL_DATA' should not be written
    And characteristic 'STATUS' value should be read
    And event with message '023' - 'Watch battery normal' should be emitted to the app
    And event with message '025' - 'Watch charger removed' should be emitted to the app
    And event with message '027' - 'Watch on wrist' should be emitted to the app
    And watch shall receive command 'START_MEASUREMENT' on command characteristic
    When watch updates 'STATUS' characteristic value to 128
    When watch updates 'STATUS' characteristic value to 136
    And watch has 1 records of vital data
    And watch updates 'STATUS' characteristic value to 128
    Then watch shall receive command 'GET_LAST_VITAL' on command characteristic
    And characteristic 'VITAL_DATA' value should be read
    And event with message '491' - 'Calibration measure complete' should be emitted to the app
    And characteristic 'USER_DATA' value should be written
    And watch shall receive command 'GET_FIRST_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    And watch shall receive command 'GET_NEXT_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    When raw data count is 1500
    Then watch shall receive command 'GET_NEXT_RAW' on command characteristic
    And characteristic 'RAW_DATA' value should be read
    And event with message '499' - 'Calibration completed' should be emitted to the app

    Examples:
      | valid               |
      | validIntGlucose     |
      | validDecimalGlucose |
      
  @SEQ-30
  Scenario Outline: Calibration params failure
    Given watch is already connected
    When app requests calibration with '<invalid>' params
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

  @SEQ-30
  Scenario Outline: Calibration process failure
    Given watch is already connected
    And app is busy with '<process>'
    When app requests calibration with 'valid' params
    Then calibration shall not start
    And response shall contain error '<code>' - '<message>'

    Examples:
      | process           | code | message                     |
      | CONNECT           | 013  | Other process is running    |
      | INSTANT_MEASURE   | 409  | Instant Measure in progress |
      | AUTO_MEASURE      | 408  | Auto Measure in progress    |
      | STEP_COUNT        | 013  | Other process is running    |
      | CALIBRATE         | 410  | Calibration in progress     |
      | APP_SYNC          | 013  | Other process is running    |
      | MEAL_DATA         | 013  | Other process is running    |
      | READ_RAW_DATA     | 410  | Calibration in progress     |
      | AUTO_MEASURE_SYNC | 013  | Other process is running    |
