/** @format */

import { createSlice } from "@reduxjs/toolkit";
import { calculateBusFactor } from "../utils/BusFactorUtil";
import { CONFIG } from "../config";

const defaultColors = [
  CONFIG.general.colors.jetbrains.gray,
  CONFIG.general.colors.jetbrains.darkRed,
  CONFIG.general.colors.jetbrains.golden,
  CONFIG.general.colors.jetbrains.white,
];

const defaultColorThresholds = [2, 5];

const defaultTree = {
  name: "PlaceHolder",
  path: ".",
  bytes: 1,
  busFactorStatus: {
    busFactor: 1,
  },
  users: [
    {
      email: "place.holder@mail.com",
      authorship: 0.5,
    },
  ],
  children: [
    {
      name: "place_holder",
      path: "/place_holder",
      bytes: 1,
      busFactorStatus: {
        old: true,
      },
    },
  ],
};

function convertTreeToState(tree) {
  return {
    tree: tree,
    mainTreemap: {
      currentStatsPath: tree.path,
      currentVisualizationPath: tree.path,
      ignored: [],
      isRecalculationEnabled: false,
      previousPathStack: [],
      thresholds: defaultColorThresholds,
      colors: defaultColors,
    },
    simulation: {
      isSimulationMode: false,
      lastUsedRemovedAuthorsList: [],
      miniTreemap: {
        previousPathStack: [],
        previousVisualizationData: [],
        visualizationPath: tree.path,
      },
      removedAuthors: [],
    },
    extensionFilters: [],
    regexFilters: [],
  };
}

function goThroughTree(tree, path) {
  if (path === ".") return tree;

  const parts = path.split("/");
  let node = tree;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === 0 && part === "") continue;
    node = node.children.filter((it) => it.name === part)[0];
  }
  return node;
}

function getDataRecalculated(fullData, pathQuery, developersToRemove) {
  let newData = goThroughTree(fullData, pathQuery);
  return calculateBusFactor(newData, developersToRemove);
}

export function initializeBusFactorDeltaProperties(node) {
  if (node == null) throw new Error("Empty data file");

  if (node.children) {
    return {
      ...node,
      children: node.children.map((it) => {
        const result = Object.fromEntries(
          Object.entries(it).filter((e) => e[0] !== "children")
        );
        if (!result.busFactorStatus) {
          result["busFactorStatus"] = {};
          return result;
        }
        return {
          ...result,
          busFactorStatus: {
            ...result.busFactorStatus,
            nodeStatus: "original",
            delta: 0,
          },
        };
      }),
    };
  }

  return {
    ...node,
    ...(!node.busFactorStatus && { busFactorStatus: {} }),
  };
}

export function getRecalculatedBusFactorData(baseData, developersToRemove) {
  let newData = calculateBusFactor(baseData, developersToRemove);
  return newData;
}

function getDataFromCurrentData(currentData, developersToRemove, filters) {
  let newData = currentData;
  let result = calculateBusFactor(currentData, developersToRemove);
}

