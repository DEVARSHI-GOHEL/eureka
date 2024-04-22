@AppSync
Feature: The React Native app can sync app with LifeLeaf watch
  As a developer
  I would like to use native module
  To sync app with watch over BT

  Background:
    Given app creates native module
    And watch with MSN '123456' is already connected

  @SEQ-505
  Scenario: App sync success with auto-measure OFF
    Given watch auto-measure switch is 'OFF'
    When app requests app sync read
    Then app sync response shall start
    And characteristic 'USER_INFO' value should be read
    And characteristic 'USER_INFO' should be written with value '0,15,.,.,.,.,.,.,.,.'
    And event with message '299: App Sync completed' should be emitted to the app

  @SEQ-505
  Scenario: App sync success with auto-measure ON
    Given watch auto-measure switch is 'ON'
    When app requests app sync read
    Then app sync response shall start
    And characteristic 'USER_INFO' value should be read
    And characteristic 'USER_INFO' should be written with value '1,15,.,.,.,.,.,.,.,.'
    And event with message '299: App Sync completed' should be emitted to the app

  @SEQ-33
  Scenario: App sync success
    When app requests app sync read
    Then app sync response shall start
    And characteristic 'USER_INFO' value should be read
    And characteristic 'USER_INFO' value should be written
    And event with message '299: App Sync completed' should be emitted to the app
    When app requests app sync write with params
      | height_ft | height_in | weight | ethnicity | gender | skin_tone |
      | 5         | 6         | 96     | 2         | F      | 2         |
    Then app sync response shall start
    And characteristic 'USER_INFO' should be written with value '.,.,.,0,75,140,6,2,1,2'
    And event with message '299: App Sync completed' should be emitted to the app

  @SEQ-33
  Scenario Outline: App sync params failure
    When app requests app sync write with '<invalid>' params
    Then app sync response shall not start

    Examples:
      | invalid             |
      | userId              |
      | deviceMsn           |
      | error id to throw   |
