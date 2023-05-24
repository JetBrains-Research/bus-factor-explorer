package org.jetbrains.research.ictl.riskypatterns.api.github

import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.util.getOrFail
import org.jetbrains.research.ictl.riskypatterns.service.artifact.ArtifactService
import org.jetbrains.research.ictl.riskypatterns.service.github.GitHubSearchService
import org.jetbrains.research.ictl.riskypatterns.service.task.TaskService

fun Route.gitHubSearchController(
    gitHubSearchService: GitHubSearchService,
    taskService: TaskService,
    artifactService: ArtifactService,
) {
    get("/github/search") {
        val query = this.context.request.queryParameters.getOrFail("q")

        val running = taskService.running()
            .associate { it.fullName to RepositoryStatusResponse.RUNNING }
        val ready = artifactService.getCalculatedProjects()
            .associate { it.fullName to RepositoryStatusResponse.READY }
        val repoInStatus = running + ready

        call.respond(
            gitHubSearchService.searchRepositories(query)
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
                                repoInStatus[repo.fullName] ?: RepositoryStatusResponse.NEED_LOAD,
                                repo.cloneUrl,
                            )
                        }.toSet(),
                    )
                },
        )
    }
}
