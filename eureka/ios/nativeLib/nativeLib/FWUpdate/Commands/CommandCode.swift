//
//  CommandCode.swift
//  
//
//  Created by Peter Ertl on 26/08/2021.
//

enum CommandCode: UInt8 {
    case verifyApp = 0x31,
         getFlashSize = 0x32,
         getAppStatus = 0x33,
         syncDFU = 0x35,
         setActiveApp = 0x36,
         sendData = 0x37,
         enterDFU = 0x38,
         programRow = 0x39,
         verifyRow = 0x3A,
         exitDFU = 0x3B,
         getMetadata = 0x3C,
         eraseData = 0x44,
         sendDataWithoutResponse = 0x47,
         programData = 0x49,
         verifyData = 0x4A,
         setAppMetadata = 0x4C,
         setEIV = 0x4D,
         postSyncEnterDFU = 0xFF
}
