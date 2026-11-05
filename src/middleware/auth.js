/**
 * Middlewares de Autenticação e Controle de Sessão
 */

function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  // Se for requisição de API (AJAX/Fetch), responde com status 401 JSON
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || req.path.startsWith('/api/')) {
    return res.status(401).json({
      success: false,
      message: 'Sessão expirada ou não autenticada. Por favor, faça login.'
    });
  }

  // Se for requisição de página web, redireciona para a tela de login
  return res.redirect('/login');
}

function ensureGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  return next();
}

module.exports = {
  ensureAuthenticated,
  ensureGuest
};
