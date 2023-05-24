package org.jetbrains.research.ictl.riskypatterns.calculation

import kotlinx.serialization.Serializable
import org.jetbrains.research.ictl.riskypatterns.calculation.BusFactor.Companion.isMainContributor
import org.jetbrains.research.ictl.riskypatterns.calculation.BusFactor.Companion.isMinorContributor
import org.jetbrains.research.ictl.riskypatterns.calculation.entities.UserStats
import org.jetbrains.research.ictl.riskypatterns.calculation.mappers.FileMapper
import org.jetbrains.research.ictl.riskypatterns.calculation.mappers.UserMapper

@Serializable
data class BusFactorConfigSnapshot(
    val useFilter: Boolean,
    val useReviewers: Boolean,
    val weightedAuthorship: Boolean,
    val ignoreExtensions: Set<String>,
) {
    companion object {
        fun getDefault() = BusFactorConfigSnapshot(
            false,
            false,
            true,
            setOf(),
        )
    }
}

@Serializable
data class BusFactorComputationContext(
    val userMapper: UserMapper = UserMapper(),
    val fileMapper: FileMapper = FileMapper(),
) {

    // [fileId] = ownership
    val filesOwnership: MutableMap<Int, OwnershipPerUser> = HashMap()

    //  [fileId] = (userId, weightedOwnership)
    val weightedOwnership: MutableMap<Int, Pair<Int, Double>> = HashMap()

    var lastCommitCommitterTimestamp: Long = -1
    var configSnapshot: BusFactorConfigSnapshot = BusFactorConfigSnapshot.getDefault()

    fun checkData(fileNames: List<String>): Boolean {
        for (fileName in fileNames) {
            val fileId = fileMapper.getOrNull(fileName) ?: continue
            val fileInfo = filesOwnership[fileId] ?: continue
            if (fileInfo.isNotEmpty()) return true
        }
        return false
    }

    private fun userToAuthorship(fileNames: List<String>): Map<Int, Double> {
        val userToOwnership = HashMap<Int, Double>()
        for (fileName in fileNames) {
            val fileId = fileMapper.getOrNull(fileName) ?: continue
            val fileInfo = filesOwnership[fileId] ?: continue
            for ((userId, info) in fileInfo) {
                val authorship = info.authorship
                userToOwnership.compute(userId) { _, v -> if (v == null) authorship else v + authorship }
            }
        }
        return userToOwnership
    }

    // TODO: remove trains
    fun filesUsersStats(fileNames: List<String>): HashMap<String, UserStats> {
        val userToContribution = HashMap<String, UserStats>()
        var sumAuthorship = 0.0
        val isFile = fileNames.size == 1

        for (fileName in fileNames) {
            val fileId = fileMapper.getOrNull(fileName) ?: continue
            val fileInfo = filesOwnership[fileId] ?: continue
            for ((userId, info) in fileInfo) {
                val user = userMapper.getOrNull(userId)!!
                val contributionsByUser = userToContribution.computeIfAbsent(user) { UserStats() }.contributionsByUser
                contributionsByUser.reviews += info.reviews
                contributionsByUser.commits += info.commits
                contributionsByUser.authorship += info.authorship
                if (isFile) {
                    sumAuthorship += info.authorship
                }
            }
        }

        if (userToContribution.isNotEmpty()) {
            val max = userToContribution.maxByOrNull { it.value.contributionsByUser.authorship }!!
                .value.contributionsByUser.authorship

            for ((_, stats) in userToContribution) {
                val authorship = stats.contributionsByUser.authorship
                val normalizedAuthorship = authorship / max
                stats.contributionsByUser.normalizedAuthorship = normalizedAuthorship

                val isMinorContributor = isFile && isMinorContributor(authorship, sumAuthorship)
                val isMainContributor = isMainContributor(authorship, normalizedAuthorship)

                stats.isMinorContributor = isMinorContributor
                stats.isMainContributor = isMainContributor && !isMinorContributor
            }
        }

        return userToContribution
    }
}
