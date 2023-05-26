/** @format */
import React, { MouseEventHandler } from "react";

export const generateSvgSquare = (size: string | number | undefined, color: string | undefined) => {
      if (size && color)
        return (
            <svg
                style={{
                    fill: color,
                    stroke: "#646464",
                    strokeWidth: "1px",
                    strokeLinejoin: "round"
                }}
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                className="bi bi-square-fill"
                viewBox="0 0 16 16">
                <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2z"/>
            </svg>
        );
};


export const generateSvgSquareActive = (size: string | number | undefined, color: string | undefined, onClick: MouseEventHandler) => {
  if (size && color)
    return (
      <svg
        onClick={onClick}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        fill={color}
        className="bi bi-square-fill"
        viewBox="0 0 16 16">
        <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2z" />
      </svg>
    );
}

