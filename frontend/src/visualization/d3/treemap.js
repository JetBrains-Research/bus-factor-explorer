/** @format */

import * as d3 from "d3";
import "d3-transition";
import { pickTextColorBasedOnBgColor } from "../utils/color.tsx";
import { payloadGenerator } from "../utils/reduxActionPayloadCreator.tsx";
import { CONFIG } from "../config";
import uid from "./uid.tsx";
import { filter } from "d3";

/*
    This file has all the methods related to the d3 treemap including calculation and rendering
*/

// get max val from data and use it to set the upper limit in color selection
const JETBRAINS_COLORS = CONFIG.general.colors.jetbrains;
const UNAVAILABLE_BF_COLOR = JETBRAINS_COLORS.gray;
const MAX_BUS_FACTOR_COLOR_VALUE = CONFIG.treemap.logic.maxBusFactorValue;
export const colorSequence = [
  JETBRAINS_COLORS.brightRed,
  JETBRAINS_COLORS.golden,
  JETBRAINS_COLORS.white,
  // JETBRAINS_COLORS.green,
  // JETBRAINS_COLORS.blue,
];

export const color = d3.scaleThreshold().domain([2, 5]).range(colorSequence);
export const formatSI = d3.format(".2s");

export const treemap = d3.treemap;

export function normalizeD3DataValues(node) {
  if (node.children) {
    node.children.forEach((element) => {
      normalizeD3DataValues(element);
    });
  }

  if (node.value >= 0) {
    node.size = node.value;
    node.value = Math.sqrt(node.value);
  }

  return node;
}

export function applyNormalizationToD3Hierarchy(hierarchy, normFunction) {
  if (hierarchy) {
    hierarchy.eachAfter((d) => {
      if (d.depth <= 1) {
        d.size = d.value;

        if (d.depth === 1)
          if (d.size > 0) {
            d.value = normFunction(d.value);
          }

        if (d.depth === 0) {
          if (!("children" in d)) console.log(d);
          d.value = d.children
            .map((e) => e.value)
            .reduce((prevValue, currentValue) => prevValue + currentValue);
        }
      }
    });
  }
  return hierarchy;
}

export function applyRegExFilters(hierarchy, filters) {
  if (hierarchy) {
    if (filters) {
      filters.forEach((filterExpression, filterExpressionIndex) => {
        const filterRe = new RegExp(filterExpression);
        hierarchy.eachAfter((d) => {
          if (d.value > 0) {
            const filePathSplit = d.data.name.split("/");
            const fileName = filePathSplit[filePathSplit.length - 1];

            if (!filterRe.test(fileName)) {
              d.value = 0;
            }
          }
        });
      });
    }
  }
}

export function applyFilters(hierarchy, filters) {
  if (hierarchy) {
    hierarchy.eachAfter((d) => {
      if (filters) {
        if (filters.exclusion.fileNamePrefixes) {
          if (filters.exclusion.fileNamePrefixes) {
            filters.exclusion.fileNamePrefixes.forEach((prefix) => {
              if (d.data.name.startsWith(prefix)) {
                d.value = 0;
              }
            });
          }
          if (filters.exclusion.extensions) {
            if (filters.exclusion.extensions.includes(d.data.extension)) {
              d.value = 0;
            }
          }
          if (filters.exclusion.fileNames) {
            filters.exclusion.fileNames.forEach((element) => {
              if (d.data.name === element) {
                d.value = 0;
              }
            });
          }
        }
      }
    });
  }
  return hierarchy;
}

function addDimensionsToTreemap(treemap) {
  treemap.eachAfter((d) => {
    d.tileHeight = d.y1 - d.y0;
    d.tileWidth = d.x1 - d.x0;
  });

  return treemap;
}

function addColorsToTreemap(treemap) {
  treemap.eachAfter((d) => {
    const color = chooseRectangleFillColor(d);
    d.bgColor = color;
    d.textColor = pickTextColorBasedOnBgColor(
      color,
      JETBRAINS_COLORS.white,
      JETBRAINS_COLORS.black
    );
  });
}

function addColorsToMiniTreemap(treemap) {
  treemap.eachAfter((d) => {
    const color = chooseRectangleFillColorMiniTreemap(d);
    d.bgColor = color;
    d.textColor = pickTextColorBasedOnBgColor(
      color,
      JETBRAINS_COLORS.gray,
      JETBRAINS_COLORS.black
    );
  });
}

function chooseRectangleFillColor(d) {
  if ("busFactor" in d.data.busFactorStatus) {
    return color(d.data.busFactorStatus.busFactor);
  } else return UNAVAILABLE_BF_COLOR;
}

