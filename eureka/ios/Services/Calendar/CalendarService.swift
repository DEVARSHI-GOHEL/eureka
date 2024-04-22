//
//  CalendarService.swift
//  eureka
//
//  Created by Harshada Memane on 12/04/21.
//

import Foundation
import EventKit
import nativeLib

class CalendarService: ICalendarService {
  
  static let shared: CalendarService = CalendarService()
  private var watchNotificationTimer: Timer!
  private init() {}
  var eventStore : EKEventStore = EKEventStore()

  func makeRequestForAccess(permissionCompletion: @escaping ((_ permissionGranted: Bool) -> Void)) {
    if #available(iOS 17.0, *) {
      eventStore.requestFullAccessToEvents(completion: { granted, error in
        self.handlePermissionRequestResult(granted: granted, error: error, permissionCompletion: permissionCompletion)
      })
    } else {
      eventStore.requestAccess(to: EKEntityType.event, completion: { granted, error in
        self.handlePermissionRequestResult(granted: granted, error: error, permissionCompletion: permissionCompletion)
      })
    }
  }
  
  func handlePermissionRequestResult(
    granted: Bool,
    error: Error!,
    permissionCompletion: @escaping ((_ permissionGranted: Bool) -> Void)
  ) {
    if let error {
      ConsoleLogger.shared.log(value: error)
      permissionCompletion(false)
    } else if granted {
      ConsoleLogger.shared.log(value: "Access granted")
      permissionCompletion(true)
    } else {
      ConsoleLogger.shared.log(value: "Access denied")
      permissionCompletion(false)
    }
  }
  
  func registerEventChangeNotifications() {
    makeRequestForAccess(permissionCompletion: { permissionGranted in
      if permissionGranted {
        let authorizationStatus = EKEventStore.authorizationStatus(for: EKEntityType.event)
        if EKEventStore.authorizationStatus(for: EKEntityType.event) == EKAuthorizationStatus.authorized {
          NotificationCenter.default.addObserver(self, selector: #selector(self.eventStoreChanged(notification:)), name: Notification.Name.EKEventStoreChanged, object: nil)
          self.fetchEvents()
        }
      } else {
        ConsoleLogger.shared.log(value: "Calendar permission not granted")
      }
    })
  }
  
  func deRegisterEventChangeNotifications() {
    NotificationCenter.default.removeObserver(self, name: NSNotification.Name.EKEventStoreChanged, object: nil)
  }
  
  @objc
  func eventStoreChanged(notification: Notification) {
    ConsoleLogger.shared.log(value: notification.userInfo)
    fetchEvents()
  }
  
  func fetchEvents() {
    if EKEventStore.authorizationStatus(for: EKEntityType.event) == EKAuthorizationStatus.authorized {
      let startDate = Date()
      let endDate = Date().addingTimeInterval(60*60*24*28) // fetch events for 4 weeks ahead
      let predicate = eventStore.predicateForEvents(withStart: startDate, end: endDate, calendars: nil)

      ConsoleLogger.shared.log(value: "startDate:\(startDate) endDate:\(endDate)")
      let events = eventStore.events(matching: predicate)
      var alertsDictionary: [Date : (EKAlarm, EKEvent)] = [:]
      
      for event in events {
        ConsoleLogger.shared.log(value: event)
        if let alarms = event.alarms {
          for alarm in alarms {
            let alarmDate = event.startDate.addingTimeInterval(alarm.relativeOffset)
            alertsDictionary[alarmDate] = (alarm, event)
          }
        }
      }
      if !alertsDictionary.isEmpty {
        let sortedDictionary = alertsDictionary.sorted { $0.key < $1.key }
        let alarmEventTuple = sortedDictionary.first
        if let alarmEventTuple {
          let myEvent = alarmEventTuple.value.1
          print("Event with nearest alarm date:")
          print("title: \(myEvent.title ?? "-")")
          print("location: \(myEvent.location ?? "-")")
          print("start date: \(myEvent.startDate.description)")
          print("notes: \(myEvent.notes ?? "-")")
          print("alert date: \(alarmEventTuple.key)")
          
          scheduleWatchNotification(alertDate: alarmEventTuple.key, event: myEvent)
        }
      }
    } else {
      makeRequestForAccess(permissionCompletion: { permissionGranted in
        self.fetchEvents()
      })
    }
  }
  
  func scheduleWatchNotification(alertDate: Date, event: EKEvent) {
    let timeOffset = alertDate.timeIntervalSinceNow
    if timeOffset > 0 {
      
      if watchNotificationTimer != nil {
        watchNotificationTimer?.invalidate()
      }
      DispatchQueue.main.async {
        self.watchNotificationTimer = Timer.scheduledTimer(withTimeInterval: timeOffset, repeats: false) { _ in
          self.sendCalendarNotificationToWatch(eventName: event.title, location: event.location ?? "", notes: event.notes ?? "", dateOfEvent: event.startDate)
        }
      }
    } else {
      ConsoleLogger.shared.log(value: "Cannot schedule calendar notification in the past.")
    }
  }
  
  private func sendCalendarNotificationToWatch(eventName: String, location: String, notes: String, dateOfEvent: Date) {
    let deviceService = ServiceFactory.getDeviceService()
    guard let peripheral = deviceService.currentDevice?.peripheral else {
      return
    }
    if (DeviceService.currentProc == BleProcEnum.NONE) {
      let mFinalArray = NotificationUtil.createNotificationByteArray(appName: eventName, title: location, content: notes, date: dateOfEvent)
      NotificationUtil.writeNotificationsCharactristics(mFinalArray)
    } else {
      DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
        self.sendCalendarNotificationToWatch(eventName: eventName, location: location, notes: notes, dateOfEvent: dateOfEvent)
      }
    }
  }
}
