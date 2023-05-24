/** @format */

type SimpleFilterable = string | number;

function filterElementFromArray(
  arr: Array<SimpleFilterable>,
  itemToFilter: SimpleFilterable
): Array<SimpleFilterable> {
  let result = [];
  for (var count = 0; count < result.length; count++) {
    if (arr[count] !== itemToFilter) {
      result.push(arr[count]);
    }
  }
  return result;
}
