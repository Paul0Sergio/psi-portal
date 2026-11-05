const express = require('express');
const router = express.Router();
const { sectorsData } = require('../data/controlsData');
const { ensureAuthenticated } = require('../middleware/auth');

// Todas as rotas deste arquivo exigem sessão autenticada
router.use(ensureAuthenticated);

// GET /api/sectors - Retorna todos os setores e controles com estatísticas consolidadas
router.get('/sectors', (req, res) => {
  let totalControls = 0;
  let compliantCount = 0;
  let inProgressCount = 0;
  let actionRequiredCount = 0;
  let isoControlsCount = 0;
  let lgpdControlsCount = 0;

  sectorsData.forEach(sector => {
    sector.controls.forEach(ctrl => {
      totalControls++;
      if (ctrl.status === 'Conforme') compliantCount++;
      else if (ctrl.status === 'Em Adequação') inProgressCount++;
      else actionRequiredCount++;

      if (ctrl.standard.includes('ISO')) isoControlsCount++;
      if (ctrl.standard.includes('LGPD')) lgpdControlsCount++;
    });
  });

  const compliancePercentage = totalControls > 0 
    ? Math.round((compliantCount / totalControls) * 100) 
    : 0;

  // Sanitiza setores para não expor senhas no payload público do frontend
  const sanitizedSectors = sectorsData.map(({ accessCode, ...s }) => s);

  res.json({
    success: true,
    statistics: {
      totalSectors: sectorsData.length,
      totalControls,
      compliantCount,
      inProgressCount,
      actionRequiredCount,
      compliancePercentage,
      isoControlsCount,
      lgpdControlsCount
    },
    sectors: sanitizedSectors
  });
});

// GET /api/sectors/:id - Retorna um setor específico
router.get('/sectors/:id', (req, res) => {
  const sector = sectorsData.find(s => s.id === req.params.id);
  if (!sector) {
    return res.status(404).json({
      success: false,
      message: 'Setor não encontrado no catálogo.'
    });
  }
  const { accessCode, ...sanitizedSector } = sector;
  res.json({
    success: true,
    sector: sanitizedSector
  });
});

// POST /api/sectors/:id/verify-access - Valida PIN / senha de acesso restrito do setor
router.post('/sectors/:id/verify-access', (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const sector = sectorsData.find(s => s.id === id);
  if (!sector) {
    return res.status(404).json({
      success: false,
      message: 'Setor não encontrado no catálogo.'
    });
  }

  const sanitizedInput = (password || '').trim();
  const masterPassword = process.env.SECTOR_MASTER_PASS;
  const envKey = `SECTOR_${id.toUpperCase().replace(/-/g, '_')}_PASS`;
  const sectorPassword = process.env[envKey] || masterPassword;

  // Validação de segurança: Credenciais de autorização devem vir exclusivamente do ambiente (.env)
  if (!masterPassword && !process.env[envKey]) {
    console.error(`[SEGURANÇA] Nenhuma senha de autorização configurada no .env para o setor "${id}".`);
    return res.status(500).json({
      success: false,
      message: 'Configuração de segurança do setor ausente no servidor. Configure SECTOR_MASTER_PASS no arquivo .env.'
    });
  }

  // Aceita a senha específica do setor ou a senha mestre de gestor
  if (
    (sectorPassword && sanitizedInput === sectorPassword) || 
    (masterPassword && sanitizedInput === masterPassword)
  ) {
    return res.json({
      success: true,
      message: 'Acesso autorizado ao setor.',
      sectorName: sector.name
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Senha incorreta. Acesso negado.'
  });
});

// POST /api/controls/:id/status - Atualiza o status de conformidade de um controle
router.post('/controls/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Conforme', 'Em Adequação', 'Ação Requerida'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status inválido. Escolha entre: ${validStatuses.join(', ')}`
    });
  }

  let found = false;
  let updatedControl = null;

  for (const sector of sectorsData) {
    const ctrl = sector.controls.find(c => c.id === id);
    if (ctrl) {
      ctrl.status = status;
      found = true;
      updatedControl = ctrl;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({
      success: false,
      message: 'Controle não localizado.'
    });
  }

  res.json({
    success: true,
    message: `Status do controle ${id} atualizado para "${status}".`,
    control: updatedControl
  });
});

module.exports = router;
