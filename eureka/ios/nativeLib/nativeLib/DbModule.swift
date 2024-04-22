//
//  DbModule.swift
//  nativeLib
//
//  Created by Eugene Krivenja on 23.10.2021.
//

import Foundation

public class DbModule {
    public init() {}
    
    public func dbTunnel(_ pRequest: String) -> String {
        var mResultSet: [String: Any] = [:]
        var mQueries: [DbQuery] = []
        if let mRequestData = pRequest.data(using: .utf8) {
          do {
            if let mRequestMap = try JSONSerialization.jsonObject(with: mRequestData, options: []) as? [String: String] {
              var mRequestQueryType: DbQueryType = DbQueryType.Unknown
              if let mErrorIdToThrow: String  = mRequestMap["errorIdToThrow"] {
                var mErrorSet: [String: Any] = [:]
                mErrorSet["rowcount"] = "0"
                if let mErrorMsgToThrow: String  = mRequestMap["errorMsgToThrow"] {
                  mErrorSet["message"] = "\(mErrorIdToThrow): \(mErrorMsgToThrow)"
                } else {
                  mErrorSet["message"] = "\(mErrorIdToThrow): Unknown Error"
                }
                mErrorSet["rows"] = [String]()
                mErrorSet["status"] = "failed"
                mResultSet["result"] = mErrorSet
                
                var mResultSetFinal: [String: Any] = [:]
                mResultSetFinal["databaseTunnel"] = mResultSet
                return getStringFromMap(mResultSetFinal: mResultSetFinal)
              }
              if let mRequestTypeStr: String  = mRequestMap["queryType"] {
                switch mRequestTypeStr.lowercased() {
                case "select":
                  mRequestQueryType = .Select
                case "insert":
                  mRequestQueryType = .Insert
                case "update":
                  mRequestQueryType = .Update
                case "delete":
                  mRequestQueryType = .Delete
                default:
                  break
                }
                if let mRequestQryStr: String  = mRequestMap["query"] {
                  mQueries.append(DbQuery(pQueryType: mRequestQueryType, pName: mRequestTypeStr, pQuery: mRequestQryStr))
                }
              }
              if (mQueries.count > 0) {
                let mResults = DbAccess.executeQueries(pQueries: mQueries)
                if (mResults.count > 0) {
                  mResultSet["result"] = mResults[0]["result"]
                }
              } else {
                var mErrorSet: [String: Any] = [:]
                mErrorSet["rowcount"] = "0"
                mErrorSet["message"] = "Unable to get queryType or query"
                mErrorSet["rows"] = [String]()
                mErrorSet["status"] = "failed"
                mResultSet["result"] = mErrorSet
              }
            }
          } catch {
            var mErrorSet: [String: Any] = [:]
            mErrorSet["rowcount"] = "0"
            mErrorSet["message"] = "\(error.localizedDescription)"
            mErrorSet["rows"] = [String]()
            mErrorSet["status"] = "failed"
            mResultSet["result"] = mErrorSet
          }
        }
        
        var mResultSetFinal: [String: Any] = [:]
        if let mResult = mResultSet["result"] {
          mResultSetFinal["databaseTunnel"] = mResult
        } else {
          mResultSetFinal["databaseTunnel"] = mResultSet
        }
        return getStringFromMap(mResultSetFinal: mResultSetFinal)
    }
    
    public func dbTunnelForMultipleQueries(_ pRequest: String) -> String {
        var mQueryResults: [String: Any] = [:]
        var mQueries: [DbQuery] = []
        var mTempResults: [[String: Any]] = []

        if let mRequestData = pRequest.data(using: .utf8) {
          do {
            if let mRequestMap = try JSONSerialization.jsonObject(with: mRequestData, options: []) as? [String: Any] {
              if let mErrorIdToThrow = mRequestMap["errorIdToThrow"] as? String {
                mQueryResults["results"] = []
                if let mErrorMsgToThrow  = mRequestMap["errorMsgToThrow"] as? String {
                  mQueryResults["message"] = "\(mErrorIdToThrow): \(mErrorMsgToThrow)"
                } else {
                  mQueryResults["message"] = "\(mErrorIdToThrow): Unknown Error"
                }
                mQueryResults["status"] = "failed"

                if let jsonData = try? JSONSerialization.data(withJSONObject: mQueryResults, options: []),
                  let mJson = String(data: jsonData, encoding: .utf8) {
                  return mJson
                }

                return "{}"
              }
              if let mRequestQueries = mRequestMap["Queries"] as? [[String: String]] {
                for aQuery: [String: String] in mRequestQueries {
                  if let mRequestTypeStr: String  = aQuery["queryType"] {
                    do {
                      var mRequestQueryType: DbQueryType = DbQueryType.Unknown
                      switch mRequestTypeStr.lowercased() {
                      case "select":
                        mRequestQueryType = .Select
                      case "insert":
                        mRequestQueryType = .Insert
                      case "update":
                        mRequestQueryType = .Update
                      case "delete":
                        mRequestQueryType = .Delete
                      default:
                        break
                      }
                      if let mRequestQryStr: String  = aQuery["query"] {
                        if let mRequestQryName: String  = aQuery["queryName"] {
                          mQueries.append(DbQuery(pQueryType: mRequestQueryType, pName: mRequestQryName, pQuery: mRequestQryStr))
                        }
                      }
                    }
                  }
                  mTempResults = DbAccess.executeQueries(pQueries: mQueries)
                }
              }
            }
          } catch {
            mQueryResults["results"] = []
            mQueryResults["message"] = "Invalid input JSON"
            mQueryResults["status"] = "failed"
          }
        }
        
        var result: String = "{}"
        do {
          mQueryResults["results"] = mTempResults
          let jsonData = try JSONSerialization.data(withJSONObject: mQueryResults, options: [])
          if let mJson = String(data: jsonData, encoding: .utf8) {
            result = mJson
          }
        } catch {
          mQueryResults["results"] = []
          mQueryResults["message"] = "Unable to create result JSON"
          mQueryResults["status"] = "failed"
          if let jsonData = try? JSONSerialization.data(withJSONObject: mQueryResults, options: []),
            let mJson = String(data: jsonData, encoding: .utf8) {
              result = mJson
          }
        }
        return result
    }
    
    private func getStringFromMap(mResultSetFinal: [String: Any]) -> String {
      if #available(iOS 13.0, *) {
        if let jsonData = try? JSONSerialization.data(withJSONObject: mResultSetFinal, options: [JSONSerialization.WritingOptions.withoutEscapingSlashes]),
          let mJson = String(data: jsonData, encoding: .utf8) {
            return mJson
        }
      } else {
        if let jsonData = try? JSONSerialization.data(withJSONObject: mResultSetFinal, options: []),
          let mJson = String(data: jsonData, encoding: .utf8) {
            return mJson
        }
      }
      return "{}"
    }
}
