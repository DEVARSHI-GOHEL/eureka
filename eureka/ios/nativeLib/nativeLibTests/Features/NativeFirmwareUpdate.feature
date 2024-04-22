@FirmwareUpdate
Feature: The React Native app can upload firmware to LifeLeaf watch
  As a user of the LifeLeaf mobile application
  I would like to update the watch firmware when one is available
  So that my watch can be up to date

  Background:
    Given app creates native module
    And watch is already connected
    
  @SEQ-354
  Scenario: Initiate DFU mode
    Given services and characteristics already discovered
    When app requests to initiate DFU mode
    Then characteristic 'ALERT_LEVEL' should be written with value '1'
    And DFU mode shall start
  
  @SEQ-354
  Scenario Outline: Initiate DFU mode failure
    Given app is busy with '<process>'
    When app requests to initiate DFU mode
    Then DFU mode shall not start
    And characteristic 'ALERT_LEVEL' should not be written

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
