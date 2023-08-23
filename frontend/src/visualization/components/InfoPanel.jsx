/** @format */

import React from "react";

function InfoButton(props) {
  return (
    <i
      className="bi bi-info-circle-fill"
      data-bs-toggle="offcanvas"
      data-bs-target={"#" + props.target}></i>
  );
}

function OffCanvasSideBar(props) {
  return (
    <>
      <div
        className="offcanvas offcanvas-start"
        data-bs-scroll="true"
        tabIndex="-1"
        id={props.divName}
        aria-labelledby={props.divName + "Label"}>
        <div className="offcanvas-header">
          <h6
            className="offcanvas-title"
            id={props.divName + "Label"}>
            {props.header}
          </h6>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <p
            style={{
              textAlign: "left",
            }}
            className="fs-6 fw-normal">
            {props.body.map((text) => {
              if (text.startsWith && text.startsWith("http")) {
                return <a key={text} href={text}>{text + "\n"}</a>;
              } else {
                return text + "\n";
              }
            })}
          </p>
        </div>
      </div>
    </>
  );
}

export function InfoPanel(props) {
  return (
    <>
      <InfoButton target={props.divName}></InfoButton>
      <OffCanvasSideBar
        divName={props.divName}
        header={props.header}
        body={props.body}></OffCanvasSideBar>
    </>
  );
}
