@FirmwareUploader
Feature: The uploader library shall support firmware uploading to the watch

  Background:
    Given watch with MDN '123456' is connected
    And there is new firmware update in file 'fwupdate.cyacd2'

  #LFP-4
  Scenario: Uploader shall upload the file
    When firmware uploader uploads the file
    Then firmware update is fully uploaded
    When watch installs firmware update
    Then firmware uploader will report 'success'

  #LFP-4
  Scenario Outline: Uploader shall report errors
    Given there is a problem '<problem>' during firmware upload
    When firmware uploader uploads the file
    Then firmware uploader will report '<error>'

    Examples:
      | problem                               | error              |
      | unreadable file                       | fileReadError      |
      | unparsable file                       | fileParseError     |
      | invalid silicon id                    | fileParseError     |
      | watch disconnected                    | connectionError    |
      | ota characteristic not found          | communicationError |
      | invalid data                          | communicationError |
      | lost packet                           | communicationError |
      | fail to enable OTA char notifications | communicationError |
#      | crc check failed                      | crcError           |
      | exit bootloader write failed          | installationError  |
      | one response lost from remote device  | success            |
