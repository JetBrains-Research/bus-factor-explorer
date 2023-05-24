val kotlin_version: String by project
val logback_version: String by project
val exposedVersion: String by project

plugins {
    kotlin("jvm") version "1.8.20"
    id("io.ktor.plugin") version "2.2.4"

    kotlin("plugin.serialization").version("1.7.22")

    id("org.jlleitschuh.gradle.ktlint") version "11.2.0"
}

group = "org.jetbrains.research"
version = "0.0.1"

application {
    mainClass.set("org.jetbrains.research.ictl.riskypatterns.ApplicationKt")

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-metrics-micrometer")
    implementation("io.micrometer:micrometer-registry-prometheus:1.10.5")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.1")
    implementation("io.ktor:ktor-client-content-negotiation")
    implementation("io.ktor:ktor-serialization-gson")

    implementation("io.ktor:ktor-server-core-jvm")
    implementation("io.ktor:ktor-server-cors-jvm")
    implementation("io.ktor:ktor-server-caching-headers-jvm")
    implementation("io.ktor:ktor-server-netty-jvm")
    implementation("io.ktor:ktor-server-content-negotiation")
    implementation("io.ktor:ktor-server-status-pages")
    implementation("io.ktor:ktor-serialization-kotlinx-json")
    implementation("io.ktor:ktor-server-config-yaml")
    implementation("io.ktor:ktor-server-call-id")
    implementation("io.ktor:ktor-server-call-logging")

    implementation("ch.qos.logback:logback-core:$logback_version")
    implementation("ch.qos.logback:logback-classic:$logback_version")
    implementation("net.logstash.logback:logstash-logback-encoder:7.3")

    implementation("org.eclipse.jgit:org.eclipse.jgit:6.3.0.202209071007-r")

    implementation("org.apache.commons:commons-csv:1.10.0")

    implementation("io.ktor:ktor-client-core")
    implementation("io.ktor:ktor-client-apache")
    implementation("io.ktor:ktor-client-resources:2.2.4")
    implementation("io.ktor:ktor-client-logging-jvm:2.2.4")

    testImplementation("io.ktor:ktor-server-tests-jvm")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version")
    testImplementation("org.junit.jupiter:junit-jupiter:5.9.2")
}

val buildReactApp = tasks.register("buildReactApp") {
    val react = project(":frontend")
    dependsOn(react.tasks.named("build"))
}

val prepareAppResources = tasks.register("prepareAppResources") {
    dependsOn(buildReactApp)
    finalizedBy("processResources")
}

tasks.register("runApp") {
    dependsOn(prepareAppResources)
    finalizedBy("run")
}

tasks {
    ktlint {
        ignoreFailures.set(false)
        disabledRules.set(setOf("no-wildcard-imports"))
    }

    jib {
        from {
            // we need git in container
            image = "maven:3.9.0-eclipse-temurin-17"

            platforms {
                platform {
                    architecture = if (System.getProperty("os.arch").equals("aarch64")) "arm64" else "amd64"
                    os = "linux"
                }
            }
        }
        to {
            image = "ghcr.io/jetbrains-research/bus-factor-explorer/${rootProject.name}:$version"
        }
        // jgit config file
        container {
            jvmFlags = listOf("-Duser.home=/tmp")
        }
    }

    test {
        useJUnitPlatform()
        // Show test results.
        testLogging {
            showStandardStreams = true
            events("passed", "skipped", "failed")
        }
    }
}

tasks.named("jib") {
    dependsOn(prepareAppResources)
}

tasks.named("jibDockerBuild") {
    dependsOn(prepareAppResources)
}
