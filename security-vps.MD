Tudo isso de forma prática em uma VPS Ubuntu Linux.

5 configurações básicas
1. Usuário administrador
2. SSH Key
3. Desabilitar Root
4. Desabilitar Senha
5. Firewall + Fail2Ban


Para windows - recomendado instalar windows subsystem for linux - wsl2
wsl --install 
wsl --status
wsl


Dentro da VPS
// Acessar vps via ssh
ssh -i C:\Users\surb\.ssh\ssh-key-2026-05-25.key root@137.131.246.125
ssh -i ssh-key-2026-05-25.key root@137.131.246.125
ssh -i ssh-key-2026-05-25.key alfablond@137.131.246.125
ssh root@IP_DO_SERVIDOR

// Atualizar o sistema
sudo apt update
sudo apt upgrade -y

// Criar um novo usuário administrador
sudo adduser alfablond
sudo usermod -aG sudo alfablond

// Testar se o usuário tem o grupo sudo
// Se aparecer sudo o usuário tem privilégio administrativos
groups SEU_USER

// Gerar chave SSH (Windows, Linux e macOS)
ssh-keygen -t ed25519 -C "email@email.com"
ssh-keygen -t ed25519 -C "alfablond@surb.com.br"
ssh-keygen -t ed25519 -C "alfablond@surb.com.br" -f ~/.ssh/alfablond-09-07-2026


// Visualizar a chave pública (Linux/macOS)
cat ~/.ssh/id_ed25519.pub

// Copiar chave para o servidor (Linux/macOS)
ssh-copy-id -i ~/.alfablond-09-07-2026.pub alfablond@137.131.246.125
ssh-copy-id -i ssh-key-2026-05-25.key.pub alfablond-09-07-2026.pub alfablond@137.131.246.125

// Conectar ao servidor
ssh SEU_USER@IP_DO_SERVIDOR

// Editar configuração do SSH
sudo nano /etc/ssh/sshd_config

// Desabilitar login root
PermitRootLogin no

// Desabilitar login por senha
PasswordAuthentication no

// Desabilitar interação com senha
KbdInteractiveAuthentication no

// Alterar porta SSH (opcional)
Port 2222

// Reiniciar serviço SSH
sudo systemctl restart ssh

// Instalar firewall Uncomplicated Firewall - UFW
sudo apt install ufw -y

// Liberar SSH
sudo ufw allow 22/tcp

// Liberar SSH em porta customizada (caso altere a porta)
sudo ufw allow 2222/tcp

// Liberar HTTP
sudo ufw allow 80/tcp

// Liberar HTTPS
sudo ufw allow 443/tcp

// Ativar firewall
sudo ufw enable

// Verificar regras do firewall
sudo ufw status

// Instalar Fail2Ban
sudo apt install fail2ban -y

// Habilitar Fail2Ban
sudo systemctl enable fail2ban

// Iniciar Fail2Ban
sudo systemctl start fail2ban

// Verificar status do Fail2Ban
sudo systemctl status fail2ban

// Instalar atualizações automáticas
sudo apt install unattended-upgrades -y

// Configurar atualizações automáticas
sudo dpkg-reconfigure unattended-upgrades

// Alternativa para visualizar tentativas de login
sudo tail -f /var/log/auth.log

docker load -i backend-production.tar