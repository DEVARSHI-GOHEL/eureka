@FirmwareUploader
Feature: Firmware uploader shall upload new firmware files to the watch

  Background:
    Given watch in DFU mode is connected
    And there is new firmware update file 'fwupdate_small.cyacd2'

  @LFP-2
  Scenario: Uploader shall upload the file
    When firmware uploader uploads the file
    Then firmware uploader shall return 'success'
    And firmware update file shall be fully uploaded
    
  @LFP-2
  Scenario Outline: Uploader shall report errors
    Given there is a problem during firmware upload: '<problem>'
    When firmware uploader uploads the file
    Then firmware uploader shall return '<error>'
    
    Examples:
    | problem                 | error              |
    | unreadable file         | fileReadError      |
    | malformed file          | invalidFileError   |
    | wrong silicon id        | invalidFileError   |
    | wrong silicon revision  | invalidFileError   |
    | watch not connected     | connectionError    |
    | watch disconnected      | connectionError    |
    | subscription failed     | communicationError |
    | error response          | communicationError |
    | response timeout        | communicationError |
    | crc check failed        | crcError           |
    | exit dfu failed         | installationError  |
