package org.jetbrains.research.ictl.riskypatterns.calculation.entities

import kotlinx.serialization.Serializable

@Serializable
data class Tree(
    val name: String,
    val path: String,
    // TODO: add
    var bytes: Long = -1,
    var busFactorStatus: BusFactorStatus? = null,
    var users: List<UserVis> = emptyList(),
    val children: MutableList<Tree> = mutableListOf(),
) {
    fun getFileNames(): List<String> {
        val result = mutableListOf<String>()
        val queue = ArrayDeque<Tree>()
        queue.add(this)
        while (queue.isNotEmpty()) {
            val node = queue.removeLast()
            val children = node.children
            if (children.isEmpty()) {
                result.add(node.path)
            } else {
                queue.addAll(children)
            }
        }
        return result
    }

    fun untilNotSingle(): List<Tree> {
        if (this.children.size != 1) return emptyList()

        var node = this.children.first()
        val same = mutableListOf(node)
        while (node.children.size == 1) {
            node = node.children.first()
            same.add(node)
        }
        return same
    }

    fun getNode(filePath: String): Tree? {
        val parts = filePath.split("/")
        var node = this
        for (part in parts) {
            node = node.children.find { it.name == part } ?: return null
        }
        return node
    }
}

@Serializable
data class UserVis(val email: String, val authorship: Double, val normalizedAuthorship: Double? = null) {
    companion object {
        private fun formatDouble(value: Double) = String.format("%.4f", value).toDouble()

        fun convert(userStats: Map<String, UserStats>, developersSorted: Set<String>): List<UserVis> {
            val result = mutableListOf<UserVis>()

            for (mainAuthor in developersSorted) {
                result.add(UserVis(mainAuthor, userStats[mainAuthor]!!))
            }

            for ((email, stats) in userStats) {
                if (email in developersSorted) {
                    continue
                }
                result.add(UserVis(email, stats))
            }
            return result
        }
    }

    constructor(email: String, stats: UserStats) : this(
        email,
        formatDouble(stats.contributionsByUser.authorship),
        formatDouble(stats.contributionsByUser.normalizedAuthorship),
    )
}
