//
//  DbAccess.swift
//  LifePlus
//
//  Created by work on 11/09/20.
//

import Foundation
import GRDB

@objc
public class DbAccess: NSObject {
    internal static var keyService: KeyService = DbKeyService()
    public static let queue: DatabaseQueue = {
        let path = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("LifePlus.sqlite").path
        var config = Configuration()
        config.prepareDatabase { db in
            var passData = keyService.getKey()
            defer {
                passData.resetBytes(in: 0..<passData.count)
            }
            try db.usePassphrase(passData)
        }
        do {
            return try DatabaseQueue(path: path, configuration: config)
        } catch {
            print(path + " is not encrypted")
            do { // for compatibility with old unencrypted db instances
                return try DatabaseQueue(path: path)
            } catch {
                fatalError("Failed to setup database '\(path)': \(error.localizedDescription)")
            }
        }
    }()

  @objc
  public class func createDB() {
      do {
          try createMeasurementTable()
          try createServicesTable()
          try createCharactristicsTable()
          try createFieldsTable()
          try createGendersTable()
          try createEthnicitiesTable()
          try createUsersTable()
          try createDevicesTable()
          try createSessionsTable()
          try createMeasuresTable()
          try createMealsTable()
          try createStepsTable()
          try createAlertTable()
          try createCalibrationTable()
          try createRawDataTable()

          try runMigrations()
          
          if (!(SimulatorUserExists())) {
            try addIntoUserTable()
            try addDeviceValues()
            try addSessionValue()
          }
      } catch {
          print("Failed to init database: \(error.localizedDescription)")
          ErrorLogger.shared.dbError(userInfo: ["query" : "init DB failed", "message" : error.localizedDescription])
      }
  }
    
    private class func runMigrations() throws {
        var migrator = DatabaseMigrator()
        
        migrator.registerMigration("v2") { db in
            try db.alter(table: "users") { t in
                t.add(column: "skin_tone_id", Database.ColumnType.integer)
            }
        }
        try migrator.migrate(queue, upTo: "v2")
    }

