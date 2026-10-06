#!/usr/bin/env bash
set -e

echo "================================================================="
echo "  🔧 CONFIGURANDO ROTEAMENTO EXATO DO PONTO FACIAL (PORTA 3080)"
echo "================================================================="

# 1. Cria a configuração oficial dedicada para o ptfacial no Nginx do Host
sudo tee /etc/nginx/sites-available/ptfacial.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name ptfacial.korentech.com.br;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ptfacial.korentech.com.br;

    ssl_certificate /etc/letsencrypt/live/ptfacial.korentech.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ptfacial.korentech.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
        client_max_body_size 15M;
    }
}
EOF

# 2. Habilita o site no Nginx
sudo ln -sf /etc/nginx/sites-available/ptfacial.conf /etc/nginx/sites-enabled/ptfacial.conf

# 3. Remove referência duplicada de ptfacial caso o certbot tenha injetado em korentech-atu.conf
if [ -f /etc/nginx/sites-enabled/korentech-atu.conf ]; then
    echo "🔍 Limpando duplicidade em korentech-atu.conf..."
    sudo sed -i 's/ptfacial\.korentech\.com\.br//g' /etc/nginx/sites-enabled/korentech-atu.conf
fi

# 4. Testa a sintaxe e recarrega
echo "🔍 Validando configuração do Nginx..."
sudo nginx -t

echo "🔄 Recarregando Nginx..."
sudo systemctl reload nginx

echo "================================================================="
echo "  ✅ PONTO FACIAL ATIVADO COM SUCESSO EM HTTPS!"
echo "================================================================="
echo "Acesse agora: https://ptfacial.korentech.com.br"
