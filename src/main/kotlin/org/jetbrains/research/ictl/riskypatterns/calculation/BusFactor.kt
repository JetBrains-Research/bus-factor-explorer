package org.jetbrains.research.ictl.riskypatterns.calculation

import org.eclipse.jgit.errors.MissingObjectException
import org.eclipse.jgit.internal.storage.file.FileRepository
import org.eclipse.jgit.lib.Constants
import org.eclipse.jgit.lib.Constants.OBJ_BLOB
import org.eclipse.jgit.lib.ObjectReader
import org.eclipse.jgit.revwalk.RevCommit
import org.eclipse.jgit.revwalk.RevWalk
import org.eclipse.jgit.revwalk.filter.CommitTimeRevFilter
import org.eclipse.jgit.treewalk.TreeWalk
import org.jetbrains.research.ictl.riskypatterns.calculation.entities.Tree
import org.jetbrains.research.ictl.riskypatterns.calculation.entities.UserVis
import org.jetbrains.research.ictl.riskypatterns.calculation.processors.CommitProcessor
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File
import java.time.Duration
import java.util.*
import kotlin.collections.ArrayDeque

open class BusFactor(repositoryFile: File, private val botsLogins: Set<String> = emptySet()) {

    companion object {
        val log: Logger = LoggerFactory.getLogger(BusFactor::class.java)

        fun getExtension(fileName: String): CharSequence? {
            val index: Int = fileName.indexOfLast { it == '.' }
            return if (index < 0) {
                null
            } else {
                fileName.subSequence(index + 1, fileName.length)
            }
        }

        fun isValidFilePath(filePath: String, ignoreExtensions: Set<String>): Boolean {
            val extension = getExtension(filePath) ?: return true
            return extension !in ignoreExtensions
        }

        fun isMinorContributor(userAuthorship: Double, sumAuthorship: Double) = (userAuthorship / sumAuthorship) <= 0.05

        fun isMainContributor(userAuthorship: Double, normalizedUserAuthorship: Double) =
            (normalizedUserAuthorship > 0.75) && (userAuthorship > 1)
    }

    protected val repository = FileRepository(repositoryFile)
    protected val reader: ObjectReader = repository.newObjectReader()

    open fun calculate(repositoryName: String): Tree {
        val context = BusFactorComputationContext(botsLogins = botsLogins)
        val commitProcessor = CommitProcessor(context, reader, repository)

        val lastCommit = proceedCommits(commitProcessor)

        val busFactorCalculation = BusFactorCalculation(context)

        val root = buildTree(lastCommit, repositoryName)
        calculateBusFactorForTree(root, busFactorCalculation)
        return root
    }

    private fun proceedCommits(commitProcessor: CommitProcessor): RevCommit {
        val revWalk = RevWalk(repository)
        val lastCommit: RevCommit
        revWalk.use { walk ->
            lastCommit = walk.parseCommit(repository.resolve(Constants.HEAD))
            commitProcessor.setLastCommit(lastCommit.commitDate().time)
            walk.markStart(lastCommit)
            val beforeDate = lastCommit.commitDate()
            val afterDate = afterDate(lastCommit)
            walk.revFilter = CommitTimeRevFilter.between(afterDate, beforeDate)
            for (commit in walk) {
                processCommit(commit, commitProcessor)
            }
        }
        return lastCommit
    }

    protected open fun processCommit(commit: RevCommit, commitProcessor: CommitProcessor): Boolean {
        return commitProcessor.processCommit(commit)
    }

    // fixme: add filter for files
    private fun buildTree(lastCommit: RevCommit, repositoryName: String): Tree {
        val root = Tree(repositoryName, ".")
        var allSize = 0L
        proceedFilePathsOnCommit(lastCommit) { filePath, bytes ->
            val parts = filePath.split("/")
            var node = root
            var path = ""
            for (part in parts) {
                if (path.isEmpty()) path = part else path += "/$part"
                node = node.children.find { it.name == part } ?: run {
                    val newNode = Tree(part, path, bytes)
                    node.children.add(newNode)
                    newNode
                }
            }
            allSize += bytes
        }
        root.bytes = allSize
        return root
    }

    private fun calculateBusFactorForTree(root: Tree, busFactorCalculation: BusFactorCalculation) {
        val queue = ArrayDeque<Tree>()
        queue.add(root)

        while (queue.isNotEmpty()) {
            val node = queue.removeLast()

            val children = node.children
            if (children.isNotEmpty()) {
                queue.addAll(children)
            }
            val fileNames = node.getFileNames()
            val userStats = busFactorCalculation.userStats(fileNames)
            val busFactorCalculationResult = busFactorCalculation.computeBusFactorForFiles(fileNames)

            node.busFactorStatus = busFactorCalculationResult.busFactorStatus
            node.users = UserVis.convert(userStats, busFactorCalculationResult.developersSorted)

//      sameValue.forEach {
//        it.busFactorStatus = busFactorStatus
//        it.users = UserVis.convert(userStats)
//      }
        }
    }

    private fun proceedFilePathsOnCommit(commit: RevCommit, proceedFilePath: (String, Long) -> Unit) {
        val treeWalk = TreeWalk(repository)
        treeWalk.addTree(commit.tree)
        treeWalk.isRecursive = false

        while (treeWalk.next()) {
            val filePath = treeWalk.pathString

            var bytes = 0L
            try {
                bytes = reader.getObjectSize(treeWalk.getObjectId(0), OBJ_BLOB)
                if (treeWalk.isSubtree) {
                    treeWalk.enterSubtree()
                    continue
                }
            } catch (e: MissingObjectException) {
                log.warn("Missing blob : $filePath : ${e.message} ")
            }
            proceedFilePath(filePath, bytes)
        }
    }

    private fun RevCommit.commitDate() = Date(this.commitTime * 1000L)

    private fun afterDate(lastCommit: RevCommit) =
        Date.from(lastCommit.commitDate().toInstant().minus(Duration.ofDays(BusFactorConstants.daysGap)))
}
