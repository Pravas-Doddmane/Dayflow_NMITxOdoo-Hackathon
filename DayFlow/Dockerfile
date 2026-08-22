# =========================================================
# Stage 1: Build the application with Maven and Java 21
# =========================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy pom.xml and download dependencies for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and build package
COPY src ./src
RUN mvn clean package -DskipTests

# =========================================================
# Stage 2: Minimal runtime image with JRE 21
# =========================================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="TechTitans <dev@dayflow.local>"
LABEL description="DayFlow HRMS Backend Service"

WORKDIR /app

# Create upload directory and non-root user for security
RUN addgroup -S dayflow && adduser -S dayflow -G dayflow \
    && mkdir -p /app/uploads \
    && chown -R dayflow:dayflow /app

# Copy built jar from builder stage
COPY --from=builder /build/target/DayFlow-*.jar /app/app.jar
RUN chown dayflow:dayflow /app/app.jar

USER dayflow:dayflow

# Expose HTTP application port
EXPOSE 8080

# Configure JVM memory limits and flags
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/swagger-ui.html || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
