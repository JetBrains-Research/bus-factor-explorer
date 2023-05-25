package org.jetbrains.research.ictl.riskypatterns.calculation.mappers

import kotlinx.serialization.Serializable
import org.eclipse.jgit.revwalk.RevCommit

/**
 * Stores user ids (emails if no user id is available)
 */
@Serializable
class UserMapper(private val botsLogins: Set<String> = emptySet()) : Mapper() {

    private val nameToUserId = HashMap<String, Int>()

    fun add(commit: RevCommit): Int {
        // TODO: why lowercase?
        val email = commit.authorIdent.emailAddress.lowercase()
        val name = email.split("@").first()
        if (contains(name)) {
            val id = entityToId.remove(name)!!
            entityToId[email] = id
            idToEntity[id] = email
            nameToUserId[name] = id
            return id
        }
        val id = add(email)
        nameToUserId[name] = id
        return id
    }

    fun addName(name: String): Int =
        nameToUserId[name] ?: run {
            val id = add(name)
            nameToUserId[name] = id
            id
        }

    fun isBot(email: String)= botsLogins.any {email.contains(it)}

}
