package org.jetbrains.research.ictl.riskypatterns.service.artifact.storage

import com.google.gson.Gson
import java.io.File
import java.nio.file.Files
import java.util.*
import kotlin.io.path.isRegularFile
import kotlin.streams.asSequence

class FSArtifactStorage(private val root: File) : ArtifactStorage {
    override fun <T : Any> save(payload: T, path: String) {
        val target = File(root, path)
        target.parentFile.mkdirs()
        target.createNewFile()
        if (!target.exists()) {
            throw RuntimeException("Failed to create file: ${target.absolutePath}")
        }

        when (payload) {
            is String -> target.writeText(payload)
            else -> target.writeText(GSON.toJson(payload))
        }
    }

    override fun <T : Any> get(path: String, type: Class<T>): Optional<T> {
        val target = File(root, path)
        if (!target.exists()) {
            return Optional.empty()
        }

        return Optional.of(GSON.fromJson(target.readText(), type))
    }

    override fun get(path: String): Optional<String> {
        val target = File(root, path)
        if (!target.exists()) {
            return Optional.empty()
        }

        return Optional.of(target.readText())
    }

    override fun findArtifacts(): Sequence<String> = findArtifacts("")

    override fun findArtifacts(prefix: String): Sequence<String> {
        val searchRoot = File(root, prefix).toPath()
        return Files.walk(searchRoot)
            .asSequence()
            .filter { it.isRegularFile() }
            .map { root.toPath().relativize(it) }
            .map { it.toString() }
    }

    companion object {
        val GSON = Gson()
    }
}
