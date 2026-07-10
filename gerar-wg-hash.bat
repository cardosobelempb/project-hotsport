@echo off
chcp 65001 >nul
title Gerador de Hash WireGuard

echo.
echo  ┌─────────────────────────────────────────┐
echo  │   GERADOR DE HASH WIREGUARD (bcrypt)    │
echo  └─────────────────────────────────────────┘
echo.
echo  Este script gera o PASSWORD_HASH para o wg-easy.
echo  O hash gerado deve ir em WG_PASS_HASH no .env
echo.

set /p WG_SENHA="  Digite a senha do painel WireGuard: "

if "%WG_SENHA%"=="" (
    echo  [ERRO] Senha nao pode ser vazia.
    pause
    exit /b 1
)

echo.
echo  [>>] Gerando hash via Docker (python3 + bcrypt)...
echo.

docker run --rm python:3.11-alpine sh -c "pip install bcrypt -q && python3 -c \"import bcrypt; print(bcrypt.hashpw(b'%WG_SENHA%', bcrypt.gensalt(12)).decode())\""

echo.
echo  [OK] Copie o hash acima e cole em WG_PASS_HASH no arquivo .env
echo  [!]  Lembre de escapar $ por $$ no docker-compose se colar diretamente
echo.
pause
