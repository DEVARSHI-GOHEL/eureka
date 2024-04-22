
export function percent(_percent, data) {
  return (_percent / 100) * data;
}

export function percentageOf(val, total) {
  let res = (val / total) * 100;

  res = Math.round(res * 10) / 10;
  return res;
}