package org.jetbrains.research.ictl.riskypatterns.api.artifact

import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import org.jetbrains.research.ictl.riskypatterns.api.github.GitHubOwnerResponse
import org.jetbrains.research.ictl.riskypatterns.api.github.GitHubRepositoryByOwnerResponse
import org.jetbrains.research.ictl.riskypatterns.api.github.GitHubRepositoryResponse
import org.jetbrains.research.ictl.riskypatterns.api.github.RepositoryStatusResponse
import org.jetbrains.research.ictl.riskypatterns.getOwnerAndRepo
import org.jetbrains.research.ictl.riskypatterns.service.artifact.ArtifactService
import org.jetbrains.research.ictl.riskypatterns.service.github.RepositoriesByOwner

fun Route.artifactController(artifactService: ArtifactService) {
    route("/artifact") {
        get("/ready") {
            val ready = artifactService.getCalculatedProjects()
                .groupBy { it.owner }
                .map { RepositoriesByOwner(it.key, it.value) }
                .map {
                    GitHubRepositoryByOwnerResponse(
                        GitHubOwnerResponse(
                            it.owner.login,
                            it.repositories.map { repo -> repo.topics }
                                .flatten()
                                .toSet(),
                            "",
                        ),
                        it.repositories.map { repo ->
                            GitHubRepositoryResponse(
                                repo.name,
                                repo.description,
                                RepositoryStatusResponse.READY,
                                repo.cloneUrl,
                            )
                        }.toSet(),
                    )
                }
            call.respond(ready)
        }

        route("/busFactor") {
            get("/csv") {
                val (owner, repo) = call.getOwnerAndRepo()

                call.respondText(
                    artifactService.loadOrCreateCSVResult("$owner/$repo"),
                    ContentType.Text.CSV,
                    HttpStatusCode.OK,
                )
            }
            // project
            get("/json") {
                val (owner, repo) = call.getOwnerAndRepo()

                call.respondText(
                    artifactService.getRawResult("$owner/$repo"),
                    ContentType.Text.CSV,
                    HttpStatusCode.OK,
                )
            }
        }

        route("/chart") {
            get("/load") {
                val (owner, repo) = call.getOwnerAndRepo()

                call.respondText(artifactService.getChart(owner, repo).orElse(EMPTY_CHART_CONFIG))
            }

            post("/save") {
                val request = call.receive<SaveChartRequest>()

                artifactService.saveChart(request.owner, request.repo, request.chart)
                call.respond(HttpStatusCode.OK, "Saved")
            }
        }
    }
}

private const val EMPTY_CHART_CONFIG = "{}"
