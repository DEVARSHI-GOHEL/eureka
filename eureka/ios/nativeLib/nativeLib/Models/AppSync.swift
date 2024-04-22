//
//  AppSync.swift
//  eureka
//
//  Created by work on 21/02/21.
//

import Foundation

public class AppSync {
  public static var calculationOff: Bool = false
    
  private var birthDate: String?
  private var age: Int?
  private var height_ft: Int?
  private var height_in: Int?
  private var weight: Float?
  private var weightUnit: String?
  private var ethnicity: Int?
  private var skinTone: Int?
  private var gender: String?
  private var autoMeasure: String = ""
  private var autoMeasureInterval: Int?
  private var cgmModeOn: String?
  private var cgmUnitIndex: Int = 0
  private var weatherUnit: Int = 0
  private var weatherOnOff: String = ""
  private var notificationOnOff: String = ""

  public init() {}

  public func getBirthDate() -> String? {
    return birthDate
  }

  public func setBirthDate(pBirthDate: String?) {
    birthDate = pBirthDate
  }

  internal func getAge() -> Int? {
    return age
  }

  public func setAge(pAge: Int) {
    age = pAge
  }

  public func setHeight_ft(pHeight_ft: Int) {
    height_ft = pHeight_ft
  }

  public func getHeight_ft() -> Int? {
    return height_ft
  }

  public func setHeight_in(pHeight_in: Int) {
    height_in = pHeight_in
  }

  public func getHeight_in() -> Int? {
    return height_in
  }

  internal func getHeightMillim() -> Int? {
    var result:Int? = nil
    if ((height_ft == nil) || (height_in == nil)) {
      return result
    }
    let mInches = (height_ft! * 12) + height_in!
    result = Int(floor(Double(mInches) * 25.4))
    return result
  }

  public func getWeight() -> Float? {
    return weight
  }

  public func setWeight(pWeight: Float) {
    weight = pWeight
  }

  internal func getWeightKg() -> Float? {
    if let value = weight, weightUnit != "MKS" {
      return value / 2.205
    }
    return weight
  }

  public func getWeightUnit() -> String? {
    return weightUnit
  }

  public func setWeightUnit(pWeightUnit: String) {
    weightUnit = pWeightUnit
  }

  public func getEthnicity() -> Int? {
    return ethnicity
  }

  public func setEthnicity(pEthnicity: Int) {
    ethnicity = pEthnicity
  }

  public func getSkinTone() -> Int? {
    return skinTone
  }

  public func setSkinTone(pSkinTone: Int?) {
    skinTone = pSkinTone
  }

public func getGender() -> String? {
    return gender
  }

  public func setGender(pGender: String) {
    gender = pGender
  }

  internal func getAutoMeasure() -> Bool{
    return ("Y" == autoMeasure.uppercased())
  }

  public func setAutoMeasure(pAutoMeasure: String) {
    autoMeasure = pAutoMeasure
  }

  internal func getAutoMeasureInterval() -> Int? {
    return autoMeasureInterval
  }

  public func setAutoMeasureInterval(pAutoMeasureInterval: Int) {
    autoMeasureInterval = pAutoMeasureInterval
  }

  internal func getCgmModeOn() -> String? {
    return cgmModeOn
  }

  public func setCgmModeOn(pCgmModeOn: String?) {
    cgmModeOn = pCgmModeOn
  }

  internal func getCgmUnitIndex() -> Int {
    return cgmUnitIndex
  }

  internal func getCgmUnit() -> String {
    return cgmUnitIndex == 1 ? "mg/dL" : "mmol/L"
  }

  public func setCgmUnit(index:Int) {
    cgmUnitIndex = index
  }

  public func setCgmUnit(cgmUnit: String) {
    cgmUnitIndex = (cgmUnit == "mg/dL" ? 1 : 0)
  }

  internal func getWeatherOnOff() -> String {
    return weatherOnOff
  }

  internal func setWeatherOnOff(pWeatherOnOff: String) {
      weatherOnOff = pWeatherOnOff
  }

  internal func getNotificationOnOff() -> String {
    return notificationOnOff
  }

  internal func setNotificationOnOff(pNotificationOnOff: String) {
    notificationOnOff = pNotificationOnOff
  }

  public func getWeatherUnit() -> Int {
    return weatherUnit
  }

  public func setWeatherUnit(pWeatherUnit: Int) {
      weatherUnit = pWeatherUnit
  }

}
