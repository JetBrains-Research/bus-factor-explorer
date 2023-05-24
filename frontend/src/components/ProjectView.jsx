import React from "react";
import Island, {Content, Header} from "@jetbrains/ring-ui/dist/island/island";
import TagsList from "@jetbrains/ring-ui/dist/tags-list/tags-list";
import List from "@jetbrains/ring-ui/dist/list/list";
import downloadIcon from '@jetbrains/icons/download';
import experimentIcon from '@jetbrains/icons/experiment-20px';
import hourglassIcon from '@jetbrains/icons/hourglass';
import Alert from "@jetbrains/ring-ui/dist/alert/alert";
import {useNavigate} from "react-router-dom";
import {scheduleTask} from "../Util";
import Markdown from "@jetbrains/ring-ui/dist/markdown/markdown";

export const RUNNING = "RUNNING"
export const READY = "READY"
export const NEED_LOAD = "NEED_LOAD"

function ProjectView({project, createAlert, createAlertPR, onCloseAlertClick, setRepositoryStatus, afterLoad}) {
  const navigate = useNavigate();

  const getGlyph = (repository) => {
    switch (repository.status) {
      case RUNNING:
        return hourglassIcon
      case READY:
        return experimentIcon
      case NEED_LOAD:
        return downloadIcon
      default:
    }
  }
  const owner = project.info.name

  return <div style={{marginBottom: "32px"}}>
    <Island>
      <Header border>
        {owner}
      </Header>

      <Content fade>
        <TagsList
          tags={project.info.tags.map(it => {
            return {label: it, readOnly: true, key: it}
          })}
        />

        <Markdown inline={false}>
          {project.info.description}
        </Markdown>

        <div>
          <List
            data={project.repositories.map(repository => {
              const repositoryName = repository.name
              return {
                glyph: getGlyph(repository),
                label: repositoryName,
                details: repository.description,
                onMouseDown: () => {
                  switch (repository.status) {
                    case RUNNING:
                    case READY:
                      navigate(`/vis/${owner}/${repositoryName}`)
                      break
                    case NEED_LOAD:
                      const alert = createAlert(Alert.Type.LOADING, `Sending request "${repository.name}" of project ${owner}`)
                      scheduleTask(project.info.name, repository.name, repository.cloneUrl,
                        (response) => {
                          onCloseAlertClick(alert)
                          createAlertPR(Alert.Type.MESSAGE, `Task for ${repositoryName} is scheduled. Wait and refresh page for results.`, owner, repositoryName)

                          if (afterLoad) {
                            afterLoad()
                          }
                        })
                      setRepositoryStatus(owner, repositoryName, RUNNING)
                      break
                    default:
                  }
                },
                disabled: repository.status === RUNNING
              }
            })}
            maxHeight={400}
            compact={true}
            shortcuts={true}
          />
        </div>

      </Content>

    </Island>
  </div>;
}

export default ProjectView;

