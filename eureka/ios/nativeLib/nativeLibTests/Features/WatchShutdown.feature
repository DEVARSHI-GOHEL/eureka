@WatchShutdown
Feature: The React Native app can indicate a watch shutdown
  As a user of the mobile application
  I would like to be informed about watch shutdown
  So that makes me sure my watch discharged, not broken
    
  Background:
    Given app creates native module

  @SEQ-374
  Scenario: App is notified when watch shutdown bit is set
    Given watch is already connected
    And services and characteristics already discovered
    And notify set for 'STATUS' characteristic
    When watch updates 'STATUS' characteristic value to 226
    Then event with message '023' - 'Watch battery normal' should be emitted to the app
    And event with message '024' - 'Watch charger connected' should be emitted to the app
    And event with message '027' - 'Watch on wrist' should be emitted to the app
    When watch updates 'STATUS' characteristic value to 192
    Then event with message '030' - 'Watch shutdown is in progress' should be emitted to the app
    And event with message '025' - 'Watch charger removed' should be emitted to the app
