# 🛡️ Portal PSI - Políticas & Controles de Segurança da Informação

> **Sistema Integrado de Gestão da Segurança da Informação (SGSI)**  
> Conformidade com a norma **ISO/IEC 27001:2022** e a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**.

---

## 📋 Sumário Executivo

O **Portal PSI** é uma aplicação web desenvolvida para centralizar, demonstrar e gerenciar políticas de segurança da informação organizadas por setores institucionais estratégicos. O sistema implementa uma camada de autenticação segura, painel de controle executivo com métricas de auditoria em tempo real, busca inteligente e detalhes técnicos aprofundados sobre cada controle de segurança.

---

## 🏢 Setores Mapeados e Cobertura Normativa

### 1. Setor de Ensino e Pesquisa
- **ISO 27001 (Anexo A.9 - Controle de Acesso):** Segregação de privilégios entre alunos, professores e pesquisadores (RBAC, MFA obrigatório e isolamento de rede acadêmica).
- **ISO 27001 (Anexo A.12 - Segurança nas Operações):** Proteção e prevenção de vazamento de propriedade intelectual, teses e patentes (DLP, criptografia de disco de bancadas).
- **ISO 27001 (Anexo A.12.3 - Cópias de Segurança):** Rotinas de backup 3-2-1 criptografados com retenção imutável anti-ransomware.
- **LGPD (Art. 7º, IV e Art. 14):** Diretrizes para tratamento de dados pessoais em pesquisas científicas, anonimização de dados e consentimento qualificado.

### 2. Setor de Compras e Fornecedores
- **ISO 27001 (Anexo A.15.1 - Relação com Fornecedores):** Processo de homologação de risco de terceiros (TPRM), questionários de maturidade e acordos de confidencialidade (NDA).
- **ISO 27001 (Anexo A.15.2 - Gerenciamento de Serviços de Terceiros):** Acessos de manutenção restritos via Bastion Host com MFA e sessão gravada; monitoramento contínuo de SLAs.
- **LGPD (Art. 39 e Art. 42):** Definição de responsabilidade compartilhada entre Controlador e Operador; contratos com penalidades por incidentes de dados.
- **LGPD (Art. 33 a 36):** Cláusulas-padrão contratuais para contratação de fornecedores SaaS de nuvem internacional.

### 3. Setor CEOP e Centro Cirúrgico
- **LGPD (Art. 5º, II e Art. 11):** Proteção estrita a dados pessoais sensíveis de saúde e prontuários sob a base legal de tutela da saúde e sigilo médico.
- **ISO 27001 (Anexo A.12.4 - Logs e Auditoria):** Trilhas de auditoria imutáveis com registros de acesso a prontuários eletrônicos (quem visualizou, modificou ou exportou registros clínicos).
- **ISO 27001 (Anexo A.10.1 - Criptografia):** Criptografia de ponta a ponta (TLS 1.3 / AES-256) em sistemas de imagem médica (PACS/DICOM) e telemedicina cirúrgica.
- **ISO 27001 (Anexo A.11.1 / A.11.2 - Segurança Física):** Bloqueio automático de telas com timeout de 60 segundos e autenticação por crachás RFID nos blocos operatórios.
- **ISO 27001 (Anexo A.13.1 - Segurança em Redes):** Micro-segmentação e VLAN dedicada para dispositivos biomédicos e equipamentos IoT de suporte à vida.

### 4. Almoxarifado e Faturamento
- **ISO 27001 (Anexo A.8.1 - Gestão de Ativos):** Inventário contínuo de hardware e software com QR Code e classificação de confidencialidade.
- **ISO 27001 (Anexo A.8.3 - Manipulação de Mídias):** Procedimentos seguros de descarte e sanitização criptográfica de discos e mídias (padrão NIST SP 800-88).
- **ISO 27001 (Anexo A.14 - Segurança em Sistemas Financeiros):** Segregação de funções (SoD - *Four-Eyes Principle*) na emissão de faturamento e aprovação de pagamentos; prevenção contra golpes do boleto e fraudes bancárias.
- **LGPD (Art. 6º, III e Art. 16):** Minimização na retenção de dados cadastrais e fiscais de clientes, com eliminação automática após o prazo legal tributário.

---

## 🛡️ Requisitos de Segurança & Prevenção de Vazamento de Dados

> **Critério Mandatório de Cibersegurança & Boas Práticas (ISO/IEC 27001 & LGPD)**

Este repositório foi construído seguindo diretrizes estritas para **eliminar qualquer risco de vazamento de credenciais e dados sensíveis**:

1. **Uso Rigoroso do `.gitignore`:**
   - **Variáveis de Ambiente:** Bloqueio completo de `.env`, `.env.*` (mantendo apenas o modelo seguro `.env.example`).
   - **Chaves Privadas SSH & Certificados:** Proibição de `id_rsa*`, `id_ed25519*`, `*.pem`, `*.key`, `*.pfx`, `*.crt`.
   - **Credenciais de Cloud:** Bloqueio de credenciais AWS (`.aws/`, `credentials`), Google Cloud (`*service-account*.json`, `*gcp*.json`), Azure (`.azure/`, `azureProfile.json`), Oracle Cloud (`.oci/`, `oci_api_key*`) e Kubernetes (`.kube/`, `kubeconfig`).
   - **Bancos de Dados Locais:** Bloqueio de dumps e arquivos de banco (`*.sqlite`, `*.sqlite3`, `*.db`, `*.sql`, `dump.rdb`).
   - **Tokens e Segredos:** Bloqueio de pastas e arquivos de credenciais (`secrets/`, `*.token`, `auth.json`).

