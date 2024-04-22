//
//  VerifyAppResponse.swift
//  
//
//  Created by Peter Ertl on 02/09/2021.
//

struct VerifyAppResponse: Equatable {
    var status: ResponseStatus
    var result: Bool
    
    init(status: ResponseStatus = .success, result: Bool) {
        self.status = status
        self.result = result
    }
    
    init?(_ response: Response) {
        guard response.data.count == 1, response.data[0] <= 1 else {
            return nil
        }
        self.status = response.status
        self.result = response.data[0] == 1
    }
}
