//
//  DeviceService.swift
//  LPClient
//
//  Created by Andrey Filyakov on 18.02.2021.
//

public class DeviceService: NSObject {

  private static var processTimeoutTimer: Timer?
  private static var _currentProc:BleProcEnum = BleProcEnum.NONE {
    didSet {
      if oldValue != _currentProc && _currentProc == BleProcEnum.CONNECT {
        // TODO: redesign connection timeout
        scheduleTimeoutTimerForProcess(process: currentProc, timeInterval: TimeInterval(60))
      }
    }
  }
  
  internal static func scheduleTimeoutTimerForProcess(process: BleProcEnum, timeInterval: TimeInterval) {
    
    if let timer = processTimeoutTimer, timer.isValid {
      timer.invalidate()
      processTimeoutTimer = nil
    }

    DispatchQueue.main.async {
      processTimeoutTimer = Timer.scheduledTimer(timeInterval: timeInterval, target: self, selector: #selector(autoResetProcess(timer:)), userInfo: process, repeats: false)
    }
  }

  @objc
  private static func autoResetProcess(timer: Timer) {
    guard let resetProcess = timer.userInfo as? BleProcEnum else { return }
    if resetProcess == _currentProc {
      resetCurrentProcState()
      ConsoleLogger.shared.log(value: "Device service AutoResetProcess: \(resetProcess)")
      if resetProcess == .CONNECT {
        EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.WATCH_UNAVAILABLE))
      } else if resetProcess == .FIRMWARE_UPDATE {
        EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_ERROR_CONNECTION))
        ServiceFactory.getDeviceService().stopScan()
      }
    }
  }

  static func resetProcessState() {
    MeasureProcess.currentProc = .NONE
    MeasureProcess.currentProcState = .NONE
  }
    
  static var firmwareFile: URL?
  
  private static var processTimer: Timer?
  private static var _currentProcState:BleProcStateEnum = BleProcStateEnum.NONE

  private var manager: CBCentralManager!
  private var peripherals = [CBPeripheral]()
  public var currentDevice: Device?
  private var firmwareRevision: String = ""
    
  private var connectAttempts: Int = 0
  private var scanAttempts: Int = 0
  private var lastMeasureTime: Int64 = 0

  weak public var delegate: IDeviceServiceDelegate?

  private var measureProcess: BLEProcess?
  private var autoMeasureSyncNeeded: Bool = false
  private var statusQueue: [String] = []
  private var chargerStatusQueue: [ResultCodeEnum] = []
  private var wristStatusQueue: [(ResultCodeEnum, Bool)] = []

  private var notifyCharsFn: NotifyCharsFn?

  override convenience init() {
    self.init(CBCentralManagerFactory.instance())
  }
    
  internal init(_ centralManager: CBCentralManager) {
    super.init()
    manager = centralManager
    manager.delegate = self
  }

  private func scan() {
    if manager.isScanning {
      manager.stopScan()
    }
    peripherals.forEach({ manager.cancelPeripheralConnection($0) })
    peripherals.removeAll()
    currentDevice = nil
      // iOS supports backgound scanning only when explicit service UUID is defined.
      // When outside of DFU mode, app should scan for Battery service.
    manager.scanForPeripherals(withServices: nil)

    scanAttempts += 1
    if scanAttempts >= 3 {
      ErrorLogger.shared.bleScanError(message: "Scanning for watch third attempt")
    }
  }
    
  private func autoConnect() {
    DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(5), execute: {
        if let peripheral = self.getPeripheral() {
            self.reconnect(with: peripheral)
        }
    })
  }

  public static var currentProc: BleProcEnum {
    return _currentProc
  }

  internal static func setCurrentProc(pCurrentProc: BleProcEnum) {
    _currentProc = pCurrentProc
    if (pCurrentProc == BleProcEnum.NONE) {
      _currentProcState = BleProcStateEnum.NONE
    }
  }

  public static var currentProcState: BleProcStateEnum {
    return _currentProcState
  }
  
  public static func resetCurrentProcState() {
    setCurrentProcState(BleProcEnum.NONE, pCurrentProcState: BleProcStateEnum.NONE)
  }

  internal static func setCurrentProcState(_ pCurrentProc: BleProcEnum, pCurrentProcState: BleProcStateEnum?) {
    if let mCurrentProcState = pCurrentProcState {
      if (_currentProc == BleProcEnum.NONE) {
        _currentProc = pCurrentProc
        _currentProcState = mCurrentProcState
        return
      }
      if ((_currentProc == BleProcEnum.AUTO_MEASURE) || (_currentProc == BleProcEnum.INSTANT_MEASURE) || (_currentProc == BleProcEnum.CALIBRATE)) {
        if ((pCurrentProc == BleProcEnum.AUTO_MEASURE) || (pCurrentProc == BleProcEnum.INSTANT_MEASURE) || (pCurrentProc == BleProcEnum.CALIBRATE)) {
          _currentProcState = mCurrentProcState
        } else {
          _currentProc = pCurrentProc
          _currentProcState = mCurrentProcState
        }
      } else {
        _currentProc = pCurrentProc
        _currentProcState = mCurrentProcState
      }
      if (mCurrentProcState == BleProcStateEnum.NONE) {
        _currentProc = BleProcEnum.NONE
      }
    }
  }
    
    private func getPeripheral() -> CBPeripheral? {
        let scannedName = Global.getWatchMSNForScan().isEmpty ? Global.getWatchMSN() : Global.getWatchMSNForScan()
        if let peripheral = currentDevice?.peripheral, peripheral.name == scannedName {
            return peripheral
        }
        if let peripheral = peripherals.first(where: { $0.name == scannedName }) {
            return peripheral
        }
        let repo = ServiceFactory.getDeviceRepository()
        if let lastId = repo.lastDeviceId, let lastUuid = UUID(uuidString: lastId),
           let lastName = repo.lastDeviceName, lastName == scannedName,
           let peripheral = manager.retrievePeripherals(withIdentifiers: [lastUuid]).first {
                return peripheral
        }
        let serviceUuid = CBUUID(string: GattServiceEnum.CUSTOM_SERVICE.code)
        for peripheral in manager.retrieveConnectedPeripherals(withServices: [serviceUuid]) {
            if peripheral.name == scannedName {
                return peripheral
            }
        }
        return nil
    }
}

