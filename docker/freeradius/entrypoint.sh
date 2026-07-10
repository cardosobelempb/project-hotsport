#!/bin/sh
set -e

# Substitui credenciais MySQL na config do FreeRADIUS via env vars
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_USER="${MYSQL_USER:-hotspotuser}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-senhaforte123}"

SQL_CONF="/etc/freeradius/3.0/mods-enabled/sql"

sed -i "s|server = \".*\"|server = \"${MYSQL_HOST}\"|g"     "$SQL_CONF"
sed -i "s|login = \".*\"|login = \"${MYSQL_USER}\"|g"       "$SQL_CONF"
sed -i "s|password = \".*\"|password = \"${MYSQL_PASSWORD}\"|g" "$SQL_CONF"

exec freeradius -f "$@"
