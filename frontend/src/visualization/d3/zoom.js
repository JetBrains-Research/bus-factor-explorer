/** @format */
import * as d3 from "d3";

export function handleZoom(e) {
  d3.selectAll("svg g g")
    .filter((d) => d.depth > 0)
    .attr("transform", (d) => {
      return (
        "translate(" +
        (d.x0 * e.transform.k + e.transform.x) +
        "," +
        (d.y0 * e.transform.k + e.transform.y) +
        ")" +
        " " +
        "scale(" +
        e.transform.k +
        ")"
      );
    });

  d3.selectAll("svg g g foreignObject div div p").style("transform", (d) => {
    return "scale(" + 1 / e.transform.k + ")";
  });

  d3.selectAll("svg g g foreignObject div div p").style(
    "transform-origin",
    (d) => "50 0"
  );

  d3.selectAll("svg g g foreignObject div div p").style(
    "min-width",
    (d) => (d.x1 - d.x0) * e.transform.k - 4 + "px"
  );

}

export function resetZoom(zoom) {
  d3.selectAll("svg g g").transition(750).call(zoom.scaleTo, 1);
}

export function createZoom(minScale, maxScale, width, height) {
  return d3
    .zoom()
    .scaleExtent([minScale, maxScale])
    .translateExtent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", handleZoom);
}
