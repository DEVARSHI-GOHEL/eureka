//
//  TestUtils.swift
//  nativeLibTests
//
//  Created by Eugene Krivenja on 13.10.2021.
//

import Foundation
import XCTest
import CoreBluetoothMock
import nativeLib

func wait(for exp: @escaping () -> Bool, with timeout: TimeInterval) -> Bool {
    let expectation = XCTNSPredicateExpectation(
        predicate: NSPredicate { _,_ in
            exp()
        }, object: nil
    )
    let result = XCTWaiter().wait(for: [expectation], timeout: timeout)
    return result == .completed
}

func wait(_ interval: TimeInterval) {
    let _ = wait(for: {
        false
    }, with: interval)
}

func createCalibrationRequest(_ invalidParam: String = "valid", spo2: String = "93", rr: String = "16", hr: String = "70", sbp: String = "140", dbp: String = "80", glucose: String = "75") -> String {
    if invalidParam == "error id to throw" {
        return "{\"errorIdToThrow\":\"0\"}"
    } else {
        let userId = invalidParam == "userId" ? "" : "123"
        let deviceMsn = invalidParam == "deviceMsn" ? "" : "SEQ001"
        let SPO2 = invalidParam == "SPO2" ? "aa" : spo2
        let RR = invalidParam == "RR" ? "bb" : rr
        let HR = invalidParam == "HR" ? "cc" : hr
        let SBP = invalidParam == "SBP" ? "dd" : sbp
        let DBP = invalidParam == "DBP" ? "ee" : dbp
        let Glucose = invalidParam == "Glucose" ? "ff" : (invalidParam == "validDecimalGlucose" ? "5.5" : glucose)
        return "{\"userId\": \"\(userId)\", \"deviceMsn\": \"\(deviceMsn)\", \"SPO2\": \"\(SPO2)\", \"RR\": \"\(RR)\", \"HR\": \"\(HR)\", \"SBP\": \"\(SBP)\", \"DBP\": \"\(DBP)\", \"cgmModeOn\": \"N\", \"Glucose\": \"\(Glucose)\"}"
    }
}

func createAppSyncRequest(_ invalidParam: String) -> String {
    if invalidParam == "error id to throw" {
        return "{\"errorIdToThrow\":\"0\"}"
    } else {
        let userId = invalidParam == "userId" ? "" : "\(Global.getUserId())"
        let deviceMsn = invalidParam == "deviceMsn" ? "" : "SEQ001"
        
        return "{\"userId\": \"\(userId)\", \"deviceMsn\": \"\(deviceMsn)\", \"autoMeasure\": \"Y\"}"
    }
}

extension String {
    func parsedJson() -> [String : Any] {
        var result: [String : Any] = [:]
        if let data = self.data(using: .utf8) {
            if let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                result = json
            }
        }
        return result
    }
}
