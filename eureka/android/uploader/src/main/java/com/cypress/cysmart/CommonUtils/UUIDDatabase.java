/*
 * (c) 2014-2020, Cypress Semiconductor Corporation or a subsidiary of 
 * Cypress Semiconductor Corporation.  All rights reserved.
 * 
 * This software, including source code, documentation and related 
 * materials ("Software"),  is owned by Cypress Semiconductor Corporation 
 * or one of its subsidiaries ("Cypress") and is protected by and subject to 
 * worldwide patent protection (United States and foreign), 
 * United States copyright laws and international treaty provisions.  
 * Therefore, you may use this Software only as provided in the license 
 * agreement accompanying the software package from which you 
 * obtained this Software ("EULA").
 * If no EULA applies, Cypress hereby grants you a personal, non-exclusive, 
 * non-transferable license to copy, modify, and compile the Software 
 * source code solely for use in connection with Cypress's 
 * integrated circuit products.  Any reproduction, modification, translation, 
 * compilation, or representation of this Software except as specified 
 * above is prohibited without the express written permission of Cypress.
 * 
 * Disclaimer: THIS SOFTWARE IS PROVIDED AS-IS, WITH NO WARRANTY OF ANY KIND, 
 * EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, NONINFRINGEMENT, IMPLIED 
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. Cypress 
 * reserves the right to make changes to the Software without notice. Cypress 
 * does not assume any liability arising out of the application or use of the 
 * Software or any product or circuit described in the Software. Cypress does 
 * not authorize its products for use in any products where a malfunction or 
 * failure of the Cypress product may reasonably be expected to result in 
 * significant property damage, injury or death ("High Risk Product"). By 
 * including Cypress's product in a High Risk Product, the manufacturer 
 * of such system or application assumes all risk of such use and in doing 
 * so agrees to indemnify Cypress against all liability.
 */

package com.cypress.cysmart.CommonUtils;

/**
 * This class will store the UUID of the GATT services and characteristics
 */
public class UUIDDatabase {
    /**
     * Heart rate related UUID
     */
    public final static java.util.UUID UUID_HEART_RATE_SERVICE = java.util.UUID
            .fromString(GattAttributes.HEART_RATE_SERVICE);
    public final static java.util.UUID UUID_HEART_RATE_MEASUREMENT = java.util.UUID
            .fromString(GattAttributes.HEART_RATE_MEASUREMENT);
    public final static java.util.UUID UUID_BODY_SENSOR_LOCATION = java.util.UUID
            .fromString(GattAttributes.BODY_SENSOR_LOCATION);

    /**
     * Device Information Service
     */
    public final static java.util.UUID UUID_DEVICE_INFORMATION_SERVICE = java.util.UUID
            .fromString(GattAttributes.DEVICE_INFORMATION_SERVICE);
    public static final java.util.UUID UUID_MANUFACTURER_NAME = java.util.UUID
            .fromString(GattAttributes.MANUFACTURER_NAME);
    public static final java.util.UUID UUID_MODEL_NUMBER = java.util.UUID
            .fromString(GattAttributes.MODEL_NUMBER);
    public static final java.util.UUID UUID_SERIAL_NUMBER = java.util.UUID
            .fromString(GattAttributes.SERIAL_NUMBER);
    public static final java.util.UUID UUID_HARDWARE_REVISION = java.util.UUID
            .fromString(GattAttributes.HARDWARE_REVISION);
    public static final java.util.UUID UUID_FIRMWARE_REVISION = java.util.UUID
            .fromString(GattAttributes.FIRMWARE_REVISION);
    public static final java.util.UUID UUID_SOFTWARE_REVISION = java.util.UUID
            .fromString(GattAttributes.SOFTWARE_REVISION);
    public final static java.util.UUID UUID_SYSTEM_ID = java.util.UUID
            .fromString(GattAttributes.SYSTEM_ID);
    public static final java.util.UUID UUID_REGULATORY_CERTIFICATION_DATA_LIST = java.util.UUID
            .fromString(GattAttributes.REGULATORY_CERTIFICATION_DATA_LIST);
    public static final java.util.UUID UUID_PNP_ID = java.util.UUID
            .fromString(GattAttributes.UUID_PNP_ID);

    /**
     * Health thermometer related UUID
     */
    public final static java.util.UUID UUID_HEALTH_THERMOMETER_SERVICE = java.util.UUID
            .fromString(GattAttributes.HEALTH_THERMOMETER_SERVICE);
    public final static java.util.UUID UUID_TEMPERATURE_MEASUREMENT = java.util.UUID
            .fromString(GattAttributes.TEMPERATURE_MEASUREMENT);
    public final static java.util.UUID UUID_TEMPERATURE_TYPE = java.util.UUID
            .fromString(GattAttributes.TEMPERATURE_TYPE);
    public final static java.util.UUID UUID_INTERMEDIATE_TEMPERATURE = java.util.UUID
            .fromString(GattAttributes.INTERMEDIATE_TEMPERATURE);
    public final static java.util.UUID UUID_MEASUREMENT_INTERVAL = java.util.UUID
            .fromString(GattAttributes.MEASUREMENT_INTERVAL);

