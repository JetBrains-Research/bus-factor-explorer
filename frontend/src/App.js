import React from "react";

import {HomeView} from "./components/HomeView";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Provider} from "react-redux";
import {store} from "./visualization/store";
import './visualization/i18n';
import VisualizationView from "./components/VisualizationView";
import {ActiveJobs} from "./components/ActiveJobs";
import {ApplicationBar} from "./components/ApplicationBar";
import {ApplicationFooter} from "./components/ApplicationFooter";
import ChartEditor from "./components/ChartEditor";

const darkMatcher = window.matchMedia("(prefers-color-scheme: dark)");

export default function App() {
  const [dark, setDark] = React.useState(darkMatcher.matches);

  React.useEffect(() => {
    const onChange = (e) => setDark(e.matches);
    darkMatcher.addEventListener("change", onChange);

    return () => darkMatcher.removeEventListener("change", onChange);
  }, []);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <Provider store={store}>
          <ApplicationBar/>
          <Routes>
            <Route path={"/"} element={<HomeView/>} />
            <Route path={"/vis/:owner/:repo"} element={<VisualizationView/>} />
            <Route path={"/playground/:owner/:repo"} element={<ChartEditor/>} />
            <Route path={"/active"} element={<ActiveJobs/>} />
          </Routes>
          <ApplicationFooter/>
        </Provider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