2. **Ausência Total de Senhas Hardcoded:**
   - O código-fonte não possui nenhuma senha, chave de criptografia ou segredo gravado estaticamente.
   - Todo segredo (autenticação, assinatura de sessão, senhas de setor) é obrigatoriamente injetado em tempo de execução via variáveis de ambiente (`process.env`), em estrita conformidade com o princípio do *12-Factor App*.

---

## 💻 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18.x, 20.x ou superior)
- **npm** (gerenciador de pacotes incluso no Node.js)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Paul0Sergio/psi-portal.git
   cd psi-portal
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Crie seu arquivo de ambiente `.env` a partir do modelo:**
   ```bash
   cp .env.example .env
   ```
   *(No Windows PowerShell, utilize `Copy-Item .env.example .env`).*

4. **Configure as variáveis no seu `.env` local:**
   Abra o arquivo `.env` gerado e defina suas credenciais de desenvolvimento/avaliação:
   ```env
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=insira_uma_chave_secreta_longa_e_aleatoria
   ADMIN_USER=admin
   ADMIN_PASS=sua_senha_de_teste_aqui
   SECTOR_MASTER_PASS=sua_senha_mestre_de_setor_aqui
   ```

5. **Inicie o servidor:**
   ```bash
   npm start
   ```
   *(Ou utilize `npm run dev` para recarregamento automático durante desenvolvimento).*

6. **Acesse no navegador:**
   Abra: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Guia de Deploy em Nuvem (Oracle Cloud Infrastructure - OCI) com HTTPS

Abaixo está o roteiro completo para hospedar a aplicação em uma Máquina Virtual gratuita da **Oracle Cloud (Always Free)** utilizando Ubuntu ou Oracle Linux, com **Proxy Reverso Nginx**, gerenciamento de processo **PM2** e certificado digital **SSL/TLS gratuito (Let's Encrypt / Certbot)**.

---

### Passo 1: Liberar Portas na Rede da Oracle Cloud (VCN Ingress Rules)

1. No Console da Oracle Cloud, acesse: **Networking > Virtual Cloud Networks (VCN)**.
2. Clique na sua VCN e em seguida na sua **Default Security List**.
3. Clique em **Add Ingress Rules** e adicione duas regras de entrada:
   - **Regra 1 (HTTP):**
     - Source CIDR: `0.0.0.0/0`
     - IP Protocol: `TCP`
     - Destination Port Range: `80`
   - **Regra 2 (HTTPS):**
     - Source CIDR: `0.0.0.0/0`
     - IP Protocol: `TCP`
     - Destination Port Range: `443`

---

### Passo 2: Configurar o Firewall Interno da VM Linux

Acesse sua máquina virtual via SSH:
```bash
ssh -i sua_chave.key ubuntu@IP_PUBLICO_DA_ORACLE
```

A Oracle Cloud possui regras rígidas no `iptables` interno da VM. Execute os comandos abaixo para liberar as portas 80 e 443 no sistema operacional:

```bash
# Se estiver usando Ubuntu:
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

### Passo 3: Instalar Node.js, Nginx, Certbot e PM2

```bash
# Atualizar repositórios
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git

# Instalar PM2 globalmente
sudo npm install -g pm2
```

---

### Passo 4: Clonar e Iniciar a Aplicação com PM2

1. Crie o diretório da aplicação:
   ```bash
   sudo mkdir -p /var/www/psi-portal
   sudo chown -R $USER:$USER /var/www/psi-portal
   cd /var/www/psi-portal
   ```

2. Transfira os arquivos do projeto para este diretório e instale as dependências:
   ```bash
   npm install --production
   ```

3. Crie o arquivo `.env` de produção:
   ```bash
   nano .env
   ```
   *Insira suas configurações (ajuste `NODE_ENV=production` e defina um `SESSION_SECRET` seguro).*

4. Inicie o portal com o PM2 usando o arquivo de configuração fornecido:
   ```bash
   pm2 start deploy/ecosystem.config.js
   pm2 save
   pm2 startup
   # Execute o comando indicado na tela pelo PM2 para habilitar o reinício automático no boot
   ```

---

### Passo 5: Configurar o Proxy Reverso Nginx

1. Copie o arquivo de exemplo para as configurações do Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/psi-portal
   ```

2. Insira a configuração de proxy apontando para a porta 3000:
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com.br www.seu-dominio.com.br;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Ative o site e reinicie o Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/psi-portal /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

### Passo 6: Emitir Certificado SSL Gratuito (HTTPS) com Let's Encrypt

Certifique-se de que o seu domínio (ex: `psi.seusite.com`) está apontando (Registro DNS tipo `A`) para o IP Público da sua VM na Oracle Cloud. Em seguida, execute:

```bash
sudo certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br
```

- Siga as instruções na tela informando seu e-mail.
- O Certbot configurará automaticamente o redirecionamento forçado de HTTP para HTTPS e a renovação periódica automática via cronjob.

Pronto! Seu **Portal PSI** estará operando em produção com alta disponibilidade, criptografia ponta a ponta e total conformidade.

---

## 🔒 Arquitetura de Segurança Implementada

- **Proteção contra Força Bruta (Rate Limiting):** A rota de autenticação bloqueia tentativas sucessivas de invasão.
- **Proteção de Cabeçalhos HTTP (`Helmet`):** Definição de Content Security Policy (CSP), mitigação de clickjacking (`X-Frame-Options`), e desativação de detecção de tipo MIME (`X-Content-Type-Options`).
- **Sessões HTTP-Only com SameSite:** Cookies protegidos contra leitura indevida por scripts maliciosos (XSS) e blindados contra ataques de falsificação entre sites (CSRF).
- **Segregação de Privilégios no Dashboard:** Rotas de visualização e alteração de controles são protegidas por middleware de autorização.
- **Regeneração de ID de Sessão:** Evita ataques de *Session Fixation* no momento em que o login é efetuado com sucesso.
