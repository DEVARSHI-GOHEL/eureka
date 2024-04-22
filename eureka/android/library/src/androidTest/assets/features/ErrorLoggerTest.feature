@ErrorLogger
Feature: As a user I would like my mobile application to automatically report critical issues to LifePlus
  so that I do not have to call support for the problems to be resolved.

  Background:
    Given app creates native module

  Scenario Outline: App reports database errors
    When app executes following SQL query: '<query>'
    Then app shall receive error response
    And app shall report 'database' error with message 'Failed to execute query'
    And error shall contain key 'Query' with value '<query>'
    And error shall contain key 'Query error message' with value '<errorMessage>'
    Examples:
      | query                                             | errorMessage               |
      | SELECT * from invalid_table;                      | no such table              |
      | SELECT invalid_column from measures;              | no such column             |
      | INSERT INTO devices (date_added) VALUES ("4000"); | NOT NULL constraint failed |
      | UPDATE devices SET hw_id = "UPDATED_ID3",         | incomplete input           |
      | DELETE * measures;                                | syntax error               |

  Scenario Outline: App reports bluetooth error when reading characteristic fails
    Given watch with MSN '123456' is already connected
    And characteristic read failure is '<failType>'
    When app reads 'STATUS' characteristic
    Then app shall report 'bluetooth' error with message '<errorMessage>'
    And error shall contain key 'Characteristic UUID' with value '4C505732-5F43-535F-5354-415455530000'
    And error shall contain key 'Characteristic data' with value '-'
    And error shall contain key 'Characteristic properties' with value '34'
    And error shall contain key 'Bluetooth operation' with value 'READ'
    And error shall contain key 'GATT status' with value '<gattStatus>'
    Examples:
      | failType | gattStatus | errorMessage                              |
      | initiate |            | Failed to initiate read on characteristic |
      # 257 - gatt failure status code
      | complete | 257        | Failed reading characteristic             |


  Scenario Outline: App reports bluetooth error when characteristic write fails
    Given watch with MSN '123456' is already connected
    And characteristic write failure is '<failType>'
    When app writes 1 to command characteristic
    Then app shall report 'bluetooth' error with message '<errorMessage>'
    And error shall contain key 'Characteristic UUID' with value '4C505732-5F43-535F-434F-4D4D414E4400'
    And error shall contain key 'Characteristic data' with value '1'
    And error shall contain key 'Characteristic properties' with value '8'
    And error shall contain key 'Bluetooth operation' with value 'WRITE'
    And error shall contain key 'GATT status' with value '<gattStatus>'
    Examples:
      | failType | gattStatus | errorMessage                               |
      | initiate |            | Failed to initiate write on characteristic |
      | complete | 257        | Failed writing to characteristic           |

  Scenario Outline: App reports bluetooth error when subscribing to characteristic indication fails
    Given watch with MSN '123456' is already connected
    And failure for enabling indications on characteristic is '<failType>'
    When app tries to enable indications on status characteristic
    Then app shall report 'bluetooth' error with message '<errorMessage>'
    And error shall contain key 'Characteristic UUID' with value '4C505732-5F43-535F-5354-415455530000'
    And error shall contain key 'Characteristic data' with value '-'
    And error shall contain key 'Characteristic properties' with value '34'
    And error shall contain key 'Bluetooth operation' with value 'INDICATE'
    And error shall contain key 'GATT status' with value '<gattStatus>'
    Examples:
      | failType | gattStatus | errorMessage                                |
      | initiate |            | Failed to enable INDICATE on characteristic |
      | complete | 257        | Failed writing to descriptor                |

  Scenario Outline: App reports bluetooth error when changing MTU size
    Given watch with MSN '123456' is already connected
    And changing MTU size failure is '<failType>'
    When app tries to change MTU size
    Then app shall report 'bluetooth' error with message '<errorMessage>'
    And error shall contain key 'GATT status' with value '<gattStatus>'
    Examples:
      | failType | gattStatus | errorMessage                          |
      | initiate |            | Failed to initiate change of MTU size |
      | complete | 257        | Failed to change MTU size             |

  Scenario: App reports bluetooth error after multiple scanning timeouts
    Given scan timeout is 50 ms
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When 100 ms goes by
    Then app shall not report any error
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When 100 ms goes by
    Then app shall not report any error
    When app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    And app shall report 'bluetooth' error with message 'Scanning for watch has failed repeatedly.'
    And error shall contain key 'MSN' with value '123456'


  Scenario: App reports bluetooth error after connecting is blocked by other process
    When current process is 'CONNECT'
    And app requests connect to watch with MSN '123456'
    Then app shall not report any error
    When 100 ms goes by
    And app requests connect to watch with MSN '123456'
    Then app shall not report any error
    When 100 ms goes by
    And app requests connect to watch with MSN '123456'
    Then app shall report 'bluetooth' error with message 'Connecting to watch has failed repeatedly.'


  Scenario: App reports bluetooth error after multiple connection timeouts
    Given connect timeout is 50 ms
    And connection attempt failure is timeout
    When app requests connect to watch with MSN '123456'
    And watch was found
    Then app shall not report any error
    And 100 ms goes by
    When current process is 'NONE'
    And app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When watch was found
    Then app shall not report any error
    And 100 ms goes by
    When current process is 'NONE'
    And app requests connect to watch with MSN '123456'
    Then BLE scan shall be started
    When watch was found
    Then app shall report 'bluetooth' error with message 'Connecting to watch has failed repeatedly.'
    And error shall contain key 'MSN' with value '123456'

  Scenario: App reports API error
    When app reports API error with type 'POST', url 'www.testurl.com', data 'testData', options 'testOptions' and status 501
    Then app shall report 'api' error with message 'Request POST www.testurl.com failed with status code 501'
    And error shall contain key 'Request type' with value 'POST'
    And error shall contain key 'Request URL' with value 'www.testurl.com'
    And error shall contain key 'Request data' with value 'testData'
    And error shall contain key 'Request options' with value 'testOptions'
    And error shall contain key 'Request status code' with value '501'
