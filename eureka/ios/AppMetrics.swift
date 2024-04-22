//
//  AppMetrics.swift
//  eureka
//
//  Created by Eugene Krivenja on 20.12.2021.
//

import MetricKit
import Firebase

@available(iOS 14.0, *)
@objc
class AppMetrics: NSObject, MXMetricManagerSubscriber {
    @objc
    func receiveReports() {
       let shared = MXMetricManager.shared
       shared.add(self)
    }

    func pauseReports() {
       let shared = MXMetricManager.shared
       shared.remove(self)
    }

    // Receive daily metrics.
    func didReceive(_ payloads: [MXMetricPayload]) {
      payloads.forEach { payload in
        if let metric = payload.applicationExitMetrics {
          Crashlytics.crashlytics().record(
            error: NSError(
              domain: "Daily background exit metrics",
              code: -1001,
              userInfo: [
                "cumulativeAbnormalExitCount" : metric.backgroundExitData.cumulativeAbnormalExitCount,
                "cumulativeNormalAppExitCount" : metric.backgroundExitData.cumulativeNormalAppExitCount,
                "cumulativeBadAccessExitCount" : metric.backgroundExitData.cumulativeBadAccessExitCount,
                "cumulativeAppWatchdogExitCount" : metric.backgroundExitData.cumulativeAppWatchdogExitCount,
                "cumulativeMemoryPressureExitCount" : metric.backgroundExitData.cumulativeMemoryPressureExitCount,
                "cumulativeIllegalInstructionExitCount" : metric.backgroundExitData.cumulativeIllegalInstructionExitCount,
                "cumulativeCPUResourceLimitExitCount" : metric.backgroundExitData.cumulativeCPUResourceLimitExitCount,
                "cumulativeMemoryResourceLimitExitCount" : metric.backgroundExitData.cumulativeMemoryResourceLimitExitCount,
                "cumulativeSuspendedWithLockedFileExitCount" : metric.backgroundExitData.cumulativeSuspendedWithLockedFileExitCount,
                "cumulativeBackgroundTaskAssertionTimeoutExitCount" : metric.backgroundExitData.cumulativeBackgroundTaskAssertionTimeoutExitCount
              ]
            )
          )
        }
      }
    }

    // Receive diagnostics immediately when available.
    func didReceive(_ payloads: [MXDiagnosticPayload]) {
      payloads.forEach { payload in
        Crashlytics.crashlytics().record(
          error: NSError(
            domain: "Diagnostics",
            code: -1001,
            userInfo: [
              "cpuExceptionDiagnostics" : payload.cpuExceptionDiagnostics?.count ?? 0,
              "diskWriteExceptionDiagnostics" : payload.diskWriteExceptionDiagnostics?.count ?? 0,
              "hangDiagnostics" : payload.hangDiagnostics?.count ?? 0,
              "crashDiagnostics" : payload.crashDiagnostics?.count ?? 0
            ]
          )
        )
      }
    }
}
