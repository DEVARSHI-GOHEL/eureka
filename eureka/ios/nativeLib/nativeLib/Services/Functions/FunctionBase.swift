//
//  FunctionBase.swift
//  eureka
//
//  Created by work on 06/03/21.
//

import Foundation

public class FunctionBase {
  internal var params:[String:Any?] = [:]
  
  internal init(_ pParams:[String:Any?]) {
    params = pParams
  }
  
  internal init(_ pParams:[String:Any?], currentProc: BleProcEnum) {
    params = pParams
  }
  
  internal init(_ pParams:[String:Any?], pNewProcState: BleProcStateEnum?) {
    params = pParams
    setProcState(nil, pNewProcState: pNewProcState)
  }
  
  internal init(_ pParams:[String:Any?], pNewProc: BleProcEnum?, pNewProcState: BleProcStateEnum?) {
    params = pParams
    setProcState(pNewProc, pNewProcState: pNewProcState)
  }
  
  internal init(_ pNewProc: BleProcEnum?, pNewProcState: BleProcStateEnum?) {
    setProcState(pNewProc, pNewProcState: pNewProcState)
  }
  
  
  internal init(_ pNewProcState: BleProcStateEnum?) {
    setProcState(nil, pNewProcState: pNewProcState)
  }
  
  private func setProcState(_ pNewProc: BleProcEnum?, pNewProcState: BleProcStateEnum?) {
    if let mNewProc = pNewProc {
      DeviceService.setCurrentProcState(mNewProc, pCurrentProcState: pNewProcState)
    } else {
      DeviceService.setCurrentProcState(DeviceService.currentProc, pCurrentProcState: pNewProcState)
    }
  }
  
  internal func doOperation() -> Any? {
    return nil
  }
}
