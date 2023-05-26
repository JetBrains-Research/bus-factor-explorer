/** @format */

import React from "react";
import LegendColor from "./LegendColor";
import StatsPane from "./StatsPane";
import ReactSlider from "react-slider";
import {addMargin} from "./Navigator";
import { SliderPicker } from 'react-color';

function RightColumn(props) {
  const statsData = props.statsData;
  // console.log(`Simulation Viz Path (RightColumn): ${simulationPath}`);

  return (
    <div className="col p-1">
      {addMargin(
        <StatsPane data={statsData}></StatsPane>
      )}
      <center>
        <LegendColor
      summary={"Colors can be picked by clicking on the squares below"}></LegendColor>
      </center>
    </div>
  );
}

export default RightColumn;
