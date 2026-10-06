#!/usr/bin/env bash
set -e

# ==============================================================================
# ATIVAÇÃO DO PONTO FACIAL NO NGINX HOST DA VPS (SEM TOCAR EM OUTROS SITES)
# ==============================================================================

echo "================================================================="
echo "  🌐 ATIVANDO PTFACIAL.KORENTECH.COM.BR NO NGINX DA VPS"
echo "================================================================="

# 1. Copia a configuração isolada para o Nginx do Host
echo "📄 Criando arquivo de configuração isolado em /etc/nginx/sites-available/ptfacial..."
sudo cp nginx/vps-host-ptfacial.conf /etc/nginx/sites-available/ptfacial

# 2. Cria o link simbólico para sites-enabled (se não existir)
if [ ! -f /etc/nginx/sites-enabled/ptfacial ]; then
    echo "🔗 Habilitando site em /etc/nginx/sites-enabled/ptfacial..."
    sudo ln -s /etc/nginx/sites-available/ptfacial /etc/nginx/sites-enabled/ptfacial
fi

# 3. Testa a sintaxe do Nginx para garantir que nada foi quebrado
echo "🔍 Validando sintaxe do Nginx..."
sudo nginx -t

# 4. Recarrega o Nginx sem derrubar conexões existentes
echo "🔄 Recarregando Nginx (zero downtime para outros sites)..."
sudo systemctl reload nginx

echo "================================================================="
echo "  ✅ NGINX CONFIGURADO COM SUCESSO!"
echo "================================================================="
echo "Domínio ptfacial.korentech.com.br e subdomínios já estão roteando para o container (porta 3080)."
echo ""
echo "👉 Para ativar o SSL HTTPS com Certbot sem afetar outros domínios:"
echo "sudo certbot --nginx -d ptfacial.korentech.com.br"
echo "================================================================="
