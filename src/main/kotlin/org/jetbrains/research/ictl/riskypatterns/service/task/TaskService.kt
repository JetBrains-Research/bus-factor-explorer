package org.jetbrains.research.ictl.riskypatterns.service.task

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.asCoroutineDispatcher
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.channels.consumeEach
import kotlinx.coroutines.launch
import org.jetbrains.research.ictl.riskypatterns.service.task.listener.ACTIVE_JOBS_STATUSES
import org.jetbrains.research.ictl.riskypatterns.service.task.listener.JobExecutionEventListener
import org.jetbrains.research.ictl.riskypatterns.service.task.listener.JobState
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

data class TaskPayload(
    val owner: String,
    val repo: String,
    val cloneUrl: String,
    val fullName: String = "$owner/$repo",
)

class TaskService(
    private val listener: JobExecutionEventListener,
    private val job: ComputeBusFactorJob,
    private val taskChannel: Channel<TaskPayload> = Channel(Channel.UNLIMITED),
    private val executorService: ExecutorService = Executors.newFixedThreadPool(5),
) {

    private val tasks = ConcurrentHashMap<TaskPayload, JobState>()

    fun running() = tasks.filterValues { it == JobState.RUNNING }.keys

    fun start() {
        CoroutineScope(executorService.asCoroutineDispatcher()).launch {
            taskChannel.consumeEach {
                launch {
                    try {
                        tasks[it] = JobState.RUNNING
                        job.execute(it, listener)
                        tasks[it] = JobState.DONE
                    } catch (e: Throwable) {
                        tasks[it] = JobState.FAILED
                        log.error("Smth went wrong", e)
                    }
                }
            }
        }
    }

    fun close() {
        taskChannel.close()
        executorService.shutdownNow()
    }

    suspend fun submitTask(payload: TaskPayload) {
        if (ACTIVE_JOBS_STATUSES.contains(tasks[payload])) {
            return
        }

        tasks[payload] = JobState.PENDING
        taskChannel.send(payload)
    }

    companion object {
        val log: Logger = LoggerFactory.getLogger(TaskService::class.java)
    }
}
