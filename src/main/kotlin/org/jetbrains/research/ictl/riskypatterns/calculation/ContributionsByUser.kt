package org.jetbrains.research.ictl.riskypatterns.calculation

import kotlinx.serialization.Serializable
import java.util.*
import java.util.concurrent.TimeUnit
import kotlin.math.exp

/**
 * Contributions of users to a single file
 */

@Serializable
class ContributionsByUser {

    var reviews: Int = 0
    var weightedReviews: Double = 0.0

    var commits: Int = 0
    var weightedCommits: Double = 0.0

    var authorship: Double = 0.0
    var normalizedAuthorship: Double = 0.0

    private fun getWeight(timestamp: Long, latestCommitTimestamp: Long): Double {
        // TODO: Do we really need dates here?
        val date = Date(timestamp)
        val latestDate = Date(latestCommitTimestamp)
        val passedDays = TimeUnit.DAYS.convert(latestDate.time - date.time, TimeUnit.MILLISECONDS)
        return exp(-1.0 * passedDays / BusFactorConstants.decayCharacteristicTime)
    }

    fun addFileChange(commitTimestamp: Long, latestCommitTimestamp: Long): Double {
        val weight = getWeight(commitTimestamp, latestCommitTimestamp)
        commits += 1
        weightedCommits += weight
        return weight
    }

    fun addReview(reviewTimestamp: Long, latestCommitTimestamp: Long) {
        reviews += 1
        weightedReviews += getWeight(reviewTimestamp, latestCommitTimestamp)
    }

    fun isMajor(): Boolean {
        if (BusFactorConstants.newFormula) {
            return authorship >= BusFactorConstants.authorshipThresholdNew &&
                normalizedAuthorship > BusFactorConstants.normalizedAuthorshipThreshold
        }

        return authorship >= BusFactorConstants.authorshipThreshold &&
            normalizedAuthorship > BusFactorConstants.normalizedAuthorshipThreshold
    }
}
