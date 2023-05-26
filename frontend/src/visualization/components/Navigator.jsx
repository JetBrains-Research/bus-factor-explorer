/** @format */

import React, { useState, useMemo } from "react";
import { batch, useSelector } from "react-redux";

import {InfoPanel} from "./InfoPanel";
import {useTranslation} from "react-i18next";

import {CONFIG} from "../config";
import {
  addFilter,
  addExtensionFilter,
  removeAllFilters,
  removeExtensionFilter,
  removeFilter,
  selectAllFilters,
  selectExtensionFilters,
} from "../reducers/treemapSlice"
import FilterWithInput from "./FilterWithInput";
import SimulationModeModal from "./SimulationModeModal";
import LegendSize from "./LegendSize";
import { generateBreadcrumb, getFileExtension } from "../utils/url.tsx";
import { Form } from "react-bootstrap";
import ButtonSet from "@jetbrains/ring-ui/dist/button-set/button-set";
import Button from "@jetbrains/ring-ui/dist/button/button";
import arrowUpIcon from '@jetbrains/icons/arrow-up';
import archiveIcon from '@jetbrains/icons/archive';
import Icon from "@jetbrains/ring-ui/dist/icon/icon";
import Island from "@jetbrains/ring-ui/dist/island/island";
import Header from "@jetbrains/ring-ui/dist/island/header";
import Content from "@jetbrains/ring-ui/dist/island/content";


function Navigator(props) {
  const dispatch = props.dispatch;
  const currentPath = props.path;
  const setPathFunc = props.setPathFunc;
  const simulationData = props.simulationData;
  const simulationPath = props.simulationPath;
  const statsData = props.statsData;

  const filterTemplates = CONFIG.filters;
  const [isDotFilterApplied, setIsDotFilterApplied] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState();
  const {t, i18n} = useTranslation();

  const currentExtensionsList = useMemo(() => {
    if ("children" in simulationData) {
      return Array.from(
        new Set(
          simulationData.children
            .map((item, index) => {
              const extension = getFileExtension(item.name);
              if (extension !== undefined) return extension;
            })
            .filter((ext) => ext !== undefined)
        )
      ).sort();
    } else {
      return [];
    }
  });

  const currentExtensionsFilteredList = useSelector(selectExtensionFilters);

  console.log(currentExtensionsList);

  const handleDotFilterSwitch = (event) => {
    setIsDotFilterApplied(!isDotFilterApplied);

    if (event.target.checked) {
      dispatch(addFilter(CONFIG.commonFilterExpressions.startingWithDot));
    } else if (!event.target.checked) {
      dispatch(removeFilter(CONFIG.commonFilterExpressions.startingWithDot));
    }
  };

  const handleFilterDropdown = (event) => {
    const dropdownSelection = event.target.innerText;
    setCurrentTemplate(dropdownSelection);
    batch(() => {
      dispatch(addFilter(filterTemplates[dropdownSelection].extensions));
    });
  };


  const handleFilterCheck = (extension, event) => {
    console.log(event.target.checked);

    if (event.target.checked) {
      dispatch(removeExtensionFilter([extension]))
    }
    else {
      dispatch(addExtensionFilter([extension]))
    }
  };


  const pathIsland = () => {
    return <Island>
      <Header border>
        Current Path{" "}
        <InfoPanel
          divName="currentPathInfoPanel"
          header="What is the current path"
          body={[
            t("currentPath.general"),
            t("currentPath.details"),
          ]}></InfoPanel>
        <a
          className=""
          data-bs-toggle="collapse"
          data-bs-target="#pathNavCollapsible"
          role="button"
          aria-expanded="true"
          aria-controls="collapseExample">
          <i className="bi bi-plus-circle-fill"></i>
          <i className="bi bi-dash-circle-fill"></i>
        </a>
      </Header>
      <Content>
        <div
          id="pathNavCollapsible"
          className="collapse show">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              {currentPath.split("/").map((pathElement, i) => (
                <li
                  className={
                    i < currentPath.split("/").length - 1
                      ? "btn btn-link breadcrumb-item p-1"
                      : "btn btn-link breadcrumb-item active p-1"
                  }
                  key={pathElement}
                  onClick={() =>
                    setPathFunc(generateBreadcrumb(i, currentPath))
                  }>
                  {pathElement}
                </li>
              ))}
            </ol>
          </nav>

          <ButtonSet>
            <Button
              onClick={() =>
                currentPath.split("/").filter((r) => r !== "").length > 1
                  ? setPathFunc(currentPath.split("/").slice(0, -1).join("/"))
                  : setPathFunc(".")
              }
            ><Icon glyph={arrowUpIcon}/> Up</Button>
            <Button
              primary
              onClick={() => setPathFunc(".")}>
              <Icon glyph={archiveIcon}/> Home</Button>
          </ButtonSet>
        </div>
      </Content>
    </Island>
  }

  const filterIsland = () => {
    return <Island>
      <Header border>
        Filters{" "}
        <InfoPanel
          divName="filtersInfoPanel"
          header="What are filters"
          body={[t("filters.general")]}></InfoPanel>
        <a
          className=""
          data-bs-toggle="collapse"
          href=".filtersCollapsible"
          role="button"
          aria-expanded="true"
          aria-controls="collapseExample">
          <i className="bi bi-plus-circle-fill"></i>
          <i className="bi bi-dash-circle-fill"></i>
        </a>
      </Header>

      <Content>
        <div className="filtersCollapsible collapse show">
          <FilterWithInput
            key="Regex"
            filterPropertyType="RegEx"
            summary={"Only pattern matches are shown"}
            addFunction={addFilter}
            removeFunction={removeFilter}
            removeAllFunction={removeAllFilters}
            selector={selectAllFilters}
            dispatch={dispatch}
            infoPanelDetails={[
              t("filters.regex"),
              t("filters.links"),
            ]}>
            </FilterWithInput>

          <h6>Suggested Filters</h6>
          <div
            className="dropdown open filtersCollapsible show row text-start"
            style={{
              maxHeight: "15vh",
              overflowY: "scroll",
            }}>
            <Form>
              {currentExtensionsList.map((extension, index) => {
                return (
                  <Form.Check key={extension}>
                    <Form.Check.Input
                      id={`${extension}-checkbox`}
                      checked={
                        !currentExtensionsFilteredList.includes(extension)
                      }
                      onChange={(event) =>
                        handleFilterCheck(extension, event)
                      }></Form.Check.Input>
                    <Form.Check.Label>
                      <small>{`.${extension}`}</small>
                    </Form.Check.Label>
                  </Form.Check>
                );
              })}
              </Form>
            </div>
          </div>
        </Content>
    </Island>
  }

  return (
    <>
      {addMargin(pathIsland())}
      {addMargin(filterIsland())}
      {addMargin(
        <SimulationModeModal
          statsData={statsData}
          simulationData={simulationData}
          simulationPath={simulationPath}
          reduxNavFunctions={props.reduxNavFunctions}></SimulationModeModal>
      )}
      <LegendSize></LegendSize>
    </>
  );
}

export default Navigator;


// TODO: refactor must be a better way
export const addMargin = (elem) => {
  const margin = {
    marginBottom: 20
  }
  return <div style={margin}>
    {elem}
  </div>
}