extension DeviceService: IDeviceService {
    public func startScan() {
        guard manager.state == .poweredOn else { return }
        if DeviceService._currentProc != .FIRMWARE_UPDATE, let peripheral = getPeripheral() {
            reconnect(with: peripheral)
        } else {
            scan()
        }
    }
    
  public func stopScan() {
    LpLogger.logInfo( LoggerStruct("stopScan", pFileName: "DeviceService", pEventDescription: "Scanning Stopped"))
    manager.stopScan()
  }
    
    public func connect(to device: Device) {
        if let peripheral = device.peripheral ?? peripherals.first(where: { $0.identifier.uuidString == device.id }) {
            LpLogger.logInfo( LoggerStruct("connect", pFileName: "DeviceService", pEventDescription: "connect called for \(device.name)"))
            currentDevice = device
            manager.connect(peripheral, options: nil)
        }
    }
    
    public func reconnect(with peripheral: CBPeripheral) {
        LpLogger.logInfo( LoggerStruct("reconnect", pFileName: "DeviceService",
                                       pEventDescription: "reconnect called for \(peripheral.name ?? "") \(peripheral.identifier)"))
        if manager.state == .poweredOn {
            currentDevice = Device(id: peripheral.identifier.uuidString,
                                   name: peripheral.name ?? "",
                                   services: (peripheral.services ?? []).map(\.uuid.uuidString),
                                   peripheral: peripheral)
            if !peripherals.contains(where: { $0.identifier == peripheral.identifier }) {
                peripherals.append(peripheral)
            }
            manager.connect(peripheral, options: nil)
        }
    }
  
  public func disconnect() {
    if let mDevice = currentDevice {
      if let mPeripheral = mDevice.peripheral {
        manager.cancelPeripheralConnection(mPeripheral)
      }
    }
  }
  
  public func startMeasureProcess(status: ProceesStateResponse? = nil, calibrationParams: [String: Any?]? = nil, proc: BleProcEnum,  procSate: BleProcStateEnum) {
    self.measureProcess = MeasureProcess(status:status, calibrationParams: calibrationParams, proc:proc,  procSate: procSate)
  }
  
