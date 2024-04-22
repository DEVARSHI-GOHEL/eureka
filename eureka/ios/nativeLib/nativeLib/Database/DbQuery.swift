//
//  DbQuery.swift
//  LifePlus
//
//  Created by work on 11/09/20.
//

import Foundation

public class DbQuery {
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
