import React from 'react'
import { DATA_BOUNDS, VITAL_CONSTANTS } from '../../../Chart/AppConstants/VitalDataConstants'


const colors = [
    "#999999",
    "#ffffff",
    "#fffc52",
    "#FFA42C",
    "#F86362"
]

export const VitalDataListType = {
    DAILY : "DAILY",
    WEEKLY : "WEEKLY",
    MONTHLY : "MONTHLY",
    YEARLY : "YEARLY",
}




export const getValues = (dataType, value) => {
    var type = DATA_BOUNDS[dataType](value*1)
    if (dataType === VITAL_CONSTANTS.KEY_BLOOD_GLUCOSE) {
        // console.log("Type",type,value);
        if (value < 70) {
            value = '<70';
        } else if (value > 180) {
            value = '>180';
        } else {
            value = value
        }
    } else if (dataType === VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_HIGH) {
        if (value < 80) {
            value = '<80';
        } else if (value > 180) {
            value = '>180';
        } else {
            value = value
        }
    } else if (dataType === VITAL_CONSTANTS.KEY_BLOOD_PRESSURE_LOW) {
        if (value < 50) {
            value = '<50';
        } else if (value > 110) {
            value = '>110';
        } else {
            value = value
        }
    } else if (dataType === VITAL_CONSTANTS.KEY_HEART_RATE) {
        if (value < 40) {
            value = '<40';
        } else if (value > 130) {
            value = '>130';
        } else {
            value = value
        }
    } else if (dataType === VITAL_CONSTANTS.KEY_RESP_RATE) {
        if (value < 10) {
            value = '<10';
        } else if (value > 30) {
            value = '>30';
        } else {
            value = value
        }
    } else if (dataType === VITAL_CONSTANTS.KEY_OXY_SAT) {
        if (value < 85) {
            value = '<85';
        } else if (value > 100) {
            value = '>100';
        } else {
            value = value
        }
    }
    return {
        color: colors[type],
        value: value,
        type: type
    };

}
