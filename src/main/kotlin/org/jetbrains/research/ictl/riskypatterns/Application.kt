package org.jetbrains.research.ictl.riskypatterns

import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.ApplicationStopped
import io.ktor.server.application.call
import io.ktor.server.http.content.singlePageApplication
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.ktor.server.util.getOrFail
import org.jetbrains.research.ictl.riskypatterns.api.artifact.artifactController
import org.jetbrains.research.ictl.riskypatterns.api.github.gitHubSearchController
import org.jetbrains.research.ictl.riskypatterns.api.task.taskController
import org.jetbrains.research.ictl.riskypatterns.plugins.configureHTTP
import org.jetbrains.research.ictl.riskypatterns.plugins.configureMetrics
import org.jetbrains.research.ictl.riskypatterns.service.artifact.ArtifactService
import org.jetbrains.research.ictl.riskypatterns.service.artifact.storage.FSArtifactStorage
import org.jetbrains.research.ictl.riskypatterns.service.github.GitHubClient
import org.jetbrains.research.ictl.riskypatterns.service.github.GitHubSearchService
import org.jetbrains.research.ictl.riskypatterns.service.task.ComputeBusFactorJob
import org.jetbrains.research.ictl.riskypatterns.service.task.TaskService
import org.jetbrains.research.ictl.riskypatterns.service.task.listener.JobExecutionEventListener
import java.io.File
import java.nio.file.Files

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    val artifactDir = File("./artifacts")
    val workingDir = File("./working")
    for (file in listOf(artifactDir, workingDir)) {
        if (!file.exists()) {
            Files.createDirectory(file.toPath())
        }
        if (!file.isDirectory) {
            throw RuntimeException("${file.absolutePath} must be a directory")
        }
    }

    val artifactService = ArtifactService(FSArtifactStorage(artifactDir))
    val listener = JobExecutionEventListener()
    val client = GitHubClient()
    val searchService = GitHubSearchService(client)
    val taskService = TaskService(
        listener,
        ComputeBusFactorJob(workingDir, artifactService, client),
    ).also { service ->
        service.start()
        environment.monitor.subscribe(ApplicationStopped) {
            service.close()
        }
    }

    configureMetrics()
    configureHTTP()
    routing {
        singlePageApplication {
            useResources = true
            filesPath = "static"
        }

        route("/api") {
            get("/health") {
                call.respondText("OK")
            }

            artifactController(artifactService)
            gitHubSearchController(searchService, taskService, artifactService)
            taskController(taskService, listener, artifactService, workingDir)
        }
    }
}
fun ApplicationCall.getParameterOrFail(name: String) = this.request.queryParameters.getOrFail(name)

fun ApplicationCall.getOwnerAndRepo(): Pair<String, String> {
    val owner = this.getParameterOrFail("owner")
    val repo = this.getParameterOrFail("repo")
    return owner to repo
}

data class ActiveJobResponse(val owner: String, val repo: String)
