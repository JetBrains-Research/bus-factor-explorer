package org.jetbrains.research.ictl.riskypatterns.service.artifact

import com.google.gson.Gson
import io.ktor.server.plugins.NotFoundException
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVPrinter
import org.jetbrains.research.ictl.riskypatterns.calculation.entities.Tree
import org.jetbrains.research.ictl.riskypatterns.domain.GitHubRepository
import org.jetbrains.research.ictl.riskypatterns.service.artifact.storage.ArtifactStorage
import org.jetbrains.research.ictl.riskypatterns.service.task.TaskMetrics
import java.util.*
import kotlin.collections.ArrayDeque

/**
 * Storage structure:
 *    /artifacts/<REPOSITORY_ID>/.INFO -> repository info
 *    /artifacts/<REPOSITORY_ID>/busFactor.json -> computed bus factor
 */
class ArtifactService(
    private val storage: ArtifactStorage,
) {
    fun getCalculatedProjects(): List<GitHubRepository> {
        return storage.findArtifacts()
            .filter { it.endsWith(".INFO") }
            .map {
                storage.get(it, GitHubRepository::class.java)
                    .orElseThrow { RuntimeException("Failed to load metadata by path: $it") }
            }
            .toList()
    }

    fun getChart(owner: String, repo: String): Optional<String> = storage.get("$owner/$repo/chart.json")

    fun saveChart(owner: String, repo: String, content: String) {
        storage.save(content, "$owner/$repo/chart.json")
    }

    fun saveResults(
        repositoryMetadata: GitHubRepository,
        tree: Tree,
        log: String,
        metrics: TaskMetrics,
    ) {
        storage.save(repositoryMetadata, "${repositoryMetadata.fullName}/.INFO")
        storage.save(tree, "${repositoryMetadata.fullName}/busFactor.json")
        storage.save(log, "${repositoryMetadata.fullName}/log.log")
        storage.save(metrics, "${repositoryMetadata.fullName}/metrics.json")
    }

    fun loadOrCreateCSVResult(fullName: String): String {
        val csvPath = "$fullName/busFactor.csv"
        val csvFromGCS = storage.get(csvPath)
        if (csvFromGCS.isPresent) {
            return csvFromGCS.get()
        }

        val tree = getResult(fullName)
        val csvBuilder = StringBuilder()
        CSVPrinter(csvBuilder, CSVFormat.DEFAULT).use { printer ->
            printer.printRecord(
                "idx",
                "parentIdx",
                "filename",
                "absolutePath",
                "graphPath",
                "bytes",
                "busFactor",
                "contributors",
                "hasChild",
            )

            val stack = ArrayDeque<Pair<List<String>, Tree>>().also { it.add(emptyList<String>() to tree) }
            var idx = 0
            while (stack.isNotEmpty()) {
                val (graphPath, node) = stack.removeFirst()
                printer.printRecord(
                    listOf(
                        idx,
                        if (graphPath.isEmpty()) "" else graphPath.last(),
                        node.name,
                        node.path,
                        graphPath,
                        node.bytes,
                        node.busFactorStatus?.busFactor ?: 0,
                        GSON.toJson(node.users),
                        node.children.isNotEmpty(),
                    ),
                )

                node.children.forEach { stack.add((graphPath + idx.toString()) to it) }
                idx++
            }
        }

        val csv = csvBuilder.toString()
        storage.save(csv, csvPath)
        return csv
    }

    fun getResult(fullName: String): Tree {
        return storage.get("$fullName/busFactor.json", Tree::class.java)
            .orElseThrow { NotFoundException("Result not found [id=\"$fullName\"]") }
    }

    fun getRawResult(fullName: String): String {
        return storage.get("$fullName/busFactor.json")
            .orElseThrow { NotFoundException("Result not found [id=\"$fullName\"]") }
    }

    fun getLog(fullName: String): String {
        return storage.get("$fullName/log.log")
            .orElseThrow { NotFoundException("Log not found [projectKey=\"$fullName\"]") }
    }

    companion object {
        private val GSON = Gson()
    }
}
