/** @format */

import React, { useLayoutEffect } from "react";
import { useSelector } from "react-redux";

import {
  selectRegexFilters,
  selectExtensionFilters,
} from "../reducers/treemapSlice";

import { createSVGInContainer, clearCanvas } from "../d3/svgCanvas.tsx";
import {
  generateInitialD3Hierarchy,
  drawTreemapFromGeneratedLayout,
  drawMiniTreemapFromGeneratedLayout,
  applyNormalizationToD3Hierarchy,
  applyRegExFilters,
  applyExtensionFilters,
  applyFolderFilter,
} from "../d3/treemap";
import * as tiling from "../d3/tiling";
import * as sorting from "../d3/sort";
import * as d3 from "d3";


function TreeMap(props) {
  // assign these consts fallback values if prop is empty or throw errors;
  const currentColorPalette = props.colorPalette;
  const currentColorThresholds = props.colorThresholds;
  const currentDataPath = props.dataPath;
  const dataNormalizationFunction = props.dataNormalizationFunction ? props.dataNormalizationFunction : Math.log2;
  const folderFilter = props.folderFilter;
  const initialHeight = props.initialHeight;
  const initialWidth = props.initialWidth;
  const padding = props.padding;
  const reduxNavFunctions = props.reduxNavFunctions;
  const setPathFunc = props.setPathFunc;
  const sortingFunctionStringId = props.sortingOrder;
  const sortingKey = props.sortingKey;
  const tilingFunctionStringId = props.tilingFunction ? props.tilingFunction : tiling.squarify;
  const topPadding = props.topPadding;
  const treemapContainerId = props.containerId;
  const treemapSvgId = props.svgId;
  const type = props.type;
  const zoom = props.zoom;

  // redux related vars
  const regexFilters = useSelector(selectRegexFilters);
  const extensionFilters = useSelector(selectExtensionFilters);


  useLayoutEffect(() => {
    // set data source
    const data = props.data;
    
    // Resolve tiling and sorting methods from text labels
    // const sortingOrderResolved = sorting.sortingOrderMap[sortingFunctionStringId];
    const tilingFunctionResolved = tiling.layoutAlgorithmsMap[tilingFunctionStringId];
    const sortingFunction = sorting.sortingKeyMapFunction(sortingFunctionStringId, sortingKey);

    // Create treemap layout
    const treemapLayoutGenerator = (treemapData) =>
      d3
        .treemap()
        .size([initialWidth, initialHeight])
        .padding(padding)
        .paddingTop(topPadding)
        .round(false)
        .tile(tilingFunctionResolved)(treemapData);

    // Create SVG canvas
    const svg = createSVGInContainer(
      `#${treemapContainerId}`,
      treemapSvgId,
      initialHeight,
      initialWidth
    );

    // Attach D3 zoom object to the new create svg canvas
    svg.call(zoom);

    // Loading and generating initial data
    let rootHierarchyNode = generateInitialD3Hierarchy(data);

    // Apply filters if present
    if (folderFilter) {
      applyFolderFilter(rootHierarchyNode)
    }
    if (regexFilters) {
      applyRegExFilters(rootHierarchyNode, regexFilters);
    }

    if (extensionFilters) {
      applyExtensionFilters(rootHierarchyNode, extensionFilters);
    }

    // Apply data normalization if applicable
    if (dataNormalizationFunction) {
      applyNormalizationToD3Hierarchy(
        rootHierarchyNode,
        dataNormalizationFunction
      );
    }

    // Sort the nodes for each level
    rootHierarchyNode.sort(sortingFunction);

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
    sortingKey,
    sortingFunctionStringId,
    dataNormalizationFunction,
    regexFilters,
    extensionFilters,
    initialHeight,
    initialWidth,
    padding,
    reduxNavFunctions,
    setPathFunc,
    tilingFunctionStringId,
    topPadding,
    treemapContainerId,
    treemapSvgId,
    type,
    zoom,
  ]);

  return (
    <div
      id={treemapContainerId}
      className="container-fluid"></div>
  );
}

export default TreeMap;
