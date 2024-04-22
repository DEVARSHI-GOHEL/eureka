//
//  CharacteristicsTable.swift
//  LifePlus
//
//  Created by work on 10/09/20.
//

import Foundation

public class CharacteristicsTable {
  public static let TABLE_NAME: String = "characteristics"

    public class Cols {
        public static let UID: String = "uid"
        public static let SERVICE_UID: String = "service_uid"
        public static let NAME: String = "name"
        public static let DATA_TYPE: String = "data_type"
        public static let DATA_LENGTH: String = "data_length"
        public static let PROPERTIES: String = "properties"
        public static let PERMISSION: String = "permissions"
    }
}
