//
//  FirmwareRevisionReadFn.swift
//  nativeLib
//
//  Created by Lukas Racko on 17/08/2022.
//

import Foundation

internal class FirmwareRevisionReadFn: FunctionBase {

    internal override init(_ pParams:[String:Any?], pNewProc: BleProcEnum?, pNewProcState: BleProcStateEnum?) {
        super.init(pParams, pNewProc: pNewProc, pNewProcState: pNewProcState)
    }

    internal override func doOperation() -> Any? {
        if let currentDevice = ServiceFactory.getDeviceService().currentDevice {
            if let peripheral = currentDevice.peripheral {
                let _ = BleUtil.readCharacteristic(pPeripheral: peripheral, pWhichService: GattServiceEnum.DEVICE_INFORMATION_SERVICE, pWhichCharct: GattCharEnum.FIRMWARE_REVISION)
            }
        }
      return nil
    }
}
