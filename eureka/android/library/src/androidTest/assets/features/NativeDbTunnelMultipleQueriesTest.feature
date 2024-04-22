@DbTunnelMultipleQueriesTest
Feature: The React Native app can use the db tunnel to perform multiple database operations
  As a developer
  I would like to use native module
  To perform multiple CRUD operations at once on a local database

  Background:
    Given app creates native module

  @SEQ-33
  Scenario: Insert and select data from the database
    When app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive empty response
    When app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000", "2100");'
    And app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("3", "ID3", "3000", "");'
    And app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("4", "ID4", "4000", "4100");'
    When app prepares following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    And app executes prepared queries
    Then app shall receive devices
      | id | hw_id | date_added | update_date |
      | 2  | ID2   | 2000       | 2100        |
      | 3  | ID3   | 3000       |             |
      | 4  | ID4   | 4000       | 4100        |

  @SEQ-33
  Scenario: Invalid insert and select data from the database
    When app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive empty response
    When app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000", "2100");'
    And app prepares following SQL query: 'INSERT INTO devices (invalid_column, hw_id, date_added, update_date) VALUES ("3", "ID3", "3000", "");'
    And app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("4", "ID4", "4000", "4100");'
    And app prepares following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    And app executes prepared queries
    Then app shall receive devices
      | id | hw_id | date_added | update_date |
      | 2  | ID2   | 2000       | 2100        |
      | 4  | ID4   | 4000       | 4100        |

  @SEQ-33
  Scenario: Insert, update and select data from the database
    When app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive empty response
    When app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000", "2100");'
    And app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("3", "ID3", "3000", "");'
    And app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("4", "ID4", "4000", "4100");'
    And app prepares following SQL query: 'UPDATE devices SET hw_id = "UPDATED_ID3", update_date = 5100 WHERE id = 3;'
    And app prepares following SQL query: 'UPDATE devices SET hw_id = "UPDATED_ID4", date_added = 6000, update_date = 6100 WHERE id = 4;'
    And app prepares following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    And app executes prepared queries
    Then app shall receive devices
      | id | hw_id       | date_added | update_date |
      | 2  | ID2         | 2000       | 2100        |
      | 3  | UPDATED_ID3 | 3000       | 5100        |
      | 4  | UPDATED_ID4 | 6000       | 6100        |

  @SEQ-33
  Scenario: Insert, invalid update and select data from the database
    When app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive empty response
    When app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000", "2100");'
    And app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("3", "ID3", "3000", "");'
    And app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("4", "ID4", "4000", "4100");'
    And app prepares following SQL query: 'UPDATE devices SET invalid_column = "UPDATED_ID3", update_date = 5100 WHERE id = 3;'
    And app prepares following SQL query: 'UPDATE devices SET hw_id = "UPDATED_ID4", date_added = 6000, update_date = 6100 WHERE id = 4;'
    And app prepares following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    And app executes prepared queries
    Then app shall receive devices
      | id | hw_id       | date_added | update_date |
      | 2  | ID2         | 2000       | 2100        |
      | 3  | ID3         | 3000       |             |
      | 4  | UPDATED_ID4 | 6000       | 6100        |

  @SEQ-33
  Scenario: Insert, delete and select data from the database
    When app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive empty response
    When app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000", "2100");'
    And app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("3", "ID3", "3000", "");'
    And app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("4", "ID4", "4000", "4100");'
    And app prepares following SQL query: 'DELETE FROM devices WHERE id = 3;'
    And app prepares following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    And app executes prepared queries
    Then app shall receive devices
      | id | hw_id | date_added | update_date |
      | 2  | ID2   | 2000       | 2100        |
      | 4  | ID4   | 4000       | 4100        |

  @SEQ-33
  Scenario: Insert, invalid delete and select data from the database
    When app executes following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    Then app shall receive empty response
    When app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("2", "ID2", "2000", "2100");'
    And app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("3", "ID3", "3000", "");'
    And app prepares following SQL query: 'INSERT INTO devices (id, hw_id, date_added, update_date) VALUES ("4", "ID4", "4000", "4100");'
    And app prepares following SQL query: 'DELETE FROM devices WHERE invalid_column = 3;'
    And app prepares following SQL query: 'SELECT * from devices WHERE hw_id != \'HW_ID\''
    And app executes prepared queries
    Then app shall receive devices
      | id | hw_id | date_added | update_date |
      | 2  | ID2   | 2000       | 2100        |
      | 3  | ID3   | 3000       |             |
      | 4  | ID4   | 4000       | 4100        |