  private class func createMeasurementTable() throws {
    let mTableDefination : String = Measurement.Cols.ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                  Measurement.Cols.USERID + " INTEGER, " +
                  Measurement.Cols.MEASUREDDATE + " VARCHAR, " +
                  Measurement.Cols.HEARTRATE + " INTEGER, " +
                  Measurement.Cols.RESPIRATIONRATE + " VARCHAR" +
                  Measurement.Cols.OXYGENSATURATION + " INTEGER, " +
                  Measurement.Cols.BLOODGLUCODE + " VARCHAR, " +
                  Measurement.Cols.BLOODPRESURESYS + " VARCHAR, " +
                  Measurement.Cols.BLOODPRESUREDIA + " VARCHAR "
      try DatabaseHelper.createTable(pTableName: Measurement.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createServicesTable() throws {
    let mTableDefination : String = ServicesTable.Cols.UID + " VARCHAR(128) PRIMARY KEY NOT NULL , " +
                  ServicesTable.Cols.NAME + " VARCHAR(50) NOT NULL , " +
                  ServicesTable.Cols.ABBREVIATION + " VARCHAR(10) NOT NULL, " +
                  ServicesTable.Cols.REFERENCE + " VARCHAR(128), " +
                  ServicesTable.Cols.UPDATE_DATE + " INTEGER "
      try DatabaseHelper.createTable(pTableName: ServicesTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createCharactristicsTable() throws {
    let mTableDefination : String = CharacteristicsTable.Cols.UID + " VARCHAR(128) PRIMARY KEY NOT NULL , " +
                  CharacteristicsTable.Cols.SERVICE_UID + " VARCHAR NOT NULL," +
                  CharacteristicsTable.Cols.NAME + " VARCHAR(50) NOT NULL, " +
                  CharacteristicsTable.Cols.DATA_TYPE + " VARCHAR(10) NOT NULL, " +
                  CharacteristicsTable.Cols.DATA_LENGTH + " INTEGER NOT NULL, " +
                  CharacteristicsTable.Cols.PROPERTIES + " VARCHAR(10) NOT NULL, " +
                  CharacteristicsTable.Cols.PERMISSION + " VARCHAR(10)," +
                  " FOREIGN KEY (" + CharacteristicsTable.Cols.SERVICE_UID + ") REFERENCES "
                  + ServicesTable.TABLE_NAME + "(" + ServicesTable.Cols.UID + ")"
      try DatabaseHelper.createTable(pTableName: CharacteristicsTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createFieldsTable() throws {
    let mTableDefination: String = FieldsTable.Cols.UID + " VARCHAR(128)  NOT NULL , " +
                  FieldsTable.Cols.SRLNO + " INTEGER  NOT NULL , " +
                  FieldsTable.Cols.NAME + " VARCHAR(50) NOT NULL, " +
                  FieldsTable.Cols.DATA_TYPE + " VARCHAR(10) NOT NULL, " +
                  FieldsTable.Cols.DATA_LENGTH + " INTEGER NOT NULL ," +
                  "  PRIMARY KEY ( " + FieldsTable.Cols.UID + "," + FieldsTable.Cols.SRLNO + ")," +
                  " FOREIGN KEY (" + FieldsTable.Cols.UID + ") REFERENCES " +
                  CharacteristicsTable.TABLE_NAME + "(" + CharacteristicsTable.Cols.UID + ")"
      try DatabaseHelper.createTable(pTableName: FieldsTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createGendersTable() throws {
    let isTableExist: Bool = exists(table: GenderTable.TABLE_NAME)
    if(!(isTableExist)){
      let mTableDefination: String = GenderTable.Cols.ID + " VARCHAR(1) PRIMARY KEY NOT NULL , " +
                      GenderTable.Cols.NAME + " VARCHAR NOT NULL  "
        try DatabaseHelper.createTable(pTableName: GenderTable.TABLE_NAME, pTableDefination: mTableDefination)
        try generateGender()
    }
  }

  private class func createEthnicitiesTable() throws {
    let isTableExist: Bool = exists( table: EthnicitiesTable.TABLE_NAME)
    if(!(isTableExist)){
      let mTableDefination: String = EthnicitiesTable.Cols.ID +
                  " INTEGER PRIMARY KEY NOT NULL , " +
                  EthnicitiesTable.Cols.NAME + " VARCHAR NOT NULL  "
        try DatabaseHelper.createTable(pTableName: EthnicitiesTable.TABLE_NAME, pTableDefination: mTableDefination)
        try generateEthnicities()
    }
  }

  private class func createUsersTable() throws {
    let mTableDefination: String = UserTable.Cols.ID + " INTEGER PRIMARY KEY NOT NULL , " +
                  UserTable.Cols.NAME + " VARCHAR(50) , " +
                  UserTable.Cols.BIRTH_DATE + " VARCHAR , " +
                  UserTable.Cols.GENDER_ID + " VARCHAR(1) , " +
                  UserTable.Cols.ETHNICITY_ID + " INTEGER , " +
                  UserTable.Cols.ADDRESS + " VARCHAR(100) , " +
                  UserTable.Cols.COUNTRY + " VARCHAR(20) , " +
                  UserTable.Cols.ZIP + " VARCHAR(10) , " +
                  UserTable.Cols.PASSWORD + " VARCHAR(500)  , " +
                  UserTable.Cols.HEIGHT_FT + " INTEGER  , " +
                  UserTable.Cols.HEIGHT_IN + " INTEGER  , " +
                  UserTable.Cols.WEIGHT + " FLOAT , " +
                  UserTable.Cols.WEIGHT_UNIT + " VARCHAR(10) , " +
                  UserTable.Cols.TNC_DATE + " INTEGER  , " +
                  UserTable.Cols.STEP_GOAL + " INTEGER  , " +
                  UserTable.Cols.HW_ID + " VARCHAR(128)  , " +
                  UserTable.Cols.GLUCOSE_UNIT + " VARCHAR(5)  , " +
                  UserTable.Cols.AUTO_MEASURE + " VARCHAR NOT NULL DEFAULT 'N', " +
                  UserTable.Cols.AUTO_FREQUENCY + " INTEGER NOT NULL DEFAULT 0 , " +
                  UserTable.Cols.SLEEP_TRACKING + " VARCHAR(1) NOT NULL DEFAULT 'N' , " +
                  UserTable.Cols.POWER_SAVE + " VARCHAR(1) NOT NULL DEFAULT 'N'  , " +
                  UserTable.Cols.CGM_DEBUG + " VARCHAR(1) NOT NULL DEFAULT 'N' , " +
                  UserTable.Cols.REGISTRATION_STATE + " INTEGER NOT NULL DEFAULT 0 ," +
                  UserTable.Cols.WEATHER_UNIT + " INTEGER NOT NULL DEFAULT 1, " +
                  UserTable.Cols.UPDATE_DATE + " INTEGER  NOT NULL , " +
                  UserTable.Cols.UPLOAD_DATE + " INTEGER  "
      try DatabaseHelper.createTable(pTableName: UserTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createDevicesTable() throws {
    let mTableDefination: String = DevicesTable.Cols.ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                  DevicesTable.Cols.HW_ID + " VARCHAR(128) NOT NULL , " +
                  DevicesTable.Cols.DATE_ADDED + " INTEGER NOT NULL , " +
                  DevicesTable.Cols.UPDATE_DATE + " INTEGER "
        try DatabaseHelper.createTable(pTableName: DevicesTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createSessionsTable() throws {
    let mTableDefination: String = SessionsTable.Cols.ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                  SessionsTable.Cols.USER_ID + " INTEGER NOT NULL, " +
                  SessionsTable.Cols.DEVICE_ID + " INTEGER , " +
                  SessionsTable.Cols.LOGIN_DATE + " INTEGER  NOT NULL , " +
                  SessionsTable.Cols.LOGOUT_DATE + " INTEGER , " +
                  SessionsTable.Cols.AUTH_TOKEN + " VARCHAR(512) NOT NULL , " +
                  SessionsTable.Cols.REFRESH_TOKEN + " VARCHAR(512) NOT NULL , " +
                  SessionsTable.Cols.GATEWAY_TOKEN + " VARCHAR(512) NOT NULL , " +
                  " FOREIGN KEY (" + SessionsTable.Cols.USER_ID + ") REFERENCES "
                  + UserTable.TABLE_NAME + "(" + UserTable.Cols.ID + ") ," +
                  " FOREIGN KEY (" + SessionsTable.Cols.DEVICE_ID + ") REFERENCES "
                  + DevicesTable.TABLE_NAME + "(" + DevicesTable.Cols.ID + ")"
      try DatabaseHelper.createTable(pTableName: SessionsTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createMeasuresTable() throws {
    let mTableDefination: String = MeasuresTable.Cols.SESSION_ID + " INTEGER NOT NULL , " +
                  MeasuresTable.Cols.TYPE + " VARCHAR(1) NOT NULL, " +
                  MeasuresTable.Cols.MEASURE_TIME + " INTEGER NOT NULL , " +
                  MeasuresTable.Cols.O2 + " INTEGER , " +
                  MeasuresTable.Cols.RESPIRATION + " INTEGER , " +
                  MeasuresTable.Cols.HEART_RATE + " INTEGER , " +
                  MeasuresTable.Cols.BPSYS + " INTEGER , " +
                  MeasuresTable.Cols.BPDIA + " INTEGER , " +
                  MeasuresTable.Cols.GLUCOSE + " INTEGER , " +
                  MeasuresTable.Cols.UPDATE_DATE + " INTEGER , " +
                  MeasuresTable.Cols.UPLOAD_DATE + " INTEGER , "
                  + "  PRIMARY KEY ( " + MeasuresTable.Cols.SESSION_ID + "," + MeasuresTable.Cols.TYPE + "," + MeasuresTable.Cols.MEASURE_TIME + "),"
                  + " FOREIGN KEY (" + MeasuresTable.Cols.SESSION_ID + ") REFERENCES "
                  + SessionsTable.TABLE_NAME + "(" + SessionsTable.Cols.ID + ")"
      try DatabaseHelper.createTable(pTableName: MeasuresTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createMealsTable() throws {
    let mTableDefination: String = MealsTable.Cols.SESSION_ID +
                  " INTEGER NOT NULL, " +
                  MealsTable.Cols.TIME + " INTEGER NOT NULL , " +
                  MealsTable.Cols.TYPE + " VARCHAR(1) NOT NULL , " +
                  MealsTable.Cols.UPDATE_DATE + " INTEGER , " +
                  MealsTable.Cols.UPLOAD_DATE + " INTEGER , " +
                  MealsTable.Cols.MEALTYPE + " INTEGER , " +
                  MealsTable.Cols.UTCYEAR + " INTEGER , " +
                  MealsTable.Cols.UTCMONTH + " INTEGER , " +
                  MealsTable.Cols.UTCDAY + " INTEGER , " +
                  MealsTable.Cols.UTCHOUR + " INTEGER , " +
                  MealsTable.Cols.UTCMINUTE + " INTEGER , " +
                  MealsTable.Cols.UTCSECOND + " INTEGER , " +
                  " PRIMARY KEY (" + MealsTable.Cols.SESSION_ID + "," + MealsTable.Cols.TYPE + "," + MealsTable.Cols.TIME + "), " +
                  " FOREIGN KEY (" + MealsTable.Cols.SESSION_ID + ") REFERENCES " +
                  SessionsTable.TABLE_NAME + "(" + SessionsTable.Cols.ID + ")"
      try DatabaseHelper.createTable(pTableName: MealsTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createStepsTable() throws {
    let mTableDefination =
      StepsTable.Cols.SESSION_ID + " INTEGER NOT NULL, " +
      StepsTable.Cols.TIME + " INTEGER NOT NULL , " +
      StepsTable.Cols.STEPS_COUNT + " INTEGER NOT NULL , " +
      StepsTable.Cols.UPDATE_DATE + " INTEGER , " +
      StepsTable.Cols.UPLOAD_DATE + " INTEGER , " +

      StepsTable.Cols.OPSTATUS + " INTEGER   , " +
      StepsTable.Cols.STEPS + " INTEGER , " +
      StepsTable.Cols.YEAR + " INTEGER  , " +
      StepsTable.Cols.MONTH + " INTEGER , " +
      StepsTable.Cols.DAY + " INTEGER , " +
      StepsTable.Cols.DAYOFWEEK + " INTEGER , " +
        " FOREIGN KEY (" + StepsTable.Cols.SESSION_ID + ") REFERENCES " +
        SessionsTable.TABLE_NAME + "(" + SessionsTable.Cols.ID + ")"
      try DatabaseHelper.createTable(pTableName: StepsTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createAlertTable() throws {
    let mTableDefination: String = AlertsTable.Cols.SESSION_ID +
                  " INTEGER NOT NULL, " +
                  AlertsTable.Cols.OCCUR_TIME + " INTEGER NOT NULL , " +
                  AlertsTable.Cols.ALERT_TYPE + " VARCHAR NOT NULL , " +
                  AlertsTable.Cols.ALERT_COLOR + " VARCHAR NOT NULL , " +
                  AlertsTable.Cols.VALUE + " INTEGER NOT NULL, " +
                  AlertsTable.Cols.UPDATE_DATE + " INTEGER, " +
                  "  PRIMARY KEY ( " + AlertsTable.Cols.SESSION_ID + "," + AlertsTable.Cols.OCCUR_TIME + " ," + AlertsTable.Cols.ALERT_TYPE +  ")," +
                  " FOREIGN KEY (" + AlertsTable.Cols.SESSION_ID + ") REFERENCES "
                  + SessionsTable.TABLE_NAME + "(" + SessionsTable.Cols.ID + ")"
      try DatabaseHelper.createTable(pTableName: AlertsTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createCalibrationTable() throws {
    let mTableDefination: String = CalibrationTable.Cols.TRIAL_DATA_ID +
                  " INTEGER  PRIMARY KEY AUTOINCREMENT, " +
                  CalibrationTable.Cols.PATIENT_ID + " TEXT NOT NULL, " +
                  CalibrationTable.Cols.PATIENT_INFO + " TEXT NOT NULL, " +
                  CalibrationTable.Cols.HEALTH_INFO + " TEXT NOT NULL, " +
                  CalibrationTable.Cols.VITAL + " TEXT NOT NULL  ," +
                  CalibrationTable.Cols.DATETIME + " INTEGER NOT NULL, " +
                  CalibrationTable.Cols.DEVICE_MSN + " TEXT NOT NULL, " +
                  CalibrationTable.Cols.SENSOR_DATA + " TEXT NOT NULL, " +
                  CalibrationTable.Cols.CALIBRATION_DATA + " TEXT NOT NULL  ," +
                  CalibrationTable.Cols.COMPLETE_DATA + " TEXT NOT NULL, " +
                  CalibrationTable.Cols.IS_COMPLETE + " INTEGER NOT NULL, " +
                  CalibrationTable.Cols.UPLOADED + " INTEGER NOT NULL, " +
                  CalibrationTable.Cols.UPDATE_DATE + " INTEGER "
      try DatabaseHelper.createTable(pTableName: CalibrationTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func createRawDataTable() throws {
    let mTableDefination: String = RawDataTable.Cols.OPSTATUS + " INTEGER   , " +
      RawDataTable.Cols.CURRENTINDEX + " INTEGER , " +
      RawDataTable.Cols.AFEDATA1 + " INTEGER  , " +
      RawDataTable.Cols.AFEDATA2 + " INTEGER , " +
      RawDataTable.Cols.AFEDATA3 + " INTEGER , " +
      RawDataTable.Cols.AFEDATA4 + " INTEGER , " +
      RawDataTable.Cols.GYRO1A + " INTEGER , " +
      RawDataTable.Cols.GYRO2A + " INTEGER , " +
      RawDataTable.Cols.GYRO3A + " INTEGER , " +
      RawDataTable.Cols.ACCELEROMETER_X + " INTEGER , " +
      RawDataTable.Cols.ACCELEROMETER_Y + " INTEGER , " +
      RawDataTable.Cols.ACCELEROMETER_Z + " INTEGER , " +
      RawDataTable.Cols.AFEPHASE1 + " INTEGER , " +
      RawDataTable.Cols.AFEPHASE2 + " INTEGER , " +
      RawDataTable.Cols.AFEPHASE3 + " INTEGER , " +
      RawDataTable.Cols.AFEPHASE4 + " INTEGER , " +
      RawDataTable.Cols.AFEPHASE5 + " INTEGER , " +
      RawDataTable.Cols.AFEPHASE6 + " INTEGER , " +
      RawDataTable.Cols.AFEPHASE7 + " INTEGER , " +
      RawDataTable.Cols.GYRO1A1 + " INTEGER , " +
      RawDataTable.Cols.GYRO2A1 + " INTEGER , " +
      RawDataTable.Cols.GYRO3A1 + " INTEGER , " +
      RawDataTable.Cols.ACCELEROMETER_X1 + " INTEGER , " +
      RawDataTable.Cols.ACCELEROMETER_Y1 + " INTEGER , " +
      RawDataTable.Cols.ACCELEROMETER_Z1 + " INTEGER , " +
      RawDataTable.Cols.UPLOAD_DATE + " INTEGER NOT NULL "
      try DatabaseHelper.createTable(pTableName: RawDataTable.TABLE_NAME, pTableDefination: mTableDefination)
  }

  private class func performDataBaseOpertion(pQuery: String) -> [String: Any] {
    var mResultSet: [String: Any] = [:]
    mResultSet["rowcount"] = "0"
    mResultSet["status"] = "success"
    mResultSet["message"] = ""
        do {
            try Self.queue.inDatabase { db in
              let mDbStatement = try db.makeStatement(sql: pQuery)
              try mDbStatement.execute()
              mResultSet["rowcount"] = "\(db.changesCount)"
            }
        } catch let error {
          mResultSet["status"] = "failed"
          mResultSet["message"] = error.localizedDescription
          ErrorLogger.shared.dbError(userInfo: ["query" : pQuery, "message" : error.localizedDescription])
        }
    return mResultSet
  }

  public class func executeQueries(pQueries: [DbQuery]) -> [[String: Any]] {
    var mResultArr: [[String: Any]] = []
    for aQuery in pQueries {
      var mResultMap: [String: Any] = [:]
      mResultMap["queryName"] = aQuery.getName()
      switch aQuery.getType() {
      case .Select:
        mResultMap["result"] = getQueryResult(pQuery: aQuery.getQuery())
      case .Insert,
           .Update,
           .Delete:
        mResultMap["result"] = performDataBaseOpertion(pQuery: aQuery.getQuery())
      default:
        mResultMap["message"] = "queryType Mismatched"
        mResultMap["status"] = "failed"
      }
      mResultArr.append(mResultMap)
    }
    return mResultArr
  }

  private class func getQueryResult(pQuery: String) -> [String: Any] {
    var mRows: [[String: Any]] = []
    var mResultSet: [String: Any] = [:]
    mResultSet["rowcount"] = "0"
    mResultSet["status"] = "success"
    mResultSet["message"] = ""

      do {
        try Self.queue.inDatabase { db in
          let rows = try Row.fetchCursor(db, sql: pQuery)
          var mCounter: Int = 0
          while let row = try rows.next() {
            mCounter += 1
            var mRow: [String: String] = [:]
            for (columnName, dbValue) in row {
              if let mStr = String.fromDatabaseValue(dbValue) {
                mRow[columnName] = mStr
              } else if let mInt: Int64 = row[columnName] {
                mRow[columnName] = String(mInt)
              } else if let mFloat: Float64 = row[columnName] {
                mRow[columnName] = String(mFloat)
              }
            }
            mRows.append(mRow)
          }
          mResultSet["rowcount"] = "\(mCounter)"
        }
      } catch let error {
        mResultSet["status"] = "failed"
        mResultSet["message"] = error.localizedDescription
        ErrorLogger.shared.dbError(userInfo: ["query" : pQuery, "message" : error.localizedDescription])
      }
      mResultSet["rows"] = mRows
    return mResultSet
  }

  private class func generateEthnicities() throws {
    var mArguments : [String: String] = [:]
    mArguments[EthnicitiesTable.Cols.ID] = "1"
    mArguments[EthnicitiesTable.Cols.NAME] = "American Indian or Alaska Native"
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: EthnicitiesTable.TABLE_NAME, pCondition: "", pValues: mArguments)
    mArguments[EthnicitiesTable.Cols.ID] = "2"
    mArguments[EthnicitiesTable.Cols.NAME] = "Asian"
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: EthnicitiesTable.TABLE_NAME, pCondition: "", pValues: mArguments)
    mArguments[EthnicitiesTable.Cols.ID] = "3"
    mArguments[EthnicitiesTable.Cols.NAME] = "Black or African American"
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: EthnicitiesTable.TABLE_NAME, pCondition: "", pValues: mArguments)
    mArguments[EthnicitiesTable.Cols.ID] = "4"
    mArguments[EthnicitiesTable.Cols.NAME] = "Hispanic or Latino"
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: EthnicitiesTable.TABLE_NAME, pCondition: "", pValues: mArguments)
    mArguments[EthnicitiesTable.Cols.ID] = "5"
    mArguments[EthnicitiesTable.Cols.NAME] = "Native Hawaiian or Other Pacific Islander"
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: EthnicitiesTable.TABLE_NAME, pCondition: "", pValues: mArguments)
    mArguments[EthnicitiesTable.Cols.ID] = "6"
    mArguments[EthnicitiesTable.Cols.NAME] = "White"
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: EthnicitiesTable.TABLE_NAME, pCondition: "", pValues: mArguments)
    mArguments[EthnicitiesTable.Cols.ID] = "7"
    mArguments[EthnicitiesTable.Cols.NAME] = "Mixed Race"
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: EthnicitiesTable.TABLE_NAME, pCondition: "", pValues: mArguments)
    mArguments[EthnicitiesTable.Cols.ID] =  "8"
    mArguments[EthnicitiesTable.Cols.NAME] = "Decline to specify"
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: EthnicitiesTable.TABLE_NAME, pCondition: "", pValues: mArguments)
  }

  private class func generateGender() throws {
    var mArguments : [String: String] = [:]
    mArguments[GenderTable.Cols.ID] = "M"
    mArguments[GenderTable.Cols.NAME] = "MALE"
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: GenderTable.TABLE_NAME, pCondition: "", pValues: mArguments)
    mArguments[GenderTable.Cols.ID] = "F"
    mArguments[GenderTable.Cols.NAME] = "FEMALE"
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: GenderTable.TABLE_NAME, pCondition: "", pValues: mArguments)
    mArguments[GenderTable.Cols.ID] = "O"
    mArguments[GenderTable.Cols.NAME] = "Other"
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: GenderTable.TABLE_NAME, pCondition: "", pValues: mArguments)
  }

  private class func exists(table: String) -> Bool {
    var result: Bool = false
    let mQuery : String = "SELECT * FROM " + table
      do {
        try Self.queue.inDatabase { db in
          let rows = try Row.fetchCursor(db, sql: mQuery)
          while (try rows.next()) != nil {
            result = true
          }
        }
      } catch {
        result = false
        ErrorLogger.shared.dbError(userInfo: ["query" : mQuery, "message" : error.localizedDescription])
      }
    return result
  }

  private class func SimulatorUserExists() -> Bool {
    var result: Bool = false
    let mQuery : String = "SELECT * FROM \(UserTable.TABLE_NAME) WHERE \(UserTable.Cols.ID) = '1'"
      do {
          try Self.queue.inDatabase { db in
            let rows = try Row.fetchCursor(db, sql: mQuery)
            while (try rows.next()) != nil {
              result = true
            }
        }
      } catch {
        result = false
        ErrorLogger.shared.dbError(userInfo: ["query" : mQuery, "message" : error.localizedDescription])
      }
    return result
  }

    internal class func getAppSyncFor(userId: Int) throws -> AppSync {
      let result = AppSync()
        let mQuery : String = "select *, \(UserTable.Cols.AGE_EXP) from \(UserTable.TABLE_NAME) where \(UserTable.Cols.ID) = \(userId)"
          try Self.queue.inDatabase { db in
            let rows = try Row.fetchCursor(db, sql: mQuery)
            while let row = try rows.next() {
              result.setAutoMeasure(pAutoMeasure: row[UserTable.Cols.AUTO_MEASURE])
              result.setCgmUnit(cgmUnit: row[UserTable.Cols.GLUCOSE_UNIT])
              result.setCgmModeOn(pCgmModeOn: row[UserTable.Cols.CGM_DEBUG])
              result.setBirthDate(pBirthDate: row[UserTable.Cols.BIRTH_DATE])
              result.setAge(pAge: row[UserTable.Cols.AGE])
              result.setHeight_ft(pHeight_ft: row[UserTable.Cols.HEIGHT_FT])
              result.setHeight_in(pHeight_in: row[UserTable.Cols.HEIGHT_IN])
              result.setWeight(pWeight: row[UserTable.Cols.WEIGHT])
              result.setWeightUnit(pWeightUnit: row[UserTable.Cols.WEIGHT_UNIT])
              result.setEthnicity(pEthnicity: row[UserTable.Cols.ETHNICITY_ID])
              result.setSkinTone(pSkinTone: row[UserTable.Cols.SKIN_TONE_ID])
              result.setGender(pGender: row[UserTable.Cols.GENDER_ID])
              result.setWeatherUnit(pWeatherUnit: row[UserTable.Cols.WEATHER_UNIT])
              result.setAutoMeasure(pAutoMeasure: row[UserTable.Cols.AUTO_MEASURE])
              result.setAutoMeasureInterval(pAutoMeasureInterval: row[UserTable.Cols.AUTO_FREQUENCY])
              //Warning: powerSave not mapped yet.
            }
          }
      return result
    }

    internal class func updateAppSync(pUserId: Int, pAppSync: AppSync) throws {
        var pParams: [String: DatabaseValueConvertible] = [:]
        let condition:String = "\(UserTable.Cols.ID) = '\(pUserId)'"

        pParams[UserTable.Cols.BIRTH_DATE] = pAppSync.getBirthDate()
        pParams[UserTable.Cols.HEIGHT_FT] = pAppSync.getHeight_ft()
        pParams[UserTable.Cols.HEIGHT_IN] = pAppSync.getHeight_in()
        pParams[UserTable.Cols.WEIGHT] = pAppSync.getWeight()
        pParams[UserTable.Cols.WEIGHT_UNIT] = pAppSync.getWeightUnit()
        pParams[UserTable.Cols.ETHNICITY_ID] = pAppSync.getEthnicity()
        pParams[UserTable.Cols.SKIN_TONE_ID] = pAppSync.getSkinTone()
        pParams[UserTable.Cols.GENDER_ID] = pAppSync.getGender()
        pParams[UserTable.Cols.WEATHER_UNIT] = pAppSync.getWeatherUnit()

        pParams[UserTable.Cols.AUTO_MEASURE] = pAppSync.getAutoMeasure() ? "Y" : "N"
        pParams[UserTable.Cols.AUTO_FREQUENCY] = pAppSync.getAutoMeasureInterval()
        pParams[UserTable.Cols.CGM_DEBUG] = pAppSync.getCgmModeOn()
        pParams[UserTable.Cols.GLUCOSE_UNIT] = pAppSync.getCgmUnit()

        pParams[UserTable.Cols.UPDATE_DATE] = Utils.currentMillis()

        try DatabaseHelper.updateOrInsertIntoTable(pTableName: UserTable.TABLE_NAME, pCondition: condition, pValues: pParams)
    }

    internal class func addTestUser(userId: Int, stepGoal: Int = 0) throws {
        var mArguments : [String: DatabaseValueConvertible] = [:]
        mArguments[UserTable.Cols.ID] = userId
        mArguments[UserTable.Cols.NAME] = "Test"
        mArguments[UserTable.Cols.BIRTH_DATE] = Utils.currentMillisStr()
        mArguments[UserTable.Cols.GLUCOSE_UNIT] = "mmol/L"
        mArguments[UserTable.Cols.HEIGHT_FT] = 0
        mArguments[UserTable.Cols.HEIGHT_IN] = 0
        mArguments[UserTable.Cols.WEIGHT] = 0.0
        mArguments[UserTable.Cols.WEIGHT_UNIT] = "MKS"
        mArguments[UserTable.Cols.ETHNICITY_ID] = 0
        mArguments[UserTable.Cols.SKIN_TONE_ID] = 0
        mArguments[UserTable.Cols.GENDER_ID] = "M"
        mArguments[UserTable.Cols.UPDATE_DATE] = Utils.currentMillis()
        mArguments[UserTable.Cols.STEP_GOAL] = stepGoal
        mArguments[UserTable.Cols.AUTO_MEASURE] = "Y"
        mArguments[UserTable.Cols.AUTO_FREQUENCY] = 15
        try DatabaseHelper.updateOrInsertIntoTable(pTableName: UserTable.TABLE_NAME, pCondition: "", pValues: mArguments)
    }

  public class func addIntoUserTable() throws {
    var mArguments : [String: DatabaseValueConvertible] = [:]
    mArguments[UserTable.Cols.ID] = 1
    mArguments[UserTable.Cols.NAME] = "Simulator"
    mArguments[UserTable.Cols.BIRTH_DATE] = Utils.currentMillisStr()
    mArguments[UserTable.Cols.GENDER_ID] = "M"
    mArguments[UserTable.Cols.ETHNICITY_ID] = 101
    mArguments[UserTable.Cols.SKIN_TONE_ID] = 4
    mArguments[UserTable.Cols.ADDRESS] = "Pune"
    mArguments[UserTable.Cols.COUNTRY] = "INDIA"
    mArguments[UserTable.Cols.ZIP] = "123456"
    mArguments[UserTable.Cols.PASSWORD] = "lifeplusPassword"
    mArguments[UserTable.Cols.HEIGHT_FT] = 101
    mArguments[UserTable.Cols.HEIGHT_IN] = 101
    mArguments[UserTable.Cols.WEIGHT] = 192.5
    mArguments[UserTable.Cols.WEIGHT_UNIT] = "MKS"
    mArguments[UserTable.Cols.TNC_DATE] = Utils.currentMillis()
    mArguments[UserTable.Cols.STEP_GOAL] = 101
    mArguments[UserTable.Cols.HW_ID] = "ID"
    mArguments[UserTable.Cols.GLUCOSE_UNIT] = "mg/dL"
    mArguments[UserTable.Cols.AUTO_MEASURE] = "N"
    mArguments[UserTable.Cols.AUTO_FREQUENCY] = 15
    mArguments[UserTable.Cols.SLEEP_TRACKING] = "N"
    mArguments[UserTable.Cols.POWER_SAVE] = "Y"
    mArguments[UserTable.Cols.CGM_DEBUG] = "YES"
    mArguments[UserTable.Cols.WEATHER_UNIT] = 1
    mArguments[UserTable.Cols.REGISTRATION_STATE] = 1
    mArguments[UserTable.Cols.UPDATE_DATE] = Utils.currentMillis()
    mArguments[UserTable.Cols.UPLOAD_DATE] = Utils.currentMillis()
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: UserTable.TABLE_NAME, pCondition: "", pValues: mArguments)
  }

  private class func addDeviceValues() throws {
      var mArguments : [String: DatabaseValueConvertible] = [:]
      mArguments[DevicesTable.Cols.ID] = 1
      mArguments[DevicesTable.Cols.DATE_ADDED] = Utils.currentMillis()
      mArguments[DevicesTable.Cols.HW_ID] = "HW_ID"
      try DatabaseHelper.updateOrInsertIntoTable(pTableName: DevicesTable.TABLE_NAME, pCondition: "", pValues: mArguments)
  }


  public class func isMeasureExist(measureTime: Int64) -> Bool {
    var result: Bool = false
    let mQuery : String = "SELECT * FROM \(MeasuresTable.TABLE_NAME) WHERE \(MeasuresTable.Cols.MEASURE_TIME) = '\(measureTime)'"
      do {
          try Self.queue.inDatabase { db in
            let rows = try Row.fetchCursor(db, sql: mQuery)
            while (try rows.next()) != nil {
              result = true
            }
        }
      } catch {
        result = false
        ErrorLogger.shared.dbError(userInfo: ["query" : mQuery, "message" : error.localizedDescription])
      }
    return result
  }
    
  public class func addUnsuccessfulMeasurement(measureTime: Int64) throws {
    let arguments = [
      MeasuresTable.Cols.SESSION_ID : 1,
      MeasuresTable.Cols.TYPE : "U",
      MeasuresTable.Cols.MEASURE_TIME : "\(measureTime)",
      MeasuresTable.Cols.UPLOAD_DATE : "\(Int64(Date().timeIntervalSince1970 * 1000))",
      MeasuresTable.Cols.O2 : 0,
      MeasuresTable.Cols.RESPIRATION : 0,
      MeasuresTable.Cols.HEART_RATE : 0,
      MeasuresTable.Cols.BPSYS : 0,
      MeasuresTable.Cols.BPDIA : 0,
      MeasuresTable.Cols.GLUCOSE : 0
    ] as [String: DatabaseValueConvertible]
    try DatabaseHelper.updateOrInsertIntoTable(pTableName: MeasuresTable.TABLE_NAME, pCondition: "", pValues: arguments)
  }

  public class func addIntoMeasurable(pValues: [String: Int], pTime: Int64) throws {
      var mArguments : [String: DatabaseValueConvertible] = [:]
      mArguments[MeasuresTable.Cols.SESSION_ID] = pValues["SessionId"] ?? 1
      mArguments[MeasuresTable.Cols.TYPE] = "R"
      mArguments[MeasuresTable.Cols.MEASURE_TIME] = "\(pTime)"
      mArguments[MeasuresTable.Cols.O2] = pValues["OxygenSaturation"] ?? 0
      mArguments[MeasuresTable.Cols.RESPIRATION] = pValues["RespirationRate"] ?? 0
      mArguments[MeasuresTable.Cols.HEART_RATE] = pValues["HeartRate"] ?? 0
      mArguments[MeasuresTable.Cols.BPSYS] = pValues["BloodPressureSYS"] ?? 0
      mArguments[MeasuresTable.Cols.BPDIA] = pValues["BloodPressureDIA"] ?? 0
      mArguments[MeasuresTable.Cols.GLUCOSE] = pValues["BloodGlucose"] ?? 0
      try DatabaseHelper.updateOrInsertIntoTable(pTableName: MeasuresTable.TABLE_NAME, pCondition: "", pValues: mArguments)
  }

  public class func addMealData(pValues: [String: Int], pTime: Int64) throws {
      var mArguments : [String: DatabaseValueConvertible] = [:]
      mArguments[MealsTable.Cols.SESSION_ID] = pValues["SessionId"] ?? 1
      mArguments[MealsTable.Cols.TYPE] = "R"
      mArguments[MealsTable.Cols.TIME] = "\(pTime)"
      mArguments[MealsTable.Cols.MEALTYPE] = pValues["Meal_Type"] ?? 1
      mArguments[MealsTable.Cols.UPDATE_DATE] = Int64(Date().timeIntervalSince1970 * 1000)
      mArguments[MealsTable.Cols.UPLOAD_DATE] = Int64(Date().timeIntervalSince1970 * 1000)
      try DatabaseHelper.updateOrInsertIntoTable(pTableName: MealsTable.TABLE_NAME, pCondition: "", pValues: mArguments)
  }

  public class func updateStepsCount(pValues: [String: Int], pTime: Int64) throws {
      if let year = pValues["Year"], let month = pValues["Month"], let day = pValues["Day"], let hour = pValues["Hour"] {
          let sessionId = pValues["SessionId"] ?? 1
          let condition = "\(StepsTable.Cols.SESSION_ID) = \(sessionId) AND \(StepsTable.Cols.YEAR) = '\(year)' AND \(StepsTable.Cols.MONTH) = '\(month)' AND \(StepsTable.Cols.DAY) = '\(day)' AND \(StepsTable.Cols.OPSTATUS) = '\(hour)'"

          var mArguments : [String: DatabaseValueConvertible] = [:]
          mArguments[StepsTable.Cols.SESSION_ID] = sessionId
          mArguments[StepsTable.Cols.TIME] = pTime
          mArguments[StepsTable.Cols.UPDATE_DATE] = Int64(Date().timeIntervalSince1970 * 1000)
          mArguments[StepsTable.Cols.UPLOAD_DATE] = Int64(Date().timeIntervalSince1970 * 1000)
          mArguments[StepsTable.Cols.OPSTATUS] = hour // use OpStatus field as hour key
          mArguments[StepsTable.Cols.STEPS_COUNT] = pValues["Steps"] ?? 0
          mArguments[StepsTable.Cols.YEAR] = year
          mArguments[StepsTable.Cols.MONTH] = month
          mArguments[StepsTable.Cols.DAY] = day
          mArguments[StepsTable.Cols.DAYOFWEEK] = pValues["Day_of_Week"]

          try DatabaseHelper.updateOrInsertIntoTable(pTableName: StepsTable.TABLE_NAME, pCondition: condition, pValues: mArguments)
      } else {
          throw NSError(
            domain: "StepsCount",
            code: -1001,
            userInfo: [NSLocalizedDescriptionKey : "invalid condition - no date or hour params"]
        )
      }
  }

  private class func addSessionValue() throws {
      var mArguments : [String: DatabaseValueConvertible] = [:]
      mArguments[SessionsTable.Cols.ID] = 1
      mArguments[SessionsTable.Cols.USER_ID] = 1
      mArguments[SessionsTable.Cols.DEVICE_ID] = 1
      mArguments[SessionsTable.Cols.LOGIN_DATE] = Utils.currentMillis()
      mArguments[SessionsTable.Cols.LOGOUT_DATE] = Utils.currentMillis()
      mArguments[SessionsTable.Cols.AUTH_TOKEN] = "AuthToken"
      mArguments[SessionsTable.Cols.REFRESH_TOKEN] = "RefreshToken"
      mArguments[SessionsTable.Cols.GATEWAY_TOKEN] = "GateWay Token"
      try DatabaseHelper.updateOrInsertIntoTable(pTableName: SessionsTable.TABLE_NAME, pCondition: "", pValues: mArguments)
  }

  public class func getCurrSession() -> UserSessionStruct? {
    var result:UserSessionStruct? = nil
    let mQuery : String = " SELECT a." + SessionsTable.Cols.ID
      + ", a." + SessionsTable.Cols.USER_ID
      + ", a." + SessionsTable.Cols.DEVICE_ID
      + ", b." + DevicesTable.Cols.HW_ID
      + " FROM " + SessionsTable.TABLE_NAME + " a "
      + " JOIN " + DevicesTable.TABLE_NAME + " b "
      + " ON b." + DevicesTable.Cols.ID + " = a." + SessionsTable.Cols.DEVICE_ID
      + " WHERE " + SessionsTable.Cols.LOGOUT_DATE + " = null "
      + " LIMIT 1"
      do {
        try Self.queue.inDatabase { db in
          let rows = try Row.fetchCursor(db, sql: mQuery)
          while let row = try rows.next() {
            let mSessionId:Int = row[SessionsTable.Cols.ID] != nil ? row[SessionsTable.Cols.ID] : 0
            let mUserId:String = row[SessionsTable.Cols.USER_ID] != nil ? row[SessionsTable.Cols.USER_ID] : ""
            let mDeviceId:String = row[DevicesTable.Cols.HW_ID] != nil ? row[DevicesTable.Cols.HW_ID] : ""
            result = UserSessionStruct(
              pId: "\(mSessionId)", pUserId: mUserId, pDeviceId: mDeviceId, pLoginDate: nil, pLogoutDate: nil, pAuthToken: "", pRefreshToken: "", pGatewayToken: "");
          }
        }
      } catch {
        result = UserSessionStruct(pId: "", pUserId: "", pDeviceId: "", pLoginDate: nil, pLogoutDate: nil, pAuthToken: "", pRefreshToken: "", pGatewayToken: "");
        ErrorLogger.shared.dbError(userInfo: ["query" : mQuery, "message" : error.localizedDescription])
      }
    return result
  }

  public class func updateCalibration(pUserId: Int, pDeviceMSN: String, pDataBaseValues: [String:Any]) throws {
//      ArrayList<String> paramAList = new ArrayList<>();
//      String condition = UserTable.Cols.ID + "=?";
//      paramAList.add(String.valueOf( pUserId ));
//      ContentValues mValues = new ContentValues(  );
//      for(String mKey: pDataBaseValues.keySet()){
//          mValues.put( mKey, String.valueOf( pDataBaseValues.get( mKey ) ) );
//      }
//      insertOrUpdateIntoTable(UserTable.TABLE_NAME,mValues,condition,paramAList);
  }

  internal class func addRawData(pValues: [[String:Any]]) throws {
    let mQueryStr: String = "INSERT INTO \(RawDataTable.TABLE_NAME) (\(RawDataTable.Cols.OPSTATUS), \(RawDataTable.Cols.CURRENTINDEX), \(RawDataTable.Cols.AFEDATA1), \(RawDataTable.Cols.AFEDATA2), \(RawDataTable.Cols.AFEDATA3), \(RawDataTable.Cols.AFEDATA4), \(RawDataTable.Cols.GYRO1A), \(RawDataTable.Cols.GYRO2A), \(RawDataTable.Cols.GYRO3A), \(RawDataTable.Cols.ACCELEROMETER_X), \(RawDataTable.Cols.ACCELEROMETER_Y), \(RawDataTable.Cols.ACCELEROMETER_Z), \(RawDataTable.Cols.AFEPHASE1), \(RawDataTable.Cols.AFEPHASE2), \(RawDataTable.Cols.AFEPHASE3), \(RawDataTable.Cols.AFEPHASE4), \(RawDataTable.Cols.AFEPHASE5), \(RawDataTable.Cols.AFEPHASE6), \(RawDataTable.Cols.AFEPHASE7), \(RawDataTable.Cols.GYRO1A1), \(RawDataTable.Cols.GYRO2A1), \(RawDataTable.Cols.GYRO3A1), \(RawDataTable.Cols.ACCELEROMETER_X1), \(RawDataTable.Cols.ACCELEROMETER_Y1), \(RawDataTable.Cols.ACCELEROMETER_Z1), \(RawDataTable.Cols.UPLOAD_DATE)) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
        do {
            try Self.queue.inDatabase { db in
              let insertStatement = try db.makeStatement(sql: mQueryStr)
//              try db.beginTransaction()
              for mValue in pValues {
                insertStatement.setUncheckedArguments([mValue["OpStatus"] as? Int, mValue["CurrentIndex"] as? Int, mValue["AFEData1"] as? Int64, mValue["AFEData2"] as? Int64, mValue["AFEData3"] as? Int64, mValue["AFEData4"] as? Int64, mValue["Gyro1a"] as? Int, mValue["Gyro2a"] as? Int, mValue["Gyro3a"] as? Int, mValue["Accelerometer_X"] as? Int, mValue["Accelerometer_Y"] as? Int, mValue["Accelerometer_Z"] as? Int, mValue["AFEPhase1"] as? Int64, mValue["AFEPhase2"] as? Int64, mValue["AFEPhase3"] as? Int64, mValue["AFEPhase4"] as? Int64, mValue["AFEPhase5"] as? Int64, mValue["AFEPhase6"] as? Int64, mValue["AFEPhase7"] as? Int64, mValue["Gyro1a1"] as? Int, mValue["Gyro2a1"] as? Int, mValue["Gyro3a1"] as? Int, mValue["Accelerometer_X1"] as? Int, mValue["Accelerometer_Y1"] as? Int, mValue["Accelerometer_Z1"] as? Int, Date().timeIntervalSince1970])
                try insertStatement.execute()
              }
//              try db.commit()
            }
        } catch let error {
          print(error.localizedDescription)
          ErrorLogger.shared.dbError(userInfo: ["query" : mQueryStr, "message" : error.localizedDescription])
        }
  }

  internal class func addRawData2(pArraysToUpload: [Int64:[[String:Any]]]) throws {
    let mQueryStr: String = "INSERT INTO \(RawDataTable.TABLE_NAME) (\(RawDataTable.Cols.OPSTATUS), \(RawDataTable.Cols.CURRENTINDEX), \(RawDataTable.Cols.AFEDATA1), \(RawDataTable.Cols.AFEDATA2), \(RawDataTable.Cols.AFEDATA3), \(RawDataTable.Cols.AFEDATA4), \(RawDataTable.Cols.GYRO1A), \(RawDataTable.Cols.GYRO2A), \(RawDataTable.Cols.GYRO3A), \(RawDataTable.Cols.ACCELEROMETER_X), \(RawDataTable.Cols.ACCELEROMETER_Y), \(RawDataTable.Cols.ACCELEROMETER_Z), \(RawDataTable.Cols.AFEPHASE1), \(RawDataTable.Cols.AFEPHASE2), \(RawDataTable.Cols.AFEPHASE3), \(RawDataTable.Cols.AFEPHASE4), \(RawDataTable.Cols.AFEPHASE5), \(RawDataTable.Cols.AFEPHASE6), \(RawDataTable.Cols.AFEPHASE7), \(RawDataTable.Cols.GYRO1A1), \(RawDataTable.Cols.GYRO2A1), \(RawDataTable.Cols.GYRO3A1), \(RawDataTable.Cols.ACCELEROMETER_X1), \(RawDataTable.Cols.ACCELEROMETER_Y1), \(RawDataTable.Cols.ACCELEROMETER_Z1), \(RawDataTable.Cols.UPLOAD_DATE)) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
        do {
            try Self.queue.inDatabase { db in
              let insertStatement = try db.makeStatement(sql: mQueryStr)
//              try db.beginTransaction()
              for (_, pValues) in pArraysToUpload {
                for mValue in pValues {
                  insertStatement.setUncheckedArguments([mValue["OpStatus"] as? Int, mValue["CurrentIndex"] as? Int, mValue["AFEData1"] as? Int64, mValue["AFEData2"] as? Int64, mValue["AFEData3"] as? Int64, mValue["AFEData4"] as? Int64, mValue["Gyro1a"] as? Int, mValue["Gyro2a"] as? Int, mValue["Gyro3a"] as? Int, mValue["Accelerometer_X"] as? Int, mValue["Accelerometer_Y"] as? Int, mValue["Accelerometer_Z"] as? Int, mValue["AFEPhase1"] as? Int64, mValue["AFEPhase2"] as? Int64, mValue["AFEPhase3"] as? Int64, mValue["AFEPhase4"] as? Int64, mValue["AFEPhase5"] as? Int64, mValue["AFEPhase6"] as? Int64, mValue["AFEPhase7"] as? Int64, mValue["Gyro1a1"] as? Int, mValue["Gyro2a1"] as? Int, mValue["Gyro3a1"] as? Int, mValue["Accelerometer_X1"] as? Int, mValue["Accelerometer_Y1"] as? Int, mValue["Accelerometer_Z1"] as? Int, Date().timeIntervalSince1970])
                  try insertStatement.execute()
                }
              }
//              try db.commit()
            }
        } catch let error {
          print(error.localizedDescription)
          ErrorLogger.shared.dbError(userInfo: ["query" : mQueryStr, "message" : error.localizedDescription])
        }
  }
  // get the weather Unit stored in usertabel incase of any converstion or featching errors we are passing "Imperial" as this is default unit. there is very less chanaces of faliure here as setted default value in db.
  public class func getWeatherUnitForUser(userId: Int) -> WeatherUnitEnum {
    var result = WeatherUnitEnum.Imperial
    let mQuery : String = "Select \(UserTable.Cols.WEATHER_UNIT) from \(UserTable.TABLE_NAME) where \(UserTable.Cols.ID) = \(userId)"
      do {
        try Self.queue.inDatabase { db in
          let rows = try Row.fetchCursor(db, sql: mQuery)
          while let row = try rows.next() {
            let weatherUnitRawValue:Int = row[UserTable.Cols.WEATHER_UNIT] != nil ? row[UserTable.Cols.WEATHER_UNIT] : 1
            result = WeatherUnitEnum.init(rawValue: weatherUnitRawValue) ?? .Imperial
          }
        }
      } catch {
        result = WeatherUnitEnum.Imperial
        ErrorLogger.shared.dbError(userInfo: ["query" : mQuery, "message" : error.localizedDescription])
      }
    return result
  }
    
    internal class func getCurrentUserGoal(userId: Int) throws -> Int {
        var result: Int = 0
        let mQuery : String = "select \(UserTable.Cols.STEP_GOAL) from \(UserTable.TABLE_NAME) where \(UserTable.Cols.ID) = \(userId)"
          try Self.queue.inDatabase { db in
            let rows = try Row.fetchCursor(db, sql: mQuery)
            while let row = try rows.next() {
              result = row[UserTable.Cols.STEP_GOAL]
            }
          }
      return result
    }
    
    internal class func getLatestMeasureTimestamp() -> Int64 {
        var result: Int64 = 0
        let query = "select \(MeasuresTable.Cols.MEASURE_TIME) from \(MeasuresTable.TABLE_NAME) where \(MeasuresTable.Cols.SESSION_ID) = 1 order by \(MeasuresTable.Cols.MEASURE_TIME) desc limit 1"
        do {
            try Self.queue.inDatabase { db in
                let rows = try Row.fetchCursor(db, sql: query)
                if let row = try rows.next() {
                    result = row[row.columnNames.first!]
                }
            }
        } catch {
            ErrorLogger.shared.dbError(userInfo: ["query" : query, "message" : error.localizedDescription])
        }
        return result
    }
    
    internal class func reviewOfflineMeasures(from measureTime: Int64) {
        if let interval = (try? Self.getAppSyncFor(userId: Global.getUserId()))?.getAutoMeasureInterval() {
            let measures = (Self.getMeasuresAfter(measureTime: measureTime) + [Int64(Date().timeIntervalSince1970 * 1000)]).sorted()
            let intervalMs = Int64(interval * 60 * 1000)
            measures.enumerated().forEach{ (index, value) in
                if index != 0 {
                    var prevValue = measures[index - 1]
                    while (value - prevValue) > (intervalMs + intervalMs / 2) {
                        prevValue = prevValue + intervalMs
                        try? Self.addUnsuccessfulMeasurement(measureTime: prevValue)
                    }
                }
            }
        }
    }
    
    private class func getMeasuresAfter(measureTime: Int64) -> [Int64] {
        var result: [Int64] = []
        let query = "select \(MeasuresTable.Cols.MEASURE_TIME) from \(MeasuresTable.TABLE_NAME) where \(MeasuresTable.Cols.SESSION_ID) = 1 and \(MeasuresTable.Cols.MEASURE_TIME) >= \(measureTime)"
        do {
            try Self.queue.inDatabase { db in
                let rows = try Row.fetchCursor(db, sql: query)
                while let row = try rows.next() {
                    result.append(row[MeasuresTable.Cols.MEASURE_TIME])
                }
            }
        } catch {
            ErrorLogger.shared.dbError(userInfo: ["query" : query, "message" : error.localizedDescription])
        }
        return result
    }
}
