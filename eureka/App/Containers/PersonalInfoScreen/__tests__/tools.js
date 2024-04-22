import {feetToMeters, formatInches, metersToImperial} from "../tools";

jest.mock('react-native-localize', ()=> {
  return {
    getNumberFormatSettings: ()=> {return ',';},
  }
});

describe('tools for personal info', () => {

  //TODO: add tests for "toFixedLocale", but now the mock is not working properly

  it('metersToImperial convert properly', () => {
    expect(metersToImperial(0)).toStrictEqual([0,0]);
    expect(metersToImperial(3)).toStrictEqual([9,10]);
    expect(metersToImperial(5)).toStrictEqual([16,4]);
  });

  it('formatInches should format to string', () => {
    expect(formatInches(0)).toStrictEqual('00');
    expect(formatInches(2)).toStrictEqual('02');
    expect(formatInches(9)).toStrictEqual('09');
    expect(formatInches(10)).toStrictEqual('10');
    expect(formatInches(11)).toStrictEqual('11');
  });

  it('metersToImperial convert properly', () => {
    expect(feetToMeters(0,0)).toBe('0.00');
    expect(feetToMeters(9,10)).toBe('3.00');
    expect(feetToMeters(16,4)).toBe('4.98');
  });

});