function chooseRectangleFillColorMiniTreemap(d) {
  if (d.data.busFactorStatus.nodeStatus === "original") {
    return JETBRAINS_COLORS.gray;
  }

  if (d.data.busFactorStatus.nodeStatus === "decrease") {
    return JETBRAINS_COLORS.golden;
  }

  if (d.data.busFactorStatus.nodeStatus === "lost") {
    return JETBRAINS_COLORS.darkRed;
  }

  // if (d.data.busFactorStatus.busFactor === 0) {
  //   if (d.data.busFactorStatus.old || d.data.busFactorStatus.ignored) {
  //     return JETBRAINS_COLORS.gray;
  //   } else if ("delta" in d.data.busFactorStatus) {
  //     return JETBRAINS_COLORS.brightRed;
  //   }
  // }
  // if ("delta" in d.data.busFactorStatus) {
  //   if (d.data.busFactorStatus.delta < 0) {
  //     return JETBRAINS_COLORS.golden;
  //   } else if (d.data.busFactorStatus.delta > 0) {
  //     return JETBRAINS_COLORS.brightGreen;
  //   }
  // }

  return UNAVAILABLE_BF_COLOR;
}

function rectangleOnClickHandlerMiniTreemap(d, reduxNavFunctions) {
  reduxNavFunctions.dispatch(
    reduxNavFunctions.scopeMiniTreemapIn(payloadGenerator("path", d.data.path))
  );
}

function rectangleOnClickHandlerMainTreemap(d, setPathFunction) {
  if ("children" in d.data && d.data.children) {
    setPathFunction(d.data.path);
  } else {
    setPathFunction("", d.data.path);
  }
}

function rectangleOnMouseOverHandler(d) {
  if (d.depth > 0) {
    const pElement = d3.select(`#p-${d.nodeUid.id}`);
    pElement.classed("text-truncate", false);

    const rects = d3.select(d.nodeUid.href);
    rects
      .transition()
      .duration(500)
      .ease(d3.easeExpOut)
      .style("stroke-width", "0.3rem");
  }
}

