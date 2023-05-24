import React from "react";

export function SeparatorLine(props) {
  return <div style={{
    display: "flex",
    alignItems: "center",
    marginBottom: "32px",
  }}>
    {line()}
    <div style={{
      padding: "0 2rem"
    }}>
      {props.value}
    </div>
    {line()}
  </div>
}

function line() {
  return <div
    style={{
      flex: "1.0",
      height: "1px",
      backgroundColor: "rgb(0,0,0,0.1)"
    }}
  />
}