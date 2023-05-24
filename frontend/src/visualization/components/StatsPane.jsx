/** @format */

import React, {useEffect, useMemo, useRef, useState} from "react";
import * as d3 from "d3";
import {dispatch} from "d3";
import {
  addAuthorToRemovalList,
  disableSimulationMode,
  enableSimulationMode,
  undoAuthorRemoval,
} from "../reducers/treemapSlice";
import {useTranslation} from "react-i18next";
import {InfoPanel} from "./InfoPanel";
import Island from "@jetbrains/ring-ui/dist/island/island";
import Header from "@jetbrains/ring-ui/dist/island/header";
import Content from "@jetbrains/ring-ui/dist/island/content";
import List from "@jetbrains/ring-ui/dist/list/list";

function StatsPane(props) {
  const {t, i18n} = useTranslation();
  const formatPercentage = d3.format(",.2%");
  const formatSI = d3.formatPrefix(".1s", 1);

  const isFirstRender = useRef(true);
  const [numOfAuthors, setNumOfAuthors] = useState(0);
  const [inSimulationMode, setSimulationMode] = useState(false);

  const nodeData = props.data;
  const nodeBusFactor = useMemo(
    () =>
      "busFactor" in nodeData.busFactorStatus
        ? nodeData.busFactorStatus.busFactor
        : nodeData.busFactorStatus.old
          ? "N/A (marked 'old')"
          : nodeData.busFactorStatus.ignored
            ? "N/A (file in ignore list)"
            : "N/A (reason unknown)",
    [nodeData]
  );

  const authorsList = useMemo(
    () =>
      "users" in nodeData
        ? [...nodeData.users].sort((a, b) => b.authorship - a.authorship)
        : undefined,
    [nodeData]
  );

  const totalNumOfAuthors = useMemo(
    () => (authorsList ? authorsList.length : 0),
    [authorsList]
  );

  const cumulativeAuthorship = useMemo(
    () =>
      authorsList
        ? authorsList
          .map((element) => element.authorship)
          .reduce((prevValue, currentValue) => prevValue + currentValue, 0)
        : null,
    [authorsList]
  );

  const authorsListContributionPercentage = useMemo(
    () =>
      authorsList
        ? authorsList.map((authorContributionPair) => {
          return {
            email: authorContributionPair.email,
            authorship: authorContributionPair.authorship,
            relativeScore:
              authorContributionPair.authorship / cumulativeAuthorship,
          };
        })
        : null,
    [authorsList, cumulativeAuthorship]
  );

  const topAuthors = useMemo(
    () =>
      authorsList
        ? authorsListContributionPercentage.slice(0, numOfAuthors)
        : null,
    [authorsList, authorsListContributionPercentage, numOfAuthors]
  );

  const handleSimulationModeSwitch = (event) => {
    setSimulationMode(!inSimulationMode);

    if (inSimulationMode) {
      dispatch(enableSimulationMode());
    }

    if (!inSimulationMode) {
      dispatch(disableSimulationMode());
    }
  };

  const handleAuthorRemovalSwitch = (event) => {
    if (event.target.checked) {
      dispatch(undoAuthorRemoval(event.target.props.email));
    } else {
      dispatch(addAuthorToRemovalList(event.target.props.email));
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    // if (nodeBusFactor && nodeBusFactor > 0) {
    //   setNumOfAuthors(nodeBusFactor);
    // } else
    if (totalNumOfAuthors) {
      // totalNumOfAuthors > 10
      //   ? setNumOfAuthors(10)
      // :
      setNumOfAuthors(totalNumOfAuthors);
    }
  }, [nodeBusFactor, totalNumOfAuthors]);

  return (
    <Island>
      <Header border>
        Stats{" "}
        <InfoPanel
          divName="statsInfoPanel"
          header="What are these stats and how are the calculated?"
          body={[t("stats")]}></InfoPanel>
        <a
          className=""
          data-bs-toggle="collapse"
          href=".statsPaneCollapsible"
          role="button"
          aria-expanded="true"
          aria-controls="statsPaneCollapsible">
          <i className="bi bi-plus-circle-fill"></i>
          <i className="bi bi-dash-circle-fill"></i>
        </a>
      </Header>
      <Content>

        <div className="col-12 statsPaneCollapsible collapse show">
          <ul className="list-unstyled">
            <li>
            <span className="text-break text-wrap">
              Name: <strong>{nodeData.name}</strong>
            </span>
            </li>
            <li>
            <span className="text-break text-wrap">
              Bus Factor: <strong>{nodeBusFactor}</strong>
            </span>
            </li>
          </ul>

          <h5>Author Contribution</h5>
          {authorsList && topAuthors ? (
            <></>
          ) : (
            // <>
            //   <label
            //     htmlFor="authorNumberSelecter"
            //     className="form-label small">
            //     Showing top {numOfAuthors}
            //     {" of "}
            //     {totalNumOfAuthors}
            //   </label>
            //   <input
            //     type="range"
            //     className="form-range"
            //     value={numOfAuthors}
            //     onChange={(e) => setNumOfAuthors(e.target.value)}
            //     min={0}
            //     max={totalNumOfAuthors}
            //     id="authorNumberSelecter"></input>
            // </>
            <>
              <p>No author info available</p>
            </>
          )}

          <List
            maxHeight={400}
            compact={true}
            shortcuts={true}
            data={authorsList && topAuthors ? topAuthors.map((authorScorePair, index) => {
                return {
                  label: authorScorePair["email"],
                  rgItemType: List.ListProps.Type.ITEM,
                  details: formatPercentage(authorScorePair["relativeScore"])
                }
              }
            ) : {}}
          />

        </div>
      </Content>
    </Island>

  );
}

export default StatsPane;
