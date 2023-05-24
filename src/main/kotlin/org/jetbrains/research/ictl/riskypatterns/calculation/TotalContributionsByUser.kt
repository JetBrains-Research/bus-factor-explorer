package org.jetbrains.research.ictl.riskypatterns.calculation

import kotlinx.serialization.Serializable

@Serializable
data class TotalContributionsByUser(
    val numSolelyAuthored: Int,
    val numCommits: Int,
    val numReviews: Int,
    val numAttendedMeetings: Int,
)
