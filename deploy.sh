#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' 

DOCKER_COMPOSE_URL="https://raw.githubusercontent.com/avashForReal/caddy-control/refs/heads/main/docker-compose.yml"

echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}Caddy Control Setup${NC}"
echo -e "${BLUE}=========================================${NC}"

echo -e "${YELLOW}Enter Server IP (required):${NC}"
read -p "> " CADDY_SERVER_IP

if [[ -z "$CADDY_SERVER_IP" ]]; then
    echo -e "${RED}Error: Server IP is required. Exiting.${NC}"
    exit 1
fi

echo -e "${YELLOW}Enter App Host domain (required):${NC}"
read -p "> " APP_HOST

if [[ -z "$APP_HOST" ]]; then
    echo -e "${RED}Error: App Host is required. Exiting.${NC}"
    exit 1
fi

echo -e "${YELLOW}Enter JWT secret (required):${NC}"
read -p "> " JWT_SECRET

if [[ -z "$JWT_SECRET" ]]; then
    echo -e "${RED}Error: JWT secret is required. Exiting.${NC}"
    exit 1
fi

if [[ ! -f "docker-compose.yml" ]]; then
    echo -e "${YELLOW}Fetching docker compose...${NC}"
    curl -sSL -o docker-compose.yml "$DOCKER_COMPOSE_URL"

    if [[ ! -f "docker-compose.yml" ]]; then
        echo -e "${RED}Error: Failed to fetch docker compose. Exiting.${NC}"
        exit 1
    fi
    echo -e "${GREEN}docker-compose.yml downloaded successfully.${NC}"
fi

echo "Updating docker-compose.yml with your configuration..."

# replace values in the docker-compose.yml file
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/APP_HOST=.*/APP_HOST=${APP_HOST}/" docker-compose.yml
    sed -i '' "s/CADDY_SERVER_IP=.*/CADDY_SERVER_IP=${CADDY_SERVER_IP}/" docker-compose.yml
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" docker-compose.yml
else
    sed -i "s/APP_HOST=.*/APP_HOST=${APP_HOST}/" docker-compose.yml
    sed -i "s/CADDY_SERVER_IP=.*/CADDY_SERVER_IP=${CADDY_SERVER_IP}/" docker-compose.yml
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" docker-compose.yml
fi


echo -e "${GREEN}Configuration complete!${NC}"
echo -e "${BLUE}----------------------------------------${NC}"
echo -e "${GREEN}Settings:${NC}"
echo -e "  App Host: ${APP_HOST}"
echo -e "  Server IP: ${CADDY_SERVER_IP}"
echo -e "  JWT Secret: ${JWT_SECRET}"
echo -e "${BLUE}----------------------------------------${NC}"

echo -e "${GREEN}Starting services...${NC}"

sudo docker compose up -d

echo -e "${GREEN}Create an A record for ${APP_HOST} pointing ${CADDY_SERVER_IP}:${NC}"
echo -e "${GREEN}Caddy control will be available at ${APP_HOST}:${NC}"