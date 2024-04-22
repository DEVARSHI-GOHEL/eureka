@MeasureFailed
Feature: The React Native app can indicate a failed measurement
  As a user of the mobile application
  I would like to be informed about unsuccessful measurement even if my app in background
  So that makes me sure I can fix the issue and continue measurement

  Background:
    Given app creates native module

  @SEQ-374
  Scenario: App is notified when unsuccessful measurement bit was reset
    Given watch with MSN '123456' is already connected
    When watch updates 'STATUS' characteristic value to 128
    And watch updates 'STATUS' characteristic value to 1
    Then event with message '022: Watch battery low' should be emitted to the app
    And event with message '031: Unsuccessful measure has been detected' should be emitted to the app
    When app executes following SQL query: 'SELECT type FROM measures ORDER BY measure_time DESC LIMIT 1'
    Then app shall receive unsuccessful measurement type
