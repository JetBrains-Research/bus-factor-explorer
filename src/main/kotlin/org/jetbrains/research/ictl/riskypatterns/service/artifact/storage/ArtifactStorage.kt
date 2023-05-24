package org.jetbrains.research.ictl.riskypatterns.service.artifact.storage

import java.util.*

interface ArtifactStorage {
    fun <T : Any> save(payload: T, fileName: String)
    fun <T : Any> get(path: String, type: Class<T>): Optional<T>
    fun get(path: String): Optional<String>
    fun findArtifacts(): Sequence<String>
    fun findArtifacts(prefix: String): Sequence<String>
}
