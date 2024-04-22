@StartInstantMeasure
Feature: The React Native app can start instant measure in LifeLeaf watch
  As a developer
  I would like to use native module
  To start instant measure in watch over BT

  Background:
    Given app creates native module

  @SEQ-33
  Scenario: Start instant measure success
    Given watch with MSN '123456' is already connected
    When app requests start instant measure
    Then instant measure shall start
    And characteristic 'USER_INFO' value should be written
    And characteristic 'STATUS' value should be read
    And watch shall receive command 'START_MEASUREMENT' on command characteristic
    When watch updates 'STATUS' characteristic value to 128
    And watch updates 'STATUS' characteristic value to 136
    And watch has 1 records of vital data
    And watch updates 'STATUS' characteristic value to 128
    Then watch shall receive command 'GET_LAST_VITAL' on command characteristic
    And characteristic 'VITAL_DATA' value should be read
    And event with message '399: Instant measure completed' should be emitted to the app

  @SEQ-33
  Scenario Outline: Start instant measure failure
    Given watch with MSN '123456' is already connected
    And app is busy with '<process>'
    When app requests start instant measure
    Then instant measure shall not start

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
