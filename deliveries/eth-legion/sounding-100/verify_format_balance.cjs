'use strict';
const assert = require('node:assert/strict');
// Pure function copied exactly from Sounding-Labs/sounding main:server/index.html.
// No wallet functions, network, data, package installation or execution.
function formatBalance(amount) {
  if (amount >= 1000) return amount.toFixed(2);
  if (amount >= 1) return amount.toFixed(4);
  return amount.toFixed(7);
}
const cases = [
  [0, '0.0000000'],
  [0.5, '0.5000000'],
  [0.00000004, '0.0000000'],
  [1, '1.0000'],
  [1.25, '1.2500'],
  [999.9, '999.9000'],
  [1000, '1000.00'],
  [1000.5, '1000.50'],
  [-5, '-5.0000000'],
  [NaN, 'NaN'],
  [Infinity, 'Infinity'],
];
for (const [value, expected] of cases) assert.equal(formatBalance(value), expected);
for (const value of ['1.5', 'not a number', null, undefined]) {
  assert.throws(() => formatBalance(value), TypeError);
}
console.log('Sounding #100: 15 isolated behavior checks PASS');
