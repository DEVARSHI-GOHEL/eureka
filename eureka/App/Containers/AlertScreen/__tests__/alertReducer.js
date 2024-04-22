import { addEditedWithoutDuplicities, addWithoutDuplicities } from "../alertReducer";
import { getKey } from '../alertSelectors';


function parseTime(keyAsStr){
  return +keyAsStr.split('#')[0];
}

const TIME_A = new Date().getTime();
const TIME_B = new Date().getTime() - 60*1000;

const ID_A = 4;
const ID_B = 5;

const FIRST_TEST_KEY = `${TIME_A}#${ID_A}`;
const SECOND_TEST_KEY = `${TIME_B}#${ID_B}`;

// this is array of keys
const MOCK_DATA_LIST = [
  "1644999269000#1",
  "1649999269000#5",
  "1649999269000#5",
  FIRST_TEST_KEY
];

const TEST_ALERT1 = {
  id: 5,
  time: parseTime(FIRST_TEST_KEY),
  notes: "First Note"
};

const TEST_ALERT2 = {
  id: 5,
  time: parseTime(SECOND_TEST_KEY),
  notes: 'Second Note'
};

const THIRD_TEST_TYPE = '13123';
const THIRD_TEST_KEY = getKey({ time: 1231541234123, id: THIRD_TEST_TYPE });
const TEST_ALERT3 = {
  id: THIRD_TEST_TYPE,
  time: parseTime(THIRD_TEST_KEY),
  notes: 'Third Note'
};

const KEY_MUST_WILL_DELETED = '161999100000#1';
const VALUE_MUST_WILL_DELETED = {
  time: parseTime(KEY_MUST_WILL_DELETED),
  id: 1,
  notes: "Delete Note"
};

const MOCK_ALERTS_LIST = {
  [KEY_MUST_WILL_DELETED]: VALUE_MUST_WILL_DELETED,
  [FIRST_TEST_KEY]: TEST_ALERT1,
  [SECOND_TEST_KEY]: TEST_ALERT2,
};


describe('removeDuplicates test', () => {
  test(`removing duplicates from array of strings and
      keys older that now time more 1 day`,
    () => {
    expect(addWithoutDuplicities(MOCK_DATA_LIST, FIRST_TEST_KEY).length).toBe(1);
    expect(addWithoutDuplicities(MOCK_DATA_LIST, SECOND_TEST_KEY).length).toBe(2);
  });

});

describe('removeDuplicatesEdited test', () => {

  test(`removing duplicates from array of strings and
      keys older that now time more 1 day`,
    () => {

      expect(addEditedWithoutDuplicities(
        MOCK_ALERTS_LIST, TEST_ALERT1
      )[FIRST_TEST_KEY].notes).toBe("First Note");

      expect(addEditedWithoutDuplicities(
        MOCK_ALERTS_LIST, TEST_ALERT2
      )[SECOND_TEST_KEY].notes).toBe("Second Note");

      // too old alerst (older than day) will not be added
      expect(addEditedWithoutDuplicities(
        MOCK_ALERTS_LIST, TEST_ALERT3
      )[THIRD_TEST_KEY]).toBeUndefined();

      //old key must will remove
      expect(addEditedWithoutDuplicities(
        MOCK_ALERTS_LIST, VALUE_MUST_WILL_DELETED
      )[KEY_MUST_WILL_DELETED]).toBeUndefined();
  });

});