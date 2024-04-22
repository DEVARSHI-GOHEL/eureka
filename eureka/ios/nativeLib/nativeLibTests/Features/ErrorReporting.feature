@ErrorReporting
Feature: The React Native app can report critical errors
  As a developer
  I would like to use reported errors
  To investigate problems and fix them
  
  Background:
    Given app creates native module

  Scenario Outline: App reports database errors
    When app executes following SQL query: '<query>'
    Then app shall receive error response
    And app shall report 'Database Error' error
    And error shall contain key 'query' with value '<query>'
    And error shall contain key 'message' with value '<errorMessage>'
    Examples:
      | query                                             | errorMessage               |
      | SELECT * from invalid_table;                      | no such table              |
      | SELECT invalid_column from measures;              | no such column             |
      | INSERT INTO devices (date_added) VALUES ('4000'); | NOT NULL constraint failed |
      | UPDATE devices SET hw_id = 'UPDATED_ID3',         | incomplete input           |
      | DELETE * measures;                                | syntax error               |

  Scenario: App reports bluetooth error when reading characteristic fails
    Given watch is already connected
    And services and characteristics already discovered
    And has failure to read 'STATUS' characteristic
    When app reads 'STATUS' characteristic
    Then app shall report 'BLE Communication Error' error
    And error shall contain key 'message' with value 'Failed to read characteristic'
    And error shall contain key 'UUID' with value '4C505732-5F43-535F-5354-415455530000'
    And error shall contain key 'properties' with value '34'
    And error shall contain key 'operation' with value 'READ or CHANGED'

  Scenario: App reports bluetooth error when characteristic write fails
    Given watch is already connected
    And services and characteristics already discovered
    And has failure to write 'COMMAND' characteristic
    When app writes 1 to 'COMMAND' characteristic
    Then app shall report 'BLE Communication Error' error
    And error shall contain key 'message' with value 'Failed to write characteristic'
    And error shall contain key 'UUID' with value '4C505732-5F43-535F-434F-4D4D414E4400'
    And error shall contain key 'data' with value '-'
    And error shall contain key 'properties' with value '8'
    And error shall contain key 'operation' with value 'WRITE'

  @TinyWatch
  Scenario: App reports bluetooth error when subscribing to characteristic indication fails
    Given watch is already connected
    And services and characteristics already discovered
    And has failure to enable indications for 'STATUS' characteristic
    When app tries to enable indications on 'STATUS' characteristic
    Then event with message '108' - 'Unable to subscribe indicate' should be emitted to the app
    And app shall report 'BLE Communication Error' error
    And error shall contain key 'message' with value 'Failed to set notify on characteristic'
    And error shall contain key 'UUID' with value '4C505732-5F43-535F-5354-415455530000'
    And error shall contain key 'properties' with value '34'
    And error shall contain key 'operation' with value 'NOTIFY'

  Scenario: App reports bluetooth error after multiple scanning attempts
    Given scan timeout is 500 ms
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When watch was not found
    Then event with message '102' - 'No watch available' should be emitted to the app
    And app shall not report any error
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When watch was not found
    Then event with message '102' - 'No watch available' should be emitted to the app
    And app shall not report any error
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When watch was not found
    Then event with message '102' - 'No watch available' should be emitted to the app
    And app shall report 'BLE Scan Error' error
    And error shall contain key 'message' with value 'Scanning for watch third attempt'
    And error shall contain key 'MSN' with value '123456'

  Scenario: App reports bluetooth error after connecting is blocked by other process
    Given app is busy with 'CONNECT'
    When app requests connect to watch with MSN '123456'
    Then app shall not report any error
    And BLE scan shall not be started
    When app requests connect to watch with MSN '123456'
    Then app shall not report any error
    And BLE scan shall not be started
    When app requests connect to watch with MSN '123456'
    Then app shall report 'BLE Connection Error' error
    And error shall contain key 'message' with value 'Failed third attempt to connect, busy with CONNECT'

  Scenario: App reports bluetooth error after multiple connection errors
    Given watch has connection failure
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When watch was found
    Then event with message '102' - 'No watch available' should be emitted to the app
    And app shall not report any error
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When watch was found
    Then event with message '102' - 'No watch available' should be emitted to the app
    And app shall not report any error
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When watch was found
    Then event with message '102' - 'No watch available' should be emitted to the app
    And app shall report 'BLE Connection Error' error
    And error shall contain key 'message' with value 'Failed to connect'
    And error shall contain key 'MSN' with value '123456'

  Scenario: App reports API error
    When app reports API error with type 'POST', url 'www.testurl.com', data 'testData', options 'testOptions' and status 501
    Then app shall report 'API Error' error
    And error shall contain key 'message' with value 'Request failed with status code 501'
    And error shall contain key 'type' with value 'POST'
    And error shall contain key 'url' with value 'www.testurl.com'
    And error shall contain key 'data' with value 'testData'
    And error shall contain key 'options' with value 'testOptions'
    And error shall contain key 'status' with value 501
