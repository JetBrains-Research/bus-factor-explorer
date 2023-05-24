import React, {useEffect, useState} from "react";
import plotly from "plotly.js/dist/plotly";
import PlotlyEditor from "react-chart-editor";
import "react-chart-editor/lib/react-chart-editor.css";
import {useParams} from "react-router-dom";
import Papa from "papaparse";
import {loadChart, saveChart} from "../Util";
import frownIcon from '@jetbrains/icons/frown';
import {LoaderWithProgress} from "./LoaderWithProgress";
import ErrorMessage from "@jetbrains/ring-ui/dist/error-message/error-message";


export default function ChartEditor(props) {
  const {owner, repo} = useParams()

  const config = {editable: true};
  const [dataSources, setDataSources] = useState({
    idx: [],
    parentIdx: [],
    filename: [],
    absolutePath: [],
    graphPath: [],
    bytes: [],
    busFactor: [],
    contributors: [],
    hasChild: [],
  });
  const dataSourceOptions = Object.keys(dataSources).map((name) => ({
    value: name,
    label: name,
  }));

  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = React.useState(0)
  const [isLoaded, setIsLoaded] = useState(false);
  const [state, setState] = useState({data: [], layout: {}, frames: []});

  const loadCSV = (owner, repo) => {
    Papa.parse(`/api/artifact/busFactor/csv?owner=${owner}&repo=${repo}`, {
      download: true,
      header: true,
      dynamicTyping: true,
      error: function (error) {
        setIsLoaded(true);
        if (error.message === 404) {
          setError(`Repository not found.`);
        } else {
          setError(`Something went wrong. Received ${error.message}.`);
        }
      },
      complete: ({data}) => {
        setLoadingProgress(0.5);
        const datasources = {
          idx: [],
          parentIdx: [],
          filename: [],
          absolutePath: [],
          graphPath: [],
          bytes: [],
          busFactor: [],
          contributors: [],
          hasChild: [],
        };
        data.forEach((record) => {
          datasources.idx.push(record.idx);
          datasources.parentIdx.push(record.parentIdx);
          datasources.filename.push(record.filename);
          datasources.absolutePath.push(record.absolutePath);
          datasources.graphPath.push(record.graphPath);
          datasources.bytes.push(record.bytes);
          datasources.busFactor.push(record.busFactor);
          datasources.contributors.push(record.contributors);
          datasources.hasChild.push(record.hasChild);
        });
        setDataSources(datasources);
        setIsLoaded(true);
        setLoadingProgress(1.0);
      }
    })
  };

  useEffect(() => {
    loadChart(owner, repo, (response) =>
      setState({data: response || [], layout: [], frames: []})
    )
    loadCSV(owner, repo);
  }, []);

  if (error) {
    return (
      <div style={{height: '60vh'}}>
        <ErrorMessage
          icon={frownIcon}
          code={'Oops'}
          message={'something went wrong'}
          description={error}
        />
      </div>
    );
  } else if (!isLoaded) {
    return <LoaderWithProgress
      message={"Loading data for playground..."}
      loadProgress={loadingProgress}
    />
  } else {
    return (
      <div style={{height: "85vh", maxHeight: "85vh", width: "100%"}}>
        <PlotlyEditor
          data={state.data}
          layout={state.layout}
          config={config}
          frames={state.frames}
          dataSources={dataSources}
          dataSourceOptions={dataSourceOptions}
          plotly={plotly}
          onUpdate={(data, layout, frames) => {
            saveChart(owner, repo, data)
            setState({data, layout, frames});
          }}
          useResizeHandler
          debug
          advancedTraceTypeSelector
        />
      </div>
    );
  }
}

