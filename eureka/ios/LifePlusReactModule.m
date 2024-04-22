//
//  dbTunnel.m
//  LifePlus
//
//  Created by work on 15/09/20.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(LifePlusReactModule, RCTEventEmitter)
  RCT_EXTERN_METHOD(dbTunnel: (NSString)pRequest
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )
  RCT_EXTERN_METHOD(dbTunnelForMultipleQueries: (NSString)pRequest
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )
  RCT_EXTERN_METHOD(startInstantMeasure: (RCTPromiseResolveBlock)resolve
                    rejecter: (RCTPromiseRejectBlock)reject)
  RCT_EXTERN_METHOD(deviceConnect: (NSString)pRequest
                    resolver: (RCTPromiseResolveBlock)resolve
                    rejecter: (RCTPromiseRejectBlock)reject
                    )
  RCT_EXTERN_METHOD(appSync: (NSString)pRequest
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )
  RCT_EXTERN_METHOD(calibrate: (NSString)pRequest
                resolver: (RCTPromiseResolveBlock)resolve
                rejecter: (RCTPromiseRejectBlock)reject
                )
  RCT_EXTERN_METHOD(disconnect: (RCTPromiseResolveBlock)resolve
                rejecter: (RCTPromiseRejectBlock)reject
                )
  RCT_EXTERN_METHOD(apiError: (NSString)pRequest
              resolver: (RCTPromiseResolveBlock)resolve
              rejecter: (RCTPromiseRejectBlock)reject
              )
  RCT_EXTERN_METHOD(startDfuMode: (RCTPromiseResolveBlock)resolve
              rejecter: (RCTPromiseRejectBlock)reject
              )
  RCT_EXTERN_METHOD(startFirmwareUpdate: (NSString)pRequest
            resolver: (RCTPromiseResolveBlock)resolve
            rejecter: (RCTPromiseRejectBlock)reject
            )
  RCT_EXTERN_METHOD(updateDailyStepGoal: (RCTPromiseResolveBlock)resolve
            rejecter: (RCTPromiseRejectBlock)reject
            )
RCT_EXTERN_METHOD(displayImage: (NSString)base64String
                resolver: (RCTPromiseResolveBlock)resolve
                rejecter: (RCTPromiseRejectBlock)reject
                )
@end