export function getBusFactorDeltas(oldDataRootNode, newDataRootNode) {
  let newDataRootNodeCopy = { ...newDataRootNode };
  newDataRootNodeCopy.busFactorStatus = {
    ...newDataRootNodeCopy.busFactorStatus,
  };
  if (newDataRootNodeCopy.children)
    newDataRootNodeCopy.children = [...newDataRootNodeCopy.children];

  if (oldDataRootNode === null) {
    throw new Error("Old data is null!");
  }

  if (oldDataRootNode.name !== newDataRootNodeCopy.name) {
    throw new Error("Names don't match!");
  }

  if (
    "busFactor" in oldDataRootNode.busFactorStatus &&
    "busFactor" in newDataRootNodeCopy.busFactorStatus
  ) {
    let delta =
      newDataRootNodeCopy.busFactorStatus.busFactor -
      oldDataRootNode.busFactorStatus.busFactor;
    // console.log(newDataRootNode.path, newDataRootNode.busFactorStatus);
    newDataRootNodeCopy.busFactorStatus.delta = delta;
    newDataRootNodeCopy.busFactorStatus.nodeStatus =
      oldDataRootNode.busFactorStatus.busFactor + delta <= 0
        ? "lost"
        : delta < 0
        ? "decrease"
        : "original";

    if (oldDataRootNode.busFactorStatus.busFactor === 0) {
      newDataRootNodeCopy.busFactorStatus.nodeStatus = "original";
    }

    if (
      oldDataRootNode.children &&
      newDataRootNodeCopy.children &&
      newDataRootNodeCopy.children.length === oldDataRootNode.children.length
    ) {
      for (
        let oldCount = 0;
        oldCount < oldDataRootNode.children.length;
        oldCount++
      ) {
        let newCount = 0;
        let oldPath = oldDataRootNode.children[oldCount].path;

        while (
          oldPath !== newDataRootNodeCopy.children[newCount].path &&
          newCount < newDataRootNodeCopy.children.length
        ) {
          newCount++;
        }

        if (
          !newDataRootNodeCopy.busFactorStatus.old &&
          !newDataRootNodeCopy.busFactorStatus.ignored
        )
          newDataRootNodeCopy.children[oldCount] = getBusFactorDeltas(
            oldDataRootNode.children[oldCount],
            newDataRootNodeCopy.children[oldCount]
          );
      }
    }
  }
  return newDataRootNodeCopy;
}

function getDifference(a1, a2) {
  var a2Set = new Set(a2);
  return a1.filter(function (x) {
    return !a2Set.has(x);
  });
}