    /**
     * Battery Level related uuid
     */
    public final static java.util.UUID UUID_BATTERY_SERVICE = java.util.UUID
            .fromString(GattAttributes.BATTERY_SERVICE);
    public final static java.util.UUID UUID_BATTERY_LEVEL = java.util.UUID
            .fromString(GattAttributes.BATTERY_LEVEL);

    /**
     * Find me related uuid
     */
    public final static java.util.UUID UUID_IMMEDIATE_ALERT_SERVICE = java.util.UUID
            .fromString(GattAttributes.IMMEDIATE_ALERT_SERVICE);
    public final static java.util.UUID UUID_TRANSMISSION_POWER_SERVICE = java.util.UUID
            .fromString(GattAttributes.TRANSMISSION_POWER_SERVICE);
    public final static java.util.UUID UUID_ALERT_LEVEL = java.util.UUID
            .fromString(GattAttributes.ALERT_LEVEL);
    public final static java.util.UUID UUID_TRANSMISSION_POWER_LEVEL = java.util.UUID
            .fromString(GattAttributes.TX_POWER_LEVEL);
    public final static java.util.UUID UUID_LINK_LOSS_SERVICE = java.util.UUID
            .fromString(GattAttributes.LINK_LOSS_SERVICE);

    /**
     * CapSense related uuid
     */
    public final static java.util.UUID UUID_CAPSENSE_SERVICE = java.util.UUID
            .fromString(GattAttributes.CAPSENSE_SERVICE);
    public final static java.util.UUID UUID_CAPSENSE_SERVICE_CUSTOM = java.util.UUID
            .fromString(GattAttributes.CAPSENSE_SERVICE_CUSTOM);
    public final static java.util.UUID UUID_CAPSENSE_PROXIMITY = java.util.UUID
            .fromString(GattAttributes.CAPSENSE_PROXIMITY);
    public final static java.util.UUID UUID_CAPSENSE_SLIDER = java.util.UUID
            .fromString(GattAttributes.CAPSENSE_SLIDER);
    public final static java.util.UUID UUID_CAPSENSE_BUTTONS = java.util.UUID
            .fromString(GattAttributes.CAPSENSE_BUTTONS);
    public final static java.util.UUID UUID_CAPSENSE_PROXIMITY_CUSTOM = java.util.UUID
            .fromString(GattAttributes.CAPSENSE_PROXIMITY_CUSTOM);
    public final static java.util.UUID UUID_CAPSENSE_SLIDER_CUSTOM = java.util.UUID
            .fromString(GattAttributes.CAPSENSE_SLIDER_CUSTOM);
    public final static java.util.UUID UUID_CAPSENSE_BUTTONS_CUSTOM = java.util.UUID
            .fromString(GattAttributes.CAPSENSE_BUTTONS_CUSTOM);
    /**
     * RGB LED related uuid
     */
    public final static java.util.UUID UUID_RGB_LED_SERVICE = java.util.UUID
            .fromString(GattAttributes.RGB_LED_SERVICE);
    public final static java.util.UUID UUID_RGB_LED = java.util.UUID
            .fromString(GattAttributes.RGB_LED);
    public final static java.util.UUID UUID_RGB_LED_SERVICE_CUSTOM = java.util.UUID
            .fromString(GattAttributes.RGB_LED_SERVICE_CUSTOM);
    public final static java.util.UUID UUID_RGB_LED_CUSTOM = java.util.UUID
            .fromString(GattAttributes.RGB_LED_CUSTOM);

