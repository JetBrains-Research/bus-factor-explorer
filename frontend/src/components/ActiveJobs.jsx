import React, {useEffect} from "react";
import {Tab, Tabs} from "@jetbrains/ring-ui/dist/tabs/tabs";
import {Col, Grid, Row} from "@jetbrains/ring-ui/dist/grid/grid";
import {requestActive, requestLog} from "../Util";
import Markdown from "@jetbrains/ring-ui/dist/markdown/markdown";
import task from '@jetbrains/icons/task';
import ProgressBar from "@jetbrains/ring-ui/dist/progress-bar/progress-bar";
import ErrorMessage from "@jetbrains/ring-ui/dist/error-message/error-message";


export const ActiveJobs = () => {
  const [data, setData] = React.useState([])

  useEffect(() => {
    requestActive((data) => setData(data))
    const interval = setInterval(() => {
      requestActive((data) => setData(data))
    }, 10000)
    return () => clearInterval(interval);
  }, [])

  return (
    <>
      <Grid>
        <Row center="xs">
            <Col xs={8}>
              {data.length > 0 ? <LogTabs data={data}/> :
                <div style={{height: '60vh'}}>
                  <ErrorMessage
                    icon={task}
                    code={'No active tasks'}
                    message={'all tasks completed'}
                    description={'Go to home page and submit new task!'}
                  />
                </div>
              }
            </Col>
        </Row>
      </Grid>
    </>
  )
}

const LogTabs = ({data}) => {
  const [selected, setSelected] = React.useState('0');
  const selectHandler = React.useCallback((key) => {
    setSelected(key);
  }, []);

  return (
    <Tabs
      selected={selected}
      onSelect={selectHandler}
      autoCollapse
      initialVisibleItems={5}
    >
      {data.map((item, index) => {
        const {owner, repo} = item;
        return (
          <Tab
            id={String(index)}
            key={String(index)}
            title={`${owner}/${repo}`}
          >
            <Log owner={owner} repo={repo}/>
          </Tab>
        )
      })
      }
    </Tabs>
  );
};

const Log = ({owner, repo}) => {
  const [content, setContent] = React.useState('')
  const [progress, setProgress] = React.useState(0)

  const updateLog = () => {
    requestLog({
      owner: owner,
      repo: repo
    }, (data) => {
      setProgress((progress) =>  progress > 1 ? 0 : progress + 0.1)
      setContent(data)
    })
  }

  useEffect(() => {
    updateLog()
    const interval = setInterval(() => {
      updateLog()
    }, 5000)
    return () => clearInterval(interval);
  }, [])

  return (
    <Row start="xs">
      <Col xs={12} className="cell">
        <ProgressBar label="Progress" value={progress}/>
        <pre style={{minHeight: "75vh", maxHeight: "75vh"}}>
          <Markdown>{
            `\`\`\`
${content}
\`\`\``
          }</Markdown>
          </pre>
      </Col>
    </Row>
  )
}