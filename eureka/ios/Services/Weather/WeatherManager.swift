//
//  WeatherManager.swift
//  eureka
//
//  Created by work on 02/06/21.
//

import Foundation
import CoreLocation
import nativeLib
import Firebase
import BackgroundTasks

public class WeatherManager: NSObject, CLLocationManagerDelegate, IService {
  @objc
  static let shared: WeatherManager = WeatherManager()
  
  private let backgroundTaskIdentifier = "com.lifeleaf.app.task.weather"
  private let locationManager = CLLocationManager()
  private var coordinate: CLLocationCoordinate2D?

  private override init() {
    super.init()
    
    locationManager.delegate = self
    locationManager.requestAlwaysAuthorization()
    locationManager.requestLocation()
  }
  
  public func startService() {
    locationManager.startMonitoringSignificantLocationChanges()
    
    updateWeather()
    scheduleNextUpdate()
  }
  
  public func stopService() {
    BGTaskScheduler.shared.cancel(taskRequestWithIdentifier: self.backgroundTaskIdentifier)
    
    locationManager.stopMonitoringSignificantLocationChanges()
  }
  
  // CLLocationManagerDelegate
  public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    if let mLocation = locations.last {
      self.coordinate = mLocation.coordinate
    }
  }
  
  public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    Crashlytics.crashlytics().record(error: error)
  }
  // CLLocationManagerDelegate
  
  @objc
  public func registerBackgroundFetch() {
    BGTaskScheduler.shared.register(
      forTaskWithIdentifier: self.backgroundTaskIdentifier,
      using: nil
    ) { task in
      self.updateWeather()
      task.setTaskCompleted(success: true)
      self.scheduleNextUpdate()
    }
  }
  
  private func updateWeather() {
    EventEmittersToReact.emitTimerTick()
    
    if let coord = self.coordinate {
      let wUnit = DbAccess.getWeatherUnitForUser(userId: Global.getUserId())
      HttpConnectionManager.openWheather(pLat: "\(coord.latitude)", pLng: "\(coord.longitude)", pUnit: wUnit.desc, onSuccess: { weatherData in
        WeatherManager.sendWeatherDataToWatch(coord: coord, weatherData: weatherData, weatherUnit: wUnit)
      })
    }
  }
  
  private func scheduleNextUpdate() {
    let request = BGAppRefreshTaskRequest(identifier: self.backgroundTaskIdentifier)
    request.earliestBeginDate = Date(timeIntervalSinceNow: 600)
    do {
      try BGTaskScheduler.shared.submit(request)
      LpLogger.logInfo( LoggerStruct("scheduleNextUpdate", pFileName: "WeatherManager", pEventDescription: "Weather update scheduled successfully"))
    } catch {
      LpLogger.logInfo( LoggerStruct("scheduleNextUpdate", pFileName: "WeatherManager", pEventDescription: "Couldn't schedule app refresh \(error.localizedDescription)"))
    }
  }
  
  private class func sendWeatherDataToWatch(coord: CLLocationCoordinate2D, weatherData: [String:Any], weatherUnit: WeatherUnitEnum) {
    let weatherStruct = convertData(weatherData)
    writeAddress(coord: coord, weatherStruct: weatherStruct, weatherUnit: weatherUnit)
  }
  
  private class func convertData(_ pWeatherData:[String:Any]) -> OpenWeatherStruct {
    let result = OpenWeatherStruct()
    if let mLat = pWeatherData["lat"] as! Double? {
      result.setLat(pLat: mLat)
    }
    if let mLon = pWeatherData["lon"] as! Double? {
      result.setLon(pLon: mLon)
    }
    if let mTimezone = pWeatherData["timezone"] as! String? {
      result.setTimezone(pTimezone: mTimezone)
    }
    if let mOffset = pWeatherData["timezone_offset"] as! Int64? {
      result.setOffset(pOffset: mOffset)
    }
    if let mCurrent = pWeatherData["current"] as! [String:Any]? {
      result.setCurrent(pCurrent: mCurrent)
      if let mDt = mCurrent["dt"] as! Int64? {
        result.setDt(pDt: mDt)
      }
    }
    if let mHourly = pWeatherData["hourly"] as! [[String:Any]]? {
      result.setHourly(pHourly: mHourly)
    }
    if let mDaily = pWeatherData["daily"] as! [[String:Any]]? {
      result.setDaily(pDaily: mDaily)
    }

    return result
  }
  
  private class func writeAddress(coord: CLLocationCoordinate2D, weatherStruct: OpenWeatherStruct, weatherUnit: WeatherUnitEnum) {
    let ceo = CLGeocoder()
    let loc = CLLocation(latitude: coord.latitude, longitude: coord.longitude)

    ceo.reverseGeocodeLocation(loc, completionHandler: { (placemarks, error) in
      if error != nil {
        Crashlytics.crashlytics().record(error: error!)
        return
      }
      
      if let pls = placemarks, pls.count > 0 {
        let pm = pls[0]
        
        let mFinalArray = createWeatherByteArray(
          pLocation: pm.locality ?? "Unknown",
          weatherStruct: weatherStruct,
          weatherUnit: weatherUnit
        )
        
        DispatchQueue.global().async {
          if let currentDevice = ServiceFactory.getDeviceService().currentDevice {
            if let peripheral = currentDevice.peripheral {
              _ = BleUtil.writeCustomdCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.WEATHER, pValue: mFinalArray)
            }
          }
        }
          
      } else {
        Crashlytics.crashlytics().record(error: NSError.init(
          domain: "WeatherService",
          code: -1001,
          userInfo: ["placemarks" : "\(String(describing: placemarks))"]
        ))
      }
            
    })
  }
  
  private class func createWeatherByteArray(pLocation:String, weatherStruct: OpenWeatherStruct, weatherUnit: WeatherUnitEnum) -> [UInt8] {
    var result = [UInt8](repeating: 0, count: 116)

    let mDate = Date()

    let formatter = DateFormatter()
    formatter.timeZone = TimeZone(identifier:"GMT")
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy"
    let mYear:Int = Int(formatter.string(from: mDate))!
      
    result[0] = UInt8(mYear % 256)
    result[1] = UInt8(mYear / 256)

    formatter.dateFormat = "MM"
    result[2] = UInt8(formatter.string(from: mDate))!

    formatter.dateFormat = "dd"
    result[3] = UInt8(formatter.string(from: mDate))!

    formatter.dateFormat = "HH"
    let mHour = UInt8(formatter.string(from: mDate))!
    result[4] = mHour

    formatter.dateFormat = "mm"
    result[5] = UInt8(formatter.string(from: mDate))!

    formatter.dateFormat = "ss"
    result[6] = UInt8(formatter.string(from: mDate))!

    var j:Int = 0
    for i in 7..<23 {
      if (i - 7) < pLocation.count {
        result[i] = UInt8(Array(pLocation.utf8)[i - 7])
      } else {
        break
      }
    }

    result[23] = UInt8(weatherUnit.code)

    if let mWindSpeedDouble = weatherStruct.getCurrent()["wind_speed"] as? Double {
      let windSpeed = UInt8(floor(mWindSpeedDouble))
      result[24] = windSpeed
    }

    if let mWindDeg = weatherStruct.getCurrent()["wind_deg"] as? Int64 {
      let windDeg = getWindDirectionEnum(degree: mWindDeg)
      result[25] = windDeg
    }

    if let mUVI = weatherStruct.getCurrent()["uvi"] as? Double {
      let multiplierUV = UInt8(floor(mUVI * 10))
      result[26] = multiplierUV
      let mUVRate = getUVRate(mUVI)
      result[27] = mUVRate
    }

    if let sunsetTs = weatherStruct.getCurrent()["sunrise"],
       let dateComponents = getHoursAndMinues(fromTimestamp: sunsetTs as! TimeInterval),
       let hr = dateComponents.hour,
       let min = dateComponents.minute {
      result[28] = UInt8(hr)       //    UTC_SunriseHours  1  UINT8  sunset time hour  (UTC)
      result[29] = UInt8(min)      //    UTC_SunriseMinutes  1  UINT8  sunset time minutes  (UTC)
    } else {
      result[28] = 0
      result[29] = 0
    }
    
    if let sunsetTs = weatherStruct.getCurrent()["sunset"],
       let dateComponents = getHoursAndMinues(fromTimestamp: sunsetTs as! TimeInterval),
       let hr = dateComponents.hour,
       let min = dateComponents.minute {
      result[30] = UInt8(hr)       //    UTC_SunsetHours  1  UINT8  sunset time hour  (UTC)
      result[31] = UInt8(min)      //    UTC_SunsetMinutes  1  UINT8  sunset time minutes  (UTC)
    } else {
      result[30] = 0
      result[31] = 0
    }
    
    // hourly data: Array of 11 items (idx = 0 -> now, idx 1-10 next hours from now sequentially)
    let hourlyData = weatherStruct.getHourly()
    let nextTenHourData = getNextTenHourData(mHour: mHour, hourlyData: hourlyData)
    j = 32
    for i in 0..<nextTenHourData.count {
//      var mHWeatherData:[String:Any] = [:]
      var mWeatherMap:[String:Any] = [:]
      if i == 0 {
        if let mTempData = weatherStruct.getCurrent()["weather"] as? [[String:Any]] {
          if mTempData.count > 0 {
//            mHWeatherData = mTempData[0]
            mWeatherMap = mTempData[0]
          }
        }
      } else {
        if let mTempData = nextTenHourData[i]["weather"] as? [[String:Any]] {
//          mHWeatherData = mTempData
          if (mTempData.count > 0) {
            mWeatherMap = mTempData[0]
          }
        }
      }
      var descriptionId:Int = 0
      if let mTempData = mWeatherMap["id"] as? Int {
        descriptionId = mTempData
      }
      let mWeatherId = getWeatherId(fromDescriptionId: descriptionId)
      result[j] = mWeatherId // weather id
      j += 1

      var mPrecipitation:UInt8 = 0
      var pop:Double = 0.0
      if let mPop = nextTenHourData[i]["pop"] as? Double {
        pop = mPop
      }
      mPrecipitation = UInt8(pop * 100)
      result[j] = mPrecipitation //precipitation
      j += 1

      // signed temperature
      var mTempDbl:Double = 0.0
      if i == 0 {
        if let mVal = weatherStruct.getCurrent()["temp"] as? Double {
          mTempDbl = mVal
        }
      } else {
        if let mVal = nextTenHourData[i]["temp"] as? Double {
          mTempDbl = mVal
        }
      }
      var mTempInt = Int64(mTempDbl)
      if mTempInt < 0 {
        mTempInt = 65536 - abs(mTempInt)
      }
      result[j] = UInt8(mTempInt % 256)
      j += 1
      result[j] = UInt8(mTempInt / 256)
      j += 1
    }

    // daily data: Array of 8 items (idx = 0 -> today, idx 1-7 next days from today sequentially)
    let mDailyData = weatherStruct.getDaily()
    j = 76
    for i in 0..<mDailyData.count {
      if let mTWeatherData = mDailyData[i]["weather"] as? [[String:Any]] {
        let mWeatherMap = mTWeatherData[0]
        if let mDescriptionId = mWeatherMap["id"] as? Int {
          let mWeatherId = getWeatherId(fromDescriptionId: mDescriptionId)
          result[j] = mWeatherId // weather id
        }
        j += 1

        if let mTempData = mDailyData[i]["temp"] as? [String:Any] {
          var mTempDbl:Double = 0.0
          if let mMinTemp = mTempData["min"] as? Double {
            mTempDbl = mMinTemp
          }
          var mTempInt:Int64 = Int64(mTempDbl)
          if mTempInt < 0 {
            mTempInt = 65536 - abs(mTempInt)
          }
          result[j] = UInt8(mTempInt % 256)
          j += 1
          result[j] = UInt8(mTempInt / 256)
          j += 1

          mTempDbl = 0.0
          if let mMinTemp = mTempData["max"] as? Double {
            mTempDbl = mMinTemp
          }
          mTempInt = Int64(mTempDbl)
          if mTempInt < 0 {
            mTempInt = 65536 - abs(mTempInt)
          }
          result[j] = UInt8(mTempInt % 256)
          j += 1
          result[j] = UInt8(mTempInt / 256)
          j += 1
        }
      }
    }

    return result
  }

  private class func getUVRate(_ uvIndex:Double) -> UInt8 {
      if uvIndex < 3 {
          return 1
      } else if uvIndex < 6 {
          return 2
      } else if uvIndex < 8 {
          return 3
      } else if uvIndex < 11 {
          return 4
      } else if uvIndex >= 11 {
          return  5
      }
      return 1
  }

  private class func getNextTenHourData(mHour:UInt8, hourlyData:[[String:Any]]) -> [[String:Any]] {
    var result:[[String:Any]] = []
    // We need total 11 items now + next10Days of data. 0th Index will going to replace while mapping.
    result = Array(hourlyData.prefix(11))
    return result
  }
  
  private class func getWeatherId(fromDescriptionId id: Int) -> UInt8 {
    var result:UInt8 = 0
    switch id {
    case 804 : result = 1
    case 803 : result = 2
    case 802 : result = 3
    case 301 : result = 4
    case 302 : result = 4
    case 311 : result = 4
    case 312 : result = 4
    case 313 : result = 4
    case 314 : result = 4
    case 321 : result = 4
    case 520 : result = 4
    case 521 : result = 4
    case 522 : result = 4
    case 531 : result = 4
    case 300 : result = 5
    case 310 : result = 5
    case 500 : result = 7
    case 501 : result = 8
    case 502 : result = 9
    case 503 : result = 9
    case 504 : result = 9
    case 801 : result = 10
    case 761 : result = 13
    case 751 : result = 13
    case 762 : result = 13
    case 771 : result = 13
    case 781 : result = 17
    case 701 : result = 18
    case 741 : result = 19
    case 721 : result = 20
    case 615 : result = 22
    case 616 : result = 22
    case 620 : result = 22
    case 621 : result = 22
    case 622 : result = 22
    case 611 : result = 23
    case 612 : result = 23
    case 613 : result = 23
    case 200 : result = 27
    case 230 : result = 27
    case 711 : result = 28
    case 601 : result = 30
    case 602 : result = 30
    case 600 : result = 33
    case 511 : result = 34
    case 800 : result = 35
    case 731 : result = 36
    case 201 : result = 37
    case 202 : result = 37
    case 211 : result = 37
    case 212 : result = 37
    case 231 : result = 37
    case 232 : result = 37
    case 210 : result = 41
    case 221 : result = 41
    default: result = 0
    }
    return result;
  }
  
  private class func getWindDirectionEnum(degree:Int64) -> UInt8 {
    var result:UInt8 = 1
    if (degree <= 22) || (degree >= 337) {
      result = 1
    } else if degree <= 67 {
      result = 2
    } else if degree <= 112 {
      result = 3
    } else if degree <= 157 {
      result = 4
    } else if degree <= 202 {
      result = 5
    } else if degree <= 247 {
      result = 6
    } else if degree <= 292 {
      result = 7
    } else if degree <= 337 {
      result = 8
    }
    return result
  }
  
  private class func getHoursAndMinues(fromTimestamp ts: TimeInterval)-> DateComponents? {
    var calender = Calendar.current
    calender.timeZone = TimeZone.init(abbreviation: "UTC") ?? calender.timeZone
    return calender.dateComponents([.hour, .minute], from: Date(timeIntervalSince1970: ts))
  }
}
