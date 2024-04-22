@Disconnect
Feature: The React Native app can disconnect LifeLeaf watch
  As a developer
  I would like to use native module
  To disconnect already connected watch over BT

  Background:
    Given app creates native module

  @SEQ-30
  Scenario: Disconnect success
    Given watch is already connected
    When app requests disconnect from the watch
    Then watch shall disconnect
  
  @SEQ-30
  Scenario outline: Disconnect failure
    Given watch is already connected
    And app is busy with '<process>'
    When app requests disconnect from the watch
    Then watch shall not disconnect
  
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