    /**
     * GlucoseService related uuid
     */
    public final static java.util.UUID UUID_GLUCOSE_MEASUREMENT = java.util.UUID
            .fromString(GattAttributes.GLUCOSE_MEASUREMENT);
    public final static java.util.UUID UUID_GLUCOSE_SERVICE = java.util.UUID
            .fromString(GattAttributes.GLUCOSE_SERVICE);
    public final static java.util.UUID UUID_GLUCOSE_MEASUREMENT_CONTEXT = java.util.UUID
            .fromString(GattAttributes.GLUCOSE_MEASUREMENT_CONTEXT);
    public final static java.util.UUID UUID_GLUCOSE_FEATURE = java.util.UUID
            .fromString(GattAttributes.GLUCOSE_FEATURE);
    public final static java.util.UUID UUID_RECORD_ACCESS_CONTROL_POINT = java.util.UUID
            .fromString(GattAttributes.RECORD_ACCESS_CONTROL_POINT);
    /**
     * Blood pressure related uuid
     */
    public final static java.util.UUID UUID_BLOOD_PRESSURE_SERVICE = java.util.UUID
            .fromString(GattAttributes.BLOOD_PRESSURE_SERVICE);
    public final static java.util.UUID UUID_BLOOD_PRESSURE_MEASUREMENT = java.util.UUID
            .fromString(GattAttributes.BLOOD_PRESSURE_MEASUREMENT);
    public final static java.util.UUID UUID_BLOOD_INTERMEDIATE_CUFF_PRESSURE = java.util.UUID
            .fromString(GattAttributes.BLOOD_INTERMEDIATE_CUFF_PRESSURE);
    public final static java.util.UUID UUID_BLOOD_PRESSURE_FEATURE = java.util.UUID
            .fromString(GattAttributes.BLOOD_PRESSURE_FEATURE);
    /**
     * Running Speed & Cadence related uuid
     */
    public final static java.util.UUID UUID_RSC_MEASURE = java.util.UUID
            .fromString(GattAttributes.RSC_MEASUREMENT);
    public final static java.util.UUID UUID_RSC_SERVICE = java.util.UUID
            .fromString(GattAttributes.RSC_SERVICE);
    public final static java.util.UUID UUID_RSC_FEATURE = java.util.UUID
            .fromString(GattAttributes.RSC_FEATURE);
    public final static java.util.UUID UUID_SC_CONTROL_POINT = java.util.UUID
            .fromString(GattAttributes.SC_CONTROL_POINT);
    public final static java.util.UUID UUID_SC_SENSOR_LOCATION = java.util.UUID
            .fromString(GattAttributes.SC_SENSOR_LOCATION);


    /**
     * Cycling Speed & Cadence related uuid
     */
    public final static java.util.UUID UUID_CSC_SERVICE = java.util.UUID
            .fromString(GattAttributes.CSC_SERVICE);
    public final static java.util.UUID UUID_CSC_MEASURE = java.util.UUID
            .fromString(GattAttributes.CSC_MEASUREMENT);
    public final static java.util.UUID UUID_CSC_FEATURE = java.util.UUID
            .fromString(GattAttributes.CSC_FEATURE);

    /**
     * Barometer related uuid
     */
    public final static java.util.UUID UUID_BAROMETER_SERVICE = java.util.UUID
            .fromString(GattAttributes.BAROMETER_SERVICE);
    public final static java.util.UUID UUID_BAROMETER_DIGITAL_SENSOR = java.util.UUID
            .fromString(GattAttributes.BAROMETER_DIGITAL_SENSOR);
    public final static java.util.UUID UUID_BAROMETER_SENSOR_SCAN_INTERVAL = java.util.UUID
            .fromString(GattAttributes.BAROMETER_SENSOR_SCAN_INTERVAL);
    public final static java.util.UUID UUID_BAROMETER_THRESHOLD_FOR_INDICATION = java.util.UUID
            .fromString(GattAttributes.BAROMETER_THRESHOLD_FOR_INDICATION);
    public final static java.util.UUID UUID_BAROMETER_DATA_ACCUMULATION = java.util.UUID
            .fromString(GattAttributes.BAROMETER_DATA_ACCUMULATION);
    public final static java.util.UUID UUID_BAROMETER_READING = java.util.UUID
            .fromString(GattAttributes.BAROMETER_READING);
    /**
     * Accelerometer related uuid
     */
    public final static java.util.UUID UUID_ACCELEROMETER_SERVICE = java.util.UUID
            .fromString(GattAttributes.ACCELEROMETER_SERVICE);
    public final static java.util.UUID UUID_ACCELEROMETER_ANALOG_SENSOR = java.util.UUID
            .fromString(GattAttributes.ACCELEROMETER_ANALOG_SENSOR);
    public final static java.util.UUID UUID_ACCELEROMETER_DATA_ACCUMULATION = java.util.UUID
            .fromString(GattAttributes.ACCELEROMETER_DATA_ACCUMULATION);
    public final static java.util.UUID UUID_ACCELEROMETER_READING_X = java.util.UUID
            .fromString(GattAttributes.ACCELEROMETER_READING_X);
    public final static java.util.UUID UUID_ACCELEROMETER_READING_Y = java.util.UUID
            .fromString(GattAttributes.ACCELEROMETER_READING_Y);
    public final static java.util.UUID UUID_ACCELEROMETER_READING_Z = java.util.UUID
            .fromString(GattAttributes.ACCELEROMETER_READING_Z);
    public final static java.util.UUID UUID_ACCELEROMETER_SENSOR_SCAN_INTERVAL = java.util.UUID
            .fromString(GattAttributes.ACCELEROMETER_SENSOR_SCAN_INTERVAL);
    /**
     * Analog temperature  related uuid
     */
    public final static java.util.UUID UUID_ANALOG_TEMPERATURE_SERVICE = java.util.UUID
            .fromString(GattAttributes.ANALOG_TEMPERATURE_SERVICE);
    public final static java.util.UUID UUID_TEMPERATURE_ANALOG_SENSOR = java.util.UUID
            .fromString(GattAttributes.TEMPERATURE_ANALOG_SENSOR);
    public final static java.util.UUID UUID_TEMPERATURE_READING = java.util.UUID
            .fromString(GattAttributes.TEMPERATURE_READING);
    public final static java.util.UUID UUID_TEMPERATURE_SENSOR_SCAN_INTERVAL = java.util.UUID
            .fromString(GattAttributes.TEMPERATURE_SENSOR_SCAN_INTERVAL);

