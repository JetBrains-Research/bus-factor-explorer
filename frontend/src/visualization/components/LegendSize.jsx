/** @format */

import React from "react";
import {InfoPanel} from "./InfoPanel";
import {generateSvgSquare} from "../d3/legend.tsx";
import {CONFIG} from "../config";
import {useTranslation} from "react-i18next";
import Island from "@jetbrains/ring-ui/dist/island/island";
import Header from "@jetbrains/ring-ui/dist/island/header";
import Content from "@jetbrains/ring-ui/dist/island/content";


function LegendSize(props) {
  const {t} = useTranslation();

  return (
    <Island>
      <Header border>
        Size{" "}
        <InfoPanel
          divName="legendSizeInfoPanel"
          header="How is size determined for the treemap panels"
          body={[t("busFactor.size")]}></InfoPanel>
        <a
          className=""
          data-bs-toggle="collapse"
          data-bs-target="#legendSizeCollapsible"
          role="button"
          aria-expanded="true"
          aria-controls="legendSizeCollapsible">
          <i className="bi bi-plus-circle-fill"></i>
          <i className="bi bi-dash-circle-fill"></i>
        </a>

      </Header>
      <Content>
        <div
          id="legendSizeCollapsible"
          className="collapse show">
          <div className="row justify-content-start align-items-center g-2 m-2">
            <div className="col">
              {generateSvgSquare(
                "2.828rem",
                CONFIG.general.colors.jetbrains.black
              )}
            </div>
            <div className="col">10 kB</div>
          </div>
          <div className="row justify-content-start align-items-center g-2 m-2">
            <div className="col">
              {generateSvgSquare(
                "4rem",
                CONFIG.general.colors.jetbrains.black
              )}
            </div>
            <div className="col">100 kB</div>
          </div>
        </div>
      </Content>
    </Island>
  );
}

export default LegendSize;
