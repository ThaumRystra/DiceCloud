const roman = {
  Ⅿ: 1000,
  ⅭⅯ: 900,
  Ⅾ: 500,
  ⅭⅮ: 400,
  Ⅽ: 100,
  ⅩⅭ: 90,
  Ⅼ: 50,
  XL: 40,
  Ⅻ: 12,
  Ⅺ: 11,
  Ⅹ: 10,
  Ⅸ: 9,
  Ⅷ: 8,
  Ⅶ: 7,
  Ⅵ: 6,
  Ⅴ: 5,
  Ⅳ: 4,
  Ⅲ: 3,
  Ⅱ: 2,
  Ⅰ: 1
};
export default function romanize(num) {
  var str = '';
  for (var i of Object.keys(roman)) {
    var q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }
  return str;
}