    /**
     * RDK related UUID
     */
    public final static java.util.UUID UUID_REPORT = java.util.UUID
            .fromString(GattAttributes.REPORT);

    /**
     * OTA related UUID
     */
    public final static java.util.UUID UUID_OTA_UPDATE_SERVICE = java.util.UUID
            .fromString(GattAttributes.OTA_UPDATE_SERVICE);
    public final static java.util.UUID UUID_OTA_UPDATE_CHARACTERISTIC = java.util.UUID
            .fromString(GattAttributes.OTA_CHARACTERISTIC);

    /**
     * Descriptor UUID
     */
    public final static java.util.UUID UUID_CLIENT_CHARACTERISTIC_CONFIG = java.util.UUID
            .fromString(GattAttributes.CLIENT_CHARACTERISTIC_CONFIG);
    public final static java.util.UUID UUID_CHARACTERISTIC_EXTENDED_PROPERTIES = java.util.UUID
            .fromString(GattAttributes.CHARACTERISTIC_EXTENDED_PROPERTIES);
    public final static java.util.UUID UUID_CHARACTERISTIC_USER_DESCRIPTION = java.util.UUID
            .fromString(GattAttributes.CHARACTERISTIC_USER_DESCRIPTION);
    public final static java.util.UUID UUID_SERVER_CHARACTERISTIC_CONFIGURATION = java.util.UUID
            .fromString(GattAttributes.SERVER_CHARACTERISTIC_CONFIGURATION);
    public final static java.util.UUID UUID_REPORT_REFERENCE = java.util.UUID
            .fromString(GattAttributes.REPORT_REFERENCE);
    public final static java.util.UUID UUID_CHARACTERISTIC_PRESENTATION_FORMAT = java.util.UUID
            .fromString(GattAttributes.CHARACTERISTIC_PRESENTATION_FORMAT);

    /**
     * GATT related UUID
     */
    public final static java.util.UUID UUID_GENERIC_ACCESS_SERVICE = java.util.UUID
            .fromString(GattAttributes.GENERIC_ACCESS_SERVICE);
    public final static java.util.UUID UUID_GENERIC_ATTRIBUTE_SERVICE = java.util.UUID
            .fromString(GattAttributes.GENERIC_ATTRIBUTE_SERVICE);
    public final static java.util.UUID UUID_SERVICE_CHANGED = java.util.UUID
            .fromString(GattAttributes.SERVICE_CHANGED);

    /**
     * HID UUID
     */
    public final static java.util.UUID UUID_HID_SERVICE = java.util.UUID
            .fromString(GattAttributes.HUMAN_INTERFACE_DEVICE_SERVICE);
    public final static java.util.UUID UUID_PROTOCOL_MODE = java.util.UUID
            .fromString(GattAttributes.PROTOCOL_MODE);
    public final static java.util.UUID UUID_REPORT_MAP = java.util.UUID
            .fromString(GattAttributes.REPORT_MAP);
    public final static java.util.UUID UUID_BOOT_KEYBOARD_INPUT_REPORT = java.util.UUID
            .fromString(GattAttributes.BOOT_KEYBOARD_INPUT_REPORT);
    public final static java.util.UUID UUID_BOOT_KEYBOARD_OUTPUT_REPORT = java.util.UUID
            .fromString(GattAttributes.BOOT_KEYBOARD_OUTPUT_REPORT);
    public final static java.util.UUID UUID_BOOT_MOUSE_INPUT_REPORT = java.util.UUID
            .fromString(GattAttributes.BOOT_MOUSE_INPUT_REPORT);
    public final static java.util.UUID UUID_HID_CONTROL_POINT = java.util.UUID
            .fromString(GattAttributes.HID_CONTROL_POINT);
    public final static java.util.UUID UUID_HID_INFORMATION = java.util.UUID
            .fromString(GattAttributes.HID_INFORMATION);
    public final static java.util.UUID UUID_OTA_CHARACTERISTIC = java.util.UUID
            .fromString(GattAttributes.OTA_CHARACTERISTIC);

