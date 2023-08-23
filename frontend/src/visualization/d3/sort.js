/** @format */

import { ascending, descending } from "d3";
// functions for sorting to make prevalent sorting methods easily accessible and switchable for d3.treemap and d3.hierarchy objects

export const sizeAscending = (a, b) => ascending(a.size, b.size);
export const sizeDescending = (a, b) => descending(a.size, b.size);

export const nameAscending = (a, b) => ascending(a.name, b.name);
export const nameDescending = (a, b) => descending(a.name, b.name);

export const busFactorAscending = (a, b) =>
  ascending(a.data.busFactor, b.data.busFactor);
export const busFactorDescending = (a, b) =>
  descending(a.data.busFactor, b.data.busFactor);

export const sortingOrderMap = {
  ascending: ascending,
  descending: descending,
};

export const sortingKeyMap = ["name", "size", "busFactor"];

const isBusFactorPresent = (d3Node) => {
  if (Object.keys(d3Node).includes("data")) {
    if (Object.keys(d3Node.data).includes("busFactorStatus")) {
      if (Object.keys(d3Node.data.busFactorStatus).includes("busFactor")) {
        return true;
      }
    }
  }
  return false;
};

export const sortingKeyMapFunction = (sortingFunctionStringId, sortingKey) => {
  const sortingFunction = sortingOrderMap[sortingFunctionStringId];

  if (sortingKey === "size") {
    return (a, b) =>
      sortingFunction(a.size, b.size) || ascending(a.data.name, b.data.name);
  } else if (sortingKey === "busFactor") {
    return (a, b) => {
      const busFactorExistsA = isBusFactorPresent(a);
      const busFactorExistsB = isBusFactorPresent(b);
      const nameOrder = ascending(a.data.name, b.data.name);

      if (busFactorExistsA && busFactorExistsB) {
        return sortingFunction(
          a.data.busFactorStatus.busFactor,
          b.data.busFactorStatus.busFactor
        );
      } else if (busFactorExistsA) {
        return sortingFunction === "ascending" ? 1 : -1;
      } else if (busFactorExistsB) {
        return sortingFunction === "ascending" ? -1 : 1;
      } else {
        return 0;
      }
    };
  } else if (sortingKey === "name") {
    return (a, b) => sortingFunction(a.data.name, b.data.name);
  }
};
