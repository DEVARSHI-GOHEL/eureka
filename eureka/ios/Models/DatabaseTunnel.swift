//
//  DatabaseTunnel.swift
//  LifePlus
//
//  Created by work on 11/09/20.
//

import Foundation
import nativeLib

public class DatabaseTunnel {
  public var dbQuery: DbQuery?

  public func getDbQuery() -> DbQuery? {
      return dbQuery
  }
}
