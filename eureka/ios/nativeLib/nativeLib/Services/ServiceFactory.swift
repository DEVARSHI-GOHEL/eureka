//
//  ServiceFactory.swift
//  LPClient
//
//  Created by Andrey Filyakov on 18.02.2021.
//

public class ServiceFactory {
    private static var deviceService = DeviceService()
    private static let deviceRepository = DeviceRepository()
    private static var calendarService: ICalendarService? = nil
    private static var weatherService: IService? = nil
    
    public static func getDeviceService() -> IDeviceService {
        return deviceService
    }
    
    internal static func setDeviceService(deviceService: DeviceService) {
        ServiceFactory.deviceService = deviceService
    }
    
    static func getDeviceRepository() -> IDeviceRepository {
        return deviceRepository
    }
    
    static func getCalendarService() -> ICalendarService? {
        return calendarService
    }
    public static func setCalendarService(calendarService: ICalendarService) {
        ServiceFactory.calendarService = calendarService
    }
    
    static func getWeatherService() -> IService? {
        return weatherService
    }
    public static func setWeatherService(weatherService: IService) {
        ServiceFactory.weatherService = weatherService
    }
}
