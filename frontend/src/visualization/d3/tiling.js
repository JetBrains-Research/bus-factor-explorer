/** @format */

import { treemapBinary, treemapSquarify } from "d3";

export const layoutAlgorithmsMap = {
  "binary": treemapBinary,
  "squarify": treemapSquarify,
}

export const squarify = treemapSquarify;
export const binary = treemapBinary;
