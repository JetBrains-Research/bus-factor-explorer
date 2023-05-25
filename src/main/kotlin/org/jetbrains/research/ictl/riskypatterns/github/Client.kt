package org.jetbrains.research.ictl.riskypatterns.github

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

class Client {
  companion object {
    const val START_RESPONSE = ")]}'\n"
    const val BOT_TYPE = "Bot"
  }

  private val client = HttpClient() {
    install(HttpTimeout) {
      socketTimeoutMillis = 600_000
    }
  }
  val json = Json {
    ignoreUnknownKeys = true
    encodeDefaults = true
  }

  private suspend fun requestRaw(urlString: String) = client.get(urlString).body<String>().removePrefix(START_RESPONSE)

  private suspend inline fun <reified T> request(urlString: String): T = json.decodeFromString(requestRaw(urlString))

  // TODO: it might be not right way, because it will load top 100 need to check in future
  suspend fun loadBots(owner: String, repo: String): Set<String> =
    request<List<ContributorGithub>>("https://api.github.com/repos/$owner/$repo/contributors").filter { it.type == BOT_TYPE }
      .mapTo(mutableSetOf()) { it.login }
}
