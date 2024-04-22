//
//  DatabaseHelper.swift
//  LifePlus
//
//  Created by work on 11/09/20.
//

import Foundation
import GRDB

public class DatabaseHelper {

    class func createTable(pTableName: String, pTableDefination: String) throws {
        try DbAccess.queue.inDatabase { db in
          try db.execute(sql: "CREATE TABLE IF NOT EXISTS \(pTableName) ( \(pTableDefination) )")
        }
    }
    
    class func dropTable(pTableName: String) throws {
        let mQueryStr = "DROP TABLE IF EXISTS \(pTableName)"
        try DbAccess.queue.inDatabase { db in
          try db.execute(sql: mQueryStr)
        }
    }
    
    class func truncateTable(pTableName: String) throws {
        let mQueryStr = "DELETE FROM \(pTableName)"
        try DbAccess.queue.inDatabase { db in
            let mDelStatement = try db.makeStatement(sql: mQueryStr)
            try mDelStatement.execute()
        }
    }
    
    private class func insertIntoTable(pTableName: String, pValues:[String: DatabaseValueConvertible]) throws{
        if (pValues.count <= 0) {
            return
        }
        var mColumnString : String = "("
        var mParametersString : String = "("
        var mArguments : [String : DatabaseValueConvertible?] = [:]

        var mSeparator = ""
        for (key,value) in pValues {
            mColumnString = "\(mColumnString) \(mSeparator) \(key)"
            mParametersString = "\(mParametersString)\(mSeparator) :\(key)"
            mSeparator = ","
            mArguments[key] = value
        }
        mColumnString = mColumnString + ")"
        mParametersString = mParametersString + ")"
    
        try DbAccess.queue.inDatabase { db in
            let mQueryStr : String = "INSERT INTO \(pTableName) \(mColumnString) VALUES \(mParametersString)"
            let mInsertStatement = try db.makeStatement(sql: mQueryStr)
            mInsertStatement.arguments = StatementArguments(mArguments)
            try mInsertStatement.execute()
        }
    }
    
    class func updateTable(pTableName: String, pCondition : String, pValues:[DatabaseValueConvertible]) throws {
        var mUpdateString : String = ""
        if (pValues.count > 0) {
            var mSeparator = ""
            for mValue in pValues{
                mUpdateString = "\(mUpdateString) \(mSeparator) \(mValue) "
                mSeparator = ","
            }
        }
        var mQueryStr : String = "UPDATE \(pTableName) SET \(mUpdateString)"
        if (!pCondition.isEmpty) {
            mQueryStr = "\(mQueryStr) WHERE \(pCondition)"
        }
        try DbAccess.queue.inTransaction { db in
            let mUpdStatement = try db.makeStatement(sql: mQueryStr)
            try mUpdStatement.execute()
            return .commit
        }
    }
    
    class func updateTable(pTableName: String, pCondition : String, pValues:[String: DatabaseValueConvertible]) throws -> Bool {
        var isUpdated: Bool = false
        var mUpdateString: String = ""
        var mArguments: [String : DatabaseValueConvertible?] = [:]
        if (pValues.count > 0) {
            var mSeparator = ""
            for (key,value) in pValues {
                mUpdateString = "\(mUpdateString) \(mSeparator) \(key) = :\(key)"
                mSeparator = ","
                mArguments[key] = value
            }
        }
        var mQueryStr: String = "UPDATE \(pTableName) SET \(mUpdateString)"
        if (!pCondition.isEmpty) {
            mQueryStr = "\(mQueryStr) WHERE \(pCondition)"
        }
        try DbAccess.queue.inTransaction { db in
            let mUpdStatement = try db.makeStatement(sql: mQueryStr)
            mUpdStatement.arguments = StatementArguments(mArguments)
            try mUpdStatement.execute()
            if (db.changesCount > 0) {
                isUpdated = true
            }
            return .commit
        }
        return isUpdated
    }
    
    class func updateOrInsertIntoTable(pTableName: String, pCondition : String, pValues:[String: DatabaseValueConvertible]) throws {
        if (pCondition.utf8.count > 0) {
            let isUpdated: Bool = try updateTable(pTableName: pTableName, pCondition : pCondition, pValues: pValues)
            if (!isUpdated) {
                try insertIntoTable(pTableName: pTableName, pValues: pValues)
            }
        } else {
            try insertIntoTable(pTableName: pTableName, pValues: pValues)
        }
    }
    
    class func deleteFromTable(pTableName: String, pCondition: String) throws {
        var mQueryStr = "DELETE FROM \(pTableName)"
        if (!pCondition.isEmpty && pCondition.utf8.count > 0) {
            mQueryStr = "\(mQueryStr) WHERE \(pCondition)"
        }
        try DbAccess.queue.inTransaction { db in
            let mDelStatement = try db.makeStatement(sql: mQueryStr)
            try mDelStatement.execute()
            return .commit
        }
    }
}
