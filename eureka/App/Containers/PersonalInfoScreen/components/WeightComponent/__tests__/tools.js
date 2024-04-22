import {getWeightByUnits, kgToLbs, lbsToKg} from "../tools";
import {KG, POUND} from "../../../hooks/measurement";

describe('weight tools', () => {

    test('kgToLbs', ()=>{
        expect(kgToLbs(10)).toBe(22);
        expect(kgToLbs(14)).toBe(31);
        expect(kgToLbs(15)).toBe(33);
        expect(kgToLbs(16)).toBe(35);
        expect(kgToLbs(20)).toBe(44);
    });
    test('lbsToKg', ()=>{
        expect(lbsToKg(22)).toBe(10);
        expect(lbsToKg(31)).toBe(14);
        expect(lbsToKg(32)).toBe(15);
        expect(lbsToKg(33)).toBe(15);
        expect(lbsToKg(36)).toBe(16);
        expect(lbsToKg(44)).toBe(20);
    });
    test('getWeightByUnits', ()=>{
        expect(getWeightByUnits(20, KG, KG)).toBe(20);
        expect(getWeightByUnits(20, KG, POUND)).toBe(44);
        expect(getWeightByUnits(20, POUND, POUND)).toBe(20);
        expect(getWeightByUnits(20, POUND, KG)).toBe(9);
    });
});
