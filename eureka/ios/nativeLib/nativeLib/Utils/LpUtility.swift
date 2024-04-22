//
//  LpUtility.swift
//  eureka
//
//  Created by work on 04/02/21.
//

import Foundation

public class LpUtility {
  internal static func encodeHexString(byteArray: [UInt8]) -> String {
    var hexStringBuffer = ""
    for i in 0...byteArray.count {
      hexStringBuffer.append(byteToHexString(num: byteArray[i]) + " ");
    }
    return hexStringBuffer;
  }

  private static func byteToHexString(num: UInt8) -> String {
    return String(format:"%02X", num)
  }

  internal static func byteArrToInt(pFirstByte: UInt8, pSecondByte: UInt8) -> Int {
    var result: Int = 0
    var mFirstInt = Int(pFirstByte)
    if (pFirstByte < 0) {
      mFirstInt += 256
    }
    var mSecondInt = Int(pSecondByte)
    if (pSecondByte < 0) {
      mSecondInt += 256
    }
    result = (mSecondInt * 256) + mFirstInt;
    return result;
  }

  internal static func byteToInt(pByte: UInt8) -> Int {
    var result = Int(pByte)
    if pByte < 0 {
      result += 256
    }
    return result
  }
  
  internal class func byteArrayToLong(pByte1: UInt8, pByte2: UInt8, pByte3: UInt8, pByte4: UInt8) -> Int64 {
    var result: Int64 = 0
    result = Int64(pByte1) * Int64(pow(Double(2), Double(24)))
    result += Int64(pByte2) * Int64(pow(Double(2), Double(16)))
    result += Int64(pByte3) * Int64(pow(Double(2), Double(8)))
    result += Int64(pByte4)
    return result
  }

  internal static func intToByteArr(pInteger: Int) -> [UInt8] {
    var result = [UInt8](repeating: 0, count: 2)

    result[0] = UInt8(pInteger % 256)
    result[1] = UInt8(pInteger / 256)

    return result
  }
  
  internal static func getTimeSyncData() -> [UInt8] {
    var result = [UInt8](repeating: 0, count: 9)
    
    let mYear = Int(Calendar.current.component(.year, from: Date()))
    result[0] = (UInt8)(mYear % 256);
    result[1] = UInt8(mYear / 256)

    result[2] = UInt8(Calendar.current.component(.month, from: Date()))

    result[3] = UInt8(Calendar.current.component(.day, from: Date()))

    result[4] = UInt8(Calendar.current.component(.hour, from: Date()))

    result[5] = UInt8(Calendar.current.component(.minute, from: Date()))

    result[6] = UInt8(Calendar.current.component(.second, from: Date()))

    result[7] = 0

    result[8] = 1
    result[8] = result[8] << 1

    return result;
  }

  internal static func TimeZoneToByteArr() -> [Int8] {
    var result = [Int8](repeating: 0, count: 2)

    let mOffset = Int(TimeZone.current.daylightSavingTimeOffset())
    let mSec = TimeZone.current.secondsFromGMT()
    let timezone = Int8((mSec - mOffset) / 60 / 15)

    result[0] = timezone
    result[1] = Int8(Int8(abs(mOffset) / 60 / 15))

    return result
  }

  internal class func uploadToCloud(pMap: [String: Any]) throws {
    var mVitalData = "{"
    var separator = ""
    for (kind, value) in pMap {
      mVitalData.append(separator)
      mVitalData.append(getSingleQuoteJSON(pKey: kind, pValue: value))
      separator = ","
    }
    mVitalData.append("}")

    var measurementTime = ""
    if let timeInInt = pMap["Time"] {
      measurementTime = "\(timeInInt)"
    }
    let request = WebServiceMethods.createUploadDataRequest(pData: mVitalData, measurementTime: measurementTime)
    EventEmittersToReact.uploadOnCloud(request)
  }
    
  internal class func uploadMealsOnCloud(size: Int, ts: Int64) throws {
    let request = try WebServiceMethods.createAddMealsRequest(size: size, ts: ts)
    EventEmittersToReact.uploadOnCloud(request)
  }
    
  internal class func uploadStepsOnCloud(steps: Int, ts: Int64) throws {
    let request = try WebServiceMethods.createAddStepsRequest(steps: steps, ts: ts)
    EventEmittersToReact.uploadOnCloud(request)
  }
  
  internal class func uploadRawDataOnCloud(pReturnJson: String, measurementTime: String) throws {
    let request = WebServiceMethods.createUploadRawDataRequest(pData: pReturnJson, measurementTime: measurementTime )
    EventEmittersToReact.uploadOnCloud(request)
  }

  private class func getSingleQuoteJSON(pKey: String, pValue: Any) -> String {
    var result = "'"
    result.append(pKey)
    result.append("':")
    let mValueType = type(of: pValue)
    let mValueTypeStr:String = "\(mValueType)".lowercased()
    switch mValueTypeStr {
    case "int","int64":
      result.append("\(pValue)")
    case "string":
      result.append("'\(pValue)'")
    case "dictionary":
      result.append("dictionary")
    default:
      break
    }
    
    return result
  }
    
  public class func parseToDate(timestamp: String) -> Date? {
    let dateFormatter = DateFormatter()
    dateFormatter.timeZone = TimeZone(abbreviation: "UTC")
    dateFormatter.locale = Locale(identifier: "en_US_POSIX")
    dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        
    return dateFormatter.date(from: timestamp)
  }
  
    public class func getGMTDateArr(date: Date = Date()) -> [UInt8] {
    var result = [UInt8](repeating: 0, count: 7)

    let formatter = DateFormatter()
    formatter.timeZone = TimeZone(identifier:"GMT")
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy"
    let mYear = Int(formatter.string(from: date))!
      
    result[0] = UInt8(mYear % 256)
    result[1] = UInt8(mYear / 256)

    formatter.dateFormat = "MM"
    result[2] = UInt8(formatter.string(from: date))!

    formatter.dateFormat = "dd"
    result[3] = UInt8(formatter.string(from: date))!

    formatter.dateFormat = "HH"
    let mHour = UInt8(formatter.string(from: date))!
    result[4] = mHour

    formatter.dateFormat = "mm"
    result[5] = UInt8(formatter.string(from: date))!

    formatter.dateFormat = "ss"
    result[6] = UInt8(formatter.string(from: date))!

    return result
  }

  class func convertBytes<T: Any>(bytes: [UInt8], into type: T.Type) -> T {
      if(T.self is AnyClass) {
          assertionFailure("convertion into specified type is not supported")
      }
      // checks the array count is in correct range of requested datatype if not raise execption.
      if (bytes.count < MemoryLayout<T>.size) {
          assertionFailure("Byte array is not sufficient to convert to \(T.self) \n {array.count \(bytes.count) < SizeOf(T) \(MemoryLayout<T>.size)}")
      }
    // direct try to load the type from bytes
    return bytes.withUnsafeBytes { $0.load(as: type.self) }
  }
    
    internal static func getUpdateStepGoalByteArray(stepGoal: Int) -> Data {
        var data = Data()
        data.append(0)
        var int = stepGoal
        let stepGoalData = Data(bytes: &int, count: MemoryLayout<UInt32>.size)
        data.append(stepGoalData)
        data.append(Data(repeating: 0, count: 5))
        return data
    }
}
