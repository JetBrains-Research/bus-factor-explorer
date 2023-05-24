package org.jetbrains.research.ictl.riskypatterns.service.github

import com.google.gson.annotations.SerializedName
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.apache.Apache
import io.ktor.client.plugins.ClientRequestException
import io.ktor.client.plugins.HttpResponseValidator
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.logging.*
import io.ktor.client.plugins.resources.Resources
import io.ktor.client.plugins.resources.get
import io.ktor.client.request.headers
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpHeaders
import io.ktor.resources.Resource
import io.ktor.serialization.gson.gson
import org.jetbrains.research.ictl.riskypatterns.domain.GitHubRepository
import org.jetbrains.research.ictl.riskypatterns.domain.RepositoryOwner

val basicClient: HttpClient by lazy {
    HttpClient(Apache) {
        expectSuccess = true
        HttpResponseValidator {
            handleResponseExceptionWithRequest { exception, _ ->
                val clientException = exception as? ClientRequestException ?: return@handleResponseExceptionWithRequest
                val exceptionResponse = clientException.response
                val exceptionResponseText = exceptionResponse.bodyAsText()
                throw IllegalArgumentException(exceptionResponseText)
            }
        }
        install(ContentNegotiation) {
            gson()
        }
        install(Resources)
        defaultRequest {
            url("https://api.github.com")
            headers {
                System.getenv().getOrDefault("GH_TOKEN", "").let { token ->
                    if (token.isNotBlank()) {
                        append(HttpHeaders.Authorization, "Bearer $token")
                    }
                }
                append(HttpHeaders.Accept, "application/vnd.github+json")
            }
        }
    }
}

class GitHubClient(
    private val httpClient: HttpClient = basicClient,
) {
    suspend fun getRepository(fullName: String): GitHubRepository {
        val (owner, repo) = fullName.split("/")
        val item = httpClient.get(GetGitHubRepository.Owner(GetGitHubRepository(), owner, repo))
            .body<GitHubSearchRepositoriesResponseItem>()

        return GitHubRepository(
            item.name,
            item.fullName,
            item.description ?: "",
            item.cloneUrl,
            item.fork,
            item.topics ?: emptyList(),
            RepositoryOwner(
                item.owner.login,
                item.owner.id,
            ),
        )
    }

    suspend fun searchRepositories(q: String): List<GitHubRepository> {
        val result = mutableListOf<GitHubRepository>()
        var currentPage = 1
        while (true) {
            val batch = httpClient.get(GitHubRepositories(q, page = currentPage))
                .body<GitHubSearchRepositoriesResponseBatch>()

            currentPage++
            result.addAll(
                batch.items.map {
                    GitHubRepository(
                        it.name,
                        it.fullName,
                        it.description ?: "",
                        it.cloneUrl,
                        it.fork,
                        it.topics ?: emptyList(),
                        RepositoryOwner(
                            it.owner.login,
                            it.owner.id,
                        ),
                    )
                },
            )
            if (!batch.incompleteResults) {
                break
            }
        }
        return result
    }
}

/**
 * q:
 * The query contains one or more search keywords and qualifiers.
 * Qualifiers allow you to limit your search to specific areas of GitHub.
 * The REST API supports the same qualifiers as the web interface for GitHub.
 * To learn more about the format of the query, see Constructing a search query.
 * See "Searching code" for a detailed list of qualifiers.
 *
 * perPage:
 * The number of results per page (max 100).
 *
 * page:
 * Page number of the results to fetch.
 */
@Resource("/search/repositories")
class GitHubRepositories(val q: String, val page: Int = 1, val per_page: Int = 30)

@Resource("/repos")
class GetGitHubRepository() {
    @Resource("/{owner}/{repo}")
    class Owner(val parent: GetGitHubRepository = GetGitHubRepository(), val owner: String, val repo: String)
}

data class GitHubSearchRepositoriesResponseItemOwner(
    val login: String,
    val id: Long,
)

data class GitHubSearchRepositoriesResponseItem(
    val name: String,
    @SerializedName("full_name")
    val fullName: String,
    val description: String?,
    @SerializedName("clone_url")
    val cloneUrl: String,
    val topics: List<String>?,
    val fork: Boolean,
    val owner: GitHubSearchRepositoriesResponseItemOwner,
)

data class GitHubSearchRepositoriesResponseBatch(
    @SerializedName("incomplete_results")
    val incompleteResults: Boolean,
    val items: List<GitHubSearchRepositoriesResponseItem>,
)
