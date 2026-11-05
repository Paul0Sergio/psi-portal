const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const portalRoutes = require('./src/routes/portalRoutes');
const { ensureAuthenticated, ensureGuest } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Se estiver atrás de um proxy reverso (como Nginx na Oracle Cloud), habilita trust proxy
if (isProduction) {
  app.set('trust proxy', 1);
}

// 1. Cabeçalhos de Segurança (Helmet) com CSP ajustada para CDNs seguras (Tailwind, Google Fonts, Lucide)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://unpkg.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.tailwindcss.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:"
        ],
        connectSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// 2. CORS e Parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Rate Limiting para a rota de login (Prevenção de ataques de força bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // limite de 30 tentativas por IP
  message: {
    success: false,
    message: 'Muitas tentativas de login a partir deste endereço IP. Aguarde 15 minutos antes de tentar novamente.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 4. Configuração de Sessão Segura
const sessionMaxAge = parseInt(process.env.SESSION_MAX_AGE, 10) || 7200000; // 2 horas padrão
const sessionSecret = process.env.SESSION_SECRET || (isProduction ? null : crypto.randomBytes(32).toString('hex'));

if (!sessionSecret) {
  console.error('[ERRO CRÍTICO] Variável SESSION_SECRET obrigatória em ambiente de produção (.env ausente ou incompleto).');
  process.exit(1);
}

app.use(
  session({
    name: 'psi.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Protege contra roubo de cookie via XSS
      secure: isProduction, // HTTPS obrigatório em produção
      sameSite: 'lax', // Proteção contra CSRF
      maxAge: sessionMaxAge
    }
  })
);

// 5. Arquivos estáticos (CSS, JS, imagens públicas)
app.use(express.static(path.join(__dirname, 'public')));

// 6. Rotas de API
app.use('/api', authRoutes);
app.use('/api/login', loginLimiter);
app.use('/api', portalRoutes);

// 7. Rotas de Navegação (Páginas)
// Raiz: Redireciona para o dashboard se logado, ou para login
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

// Tela de Login (Acessível apenas para quem NÃO está logado)
app.get('/login', ensureGuest, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Painel Principal (Acessível EXCLUSIVAMENTE após login)
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// 8. Rota 404
app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).redirect('/');
  }
  res.status(404).json({ success: false, message: 'Recurso não encontrado.' });
});

// 9. Tratamento Global de Erros
app.use((err, req, res, next) => {
  console.error('[ERRO DO SERVIDOR]', err.stack);
  res.status(500).json({
    success: false,
    message: 'Ocorreu um erro interno no servidor.'
  });
});

// 10. Inicialização
app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🛡️  PORTAL PSI - POLÍTICAS & CONTROLES DE SEGURANÇA (ISO/LGPD)`);
  console.log(`🚀 Servidor em execução: http://localhost:${PORT}`);
  console.log(`👤 Usuário Configurado: [${process.env.ADMIN_USER || 'Defina ADMIN_USER no .env'}]`);
  console.log(`🔒 Gestão de Credenciais: 100% isolada via Variáveis de Ambiente (.env)`);
  console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log('================================================================');
});
