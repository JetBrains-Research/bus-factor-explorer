import axios from "axios";
import React from "react";
import alert from "@jetbrains/ring-ui/dist/alert-service/alert-service";

const debug = false

export function sendRequest(apiPath, params, callback, trackProgress, data = {}, method="get") {
  return axios.request({
    method: method,
    data: data,
    url: `/api/${apiPath}`,
    params: params,
    onDownloadProgress: p => {
      if (trackProgress) {
        const progress = p.loaded / p.total;
        trackProgress(progress)
      }
    }
  }).then(response => {
    callback(response.data)
  })
    .catch((error) => {
      if (error.response?.status) {
        alert.error(`${error.response.status}: ${error.response.data.slice(0, 35)}. ${error.response.headers['x-request-id']}`);
      } else {
        console.error(error);
      }
    })
}

export function requestReadyProjects(callback, trackProgress) {
  sendRequest("artifact/ready", {}, callback, trackProgress)
}

export function requestLog(params, callback) {
  return sendRequest("task/log", params, callback)
}

export function requestActive(callback) {
  sendRequest("task/active", {}, callback)
}

export function requestBusFactorGraph(repo, callback, trackProgress) {
  sendRequest("artifact/busFactor/json", repo, callback, trackProgress)
}

export function requestProjects(term, callback, trackProgress) {
  sendRequest("github/search", {q: term}, callback, trackProgress);
}

export function requestStatusOfTasks(callback, trackProgress) {
  sendRequest("task/events", {}, callback, trackProgress)
}

export function scheduleTask(owner, repo, cloneUrl, callback) {
  sendRequest("task/submit", {}, callback, undefined, {
    owner: owner,
    repo: repo,
    cloneUrl: cloneUrl,
  }, "post");
}

export function loadChart(owner, repo, callback) {
  sendRequest("artifact/chart/load", {
    owner: owner,
    repo: repo,
  }, callback)

}

export function saveChart(owner, repo, chart) {
  sendRequest("artifact/chart/save", {}, undefined, undefined, {
    owner: owner,
    repo: repo,
    chart: JSON.stringify(chart),
  }, "post");
}

export const homeViewStyle = {
  padding: "32px 16px",
  width: "70%",
  margin: "auto",
  minHeight: "75vh"
}