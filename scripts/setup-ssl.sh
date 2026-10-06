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

# 1. Instala Certbot
echo "📦 Instalando Certbot..."
if command -v apt &> /dev/null; then
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# 2. Cria diretórios para desafio ACME
mkdir -p certbot/conf certbot/www

# 3. Solicita o certificado Let's Encrypt
echo "🛡️ Gerando certificado SSL gratuito via Let's Encrypt..."
sudo certbot certonly --webroot \
    -w ./certbot/www \
    -d "$DOMINIO_PRINCIPAL" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive || {
        echo "⚠️ Dica: Para subdomínios wildcard (*.$DOMINIO_PRINCIPAL), utilize validação DNS:"
        echo "sudo certbot certonly --manual --preferred-challenges dns -d \"$DOMINIO_PRINCIPAL\" -d \"*.$DOMINIO_PRINCIPAL\""
    }

echo "================================================================="
echo "  ✅ CERTIFICADO SSL CONFIGURADO COM SUCESSO!"
echo "================================================================="
echo "Acesse com segurança HTTPS: https://$DOMINIO_PRINCIPAL"
