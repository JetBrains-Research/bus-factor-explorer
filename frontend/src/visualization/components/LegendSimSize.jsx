/** @format */

import React from "react";
import { InfoPanel } from "./InfoPanel";
import { generateSvgSquare } from "../d3/legend.tsx";
import { CONFIG } from "../config";
import { useTranslation } from "react-i18next";


function LegendSimSize(props) {


  return (
    <div
      id="legend-size-container-mini"
      className="col mx-2">
      <div
        id="legendSizeCollapsible">
        {/* <p className="small">
          We have a log base 2 scale for size. Sizes are relative to other tiles
          on the same directory-level and represent file/folder size in bytes
        </p> */}
        <div className="justify-content-start align-items-center g-2 m-2">
          <div className="col">
            {generateSvgSquare(
              "2rem",
              CONFIG.general.colors.jetbrains.black
            )}
          </div>
          <div className="col">1x</div>
        </div>
        <div className="justify-content-start align-items-center g-2 m-2">
          <div className="col">
            {generateSvgSquare(
              "4rem",
              CONFIG.general.colors.jetbrains.black
            )}
          </div>
          <div className="col">10x</div>
        </div>
      </div>
    </div>
  );
}

export default LegendSimSize;
