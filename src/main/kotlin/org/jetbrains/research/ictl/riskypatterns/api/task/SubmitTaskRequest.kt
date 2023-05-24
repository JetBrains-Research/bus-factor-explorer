package org.jetbrains.research.ictl.riskypatterns.api.task

data class SubmitTaskRequest(
    val owner: String,
    val repo: String,
    val cloneUrl: String,
)
