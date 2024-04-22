//
//  EnterDFUResponse.swift
//  
//
//  Created by Peter Ertl on 02/09/2021.
//

struct EnterDFUResponse: Equatable {
    var status: ResponseStatus
    var siliconId: UInt32
    var siliconRevision: UInt8
    var sdkVersion: [UInt8]
    
    init(status: ResponseStatus = .success,
         siliconId: UInt32,
         siliconRevision: UInt8,
         sdkVersion: [UInt8]) {
        self.status = status
        self.siliconId = siliconId
        self.siliconRevision = siliconRevision
        self.sdkVersion = sdkVersion
    }
    
    init?(_ response: Response) {
        guard response.data.count == 8 else {
            return nil
        }
        self.status = response.status
        self.siliconId = UInt32(littleEndianBytes: response.data.prefix(4))
        self.siliconRevision = response.data[4]
        self.sdkVersion = Array(response.data.suffix(3))
    }
}