// Definition of the slice and its reducer function
const treemapSlice = createSlice({
  name: "treemap",
  initialState: convertTreeToState(defaultTree),
  reducers: {
    setNewTree: (state, action) => {
      return { ...convertTreeToState(action.payload) };
    },
    // not as useful anymore, URL takes precedence, or at least, it should
    returnMainTreemapHome: (state) => {
      const path = state.tree.path;
      return {
        ...state,
        mainTreemap: {
          ...state.mainTreemap,
          currentVisualizationPath: path,
          currentStatsPath: path,
        },
      };
    },
    returnMiniTreemapHome: (state) => {
      let newData = getDataRecalculated(
        state.tree,
        ".",
        state.simulation.removedAuthors
      );

      return {
        ...state,
        simulation: {
          ...state.simulation,
          miniTreemap: {
            ...state.simulation.miniTreemap,
            visualizationData: newData,
            visualizationPath: newData.path,
          },
        },
      };
    },
    // click on a file node
    scopeStatsIn: (state, action) => {
      if (
        action.payload &&
        action.payload.path &&
        action.payload.path !== state.mainTreemap.currentStatsPath
      ) {
        const newPath = `${action.payload.path}`;
        // TODO: delete?
        let newData = goThroughTree(state.tree, newPath);
        console.log("scopeStatsIn", newData, newPath);
        if (newData) {
          return {
            ...state,
            mainTreemap: {
              ...state.mainTreemap,
              currentStatsPath: newPath,
            },
          };
        }
        console.log("scopeStatsIn", "not changed");
        return state;
      }
    },
    // click on a folder node
    scopeMainTreemapIn: (state, action) => {
      if (
        action.payload.path &&
        action.payload.path !== state.mainTreemap.currentVisualizationPath
      ) {
        const nextPath = `${action.payload.path}`;
        let newData = goThroughTree(state.tree, nextPath);
        console.log("scopeTreemapIn", newData, nextPath);

        if (newData && newData.children) {
          const prevStack = Array.from(state.mainTreemap.previousPathStack);
          prevStack.push(state.mainTreemap.currentVisualizationPath);
          return {
            ...state,
            mainTreemap: {
              ...state.mainTreemap,
              previousPathStack: prevStack,
              currentVisualizationPath: nextPath,
              currentStatsPath: nextPath,
            },
            simulation: {
              ...state.simulation,
              miniTreemap: {
                ...state.simulation.miniTreemap,
                visualizationPath: nextPath,
              },
            },
          };
        }
        return state;
      }
    },
    // click the back button
    scopeMainTreemapOut: (state) => {
      const newStack = Array.from(state.mainTreemap.previousPathStack);
      const nextPath = newStack.pop();
      const fullData = state.tree;

      if (nextPath) {
        let newData = goThroughTree(fullData, nextPath);
        console.log("scopeTreemapOut", newData, nextPath);
        return {
          ...state,
          mainTreemap: {
            ...state.mainTreemap,
            previousPathStack: newStack,
            currentVisualizationPath: nextPath,
            currentStatsPath: nextPath,
          },
          simulation: {
            ...state.simulation,
            miniTreemap: {
              ...state.simulation.miniTreemap,
              visualizationPath: nextPath,
            },
          },
        };
      }
    },
    scopeMiniTreemapIn: (state, action) => {
      if (action.payload) {
        const nextPath = `${action.payload.path}`;
        console.log(
          "scopeMiniTreemapIn",
          nextPath,
          state.simulation.removedAuthors
        );

        return {
          ...state,
          simulation: {
            ...state.simulation,
            lastUsedRemovedAuthorsList: state.simulation.removedAuthors,
            miniTreemap: {
              ...state.simulation.miniTreemap,
              visualizationPath: nextPath,
            },
          },
        };
      }
    },
    scopeMiniTreemapOut: (state, action) => {
      const nextPath = action.payload.path;
      console.log("scopeMiniTreemapOut", nextPath);
      return {
        ...state,
        simulation: {
          ...state.simulation,
          miniTreemap: {
            ...state.simulation.miniTreemap,
            visualizationPath: nextPath,
          },
        },
      };
    },
    addFilter: (state, action) => {
      const newFilterExps = action.payload;
      if (Array.isArray(newFilterExps) && newFilterExps.length > 0) {
        return {
          ...state,
          regexFilters: [...new Set(state.regexFilters.concat(newFilterExps))],
        };
      }
    },
    removeFilter: (state, action) => {
      const newFilterExps = action.payload;
      if (Array.isArray(newFilterExps) && newFilterExps.length > 0) {
        return {
          ...state,
          regexFilters: state.regexFilters.filter(
            (element) => !newFilterExps.includes(element)
          ),
        };
      }
    },
    addExtensionFilter: (state, action) => {
      const newFilterExps = action.payload;
      if (Array.isArray(newFilterExps) && newFilterExps.length > 0) {
        return {
          ...state,
          extensionFilters: [...new Set(state.extensionFilters.concat(newFilterExps))],
        };
      }
    },
    removeExtensionFilter: (state, action) => {
      const newFilterExps = action.payload;
      if (Array.isArray(newFilterExps) && newFilterExps.length > 0) {
        return {
          ...state,
          extensionFilters: state.extensionFilters.filter(
            (element) => !newFilterExps.includes(element)
          ),
        };
      }
    },
    removeAllFilters: (state) => {
      return {
        ...state,
        regexFilters: [],
        extensionFilters: [],
      };
    },
    enableSimulationMode: (state, action) => {
      return {
        ...state,
        simulation: {
          ...state.simulation,
          isSimulationMode: true,
        },
      };
    },
    disableSimulationMode: (state, action) => {
      return {
        ...state,
        simulation: {
          ...state.simulation,
          isSimulationMode: false,
        },
      };
    },
    addAuthorToRemovalList: (state, action) => {
      const authors = action.payload;
      const removedAuthors = state.simulation.removedAuthors;
      return {
        ...state,
        simulation: {
          ...state.simulation,
          lastUsedRemovedAuthorsList: removedAuthors,
          removedAuthors: [
            ...new Set(state.simulation.removedAuthors.concat(authors)),
          ],
        },
      };
    },
    undoAuthorRemoval: (state, action) => {
      const authors = action.payload;
      return {
        ...state,
        simulation: {
          ...state.simulation,
          removedAuthors: state.simulation.removedAuthors.filter(
            (element) => !authors.includes(element)
          ),
        },
      };
    },
    clearAuthorRemovalList: (state) => {
      const removedAuthors = state.simulation.removedAuthors;
      return {
        ...state,
        simulation: {
          ...state.simulation,
          lastUsedRemovedAuthorsList: removedAuthors,
          removedAuthors: [],
        },
      };
    },
    setColorThresholds: (state, action) => {
      const newThresholds = action.payload;
      console.log("setColorThresholds", newThresholds);
      return {
        ...state,
        mainTreemap: {
          ...state.mainTreemap,
          thresholds: newThresholds,
        },
      };
    },
    resetColorThresholdsToDefaults: (state) => {
      return {
        ...state,
        mainTreemap: {
          ...state.mainTreemap,
          thresholds: defaultColorThresholds,
        },
      };
    },
    setColors: (state, action) => {
      const newColors = action.payload;
      return {
        ...state,
        mainTreemap: {
          ...state.mainTreemap,
          colors: newColors,
        },
      };
    },
    resetColorsToDefaults: (state) => {
      return {
        ...state,
        mainTreemap: {
          ...state.mainTreemap,
          colors: defaultColors,
        },
      };
    },
  },
});

