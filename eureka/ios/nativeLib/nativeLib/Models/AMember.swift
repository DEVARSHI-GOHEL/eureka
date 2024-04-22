//
//  AMember.swift
//  LifePlus
//
//  Created by work on 10/09/20.
//

import Foundation

public class AMember {
  public final var name: String
  public final var dataTypeEnum: DataTypeEnum
  public final var length: Int

  public init(pName: String, pDataType: DataTypeEnum, pLength: Int) {
        name = pName
        dataTypeEnum = pDataType
        length = pLength
    }
}
