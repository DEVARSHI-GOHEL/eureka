//
//  UserSessionStruct.swift
//  BLEDemo
//

import Foundation

public class UserSessionStruct {
    
  private final var id: String
  private final var user_id: String
  private final var device_id: String
  private final var login_date: Date?
  private final var logout_date: Date?
  private final var auth_token: String
  private final var refresh_token: String
  private final var gateway_token: String
    
  internal init(pId: String, pUserId: String, pDeviceId: String, pLoginDate: Date?, pLogoutDate: Date?,
                pAuthToken: String, pRefreshToken: String, pGatewayToken: String) {
    id = pId;
    user_id = pUserId;
    device_id = pDeviceId;
    login_date = pLoginDate;
    logout_date = pLogoutDate;
    auth_token = pAuthToken;
    refresh_token = pRefreshToken;
    gateway_token = pGatewayToken;
  }
    
  internal func getSessionId() -> String {
    return id
  }
    
  internal func getUserId() -> String {
    return user_id
  }
    
  internal func getDeviceId() -> String {
    return device_id
  }
    
  internal func getLoginDate() -> Date? {
    return login_date
  }
    
  internal func getLogoutDate() -> Date? {
    return logout_date
  }
    
  internal func getAuthToken() -> String {
    return auth_token;
  }
    
  internal func getRefreshToken() -> String {
    return refresh_token
  }
    
  internal func getGatewayToken() -> String {
    return gateway_token
  }
}
