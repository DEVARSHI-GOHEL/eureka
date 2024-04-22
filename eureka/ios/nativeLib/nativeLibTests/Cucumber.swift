//
//  Cucumber.swift
//  
//
//  Created by Peter Ertl on 24/08/2021.
//

import Foundation
import XCTest
import CucumberSwift

extension Cucumber: StepImplementation {

  public var bundle: Bundle {
    class ThisBundle {}
    return Bundle(for: ThisBundle.self)
  }
    
  public func shouldRunWith(scenario: Scenario?, tags: [String]) -> Bool {
    if tags.contains("skip") {
      return false
    }
    if let tag = getenv("CUCUMBER_TAG").map({ String(cString: $0) }), !tag.isEmpty, !tags.contains(tag) {
      return false
    }
    #if targetEnvironment(simulator)
    if tags.contains("device") {
      return false
    }
    #endif
    return true
  }
    
  public func setupSteps() {
    setup()
  }
    
}

typealias StepHandler = ([String], Step) -> Void

func Given(_ regex: String, _ callback: @escaping StepHandler) {
    let handler = withLogging(callback)
    CucumberSwift.Given(regex, callback: handler)
    And(regex, callback: handler)
    But(regex, callback: handler)
}

func When(_ regex: String, _ callback: @escaping StepHandler) {
    let handler = withLogging(callback)
    CucumberSwift.When(regex, callback: handler)
    And(regex, callback: handler)
    But(regex, callback: handler)
}

func Then(_ regex: String, _ callback: @escaping StepHandler) {
    let handler = withLogging(callback)
    CucumberSwift.Then(regex, callback: handler)
    And(regex, callback: handler)
    But(regex, callback: handler)
}

func withLogging(_ callback: @escaping StepHandler) -> StepHandler {
    return { matches, step in
        let prefix = "# "
        print("\(prefix)\(step.keyword.toString()) \(step.match)")
        if let table = step.dataTable {
            let width = table.rows.flatMap { $0.map { $0.count } }.max() ?? 0
            for row in table.rows {
                let text = row.map {
                    $0.padding(toLength: width, withPad: " ", startingAt: 0)
                }.joined(separator: " | ")
                print("\(prefix)| \(text) |")
            }
        }
        callback(matches, step)
    }
}
