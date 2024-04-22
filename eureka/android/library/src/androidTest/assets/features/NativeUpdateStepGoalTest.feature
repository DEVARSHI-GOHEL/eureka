@UpdateStepGoalTest
Feature: The React Native app can update daily step goal in LifeLeaf watch
  As a user of the Eureka app
  When I update my step goal in the app then it is also updated on the watch
  So that both app and watch are consistent

  Background:
    Given app creates native module

  @SEQ-130
  Scenario: Update daily step goal
    Given watch with MSN '123456' is already connected
    And user with step goal 15000 is logged in
    When app requests to update daily step goal
    Then characteristic 'STEP_COUNTER' should be written with value '0,152,58,0,0,0,0,0,0,0'
    And event with message '523: Step goal updated successfully' should be emitted to the app

  @SEQ-130
  Scenario Outline: Update daily step goal process failure
    Given watch with MSN '123456' is already connected
    And app is busy with '<process>'
    When app requests to update daily step goal
    Then update daily step goal shall not start
    And characteristic 'STEP_COUNTER' should not be written

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

  @SEQ-130
  Scenario: Update daily step goal fails when unable to write to characteristic
    Given watch with MSN '123456' is already connected
    And user with step goal 15000 is logged in
    And writing to STEP_COUNTER char is failing
    When app requests to update daily step goal
    Then app shall receive response '522: Unable to update daily step goal in watch'
    And characteristic 'STEP_COUNTER' should not be written

  @SEQ-130
  Scenario: Update daily step goal fails with invalid step goal
    Given watch with MSN '123456' is already connected
    And user with step goal 0 is logged in
    When app requests to update daily step goal
    Then app shall receive response '520: Invalid daily step goal'
    And characteristic 'STEP_COUNTER' should not be written
