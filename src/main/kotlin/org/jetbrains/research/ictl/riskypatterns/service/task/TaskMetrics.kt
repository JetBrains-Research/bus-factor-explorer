package org.jetbrains.research.ictl.riskypatterns.service.task

data class TaskMetrics(
    val busFactor: Int,
    val startMillis: Long,
    val startLocalDateTime: String,
    val endMillis: Long,
    val endLocalDateTime: String,
    val elapsedMillis: Long,
)
