//
//  BLEProcess.swift
//  eureka
//
//  Created by Harshada Memane on 19/03/21.
//

import Foundation

protocol BLEProcess {
  func measureProcessCallback(proceesStateResponse: ProceesStateResponse?)
  func continueAutoMeasureSyncCallback()
  func reportError(mError: Error?)
}
