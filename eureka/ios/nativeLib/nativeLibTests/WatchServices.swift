//
//  WatchServices.swift
//  nativeLibTests
//
//  Created by Eugene Krivenja on 05.10.2021.
//

import Foundation
import CoreBluetoothMock
@testable import nativeLib

let alertService = CBMServiceMock(
    type: CBUUID(string: GattServiceEnum.IMMEDIATE_ALERT_SERVICE.code),
    primary: false,
    characteristics: CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.ALERT_LEVEL.code),
        properties: [.write]
    )
)

let currentTimeService = CBMServiceMock(
    type: CBUUID(string: GattServiceEnum.CURR_TIME_SERVICE.code),
    primary: false,
    characteristics: CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.LOCAL_TIME_INFORMATION.code),
        properties: [.write]
    ), CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.CURRENT_TIME.code),
        properties: [.write]
    )
)

let tinyCustomService = CBMServiceMock(
    type: CBUUID(string: GattServiceEnum.CUSTOM_SERVICE.code),
    primary: false,
    characteristics: CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.STATUS.code),
        properties: [.read, .indicate],
        descriptors: CBMDescriptorMock(
            type: CBUUID(string: GattCharEnum.STATUS.code)
        )
    )
)

let deviceInformationService = CBMServiceMock(
    type: CBUUID(string: GattServiceEnum.DEVICE_INFORMATION_SERVICE.code),
    primary: false,
    characteristics: CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.FIRMWARE_REVISION.code),
        properties: [.read, .indicate],
        descriptors: CBMDescriptorMock(
            type: CBUUID(string: GattCharEnum.FIRMWARE_REVISION.code)
        )
    )
)

let customService = CBMServiceMock(
    type: CBUUID(string: GattServiceEnum.CUSTOM_SERVICE.code),
    primary: false,
    characteristics: CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.STATUS.code),
        properties: [.read, .indicate],
        descriptors: CBMDescriptorMock(
            type: CBUUID(string: GattCharEnum.STATUS.code)
        )
    ), CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.MEAL_DATA.code),
        properties: [.read],
        descriptors: CBMDescriptorMock(
            type: CBUUID(string: GattCharEnum.MEAL_DATA.code)
        )
    ), CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.STEP_COUNTER.code),
        properties: [.read],
        descriptors: CBMDescriptorMock(
            type: CBUUID(string: GattCharEnum.STEP_COUNTER.code)
        )
    ), CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.USER_DATA.code),
        properties: [.read, .write],
        descriptors: CBMDescriptorMock(
            type: CBUUID(string: GattCharEnum.USER_DATA.code)
        )
    ), CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.COMMAND.code),
        properties: [.write]
    ), CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.NOTIFICATION.code),
        properties: [.write]
    ), CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.VITAL_DATA.code),
        properties: [.read]
    ), CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.RAW_DATA.code),
        properties: [.read]
    ), CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.LAST_MEASURE_TIME.code),
        properties: [.read]
    ), CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.WEATHER.code),
        properties: [.write]
    ), CBMCharacteristicMock(
        type: CBUUID(string: GattCharEnum.REFERENCE_VITAL_DATA.code),
        properties: [.read, .write]
    )
)

let customServiceWithoutReferenceChar = CBMServiceMock(
    type: CBUUID(string: GattServiceEnum.CUSTOM_SERVICE.code),
    primary: false,
    characteristics: customService.characteristics?.map({ char in
        char as! CBMCharacteristicMock
    }).dropLast()
)
