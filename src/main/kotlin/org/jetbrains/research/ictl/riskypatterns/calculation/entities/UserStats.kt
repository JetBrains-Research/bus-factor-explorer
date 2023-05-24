package org.jetbrains.research.ictl.riskypatterns.calculation.entities

import kotlinx.serialization.Serializable
import org.jetbrains.research.ictl.riskypatterns.calculation.ContributionsByUser

@Serializable
data class UserStats(
    var isMinorContributor: Boolean = false,
    var isMainContributor: Boolean = false,
    val contributionsByUser: ContributionsByUser = ContributionsByUser(),
)