    /**
     * Alert Notification UUID
     */
    public final static java.util.UUID UUID_ALERT_NOTIFICATION_SERVICE = java.util.UUID
            .fromString(GattAttributes.ALERT_NOTIFICATION_SERVICE);
    /**
     * Unused Service UUID's
     */
    public final static java.util.UUID UUID_BODY_COMPOSITION_SERVICE = java.util.UUID
            .fromString(GattAttributes.BODY_COMPOSITION_SERVICE);
    public final static java.util.UUID UUID_BOND_MANAGEMENT_SERVICE = java.util.UUID
            .fromString(GattAttributes.BOND_MANAGEMENT_SERVICE);
    public final static java.util.UUID UUID_CONTINUOUS_GLUCOSE_MONITORING_SERVICE = java.util.UUID
            .fromString(GattAttributes.CONTINUOUS_GLUCOSE_MONITORING_SERVICE);
    public final static java.util.UUID UUID_CURRENT_TIME_SERVICE = java.util.UUID
            .fromString(GattAttributes.CURRENT_TIME_SERVICE);
    public final static java.util.UUID UUID_CYCLING_POWER_SERVICE = java.util.UUID
            .fromString(GattAttributes.CYCLING_POWER_SERVICE);
    public final static java.util.UUID UUID_ENVIRONMENTAL_SENSING_SERVICE = java.util.UUID
            .fromString(GattAttributes.ENVIRONMENTAL_SENSING_SERVICE);
    public final static java.util.UUID UUID_LOCATION_NAVIGATION_SERVICE = java.util.UUID
            .fromString(GattAttributes.LOCATION_NAVIGATION_SERVICE);
    public final static java.util.UUID UUID_NEXT_DST_CHANGE_SERVICE = java.util.UUID
            .fromString(GattAttributes.NEXT_DST_CHANGE_SERVICE);
    public final static java.util.UUID UUID_PHONE_ALERT_STATUS_SERVICE = java.util.UUID
            .fromString(GattAttributes.PHONE_ALERT_STATUS_SERVICE);
    public final static java.util.UUID UUID_REFERENCE_TIME_UPDATE_SERVICE = java.util.UUID
            .fromString(GattAttributes.REFERENCE_TIME_UPDATE_SERVICE);
    public final static java.util.UUID UUID_SCAN_PARAMETERS_SERVICE = java.util.UUID
            .fromString(GattAttributes.SCAN_PARAMETERS_SERVICE);
    public final static java.util.UUID UUID_USER_DATA_SERVICE = java.util.UUID
            .fromString(GattAttributes.USER_DATA_SERVICE);
    public final static java.util.UUID UUID_WEIGHT = java.util.UUID
            .fromString(GattAttributes.WEIGHT);
    public final static java.util.UUID UUID_WEIGHT_SCALE_SERVICE = java.util.UUID
            .fromString(GattAttributes.WEIGHT_SCALE_SERVICE);
    public final static java.util.UUID UUID_HEART_RATE_CONTROL_POINT = java.util.UUID
            .fromString(GattAttributes.HEART_RATE_CONTROL_POINT);

