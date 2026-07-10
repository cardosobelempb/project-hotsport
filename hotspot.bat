@echo off
cd /d "%~dp0"
chcp 437 >nul
setlocal EnableDelayedExpansion
color 0B
title SURB Hotspot - Docker Manager

:MENU
cls
echo.
echo  ================================================================
echo  ================================================================
echo.
echo          ***   S U R B   H O T S P O T   ***
echo                Docker Container Manager
echo            Windows 10   ^|   Docker Desktop
echo.
echo  ================================================================
echo  ================================================================
echo.
echo   [ AMBIENTE ]
echo    [1]  DEV  .......... Subir ambiente de desenvolvimento
echo    [2]  PROD .......... Subir ambiente de producao
echo.
echo   [ IMAGENS ]
echo    [3]  BUILD ......... Construir imagens (multiplatforma)
echo    [4]  PUSH  ......... Enviar imagens para o registry
echo.
echo   [ MONITORAMENTO ]
echo    [5]  STATUS ........ Ver containers em execucao
echo    [6]  LOGS  ......... Visualizar logs de um servico
echo.
echo   [ MANUTENCAO ]
echo    [7]  STOP  ......... Parar todos os containers
echo    [8]  CLEAN ......... Remover containers e volumes
echo    [9]  CONFIG ........ Editar variaveis de ambiente
echo.
echo  ----------------------------------------------------------------
echo    [0]  SAIR
echo  ----------------------------------------------------------------
echo.
set /p OPCAO="  -> Opcao: "

if "%OPCAO%"=="1" goto DEV
if "%OPCAO%"=="2" goto PROD
if "%OPCAO%"=="3" goto BUILD
if "%OPCAO%"=="4" goto PUSH
if "%OPCAO%"=="5" goto STATUS
if "%OPCAO%"=="6" goto LOGS
if "%OPCAO%"=="7" goto STOP
if "%OPCAO%"=="8" goto CLEAN
if "%OPCAO%"=="9" goto CONFIG
if "%OPCAO%"=="0" goto FIM
echo.
echo  [!] Opcao invalida. Tente novamente.
timeout /t 2 >nul
goto MENU

:DEV
cls
echo.
echo  ================================================================
echo   SURB HOTSPOT  ^|  AMBIENTE DE DESENVOLVIMENTO
echo  ================================================================
echo.
if not exist ".env" (
    echo  [!] Arquivo .env nao encontrado. Copiando .env.dev...
    copy .env.dev .env >nul
    echo  [OK] Arquivo .env criado. Revise as variaveis antes de continuar.
    echo.
    pause
)
echo  [^>^>] Iniciando stack DEV com hot-reload...
echo.
docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env up --build -d
if errorlevel 1 (
    echo.
    echo  [ERRO] Falha ao subir os containers! Verifique os logs acima.
    pause
    goto MENU
)
echo.
echo  [OK] Ambiente DEV rodando com sucesso!
echo.
echo  ----------------------------------------------------------------
echo   Servicos disponiveis:
echo  ----------------------------------------------------------------
echo    Frontend  : http://localhost:3000
echo    Backend   : http://localhost:3001
echo    Nginx     : http://localhost:8080
echo    MySQL     : localhost:3306
echo    WireGuard : http://localhost:51821
echo  ----------------------------------------------------------------
echo.
pause
goto MENU

:PROD
cls
echo.
echo  ================================================================
echo   SURB HOTSPOT  ^|  AMBIENTE DE PRODUCAO
echo  ================================================================
echo.
if not exist ".env.prod" (
    echo  [ERRO] Arquivo .env.prod nao encontrado!
    pause
    goto MENU
)
echo  [INFO] Producao usa .env.prod diretamente.
echo  [INFO] Esta stack NAO sobe MySQL, PostgreSQL, Evolution nem Nginx.
echo  [INFO] HTTP/S sera roteado pelo Traefik externo.
echo.
set /p EDIT_PROD="  [?] Deseja revisar .env.prod antes de continuar? (S/N): "
if /i "%EDIT_PROD%"=="S" (
    notepad .env.prod
    echo.
    pause
)
set /p CONF="  [!] Confirma subir PRODUCAO? (S/N): "
if /i not "%CONF%"=="S" goto MENU
echo.
echo  [^>^>] Subindo stack de PRODUCAO...
echo.
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
if errorlevel 1 (
    echo.
    echo  [ERRO] Falha ao subir os containers!
    pause
    goto MENU
)
echo.
echo  [OK] Stack de PRODUCAO rodando!
echo.
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
echo.
pause
goto MENU

