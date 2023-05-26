/** @format */

import React from "react";
import LegendColor from "./LegendColor";
import StatsPane from "./StatsPane";
import {addMargin} from "./Navigator";
import {ExploreData} from "./ExploreData";
import {useParams} from "react-router-dom";

function RightColumn({statsData}) {
  const {owner, repo} = useParams()

  return (
    <div className="col p-1">
      {addMargin(
        <StatsPane data={statsData}/>
      )}
      {addMargin(<center>
        <LegendColor
          summary={"Colors can be picked by clicking on the squares below"}>
        </LegendColor>
      </center>
      )}
      <ExploreData
        owner={owner}
        repo={repo}
      />
    </div>
  );
}

export default RightColumn;
