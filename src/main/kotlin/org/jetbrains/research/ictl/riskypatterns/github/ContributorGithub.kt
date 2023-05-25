package org.jetbrains.research.ictl.riskypatterns.github

import kotlinx.serialization.Serializable

@Serializable
data class ContributorGithub(val login: String, val type: String, val url: String)

