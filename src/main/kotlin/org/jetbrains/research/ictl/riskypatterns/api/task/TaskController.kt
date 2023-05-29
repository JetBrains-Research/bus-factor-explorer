package org.jetbrains.research.ictl.riskypatterns.api.task

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import org.jetbrains.research.ictl.riskypatterns.ActiveJobResponse
import org.jetbrains.research.ictl.riskypatterns.getOwnerAndRepo
import org.jetbrains.research.ictl.riskypatterns.service.artifact.ArtifactService
import org.jetbrains.research.ictl.riskypatterns.service.task.TaskPayload
import org.jetbrains.research.ictl.riskypatterns.service.task.TaskService
import org.jetbrains.research.ictl.riskypatterns.service.task.listener.JobExecutionEventListener
import java.io.File
import java.nio.file.Paths
import kotlin.io.path.exists
import kotlin.io.path.readText

fun Route.taskController(
    taskService: TaskService,
    listener: JobExecutionEventListener,
    artifactService: ArtifactService,
    workingDir: File,
) {
    route("/task") {
        post("/submit") {
            val payload = call.receive<SubmitTaskRequest>()
            taskService.submitTask(
                TaskPayload(
                    payload.owner,
                    payload.repo,
                    payload.cloneUrl,
                ),
            )

            call.respond(HttpStatusCode.OK, "Task accepted")
        }

        get("/events") {
            call.respond(
                listener.readEvents()
                    .map {
                        JobInfoResponse(
                            it.state.name,
                            it.owner,
                            it.repo,
                            it.message,
                        )
                    },
            )
        }

        get("/active") {
            call.respond(
                taskService.running()
                    .map {
                        val (key, repo) = it.fullName.split("/")
                        ActiveJobResponse(key, repo)
                    },
            )
        }

        get("/log") {
            val (projectKey, repositoryName) = call.getOwnerAndRepo()

            val logFile = Paths.get(workingDir.absolutePath, projectKey, repositoryName, "log.log")
            val log = if (logFile.exists()) {
                logFile.readText()
            } else {
                artifactService.getLog("$projectKey/$repositoryName")
            }
            call.respond(log)
        }
    }
}

data class JobInfoResponse(
    val status: String,
    val owner: String,
    val repo: String,
    val message: String,
)
