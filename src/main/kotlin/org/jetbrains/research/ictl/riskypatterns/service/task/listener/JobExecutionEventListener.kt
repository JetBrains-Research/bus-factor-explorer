package org.jetbrains.research.ictl.riskypatterns.service.task.listener

import kotlinx.coroutines.channels.Channel
import java.util.*

class JobExecutionEventListener(
    private val eventChannel: Channel<JobExecutionEvent> = Channel(Channel.UNLIMITED),
) : suspend (JobExecutionEvent) -> Unit {

    override suspend fun invoke(event: JobExecutionEvent) = eventChannel.send(event)

    fun readEvents(limit: Int = 5): List<JobExecutionEvent> {
        val result = mutableListOf<JobExecutionEvent>()
        while (result.size != 5) {
            val received = eventChannel.tryReceive()
            if (!received.isSuccess) {
                return result
            }
            result.add(received.getOrThrow())
        }

        return result
    }
}

enum class JobState {
    PENDING,
    RUNNING,
    DONE,
    FAILED,
}
val ACTIVE_JOBS_STATUSES: EnumSet<JobState> = EnumSet.of(
    JobState.PENDING,
    JobState.RUNNING,
)

enum class EventLevel {
    INFO,
    ERROR,
}

data class JobExecutionEvent(
    val owner: String,
    val repo: String,
    val level: EventLevel,
    val message: String,
    val state: JobState = JobState.RUNNING,
)
