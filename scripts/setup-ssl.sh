#!/usr/bin/env bash
set -e

# ==============================================================================
# CONFIGURAÇÃO DE CERTIFICADO SSL (HTTPS) - PTFACIAL.KORENTECH.COM.BR
# ==============================================================================

DOMINIO_PRINCIPAL="ptfacial.korentech.com.br"
EMAIL=${1:-"contato@korentech.com.br"}

echo "================================================================="
echo "  🔒 CONFIGURANDO SSL HTTPS PARA: $DOMINIO_PRINCIPAL"
echo "================================================================="

# 1. Garante Certbot e plugin Nginx instalados
echo "📦 Verificando Certbot e plugin Nginx..."
if ! command -v certbot &> /dev/null; then
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# 2. Solicita o certificado Let's Encrypt e configura o Nginx automaticamente
echo "🛡️ Emitindo e ativando certificado SSL Let's Encrypt para $DOMINIO_PRINCIPAL..."
sudo certbot --nginx \
    -d "$DOMINIO_PRINCIPAL" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --redirect

# 3. Testa sintaxe do Nginx e recarrega
sudo nginx -t
sudo systemctl reload nginx

echo "================================================================="
echo "  ✅ CERTIFICADO SSL CONFIGURADO COM SUCESSO!"
echo "================================================================="
echo "Acesse com segurança HTTPS: https://$DOMINIO_PRINCIPAL"