  public func stopMeasureProcess() {
    self.measureProcess = nil
  }
  
  public func continueAutoMeasureSync() {
    if let process = self.measureProcess {
      process.continueAutoMeasureSyncCallback()
    }
  }
}

extension DeviceService: CBCentralManagerDelegate {
  public func centralManagerDidUpdateState(_ central: CBCentralManager) {
    switch central.state {
    case .poweredOn:
        startScan()
    case .poweredOff:
      delegate?.deviceDisconnected()
      
      if let process = self.measureProcess {
        process.reportError(mError: nil)
      }
      
      self.autoConnect()
      
    default:
      break
    }
  }
    
  public func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    if DeviceService.currentProc == .CONNECT {
      if !peripherals.contains(where: { $0.identifier == peripheral.identifier }) {
        if let name = advertisementData[CBAdvertisementDataLocalNameKey] as? String ?? peripheral.name {
          let scannedName = Global.getWatchMSNForScan().isEmpty ? Global.getWatchMSN() : Global.getWatchMSNForScan()
          if ((!name.isEmpty) && (name == scannedName)) {

            LpLogger.logInfo( LoggerStruct("didDiscover", pFileName: "DeviceService", pEventDescription: "device \(name) found in didDiscover"))

            peripherals.append(peripheral)
            connect(to: Device(id: peripheral.identifier.uuidString, name: name, services: [], peripheral: peripheral))
            delegate?.deviceFound(Device(id: peripheral.identifier.uuidString, name: name, services: [], peripheral: peripheral))
              
            scanAttempts = 0
          }
        }
      }
    } else if DeviceService.currentProc == .FIRMWARE_UPDATE {
        if let name = advertisementData[CBAdvertisementDataLocalNameKey] as? String ?? peripheral.name,
           name == FirmwareUploader.advertisedNameInDFUMode {
            LpLogger.logInfo( LoggerStruct("didDiscover", pFileName: "DeviceService", pEventDescription: "device \(name) found in didDiscover for DFU"))
            peripherals.removeAll { $0.identifier == peripheral.identifier }
            peripherals.append(peripheral)
            DeviceService.setCurrentProcState(.FIRMWARE_UPDATE, pCurrentProcState: .FIRMWARE_UPDATE_CONNECT_DFU_DEVICE)
            connect(to: Device(id: peripheral.identifier.uuidString, name: name, services: [], peripheral: peripheral))
            scanAttempts = 0
        }
    }
  }
    
  public func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
    if Self.currentProcState == .FIRMWARE_UPDATE_CONNECT_DFU_DEVICE {
      if let timer = DeviceService.processTimeoutTimer, timer.isValid {
        timer.invalidate()
        DeviceService.processTimeoutTimer = nil
      }
      stopScan()
      peripheral.delegate = self
      peripheral.discoverServices([FirmwareUploader.serviceUuid])
      connectAttempts = 0
      return
    }
    if let name = peripheral.name {
      let deviceId = ServiceFactory.getDeviceRepository().lastDeviceId
      if ((name == Global.getWatchMSNForScan()) || (name == Global.getWatchMSN()) || deviceId == peripheral.identifier.uuidString) {
        LpLogger.logInfo( LoggerStruct("didConnect", pFileName: "DeviceService", pEventDescription: "didConnect called for \(name)"))
        
        ServiceFactory.getCalendarService()?.registerEventChangeNotifications()
        // Weather service starts at end of initial sync
        
        peripheral.delegate = self
        peripheral.discoverServices(nil)
        Global.moveConfirmScanUser()
        
        EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.DISCOVERING_SERVICES))
        
        connectAttempts = 0
      }
    }
  }
    
  public func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
    if let name = peripheral.name {
      let deviceId = ServiceFactory.getDeviceRepository().lastDeviceId
        if ((name == Global.getWatchMSNForScan()) || (name == Global.getWatchMSN())
            || deviceId == peripheral.identifier.uuidString || name == FirmwareUploader.advertisedNameInDFUMode) {
        
        let errorInfo = error?.localizedDescription ?? "Unknown error"
        LpLogger.logInfo( LoggerStruct("didFailToConnect", pFileName: "DeviceService", pEventDescription: "didFailToConnect called for \(name) - error = \(errorInfo)"))

        delegate?.deviceDisconnected()
        currentDevice = nil
            
        if DeviceService.currentProc != .FIRMWARE_UPDATE {
            DeviceService.resetCurrentProcState()
            EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.WATCH_UNAVAILABLE))
          
            connectAttempts += 1
            if connectAttempts >= 3 {
                if let err = error {
                    ErrorLogger.shared.bleConnectionError(bleError: err, userInfo: nil)
                } else {
                    ErrorLogger.shared.bleConnectionError(message: "Failed third attempt to connect")
                }
            }
        }
        
        self.autoConnect()
      }
    }
  }
    
    public func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        guard let name = peripheral.name else { return }
        if DeviceService.currentProcState == .FIRMWARE_UPDATE_INITIATE_DFU || DeviceService.currentProcState == .FIRMWARE_UPDATE_START {
            DeviceService.resetCurrentProcState()
            EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.WATCH_UNAVAILABLE))
            currentDevice = nil
            return
        }
        let lastDeviceId = ServiceFactory.getDeviceRepository().lastDeviceId
        if (peripheral.identifier.uuidString == lastDeviceId) {
            LpLogger.logInfo(.init("didDisconnectPeripheral", pFileName: "DeviceService", pEventDescription: "didDisconnectPeripheral called for \(name) with error \(error?.localizedDescription ?? "nil")"))
            peripheral.delegate = nil
            currentDevice = nil
            StatusReadEvent.reset()
            ServiceFactory.getCalendarService()?.deRegisterEventChangeNotifications()
            ServiceFactory.getWeatherService()?.stopService()
            if let process = self.measureProcess {
                process.reportError(mError: error)
            }
            delegate?.deviceDisconnected()
            
            if DeviceService.currentProcState != .SCAN {
                DeviceService.resetCurrentProcState()
            }
            let scannedName = Global.getWatchMSNForScan().isEmpty ? Global.getWatchMSN() : Global.getWatchMSNForScan()
            if name == scannedName || name == FirmwareUploader.advertisedNameInDFUMode {
                EventEmittersToReact.emitConnectResult( pResponse: ConnectResponse(pErrorCode: ResultCodeEnum.WATCH_UNAVAILABLE))
                connectAttempts = 0
                self.autoConnect()
            }
        }
    }
}

