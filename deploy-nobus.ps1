param(
  [Parameter(Mandatory=$true)]
  [string]$FloatingIp,
  [string]$KeyPath = "$HOME\.ssh\pulse-key.pem"
)

$ErrorActionPreference = "Stop"

Write-Host "1. Packaging Pulse Monorepo for Nobus Cloud ($FloatingIp)..." -ForegroundColor Cyan
$tarFile = Join-Path $env:TEMP "pulse-deploy.tar.gz"
if (Test-Path $tarFile) { Remove-Item $tarFile -Force }

tar -czf $tarFile --exclude=node_modules --exclude=.git --exclude=.data backend frontend docker-compose.yml package.json .env.example

Write-Host "2. Uploading package to ubuntu@$FloatingIp..." -ForegroundColor Cyan
scp -i $KeyPath -o StrictHostKeyChecking=no $tarFile "ubuntu@${FloatingIp}:~/pulse-deploy.tar.gz"

Write-Host "3. Provisioning Docker and launching Pulse stack on Nobus..." -ForegroundColor Cyan
$remoteCmd = "set -e; " +
  "if ! command -v docker >/dev/null 2>&1; then " +
  "  echo 'Installing Docker Engine and Compose...'; " +
  "  sudo DEBIAN_FRONTEND=noninteractive apt-get update -y && " +
  "  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl gnupg && " +
  "  sudo install -m 0755 -d /etc/apt/keyrings && " +
  "  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc && " +
  "  sudo chmod a+r /etc/apt/keyrings/docker.asc && " +
  "  . /etc/os-release && " +
  "  echo `"deb [arch=`$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu `$VERSION_CODENAME stable`" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && " +
  "  sudo DEBIAN_FRONTEND=noninteractive apt-get update -y && " +
  "  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin && " +
  "  sudo systemctl enable --now docker && " +
  "  sudo usermod -aG docker `$USER || true; " +
  "fi; " +
  "mkdir -p ~/pulse && " +
  "tar -xzf ~/pulse-deploy.tar.gz -C ~/pulse && " +
  "cd ~/pulse && " +
  "sudo docker compose up -d --build && " +
  "sudo docker compose ps"

ssh -i $KeyPath -o StrictHostKeyChecking=no "ubuntu@$FloatingIp" $remoteCmd

Write-Host "Pulse deployed live at http://$FloatingIp and http://${FloatingIp}:4000/api" -ForegroundColor Green
