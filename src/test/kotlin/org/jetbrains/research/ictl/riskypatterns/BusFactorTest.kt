package org.jetbrains.research.ictl.riskypatterns

import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.eclipse.jgit.diff.DiffEntry
import org.eclipse.jgit.revwalk.RevCommit
import org.jetbrains.research.ictl.riskypatterns.calculation.BusFactor
import org.jetbrains.research.ictl.riskypatterns.calculation.entities.Tree
import org.jetbrains.research.ictl.riskypatterns.calculation.processors.CommitProcessor
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class BusFactorTest {

    companion object {
        private val localTestData = File("../testResources/")
        private val repositoryFile = File(localTestData, "repository")
        private val gitFile = File(repositoryFile, ".git")
        private val jsonCommitsFile = File(localTestData, "commits.json")
        private val jsonTreeFile = File(localTestData, "tree.json")
        private val filesToCheckFile = File(localTestData, "files.json")
    }

    @Serializable
    data class CommitData(
        val email: String,
        val authorTime: Long,
        val changes: List<Change>,
    )

    @Serializable
    data class Change(val type: String, val newFile: String?, val oldFile: String?)

    class BFTest(repositoryFile: File, private val commitsData: Map<String, CommitData>) : BusFactor(repositoryFile) {
        private val hashKeys = mutableSetOf<String>()
        private val checkFiles: Set<String> = if (filesToCheckFile.exists()) {
            Json.decodeFromString(filesToCheckFile.readText())
        } else {
            emptySet()
        }
        private val filesChecked = mutableSetOf<String>()
        val cornerFiles: Set<String>
            get() = _cornerFiles
        private val _cornerFiles = mutableSetOf<String>()

        override fun processCommit(commit: RevCommit, commitProcessor: CommitProcessor): Boolean {
            if (!super.processCommit(commit, commitProcessor)) return false

            val hash = commit.name
            hashKeys.add(hash)

            val authorCommitTimestamp = commit.authorIdent.`when`.time
            val diffs = CommitProcessor.getDiffsWithoutText(commit, reader, repository)
            val files = diffs.mapTo(HashSet<String>()) { CommitProcessor.getFilePath(it) }
                .toSet()

            val commitTest = commitsData[hash]!!
            val filesTest = commitTest.changes.mapNotNullTo(HashSet<String>()) {
                it.newFile?.removePrefix("/") ?: run {
                    val old = it.oldFile?.removePrefix("/")
                    old
                }
            }

            val diffTestToCommit = filesTest - files
            val diffCommitToTest = files - filesTest

            Assertions.assertEquals(
                filesTest,
                files,
                "Not equal filesets for commit: $hash . \n" +
                    "Files from test set minus commit files : size ==  ${diffTestToCommit.size}: $diffTestToCommit \n" +
                    "Files from commit set minus test files : size ==  ${diffCommitToTest.size}: $diffCommitToTest \n",
            )

            Assertions.assertEquals(commitTest.authorTime, authorCommitTimestamp)
            Assertions.assertEquals(commitTest.email, commit.authorIdent.emailAddress.lowercase())

            for (diff in diffs) {
                val type = diff.changeType

                if (type === DiffEntry.ChangeType.RENAME || type === DiffEntry.ChangeType.DELETE) {
                    val oldFilePath = diff.oldPath
                    _cornerFiles.add(oldFilePath)

                    val newFilePath = diff.newPath
                    _cornerFiles.add(newFilePath)
                }

                val filePath = CommitProcessor.getFilePath(diff)
                if (filePath !in checkFiles) continue
                filesChecked.add(filePath)
                println("$filePath ; ${diff.changeType} ; $authorCommitTimestamp ; $hash")
            }

            return true
        }

        override fun calculate(repositoryName: String): Tree {
            val tree = super.calculate(repositoryName)
            val nonChecked = checkFiles - filesChecked
            Assertions.assertTrue(nonChecked.isEmpty(), "Not all files were processed.\n $nonChecked")
            return tree
        }

        fun checkCommits() {
            Assertions.assertTrue(commitsData.keys.containsAll(hashKeys))
        }
    }

    @Test
    fun testValues() {
        if (!jsonCommitsFile.exists() || !jsonTreeFile.exists()) {
            println("No files found")
            return
        }
        val testCommits = Json.decodeFromString<MutableMap<String, CommitData>>(jsonCommitsFile.readText())

        println("Launching")
        val bf = BFTest(gitFile, testCommits)
        val tree = bf.calculate(repositoryFile.name)
        bf.checkCommits()
        compareTree(tree, bf)
    }

    private fun compareTree(tree: Tree, bfTest: BFTest) {
        val json = Json { ignoreUnknownKeys = true }
        val testTree = json.decodeFromString<Tree>(jsonTreeFile.readText())

        val fileNames = tree.getFileNames()

        val errors = mutableListOf<String>()
        val cornerErrors = mutableListOf<String>()
        val busFactorErrors = mutableListOf<Pair<String, String>>()

        for (fileName in fileNames) {
            val node = tree.getNode(fileName)
            val testNode = testTree.getNode(fileName)
            Assertions.assertNotNull(node)
            Assertions.assertNotNull(testNode)
            // TODO
            node!!
            testNode!!

            val nodeSize = node.users.size
            val testSize = testNode.users.size
            val onlyInNode = node.users.mapTo(mutableSetOf()) { it.email } - testNode.users.mapTo(mutableSetOf()) { it.email }
            val onlyInTest = testNode.users.mapTo(mutableSetOf()) { it.email } - node.users.mapTo(mutableSetOf()) { it.email }

            val nodeBF = node.busFactorStatus?.busFactor
            val testNodeBF = testNode.busFactorStatus?.busFactor

            if (fileName in bfTest.cornerFiles) {
                val missed = (nodeBF === null) && (testNodeBF?.let { return@let it == 1 } ?: true)
                val differByOne = nodeBF?.let { bf ->
                    testNodeBF?.let {
                        (it - bf) == 1
                    } ?: false
                } ?: false
                if (missed || differByOne) {
                    cornerErrors.add("Missed : $missed ; Differ by 1$differByOne")
                    continue
                }
            }

            if (nodeBF != testNodeBF) {
                busFactorErrors.add(fileName to "node=$nodeBF; test=$testNodeBF")
            }

            if (nodeSize != testSize) {
                errors.add(
                    "Different size; file: $fileName ; node=$nodeSize test=$testSize;\n" +
                        "only in node = $onlyInNode\n" +
                        "only in test = $onlyInTest",
                )
                continue
            }

            if (onlyInNode.isNotEmpty()) {
                errors.add("file: $fileName ; only in node = $onlyInNode")
            }
            if (onlyInTest.isNotEmpty()) {
                errors.add("file: $fileName ; only in test = $onlyInTest")
            }

            for (user in node.users) {
                val userTestData = testNode.users.find { it.email == user.email } ?: continue
                if (user.authorship != userTestData.authorship) {
                    errors.add("file: $fileName ; $user != $userTestData")
                }
            }
        }

        for (error in busFactorErrors) {
            println(error)
            println("-----")
        }

        println("======")

        for (error in errors) {
            println(error)
            println("-----")
        }

        val problemFiles = Json.encodeToString(busFactorErrors.map { it.first })
        filesToCheckFile.writeText(problemFiles)

        Assertions.assertTrue(errors.isEmpty())
        Assertions.assertTrue(busFactorErrors.isEmpty())

        println("======")

        for (error in cornerErrors) {
            println(error)
            println("-----")
        }
    }

    fun <T> compare(node1: Tree, node2: Tree, msg: String, field: (Tree) -> T): Boolean {
        val field1 = field(node1)
        val field2 = field(node2)
        if (field1 != field2) {
            println("$field1 | $field2 => $msg")
            return false
        }
        return true
    }
}
