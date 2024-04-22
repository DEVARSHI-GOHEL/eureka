//
//  StartReadMealDataFn.swift
//  eureka
//
//  Created by Harshada Memane on 12/03/21.
//

import Foundation

extension BleProcStateEnum {
  
  static func nextMeasureState() -> BleProcStateEnum {
    switch MeasureProcess.currentProcState {
    case .NONE:
      return .SET_MEASURE_CALC_BEFORE
    case .SET_MEASURE_CALC_BEFORE:
      if MeasureProcess.currentProc == .CALIBRATE {
        return .CALIBRATION_REFERENCE_WRITE
      } else {
        return .MEASURE_START
      }
    case .CALIBRATION_REFERENCE_WRITE:
        return .MEASURE_START
    case .MEASURE_START:
      return .CHECK_MEASURE_PRECONDITION
    case .CHECK_MEASURE_PRECONDITION:
      if (Global.autoCalibrationOn) {
        return .COMMAND_RAW_DATA_2
      } else {
        return .VITAL_READ_COMMAND_FIRED
      }
    case .VITAL_READ_COMMAND_FIRED, .VITAL_PREVIOUS_READ_COMMAND_FIRED:
      return .READ_VITAL
    case .READ_VITAL:
      return .PROCESS_VITAL_DATA
    case .PROCESS_VITAL_DATA:
      return .SET_MEASURE_CALC_AFTER
    case .SET_MEASURE_CALC_AFTER:
      if MeasureProcess.currentProc == .CALIBRATE {
        if (Global.autoCalibrationOn) {
          return .COMMAND_RAW_DATA_2
        } else {
          return .READ_RAW_FIRST
        }
      } else if MeasureProcess.currentProc == .AUTO_MEASURE_SYNC {
        return .VITAL_PREVIOUS_READ_COMMAND_FIRED
      } else {
        return .MEAL_DATA_GET_LAST_MEAL
      }
    case .MEAL_DATA_GET_LAST_MEAL, .MEAL_DATA_GET_PREVIOUS_MEAL:
      return .MEAL_DATA_READ
    case .MEAL_DATA_READ:
      return .MEAL_DATA_PROCESS
    case .MEAL_DATA_PROCESS:
      if MeasureProcess.currentProc == .MEAL_DATA {
        return .MEAL_DATA_GET_PREVIOUS_MEAL
      } else {
        return .STEP_COUNT_GET_LAST_MEAL
      }
    case .STEP_COUNT_GET_LAST_MEAL:
      return .STEP_COUNT_READ
    case .STEP_COUNT_READ:
      return .STEP_COUNT_PROCESS
    case .STEP_COUNT_PROCESS:
      return .INSTAT_MEASURE_COMPLETED
    case .READ_RAW_FIRST, .READ_RAW_NEXT:
      return .READ_RAW_DATA
    case .READ_RAW_DATA:
      return .PROCESS_RAW_DATA
    case .COMMAND_RAW_DATA_2:
      return .READ_RAW_DATA_2
    case .READ_RAW_DATA_2:
      return .PROCESS_RAW_DATA_2
    case .PROCESS_RAW_DATA_2:
      return .COMMAND_RAW_DATA_2
    default:
      return MeasureProcess.currentProcState
    }
  }
}

public class MeasureProcess: BLEProcess {
  private var watchInProgress = false
    
  static var measureTimer: Timer?
  static var measurePercentage: Int = 0
  
  public static var currentProcState: BleProcStateEnum = .NONE
  public static var currentProc: BleProcEnum = .NONE
  
  // Calibration
  private static var collectionOfRawData:[[UInt8]] = []
  private static var goldParams: [String: Any?] = [:]
  