:BUILD
cls
echo.
echo  ================================================================
echo   SURB HOTSPOT  ^|  BUILD DE IMAGENS
echo  ================================================================
echo.
if not exist ".env.prod" (
    echo  [ERRO] Arquivo .env.prod nao encontrado!
    pause
    goto MENU
)
set REGISTRY=
set IMAGE_TAG=
for /f "tokens=1,* delims==" %%A in (.env.prod) do (
    if "%%A"=="REGISTRY"  set REGISTRY=%%B
    if "%%A"=="IMAGE_TAG" set IMAGE_TAG=%%B
)
if "%REGISTRY%"=="" set /p REGISTRY="  Registry (ex: usuario ou ghcr.io/usuario): "
if "%IMAGE_TAG%"=="" set IMAGE_TAG=latest
echo.
echo  Registry : %REGISTRY%
echo  Tag      : %IMAGE_TAG%
echo.
echo  Tipo de saida do build:
echo   [1]  LOCAL  - Carregar no Docker Desktop (linux/amd64, sem push)
echo   [2]  TAR    - Gerar arquivos .tar para VPS/Portainer
echo   [3]  PUSH   - Multiplatforma e enviar para o registry
echo.
set /p BUILD_MODE="  -> Escolha: "
if "%BUILD_MODE%"=="" set BUILD_MODE=1
if not "%BUILD_MODE%"=="1" if not "%BUILD_MODE%"=="2" if not "%BUILD_MODE%"=="3" (
    echo.
    echo  [!] Opcao invalida.
    pause
    goto MENU
)
if "%BUILD_MODE%"=="3" (
    set BUILD_PLATFORM=linux/amd64,linux/arm64
) else (
    echo.
    echo  Arquitetura alvo:
    echo   [1]  linux/amd64  - VPS Intel/AMD comum
    echo   [2]  linux/arm64  - VPS ARM/Ampere/Oracle ARM
    echo.
    set /p ARCH_MODE="  -> Escolha: "
    if "!ARCH_MODE!"=="" set ARCH_MODE=1
    if "!ARCH_MODE!"=="1" set BUILD_PLATFORM=linux/amd64
    if "!ARCH_MODE!"=="2" set BUILD_PLATFORM=linux/arm64
    if not "!ARCH_MODE!"=="1" if not "!ARCH_MODE!"=="2" (
        echo.
        echo  [!] Opcao invalida.
        pause
        goto MENU
    )
)
echo.
echo  Plataforma : %BUILD_PLATFORM%
echo.
echo  Configurar builder buildx:
echo   [1]  Criar/usar builder 'hotspot-builder'
echo   [2]  Pular (usar builder atual)
echo.
set /p BUILD_CHOICE="  -> Escolha: "
if "%BUILD_CHOICE%"=="1" (
    docker buildx create --name hotspot-builder --driver docker-container --use
    docker buildx inspect --bootstrap
)
echo.
if "%BUILD_MODE%"=="1" goto BUILD_LOCAL
if "%BUILD_MODE%"=="2" goto BUILD_TAR
if "%BUILD_MODE%"=="3" goto BUILD_PUSH

:BUILD_LOCAL
echo  [^>^>] Buildando backend (local)...
docker buildx build --platform %BUILD_PLATFORM% --target production -f docker/backend/Dockerfile -t %REGISTRY%/backend:%IMAGE_TAG% --load .
if errorlevel 1 goto BUILD_ERROR
echo.
echo  [^>^>] Buildando frontend (local)...
docker buildx build --platform %BUILD_PLATFORM% --target production -f docker/frontend/Dockerfile -t %REGISTRY%/frontend:%IMAGE_TAG% --load .
if errorlevel 1 goto BUILD_ERROR
echo.
echo  [^>^>] Buildando freeradius (local)...
docker buildx build --platform %BUILD_PLATFORM% -f docker/freeradius/Dockerfile -t %REGISTRY%/freeradius:%IMAGE_TAG% --load .
if errorlevel 1 goto BUILD_ERROR
goto BUILD_OK_LOCAL

