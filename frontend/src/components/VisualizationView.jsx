import Visualization from "../visualization/components/Visualization";
import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {LoaderWithProgress} from "./LoaderWithProgress";
import {useDispatch} from "react-redux";
import {requestBusFactorGraph} from "../util";
import {setNewTree} from "../visualization/reducers/treemapSlice";

function VisualizationView() {
  const {owner, repo} = useParams()
  const [progress, setProgress] = useState(0.0)
  const [loaded, setLoaded] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    console.log(owner, repo)
    requestBusFactorGraph(
      {
        owner: owner,
        repo: repo
      }, (response) => {
        setLoaded(true)
        dispatch(setNewTree(response))
        setInitialized(true)
      },
      setProgress
    )
  }, [])

  const view = () => {
    if (!initialized) {
      const metaInfo = `repository "${repo}" of project "${owner}"`
      const dataLoadMsg = `Loading visualization data for ${metaInfo}`
      const treeMapInitMsg = `Data is loaded. Initializing visualization for ${metaInfo}`
      // fixme: progress === 1 not working, there is no msg change
      let msg = loaded ? treeMapInitMsg : dataLoadMsg
      return <LoaderWithProgress
        message={msg}
        loadProgress={progress * 0.9}
      />
    }
    return <Visualization/>
  }

  return (
    <>
      {view()}
    </>
  )
}

export default VisualizationView