  init(status: ProceesStateResponse? = nil, calibrationParams: [String: Any?]? = nil,  proc: BleProcEnum, procSate: BleProcStateEnum) {

    if (proc == .AUTO_MEASURE) {
      if (procSate == .CHECK_MEASURE_PRECONDITION) {
        if (Global.autoCalibrationOn) {
          EventEmittersToReact.EmitAutoCalibrationResult( pResponse: AutoCalibrationResponse(pErrorCode: ResultCodeEnum.AUTO_CALIBRATION_STARTED))
        } else {
          EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.AUTO_MEASURE_STARTED))
        }
        self.watchInProgress = true
      }
    }
    if (Global.autoCalibrationOn) {
      if (procSate == .CHECK_MEASURE_PRECONDITION) {
        MeasureProcess.clearRawData()
      }
    } else {
      MeasureProcess.clearRawData()
    }
    MeasureProcess.goldParams = calibrationParams ?? [:]
    MeasureProcess.currentProc = proc
    MeasureProcess.currentProcState = procSate
    
    measureProcessCallback(proceesStateResponse: status)
  }
  
  internal class func addTimeToGoldParams(pTime:Int64) {
    if var mGoldParams = MeasureProcess.goldParams["data"] as? [String:Any] {
      mGoldParams["measure_time"] = pTime
      MeasureProcess.goldParams["data"] = mGoldParams
    }
  }
  
  static func resetProcessState() {
    MeasureProcess.stopMeasureTimer()
    ServiceFactory.getDeviceService().stopMeasureProcess()
    MeasureProcess.currentProc = .NONE
    MeasureProcess.currentProcState = .NONE
  }
  
  func continueAutoMeasureSyncCallback() {
    measureProcessCallback(proceesStateResponse: nil)
  }
  
  func measureProcessCallback(proceesStateResponse: ProceesStateResponse?) {
      
      switch MeasureProcess.currentProcState {
      case .CHECK_MEASURE_PRECONDITION:
          if MeasureProcess.currentProc != .AUTO_MEASURE_SYNC {
              if proceesStateResponse?.status?.isMeasureInProgress == true {
                  watchInProgress = true
              }
              if !watchInProgress && proceesStateResponse?.status?.isMeasureInProgress == false {
                  return
              }
          }
          if proceesStateResponse?.status?.isMeasureInProgress ?? true {
            return
          }
      case .READ_RAW_FIRST, .READ_RAW_NEXT, .READ_RAW_DATA, .PROCESS_RAW_DATA:
          // ignore steps and status notifications
          if proceesStateResponse?.characteristic?.value?.count == 10 || proceesStateResponse?.characteristic?.value?.count == 1 {
              return
          }
      case .VITAL_READ_COMMAND_FIRED, .READ_VITAL, .PROCESS_VITAL_DATA:
          if proceesStateResponse?.status?.isMeasureInProgress == false {
            return
          }
      default:
          break
      }
    
    MeasureProcess.currentProcState = BleProcStateEnum.nextMeasureState()
    
    self.performProcStateOperation(proceesStateResponse: proceesStateResponse)
  }
  
  private func performProcStateOperation(proceesStateResponse: ProceesStateResponse? = nil) {
    
    if let mError = proceesStateResponse?.error {
      reportError(mError: mError)
      return
    }
    
    var currentPeripheral: CBPeripheral?
    if let peripheral = proceesStateResponse?.peripheral {
      currentPeripheral = peripheral
    } else if let currentDevice = ServiceFactory.getDeviceService().currentDevice, let peripheral = currentDevice.peripheral {
        currentPeripheral = peripheral
    } else {
      return
    }
    
    var mCharctData: [UInt8]?
    if let characteristic = proceesStateResponse?.characteristic {
      if let data = characteristic.value {
        mCharctData = [UInt8](data)
      }
    }

    var stateResult: Bool = true

    if let peripheral = currentPeripheral {
      DispatchQueue.global().async {
        switch MeasureProcess.currentProcState {
        case .SET_MEASURE_CALC_BEFORE:
            AppSync.calculationOff = MeasureProcess.currentProc == .CALIBRATE
            stateResult = ProcessAppSyncFn(["peripheral" : peripheral], pNewProcState: BleProcStateEnum.APP_SYNC_WRITE).doOperation() as? ResponseBase != nil
        case .CALIBRATION_REFERENCE_WRITE:
            if let referenceVitals = MeasureProcess.goldParams["referenceVitalData"] as? Data,
               let mCharacteristic = BleUtil.getChara(peripheral, pServiceEnum: .CUSTOM_SERVICE, pCharEnum: .REFERENCE_VITAL_DATA) {
                peripheral.writeValue(referenceVitals, for: mCharacteristic, type: .withResponse)
                stateResult = true
            } else {
                print("Could not write reference vital data, continuing with measure.")
                self.measureProcessCallback(proceesStateResponse: nil)
            }
        case .MEASURE_START:
          let mStartedMeasure = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.STATUS)
          stateResult = mStartedMeasure.result
          if ((MeasureProcess.currentProc != .AUTO_MEASURE_SYNC) && (MeasureProcess.currentProc != .NONE)) {
            if (stateResult) {
              MeasureProcess.startMeasureTimer()
            }
          }
        case .CHECK_MEASURE_PRECONDITION:
          let mCommandResult = BleUtil.fireCommand(pPeripheral: peripheral, commandValue: [BleCommandEnum.START_MEASUREMENT.command])
          stateResult = mCommandResult.result
        case .VITAL_PREVIOUS_READ_COMMAND_FIRED:
          let mFiredLastVital = BleUtil.fireCommand(pPeripheral: peripheral, commandValue: [BleCommandEnum.GET_PREV_VITAL.command])
          stateResult = mFiredLastVital.result
        case .VITAL_READ_COMMAND_FIRED:
          let mFiredLastVital = BleUtil.fireCommand(pPeripheral: peripheral, commandValue: [BleCommandEnum.GET_LAST_VITAL.command])
          stateResult = mFiredLastVital.result
        case .READ_VITAL:
          let mReadVital = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.VITAL_DATA)
          stateResult = mReadVital.result
        case .PROCESS_VITAL_DATA:
          if let data = mCharctData {
            _ = ProcessVitalDataFn(["error":nil, "peripheral":peripheral, "data":data], currentProc: MeasureProcess.currentProc).doOperation()
            
            if MeasureProcess.currentProc != .AUTO_MEASURE_SYNC {
              
              DispatchQueue.main.async {
                MeasureProcess.stopMeasureTimer()
              }
              
              if MeasureProcess.currentProc == BleProcEnum.CALIBRATE {
                self.measureProcessCallback(proceesStateResponse: nil)
              } else if MeasureProcess.currentProc == BleProcEnum.INSTANT_MEASURE {
                  ServiceFactory.getDeviceService().stopMeasureProcess()
                  MeasureProcess.resetProcessState()
              } else {
                // Proceed to read Meal Data
                self.measureProcessCallback(proceesStateResponse: nil)
              }
            }
           
            stateResult = true
          }
        case .SET_MEASURE_CALC_AFTER:
            AppSync.calculationOff = false
            stateResult = ProcessAppSyncFn(["peripheral" : peripheral], pNewProcState: BleProcStateEnum.APP_SYNC_WRITE).doOperation() as? ResponseBase != nil
          
        case .MEAL_DATA_GET_LAST_MEAL:
          let mFiredLastMeal = BleUtil.fireCommand(pPeripheral: peripheral, commandValue: [BleCommandEnum.GET_LAST_MEAL.command])
          stateResult = mFiredLastMeal.result
        case .MEAL_DATA_GET_PREVIOUS_MEAL:
          let mFiredLastMeal = BleUtil.fireCommand(pPeripheral: peripheral, commandValue: [BleCommandEnum.GET_PREV_MEAL.command])
          stateResult = mFiredLastMeal.result
        case .MEAL_DATA_READ:
          let mReadMeal = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.MEAL_DATA)
          stateResult = mReadMeal.result
          
        case .MEAL_DATA_PROCESS:
          if let data = mCharctData, let _ = ProcessMealDataFn(["error":nil, "peripheral":peripheral, "data":data], currentProc: MeasureProcess.currentProc).doOperation() {
              MeasureProcess.currentProc = .STEP_COUNT
          }
          
          // Proceed to read Step count
          self.measureProcessCallback(proceesStateResponse: nil)
          
        case .STEP_COUNT_GET_LAST_MEAL:
          let mStepCount = BleUtil.fireCommand(pPeripheral: peripheral, commandValue: [self.stepCountCommand().command])
          stateResult = mStepCount.result
        case .STEP_COUNT_READ:
          let mReadMeal = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.STEP_COUNTER)
          stateResult = mReadMeal.result
        case .STEP_COUNT_PROCESS:
          if let data = mCharctData {
            _ = ProcessStepCountFn(["error":nil, "peripheral":peripheral, "data":data], currentProc: MeasureProcess.currentProc).doOperation()
          }
          
          // Process Stopped
          ServiceFactory.getDeviceService().stopMeasureProcess()
          MeasureProcess.resetProcessState()

          EventEmittersToReact.EmitCommonResult( pResponse: CommonResponse(pErrorCode: ResultCodeEnum.OFFLINE_VITAL_READ_COMPLETE))
          _ = FirmwareRevisionReadFn.init([:], pNewProc: .CONNECT, pNewProcState: .FIRMWARE_REVISION_READ).doOperation()

        case .COMMAND_RAW_DATA_2:
          let mReadVital = BleUtil.fireCommand(pPeripheral: peripheral, commandValue: BleCommandEnum.GET_FIRST_RAW.command)
          if (!(mReadVital.result)) {
            MeasureProcess.resetProcessState()
          }
          
        case .READ_RAW_DATA_2:
          let mReadRaw = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.RAW_DATA_2)
          if (!(mReadRaw.result)) {
            MeasureProcess.resetProcessState()
          }

        case .PROCESS_RAW_DATA_2:
          if let data = mCharctData, data.count > 0 {
            MeasureProcess.appendRawData(pRawRow: data)
            MeasureProcess.currentProcState = .COMMAND_RAW_DATA_2
            self.performProcStateOperation(proceesStateResponse: proceesStateResponse)
          } else {
            ProcessRawData2Fn(["error":nil, "peripheral":peripheral]).processRawData2()
            EventEmittersToReact.EmitAutoCalibrationResult( pResponse: AutoCalibrationResponse(pErrorCode: ResultCodeEnum.AUTO_CALIBRATION_SUCCESS))
            MeasureProcess.resetProcessState()
          }
          
        case .READ_RAW_FIRST:
          let mReadVital = BleUtil.fireCommand(pPeripheral: peripheral, commandValue: BleCommandEnum.GET_FIRST_RAW.command)
          stateResult = mReadVital.result
          MeasureProcess.measurePercentage = 0
          EventEmittersToReact.percentStatus(percentage: MeasureProcess.measurePercentage)
          
        case .READ_RAW_DATA:
          let mReadRaw = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.RAW_DATA)
          stateResult = mReadRaw.result

        case .PROCESS_RAW_DATA:
 
          guard let data = mCharctData else {
            ConsoleLogger.shared.log(value: "Calibration error for record = \(MeasureProcess.rawDataCount())")
            EventEmittersToReact.EmitCalibrationResult( pResponse: CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATION_ERROR))
            ServiceFactory.getDeviceService().stopMeasureProcess()
            MeasureProcess.resetProcessState()
            return
          }
          
          ProcessRawDataFn(["error":nil, "peripheral":peripheral, "data":mCharctData]).processRawData(pCharValue: data)

          if (MeasureProcess.rawDataCount() >= (data.count > 100 ? 500 : 1500)) {
            MeasureProcess.measurePercentage = 100
            EventEmittersToReact.percentStatus(percentage: MeasureProcess.measurePercentage)
            EventEmittersToReact.EmitCalibrationResult( pResponse: CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATION_SUCCESS))
            ServiceFactory.getDeviceService().stopMeasureProcess()
            MeasureProcess.resetProcessState()
          } else {
            if MeasureProcess.rawDataCount() % 15 == 0 {
              MeasureProcess.measurePercentage = (100 * MeasureProcess.rawDataCount()) / (data.count > 100 ? 500 : 1500)
              EventEmittersToReact.percentStatus(percentage: MeasureProcess.measurePercentage)
            }
            MeasureProcess.currentProcState = .READ_RAW_NEXT
            self.performProcStateOperation(proceesStateResponse: proceesStateResponse)
          }
          stateResult = true
          
        case .READ_RAW_NEXT:
          let mReadVital = BleUtil.fireCommand(pPeripheral: peripheral, commandValue: BleCommandEnum.GET_NEXT_RAW.command)
          stateResult = mReadVital.result
          
        default:
          break
        }
      }
    }
    
    if stateResult {
      reportSuccess()
    } else {
      reportError()
    }
  }

  private func reportSuccess() {
    DispatchQueue.global().async {
      switch MeasureProcess.currentProcState {
      case .MEASURE_START:
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "StartInstantMeasureFn", pEventDescription: "StartInstantMeasureFn called"))
      case .CHECK_MEASURE_PRECONDITION:
          LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "StatusReadForMeasureFn", pEventDescription: "start measure command fired"))
      case .VITAL_READ_COMMAND_FIRED:
          LpLogger.logInfo( LoggerStruct("doOperation", pFileName: "PreconditionPassedFn", pEventDescription: "Read vital command fired"))
      case .READ_VITAL: break
          // No Logging
      case .PROCESS_VITAL_DATA: break
          //No Logging
      default:
        break
      }
    }
  }
  
  func reportError(mError: Error? = nil) {
    
    MeasureProcess.stopMeasureTimer()
    ServiceFactory.getDeviceService().stopMeasureProcess()
    
    let errorDescription = mError?.localizedDescription ?? ""
    
    DispatchQueue.global().async {
        
    if MeasureProcess.currentProc == .CALIBRATE {
        // Doesn't matter what the state if calibration error
        MeasureProcess.currentProcState = .NONE
    }
      
      switch MeasureProcess.currentProcState {
      case .MEASURE_START: break
            //First command
      case .CHECK_MEASURE_PRECONDITION:
        EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "StatusReadForMeasureFn", pEventDescription: "Unable to fire start measure command (\(errorDescription)"))
      case .VITAL_READ_COMMAND_FIRED:
        EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "PreconditionPassedFn", pEventDescription: "Unable to fire start measure command (\(errorDescription)"))
      case .READ_VITAL:
        EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "VitalReadCmdFiredFn", pEventDescription: "Unable to fire vital read command (\(errorDescription)"))
      case .PROCESS_VITAL_DATA:
        EventEmittersToReact.EmitInstantMeasureResult( pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.GATT_READ_FAIL))
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "ProcessVitalDataFn", pEventDescription: "Unable to read vital (\(errorDescription))"))
      case .READ_RAW_FIRST:
        EventEmittersToReact.EmitCalibrationResult(pResponse: CalibrationResponse(pErrorCode: ResultCodeEnum.GATT_WRITE_FAIL))
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "ProcessVitalDataFn", pEventDescription: "Unable to fire start raw read"))
      case .READ_RAW_DATA:
        EventEmittersToReact.EmitCalibrationResult( pResponse: CalibrationResponse(pErrorCode: ResultCodeEnum.GATT_WRITE_FAIL))
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "ReadRawCmdFiredFn", pEventDescription: "Unable to read raw data characteristic"))
      case .READ_RAW_NEXT:
        EventEmittersToReact.EmitCalibrationResult( pResponse: CalibrationResponse(pErrorCode: ResultCodeEnum.GATT_WRITE_FAIL))
        LpLogger.logError( LoggerStruct("doOperation", pFileName: "ProcessRawDataFn", pEventDescription: "Unable to fire GET_NEXT_RAW command"))
      default:
        MeasureProcess.reportProcessError()
        break
      }
      
      MeasureProcess.resetProcessState()
    }
  }
}

