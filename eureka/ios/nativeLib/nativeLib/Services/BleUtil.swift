//
//  BleUtil.swift
//  eureka
//
//  Created by work on 06/03/21.
//

import Foundation

public class BleUtil {
  internal class func getService(_ pPreipheral: CBPeripheral?, pServiceId: String) -> CBService? {
    var result:CBService? = nil
    
    if let mPreipheral = pPreipheral {
      if let mServices = mPreipheral.services {
        for mService in mServices {
          if (mService.uuid.uuidString == pServiceId) {
            result = mService
            break
          }
        }
      }
    }

    return result
  }
  
  internal class func getChara(_ pPreipheral: CBPeripheral?, pServiceEnum:GattServiceEnum, pCharEnum:GattCharEnum) -> CBCharacteristic? {
    var result:CBCharacteristic? = nil

    if let mCurrentPeripheral = pPreipheral {
      if let mServices = mCurrentPeripheral.services {
        for mServiceTemp in mServices {
          let mServiceUUID:String = mServiceTemp.uuid.uuidString.lowercased()
          var mThisService = false
      
          if ((mServiceUUID == pServiceEnum.code.lowercased()) || (mServiceUUID == pServiceEnum.altCode.lowercased())) {
            mThisService = true
          }
      
          if (mThisService) {
            if let mChars = mServiceTemp.characteristics {
              for characteristic in mChars {
                if ((characteristic.uuid.uuidString.lowercased() == pCharEnum.code.lowercased()) ||
                  (characteristic.uuid.uuidString.lowercased() == pCharEnum.altCode.lowercased())) {
                  result = characteristic
                  break
                }
              }
            }
            break
          }
        }
      }
    }
    return result
  }
  
  internal class func readCharacteristic(pPeripheral: CBPeripheral?, pWhichService:GattServiceEnum, pWhichCharct:GattCharEnum) -> (result:Bool, response:ResponseBase?) {
    var result:Bool = false
    var response:ResponseBase?

    if let currentPeripheral = pPeripheral {
      if let mCommandChar = BleUtil.getChara(pPeripheral, pServiceEnum: pWhichService, pCharEnum: pWhichCharct) {
        currentPeripheral.readValue(for: mCommandChar)
        result = true
      } else {
        response =  ResponseBase(pErrorCode: ResultCodeEnum.UNABLE_CHARCT_READ, pMessage: "Unable to get \(pWhichCharct.desc) characteristic")
      }
    } else {
      response = ResponseBase(pErrorCode: ResultCodeEnum.NOT_CONNECTED)
    }

    return (result:result, response:response)
  }

  internal class func readCustomCharacteristic(pPeripheral: CBPeripheral?, pWhichCharct:GattCharEnum) -> (result:Bool, response:ResponseBase?) {
    let mResult = readCharacteristic(pPeripheral: pPeripheral, pWhichService: GattServiceEnum.CUSTOM_SERVICE, pWhichCharct: pWhichCharct)
    return (result:mResult.result, response:mResult.response)
  }
  
  internal class func writeCharacteristic(pPeripheral: CBPeripheral?, pWhichService: GattServiceEnum, pWhichCharct:GattCharEnum, pValue:[UInt8]) -> (result: Bool, response: ResponseBase?) {
    var result:Bool = false
    var response:ResponseBase?
    if let currentPeripheral = pPeripheral {
      if let mCharacteristic = BleUtil.getChara(pPeripheral, pServiceEnum: pWhichService, pCharEnum: pWhichCharct) {
        currentPeripheral.writeValue(Data(pValue), for: mCharacteristic, type: .withResponse)
        result = true
      } else {
          let strValue = pValue.map { String($0) }.joined(separator: ",")
          response = ResponseBase(pErrorCode: ResultCodeEnum.GATT_WRITE_FAIL, pMessage: "Unable to find: \(pWhichCharct.code) while writing: [\(strValue)]")
          LpLogger.logError(
            LoggerStruct(
                "writeCharacteristic",
                pFileName: "BleDevice",
                pErrorCode: ResultCodeEnum.GATT_WRITE_FAIL,
                pEventDescription: "Unable to find: \(pWhichCharct.code) while writing: [\(strValue)]",
                pLineNumber: ""
            )
          )
      }
    } else {
        let strValue = pValue.map { String($0) }.joined(separator: ",")
        response = ResponseBase(pErrorCode: ResultCodeEnum.NOT_CONNECTED, pMessage: "Watch not connected while writing to: [\(strValue)]")
        LpLogger.logError(
            LoggerStruct(
                "writeCharacteristic",
                pFileName: "BleDevice",
                pErrorCode: ResultCodeEnum.NOT_CONNECTED,
                pEventDescription: "Watch not connected while writing: [\(strValue)]",
                pLineNumber: ""
            )
        )
    }
    return (result: result,response: response)
  }

  public class func writeCustomdCharacteristic(pPeripheral: CBPeripheral?, pWhichCharct:GattCharEnum, pValue:[UInt8]) -> (result: Bool, response: ResponseBase?) {
    return writeCharacteristic(pPeripheral: pPeripheral, pWhichService: GattServiceEnum.CUSTOM_SERVICE, pWhichCharct:pWhichCharct, pValue:pValue)
  }
  
  internal class func fireCommand(pPeripheral: CBPeripheral?, commandValue:[UInt8]) -> (result: Bool, response: ResponseBase?) {
    return writeCustomdCharacteristic(pPeripheral: pPeripheral, pWhichCharct: GattCharEnum.COMMAND, pValue: commandValue)
  }
  
  internal class func fireCommand(pPeripheral: CBPeripheral?, commandValue:UInt8) -> (result: Bool, response: ResponseBase?) {
    return writeCustomdCharacteristic(pPeripheral: pPeripheral, pWhichCharct: GattCharEnum.COMMAND, pValue: [commandValue])
  }
}
