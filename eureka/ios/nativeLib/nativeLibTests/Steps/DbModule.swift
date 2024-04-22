//
//  DbModule.swift
//  nativeLibTests
//
//  Created by Eugene Krivenja on 25.10.2021.
//

import XCTest

func setupDbSteps() {
    
    When("app executes following SQL query: '(.+)'") { matches, _ in
        var queryType = "select"
        if matches[1].lowercased().starts(with: "insert") {
            queryType = "insert"
        } else if matches[1].lowercased().starts(with: "update") {
            queryType = "update"
        } else if matches[1].lowercased().starts(with: "delete") {
            queryType = "delete"
        }
        let request = "{\"queryType\": \"\(queryType)\", \"query\": \"\(matches[1])\"}"
        lastResponse = dbModule.dbTunnel(request)
    }
    
    When("app prepares following SQL query: '(.+)'") { matches, _ in
        let queryType = matches[1].split(separator: " ").first!.lowercased()
        let queryRequest = "{\"queryName\": \"\(queryType) query\", \"queryType\": \"\(queryType)\", \"query\": \"\(matches[1])\"}"
        queries.append(queryRequest)
    }
    
    When("app executes prepared queries") { _, _ in
        let qs = queries.joined(separator: ",")
        let request = "{\"Queries\":[\(qs)]}"
        lastResponse = dbModule.dbTunnelForMultipleQueries(request)
        queries.removeAll()
    }
    
    Then("app shall receive non-empty response") { _, step in
        XCTAssertNotNil(lastResponse)
        let jsonResponse = lastResponse!.parsedJson()
        XCTAssertNotNil(jsonResponse)
        
        var result: [String : Any] = [:]
        if let results = jsonResponse["results"] as? [[String : Any]] {
            result = results.first { r in
                r["queryName"] as? String == "select query"
            }!["result"] as! [String : Any]
        } else {
            result = jsonResponse["databaseTunnel"] as! [String : Any]
        }
        
        XCTAssertFalse(result["rowcount"] as? String == "0")
        if let table = step.dataTable {
            XCTAssertTrue(result["rowcount"] as? String == "\(table.rows.count - 1)", "Expected \(table.rows.count - 1), but found \(result["rowcount"]!)")
            let dataRows = result["rows"] as! [[String : Any]]
            let headers = table.rows[0]
            (1..<table.rows.count).forEach { index in
                let row = table.rows[index]
                let dataRow = dataRows[index - 1]
                for (i, header) in headers.enumerated() {
                    XCTAssertTrue(dataRow[header] as? String == row[i], "Expected \(row[i]), but found \(dataRow[header]!)")
                }
            }
        }
    }
    
    Then("app shall receive empty response") { _, _ in
        XCTAssertNotNil(lastResponse)
        XCTAssertTrue(lastResponse!.contains("\"rowcount\":\"0\""))
    }
    
    Then("app shall receive error response") { _, _ in
        XCTAssertNotNil(lastResponse)
        XCTAssertTrue(lastResponse!.contains("\"rowcount\":\"0\""))
        XCTAssertTrue(lastResponse!.contains("\"status\":\"failed\""))
    }
    
    Then("app shall receive unsuccessful measurement type") { _, _ in
        XCTAssertNotNil(lastResponse)
        let jsonResponse = lastResponse!.parsedJson()
        XCTAssertNotNil(jsonResponse)
        
        var result: [String : Any] = [:]
        if let results = jsonResponse["results"] as? [[String : Any]] {
            result = results.first { r in
                r["queryName"] as? String == "select query"
            }!["result"] as! [String : Any]
        } else {
            result = jsonResponse["databaseTunnel"] as! [String : Any]
        }
        
        XCTAssertTrue(result["rowcount"] as? String == "1")
        let dataRows = result["rows"] as! [[String : Any]]
        let dataRow = dataRows[0]
        XCTAssertTrue(dataRow["type"] as? String == "U")
    }
    
}
