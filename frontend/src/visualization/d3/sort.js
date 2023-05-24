/** @format */

import { ascending, descending } from "d3";
// functions for sorting to make prevalent sorting methods easily accessible and switchable for d3.treemap and d3.hierarchy objects

export const sizeAscending = (a, b) => ascending(a.size, b.size);
export const sizeDescending = (a, b) => descending(a.size, b.size);

export const nameAscending = (a, b) => ascending(a.name, b.name);
export const nameDescending = (a, b) => descending(a.name, b.name);

export const busFactorAscending = (a, b) =>
  ascending(a.data.busFactor, b.data.BusFactor);
export const busFactorDescending = (a, b) =>
  descending(a.data.busFactor, b.data.BusFactor);
