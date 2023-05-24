import React from "react";

import {InfoPanel} from "./InfoPanel";
import python from "highlight.js/lib/languages/python";
import Island from "@jetbrains/ring-ui/dist/island/island";
import Header from "@jetbrains/ring-ui/dist/island/header";
import Content from "@jetbrains/ring-ui/dist/island/content";
import {code, highlight} from "@jetbrains/ring-ui/dist/code/code";
import Button from "@jetbrains/ring-ui/dist/button/button";
import ButtonSet from "@jetbrains/ring-ui/dist/button-set/button-set"
import tableIcon from '@jetbrains/icons/table';
import magicWandIcon from '@jetbrains/icons/magic-wand';
import fileJsonIcon from '@jetbrains/icons/file-json';
import Icon from "@jetbrains/ring-ui/dist/icon";
import {useNavigate} from "react-router-dom";
import {addMargin} from "./Navigator";

highlight.registerLanguage('python', python);
const makePythonSnippet = (owner, repo) => code`
      import pandas as pd
      import plotly.express as px
      
      if __name__ == "__main__":
        df = pd.read_csv(
          "${owner}_${repo}_bus_factor.csv", 
          dtype={"idx": str, "parentIdx": str}
        )
        fig = px.treemap(
          df,
          title="Bus Factor",
          names="filename",
          values="bytes",
          parents="parentIdx",
          ids="idx",
          custom_data=["busFactor", "contributors"],
          color="busFactor",
          maxdepth=2,
          color_continuous_scale="jet_r",
        )
        fig.data[0].textposition = "middle center"
        fig.data[0].tiling = dict(pad=5)
        fig.show()
    `;

export const ExploreData = ({owner, repo}) => {
    const navigate = useNavigate();

    return (
      <Island>
        <Header border>
          Explore Data{" "}
          <InfoPanel
            divName="exploreInfoPanel"
            header="Analyze Bus Factor by yourself"
            body={[
                "You can open chart editor and try to build your own visualizations.",
                <br/>,
                <br/>,
                "Or you can export bus factor in CSV and JSON formats and process it locally.",
                <br/>,
                makePythonSnippet(owner, repo)
            ]}
          />
          <a
            className=""
            data-bs-toggle="collapse"
            data-bs-target="#exploreInfoPanelCollapsible"
            role="button"
            aria-expanded="true"
            aria-controls="exploreInfoPanelCollapsible">
            <i className="bi bi-plus-circle-fill"></i>
            <i className="bi bi-dash-circle-fill"></i>
          </a>
        </Header>
        <Content>
          <div
            id="exploreInfoPanelCollapsible"
            className="collapse show"
          >
            <center>
                {addMargin(
                    <Button onClick={() => navigate(`/playground/${owner}/${repo}`)}>
                        <Icon style={{ backgroundColor: "eeea" }} glyph={magicWandIcon}/> Chart Playground
                    </Button>,
                    10
                )}
                <ButtonSet>
                    <a
                        href={`/api/artifact/busFactor/csv?owner=${owner}&repo=${repo}`}
                        download={`${owner}_${repo}_bus_factor.csv`}
                    >
                        <Button>
                            <Icon style={{ backgroundColor: "eeea" }} glyph={tableIcon}/> CSV
                        </Button>
                    </a>
                    <a
                        href={`/api/artifact/busFactor/json?owner=${owner}&repo=${repo}`}
                        download={`${owner}_${repo}_bus_factor.json`}
                    >
                        <Button>
                            <Icon style={{ backgroundColor: "eeea" }} glyph={fileJsonIcon}/> JSON
                        </Button>
                    </a>
                </ButtonSet>
            </center>
          </div>
        </Content>
      </Island>
  )
}