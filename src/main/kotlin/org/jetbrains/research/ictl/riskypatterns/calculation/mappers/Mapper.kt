package org.jetbrains.research.ictl.riskypatterns.calculation.mappers

import kotlinx.serialization.Serializable

/**
 * Main interface for mapping emails, users, files, commits into number ids
 */

@Serializable
abstract class Mapper(
    protected val entityToId: HashMap<String, Int> = HashMap(),
    protected val idToEntity: HashMap<Int, String> = HashMap(),
) {

    private var lastId = 0

    fun add(value: String): Int {
        return entityToId[value] ?: run {
            val currId = entityToId.computeIfAbsent(value) { lastId++ }
            idToEntity[currId] = value
            currId
        }
    }

    fun getOrNull(value: String) = entityToId[value]

    fun getOrNull(id: Int) = idToEntity[id]

    fun remove(value: String) {
        val id = getOrNull(value)
        idToEntity.remove(id)
        entityToId.remove(value)
    }

    fun contains(value: String) = value in entityToId

    fun contains(id: Int) = id in idToEntity
}
