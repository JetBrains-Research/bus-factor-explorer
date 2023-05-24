import React from "react";
import {TimeoutInput} from "./TimeoutInput";
import searchIcon from '@jetbrains/icons/search';
import ProjectView, {NEED_LOAD, READY, RUNNING} from "./ProjectView";
import {homeViewStyle, requestProjects, requestReadyProjects, requestStatusOfTasks} from "../util";
import Alert, {Container} from "@jetbrains/ring-ui/dist/alert/alert";

import ErrorMessage from "@jetbrains/ring-ui/dist/error-message/error-message";
import frownIcon from '@jetbrains/icons/frown';
import {LoaderWithProgress} from "./LoaderWithProgress";
import Link from "@jetbrains/ring-ui/dist/link/link";

const RUNNING_STATUS = "RUNNING"
const ERROR_STATUS = "ERROR"
const FINISHED_STATUS = "DONE"

export class HomeView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      inputValue: "",
      loadingFromBackend: true,
      alerts: [],
      queryValue: "",
      loadProgress: 0.0,
      intervalId: undefined,
      requestingStatus: false
    };
  }

  setRequestStatus(value) {
    this.setState({
      requestingStatus: value
    })
  }

  requestStatus() {
    requestStatusOfTasks((data) => {
      let requestingStatus = false
      for (const job of data) {

        switch (job.status) {
          case RUNNING_STATUS:
            requestingStatus = true
            break
          case ERROR_STATUS:
            this.onCloseAlertClickPRKey(Alert.Type.MESSAGE, job.owner, job.repo);
            this.createAlert(Alert.Type.ERROR, `Internal Server Error for ${job.owner}/${job.repo} : ${job.message}`);
            this.setRepositoryStatus(job.owner, job.repo, NEED_LOAD)
            break
          case FINISHED_STATUS:
            this.onCloseAlertClickPRKey(Alert.Type.MESSAGE, job.owner, job.repo)
            this.createAlert(Alert.Type.SUCCESS, <> Calculation for <Link href={`/vis/${job.owner}/${job.repo}`}>{job.owner}/{job.repo}</Link> is done! </>)
            this.setRepositoryStatus(job.owner, job.repo, READY)
            break
        }
      }
      this.setRequestStatus(requestingStatus)
      console.log(data)
    })
  }

  componentDidMount() {
    this.requestStatus()
    const intervalId = setInterval(() => {
      if (this.state.requestingStatus) {
        this.requestStatus()
      }
    }, 5000);
    this.setState({
      intervalId: intervalId
    })
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }


  setRepositoryStatus(owner, repo, status) {
    const data = this.state.projects
    const project = data.find(it => it.info.name === owner)
    const repository = project.repositories.find(it => it.name === repo)
    repository.status = status

    if (status === RUNNING) {
      this.setRequestStatus(true)
    }

    this.setState({
      projects: data
    })
  }

  loaderOnRequestFromInput(inputValue) {
    let message
    if (inputValue !== "") {
      message = `Looking for "${inputValue}" in GitHub ...`
    } else {
      message = "Loading projects ..."
    }
    return <LoaderWithProgress message={message} loadProgress={this.state.loadProgress}/>
  }

  errorMessageOnEmptyList(inputValue) {
    let msg
    const code = "Empty projects"
    let description
    if (inputValue === "") {
      msg = `there is no ready projects on server.`
      description = "Search and load a project from GitHub."
    } else {
      msg = `there is no projects found with term "${inputValue}"`
      description = "Change search query."
    }

    return (
      <div style={{height: '60vh'}}>
        <ErrorMessage
          icon={frownIcon}
          code={code}
          message={msg}
          description={description}
        >
        </ErrorMessage>
      </div>
    )
  }

  trackProgress(progress) {
    console.log("setting state ", progress)
    this.setState({loadProgress: progress})
  }

  showProjects() {
    const inputValue = this.state.queryValue
    if (this.state.loadingFromBackend) {
      return this.loaderOnRequestFromInput(inputValue)
    }

    if (this.state.projects.length === 0) {
      return this.errorMessageOnEmptyList(inputValue)
    }

    return (this.state.projects.map(it =>
      <ProjectView
        project={it}
        createAlert={(type, msg) => this.createAlert(type, msg)}
        createAlertPR={(type, msg, projectName, repositoryName) => this.createAlertPR(type, msg, projectName, repositoryName)}
        onCloseAlertClick={(alert) => this.onCloseAlertClick(alert)}
        setRepositoryStatus={(projectName, repositoryName, status) => this.setRepositoryStatus(projectName, repositoryName, status)}
      />
    ));
  }

  updateStateBeforeRequest(extra) {
    this.setState({
      ...extra,
      loadingFromBackend: true,
    })
  }

  updateStateAfterRequest(extra) {
    this.setState({
      ...extra,
      loadingFromBackend: false,
      loadProgress: 0.0
    })
  }

  setReadyProjects() {
    this.updateStateBeforeRequest()
    requestReadyProjects((response) => {
      this.updateStateAfterRequest({projects: response})
    }, (progress) => this.trackProgress(progress))
  }


  onCloseAlert(closedAlert) {
    this.setState(prevState => ({
      alerts: prevState.alerts.filter(alert => alert !== closedAlert)
    }));
  };

  onCloseAlertClick(alert) {
    const alertToClose = this.state.alerts.filter(it => alert.key === it.key)[0];
    alertToClose.isClosing = true;
    this.setState(prevState => ({
      ...prevState,
      alerts: [...prevState.alerts],
    }));
  };

  onCloseAlertClickPRKey(type, owner, repo) {
    const key = this.createPRKey(type, owner, repo)
    const alertToClose = this.state.alerts.filter(it => key === it.key)[0];
    alertToClose.isClosing = true;
    this.setState(prevState => ({
      ...prevState,
      alerts: [...prevState.alerts],
    }));
  };

  createPRKey(type, owner, repo) {
    return `${type}/${owner}/${repo}`
  }

  createAlertPR(type, message, owner, repo) {
    const alert = {
      type: type,
      key: this.createPRKey(type, owner, repo),
      message: message,
      isClosing: false
    };

    this.setState(
      {
        alerts: [alert, ...this.state.alerts]
      }
    )
    return alert;
  }

  createAlert(type, message) {
    const alert = {
      type: type,
      key: Date.now(),
      message: message,
      isClosing: false
    };

    this.setState(
      {
        alerts: [alert, ...this.state.alerts]
      }
    )
    return alert;
  };

  mainView() {
    return <div style={homeViewStyle}>
      <div style={{
        marginBottom: "8px"
      }}>
        <TimeoutInput
          icon={searchIcon}
          label={"Filter"}
          value={this.state.inputValue}
          onChange={(event) => {
            this.setState({
              inputValue: event.query
            })
          }}
          onTimeout={(event) => {
            const value = this.state.inputValue
            if (value) {
              this.updateStateBeforeRequest({queryValue: value})
              requestProjects(value, (response) => {
                this.updateStateAfterRequest({projects: response})
              }, (progress) => this.trackProgress(progress))
            } else {
              this.setReadyProjects()
            }
          }}
        />
      </div>

      {this.showProjects()}

      <Container>
        {this.state.alerts.map(alert => {
          const {message, key, ...rest} = alert;
          return (
            <Alert
              key={key}
              {...rest}
              onCloseRequest={() => this.onCloseAlertClick(alert)}
              onClose={() => this.onCloseAlert(alert)}
            >
              {message}
            </Alert>
          );
        })}
      </Container>
    </div>
  }

  render() {
    return (
      <div>
        {this.mainView()}
      </div>
    );
  }
}