extension MeasureProcess {
  
  internal class func startMeasureTimer() {
    DispatchQueue.main.async {
      
      MeasureProcess.measurePercentage = 0
            
      MeasureProcess.measureTimer = Timer.scheduledTimer(withTimeInterval: TimeInterval(4), repeats: true) { timer in
        
        MeasureProcess.measurePercentage = MeasureProcess.measurePercentage + 5
        
        ConsoleLogger.shared.log(value: self.measurePercentage)
        
        if MeasureProcess.measurePercentage <= 95 {
          EventEmittersToReact.percentStatus(percentage: self.measurePercentage)
        } else {
          MeasureProcess.stopMeasureTimer()
        }
      }
    }
  }
  
  internal class func stopMeasureTimer() {
    if let timer = MeasureProcess.measureTimer, timer.isValid {
      timer.invalidate()
      MeasureProcess.measureTimer = nil
      MeasureProcess.measurePercentage = 0
    }
  }
}


extension MeasureProcess {
  
  internal class func appendRawData(pRawRow:[UInt8]) {
    collectionOfRawData.append(pRawRow)
  }
  
  internal class func clearRawData() {
    collectionOfRawData.removeAll()
  }
  
  internal class func getDataAt(pIndex:Int) -> [UInt8]? {
    if (pIndex < collectionOfRawData.count) {
      return collectionOfRawData[pIndex]
    }
    return nil
  }
  
