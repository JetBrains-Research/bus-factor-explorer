/** @format */

import React, { useLayoutEffect } from "react";
import { useSelector } from "react-redux";

import { selectAllFilters, selectExtensionFilters } from "../reducers/treemapSlice";

import { createSVGInContainer, clearCanvas } from "../d3/svgCanvas.tsx";
import {
  generateInitialD3Hierarchy,
  drawTreemapFromGeneratedLayout,
  drawMiniTreemapFromGeneratedLayout,
  applyNormalizationToD3Hierarchy,
  applyRegExFilters,
  applyExtensionFilters,
} from "../d3/treemap";

import { sizeAscending } from "../d3/sort";
import { squarify } from "../d3/tiling";
import * as d3 from "d3";

function TreeMap(props) {
  // assign these consts fallback values if prop is empty or throw errors;
  const currentDataPath = props.dataPath;
  const currentColorPalette = props.colorPalette;
  const currentColorThresholds = props.colorThresholds;
  const dataNormalizationFunction = props.dataNormalizationFunction
    ? props.dataNormalizationFunction
    : Math.log2;
  const initialHeight = props.initialHeight;
  const initialWidth = props.initialWidth;
  const padding = props.padding;
  const reduxNavFunctions = props.reduxNavFunctions;
  const setPathFunc = props.setPathFunc;
  const topPadding = props.topPadding;
  const treemapContainerId = props.containerId;
  const treemapSvgId = props.svgId;
  const type = props.type;
  const tilingFunction = props.tilingFunction ? props.tilingFunction : squarify;

  // redux related vars
  const regexFilters = useSelector(selectAllFilters);
  const extensionFilters = useSelector(selectExtensionFilters);

  useLayoutEffect(() => {
    // set data source
    const data = props.data;

    // Create treemap layout
    const treemapLayoutGenerator = (treemapData) =>
      d3
        .treemap()
        .size([initialWidth, initialHeight])
        .padding(padding)
        .paddingTop(topPadding)
        .round(false)
        .tile(tilingFunction)(treemapData);

    // Create SVG canvas
    const svg = createSVGInContainer(
      `#${treemapContainerId}`,
      treemapSvgId,
      initialHeight,
      initialWidth
    );

    // Loading and generating initial data
    let rootHierarchyNode = generateInitialD3Hierarchy(data);

    // Apply filters if present
    if (regexFilters) {
      applyRegExFilters(rootHierarchyNode, regexFilters);
    }

    if (extensionFilters) {
      applyExtensionFilters(rootHierarchyNode, extensionFilters)
    }

    // Apply data normalization if applicable
    if (dataNormalizationFunction) {
      applyNormalizationToD3Hierarchy(
        rootHierarchyNode,
        dataNormalizationFunction
      );
    }

    // Sort the nodes for each level
    rootHierarchyNode.sort(sizeAscending);

    // get a d3.treemap from the d3.hierarchy object
    const treemapLayout = treemapLayoutGenerator(rootHierarchyNode);

    // Drawing the treemap from the generated data
    if (type === "main") {
      const colorGenerator = d3
        .scaleThreshold()
        .domain(currentColorThresholds)
        .range(currentColorPalette.slice(1));

      drawTreemapFromGeneratedLayout(
        svg,
        treemapLayout,
        setPathFunc,
        colorGenerator,
        currentColorPalette[0]
      );
    } else if (type === "mini")
      drawMiniTreemapFromGeneratedLayout(svg, treemapLayout, reduxNavFunctions);

    return () => {
      clearCanvas(treemapSvgId);
    };
  }, [
    props.data,
    currentColorThresholds,
    currentColorPalette,
    currentDataPath,
    dataNormalizationFunction,
    regexFilters,
    extensionFilters,
    initialHeight,
    initialWidth,
    padding,
    reduxNavFunctions,
    setPathFunc,
    tilingFunction,
    topPadding,
    treemapContainerId,
    treemapSvgId,
    type,
  ]);

  return (
    <div
      id={treemapContainerId}
      className="container-fluid"></div>
  );
}

export default TreeMap;
