package org.jetbrains.research.ictl.riskypatterns.plugins

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.gson.gson
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.NotFoundException
import io.ktor.server.plugins.callid.CallId
import io.ktor.server.plugins.callid.callIdMdc
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.request.header
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.response.respond
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*

val log: Logger = LoggerFactory.getLogger(Application::class.java)

fun Application.configureHTTP() {
    install(CallId) {
        retrieve { call ->
            call.request.header(HttpHeaders.XRequestId) ?: UUID.randomUUID().toString()
        }

        replyToHeader(HttpHeaders.XRequestId)
    }

    install(CallLogging) {
        callIdMdc("request_id")
        mdc("path") {
            it.request.path()
        }
        filter {
            it.request.path().startsWith("/api")
        }
        format {
            "[${it.request.httpMethod.value}] ${it.request.path()} ${it.parameters.entries()} -> ${it.response.status()}"
        }
    }

    install(ContentNegotiation) {
        gson()
    }

    install(StatusPages) {
        val log = LoggerFactory.getLogger(this::class.java)

        exception<NotFoundException> { call, cause ->
            log.warn("API error: Not Found", cause)
            call.respond(HttpStatusCode.NotFound, cause.localizedMessage)
        }
        exception<IllegalArgumentException> { call, cause ->
            log.warn("API error: Bad Request", cause)
            call.respond(HttpStatusCode.BadRequest, cause.localizedMessage)
        }
        exception<Throwable> { call, cause ->
            log.error("API error: Internal Error", cause)
            call.respond(HttpStatusCode.InternalServerError, cause.localizedMessage)
        }
    }
}
