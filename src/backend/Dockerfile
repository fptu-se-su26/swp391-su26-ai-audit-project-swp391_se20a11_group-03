FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY pom.xml ./
RUN mvn -B -DskipTests dependency:go-offline

COPY src src
RUN mvn -B -DskipTests package spring-boot:repackage

FROM eclipse-temurin:21-jre-jammy

RUN useradd --create-home --shell /usr/sbin/nologin bidzone
WORKDIR /app
COPY --from=build /workspace/target/vnec-auth.war app.war
RUN mkdir -p /tmp/bidzone/uploads/kyc && chown -R bidzone:bidzone /app /tmp/bidzone

USER bidzone
EXPOSE 10000
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.war"]
