package org.jetbrains.research.ictl.riskypatterns.service.github

import org.jetbrains.research.ictl.riskypatterns.domain.GitHubRepository
import org.jetbrains.research.ictl.riskypatterns.domain.RepositoryOwner

class GitHubSearchService(
    private val gitHubClient: GitHubClient,
) {
    suspend fun searchRepositories(q: String) =
        if (q.isNotBlank()) {
            gitHubClient.searchRepositories("$q fork:true").groupBy { it.owner }
                .map { RepositoriesByOwner(it.key, it.value) }
        } else {
            emptyList()
        }
}

data class RepositoriesByOwner(
    val owner: RepositoryOwner,
    val repositories: List<GitHubRepository>,
)
