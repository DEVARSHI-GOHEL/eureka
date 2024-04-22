import moment from "moment";
import {shouldCheckUpdate, stringToTime, timeToString} from "../TimerTickHandler";

describe("TimerTickHandler", () => {

    test('shouldCheckUpdate', () => {

        const shouldCheck = moment().subtract(9, 'hours');
        expect(shouldCheckUpdate(shouldCheck)).toBe(true);

        const shouldNotCheck = moment().subtract(7, 'hours');
        expect(shouldCheckUpdate(shouldNotCheck)).toBe(false);

    })

    test("time parser", () => {

        const now = moment().startOf('second');
        const timeString = timeToString(now);
        const parsedTime = stringToTime(timeString);
        const backToString = timeToString(parsedTime);

        expect(backToString).toBe(timeString);
        expect(now.isSame(moment(timeString))).toBe(true);

    })
})
