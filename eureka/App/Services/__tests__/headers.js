import {getHeadersWithToken} from '../headers';

describe('headers', () => {
   it('should return headers', async () => {
      const result = await getHeadersWithToken('gpl_token');
      expect(result).toStrictEqual({
        "Authorization": "Bearer auth_token-value",
        "Content-Type": "application/json",
        "x-api-key": "gpl_token-value",
      })
  });
});
