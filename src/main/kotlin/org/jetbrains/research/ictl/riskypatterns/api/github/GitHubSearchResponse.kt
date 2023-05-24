package org.jetbrains.research.ictl.riskypatterns.api.github

data class GitHubRepositoryResponse(
    val name: String,
    val description: String,
    val status: RepositoryStatusResponse,
    val cloneUrl: String,
)

data class GitHubOwnerResponse(
    val name: String,
    val tags: Set<String>,
    val description: String,
)

data class GitHubRepositoryByOwnerResponse(
    val info: GitHubOwnerResponse,
    val repositories: Set<GitHubRepositoryResponse>,
)

enum class RepositoryStatusResponse {
    RUNNING, READY, NEED_LOAD
}