  internal class func uploadRawData() {
    // TODO
  }
  
  internal static func rawDataCount() -> Int {
    return collectionOfRawData.count
  }
  
  internal static func getGoldParams() -> [String:Any?] {
    return goldParams
  }
}

extension MeasureProcess {
  static func reportProcessError()  {
    switch MeasureProcess.currentProc {
    case .CALIBRATE:
      EventEmittersToReact.EmitCalibrationResult(pResponse: CalibrationResponse(pErrorCode: ResultCodeEnum.CALIBRATION_FAILED))
    case .INSTANT_MEASURE:
      EventEmittersToReact.EmitInstantMeasureResult(pResponse: InstantMeasureResponse(pErrorCode: ResultCodeEnum.INSTANT_MEASURE_FAILED))
    case .AUTO_MEASURE: break
    default: break
    } 
  }
}

extension MeasureProcess {
  
  func dayOfWeek() -> Int {
    let date = Date()
    let calendar = Calendar.current
    let components = calendar.dateComponents([.weekday], from: date)
    let dayOfWeek = components.weekday
    
    return dayOfWeek ?? 0
  }
  
  func stepCountCommand() -> BleCommandEnum {
    
    let dayOfWeek: Int = self.dayOfWeek()
    
    switch dayOfWeek {
    case 1:
      return BleCommandEnum.GET_STEP_COUNTER_SUN
    case 2:
      return BleCommandEnum.GET_STEP_COUNTER_MON
    case 3:
      return BleCommandEnum.GET_STEP_COUNTER_TUE
    case 4:
      return BleCommandEnum.GET_STEP_COUNTER_WED
    case 5:
      return BleCommandEnum.GET_STEP_COUNTER_THU
    case 6:
      return BleCommandEnum.GET_STEP_COUNTER_FRI
    case 7:
      return BleCommandEnum.GET_STEP_COUNTER_SAT
      
    default:
      return BleCommandEnum.GET_STEP_COUNTER_SUN
    }
  }
}

