@StartInstantMeasure
Feature: The React Native app can start instant measure in LifeLeaf watch
  As a developer
  I would like to use native module
  To start instant measure in watch over BT

  Background:
    Given app creates native module

  @SEQ-30
  Scenario: Start instant measure success
    Given watch is already connected
    And services and characteristics already discovered
    And notify set for 'STATUS' characteristic
    When app requests start instant measure
    Then instant measure shall start
    And characteristic 'USER_DATA' value should be written
    And characteristic 'STATUS' value should be read
    And event with message '023' - 'Watch battery normal' should be emitted to the app
    And event with message '025' - 'Watch charger removed' should be emitted to the app
    And event with message '027' - 'Watch on wrist' should be emitted to the app
    Then watch shall receive command 'START_MEASUREMENT' on command characteristic
    When watch updates 'STATUS' characteristic value to 128
    And watch updates 'STATUS' characteristic value to 136
    And watch has 1 records of vital data
    And watch has 1 records of meal data
    And watch updates 'STATUS' characteristic value to 128
    Then watch shall receive command 'GET_LAST_VITAL' on command characteristic
    And characteristic 'VITAL_DATA' value should be read
    And event with message '399' - 'Instant measure completed' should be emitted to the app
  
  @SEQ-30
  Scenario outline: Start instant measure failure
    Given watch is already connected
    And app is busy with '<process>'
    When app requests start instant measure
    Then instant measure shall not start
  
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
