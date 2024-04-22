//
//  SessionsTable.swift
//  LifePlus
//
//  Created by work on 10/09/20.
//

import Foundation

public class SessionsTable {
    public static let TABLE_NAME = "sessions"

    public class Cols {
      public static let ID: String = "id"
      public static let USER_ID: String = "user_id"
      public static let DEVICE_ID: String = "device_id"
      public static let LOGIN_DATE: String = "login_date"
      public static let LOGOUT_DATE: String = "logout_date"
      public static let AUTH_TOKEN: String = "auth_token"
      public static let REFRESH_TOKEN: String = "refresh_token"
      public static let GATEWAY_TOKEN: String = "gateway_token"
    }
}
