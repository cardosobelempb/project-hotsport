# ============================================================
# FreeRADIUS - Dockerfile
# Context: raiz do projeto (onde fica freeradius_conf/)
#
# Base Debian (nao a imagem oficial freeradius/freeradius-server) porque
# aquela imagem so publica build amd64 - em VPS arm64 (ex: Coolify em host
# aarch64) todo RUN falha com "exec format error" (nao tem emulacao). O
# pacote "freeradius" do Debian/Ubuntu e multi-arch nativo e roda a mesma
# FreeRADIUS 3.x, so muda o caminho da config pra /etc/freeradius/3.0/.
# ============================================================
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    freeradius \
    freeradius-mysql \
    freeradius-utils \
    && rm -rf /var/lib/apt/lists/*

# Copia nossa config customizada para /etc/freeradius/3.0/ (substituindo defaults do pacote)
COPY freeradius_conf/3.0/ /etc/freeradius/3.0/

COPY docker/freeradius/entrypoint.sh /docker-entrypoint-custom.sh

# Remove EAP (nao usado com MikroTik PAP) para evitar erro de certificado TLS
RUN rm -f /etc/freeradius/3.0/mods-enabled/eap /etc/freeradius/3.0/sites-enabled/inner-tunnel
RUN chmod +x /docker-entrypoint-custom.sh
RUN chown -R freerad:freerad /etc/freeradius/

EXPOSE 1812/udp 1813/udp 3799/udp

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD radtest -t mschapv2 healthcheck healthcheck 127.0.0.1:1812 0 testing123 || exit 0

ENTRYPOINT ["/docker-entrypoint-custom.sh"]
