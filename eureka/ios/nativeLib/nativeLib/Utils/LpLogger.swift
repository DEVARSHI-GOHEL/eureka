//
//  LpLogger.swift
//  eureka
//
//  Created by work on 04/02/21.
//

import Foundation

public class LpLogger {
    private static var _logSrlNo: Int64 = 0
    internal static var logProvider: (LoggerStruct) -> Void = { logerStruct in
        EventEmittersToReact.debugLog(logerStruct)
    }
  
    internal static func getNewSrlNo() -> Int64 {
        _logSrlNo += 1
        return _logSrlNo
    }

    public static func logInfo(_ pLog:LoggerStruct) {
        if (Global.isDebugMode()) {
            logProvider(pLog)
        }
    }

    internal static func logError(_ pLog: LoggerStruct) {
        logProvider(pLog)
    }
}