:BUILD_TAR
if not exist "dist-images" mkdir dist-images
echo  [^>^>] Gerando backend.tar...
docker buildx build --platform %BUILD_PLATFORM% --target production -f docker/backend/Dockerfile -t %REGISTRY%/backend:%IMAGE_TAG% --output type=docker,dest=dist-images/backend-%IMAGE_TAG%.tar .
if errorlevel 1 goto BUILD_ERROR
echo.
echo  [^>^>] Gerando frontend.tar...
docker buildx build --platform %BUILD_PLATFORM% --target production -f docker/frontend/Dockerfile -t %REGISTRY%/frontend:%IMAGE_TAG% --output type=docker,dest=dist-images/frontend-%IMAGE_TAG%.tar .
if errorlevel 1 goto BUILD_ERROR
echo.
echo  [^>^>] Gerando freeradius.tar...
docker buildx build --platform %BUILD_PLATFORM% -f docker/freeradius/Dockerfile -t %REGISTRY%/freeradius:%IMAGE_TAG% --output type=docker,dest=dist-images/freeradius-%IMAGE_TAG%.tar .
if errorlevel 1 goto BUILD_ERROR
goto BUILD_OK_TAR

:BUILD_PUSH
echo  [^>^>] Buildando e enviando backend...
docker buildx build --platform %BUILD_PLATFORM% --target production -f docker/backend/Dockerfile -t %REGISTRY%/backend:%IMAGE_TAG% --push .
if errorlevel 1 goto BUILD_ERROR
echo.
echo  [^>^>] Buildando e enviando frontend...
docker buildx build --platform %BUILD_PLATFORM% --target production -f docker/frontend/Dockerfile -t %REGISTRY%/frontend:%IMAGE_TAG% --push .
if errorlevel 1 goto BUILD_ERROR
echo.
echo  [^>^>] Buildando e enviando freeradius...
docker buildx build --platform %BUILD_PLATFORM% -f docker/freeradius/Dockerfile -t %REGISTRY%/freeradius:%IMAGE_TAG% --push .
if errorlevel 1 goto BUILD_ERROR
goto BUILD_OK_PUSH

:BUILD_ERROR
echo.
echo  [ERRO] Falha no build! Verifique os logs acima.
echo.
pause
goto MENU

:BUILD_OK_LOCAL
echo.
echo  [OK] Imagens carregadas localmente:
echo    %REGISTRY%/backend:%IMAGE_TAG%
echo    %REGISTRY%/frontend:%IMAGE_TAG%
echo    %REGISTRY%/freeradius:%IMAGE_TAG%
echo.
pause
goto MENU

:BUILD_OK_TAR
echo.
echo  [OK] Arquivos gerados em dist-images/:
echo    backend-%IMAGE_TAG%.tar
echo    frontend-%IMAGE_TAG%.tar
echo    freeradius-%IMAGE_TAG%.tar
echo.
echo  Para importar no VPS/Portainer, mantenha as tags:
echo    %REGISTRY%/backend:%IMAGE_TAG%
echo    %REGISTRY%/frontend:%IMAGE_TAG%
echo    %REGISTRY%/freeradius:%IMAGE_TAG%
echo.
pause
goto MENU

:BUILD_OK_PUSH
echo.
echo  [OK] Imagens publicadas com sucesso:
echo    %REGISTRY%/backend:%IMAGE_TAG%
echo    %REGISTRY%/frontend:%IMAGE_TAG%
echo    %REGISTRY%/freeradius:%IMAGE_TAG%
echo.
pause
goto MENU

