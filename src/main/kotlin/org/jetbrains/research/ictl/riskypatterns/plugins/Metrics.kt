package org.jetbrains.research.ictl.riskypatterns.plugins

import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.metrics.micrometer.MicrometerMetrics
import io.ktor.server.netty.Netty
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.micrometer.core.instrument.binder.jvm.JvmGcMetrics
import io.micrometer.core.instrument.binder.jvm.JvmMemoryMetrics
import io.micrometer.core.instrument.binder.jvm.JvmThreadMetrics
import io.micrometer.core.instrument.binder.system.ProcessorMetrics
import io.micrometer.prometheus.PrometheusConfig
import io.micrometer.prometheus.PrometheusMeterRegistry

fun Application.configureMetrics() {
    val appMicrometerRegistry = PrometheusMeterRegistry(PrometheusConfig.DEFAULT).also {
        it.config().commonTags("application", "bus-factor-explorer")
    }

    install(MicrometerMetrics) {
        distinctNotRegisteredRoutes = false
        metricName = "http.server.requests"
        registry = appMicrometerRegistry
        meterBinders = listOf(
            JvmMemoryMetrics(),
            JvmGcMetrics(),
            ProcessorMetrics(),
            JvmThreadMetrics(),
        )
    }

    embeddedServer(
        Netty,
        port = 8090,
        parentCoroutineContext = this.coroutineContext,
        module = {
            routing {
                get("/metrics") {
                    call.respond(appMicrometerRegistry.scrape())
                }
            }
        },
    ).start(wait = false)
}
