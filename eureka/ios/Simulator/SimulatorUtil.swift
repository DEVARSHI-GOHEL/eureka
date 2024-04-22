//
//  SimulatorUtil.swift
//  LifePlus
//
//  Created by work on 01/10/20.
//

import Foundation
import nativeLib

class SimulatorUtil {
  public class func getMeasuresData() -> String {
    var mMap: [String: Int] = [:]
    do {
      if (Services.getService(pUUID: "4C505732-5F43-5553-544F-4D5F53525600").getName() == "UNKNOWN" ) {
        Services.createServices()
      }
      let mAService: AService = Services.getService(pUUID: "4C505732-5F43-5553-544F-4D5F53525600")
      if (mAService.getName() != "UNKNOWN" ) {
        let mCharacteristics: ACharacteristic = mAService.getCharacteristic(pUUID: "4C505732-5F43-535F-5644-5F5245430000")
        if (mCharacteristics.getName() != "UNKNOWN") {
          for i in (0..<mCharacteristics.getMembers().count) {
            if ("UTC_Year".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              if let yearInt = Calendar.current.dateComponents([.year], from: Date()).year {
                mMap[mCharacteristics.getMembers()[i].name] = yearInt
              }
            } else if ("UTC_Month".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              if let monthInt = Calendar.current.dateComponents([.month], from: Date()).month {
                mMap[mCharacteristics.getMembers()[i].name] = monthInt
              }
            } else if ("UTC_Day".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              if let dayInt = Calendar.current.dateComponents([.day], from: Date()).day {
                mMap[mCharacteristics.getMembers()[i].name] = dayInt
              }
            } else if ("UTC_Hour".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              if let hourInt = Calendar.current.dateComponents([.hour], from: Date()).hour {
                mMap[mCharacteristics.getMembers()[i].name] = hourInt
              }
            } else if ("UTC_Minutes".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              if let minuteInt = Calendar.current.dateComponents([.minute], from: Date()).minute {
                mMap[mCharacteristics.getMembers()[i].name] = minuteInt
              }
            } else if ("UTC_Seconds".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              if let secondInt = Calendar.current.dateComponents([.second], from: Date()).second {
                mMap[mCharacteristics.getMembers()[i].name] = secondInt
              }
            } else if ("OpStatus".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              mMap[mCharacteristics.getMembers()[i].name] = 0
            } else if ("HeartRate".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              let randomNumber = Int.random(in: 60..<100)
              mMap[mCharacteristics.getMembers()[i].name] = randomNumber
            } else if ("RespirationRate".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              let randomNumber = Int.random(in: 12..<17)
              mMap[mCharacteristics.getMembers()[i].name] = randomNumber
            } else if ("OxygenSaturation".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              let randomNumber = Int.random(in: 80..<100)
              mMap[mCharacteristics.getMembers()[i].name] = randomNumber
            } else if ("BloodGlucose".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              let randomNumber = Int.random(in: 60..<450)
              mMap[mCharacteristics.getMembers()[i].name] = randomNumber
            } else if ("BloodPressureSYS".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              let randomNumber = Int.random(in: 60..<100)
              mMap[mCharacteristics.getMembers()[i].name] = randomNumber
            } else if ("BloodPressureDIA".compare(mCharacteristics.getMembers()[i].name, options: NSString.CompareOptions.caseInsensitive, range: nil, locale: nil) == .orderedSame) {
              let randomNumber = Int.random(in: 100..<180)
              mMap[mCharacteristics.getMembers()[i].name] = randomNumber
            } else {
              let randomNumber = Int.random(in: 50..<100)
              mMap[mCharacteristics.getMembers()[i].name] = randomNumber
            }
          }
          try DbAccess.addIntoMeasurable(pValues: mMap, pTime: Utils.currentMillis())
        }
      }
    } catch {
      print(error.localizedDescription)
    }
    var result: String = "{}"
    let jsonData = try? JSONSerialization.data(withJSONObject: mMap, options: [])
    if let mJson = String(data: jsonData!, encoding: .utf8) {
      result = mJson
    }
    return result
  }
}

