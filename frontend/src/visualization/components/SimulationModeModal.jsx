/** @format */

import {format} from "../d3/format.tsx";
import * as tiling from "../d3/tiling.tsx";
import React, {useState} from "react";
import {CONFIG} from "../config";
import TreeMap from "./TreeMap";

import {generateBreadcrumb} from "../utils/url.tsx";
import {useTranslation} from "react-i18next";
import {InfoPanel} from "./InfoPanel";
import {
  addAuthorToRemovalList,
  disableSimulationMode,
  enableSimulationMode,
  scopeMiniTreemapIn,
  selectRemovedAuthors,
  undoAuthorRemoval,
} from "../reducers/treemapSlice.js";
import {payloadGenerator} from "../utils/reduxActionPayloadCreator.tsx";
import {useSelector} from "react-redux";
import {Modal} from "react-bootstrap";
import LegendSimColor from "./LegendSimColor.jsx";
import Island from "@jetbrains/ring-ui/dist/island/island";
import Header from "@jetbrains/ring-ui/dist/island/header";
import Content from "@jetbrains/ring-ui/dist/island/content";
import Button from "@jetbrains/ring-ui/dist/button/button";
import experimentIcon from '@jetbrains/icons/experiment-20px';
import Icon from "@jetbrains/ring-ui/dist/icon/icon";
import {ControlsHeight, ControlsHeightContext} from "@jetbrains/ring-ui/dist/global/controls-height";
import List from "@jetbrains/ring-ui/dist/list/list";
import {Input, Size} from "@jetbrains/ring-ui/dist/input/input";
import arrowUpIcon from "@jetbrains/icons/arrow-up";
import archiveIcon from "@jetbrains/icons/archive";
import ButtonSet from "@jetbrains/ring-ui/dist/button-set/button-set";
import {Col, Grid, Row} from "@jetbrains/ring-ui/dist/grid/grid";

