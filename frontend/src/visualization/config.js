/** @format */

export const CONFIG = {
  general: {
    colors: {
      jetbrains: {
        black: "rgb(0,0,0)",
        blue: "rgb(8,124,250)",
        brightBlue: "rgb(7,195,242)",
        brightGreen: "rgb(59,234,98)",
        brightPurple: "rgb(255,69,237)",
        brightRed: "rgb(254,40,87)",
        darkGray: "rgb(125,125,125)",
        darkPurple: "rgb(175,29,245)",
        darkRed: "rgb(221,18,101)",
        golden: "rgb(253,182,13)",
        gray: "rgb(205,205,205)",
        green: "rgb(33,215,137)",
        indigo: "rgb(107,87,255)",
        orange: "rgb(252,128,29)",
        pink: "rgb(255,49,140)",
        white: "rgb(255,255,255)",
        yellow: "rgb(252,248,74)",
      },
    },
  },
  treemap: {
    ids: {
      treemapSvgId: "d3_treemap_svg",
      treemapContainerId: "treemap-container",
    },
    layout: {
      height: 1000,
      overallPadding: window.innerHeight * 0.01,
      topPadding: window.innerHeight * 0.05,
      width: 1100,
    },
    logic: {
      maxDepth: 2,
      maxBusFactorValue: 10,
    },
    classes: {
      folderIcon: "bi bi-folder2 mb-0",
      rectWrapperChild: "row p-0 m-0 align-items-center h-100",
      rectWrapperParent: "row px-1 fw-semibold",
    },
    children: {
      rect: {
        rx: 5,
        ry: 5,
        transitionDuration: 500,
        parentOpacity: 0.75,
      },
      textBox: {},
      icon: {
        fontSize: "1em",
        miniFontSize: "1em"
      },
      p: {
        fontSize: "0.7em",
        miniFontSize: "0.6em"
      },
    },
  },
  simulation: {
    layout: {
      height: 600,
      width: 1000,
      overallPadding: window.innerHeight * 0.01,
      topPadding: window.innerHeight * 0.05,
    },
    ids: {
      treemapSvgId: "d3_mini_treemap_svg",
      treemapContainerId: "mini-treemap-container",
    },
  },
  legend: {
    ids: {
      legendSvgId: "d3_legend_svg",
      legendSizeSvgId: "d3_legend_size_svg",
    },
    layout: {
      height: "100%",
      width: "100%",
    },
  },
  commonFilterExpressions: {
    startingWithDot: ["^[^\\.].*"],
  },
  filters: {
    "Python project": {
      extensions: ["^.*\.(py)|(ipynb)$"],
    },
    "Java Project": {
      extensions: ["^.*\.(jar)|(java)$"],
    },
  },
};
