FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=prod
COPY --from=build /workspace/target/*.jar /app/smart-harvester-backend.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "/app/smart-harvester-backend.jar"]
