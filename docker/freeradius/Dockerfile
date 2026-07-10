# ============================================================
# FreeRADIUS - Dockerfile
# Context: raiz do projeto (onde fica freeradius_conf/)
# ============================================================
FROM freeradius/freeradius-server:latest

USER root
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Copia nossa config customizada para /etc/freeradius/ (substituindo defaults da imagem base)
COPY freeradius_conf/3.0/ /etc/freeradius/

COPY docker/freeradius/entrypoint.sh /docker-entrypoint-custom.sh

# Remove EAP (nao usado com MikroTik PAP) para evitar erro de certificado TLS
RUN rm -f /etc/freeradius/mods-enabled/eap \
          /etc/freeradius/sites-enabled/inner-tunnel \
    && chmod +x /docker-entrypoint-custom.sh \
    && chown -R freerad:freerad /etc/freeradius/

EXPOSE 1812/udp 1813/udp 3799/udp

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD radtest -t mschapv2 healthcheck healthcheck 127.0.0.1:1812 0 testing123 || exit 0

ENTRYPOINT ["/docker-entrypoint-custom.sh"]
