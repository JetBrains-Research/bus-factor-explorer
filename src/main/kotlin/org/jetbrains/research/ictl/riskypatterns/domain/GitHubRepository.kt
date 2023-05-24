package org.jetbrains.research.ictl.riskypatterns.domain

data class GitHubRepository(
    val name: String,
    val fullName: String,
    val description: String,
    val cloneUrl: String,
    val fork: Boolean,
    val topics: List<String>,
    val owner: RepositoryOwner,
)

data class RepositoryOwner(
    val login: String,
    val id: Long,
)
