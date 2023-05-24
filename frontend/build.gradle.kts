plugins {
    id("org.siouan.frontend-jdk11") version "6.0.0"
}

frontend {
    nodeDistributionProvided.set(false)
    nodeVersion.set("16.17.1")

    installScript.set("install")
    assembleScript.set("run build")
}

tasks.named("build") {
    doLast {
        copy {
            from("$buildDir")
            into("$rootDir/src/main/resources/static/")
        }
    }
}
