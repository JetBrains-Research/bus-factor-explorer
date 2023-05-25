package org.jetbrains.research.ictl.riskypatterns.github

import kotlinx.serialization.Serializable

@Serializable
data class UserGithub(val login: String, val email: String?)

