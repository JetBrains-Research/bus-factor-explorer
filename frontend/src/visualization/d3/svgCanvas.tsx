/** @format */

import * as d3 from "d3";

export function createSVGInContainer(
  containerId: string,
  svgId: string,
  height: number,
  width: number
) {
  return d3
    .select(containerId)
    .append("svg")
    .attr("xmlns:xhtml", "http://www.w3.org/1999/xhtml")
    .attr("id", svgId)
    .attr("class", "h-100 w-100")
    .attr("viewBox", `0 0 ${width} ${height}`);
}

export function clearCanvas(svgId: string) {
  let svg_element = document.getElementById(svgId);

  if (svg_element === null) {
    // do nothing
  } else {
    if (svg_element.parentNode === null) {
      // do nothing
    } else {
      svg_element.parentNode.removeChild(svg_element);
    }
  }
}
