//
//  StatusReadEvent.swift
//  eureka
//
//  Created by work on 14/02/21.
//

import Foundation

internal class StatusReadEvent: EventBase {
  private static var _prevBatteryLow: Bool? = nil
  private static var _prevChargerConnected: Bool? = nil
  private static var _prevWatchNotOnWrist: Bool? = nil
  private static var _prevMeasureInProgress: Bool = false
  private static var _prevMlUpdateInProgress: Bool = false
  private static var _prevShutdownManual: Bool = false
  private static var _prevShutdownInProgress: Bool? = nil
  private static var _prevMeasureSuccess: Bool = false
    
  private final var _rawStatus: UInt8

  private var _batteryLow: Bool = false
  private var _chargerConnected: Bool = false
  private var _watchNotOnWrist: Bool = false
  private var _measureInProgress: Bool = false
  private var _mlUpdateInProgress: Bool = false
  private var _shutdownManual: Bool = false
  private var _shutdownInProgress: Bool = false
  private var _measureSuccess: Bool = false

  internal init(pNewStatus: UInt8) {
    _rawStatus = pNewStatus
    super.init()
    _batteryLow = ((pNewStatus & 1) == 1)
    _chargerConnected = (((pNewStatus >> 1) & 1) == 1)
    _watchNotOnWrist = (((pNewStatus >> 2) & 1) == 1)
    _measureInProgress = (((pNewStatus >> 3) & 1) == 1)
    _mlUpdateInProgress = (((pNewStatus >> 4) & 1) == 1)
    _shutdownManual = (((pNewStatus >> 5) & 1) == 1)
    _shutdownInProgress = (((pNewStatus >> 6) & 1) == 1)
    _measureSuccess = (((pNewStatus >> 7) & 1) == 1)
  }
    
  internal static func reset() {
      _prevBatteryLow = nil
      _prevChargerConnected = nil
      _prevWatchNotOnWrist = nil
      _prevMeasureInProgress = false
      _prevMlUpdateInProgress = false
      _prevShutdownManual = false
      _prevShutdownInProgress = nil
      _prevMeasureSuccess = false
  }

  internal var isBatteryLow: Bool {
    return _batteryLow
  }

  internal var isChargerConnected: Bool {
    return _chargerConnected
  }

  internal var isWatchNotOnWrist: Bool {
    return _watchNotOnWrist
  }

  internal var isMeasureInProgress: Bool {
    return _measureInProgress
  }

  internal var isMlUpdateInProgress: Bool {
    return _mlUpdateInProgress
  }

  internal var isShutdownManual: Bool {
    return _shutdownManual
  }
    
  internal var isShutdownInProgress: Bool {
    return _shutdownInProgress
  }
    
  internal var isMeasureSuccess: Bool {
    return _measureSuccess
  }

  internal static var isPrevBatteryLow: Bool? {
    return _prevBatteryLow
  }
  
  internal class func setBatteryStatus(_ isLow: Bool) {
    _prevBatteryLow = isLow
  }

  internal static var isPrevChargerConnected: Bool? {
    return _prevChargerConnected
  }

  internal class func setChargerConnected(_ isConnected: Bool) {
    _prevChargerConnected = isConnected
  }

  internal static var isPrevWatchNotOnWrist: Bool? {
    return _prevWatchNotOnWrist
  }
  
  internal class func setWatchOnWrist(_ isOnWrist: Bool) {
    _prevWatchNotOnWrist = isOnWrist
  }

  internal static var isPrevMeasureInProgress: Bool {
    return _prevMeasureInProgress
  }

  internal static var isPrevMlUpdateInProgress: Bool {
    return _prevMlUpdateInProgress
  }

  internal static var isPrevShutdownManual: Bool {
    return _prevShutdownManual
  }
    
  internal class func setShutdownManual(_ shutdownManual: Bool) {
    _prevShutdownManual = shutdownManual
  }
    
  internal static var isPrevShutdownInProgress: Bool? {
    return _prevShutdownInProgress
  }
    
  internal class func setShutdownInProgress(_ shutdownInProgress: Bool) {
    _prevShutdownInProgress = shutdownInProgress
  }
    
  internal static var isPrevMeasureSuccess: Bool {
    return _prevMeasureSuccess
  }
      
  internal class func setMeasureSuccess(_ measureSuccess: Bool) {
    _prevMeasureSuccess = measureSuccess
  }

  internal override func getData() -> String {
    return "{newStatus: \(_rawStatus)}"
  }
}
