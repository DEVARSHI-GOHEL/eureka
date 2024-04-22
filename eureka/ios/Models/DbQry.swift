//
//  DbQry.swift
//  LifePlus
//
//  Created by work on 16/09/20.
//

import Foundation
import nativeLib

public class DbQry {
  private final var _type: DbQueryType
  private final var _name: String
  private final var _query: String

  public init(pQueryType: DbQueryType, pName: String, pQuery: String) {
    _type = pQueryType
    _name = pName
    _query = pQuery
  }

  public func getType() -> DbQueryType {
    return _type
  }

  public func getQuery() -> String {
    return _query
  }

  public func getName() -> String {
      return _name
  }
}
