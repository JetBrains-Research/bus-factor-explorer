/** @format */

import React from "react";
import { CONFIG } from "../config";
import { generateSvgSquare } from "../d3/legend.tsx";
import { InfoPanel } from "./InfoPanel";
import { useTranslation } from "react-i18next";

function LegendSimColor(props) {
  const { t } = useTranslation();
  const jetbrainsColors = CONFIG.general.colors.jetbrains;
  const scale = [
    {
      color: jetbrainsColors.golden,
      label: "Bus Factor decreased",
    },
    {
      color: jetbrainsColors.brightRed,
      label: "Bus Factor decreased to 0",
    },
    {
      color: jetbrainsColors.gray,
      label: "No change",
    },
  ];

  return (
    <>
      <div
        id="legend-color-mini"
        className="row mt-2 mx-2">
          <h6> Color </h6>
        {scale.map((element) => {
          return (
            <div
              key={element.label}
              className="col-auto mx-0 my-2">
              {generateSvgSquare("1.5rem", element.color)} <strong>{element.label}</strong>
            </div>
          );
        })}
      </div>
      <div
        className="offcanvas offcanvas-start"
        data-bs-scroll="true"
        tabIndex="-1"
        id="offcanvasWithBothOptions"
        aria-labelledby="offcanvasWithBothOptionsLabel">
        <div className="offcanvas-header">
          <h6
            className="offcanvas-title"
            id="offcanvasWithBothOptionsLabel">
            Backdrop with scrolling
          </h6>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <p>
            Try scrolling the rest of the page to see this option in action.
          </p>
        </div>
      </div>
    </>
  );
}

export default LegendSimColor;
