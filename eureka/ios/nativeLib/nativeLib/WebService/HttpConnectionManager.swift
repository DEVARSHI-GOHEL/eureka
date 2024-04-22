//
//  HttpConnectionManager.swift
//  eureka
//
//  Created by work on 14/02/21.
//

import Foundation

public class HttpConnectionManager {

  public class func openWheather(pLat:String, pLng:String, pUnit:String, onSuccess: @escaping ([String:Any]) -> Void) {
    let strUrl:String = "https://api.openweathermap.org/data/3.0/onecall?appid=5dda89eaa61f71e16049178d932ddafc&lat=\(pLat)&lon=\(pLng)&exclude=minutely,alerts&units=\(pUnit)"
    let session = URLSession.shared
    if let mURL = NSURL(string: strUrl) {
      let request = NSMutableURLRequest(url: mURL as URL)
      request.httpMethod = "GET"
      request.addValue("Host", forHTTPHeaderField: "api.openweathermap.org")

      request.timeoutInterval = 25
  //    connection.setConnectTimeout(105000)

      let task = session.dataTask(with: request as URLRequest as URLRequest, completionHandler: {(data, response, error) in
        if let response = response {
          let nsHTTPResponse = response as! HTTPURLResponse
          let statusCode = nsHTTPResponse.statusCode
          print ("status code = \(statusCode)")
        }
        if let error = error {
          LpLogger.logError(LoggerStruct("performPost", pFileName: "HttpConnectionManager", pEventDescription: error.localizedDescription))
          print ("\(error.localizedDescription)")
        }
        if let data = data {
          do{
            if let jsonResponse = try JSONSerialization.jsonObject(with: data, options: []) as? [String:Any] {
              LpLogger.logInfo(LoggerStruct("performPost", pFileName: "HttpConnectionManager", pEventDescription: "\(jsonResponse)"))
              print ("data = \(jsonResponse)")
              onSuccess(jsonResponse)
            }
          }catch _ {
            LpLogger.logError(LoggerStruct("performPost", pFileName: "HttpConnectionManager", pEventDescription: "OOps not good JSON formatted response"))
            print ("OOps not good JSON formatted response")
          }
        } else {
          LpLogger.logError(LoggerStruct("performPost", pFileName: "HttpConnectionManager", pEventDescription: "OOps null response"))
        }
      })

      task.resume()
    }
  }

}
