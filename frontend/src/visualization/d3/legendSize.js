/** @format */

import * as d3 from "d3";

export function createLegendSize(svg) {
  let keys = ["A thousand lines", "A million lines"];
  let vals = [1000, 1000000];
  let size = 20;
  let color = d3
    .scaleLinear()
    .domain([1000, 1000000])
    .range(["green", "green"]);

  svg
    .selectAll("squares")
    .data(vals)
    .join("rect")
    .attr("x", 0)
    .attr("y", function (d, i) {
      return i * size + i * Math.log2(d);
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", (d) => 3 * Math.log2(d))
    .attr("height", (d) => 3 * Math.log2(d))
    .style("fill", function (d) {
      return color(d);
    })
    .style("stroke", "black");

  svg
    .selectAll("colorlabels")
    .data(d3.zip(keys, vals))
    .join("text")
    .attr("x", (d) => size * 4)
    .attr("y", function (d, i) {
      return size + i * 2.5 * size;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", "black")
    .text((d) => d[0])
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");
}
