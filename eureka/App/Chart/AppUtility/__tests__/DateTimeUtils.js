import {getAbsoluteHourInAmPm, getDateTimeInfo} from "../DateTimeUtils";

jest.mock('../../../Services/Translate');

describe('getDateTimeInfo', () => {

    it('match time formats', async () => {
        const date = new Date(2023, 5, 3, 14, 55, 53, 123);
        const formatted = getDateTimeInfo(date.getTime())

        expect(formatted).toEqual({
            "date": "2023-6-3",
            "dateInWords": "June 3, 2023",
            "dateInWordsShort": "June 3",
            "day": "3",
            "dayOfTheWeekInWordsShort": "Sat",
            "dayOfTheWeekIndex": 6,
            "dayOfWeekInWords": "Saturday",
            "monthInWords": "June",
            "monthInWordsShort": "Jun",
            "timeInWords": "2:55 PM",
            "ts": 1685796953123,
            "year": "2023",
        });
    });
    test('getAbsoluteHourInAmPm', async () => {
        expect(getAbsoluteHourInAmPm(1)).toBe('1am')
        expect(getAbsoluteHourInAmPm(11)).toBe('11am')
        expect(getAbsoluteHourInAmPm(12)).toBe('12pm')
        expect(getAbsoluteHourInAmPm(13)).toBe('1pm')
        expect(getAbsoluteHourInAmPm(14)).toBe('2pm')
        expect(getAbsoluteHourInAmPm(22)).toBe('10pm')
        expect(getAbsoluteHourInAmPm(23)).toBe('11pm')
        expect(getAbsoluteHourInAmPm(24)).toBe('12am')
        expect(getAbsoluteHourInAmPm(0)).toBe('12am')
    })
});
