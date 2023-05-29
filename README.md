[![JetBrains Research](https://jb.gg/badges/research.svg)](https://confluence.jetbrains.com/display/ALL/JetBrains+on+GitHub)
[![Java CI with Gradle](https://github.com/JetBrains-Research/bus-factor-explorer/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/JetBrains-Research/bus-factor-explorer/actions/workflows/ci.yml)
# `bus-factor-explorer`
A web app for exploring Bus Factor of GitHub projects.

## About
Bus factor (BF) is a metric that tracks knowledge distribution in a project.
It is the minimal number of engineers that have to leave for a project to stall.
`bus-factor-explorer` provides an interface and an API to compute, export, 
and explore the Bus Factor metric via treemap visualization, simulation mode, and chart editor.
It supports repositories hosted on GitHub and enables functionality to search repositories and process many repositories 
at the same time.

Our tool allows users to identify the files and subsystems at risk of stalling in the event of developer turnover 
by analyzing the VCS history.

Demo is available on [YouTube](https://youtu.be/uIoV79N14z8).

## Quick start
Docker:
```shell
docker run -p 8080:8080 -it ghcr.io/jetbrains-research/bus-factor-explorer/bus-factor-explorer:latest
```
Docker compose configuration is also available in the repository.

## Usage
Simple scenario:
1. Open main page
2. To search repos, you can use [advanced GitHub search](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories). 
3. Click on the repository and wait for calculating a bus factor
4. Reload the main page and click on the repository on the main page
5. Explore bus factor data using built-in visualization or process results using `Explore Data` panel

## Screenshots
![Treemap](./docs/treemap.png)
![Visualization built with chart editor](./docs/plotly.png)
![Simulation mode](./docs/simulation_mode.png)

## Evaluation
To evaluate our tool, we computed the bus factor of 935 popular repositories on GitHub.
The results are available in the `evaluation` directory.

#### Local development
1. Run `./gradlew jibDockerBuild`
2. Run `docker compose up`