:PUSH
cls
echo.
echo  ================================================================
echo   SURB HOTSPOT  ^|  ENVIAR IMAGENS AO REGISTRY
echo  ================================================================
echo.
set REGISTRY=
set IMAGE_TAG=
for /f "tokens=1,* delims==" %%A in (.env.prod) do (
    if "%%A"=="REGISTRY"  set REGISTRY=%%B
    if "%%A"=="IMAGE_TAG" set IMAGE_TAG=%%B
)
echo  Registry : %REGISTRY%
echo  Tag      : %IMAGE_TAG%
echo.
echo  [!] Certifique-se de ter executado "docker login" e ter
echo      permissao de escrita no repositorio %REGISTRY%/*.
echo.
set /p PUSH_CONF="  [?] Confirma enviar imagens para o registry? (S/N): "
if /i not "%PUSH_CONF%"=="S" goto MENU
echo.
echo  [^>^>] Enviando imagens para o registry...
docker push %REGISTRY%/backend:%IMAGE_TAG%
docker push %REGISTRY%/frontend:%IMAGE_TAG%
docker push %REGISTRY%/freeradius:%IMAGE_TAG%
echo.
echo  [OK] Push concluido com sucesso!
echo.
pause
goto MENU

:STATUS
cls
echo.
echo  ================================================================
echo   SURB HOTSPOT  ^|  STATUS DOS CONTAINERS
echo  ================================================================
echo.
docker ps --filter "name=hotspot-"
echo.
echo  --- Uso de recursos ---
docker stats --no-stream hotspot-backend hotspot-frontend hotspot-freeradius hotspot-wireguard
echo.
pause
goto MENU

:LOGS
cls
echo.
echo  ================================================================
echo   SURB HOTSPOT  ^|  LOGS DE SERVICO
echo  ================================================================
echo.
echo  Servicos disponiveis:
echo    backend     frontend
echo    freeradius  wg-easy
echo.
set /p SVC="  -> Nome do servico: "
if /i "%SVC%"=="backend"    set SVC=hotspot-backend
if /i "%SVC%"=="frontend"   set SVC=hotspot-frontend
if /i "%SVC%"=="freeradius" set SVC=hotspot-freeradius
if /i "%SVC%"=="wg-easy"    set SVC=hotspot-wireguard
echo.
echo  [CTRL+C para interromper os logs]
echo.
docker logs -f --tail=100 %SVC%
goto MENU

:STOP
cls
echo.
echo  ================================================================
echo   SURB HOTSPOT  ^|  PARAR TODOS OS SERVICOS
echo  ================================================================
echo.
echo  [^>^>] Parando containers DEV...
docker compose -f docker-compose.yml -f docker-compose.dev.yml down 2>nul
echo  [^>^>] Parando containers PROD...
docker compose -f docker-compose.prod.yml --env-file .env.prod down 2>nul
echo.
echo  [OK] Todos os containers foram parados.
echo.
pause
goto MENU

:CLEAN
cls
echo.
echo  ================================================================
echo   SURB HOTSPOT  ^|  REMOVER CONTAINERS E VOLUMES
echo  ================================================================
echo.
echo  [!!!] ATENCAO: Esta operacao apagara volumes locais!
echo        Dados removidos: uploads, backups, WireGuard e banco DEV.
echo.
echo  Para confirmar, digite DELETAR (em maiusculas):
set /p CONF="  -> "
if not "%CONF%"=="DELETAR" (
    echo.
    echo  [!] Operacao cancelada.
    pause
    goto MENU
)
echo.
echo  [^>^>] Removendo containers e volumes DEV...
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans 2>nul
echo  [^>^>] Removendo containers e volumes PROD...
docker compose -f docker-compose.prod.yml --env-file .env.prod down -v --remove-orphans 2>nul
echo.
echo  [OK] Limpeza concluida com sucesso.
echo.
pause
goto MENU

:CONFIG
cls
echo.
echo  ================================================================
echo   SURB HOTSPOT  ^|  CONFIGURACAO DE VARIAVEIS
echo  ================================================================
echo.
echo   [1]  Editar .env        (ambiente ativo)
echo   [2]  Editar .env.dev    (template de desenvolvimento)
echo   [3]  Editar .env.prod   (template de producao)
echo   [4]  Gerar senhas seguras
echo   [0]  Voltar ao menu principal
echo.
set /p CONF_OPC="  -> Escolha: "
if "%CONF_OPC%"=="1" notepad .env
if "%CONF_OPC%"=="2" notepad .env.dev
if "%CONF_OPC%"=="3" notepad .env.prod
if "%CONF_OPC%"=="4" goto SENHAS
goto MENU

:SENHAS
cls
echo.
echo  ================================================================
echo   SURB HOTSPOT  ^|  GERADOR DE SENHAS SEGURAS
echo  ================================================================
echo.
echo  Execute os comandos abaixo no PowerShell:
echo.
echo  [JWT Secret - 48 caracteres]
echo  -join ((65..90+97..122+48..57)*10 ^| Get-Random -Count 48 ^| %%{[char]$_})
echo.
echo  [Senha DB/WireGuard - 24 caracteres]
echo  -join ((65..90+97..122+48..57)*10 ^| Get-Random -Count 24 ^| %%{[char]$_})
echo.
echo  [WireGuard Hash]
echo  Execute: gerar-wg-hash.bat
echo.
pause
goto MENU

:FIM
echo.
echo  SURB Hotspot - Ate logo!
echo.
endlocal
exit /b 0
