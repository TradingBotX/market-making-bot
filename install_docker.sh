#!/bin/bash

# Colors for user feedback
GREEN="\033[0;32m"
RESET="\033[0m"

function installDocker() {
    echo -e "Installing Docker\n"

    sudo apt-get update
    sudo apt-get install apt-transport-https ca-certificates curl software-properties-common -y

    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update
    sudo apt-get install docker-ce docker-ce-cli containerd.io -y

    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    echo -e "${GREEN}Docker Installed Successfully${RESET}"
}

function init() {
    if ! command -v docker &>/dev/null; then
        installDocker
    else
        echo -e "${GREEN}Docker is already installed.${RESET}"
    fi
}

function main() {
    init
}

main
