
import Foundation
import nativeLib

public class NotificationUtil {
  class func createNotificationByteArray(appName: String, title: String, content: String, date: Date) -> [UInt8] {
    print("Creating notification array: \(appName), \(title), \(content)")
    var result = [UInt8](repeating: 0, count: 103)
    
    let mDate = LpUtility.getGMTDateArr(date: date)
    var j = 0
    
    for mDateByte in mDate {
      result[j] = mDateByte
      j += 1
    }
    
    let mAppName = appName.utf8CString.filter { $0 >= 0 }
    for i in 7..<33 {
      if((i - 7) < (mAppName.count)) {
        result[i] = UInt8(mAppName[i - 7])
      } else {
        break
      }
    }
    
    // last two bytes of title (idx 50 and 51) has to be 0, otherwise watch does not handle the inputs properly
    let mTitle = title.utf8CString.filter { $0 >= 0 }
    for i in 33..<50 {
      if ((i - 33) < mTitle.count) {
        result[i] = UInt8(mTitle[i - 33])
      } else {
        break
      }
    }
    
    let mContent = content.utf8CString.filter { $0 >= 0 }
    for i in 52..<103 {
      if((i - 52) < mContent.count) {
        result[i] = UInt8(mContent[i - 52])
      } else {
        break
      }
    }
    
    return result
  }

  class func writeNotificationsCharactristics(_ pValue:[UInt8]) {
    if let currentDevice = ServiceFactory.getDeviceService().currentDevice {
      if let peripheral = currentDevice.peripheral {
        DispatchQueue.global().async {
          _ = BleUtil.writeCustomdCharacteristic(pPeripheral: peripheral, pWhichCharct: GattCharEnum.NOTIFICATION, pValue: pValue)
        }
      }
    }
  }
}
