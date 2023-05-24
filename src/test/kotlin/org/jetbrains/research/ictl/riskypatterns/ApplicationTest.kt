package org.jetbrains.research.ictl.riskypatterns

import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.testApplication
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class ApplicationTest {
    @Test
    fun testRoot() = testApplication {
        client.get("/api/health").apply {
            Assertions.assertEquals(HttpStatusCode.OK, status)
            Assertions.assertEquals("OK", bodyAsText())
        }
    }
}