    /**
     * Unused Characteristic UUID's
     */
    public final static java.util.UUID UUID_AEROBIC_HEART_RATE_LOWER_LIMIT = java.util.UUID
            .fromString(GattAttributes.AEROBIC_HEART_RATE_LOWER_LIMIT);
    public final static java.util.UUID UUID_AEROBIC_HEART_RATE_UPPER_LIMIT = java.util.UUID
            .fromString(GattAttributes.AEROBIC_HEART_RATE_UPPER_LIMIT);
    public final static java.util.UUID UUID_AGE = java.util.UUID
            .fromString(GattAttributes.AGE);
    public final static java.util.UUID UUID_ALERT_CATEGORY_ID = java.util.UUID
            .fromString(GattAttributes.ALERT_CATEGORY_ID);
    public final static java.util.UUID UUID_ALERT_CATEGORY_ID_BIT_MASK = java.util.UUID
            .fromString(GattAttributes.ALERT_CATEGORY_ID_BIT_MASK);
    public final static java.util.UUID UUID_ALERT_STATUS = java.util.UUID
            .fromString(GattAttributes.ALERT_STATUS);
    public final static java.util.UUID UUID_ANAEROBIC_HEART_RATE_LOWER_LIMIT = java.util.UUID
            .fromString(GattAttributes.ANAEROBIC_HEART_RATE_LOWER_LIMIT);
    public final static java.util.UUID UUID_ANAEROBIC_HEART_RATE_UPPER_LIMIT = java.util.UUID
            .fromString(GattAttributes.ANAEROBIC_HEART_RATE_UPPER_LIMIT);
    public final static java.util.UUID UUID_ANAEROBIC_THRESHOLD = java.util.UUID
            .fromString(GattAttributes.ANAEROBIC_THRESHOLD);
    public final static java.util.UUID UUID_APPARENT_WIND_DIRECTION = java.util.UUID
            .fromString(GattAttributes.APPARENT_WIND_DIRECTION);
    public final static java.util.UUID UUID_APPARENT_WIND_SPEED = java.util.UUID
            .fromString(GattAttributes.APPARENT_WIND_SPEED);
    public final static java.util.UUID UUID_APPEARANCE = java.util.UUID
            .fromString(GattAttributes.APPEARANCE);
    public final static java.util.UUID UUID_BAROMETRIC_PRESSURE_TREND = java.util.UUID
            .fromString(GattAttributes.BAROMETRIC_PRESSURE_TREND);
    public final static java.util.UUID UUID_BODY_COMPOSITION_FEATURE = java.util.UUID
            .fromString(GattAttributes.BODY_COMPOSITION_FEATURE);
    public final static java.util.UUID UUID_BODY_COMPOSITION_MEASUREMENT = java.util.UUID
            .fromString(GattAttributes.BODY_COMPOSITION_MEASUREMENT);
    public final static java.util.UUID UUID_BOND_MANAGEMENT_CONTROL_POINT = java.util.UUID
            .fromString(GattAttributes.BOND_MANAGEMENT_CONTROL_POINT);
    public final static java.util.UUID UUID_BOND_MANAGEMENT_FEATURE = java.util.UUID
            .fromString(GattAttributes.BOND_MANAGEMENT_FEATURE);
    public final static java.util.UUID UUID_CGM_FEATURE = java.util.UUID
            .fromString(GattAttributes.CGM_FEATURE);
    public final static java.util.UUID UUID_CENTRAL_ADDRESS_RESOLUTION = java.util.UUID
            .fromString(GattAttributes.CENTRAL_ADDRESS_RESOLUTION);
    public final static java.util.UUID UUID_FIRSTNAME = java.util.UUID
            .fromString(GattAttributes.FIRSTNAME);
    public final static java.util.UUID UUID_GUST_FACTOR = java.util.UUID
            .fromString(GattAttributes.GUST_FACTOR);
    public final static java.util.UUID UUID_CGM_MEASUREMENT = java.util.UUID
            .fromString(GattAttributes.CGM_MEASUREMENT);
    public final static java.util.UUID UUID_CGM_SESSION_RUN_TIME = java.util.UUID
            .fromString(GattAttributes.CGM_SESSION_RUN_TIME);
    public final static java.util.UUID UUID_CGM_SESSION_START_TIME = java.util.UUID
            .fromString(GattAttributes.CGM_SESSION_START_TIME);
    public final static java.util.UUID UUID_CGM_SPECIFIC_OPS_CONTROL_POINT = java.util.UUID
            .fromString(GattAttributes.CGM_SPECIFIC_OPS_CONTROL_POINT);
    public final static java.util.UUID UUID_CGM_STATUS = java.util.UUID
            .fromString(GattAttributes.CGM_STATUS);
    public final static java.util.UUID UUID_CYCLING_POWER_CONTROL_POINT = java.util.UUID
            .fromString(GattAttributes.CYCLING_POWER_CONTROL_POINT);
    public final static java.util.UUID UUID_CYCLING_POWER_VECTOR = java.util.UUID
            .fromString(GattAttributes.CYCLING_POWER_VECTOR);
    public final static java.util.UUID UUID_CYCLING_POWER_FEATURE = java.util.UUID
            .fromString(GattAttributes.CYCLING_POWER_FEATURE);
    public final static java.util.UUID UUID_CYCLING_POWER_MEASUREMENT = java.util.UUID
            .fromString(GattAttributes.CYCLING_POWER_MEASUREMENT);
    public final static java.util.UUID UUID_DATABASE_CHANGE_INCREMENT = java.util.UUID
            .fromString(GattAttributes.DATABASE_CHANGE_INCREMENT);
    public final static java.util.UUID UUID_DATE_OF_BIRTH = java.util.UUID
            .fromString(GattAttributes.DATE_OF_BIRTH);
    public final static java.util.UUID UUID_DATE_OF_THRESHOLD_ASSESSMENT = java.util.UUID
            .fromString(GattAttributes.DATE_OF_THRESHOLD_ASSESSMENT);
    public final static java.util.UUID UUID_DATE_TIME = java.util.UUID
            .fromString(GattAttributes.DATE_TIME);
    public final static java.util.UUID UUID_DAY_DATE_TIME = java.util.UUID
            .fromString(GattAttributes.DAY_DATE_TIME);
    public final static java.util.UUID UUID_DAY_OF_WEEK = java.util.UUID
            .fromString(GattAttributes.DAY_OF_WEEK);
    public final static java.util.UUID UUID_DESCRIPTOR_VALUE_CHANGED = java.util.UUID
            .fromString(GattAttributes.DESCRIPTOR_VALUE_CHANGED);
    public final static java.util.UUID UUID_DEVICE_NAME = java.util.UUID
            .fromString(GattAttributes.DEVICE_NAME);
    public final static java.util.UUID UUID_DEW_POINT = java.util.UUID
            .fromString(GattAttributes.DEW_POINT);
    public final static java.util.UUID UUID_DST_OFFSET = java.util.UUID
            .fromString(GattAttributes.DST_OFFSET);
    public final static java.util.UUID UUID_ELEVATION = java.util.UUID
            .fromString(GattAttributes.ELEVATION);
    public final static java.util.UUID UUID_EMAIL_ADDRESS = java.util.UUID
            .fromString(GattAttributes.EMAIL_ADDRESS);
    public final static java.util.UUID UUID_EXACT_TIME_256 = java.util.UUID
            .fromString(GattAttributes.EXACT_TIME_256);
    public final static java.util.UUID UUID_FAT_BURN_HEART_RATE_LOWER_LIMIT = java.util.UUID
            .fromString(GattAttributes.FAT_BURN_HEART_RATE_LOWER_LIMIT);
    public final static java.util.UUID UUID_FAT_BURN_HEART_RATE_UPPER_LIMIT = java.util.UUID
            .fromString(GattAttributes.FAT_BURN_HEART_RATE_UPPER_LIMIT);
    public final static java.util.UUID UUID_FIVE_ZONE_HEART_RATE_LIMITS = java.util.UUID
            .fromString(GattAttributes.FIVE_ZONE_HEART_RATE_LIMITS);
    public final static java.util.UUID UUID_GENDER = java.util.UUID
            .fromString(GattAttributes.GENDER);
    public final static java.util.UUID UUID_HEART_RATE_MAX = java.util.UUID
            .fromString(GattAttributes.HEART_RATE_MAX);
    public final static java.util.UUID UUID_HEAT_INDEX = java.util.UUID
            .fromString(GattAttributes.HEAT_INDEX);
    public final static java.util.UUID UUID_HEIGHT = java.util.UUID
            .fromString(GattAttributes.HEIGHT);
    public final static java.util.UUID UUID_HIP_CIRCUMFERENCE = java.util.UUID
            .fromString(GattAttributes.HIP_CIRCUMFERENCE);
    public final static java.util.UUID UUID_HUMIDITY = java.util.UUID
            .fromString(GattAttributes.HUMIDITY);
    public final static java.util.UUID UUID_INTERMEDIATE_CUFF_PRESSURE = java.util.UUID
            .fromString(GattAttributes.INTERMEDIATE_CUFF_PRESSURE);
    public final static java.util.UUID UUID_IRRADIANCE = java.util.UUID
            .fromString(GattAttributes.IRRADIANCE);
    public final static java.util.UUID UUID_LANGUAGE = java.util.UUID
            .fromString(GattAttributes.LANGUAGE);
    public final static java.util.UUID UUID_LAST_NAME = java.util.UUID
            .fromString(GattAttributes.LAST_NAME);
    public final static java.util.UUID UUID_LN_CONTROL_POINT = java.util.UUID
            .fromString(GattAttributes.LN_CONTROL_POINT);
    public final static java.util.UUID UUID_LN_FEATURE = java.util.UUID
            .fromString(GattAttributes.LN_FEATURE);
    public final static java.util.UUID UUID_LOCAL_TIME_INFORMATION = java.util.UUID
            .fromString(GattAttributes.LOCAL_TIME_INFORMATION);
    public final static java.util.UUID UUID_LOCATION_AND_SPEED = java.util.UUID
            .fromString(GattAttributes.LOCATION_AND_SPEED);
    public final static java.util.UUID UUID_MAGNETIC_DECLINATION = java.util.UUID
            .fromString(GattAttributes.MAGNETIC_DECLINATION);
    public final static java.util.UUID UUID_MAGNETIC_FLUX_DENSITY_2D = java.util.UUID
            .fromString(GattAttributes.MAGNETIC_FLUX_DENSITY_2D);
    public final static java.util.UUID UUID_MAGNETIC_FLUX_DENSITY_3D = java.util.UUID
            .fromString(GattAttributes.MAGNETIC_FLUX_DENSITY_3D);
    public final static java.util.UUID UUID_MAXIMUM_RECOMMENDED_HEART_RATE = java.util.UUID
            .fromString(GattAttributes.MAXIMUM_RECOMMENDED_HEART_RATE);
    public final static java.util.UUID UUID_NEW_ALERT = java.util.UUID
            .fromString(GattAttributes.NEW_ALERT);
    public final static java.util.UUID UUID_NAVIGATION = java.util.UUID
            .fromString(GattAttributes.NAVIGATION);
    public final static java.util.UUID UUID_PERIPHERAL_PREFERRED_CONNECTION_PARAMETERS = java.util.UUID
            .fromString(GattAttributes.PERIPHERAL_PREFERRED_CONNECTION_PARAMETERS);
    public final static java.util.UUID UUID_PERIPHERAL_PRIVACY_FLAG = java.util.UUID
            .fromString(GattAttributes.PERIPHERAL_PRIVACY_FLAG);
    public final static java.util.UUID UUID_POLLEN_CONCENTRATION = java.util.UUID
            .fromString(GattAttributes.POLLEN_CONCENTRATION);
    public final static java.util.UUID UUID_POSITION_QUALITY = java.util.UUID
            .fromString(GattAttributes.POSITION_QUALITY);
    public final static java.util.UUID UUID_PRESSURE = java.util.UUID
            .fromString(GattAttributes.PRESSURE);
    public final static java.util.UUID UUID_TEMPERATURE = java.util.UUID
            .fromString(GattAttributes.TEMPERATURE);
    public final static java.util.UUID UUID_UV_INDEX = java.util.UUID
            .fromString(GattAttributes.UV_INDEX);

