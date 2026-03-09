FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Development stage - used by docker-compose.dev.yml
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS development
WORKDIR /app
EXPOSE 5000
EXPOSE 5001
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Development
ENTRYPOINT ["dotnet", "watch", "run", "--project", "src/DrAutoTest.API/DrAutoTest.API.csproj"]

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["src/DrAutoTest.API/DrAutoTest.API.csproj", "src/DrAutoTest.API/"]
COPY ["src/DrAutoTest.Application/DrAutoTest.Application.csproj", "src/DrAutoTest.Application/"]
COPY ["src/DrAutoTest.Domain/DrAutoTest.Domain.csproj", "src/DrAutoTest.Domain/"]
COPY ["src/DrAutoTest.Infrastructure/DrAutoTest.Infrastructure.csproj", "src/DrAutoTest.Infrastructure/"]
RUN dotnet restore "src/DrAutoTest.API/DrAutoTest.API.csproj"

COPY . .
WORKDIR "/src/src/DrAutoTest.API"
RUN dotnet build "DrAutoTest.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "DrAutoTest.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "DrAutoTest.API.dll"]
