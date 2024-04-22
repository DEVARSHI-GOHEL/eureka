@MeasureFailed
Feature: The React Native app can indicate a failed measurement
  As a user of the mobile application
  I would like to be informed about unsuccessful measurement even if my app in background
  So that makes me sure I can fix the issue and continue measurement
    
  Background:
    Given app creates native module

  @SEQ-400
  Scenario: App is notified when unsuccessful measurement bit was reset
    Given watch is already connected
    And services and characteristics already discovered
    And notify set for 'STATUS' characteristic
    When watch updates 'STATUS' characteristic value to 128
    Then event with message '023' - 'Watch battery normal' should be emitted to the app
    And event with message '025' - 'Watch charger removed' should be emitted to the app
    And event with message '027' - 'Watch on wrist' should be emitted to the app
    When watch updates 'STATUS' characteristic value to 0
    And event with message '031' - 'Unsuccessful measure has been detected' should be emitted to the app
    When app executes following SQL query: 'SELECT type FROM measures ORDER BY measure_time DESC LIMIT 1'
    Then app shall receive unsuccessful measurement type