function SimulationModeModal(props) {
  const {t, i18n} = useTranslation();
  const formatPercentage = format(",.1%");
  const formatSI = format(".3s");

  const simulationVisualizationData = props.simulationData;
  const simulationVisualizationPath = props.simulationPath;
  const authorsList =
    "users" in simulationVisualizationData
      ? [...simulationVisualizationData.users]
      : undefined;
  const [show, setShow] = useState(false);

  const setTreemapPathOutFunc = (path) => {
    props.reduxNavFunctions.dispatch(
      props.reduxNavFunctions.scopeMiniTreemapOut(
        payloadGenerator("path", path)
      )
    );
  };
  const returnTreeMapHome = () => {
    props.reduxNavFunctions.dispatch(
      props.reduxNavFunctions.scopeMiniTreemapIn(payloadGenerator("path", "."))
    );
  };

  let authorsListContributionPercentage = undefined;
  const [nameFilterValue, setNameFilterValue] = useState("");
  const removedAuthorsList = useSelector(selectRemovedAuthors);

  if (authorsList) {
    authorsList.sort((a, b) => b.authorship - a.authorship);
    let cumulativeAuthorship = authorsList
      .map((element) => element.authorship)
      .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

    authorsListContributionPercentage = authorsList.map(
      (authorContributionPair) => {
        return {
          email: authorContributionPair.email,
          authorship: authorContributionPair.authorship,
          relativeScore:
            authorContributionPair.authorship / cumulativeAuthorship,
          included: !removedAuthorsList.includes(authorContributionPair.email),
        };
      }
    );
  }

  const handleSearchTextChange = (event) => {
    if (event.target.value) {
      let filterValue = String(event.target.value).trim();
      if (filterValue.length > 1) {
        setNameFilterValue(filterValue);
      } else {
        setNameFilterValue("");
      }
    } else {
      setNameFilterValue("");
    }
  };

  const handleAuthorCheckmark = (authorEmail) => {
    if (!removedAuthorsList.includes(authorEmail)) {
      props.reduxNavFunctions.dispatch(addAuthorToRemovalList([authorEmail]));
      props.reduxNavFunctions.dispatch(
        scopeMiniTreemapIn(
          payloadGenerator("path", simulationVisualizationPath)
        )
      );
    } else {
      props.reduxNavFunctions.dispatch(undoAuthorRemoval([authorEmail]));
      props.reduxNavFunctions.dispatch(
        scopeMiniTreemapIn(
          payloadGenerator("path", simulationVisualizationPath)
        )
      );
    }
  };

  const handleClose = () => {
    setShow(false);
    props.reduxNavFunctions.dispatch(disableSimulationMode());
  };
  const handleShow = () => {
    setShow(true);
    props.reduxNavFunctions.dispatch(enableSimulationMode());
  };

  return (

    <>
      <Island>
        <Header border>
          Simulation Mode{" "}
          <InfoPanel
            divName="simInfoPanel"
            header="How does the simulation mode work?"
            body={[
              t("simMode.general"),
              t("simMode.detail"),
              t("simMode.links"),
            ]}></InfoPanel>
          <a
            className=""
            data-bs-toggle="collapse"
            href="#simulationModeCollapsible"
            role="button"
            aria-expanded="true"
            aria-controls="simulationModeCollapsible">
            <i className="bi bi-plus-circle-fill"></i>
            <i className="bi bi-dash-circle-fill"></i>
          </a>
        </Header>
        <Content>
          <div
            id="simulationModeCollapsible"
            className="collapse show">
            <p className="small">
              Using this mode, we can highlight if the bus factor changes when one or more
              authors leave
            </p>
            <ControlsHeightContext.Provider value={ControlsHeight.L}>
              <Button primary onClick={handleShow}><Icon glyph={experimentIcon}/> Use Simulation Mode</Button>
            </ControlsHeightContext.Provider>
          </div>

        </Content>
      </Island>

      {/* Modal */}
      <Modal
        show={show}
        onHide={handleClose}
        size="fullscreen">
        <Modal.Header closeButton>
          <Modal.Title>Simulate Author Removal</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Grid>
            <Row>
              <Col xs={9} sm={9} md={9} lg={9}>
                <center>
                  <TreeMap
                    colorDefinitions={CONFIG.general.colors.jetbrains}
                    containerId={CONFIG.simulation.ids.treemapContainerId}
                    data={simulationVisualizationData}
                    dataNormalizationFunction={Math.log2}
                    dataPath={simulationVisualizationPath}
                    initialHeight={CONFIG.simulation.layout.height}
                    initialWidth={CONFIG.simulation.layout.width}
                    padding={CONFIG.simulation.layout.overallPadding}
                    svgId={CONFIG.simulation.ids.treemapSvgId}
                    tilingFunction={tiling.squarify}
                    topPadding={CONFIG.simulation.layout.topPadding}
                    type="mini"
                    reduxNavFunctions={props.reduxNavFunctions}></TreeMap>
                </center>
              </Col>
              <Col xs={3} sm={3} md={3} lg={3}>
                <div style={{marginBottom: 20}}>
                  <nav aria-label="breadcrumb">
                    <strong>Path:</strong>
                    <ol className="breadcrumb">
                      {simulationVisualizationPath
                        .split("/")
                        .map((pathElement, i) => (
                          <li
                            className={
                              i < simulationVisualizationPath.split("/").length - 1
                                ? "btn btn-link breadcrumb-item p-1"
                                : "btn btn-link breadcrumb-item active p-1"
                            }
                            key={pathElement}
                            onClick={() =>
                              setTreemapPathOutFunc(
                                generateBreadcrumb(i, simulationVisualizationPath)
                              )
                            }>
                            {pathElement}
                          </li>
                        ))}
                    </ol>
                  </nav>

                  <center>
                    <ButtonSet>
                      <Button
                        onClick={() =>
                          simulationVisualizationPath
                            .split("/")
                            .filter((r) => r !== "").length > 1
                            ? setTreemapPathOutFunc(
                              simulationVisualizationPath
                                .split("/")
                                .slice(0, -1)
                                .join("/")
                            )
                            : setTreemapPathOutFunc(".")}
                      ><Icon glyph={arrowUpIcon}/> Up</Button>
                      <Button
                        primary
                        onClick={() => returnTreeMapHome()}>
                        <Icon glyph={archiveIcon}/> Home</Button>
                    </ButtonSet>
                  </center>
                </div>


                {/*TODO: add same width for input and list*/}
                <Input
                  onChange={handleSearchTextChange}
                  size={Size.L}
                ></Input>

                <List
                  maxHeight={600}
                  shortcuts={true}
                  onSelect={(item, e) => {
                    handleAuthorCheckmark(item.label)
                  }}
                  data={
                    authorsList && authorsListContributionPercentage
                      ? authorsListContributionPercentage
                        .filter((element) =>
                          element["email"].includes(nameFilterValue)
                        )
                        .sort((a, b) => b.relativeScore - a.relativeScore)
                        .map((authorScorePair, index) => (
                          {
                            label: authorScorePair.email,
                            details: formatPercentage(authorScorePair.relativeScore),
                            rgItemType: List.ListProps.Type.ITEM,
                            checkbox: !removedAuthorsList.includes(authorScorePair.email)
                          }
                        ))
                      : []
                  }
                />


              </Col>
            </Row>
          </Grid>

          <LegendSimColor></LegendSimColor>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default SimulationModeModal;
