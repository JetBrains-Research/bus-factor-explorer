package org.jetbrains.research.ictl.riskypatterns.calculation.entities

import kotlinx.serialization.Serializable

@Serializable
data class BusFactorStatus(
    val busFactor: Int? = null,
    val ignored: Boolean? = null,
    val old: Boolean? = null,
)
