# Build stage — needs the whole solution because SamrtInventory.API
# references SmartInventory.Application/.Domain/.Infrastructure via
# <ProjectReference>, so it can't be built with only its own folder.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files first (better Docker layer caching — deps only
# re-restore when a .csproj actually changes, not on every code edit)
COPY SamrtInventory.API/*.csproj SamrtInventory.API/
COPY SmartInventory.Application/*.csproj SmartInventory.Application/
COPY SmartInventory.Domain/*.csproj SmartInventory.Domain/
COPY SmartInventory.Infrastructure/*.csproj SmartInventory.Infrastructure/

RUN dotnet restore SamrtInventory.API/SamrtInventory.API.csproj

# Now copy everything else and publish
COPY SamrtInventory.API/ SamrtInventory.API/
COPY SmartInventory.Application/ SmartInventory.Application/
COPY SmartInventory.Domain/ SmartInventory.Domain/
COPY SmartInventory.Infrastructure/ SmartInventory.Infrastructure/

RUN dotnet publish SamrtInventory.API/SamrtInventory.API.csproj -c Release -o /app/out --no-restore

# Runtime stage — smaller image, no SDK needed to just run the app
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

# Railway sets PORT at runtime; ASP.NET Core needs to bind to it explicitly
ENV ASPNETCORE_URLS=http://+:${PORT}

ENTRYPOINT ["dotnet", "SamrtInventory.API.dll"]
