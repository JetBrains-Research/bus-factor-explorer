/** @format */

import { React, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactSlider from "react-slider";
import {pickTextColorBasedOnBgColor} from "../utils/color.tsx"
import {
  selectColorPalette,
  selectColorThresholds,
  setColorThresholds,
} from "../reducers/treemapSlice";

export function BusFactorControls(props) {
  const [show, setShow] = useState(false);
  const colorPalette = useSelector(selectColorPalette);
  const colorThresholds = useSelector(selectColorThresholds);
  const dispatch = useDispatch();

  const handleSliderChange = (result, index) => {
    console.log("handleSliderChange", result, index);
    console.log("Thresholds in handle func", colorThresholds);
    let newColorThresholds = Array.from(colorThresholds);

    console.log("newThresholds in handle func", newColorThresholds);
    dispatch(setColorThresholds(result));
  };

  return (
    <div className="container mt-2">
      <div className="row mt-2">
        <small>Choose the values at which the colors switchover</small>
      </div>
      <div
        className="row"
        id="slider-row">
        <div className="col-1">
          <small>1</small>
        </div>
        <ReactSlider
          className="horizontal-slider col-8"
          thumbClassName="slider-thumb"
          thumbActiveClassName="slider-thumb-active"
          withTracks={true}
          trackClassName="slider-track"
          value={colorThresholds}
          ariaLabelledby={["Leftmost thumb", "Middle thumb", "Rightmost thumb"]}
          renderThumb={(props, state) => (
            <div {...props}>
              <div style={{
                backgroundColor: colorPalette[state.index + 1],
                borderRadius: "100%"
              }}>
                <strong style={{
                  color: pickTextColorBasedOnBgColor(colorPalette[state.index + 1], "rgb(255,255,255)", "rgb(0,0,0)")
                }}>{state.valueNow}</strong>
              </div>
            </div>
          )}
          pearling={true}
          minDistance={1}
          min={1}
          max={20}
          onAfterChange={handleSliderChange}
        />
        <div className="col-1">
          <small>20</small>
        </div>
      </div>
    </div>
  );
}
