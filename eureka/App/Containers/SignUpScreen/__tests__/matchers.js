import {deviceMsn_reg, email_reg, multiNationalName, password_reg} from '../matchers';

describe('matchers', () => {

  it('email validation - positive', async () => {
    expect(email_reg.test('pepa@novak.cz')).toBe(true);
    expect(email_reg.test('pepa45@novak.cz')).toBe(true);
    expect(email_reg.test('pepa.novak@com.cz')).toBe(true);
    expect(email_reg.test('pepa.novak@trmtara123.com')).toBe(true);
  });

  it('email validation - false match', async () => {
    expect(email_reg.test('pepa@novakcz')).toBe(false);
    expect(email_reg.test('1235cz')).toBe(false);
  });

  it('password reg - positive', async () => {
    expect(password_reg.test('Haa4D#$cdac')).toBe(true);
  });

  it('password reg - false match', async () => {
    expect(password_reg.test('Hacasdccdcda')).toBe(false);
    expect(password_reg.test('123')).toBe(false);
    expect(password_reg.test('123456789123456#$#$')).toBe(false);
    expect(password_reg.test(' cd  d d d ')).toBe(false);
    expect(password_reg.test('Aqwerasdfqwer123')).toBe(false);
  });

  it('multiNationalName - positive', async () => {
    expect(multiNationalName.test('Pepa')).toBe(true);
    expect(multiNationalName.test('Novak')).toBe(true);
    expect(multiNationalName.test('Třešeň')).toBe(true);
    expect(multiNationalName.test('Vŕba')).toBe(true);
    expect(multiNationalName.test('Adam')).toBe(true);
    expect(multiNationalName.test('アダム')).toBe(true);
    expect(multiNationalName.test('Адам')).toBe(true);
  });

  it('multiNationalName - false match', async () => {
    expect(multiNationalName.test('Pepa1')).toBe(false);
    expect(multiNationalName.test('123')).toBe(false);
    expect(multiNationalName.test('select * from user;')).toBe(false);
  });

  it('deviceMsn_reg - positive', async () => {
    expect(deviceMsn_reg.test('123')).toBe(true);
    expect(deviceMsn_reg.test('Ab1234535')).toBe(true);
  });

  it('deviceMsn_reg - false match', async () => {
    expect(deviceMsn_reg.test('1..;.2')).toBe(false);
    expect(deviceMsn_reg.test('AB-1235')).toBe(false);
  });

});