extension DeviceService: CBPeripheralDelegate {
  public func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
    if Self.currentProcState == .FIRMWARE_UPDATE_CONNECT_DFU_DEVICE {
        guard error == nil, let service = (peripheral.services?.first { $0.uuid == FirmwareUploader.serviceUuid }) else {
            if error != nil || peripheral.services?.isEmpty == false { // empty in case bond is not removed
                DeviceService.setCurrentProc(pCurrentProc: .NONE)
                EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_ERROR_CONNECTION))
            }
            return
        }
        peripheral.discoverCharacteristics([FirmwareUploader.characteristicUuid], for: service)
        return
    }
    LpLogger.logInfo( LoggerStruct("didDiscoverServices", pFileName: "DeviceService", pEventDescription: "didDiscoverServices called for \(peripheral.name ?? "Unknown")"))

    if let device = currentDevice {
      LpLogger.logInfo( LoggerStruct("didDiscoverServices", pFileName: "DeviceService", pEventDescription: "creating device"))
      let newDevice = Device(id: device.id, name: device.name, services: peripheral.services?.compactMap({ $0.uuid.uuidString }) ?? [], peripheral: peripheral)
      LpLogger.logInfo( LoggerStruct("didDiscoverServices", pFileName: "DeviceService", pEventDescription: "device created"))

      currentDevice = newDevice

      var respository = ServiceFactory.getDeviceRepository()
      respository.lastDeviceId = device.id
      respository.lastDeviceName = device.name

      _ = ServicesDiscoveredFn(["error":error, "peripheral":peripheral]).doOperation()
    }
  }
    
  public func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
      if Self.currentProcState == .FIRMWARE_UPDATE_CONNECT_DFU_DEVICE {
          let characteristics = service.characteristics ?? []
          guard error == nil, (characteristics.contains { $0.uuid == FirmwareUploader.characteristicUuid }) else {
              Self.setCurrentProc(pCurrentProc: .NONE)
              EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_ERROR_CONNECTION))
              return
          }
          DeviceService.setCurrentProcState(.FIRMWARE_UPDATE, pCurrentProcState: .FIRMWARE_UPDATE_START)
          performFirmwareUpdate(on: peripheral)
          EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_START))
          return
      }
      
      var charsToNotity: [CBCharacteristic] = []
      if let statusChar = service.characteristics?.first(where: { c in
          [GattCharEnum.STATUS.code, GattCharEnum.STATUS.altCode].contains(c.uuid.uuidString)
      }) {
          charsToNotity.append(statusChar)
      }
      if let mealChar = service.characteristics?.first(where: { c in
          [GattCharEnum.MEAL_DATA.code, GattCharEnum.MEAL_DATA.altCode].contains(c.uuid.uuidString)
      }) {
          charsToNotity.append(mealChar)
      }
      if let stepChar = service.characteristics?.first(where: { c in
          [GattCharEnum.STEP_COUNTER.code, GattCharEnum.STEP_COUNTER.altCode].contains(c.uuid.uuidString)
      }) {
          charsToNotity.append(stepChar)
      }

      if !charsToNotity.isEmpty {
          notifyCharsFn = NotifyCharsFn([
            "error" : error,
            "peripheral" : peripheral,
            "chars" : charsToNotity
          ])
          notifyCharsFn = notifyCharsFn?.doOperation() as? NotifyCharsFn
      }
  }
  
  public func peripheral(_ peripheral: CBPeripheral, didUpdateNotificationStateFor characteristic: CBCharacteristic, error: Error?) {
      if let err = error {
          let userInfo: [String : String] = ["UUID" : characteristic.uuid.uuidString, "properties" : characteristic.properties.rawValue.description, "operation" : "NOTIFY", "peripheral state" : peripheral.state.rawValue.description]
          ErrorLogger.shared.bleCommunicationError(bleError: err, userInfo: userInfo)
      }
      
      if notifyCharsFn == nil {
          if DeviceService.currentProc == .CONNECT || error != nil {
              _ = CurrentTimeUpdateFn(["error": error, "peripheral": peripheral, "characteristic": characteristic], pNewProc: BleProcEnum.CONNECT, pNewProcState: BleProcStateEnum.SET_DATETIME).doOperation()
          }
      } else {
          notifyCharsFn = notifyCharsFn?.doOperation() as? NotifyCharsFn
      }
  }
    
  public func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
      if let err = error {
          let userInfo: [String : String] = ["UUID" : characteristic.uuid.uuidString, "properties" : characteristic.properties.rawValue.description, "operation" : "READ or CHANGED", "peripheral state" : peripheral.state.rawValue.description]
          ErrorLogger.shared.bleCommunicationError(bleError: err, userInfo: userInfo)
      }
      
      guard let data = characteristic.value else { return }

      let strValue = data.map { String($0) }.joined(separator: ",")
      LpLogger.logInfo(
        LoggerStruct(
            "didUpdateValueFor",
            pFileName: "DeviceService",
            pEventDescription: "READ or CHANGED characteristic \(characteristic.uuid.uuidString), value: [\(strValue)]"
        )
      )

    if let mServiceDef = ServiceDefs.getServiceDefForChar(pCharUuidStr: characteristic.uuid.uuidString) {
      if let mCharDef = mServiceDef.getCharacteristic(pUUID: characteristic.uuid.uuidString) {
        let mCharctData = [UInt8](data)
        let mCurrProc: BleProcEnum = DeviceService.currentProc
        let CurProcState: BleProcStateEnum = DeviceService.currentProcState

        switch (mCharDef.charEnum) {
        case .STATUS:
          let mStatus = StatusReadEvent(pNewStatus: mCharctData[0])
          
          emitStatusEvent(status: mStatus)
          
          if let process = self.measureProcess {
            process.measureProcessCallback(proceesStateResponse: (ProceesStateResponse(error: error, characteristic: characteristic, peripheral: peripheral, status: mStatus)))
          } else if MeasureProcess.currentProc == .NONE && mStatus.isMeasureInProgress {
            if self.autoMeasureSyncNeeded {
              // to skip initial sync stuck if measure sticks
              let newStatus = StatusReadEvent(pNewStatus: mCharctData[0] & 0xF7)
              self.startMeasureProcess(status: (ProceesStateResponse(error: error, characteristic: characteristic, peripheral: peripheral, status: newStatus)), proc: .AUTO_MEASURE_SYNC,  procSate: .CHECK_MEASURE_PRECONDITION)
            } else {
              self.startMeasureProcess(proc: .AUTO_MEASURE,  procSate: .CHECK_MEASURE_PRECONDITION)
            }
          } else if self.autoMeasureSyncNeeded {
            self.autoMeasureSyncNeeded = false
            self.startMeasureProcess(status: (ProceesStateResponse(error: error, characteristic: characteristic, peripheral: peripheral, status: mStatus)), proc: .AUTO_MEASURE_SYNC,  procSate: .CHECK_MEASURE_PRECONDITION)
          }
          
        case .VITAL_DATA, .MEAL_DATA, .STEP_COUNTER:
          if let process = self.measureProcess {
            process.measureProcessCallback(proceesStateResponse: (ProceesStateResponse(error: error, characteristic: characteristic, peripheral: peripheral, status: nil)))
          } else if mCharDef.charEnum == .MEAL_DATA {
              _ = ProcessMealDataFn(["error":nil, "peripheral":peripheral, "data":mCharctData], currentProc: MeasureProcess.currentProc).doOperation()
          } else if mCharDef.charEnum == .STEP_COUNTER {
              _ = ProcessStepCountFn(["error":nil, "peripheral":peripheral, "data":mCharctData], currentProc: MeasureProcess.currentProc).doOperation()
              EventEmittersToReact.EmitStepCount(pResponse: StepCountResponse(pErrorCode: ResultCodeEnum.STEP_COUNT_AVAILABLE))
          }
        case .RAW_DATA:
          if let process = self.measureProcess {
            process.measureProcessCallback(proceesStateResponse: (ProceesStateResponse(error: error, characteristic: characteristic, peripheral: peripheral, status: nil)))
          }
                    
        case .RAW_DATA_2:
          if let process = self.measureProcess {
            process.measureProcessCallback(proceesStateResponse: (ProceesStateResponse(error: error, characteristic: characteristic, peripheral: peripheral, status: nil)))
          }
            
        case .FIRMWARE_REVISION:
            let end = data.firstIndex(where: { $0 == 0 }) ?? data.endIndex
            firmwareRevision = String(decoding: data[..<end], as: UTF8.self)
            _ = StartAppSyncFn([:], pNewProc: .CONNECT, pNewProcState: .APP_SYNC_READ).doOperation()
            
            // end of sync
            DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(5), execute: {
              if self.lastMeasureTime > 0 {
                DbAccess.reviewOfflineMeasures(from: self.lastMeasureTime)
              }
              ServiceFactory.getWeatherService()?.startService()
            })
            
        case .USER_DATA:
          switch (mCurrProc) {
          case .APP_SYNC, .CONNECT:
            switch (CurProcState) {
            case .APP_SYNC_READ:
                _ = ProcessAppSyncFn(["error" : error, "peripheral" : peripheral, "data" : mCharctData, "firmwareRevision": firmwareRevision], pNewProcState: BleProcStateEnum.APP_SYNC_READ).doOperation()
            default: break
            }
          default: break
          }
        default:
          break
        }
      }
    }
  }
  
  public func peripheral(_ peripheral: CBPeripheral, didWriteValueFor characteristic: CBCharacteristic, error: Error?) {
      if let err = error {
          let userInfo: [String : String] = ["UUID" : characteristic.uuid.uuidString, "data" : characteristic.value?.map { String($0) }.joined(separator: ",") ?? "-", "properties" : characteristic.properties.rawValue.description, "operation" : "WRITE", "peripheral state" : peripheral.state.rawValue.description]
          ErrorLogger.shared.bleCommunicationError(bleError: err, userInfo: userInfo)
      }

      if let value = characteristic.value {
          let strValue = value.map { String($0) }.joined(separator: ",")
          LpLogger.logInfo(
            LoggerStruct(
                "didWriteValueFor",
                pFileName: "DeviceService",
                pEventDescription: "WRITE to characteristic \(characteristic.uuid.uuidString), value: [\(strValue)]"
            )
          )
      }
      
      switch (characteristic.uuid.uuidString) {
      case (GattCharEnum.WEATHER.code), (GattCharEnum.WEATHER.altCode):
          print("Weather updated")
      case (GattCharEnum.CURRENT_TIME.code), (GattCharEnum.CURRENT_TIME.altCode):
          _ = DateTimeSetFn(["error":error, "peripheral":peripheral]).doOperation()
      case (GattCharEnum.LOCAL_TIME_INFORMATION.code), (GattCharEnum.LOCAL_TIME_INFORMATION.altCode):
          _ = TimezoneSetFn(["error":error, "peripheral":peripheral]).doOperation()
      case (GattCharEnum.STEP_COUNTER.code), (GattCharEnum.STEP_COUNTER.altCode):
          let procState = DeviceService.currentProc
          _ = StepGoalSetFn(["error":error]).doOperation()
          if procState == .CONNECT {
              // following code only be called when connect or reconnect flow is called.
              self.autoMeasureSyncNeeded = true
              if (self.autoMeasureSyncNeeded) {
                  self.lastMeasureTime = DbAccess.getLatestMeasureTimestamp()
                  EventEmittersToReact.EmitCommonResult( pResponse: CommonResponse(pErrorCode: ResultCodeEnum.OFFLINE_VITAL_READ_START))
                  _ = BleUtil.readCustomCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.STATUS)
              }
          }
      case (GattCharEnum.COMMAND.code), (GattCharEnum.COMMAND.altCode):
          if let mServiceDef = ServiceDefs.getServiceDefForChar(pCharUuidStr: characteristic.uuid.uuidString) {
            if let mCharDef = mServiceDef.getCharacteristic(pUUID: characteristic.uuid.uuidString) {
              switch (mCharDef.charEnum) {
              case .COMMAND:
                if let process = self.measureProcess {
                  process.measureProcessCallback(proceesStateResponse: (ProceesStateResponse(error: error, characteristic: characteristic, peripheral: peripheral, status: nil)))
                }
              default: break
              }
            }
          }
    case (GattCharEnum.USER_DATA.code), (GattCharEnum.USER_DATA.altCode):
      let mCurrProc = DeviceService.currentProc
      switch (mCurrProc) {
      case .APP_SYNC, .CONNECT:
        let mCurrProcState = DeviceService.currentProcState
        switch (mCurrProcState) {
        case .APP_SYNC_WRITE:
          _ = UserInfoWrittenFn(["error": error, "firmwareRevision": firmwareRevision]).doOperation()
        default: break
        }
      default:
        if MeasureProcess.currentProcState == .SET_MEASURE_CALC_BEFORE || MeasureProcess.currentProcState == .SET_MEASURE_CALC_AFTER {
          if let process = self.measureProcess {
            process.measureProcessCallback(proceesStateResponse: (ProceesStateResponse(error: error, characteristic: characteristic, peripheral: peripheral, status: nil)))
          }
        }
      }
    case (GattCharEnum.REFERENCE_VITAL_DATA.code), (GattCharEnum.REFERENCE_VITAL_DATA.altCode):
      if let process = self.measureProcess {
        process.measureProcessCallback(proceesStateResponse: (ProceesStateResponse(error: error, characteristic: characteristic, peripheral: peripheral, status: nil)))
      }
    default: break
    }
  }
}

