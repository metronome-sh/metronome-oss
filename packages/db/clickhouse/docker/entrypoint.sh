#!/bin/bash
# Substitute environment variables in config.xml
# envsubst < /etc/clickhouse-server/config.d/postgres.xml.template > /etc/clickhouse-server/config.d/postgres.xml

POSTGRES_TEMPLATE_PATH=/etc/clickhouse-server/config.d/postgres.xml.template
POSTGRES_TEMPLATE_OUTPUT_PATH=/etc/clickhouse-server/config.d/postgres.xml

sed -e "s/\${POSTGRES_HOST}/$POSTGRES_HOST/g" \
    -e "s/\${POSTGRES_PORT}/$POSTGRES_PORT/g" \
    -e "s/\${POSTGRES_USER}/$POSTGRES_USER/g" \
    -e "s/\${POSTGRES_PASSWORD}/$POSTGRES_PASSWORD/g" \
    -e "s/\${POSTGRES_DB}/$POSTGRES_DB/g" \
    -e "s/\${POSTGRES_SCHEMA}/$POSTGRES_SCHEMA/g" \
    -e "s/\${POSTGRES_DATABASE}/$POSTGRES_DATABASE/g" \
    $POSTGRES_TEMPLATE_PATH > $POSTGRES_TEMPLATE_OUTPUT_PATH

source ./entrypoint.sh
