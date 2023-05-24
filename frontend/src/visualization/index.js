/** @format */

import React, {useEffect} from "react";
import { createRoot } from "react-dom/client";
import {Provider, useDispatch} from "react-redux";

import { BrowserRouter } from "react-router-dom";

import Visualization from "./components/Visualization";
import { store } from "./store";
import './i18n';

// Importing the Bootstrap CSS
import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@jetbrains/ring-ui/dist/style.css";
import {setNewTree} from "./reducers/treemapSlice";
import { gitRepoDirData } from "./data/project_data_recalculating";



const container = document.getElementById("appRoot");
const root = createRoot(container);


function AppM() {
  const dispatch = useDispatch();

  const tree = gitRepoDirData
  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    dispatch(setNewTree(tree))
  }, []);

  return (<Visualization/>)
}

root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <AppM />
      </Provider>
    </BrowserRouter>
  // </React.StrictMode>
);
