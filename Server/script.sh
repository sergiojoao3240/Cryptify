#!/bin/bash
#sed -i 's/\r//' script.sh
#!/bin/bash

SUDO="sudo"
[ "$(uname)" == "Darwin" ] && SUDO=""

# Colors
ESC=$(printf '\033') RESET="${ESC}[0m" RED="${ESC}[31m" GREEN="${ESC}[32m" YELLOW="${ESC}[33m"
BLUE="${ESC}[34m" MAGENTA="${ESC}[35m" CYAN="${ESC}[36m"

greenprint() { printf "${GREEN}%s${RESET}\n" "$1"; }
blueprint() { printf "${BLUE}%s${RESET}\n" "$1"; }
redprint() { printf "${RED}%s${RESET}\n" "$1"; }
yellowprint() { printf "${YELLOW}%s${RESET}\n" "$1"; }
magentaprint() { printf "${MAGENTA}%s${RESET}\n" "$1"; }
cyanprint() { printf "${CYAN}%s${RESET}\n" "$1"; }

fn_bye() { echo "Bye bye."; exit 0; }
fn_fail() { echo "Wrong option."; exit 1; }

#------------------ Functions ------------------

Full_Project_build() {
    Traefik_Portainer_compose_up
    API_compose_up
    echo "Full project build finished."
}

Traefik_Portainer_compose_up() {
    $SUDO docker network inspect api-internal-network >/dev/null 2>&1 || $SUDO docker network create --internal api-internal-network
    $SUDO docker network inspect traefik-proxy >/dev/null 2>&1 || $SUDO docker network create traefik-proxy
    $SUDO docker network inspect backend-logs >/dev/null 2>&1 || $SUDO docker network create backend-logs
    $SUDO docker volume inspect portainer-data >/dev/null 2>&1 || $SUDO docker volume create portainer-data
    $SUDO docker volume inspect backend-logs >/dev/null 2>&1 || $SUDO docker volume create backend-logs

    cd ./portainer || exit
    $SUDO docker compose up -d --build
    cd ..

    cd ./traefik || exit
    [ ! -f acme.json ] && echo "{}" > acme.json
    $SUDO chmod 600 acme.json
    $SUDO docker compose up -d --build
    cd ..
}

API_compose_up() {
    cd ./backend || exit
    $SUDO docker compose up -d --build
    cd ..
}

API_compose_down() {
    cd ./backend || exit
    $SUDO docker compose down
    cd ..
}

Traefik_Portainer_compose_down() {
    cd ./portainer || exit
    $SUDO docker compose down
    cd ..
    cd ./traefik || exit
    $SUDO docker compose down
    cd ..
}

docker_status() {
    $SUDO docker ps
}

install_docker() {
    if [ "$(uname)" == "Linux" ]; then
        $SUDO apt update
        $SUDO apt install apt-transport-https curl gnupg-agent ca-certificates software-properties-common -y
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO apt-key add -
        $SUDO add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
        $SUDO apt install docker-ce docker-ce-cli containerd.io -y
        docker version
    else
        echo "Please install Docker manually on MacOS."
    fi
}

#------------------ Menus ------------------

mainmenu() {
    echo -ne "
$(magentaprint 'Docker Manager')
$(magentaprint '-----------')
$(greenprint '1)') Install Docker (First Time)
$(cyanprint '2)') Build Full Project
$(greenprint '3)') Build API Container
$(yellowprint '4)') Compose Down API Container
$(cyanprint '5)') Docker Status
$(redprint '0)') Exit
Choose an option: "
    read -r ans
    case $ans in
    1) install_docker; fn_bye ;;
    2) Full_Project_build; fn_bye ;;
    3) API_compose_up; mainmenu ;;
    4) API_compose_down; mainmenu ;;
    5) docker_status; mainmenu ;;
    0) fn_bye ;;
    *) fn_fail ;;
    esac
}

#------------------ Start ------------------
mainmenu