    // Descriptors UUID's
    public final static java.util.UUID UUID_CHARACTERISTIC_AGGREGATE_FORMAT = java.util.UUID
            .fromString(GattAttributes.CHARACTERISTIC_AGGREGATE_FORMAT);
    public final static java.util.UUID UUID_VALID_RANGE = java.util.UUID
            .fromString(GattAttributes.VALID_RANGE);
    public final static java.util.UUID UUID_EXTERNAL_REPORT_REFERENCE = java.util.UUID
            .fromString(GattAttributes.EXTERNAL_REPORT_REFERENCE);
    public final static java.util.UUID UUID_ENVIRONMENTAL_SENSING_CONFIGURATION = java.util.UUID
            .fromString(GattAttributes.ENVIRONMENTAL_SENSING_CONFIGURATION);
    public final static java.util.UUID UUID_ENVIRONMENTAL_SENSING_MEASUREMENT = java.util.UUID
            .fromString(GattAttributes.ENVIRONMENTAL_SENSING_MEASUREMENT);
    public final static java.util.UUID UUID_ENVIRONMENTAL_SENSING_TRIGGER_SETTING = java.util.UUID
            .fromString(GattAttributes.ENVIRONMENTAL_SENSING_TRIGGER_SETTING);

    // Wearable Solution Demo
    public static final java.util.UUID UUID_WEARABLE_DEMO_SERVICE = java.util.UUID
            .fromString(GattAttributes.WEARABLE_DEMO_SERVICE);
    public static final java.util.UUID UUID_WEARABLE_MOTION_SERVICE = java.util.UUID
            .fromString(GattAttributes.WEARABLE_MOTION_SERVICE);
    public static final java.util.UUID UUID_WEARABLE_MOTION_FEATURE_CHARACTERISTIC = java.util.UUID
            .fromString(GattAttributes.WEARABLE_MOTION_FEATURE_CHARACTERISTIC);
    public static final java.util.UUID UUID_WEARABLE_MOTION_DATA_CHARACTERISTIC = java.util.UUID
            .fromString(GattAttributes.WEARABLE_MOTION_DATA_CHARACTERISTIC);
    public static final java.util.UUID UUID_WEARABLE_MOTION_CONTROL_CHARACTERISTIC = java.util.UUID
            .fromString(GattAttributes.WEARABLE_MOTION_CONTROL_CHARACTERISTIC);
    public static final java.util.UUID UUID_WEARABLE_MOTION_LIFETIME_STEPS_CHARACTERISTIC = java.util.UUID
            .fromString(GattAttributes.WEARABLE_MOTION_LIFETIME_STEPS_CHARACTERISTIC);
    public static final java.util.UUID UUID_WEARABLE_MOTION_STEPS_GOAL_CHARACTERISTIC = java.util.UUID
            .fromString(GattAttributes.WEARABLE_MOTION_STEPS_GOAL_CHARACTERISTIC);
    public static final java.util.UUID UUID_WEARABLE_MOTION_CALORIES_GOAL_CHARACTERISTIC = java.util.UUID
            .fromString(GattAttributes.WEARABLE_MOTION_CALORIES_GOAL_CHARACTERISTIC);
    public static final java.util.UUID UUID_WEARABLE_MOTION_FITNESS_TRACKER_CMD_CHARACTERISTIC = java.util.UUID
            .fromString(GattAttributes.WEARABLE_MOTION_FITNESS_TRACKER_CMD_CHARACTERISTIC);
    public static final java.util.UUID UUID_WEARABLE_MOTION_DURATION_GOAL_CHARACTERISTIC = java.util.UUID
            .fromString(GattAttributes.WEARABLE_MOTION_DURATION_GOAL_CHARACTERISTIC);
    public static final java.util.UUID UUID_WEARABLE_MOTION_DISTANCE_GOAL_CHARACTERISTIC = java.util.UUID
            .fromString(GattAttributes.WEARABLE_MOTION_DISTANCE_GOAL_CHARACTERISTIC);
}
