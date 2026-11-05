const express = require('express');
const router = express.Router();

/**
 * Rotas de Autenticação e Gestão de Sessão
 */

// POST /api/login - Realiza a autenticação
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const validUser = process.env.ADMIN_USER;
  const validPass = process.env.ADMIN_PASS;

  if (!validUser || !validPass) {
    console.error('[ERRO DE SEGURANÇA] Credenciais ADMIN_USER ou ADMIN_PASS não configuradas no ambiente (.env).');
    return res.status(500).json({
      success: false,
      message: 'Configurações de autenticação ausentes no servidor. Verifique as variáveis de ambiente no arquivo .env.'
    });
  }

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, informe tanto o usuário quanto a senha.'
    });
  }

  // Sanitização simples de entrada
  const sanitizedUser = String(username).trim();
  const sanitizedPass = String(password).trim();

  if (sanitizedUser === validUser && sanitizedPass === validPass) {
    // Regenerar ID de sessão para mitigar Session Fixation
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Erro interno ao iniciar sessão segura.'
        });
      }

      req.session.user = {
        username: sanitizedUser,
        role: 'Gestor de Conformidade & Cibersegurança',
        institution: 'Portal PSI Institucional',
        loginTime: new Date().toISOString()
      };

      req.session.save((saveErr) => {
        if (saveErr) {
          return res.status(500).json({
            success: false,
            message: 'Erro ao persistir sessão.'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Autenticação realizada com sucesso!',
          redirect: '/dashboard',
          user: {
            username: req.session.user.username,
            role: req.session.user.role
          }
        });
      });
    });
  } else {
    // Retardo sutil para dificultar ataques de enumeração / timing
    setTimeout(() => {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique o usuário e a senha digitados.'
      });
    }, 400);
  }
});

// POST /api/logout - Encerra a sessão com segurança
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao encerrar a sessão.'
        });
      }

      res.clearCookie('psi.sid', { path: '/' });
      return res.status(200).json({
        success: true,
        message: 'Sessão encerrada com sucesso.',
        redirect: '/login'
      });
    });
  } else {
    return res.status(200).json({
      success: true,
      redirect: '/login'
    });
  }
});

// GET /api/me - Informações do usuário autenticado
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({
      authenticated: true,
      user: req.session.user
    });
  }

  return res.status(401).json({
    authenticated: false,
    message: 'Usuário não autenticado.'
  });
});

module.exports = router;
