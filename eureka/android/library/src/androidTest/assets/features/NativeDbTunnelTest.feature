@DbTunnelTest
Feature: The React Native app can use the db tunnel to perform database operations
  As a developer
  I would like to use native module
  To perform CRUD operations on a local database

  Background:
    Given app creates native module

  @SEQ-33
  Scenario: Insert data into the database
    When app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000", "2100");'
    And app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("3", "ID3", "3000", "");'
    And app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("4", "ID4", "4000", "4100");'
    And app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive devices
      | id | hw_id | date_added | update_date |
      | 2  | ID2   | 2000       | 2100        |
      | 3  | ID3   | 3000       |             |
      | 4  | ID4   | 4000       | 4100        |

  @SEQ-33
  Scenario Outline: Invalid insert query
    When app executes following SQL query: '<invalidQuery>'
    Then app shall receive error response
    When app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive empty response
    Examples:
      | invalidQuery                                                                                                     |
      | INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000");                  |
      | INSERT INTO devices (id, invalid_column, date_added, update_date) VALUES ("4", "ID4", "4000", "4100"); |

  @SEQ-33
  Scenario: Update data in the database
    When app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000", "2100");'
    And app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("3", "ID3", "3000", "");'
    And app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("4", "ID4", "4000", "4100");'
    And app executes following SQL query: 'UPDATE devices SET hw_id = "UPDATED_ID3", update_date = 5100 WHERE id = 3;'
    And app executes following SQL query: 'UPDATE devices SET hw_id = "UPDATED_ID4", date_added = 6000, update_date = 6100 WHERE id = 4;'
    And app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive devices
      | id | hw_id       | date_added | update_date |
      | 2  | ID2         | 2000       | 2100        |
      | 3  | UPDATED_ID3 | 3000       | 5100        |
      | 4  | UPDATED_ID4 | 6000       | 6100        |

  @SEQ-33
  Scenario Outline: Invalid update query
    When app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000", "2100");'
    And app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("3", "ID3", "3000", "");'
    And app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("4", "ID4", "4000", "4100");'
    And app executes following SQL query: '<invalidQuery>'
    Then app shall receive error response
    When app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive devices
      | id | hw_id | date_added | update_date |
      | 2  | ID2   | 2000       | 2100        |
      | 3  | ID3   | 3000       |             |
      | 4  | ID4   | 4000       | 4100        |
    Examples:
      | invalidQuery                                                                             |
      | UPDATE devices SET hw_id = "UPDATED_ID3", invalid_column = 5100 WHERE id = 3;          |
      | UPDATE devices SET hw_id = "UPDATED_ID3", update_date = 5100 WHERE invalid_column = 3; |
      | UPDATE devices WHERE id = 3;                                                           |

  @SEQ-33
  Scenario: Delete data from the database
    When app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000", "2100");'
    And app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("3", "ID3", "3000", "");'
    And app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("4", "ID4", "4000", "4100");'
    And app executes following SQL query: 'DELETE FROM devices WHERE id = 3;'
    And app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive devices
      | id | hw_id | date_added | update_date |
      | 2  | ID2   | 2000       | 2100        |
      | 4  | ID4   | 4000       | 4100        |

  @SEQ-33
  Scenario: Invalid delete query
    When app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000", "2100");'
    And app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("3", "ID3", "3000", "");'
    And app executes following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("4", "ID4", "4000", "4100");'
    And app executes following SQL query: 'DELETE FROM devices WHERE invalid_column = 3;'
    Then app shall receive error response
    When app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive devices
      | id | hw_id | date_added | update_date |
      | 2  | ID2   | 2000       | 2100        |
      | 3  | ID3   | 3000       |             |
      | 4  | ID4   | 4000       | 4100        |
