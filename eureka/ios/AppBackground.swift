//
//  AppBackground.swift
//  eureka
//
//  Created by Eugene Krivenja on 20.12.2021.
//

@objc
class AppBackground: NSObject {
  @objc
  public class func beginTask() {
    var taskId = UIBackgroundTaskIdentifier.invalid
    taskId = UIApplication.shared.beginBackgroundTask(withName: "Eureka") {
      print("Task expiration handler.")
      UIApplication.shared.endBackgroundTask(taskId)
    }
  }
}
