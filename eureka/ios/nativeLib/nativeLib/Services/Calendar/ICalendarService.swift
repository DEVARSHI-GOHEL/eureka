//
//  ICalendarService.swift
//  nativeLib
//
//  Created by Eugene Krivenja on 01.10.2021.
//

import Foundation

public protocol ICalendarService {
    func registerEventChangeNotifications()
    func deRegisterEventChangeNotifications()
}
