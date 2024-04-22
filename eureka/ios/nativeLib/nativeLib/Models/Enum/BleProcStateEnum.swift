//
//  BleProcStateEnum.swift
//  BLEDemo
//

import Foundation

public enum BleProcStateEnum {
  // Common states
  case UNKNOWN
  case NONE
  case FIRE_COMMAND
  case READ_VITAL

  // Connect states
  case CHECK_PAIRED
  case SCAN
  case CONNECT_GATT
  case DISCOVER_GATT
  case SUBSCRIBE_INDICATION
  case SET_DATETIME
  case SET_TIMEZONE
  case SET_STEP_GOAL
  case READ_WATCH_STATUS
  case OFFLINE_SYNC_START   // ("Offline sync start", 50),
  case OFFLINE_SYNC_PREV    // ("Offline sync continue", 2100),

  // Measure states
  case MEASURE_START
  case CHECK_MEASURE_ON
  case CHECK_MEASURE_PRECONDITION
  case MEASURE_COMMAND_FIRED
  case VITAL_PREVIOUS_READ_COMMAND_FIRED
  case VITAL_READ_COMMAND_FIRED
  case PROCESS_VITAL_DATA
  case INSTAT_MEASURE_COMPLETED
  case SET_MEASURE_CALC_BEFORE
  case SET_MEASURE_CALC_AFTER

  // AppSync states
  case APP_SYNC_WRITE

  // Calibration states
  case CALIBRATION_REFERENCE_WRITE
  case CALIBRATION_START
  
  //Read raw data states
  case READ_RAW_FIRST
  case READ_RAW_NEXT
  case READ_RAW_PREV
  case READ_RAW_LAST

  case READ_RAW_DATA
  case PROCESS_RAW_DATA
  case COMMAND_RAW_DATA_2
  case READ_RAW_DATA_2
  case PROCESS_RAW_DATA_2

  // Meal data states
  case MEAL_DATA_GET_LAST_MEAL
  case MEAL_DATA_GET_PREVIOUS_MEAL
  case MEAL_DATA_READ
  case MEAL_DATA_PROCESS
  
  // Step count states
  case STEP_COUNT_GET_LAST_MEAL
  case STEP_COUNT_READ
  case STEP_COUNT_PROCESS
    
  // Firmware udpate
  case FIRMWARE_UPDATE_INITIATE_DFU
  case FIRMWARE_UPDATE_SCAN_FOR_DFU_DEVICE
  case FIRMWARE_UPDATE_CONNECT_DFU_DEVICE
  case FIRMWARE_UPDATE_BOND_DFU_DEVICE
  case FIRMWARE_UPDATE_START
    
  // Firmware revision
  case FIRMWARE_REVISION_READ
}
