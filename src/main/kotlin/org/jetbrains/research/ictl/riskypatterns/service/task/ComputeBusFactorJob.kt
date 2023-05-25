package org.jetbrains.research.ictl.riskypatterns.service.task

import org.jetbrains.research.ictl.riskypatterns.calculation.BusFactor
import org.jetbrains.research.ictl.riskypatterns.service.artifact.ArtifactService
import org.jetbrains.research.ictl.riskypatterns.service.github.GitHubClient
import org.jetbrains.research.ictl.riskypatterns.service.task.listener.EventLevel
import org.jetbrains.research.ictl.riskypatterns.service.task.listener.JobExecutionEvent
import org.jetbrains.research.ictl.riskypatterns.service.task.listener.JobExecutionEventListener
import org.jetbrains.research.ictl.riskypatterns.service.task.listener.JobState
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File
import java.nio.file.Paths
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.concurrent.TimeUnit

class ComputeBusFactorJob(
    private val workingDir: File,
    private val artifactService: ArtifactService,
    private val gitHubClient: GitHubClient,
) {
    suspend fun execute(payload: TaskPayload, listener: JobExecutionEventListener) {
        val executionEnvironment = ExecutionEnvironment(
            File(workingDir, payload.fullName),
        )

        val event = eventProducer(payload.owner, payload.repo)
        try {
            val launchStage = "launching Task ${payload.fullName}"
            executionEnvironment.prepare()
            listener(event(EventLevel.INFO, launchStage, JobState.RUNNING))
            log.info(launchStage)
            executionEnvironment.logFile.log(launchStage)

            val repo = gitHubClient.getRepository(payload.fullName)

            if (!executionEnvironment.gitDir.exists()) {
                runCommand(
                    "git config --global http.postBuffer 157286400",
                    executionEnvironment.rootDir,
                    executionEnvironment.logFile,
                )
                runCommand(
                    "git config --global pack.windowsMemory 256m",
                    executionEnvironment.rootDir,
                    executionEnvironment.logFile,
                )

                runCommand(
                    "git clone --progress --verbose ${payload.cloneUrl} --no-checkout " +
                        "--single-branch ${executionEnvironment.gitDir.absolutePath}",
                    executionEnvironment.rootDir,
                    executionEnvironment.logFile,
                    waitMinutes = 180,
                )
            }

            val repositoryCloned = "Repository cloned: ${File(executionEnvironment.gitDir, ".git").exists()}"
            log.info(repositoryCloned)
            executionEnvironment.logFile.log(repositoryCloned)

            val started = System.currentTimeMillis()
            val bots = gitHubClient.loadBots(payload.owner, payload.repo)
            val busFactor = BusFactor(File(executionEnvironment.gitDir, ".git"), bots)
            val tree = busFactor.calculate(payload.fullName)
            val ended = System.currentTimeMillis()

            executionEnvironment.logFile.log("Finished task: [${payload.fullName}]")
            artifactService.saveResults(
                repo,
                tree,
                executionEnvironment.logFile.readText(),
                TaskMetrics(
                    tree.busFactorStatus?.busFactor ?: 0,
                    started,
                    toLocalDateTimeString(started),
                    ended,
                    toLocalDateTimeString(ended),
                    ended - started,
                ),
            )
            log.info("Finished task: [${payload.fullName}]")
            listener(event(EventLevel.INFO, "Finished task", JobState.DONE))
        } catch (e: Throwable) {
            log.error("Got error while executing task. ${e.message}", e)
            listener(event(EventLevel.ERROR, "Got error while executing task. ${e.message}", JobState.FAILED))
            throw RuntimeException(e)
        } finally {
            executionEnvironment.rootDir.deleteRecursively()
        }
    }

    private fun eventProducer(owner: String, repo: String): (EventLevel, String, JobState) -> JobExecutionEvent {
        return { eventLevel, message, jobState ->
            JobExecutionEvent(owner, repo, eventLevel, message, jobState)
        }
    }

    private fun toLocalDateTimeString(millis: Long): String {
        return LocalDateTime.ofInstant(
            Instant.ofEpochMilli(millis),
            ZoneId.systemDefault(),
        ).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
    }

    private fun File.log(message: String) {
        appendText("[${now()}]: $message\n")
    }

    private fun runCommand(cmd: String, workingDir: File, logFile: File, waitMinutes: Long = 5L) {
        val proc = ProcessBuilder(*cmd.split(" ").toTypedArray())
            .redirectError(ProcessBuilder.Redirect.appendTo(logFile))
            .redirectOutput(ProcessBuilder.Redirect.appendTo(logFile))
            .directory(workingDir)
            .start()

        var knownError: String? = null
        val inTime = proc.waitFor(waitMinutes, TimeUnit.MINUTES)
        logFile.useLines { stream ->
            stream.forEach {
                log.info("[CMD] $it")
                if (it.contains("verification failed: Password verification for")) {
                    knownError = "token"
                }
            }
        }

        if (!inTime) {
            proc.destroy()
            throw RuntimeException("Process time limit exceeded")
        }

        val exitCode = proc.exitValue()
        if (exitCode != 0) {
            knownError?.let {
                throw RuntimeException(knownError)
            }
            throw RuntimeException("Process finished with exit code $exitCode")
        }
    }

    companion object {
        val log: Logger = LoggerFactory.getLogger(ComputeBusFactorJob::class.java)
        private fun now() = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
    }
}

class ExecutionEnvironment(
    val rootDir: File,
    val logFile: File = Paths.get(rootDir.path, "log.log").toFile(),
    val gitDir: File = Paths.get(rootDir.path, "/git").toFile(),
) {
    fun prepare() {
        rootDir.mkdirs()
        if (!rootDir.exists()) {
            log.error("Failed to create repository dir: ${rootDir.absolutePath}")
            throw RuntimeException("Failed to create repository dir: ${rootDir.absolutePath}")
        }

        if (logFile.exists()) {
            logFile.delete()
        }

        val created = logFile.createNewFile()
        if (!created) {
            log.error("Failed to create log file: ${logFile.absolutePath}")
            throw RuntimeException("Failed to create log file: ${logFile.absolutePath}")
        }
    }

    companion object {
        val log: Logger = LoggerFactory.getLogger(ExecutionEnvironment::class.java)
    }
}
