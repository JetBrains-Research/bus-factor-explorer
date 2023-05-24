import React from "react";
import Loader from "@jetbrains/ring-ui/dist/loader/loader";
import ProgressBar from "@jetbrains/ring-ui/dist/progress-bar/progress-bar";

export function LoaderWithProgress(props) {
  return (<div style={{
    paddingTop: '25vh',
    paddingBottom: '25vh',
  }}>
    <Loader
      message={props.message}
      style={{paddingBottom: "16px"}}
    />

    <center>
      <ProgressBar label="Progress" value={props.loadProgress} style={{width: 300}}/>
    </center>
  </div>)
}