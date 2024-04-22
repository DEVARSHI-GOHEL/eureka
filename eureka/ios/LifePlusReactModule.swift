//
//  dbTunnel.swift
//  LifePlus
//
//  Created by work on 15/09/20.
//

import Foundation
import nativeLib
import Firebase
import skinToneDetection

@objc(LifePlusReactModule)
class LifePlusReactModule: RCTEventEmitter {
  
  private var automeasureQueue: DispatchQueue?
  private var continueAutomeasures: Bool = false
  private let bleModule = BleModule()
  private let dbModule = DbModule()
  private let skinTone = SkinToneDetection()
  
  private static var _emitter:EventEmittersToReact? = nil
  
  override init() {
    super.init()

    LifePlusReactModule._emitter = EventEmittersToReact(pParent: { name, body in
      self.sendOtherEvent(pWithName: name, pBody: body)
    })
  
    ServiceFactory.setCalendarService(calendarService: CalendarService.shared)
    ServiceFactory.setWeatherService(weatherService: WeatherManager.shared)
    
    NotificationCenter.default.addObserver(self, selector: #selector(timezoneDidChange), name: .NSSystemTimeZoneDidChange, object: nil)
  }
  
  deinit {
    NotificationCenter.default.removeObserver(self, name: .NSSystemTimeZoneDidChange, object: nil)
  }
  
  @objc
  func timezoneDidChange() {
    bleModule.updateTimeZone()
  }
  
  @objc
  public class func initErrorLogger() {
    ErrorLogger.logProvider = { message in
      Crashlytics.crashlytics().log(message)
    }
    ErrorLogger.errorProvider = { error in
      Crashlytics.crashlytics().record(error: error)
    }
  }

  override func constantsToExport() -> [AnyHashable : Any]! {
    return [
      "number": 123.9,
      "string": "LifePlus Eureka",
      "boolean": true,
      "array": [1, 22.2, "Array String"],
      "object": ["a": 1, "b": 2]
    ]
  }
  
  internal func sendOtherEvent(pWithName: String!, pBody: Any!) {
    sendEvent(withName: pWithName, body: pBody)
  }
  
  override func supportedEvents() -> [String]! {
    return ["DebugLog", "UploadOnCloud", "onIncrement", "onDecrement", "Measures", "PercentStatus", "InstantMeasures", "ScanResult", "InstantMeasureResult", "CalibrationResult", "RawDataPercentage", "AppSyncResult", "MealDataResult", "StepCountResult", "CommonResult", "AutoCalibrationResult", "FwUpdate", "TimerTick", "StepGoalResult"]
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
// Sample Methods End
  
//  Actual Methods Start
  @objc
  func dbTunnel(_ pRequest: String,
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) {
    print("Native: dbTunnel called")
    resolve(dbModule.dbTunnel(pRequest))
  }

  @objc
  func dbTunnelForMultipleQueries(_ pRequest: String,
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) {
      resolve(dbModule.dbTunnelForMultipleQueries(pRequest))
  }

  @objc
  func disconnect(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if let result = bleModule.disconnect() {
      resolve(result)
    }
  }
  
  @objc
  func startInstantMeasure(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if let result = bleModule.startInstantMeasure() {
      resolve(result)
    }
  }

  @objc
  func simuDeviceConnect(pRequest: String, resolver resolve: RCTPromiseResolveBlock) {
    resolve(bleModule.simuDeviceConnect(pRequest))
  }

  @objc
  func deviceConnect(_ pRequest: String,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) {
    if let result = bleModule.deviceConnect(pRequest) {
      resolve(result)
    }
  }
  
  @objc
  func appSync(_ pRequest: String,
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) {

//    let mJson:String = "{\"userId\": \"402\", \"deviceMsn\": \"ETECH4\", \"height_ft\": \"0\", \"height_in\": \"0\", \"weight\": \"200\", \"autoMeasure\": \"Y\", \"autoMeasureInterval\": \"5\", \"cgmModeOn\": \"N\", \"cgmUnit\": \"4\"}"
    
//    let mJson:String = "{\"userId\": \"402\", \"deviceMsn\": \"ETECH4\", \"height_ft\": \"0\", \"height_in\": \"0\", \"weight\": \"200\", \"autoMeasure\": \"Y\", \"autoMeasureInterval\": \"20\", \"cgmModeOn\": \"N\", \"cgmUnit\": \"1\", \"gender\": \"F\", \"notification\": \"0\", \"power_save\": \"N\", \"sleep_tracking\": \"Y\", \"weather\": \"0\"}"
    
    resolve(bleModule.appSync(pRequest))
  }

  @objc
  func calibrate(_ pRequest: String,
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) {
    if let result = bleModule.calibrate(pRequest) {
      resolve(result)
    }
  }
  
  @objc
  func apiError(_ pRequest: String,
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) {
    do {
      if let mRequestData = pRequest.data(using: .utf8) {
        if let requestInfo = try JSONSerialization.jsonObject(with: mRequestData, options: []) as? [String: Any] {
          ErrorLogger.shared.apiError(userInfo: requestInfo)
          resolve("Error logged")
          return
        }
      }
      resolve("Failed to log error - wrong request.")
    } catch let error {
      resolve("Error setting request keys: \(error.localizedDescription)")
    }
  }
  
  @objc
  func startDfuMode(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    LpLogger.logInfo(LoggerStruct("startDfuMode", pFileName: "LifePlusReactModule", pEventDescription: ""))
    resolve(bleModule.startDfuMode())
  }
  
  @objc
  func startFirmwareUpdate(_ pRequest: String,
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) {
    
    LpLogger.logInfo(LoggerStruct("startFirmwareUpdate", pFileName: "LifePlusReactModule", pEventDescription: pRequest))
    
    struct Request: Decodable {
      var FirmwareUpdateFilePath: String
    }
    
    guard let data = pRequest.data(using: .utf8),
          let request = try? JSONDecoder().decode(Request.self, from: data),
          FileManager.default.fileExists(atPath: request.FirmwareUpdateFilePath) else {
      
      LpLogger.logInfo(LoggerStruct("startFirmwareUpdate", pFileName: "LifePlusReactModule", pEventDescription: "Invalid file"))
      resolve(FirmwareUpdateResponse(pErrorCode: .FIRMWARE_UPDATE_INVALID_FILE).getResponseStr())
      return
    }
    
    resolve(bleModule.startFirmwareUpdate(file: request.FirmwareUpdateFilePath))
  }
  
  @objc
  func updateDailyStepGoal(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve(bleModule.updateDailyStepGoal())
  }
  
  @objc
  func displayImage(_ base64String: String,
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) {
      resolve(skinTone.displayImage(base64String))
  }
}
