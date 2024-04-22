@AppSync
Feature: The React Native app can sync with LifeLeaf watch
  As a developer
  I would like to use native module
  To sync app with watch over BT

  Background:
    Given app creates native module
    And watch is already connected
    
  @SEQ-505
  Scenario: App sync success with auto-measure OFF
    Given services and characteristics already discovered
    And notify set for 'STATUS' characteristic
    And watch auto-measure switch is 'OFF'
    When app requests app sync read
    Then app sync response shall start
    And characteristic 'USER_DATA' value should be read
    And characteristic 'USER_DATA' should be written with value '0,15,.,.,.,.,.,.,.,.'
    And event with message '299' - 'App Sync completed' should be emitted to the app

  @SEQ-505
  Scenario: App sync success with auto-measure ON
    Given services and characteristics already discovered
    And notify set for 'STATUS' characteristic
    And watch auto-measure switch is 'ON'
    When app requests app sync read
    Then app sync response shall start
    And characteristic 'USER_DATA' value should be read
    And characteristic 'USER_DATA' should be written with value '1,15,.,.,.,.,.,.,.,.'
    And event with message '299' - 'App Sync completed' should be emitted to the app

  @SEQ-30
  Scenario: App sync success
    Given services and characteristics already discovered
    And notify set for 'STATUS' characteristic
    When app requests app sync read
    Then app sync response shall start
    And characteristic 'USER_DATA' value should be read
    And characteristic 'USER_DATA' value should be written
    And event with message '299' - 'App Sync completed' should be emitted to the app
    When app requests app sync write with 'valid' params
    | height_ft | height_in | weight | ethnicity | gender | skin_tone |
    | 5         | 6         | 96     | 2         | F      | 2         |
    Then app sync response shall start
    And characteristic 'USER_DATA' should be written with value '.,.,.,0,75,140,6,2,1,2'
    And event with message '299' - 'App Sync completed' should be emitted to the app
  
  @SEQ-30
  Scenario Outline: App sync params failure
    When app requests app sync write with '<invalid>' params
    Then app sync response shall not start

    Examples:
      | invalid             |
      | userId              |
      | deviceMsn           |
      | error id to throw   |
      | json                |
  
  @SEQ-30
  Scenario outline: App sync process failure
    Given app is busy with '<process>'
    When app requests app sync write with 'valid' params
    | height_ft | height_in | weight | ethnicity | gender | skin_tone |
    | 5         | 6         | 96     | 2         | F      | 2         |
    Then app sync response shall not start
    
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
