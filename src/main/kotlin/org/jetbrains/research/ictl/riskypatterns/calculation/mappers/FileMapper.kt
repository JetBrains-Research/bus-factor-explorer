package org.jetbrains.research.ictl.riskypatterns.calculation.mappers

import kotlinx.serialization.Serializable

@Serializable
class FileMapper : Mapper() {

    fun trackMove(oldPath: String, newPath: String): Pair<Int, Int> {
        // Files can be renamed, and sometimes from the Git point of view this looks like Copy + Delete.
        // We don't want to consider the copy as a new file in this case (as we normally do)

        val newId = add(newPath)
        val oldId = add(oldPath)
        if (newId != oldId) {
            entityToId[oldPath] = newId
            idToEntity[oldId] = newPath
        }
        return oldId to newId
    }

    fun getRealFileId(fileId: Int): Int {
        val value = getOrNull(fileId)!!
        return getOrNull(value)!!
    }
}
