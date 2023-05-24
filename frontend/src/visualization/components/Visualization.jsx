/** @format */

import {useCallback, useDeferredValue, useLayoutEffect} from "react";
import {batch, useDispatch, useSelector} from "react-redux";
import {useSearchParams} from "react-router-dom";
import {CONFIG} from "../config";

import {
  returnMainTreemapHome,
  returnMiniTreemapHome,
  scopeMainTreemapIn,
  scopeMiniTreemapIn,
  scopeMiniTreemapOut,
  scopeStatsIn,
  selectAllFilters,
  selectCurrentStatsData,
  selectCurrentStatsPath,
  selectCurrentVisualizationData,
  selectCurrentVisualizationPath,
  simulationVisualizationData,
  simulationVisualizationPath,
} from "../reducers/treemapSlice";

import {payloadGenerator} from "../utils/reduxActionPayloadCreator.tsx";

import * as tiling from "../d3/tiling";

import Navigator from "./Navigator";
import TreeMap from "./TreeMap";
import RightColumn from "./RightColumn";
import {Col, Grid, Row} from "@jetbrains/ring-ui/dist/grid/grid";

function Visualization() {
  const dispatch = useDispatch();

  const currentVisualizationData = useDeferredValue(
    useSelector(selectCurrentVisualizationData)
  );
  const currentVisualizationPath = useDeferredValue(
    useSelector(selectCurrentVisualizationPath)
  );
  const currentStatsData = useDeferredValue(
    useSelector(selectCurrentStatsData)
  );
  const currentStatsPath = useDeferredValue(
    useSelector(selectCurrentStatsPath)
  );
  const filters = useDeferredValue(useSelector(selectAllFilters));

  const currentSimulationModeData = useDeferredValue(
    useSelector(simulationVisualizationData)
  );
  const currentSimulationModePath = useDeferredValue(
    useSelector(simulationVisualizationPath)
  );

  const reduxNavFunctions = {
    dispatch,
    scopeMiniTreemapIn,
    scopeMiniTreemapOut,
    returnMiniTreemapHome
  };

  const [searchParams, setSearchParams] = useSearchParams();

  const setURLPath = useCallback(
    (dataPath, statsPath) => {
      if (dataPath) {
        setSearchParams({
          dataPath: dataPath || "",
          statsPath: dataPath,
        });
      } else if (statsPath) {
        setSearchParams({
          dataPath: searchParams.get("dataPath") || "",
          statsPath: statsPath,
        });
      }
    },
    [searchParams, setSearchParams]
  );

  useLayoutEffect(() => {
    const urlDataPath = searchParams.get("dataPath") || "";
    const urlStatsPath = searchParams.get("statsPath") || "";

    if (urlDataPath && urlDataPath !== currentVisualizationPath) {
      if (urlStatsPath && urlStatsPath !== urlDataPath) {
        batch(() => {
          dispatch(scopeMainTreemapIn(payloadGenerator("path", urlDataPath)));
          dispatch(scopeStatsIn(payloadGenerator("path", urlStatsPath)));
        });
      } else {
        if (urlDataPath === ".") {
          batch(() => {
            dispatch(returnMainTreemapHome());
            dispatch(returnMiniTreemapHome());
          })
          dispatch(scopeStatsIn(payloadGenerator("path", ".")));
        }
        batch(() => {
          dispatch(scopeMainTreemapIn(payloadGenerator("path", urlDataPath)));
        });
      }
    }

    if (
      urlStatsPath &&
      urlStatsPath !== currentStatsPath &&
      urlStatsPath !== urlDataPath
    )
      dispatch(scopeStatsIn(payloadGenerator("path", urlStatsPath)));
  }, [
    setURLPath,
    searchParams,
    setSearchParams,
    currentStatsPath,
    currentVisualizationPath,
    dispatch,
  ]);

  return (

    <Grid>
      <Row>
        <Col xs={3} sm={3} md={2} lg={2}>
          <center>
            <Navigator
              dispatch={dispatch}
              filters={filters}
              path={currentVisualizationPath}
              reduxNavFunctions={reduxNavFunctions}
              setPathFunc={setURLPath}
              simulationPath={currentSimulationModePath}
              simulationData={currentSimulationModeData}
              statsData={currentStatsData}></Navigator>
          </center>
        </Col>
        <Col xs={6} sm={6} md={8} lg={8}>
          <center>
            <TreeMap
              colorDefinitions={CONFIG.general.colors.jetbrains}
              containerId={CONFIG.treemap.ids.treemapContainerId}
              data={currentVisualizationData}
              dataNormalizationFunction={Math.log2}
              dataPath={currentVisualizationPath}
              filters={filters}
              initialHeight={window.innerHeight}
              initialWidth={window.innerWidth * 0.65}
              padding={CONFIG.treemap.layout.overallPadding}
              setPathFunc={setURLPath}
              svgId={CONFIG.treemap.ids.treemapSvgId}
              tilingFunction={tiling.squarify}
              topPadding={CONFIG.treemap.layout.topPadding}
              type="main"></TreeMap>
          </center>
        </Col>
        <Col xs={3} sm={3} md={2} lg={2}>
            <RightColumn statsData={currentStatsData}/>
        </Col>
      </Row>
    </Grid>
  );
}

export default Visualization;
