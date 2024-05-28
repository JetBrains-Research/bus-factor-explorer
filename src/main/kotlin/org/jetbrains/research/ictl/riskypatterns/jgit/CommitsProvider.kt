package org.jetbrains.research.ictl.riskypatterns.jgit

import org.eclipse.jgit.diff.DiffEntry.ChangeType
import org.eclipse.jgit.diff.DiffFormatter
import org.eclipse.jgit.lib.Constants
import org.eclipse.jgit.lib.ObjectReader
import org.eclipse.jgit.lib.Repository
import org.eclipse.jgit.revwalk.RevCommit
import org.eclipse.jgit.revwalk.RevWalk
import org.eclipse.jgit.revwalk.filter.CommitTimeRevFilter
import org.eclipse.jgit.treewalk.CanonicalTreeParser
import org.eclipse.jgit.treewalk.EmptyTreeIterator
import org.eclipse.jgit.treewalk.TreeWalk
import org.eclipse.jgit.util.io.NullOutputStream
import org.jetbrains.research.ictl.riskypatterns.calculation.BusFactorConstants
import org.jetbrains.research.ictl.riskypatterns.calculation.entities.CommitInfo
import org.jetbrains.research.ictl.riskypatterns.calculation.entities.DiffEntry
import org.jetbrains.research.ictl.riskypatterns.calculation.entities.UserInfo
import java.time.Duration
import java.util.*

class CommitsProvider(private val repository: Repository, private val dayGap: Long = BusFactorConstants.DAYS_GAP) : Iterable<CommitInfo> {
    override fun iterator(): Iterator<CommitInfo> = RepoIterator(repository, dayGap)

    class RepoIterator(private val repository: Repository, private val dayGap: Long) : Iterator<CommitInfo>, AutoCloseable {

        companion object {
            fun jgitToLibChangeType(changeType: ChangeType): DiffEntry.ChangeType {
                return when (changeType) {
                    ChangeType.ADD -> DiffEntry.ChangeType.ADD
                    ChangeType.RENAME -> DiffEntry.ChangeType.RENAME
                    ChangeType.MODIFY -> DiffEntry.ChangeType.MODIFY
                    ChangeType.COPY -> DiffEntry.ChangeType.COPY
                    ChangeType.DELETE -> DiffEntry.ChangeType.DELETE
                }
            }
        }

        private val revWalk = RevWalk(repository)
        private val iterator: Iterator<RevCommit>
        private val reader: ObjectReader = repository.newObjectReader()

        init {
            val lastCommit = revWalk.parseCommit(repository.resolve(Constants.HEAD))
            revWalk.markStart(lastCommit)
            val beforeDate = lastCommit.commitDate()
            val afterDate = afterDate(lastCommit)
            revWalk.revFilter = CommitTimeRevFilter.between(afterDate, beforeDate)
            iterator = revWalk.iterator()
        }

        override fun hasNext(): Boolean {
            val hasNext = iterator.hasNext()
            if (!hasNext) {
                close()
            }
            return hasNext
        }

        override fun next(): CommitInfo {
            val commit = iterator.next()
            return convertJgitCommit(commit)
        }

        private fun getDiffsWithoutText(
            commit: RevCommit,
            reader: ObjectReader,
            repository: Repository,
        ): List<org.eclipse.jgit.diff.DiffEntry> {
            val oldTreeIter = if (commit.parents.isNotEmpty()) {
                val firstParent = commit.parents[0]
                val treeParser = CanonicalTreeParser()
                treeParser.reset(reader, firstParent.tree)
                treeParser
            } else {
                EmptyTreeIterator()
            }
            val newTreeIter = CanonicalTreeParser()
            newTreeIter.reset(reader, commit.tree)

            val treeWalk = TreeWalk(repository)
            treeWalk.isRecursive = true
            treeWalk.addTree(oldTreeIter)
            treeWalk.addTree(newTreeIter)

            val diffFormatter = getDiffFormatter(repository)
            return diffFormatter.scan(oldTreeIter, newTreeIter)
        }

        private fun convertJgitCommit(commit: RevCommit): CommitInfo {
            val authorEmail = commit.authorIdent.emailAddress
            val committerEmail = commit.committerIdent.emailAddress
            val authorCommitTimestamp = commit.authorIdent.`when`.time
            val committerTimestamp = commit.committerIdent.`when`.time
            val diffEntries = getDiffsWithoutText(commit, reader, repository).map {
                DiffEntry(
                    it.oldPath,
                    it.newPath,
                    jgitToLibChangeType(it.changeType),
                )
            }
            val numOfParents = commit.parents.size
            val fullMessage = commit.fullMessage

            val authorUserInfo = UserInfo(commit.authorIdent.name, authorEmail)
            val committerUserInfo = UserInfo(commit.committerIdent.name, committerEmail)

            val hash = commit.name

            return CommitInfo(
                authorUserInfo,
                committerUserInfo,
                authorCommitTimestamp,
                committerTimestamp,
                diffEntries,
                numOfParents,
                fullMessage,
                hash,
            )
        }

        private fun getDiffFormatter(repository: Repository): DiffFormatter {
            val diffFormatter = DiffFormatter(NullOutputStream.INSTANCE)
            diffFormatter.setRepository(repository)
            diffFormatter.isDetectRenames = true
            return diffFormatter
        }

        private fun RevCommit.commitDate() = Date(this.commitTime * 1000L)

        private fun afterDate(lastCommit: RevCommit) =
            Date.from(lastCommit.commitDate().toInstant().minus(Duration.ofDays(dayGap)))

        override fun close() {
            revWalk.close()
        }
    }
}