extension DeviceService {
  
  func emitStatusEvent(status: StatusReadEvent) {
    if statusQueue.isEmpty {
      DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(1)) {
        if self.statusQueue.count > 3 {
          ErrorLogger.shared.customError(message: "Status characteristic noise: [ \(self.statusQueue.joined(separator: ","))]")
        }
        self.statusQueue.removeAll()
      }
    }
    statusQueue.append(status.getData())

    if status.isBatteryLow !=  StatusReadEvent.isPrevBatteryLow {
      EventEmittersToReact.EmitCommonResult(pResponse: CommonResponse(pErrorCode: (status.isBatteryLow) ? .WATCH_BATTERY_LOW : .WATCH_BATTERY_NORMAL))
      StatusReadEvent.setBatteryStatus(status.isBatteryLow)
    }

    if status.isChargerConnected != StatusReadEvent.isPrevChargerConnected {
      if chargerStatusQueue.isEmpty {
        DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(1)) {
          if let event = self.chargerStatusQueue.last {
            EventEmittersToReact.EmitCommonResult(pResponse: CommonResponse(pErrorCode: event))
          }
          self.chargerStatusQueue.removeAll()
        }
      }
      chargerStatusQueue.append(status.isChargerConnected ? .WATCH_CHARGER_CONNECTED : .WATCH_CHARGER_DISCONNECTED)
      StatusReadEvent.setChargerConnected(status.isChargerConnected)
    }

    if status.isWatchNotOnWrist != StatusReadEvent.isPrevWatchNotOnWrist {
      if wristStatusQueue.isEmpty {
        DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(1)) {
          if let event = self.wristStatusQueue.last {
            if event.0 == .WATCH_NOT_ON_WRIST && event.1 {
              // skip event
            } else {
              EventEmittersToReact.EmitCommonResult(pResponse: CommonResponse(pErrorCode: event.0))
            }
          }
          self.wristStatusQueue.removeAll()
        }
      }
      wristStatusQueue.append((status.isWatchNotOnWrist ? .WATCH_NOT_ON_WRIST : .WATCH_ON_WRIST, status.isMeasureInProgress))
        
      StatusReadEvent.setWatchOnWrist(status.isWatchNotOnWrist)
    }

    if status.isShutdownInProgress != StatusReadEvent.isPrevShutdownInProgress || status.isShutdownManual != StatusReadEvent.isPrevShutdownManual {
      if status.isShutdownInProgress && !status.isShutdownManual {
        EventEmittersToReact.EmitCommonResult(pResponse: CommonResponse(pErrorCode: .WATCH_SHUTDOWN_IN_PROGRESS))
      }
      StatusReadEvent.setShutdownInProgress(status.isShutdownInProgress)
      StatusReadEvent.setShutdownManual(status.isShutdownManual)
    }

    if status.isMeasureSuccess != StatusReadEvent.isPrevMeasureSuccess {
      if !status.isMeasureSuccess {
        do {
          try DbAccess.addUnsuccessfulMeasurement(measureTime: Int64(Date().timeIntervalSince1970 * 1000))
        } catch let error {
          LpLogger.logInfo(LoggerStruct("UnsuccessfulMeasurement", pFileName: "DeviceService", pErrorCode: ResultCodeEnum.DB_OP_ERR, pEventDescription: "data NOT added to the database \(error.localizedDescription)", pLineNumber: ""))
        }
        EventEmittersToReact.EmitCommonResult(pResponse: CommonResponse(pErrorCode: .MEASURE_FAILED))
      }
      StatusReadEvent.setMeasureSuccess(status.isMeasureSuccess)
    }
  }
}

extension DeviceService {
    func performFirmwareUpdate(on peripheral: CBPeripheral) {
        guard let file = Self.firmwareFile else {
            EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_COMPLETE))
            self.disconnect()
            return
        }
        FirmwareUploader.upload(file, to: peripheral) { result in
            self.disconnect()

            switch result {
            case .success:
                EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_COMPLETE))
            case let .failure(error):
                switch error {
                case .connectionError:
                    EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_ERROR_CONNECTION))
                case let .fileReadError(cause):
                    EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_ERROR_FILE_READ, pMessage: cause.localizedDescription))
                case let .invalidFileError(cause):
                    EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_ERROR_FILE_PARSE, pMessage: cause.localizedDescription))
                case let .communicationError(cause):
                    EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_ERROR_COMMUNICATION, pMessage: cause.localizedDescription))
                case .crcError:
                    EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_ERROR_CRC))
                case .installationError:
                    EventEmittersToReact.EmitFwUpdate(pResponse: .init(pErrorCode: .FIRMWARE_UPDATE_ERROR_INSTALLATION))
                }
            }
        }
    }
}