function rectangleOnMouseOutHandler(d) {
  const pElement = d3.select(`p${`#p-${d.nodeUid.id}`}`);
  pElement.classed("text-truncate", true);

  const rects = d3.select(d.nodeUid.href);
  rects
    .transition()
    .duration(CONFIG.treemap.children.rect.transitionDuration)
    .ease(d3.easeElastic)
    .style("stroke-width", "0.1rem");
}

export function generateInitialD3Hierarchy(data) {
  // Construct nodes and calculate drawing coordinates from filtered data
  let hierarchicalData = d3.hierarchy(data).sum((d) => d.bytes);

  return hierarchicalData;
}

export function drawMiniTreemapFromGeneratedLayout(
  svg,
  root,
  reduxNavFunctions
) {
  // Populate dimensions to prevent repeated calculation of the same values
  addDimensionsToTreemap(root);

  // Calculate color of background and text
  addColorsToMiniTreemap(root);

  const node = svg
    .selectAll("g")
    .data(
      d3.group(
        root.descendants().filter(function (d) {
          return d.depth < CONFIG.treemap.logic.maxDepth;
        }),
        (d) => d.data.path
      )
    )
    .join("g")
    .selectAll("g")
    .data((d) => d[1])
    .join("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  node.append("title").text(
    (d) => `${d
      .ancestors()
      .reverse()
      .map((d) => d.data.name)
      .join("/")}
bus factor: ${
      "busFactor" in d.data.busFactorStatus
        ? "[" +
        (d.data.busFactorStatus.busFactor - d.data.busFactorStatus.delta) +
        " -> " +
        d.data.busFactorStatus.busFactor +
        "]"
        : "?"
    }
node status: ${
      "nodeStatus" in d.data.busFactorStatus
        ? d.data.busFactorStatus.nodeStatus
        : "?"
    }`
  );

  // Tiles
  node
    .filter((d) => d.depth >= 0)
    .append("rect")
    .style("rx", CONFIG.treemap.children.rect.rx)
    .style("ry", CONFIG.treemap.children.rect.ry)
    .attr("width", (d) => d.tileWidth)
    .transition("firstRender")
    .duration(CONFIG.treemap.children.rect.transitionDuration)
    .ease(d3.easeSin)
    .style("fill", (d) => d.bgColor)
    .style("stroke", JETBRAINS_COLORS.black)
    .attr("id", (d) => (d.nodeUid = uid("mini-node")).id)
    .attr("height", (d) => d.tileHeight);

  const textBox = node
    .append("foreignObject")
    .attr("width", (d) => d.tileWidth)
    .attr("height", (d) => d.tileHeight)
    .append("xhtml:div")
    .attr("class", (d) =>
      d.depth > 0
        ? CONFIG.treemap.classes.rectWrapperChild
        : CONFIG.treemap.classes.rectWrapperParent
    )
    .append("div");

  textBox
    .filter((d) => d.data.children && d.depth > 0)
    .on("click", (_e, d) =>
      rectangleOnClickHandlerMiniTreemap(d, reduxNavFunctions)
    )
    .append("xhtml:i")
    .attr("class", CONFIG.treemap.classes.folderIcon)
    .style("color", (d) => d.textColor)
    .style("font-size", CONFIG.treemap.children.icon.miniFontSize);

  textBox
    .append("xhtml:p")
    .text((d) => {
      return ` ${
        "delta" in d.data.busFactorStatus && d.data.busFactorStatus.delta !== 0
          ? "[" + d.data.busFactorStatus.delta + "]"
          : ""
      } ${d.data.name}`;
    })
    .attr("class", "text-truncate")
    .attr("id", (d) => `p-${d.nodeUid}`)
    .style("overflow-wrap", "break-word")
    .style("color", (d) => d.textColor)
    .style("font-size", CONFIG.treemap.children.p.miniFontSize);
}

export function drawTreemapFromGeneratedLayout(svg, root, setPathFunction) {
  // Populate dimensions to prevent repeated calculation of the same values
  addDimensionsToTreemap(root);

  // Calculate color of background and text
  addColorsToTreemap(root);

  // Start 'painting'
  const node = svg
    .selectAll("g")
    .data(
      d3.group(
        root.descendants().filter(function (d) {
          return d.depth < CONFIG.treemap.logic.maxDepth;
        }),
        (d) => d.data.path
      )
    )
    .join("g")
    .selectAll("g")
    .data((d) => d[1])
    .join("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  // Tooltip
  node.append("title").text(
    (d) => `${d
      .ancestors()
      .reverse()
      .map((d) => d.data.name)
      .join("/")}
bus factor: ${
      "busFactor" in d.data.busFactorStatus
        ? d.data.busFactorStatus.busFactor
        : d.data.busFactorStatus.old
        ? "old"
        : d.data.busFactorStatus.ignored
        ? "ignored"
        : "missing"
    }`
  );

  // Tiles
  node
    .filter((d) => d.depth > 0)
    .append("rect")
    .style("rx", CONFIG.treemap.children.rect.rx)
    .style("ry", CONFIG.treemap.children.rect.ry)
    .attr("width", (d) => d.tileWidth)
    .transition("firstRender")
    .duration(CONFIG.treemap.children.rect.transitionDuration)
    .ease(d3.easeSin)
    .style("fill", (d) => d.bgColor)
    .style("stroke", JETBRAINS_COLORS.black)
    .attr("id", (d) => (d.nodeUid = uid("node")).id)
    .attr("height", (d) => d.tileHeight);

  node
    .filter((d) => d.depth === 0)
    .append("rect")
    .style("fill", (d) => chooseRectangleFillColor(d))
    .style("stroke", JETBRAINS_COLORS.black)
    .style("opacity", CONFIG.treemap.children.rect.parentOpacity)
    .style("rx", CONFIG.treemap.children.rect.rx)
    .style("ry", CONFIG.treemap.children.rect.ry)
    .attr("width", (d) => d.tileWidth)
    .attr("id", (d) => (d.nodeUid = uid("node")).id)
    .attr("height", (d) => d.tileHeight);

  const textBox = node
    .append("foreignObject")
    .attr("width", (d) => d.tileWidth)
    .attr("height", (d) => d.tileHeight)
    .on("click", (_e, d) =>
      rectangleOnClickHandlerMainTreemap(d, setPathFunction)
    )
    .append("xhtml:div")
    .attr("class", (d) =>
      d.depth > 0
        ? CONFIG.treemap.classes.rectWrapperChild
        : CONFIG.treemap.classes.rectWrapperParent
    )
    .on("mouseover", (_e, d) => rectangleOnMouseOverHandler(d))
    .on("mouseout", (_e, d) => rectangleOnMouseOutHandler(d))
    .append("div");

  textBox
    .filter((d) => d.data.children && d.depth > 0)
    .append("xhtml:i")
    .attr("class", CONFIG.treemap.classes.folderIcon)
    .style("color", (d) => d.textColor)
    .style("font-size", CONFIG.treemap.children.icon.fontSize);

  textBox
    .append("xhtml:p")
    .text((d) => {
      if (d.data.busFactorStatus) {
        if (d.data.busFactorStatus.busFactor)
          return (
            "[" + d.data.busFactorStatus.busFactor + "]" + " " + d.data.name
          );
      }
      return d.data.name;
    })
    .attr("class", "text-truncate")
    .attr("id", (d) => `p-${d.nodeUid.id}`)
    .style("overflow-wrap", "break-word")
    .style("color", (d) => d.textColor)
    .style("font-size", CONFIG.treemap.children.p.fontSize);
}
