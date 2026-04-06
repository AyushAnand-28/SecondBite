#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-}"
APP_DIR="/opt/secondbite"

echo "======================================================"
echo "  SecondBite – EC2 Deployment"
echo "======================================================"

if ! command -v docker &>/dev/null; then
  echo "[1/5] Installing Docker..."
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo "  Docker installed successfully."
else
  echo "[1/5] Docker already installed. Skipping."
fi

if docker compose version &>/dev/null; then
  echo "[2/5] Docker Compose (plugin) is available: $(docker compose version --short)"
else
  echo "  ERROR: docker compose plugin not found. Install docker-compose-plugin."
  exit 1
fi

if [ -n "$REPO_URL" ]; then
  echo "[3/5] Cloning/updating repository from ${REPO_URL}..."
  if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR" && git pull
  else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
  fi
else
  echo "[3/5] REPO_URL not set – assuming code is already in ${APP_DIR}."
  cd "$APP_DIR"
fi

echo "[4/5] Checking .env file..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo ""
    echo "  ⚠️  .env created from .env.example."
    echo "  IMPORTANT: Edit ${APP_DIR}/.env with your real credentials!"
    echo "  Run: nano ${APP_DIR}/.env"
    echo "  Then re-run this script."
    echo ""
    read -rp "  Press ENTER once you have updated .env to continue..." _
  else
    echo "  ERROR: No .env or .env.example found. Aborting."
    exit 1
  fi
else
  echo "  .env file found."
fi

if grep -q "replace_with_a_very_long_random_secret_string" .env; then
  echo ""
  echo "  ❌  ERROR: JWT_SECRET still has the default placeholder value."
  echo "  Run: nano ${APP_DIR}/.env and set a strong random JWT_SECRET."
  echo "  Tip: openssl rand -hex 64"
  exit 1
fi

echo "[5/5] Building and starting SecondBite containers..."
docker compose down --remove-orphans || true
docker compose up -d --build

echo ""
echo "======================================================"
echo "  ✅  SecondBite is now running!"
echo "  Open: http://$(curl -s ifconfig.me 2>/dev/null || echo '<EC2-IP>')"
echo "  Logs: docker compose logs -f"
echo "  Stop: docker compose down"
echo "======================================================"
