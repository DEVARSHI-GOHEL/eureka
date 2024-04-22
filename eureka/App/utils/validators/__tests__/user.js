import {validateSkinTone} from "../user";

describe('user validators', () => {

  it('should validate - positive', () => {
    expect(validateSkinTone(1)).toBe(true);
    expect(validateSkinTone(6)).toBe(true);
  });

  it('should validate - negative', () => {
    expect(validateSkinTone(undefined)).toBe(false);
    expect(validateSkinTone(0)).toBe(false);
    expect(validateSkinTone('nonsense')).toBe(false);
  });
});