// Exports
export const {
  setNewTree,
  // Treemap Navigation actions
  scopeStatsIn,
  scopeMainTreemapIn,
  scopeMainTreemapOut,
  returnMainTreemapHome,
  // regex filter actions
  addFilter,
  addExtensionFilter,
  removeFilter,
  removeExtensionFilter,
  removeAllFilters,
  // color and color threshold actions
  setColors,
  resetColorsToDefaults,
  setColorThresholds,
  resetColorThresholdsToDefaults,
  // simulation mode actions
  enableSimulationMode,
  disableSimulationMode,
  returnMiniTreemapHome,
  scopeMiniTreemapIn,
  scopeMiniTreemapOut,
  addAuthorToRemovalList,
  undoAuthorRemoval,
} = treemapSlice.actions;
//treemap data selectors
export const selectFullData = (state) => state.treemap.mainTreemap.fullData;
export const selectCurrentVisualizationData = (state) =>
  goThroughTree(
    state.treemap.tree,
    state.treemap.mainTreemap.currentVisualizationPath
  );
export const selectCurrentVisualizationPath = (state) =>
  state.treemap.mainTreemap.currentVisualizationPath;
export const selectCurrentStatsData = (state) =>
  goThroughTree(state.treemap.tree, state.treemap.mainTreemap.currentStatsPath);

export const selectCurrentStatsPath = (state) =>
  state.treemap.mainTreemap.currentStatsPath;
//filter selectors
export const selectAllFilters = (state) => state.treemap.regexFilters;
export const selectExtensionFilters = (state) => state.treemap.extensionFilters;
//simulation mode selectors
export const isSimulationMode = (state) =>
  state.treemap.simulation.isSimulationMode;
export const simulationVisualizationData = (state) => {
  const path = state.treemap.simulation.miniTreemap.visualizationPath;
  // TODO: add recalculation logic authors
  if (state.treemap.simulation.isSimulationMode) {
    const newData = getDataRecalculated(
      state.treemap.tree,
      path,
      state.treemap.simulation.removedAuthors
    );
    let oldData = goThroughTree(state.treemap.tree, path);
    return getBusFactorDeltas(oldData, newData);
  }
  // TODO: replace
  return initializeBusFactorDeltaProperties(
    goThroughTree(state.treemap.tree, path)
  );
};

export const selectColorThresholds = (state) =>
  state.treemap.mainTreemap.thresholds;
export const selectColorPalette = (state) => state.treemap.mainTreemap.colors;

export const simulationVisualizationPath = (state) =>
  state.treemap.simulation.miniTreemap.visualizationPath;
export const selectRemovedAuthors = (state) =>
  state.treemap.simulation.removedAuthors;
export default treemapSlice.reducer;
