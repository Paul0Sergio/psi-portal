/**
 * Lógica do Dashboard de Políticas e Controles (Portal PSI) - Tema Claro Corporativo
 */

let globalData = null;
let currentFrameworkFilter = 'all';
let searchQuery = '';
let unlockedSectors = new Set();
let pendingInspection = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Inicialização de ícones
  refreshIcons();

  // 1. Carregar perfil do usuário e verificar sessão
  await checkUserSession();

  // 2. Carregar dados de setores e controles
  await loadSectorsData();

  // 3. Configurar listeners de eventos (Logout, Filtros, Busca, Modal)
  setupEventListeners();

  // 4. Iniciar simulação de contador de expiração da sessão
  startSessionTimer(7200); // 2 horas
});

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Verifica sessão do usuário ativo
 */
async function checkUserSession() {
  try {
    const res = await fetch('/api/me');
    if (!res.ok) {
      window.location.href = '/login?error=unauthorized';
      return;
    }
    const data = await res.json();
    if (data.authenticated && data.user) {
      document.getElementById('navUsername').textContent = data.user.username;
      document.getElementById('navUserRole').textContent = data.user.role;
    }
  } catch (e) {
    console.error('Falha ao verificar sessão:', e);
  }
}

/**
 * Busca setores e controles do backend
 */
async function loadSectorsData() {
  try {
    const res = await fetch('/api/sectors');
    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/login?error=unauthorized';
        return;
      }
      throw new Error('Falha ao carregar dados do catálogo');
    }

    const data = await res.json();
    globalData = data;

    // Atualiza KPIs
    updateKPIs(data.statistics);

    // Renderiza setores e controles
    renderSectors();

  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    document.getElementById('sectorsContainer').innerHTML = `
      <div class="glass-card rounded-2xl p-8 text-center border border-rose-200 bg-rose-50/40">
        <i data-lucide="alert-triangle" class="w-10 h-10 text-rose-600 mx-auto mb-3"></i>
        <h3 class="text-lg font-bold text-slate-900">Não foi possível carregar os controles</h3>
        <p class="text-sm text-slate-600 mt-1">Ocorreu um erro ao comunicar com a API de políticas de segurança.</p>
        <button onclick="loadSectorsData()" class="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors">
          Tentar Novamente
        </button>
      </div>
    `;
    refreshIcons();
  }
}

/**
 * Atualiza indicadores executivos (KPIs)
 */
function updateKPIs(stats) {
  if (!stats) return;

  document.getElementById('kpiSectors').textContent = stats.totalSectors || 4;
  document.getElementById('kpiTotalControls').textContent = stats.totalControls || 0;
  document.getElementById('kpiCompliancePercent').textContent = `${stats.compliancePercentage}%`;
  document.getElementById('kpiComplianceBar').style.width = `${stats.compliancePercentage}%`;
  document.getElementById('kpiIsoCount').textContent = stats.isoControlsCount || 0;
  document.getElementById('kpiLgpdCount').textContent = stats.lgpdControlsCount || 0;
}

/**
 * Renderiza os setores e controles de acordo com os filtros ativos
 */
function renderSectors() {
  const container = document.getElementById('sectorsContainer');
  if (!globalData || !globalData.sectors) return;

  let filteredSectors = globalData.sectors;
  const query = searchQuery.toLowerCase().trim();

  let html = '';
  let totalVisibleControls = 0;

  filteredSectors.forEach(sector => {
    // Filtrar controles por norma e busca
    const matchingControls = sector.controls.filter(ctrl => {
      // Filtro por norma
      if (currentFrameworkFilter !== 'all') {
        if (currentFrameworkFilter === 'ISO 27001' && !ctrl.standard.includes('ISO')) return false;
        if (currentFrameworkFilter === 'LGPD' && !ctrl.standard.includes('LGPD')) return false;
      }

      // Filtro por busca textual
      if (query) {
        const inTitle = ctrl.title.toLowerCase().includes(query);
        const inObjective = ctrl.objective.toLowerCase().includes(query);
        const inAnnex = ctrl.annexOrArticle.toLowerCase().includes(query);
        const inDesc = ctrl.description.toLowerCase().includes(query);
        const inMeasures = ctrl.technicalMeasures.some(m => m.toLowerCase().includes(query));
        const inRisk = ctrl.riskMitigated ? ctrl.riskMitigated.toLowerCase().includes(query) : false;
        return inTitle || inObjective || inAnnex || inDesc || inMeasures || inRisk;
      }

      return true;
    });

    if (matchingControls.length === 0 && (query || currentFrameworkFilter !== 'all')) {
      return; // Se nenhum controle desse setor bate com a busca, não exibe o setor
    }

    totalVisibleControls += matchingControls.length;

    // Ícone correspondente ao setor
    const iconMap = {
      'GraduationCap': 'graduation-cap',
      'Truck': 'truck',
      'HeartPulse': 'heart-pulse',
      'PackageCheck': 'package-check',
      'Boxes': 'boxes',
      'Receipt': 'receipt'
    };
    const sectorIcon = iconMap[sector.icon] || 'shield';

    // Badge styling em tons claros
    const badgeStyle = sector.badgeColor || 'bg-blue-50 text-blue-700 border-blue-200';

    html += `
      <section class="space-y-4" id="section-${sector.id}">
        
        <!-- Cabeçalho do Setor (Light Mode) -->
        <div class="glass-card sector-header-card border border-slate-200 bg-gradient-to-r from-slate-50/80 via-white to-white shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            
            <div class="flex items-center gap-3 min-w-0">
              <div class="sector-header-icon bg-white border border-slate-200 flex items-center justify-center text-slate-800 shrink-0 shadow-xs">
                <i data-lucide="${sectorIcon}" class="text-emerald-600"></i>
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">${sector.name}</h2>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyle} leading-tight">
                    ${matchingControls.length} controles
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-2xl">${sector.description}</p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 text-[11px] font-mono text-slate-500">
              <span class="bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1.5">
                <i data-lucide="user-check" class="w-3 h-3 text-blue-600"></i>
                <span class="text-slate-700 font-medium">${sector.manager || 'Gestão Setorial'}</span>
              </span>
            </div>

          </div>
        </div>

        <!-- Grid de Controles do Setor -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          ${matchingControls.map(ctrl => renderControlCard(ctrl, sector)).join('')}
        </div>

      </section>
    `;
  });

  if (totalVisibleControls === 0) {
    html = `
      <div class="glass-card rounded-2xl p-12 text-center border border-slate-200 bg-white shadow-sm">
        <i data-lucide="filter-x" class="w-12 h-12 text-slate-400 mx-auto mb-3"></i>
        <h3 class="text-base font-bold text-slate-900">Nenhum controle encontrado</h3>
        <p class="text-xs text-slate-500 mt-1">Nenhum controle corresponde aos filtros e termos de pesquisa aplicados.</p>
        <button id="resetFiltersBtn" class="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors border border-slate-200">
          Limpar Filtros e Busca
        </button>
      </div>
    `;
  }

  container.innerHTML = html;
  refreshIcons();

  const resetBtn = document.getElementById('resetFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('searchInput').value = '';
      searchQuery = '';
      currentFrameworkFilter = 'all';
      updateFilterButtonsUI();
      renderSectors();
    });
  }
}

/**
 * Renderiza o cartão individual de cada controle de forma compacta e elegante no tema claro
 */
function renderControlCard(ctrl, sector) {
  const isIso = ctrl.standard.includes('ISO');
  const isLgpd = ctrl.standard.includes('LGPD');

  // Cores de status em tons claros
  let statusBadge = '';
  if (ctrl.status === 'Conforme') {
    statusBadge = `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Conforme
      </span>
    `;
  } else if (ctrl.status === 'Em Adequação') {
    statusBadge = `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Adequação
      </span>
    `;
  } else {
    statusBadge = `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Requer Ação
      </span>
    `;
  }

  // Cores de criticidade em tons claros
  const critColor = ctrl.criticality === 'Crítica' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                    ctrl.criticality === 'Alta' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                    'text-blue-700 bg-blue-50 border-blue-200';

  return `
    <div class="control-card rounded-xl p-3.5 sm:p-4 border border-slate-200 bg-white shadow-xs flex flex-col justify-between group">
      
      <div>
        <!-- Topo do Card: Identificador e Normas -->
        <div class="flex items-center justify-between gap-1.5 mb-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
              ${ctrl.id}
            </span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded border ${isIso ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'} truncate" title="${ctrl.annexOrArticle}">
              ${ctrl.annexOrArticle}
            </span>
          </div>
          
          <div class="flex items-center gap-1 shrink-0">
            <span class="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${critColor}">
              ${ctrl.criticality}
            </span>
            ${statusBadge}
          </div>
        </div>

        <!-- Título do Controle -->
        <h3 class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug line-clamp-1" title="${ctrl.title}">
          ${ctrl.title}
        </h3>

        <!-- Objetivo -->
        <p class="text-[11px] sm:text-xs text-slate-600 mt-1 leading-snug line-clamp-2" title="${ctrl.objective}">
          ${ctrl.objective}
        </p>

        <!-- Medidas Técnicas em Destaque -->
        <div class="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
          <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Principais Salvaguardas & Medidas:
          </span>
          <ul class="space-y-0.5 text-[11px] text-slate-600">
            ${ctrl.technicalMeasures.slice(0, 2).map(m => `
              <li class="flex items-start gap-1.5">
                <i data-lucide="check" class="w-3 h-3 text-emerald-600 shrink-0 mt-0.5"></i>
                <span class="line-clamp-1" title="${m}">${m}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>

      <!-- Rodapé do Card: Risco Mitigado e Ação -->
      <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div class="flex items-center gap-1 text-[10px] text-slate-500 truncate max-w-[150px] sm:max-w-[200px]" title="${ctrl.riskMitigated || ''}">
          ${ctrl.riskMitigated ? `
            <i data-lucide="shield-alert" class="w-3 h-3 text-amber-500 shrink-0"></i>
            <span class="truncate">${ctrl.riskMitigated}</span>
          ` : ''}
        </div>

        <button 
          type="button"
          data-sector-id="${sector.id}"
          data-control-id="${ctrl.id}"
          onclick="requestInspectControl('${sector.id}', '${ctrl.id}')"
          class="btn-inspect shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
        >
          <span>Inspecionar</span>
          <i data-lucide="chevron-right" class="w-3 h-3"></i>
        </button>
      </div>

    </div>
  `;
}

/**
 * Abre o Modal com Detalhes Completos da Política e Permite Atualizar o Status
 */
window.openControlModal = function(controlId) {
  if (!globalData || !globalData.sectors) return;

  let targetCtrl = null;
  let targetSector = null;

  for (const s of globalData.sectors) {
    const c = s.controls.find(ctrl => ctrl.id === controlId);
    if (c) {
      targetCtrl = c;
      targetSector = s;
      break;
    }
  }

  if (!targetCtrl) return;

  const modal = document.getElementById('controlModal');
  const modalContent = document.getElementById('modalContent');

  modalContent.innerHTML = `
    <!-- Topo do Modal -->
    <div class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            ${targetCtrl.id}
          </span>
          <span class="text-xs font-semibold text-emerald-700">${targetSector.name}</span>
        </div>
        <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">${targetCtrl.title}</h2>
        <span class="text-xs font-mono text-blue-700 mt-1 block font-semibold">${targetCtrl.standard} — ${targetCtrl.annexOrArticle}</span>
      </div>
    </div>

    <!-- Seção de Objetivo & Descrição -->
    <div class="space-y-4 text-xs sm:text-sm">
      <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 class="font-bold text-slate-800 mb-1 flex items-center gap-2">
          <i data-lucide="target" class="w-4 h-4 text-emerald-600"></i>
          Objetivo do Controle
        </h4>
        <p class="text-slate-600 leading-relaxed">${targetCtrl.objective}</p>
      </div>

      <div>
        <h4 class="font-bold text-slate-800 mb-1 flex items-center gap-2">
          <i data-lucide="file-text" class="w-4 h-4 text-blue-600"></i>
          Descrição Detalhada e Diretriz de Política
        </h4>
        <p class="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
          ${targetCtrl.description}
        </p>
      </div>

      <!-- Medidas Técnicas e Operacionais -->
      <div>
        <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <i data-lucide="cpu" class="w-4 h-4 text-teal-600"></i>
          Salvaguardas e Implementações Técnicas Recomendadas
        </h4>
        <ul class="space-y-2">
          ${targetCtrl.technicalMeasures.map(measure => `
            <li class="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"></i>
              <span class="text-slate-700">${measure}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Risco Mitigado -->
      ${targetCtrl.riskMitigated ? `
      <div class="bg-rose-50/70 border border-rose-200 p-4 rounded-xl">
        <h4 class="font-bold text-rose-800 mb-1 flex items-center gap-2">
          <i data-lucide="shield-alert" class="w-4 h-4 text-rose-600"></i>
          Vulnerabilidade e Risco Mitigado
        </h4>
        <p class="text-rose-700 leading-relaxed">${targetCtrl.riskMitigated}</p>
      </div>
      ` : ''}

      <!-- Atualização do Status de Auditoria do Controle -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-semibold text-slate-700 block">Status de Conformidade da Auditoria:</span>
          <span class="text-xs text-slate-500">Você pode alternar o status durante a avaliação acadêmica</span>
        </div>
        <div class="flex items-center gap-2">
          <select 
            id="statusSelect-${targetCtrl.id}"
            class="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 font-semibold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Conforme" ${targetCtrl.status === 'Conforme' ? 'selected' : ''}>🟢 Conforme</option>
            <option value="Em Adequação" ${targetCtrl.status === 'Em Adequação' ? 'selected' : ''}>🟡 Em Adequação</option>
            <option value="Ação Requerida" ${targetCtrl.status === 'Ação Requerida' ? 'selected' : ''}>🔴 Ação Requerida</option>
          </select>
          <button 
            onclick="updateControlStatus('${targetCtrl.id}')"
            class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            Salvar
          </button>
        </div>
      </div>

    </div>
  `;

  modal.classList.remove('hidden');
  refreshIcons();
};

/**
 * Atualiza o status do controle via API
 */
window.updateControlStatus = async function(controlId) {
  const select = document.getElementById(`statusSelect-${controlId}`);
  if (!select) return;

  const newStatus = select.value;

  try {
    const res = await fetch(`/api/controls/${controlId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`Controle ${controlId} atualizado para "${newStatus}".`, 'success');
      closeModal();
      // Recarrega os dados e atualiza os KPIs
      await loadSectorsData();
    } else {
      showToast(data.message || 'Erro ao atualizar status', 'error');
    }
  } catch (err) {
    console.error('Erro na requisição:', err);
    showToast('Erro ao atualizar controle', 'error');
  }
};

function closeModal() {
  const modal = document.getElementById('controlModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

/**
 * Intercepta o clique no botão "Inspecionar >" exigindo validação segura via backend
 */
window.requestInspectControl = function(sectorId, controlId) {
  // Se o setor já foi autenticado nesta sessão, abre o detalhe do controle diretamente
  if (unlockedSectors.has(sectorId)) {
    openControlModal(controlId);
    return;
  }

  const sector = allSectors.find(s => s.id === sectorId);
  pendingInspection = { sectorId, controlId };
  openSectorAuthModal(sector ? sector.name : 'Setor Restrito');
};


/**
 * Abre o Modal Limpo e Elegante de Acesso Restrito
 */
function openSectorAuthModal(sectorName) {
  const modal = document.getElementById('sectorAuthModal');
  const targetLabel = document.getElementById('sectorAuthTargetName');
  const passInput = document.getElementById('sectorPasswordInput');
  const errorMsg = document.getElementById('sectorAuthError');

  if (targetLabel) targetLabel.textContent = sectorName;
  if (passInput) {
    passInput.value = '';
    passInput.setAttribute('type', 'password');
  }
  if (errorMsg) errorMsg.classList.add('hidden');

  const eyeIcon = document.getElementById('sectorEyeIcon');
  if (eyeIcon) {
    eyeIcon.setAttribute('data-lucide', 'eye');
  }

  if (modal) {
    modal.classList.remove('hidden');
    refreshIcons();
    setTimeout(() => {
      if (passInput) passInput.focus();
    }, 100);
  }
}

/**
 * Fecha o Modal de Acesso Restrito
 */
function closeSectorAuthModal() {
  const modal = document.getElementById('sectorAuthModal');
  if (modal) {
    modal.classList.add('hidden');
  }
  const errorMsg = document.getElementById('sectorAuthError');
  if (errorMsg) errorMsg.classList.add('hidden');
  pendingInspection = null;
}

/**
 * Configura listeners gerais
 */
function setupEventListeners() {
  // Botão Fechar Modal
  const closeModalBtn = document.getElementById('closeModalBtn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  // Listeners para os botões de Inspecionar (Delegação de Eventos para conteúdo dinâmico)
  const sectorsContainer = document.getElementById('sectorsContainer');
  if (sectorsContainer) {
    sectorsContainer.addEventListener('click', (e) => {
      const inspectBtn = e.target.closest('.btn-inspect') || e.target.closest('button[data-control-id]');
      if (inspectBtn) {
        e.preventDefault();
        e.stopPropagation();
        const sectorId = inspectBtn.getAttribute('data-sector-id');
        const controlId = inspectBtn.getAttribute('data-control-id');
        window.requestInspectControl(sectorId, controlId);
      }
    });
  }

  // Fechar modal de detalhes ao clicar fora ou tecla ESC
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('controlModal');
    if (e.target === modal) {
      closeModal();
    }
    const authModal = document.getElementById('sectorAuthModal');
    if (e.target === authModal) {
      closeSectorAuthModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeSectorAuthModal();
    }
  });

  // Listeners do Modal de Senha do Setor
  const closeSectorAuthBtn = document.getElementById('closeSectorAuthBtn');
  if (closeSectorAuthBtn) {
    closeSectorAuthBtn.addEventListener('click', closeSectorAuthModal);
  }

  const cancelSectorAuthBtn = document.getElementById('cancelSectorAuthBtn');
  if (cancelSectorAuthBtn) {
    cancelSectorAuthBtn.addEventListener('click', closeSectorAuthModal);
  }

  // Alternar visibilidade da senha do setor
  const toggleSectorPasswordBtn = document.getElementById('toggleSectorPasswordBtn');
  const sectorPasswordInput = document.getElementById('sectorPasswordInput');
  const sectorEyeIcon = document.getElementById('sectorEyeIcon');
  if (toggleSectorPasswordBtn && sectorPasswordInput && sectorEyeIcon) {
    toggleSectorPasswordBtn.addEventListener('click', () => {
      const isPass = sectorPasswordInput.getAttribute('type') === 'password';
      sectorPasswordInput.setAttribute('type', isPass ? 'text' : 'password');
      sectorEyeIcon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
      refreshIcons();
    });
  }

  // Submissão do Formulário de Senha do Setor
  const sectorAuthForm = document.getElementById('sectorAuthForm');
  const sectorAuthError = document.getElementById('sectorAuthError');
  const confirmSectorAuthBtn = document.getElementById('confirmSectorAuthBtn');
  const sectorAuthBtnText = document.getElementById('sectorAuthBtnText');
  const sectorAuthSpinner = document.getElementById('sectorAuthSpinner');

  if (sectorAuthForm) {
    sectorAuthForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!pendingInspection) return;

      const enteredPass = (sectorPasswordInput ? sectorPasswordInput.value : '').trim();
      if (!enteredPass) {
        if (sectorAuthError) {
          sectorAuthError.innerHTML = `
            <i data-lucide="alert-circle" class="w-3.5 h-3.5 shrink-0"></i>
            <span>Por favor, insira a senha do setor.</span>
          `;
          sectorAuthError.classList.remove('hidden');
          refreshIcons();
        }
        return;
      }

      // Feedback de carregamento
      if (confirmSectorAuthBtn) confirmSectorAuthBtn.disabled = true;
      if (sectorAuthBtnText) sectorAuthBtnText.textContent = 'Validando...';
      if (sectorAuthSpinner) sectorAuthSpinner.classList.remove('hidden');
      if (sectorAuthError) sectorAuthError.classList.add('hidden');

      try {
        const res = await fetch(`/api/sectors/${pendingInspection.sectorId}/verify-access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password: enteredPass })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Acesso autorizado!
          unlockedSectors.add(pendingInspection.sectorId);
          showToast(`Acesso concedido: ${data.sectorName || 'Setor'} liberado!`, 'success');
          
          const controlIdToOpen = pendingInspection.controlId;
          closeSectorAuthModal();
          openControlModal(controlIdToOpen);
        } else {
          // Senha incorreta: mensagem de erro sutil conforme solicitado
          if (sectorAuthError) {
            sectorAuthError.innerHTML = `
              <i data-lucide="alert-circle" class="w-3.5 h-3.5 shrink-0"></i>
              <span>${data.message || 'Senha incorreta. Acesso negado.'}</span>
            `;
            sectorAuthError.classList.remove('hidden');
            refreshIcons();
          }
          if (sectorPasswordInput) {
            sectorPasswordInput.select();
            sectorPasswordInput.focus();
          }
        }
      } catch (err) {
        console.error('Erro na validação de acesso ao setor:', err);
        if (sectorAuthError) {
          sectorAuthError.innerHTML = `
            <i data-lucide="alert-circle" class="w-3.5 h-3.5 shrink-0"></i>
            <span>Falha ao validar credencial. Tente novamente.</span>
          `;
          sectorAuthError.classList.remove('hidden');
          refreshIcons();
        }
      } finally {
        if (confirmSectorAuthBtn) confirmSectorAuthBtn.disabled = false;
        if (sectorAuthBtnText) sectorAuthBtnText.textContent = 'Confirmar Acesso';
        if (sectorAuthSpinner) sectorAuthSpinner.classList.add('hidden');
      }
    });
  }

  // BOTÃO DE SAIR (LOGOUT)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true;
      logoutBtn.innerHTML = `
        <span class="animate-spin w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full"></span>
        <span>Saindo...</span>
      `;

      try {
        const res = await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json();
        showToast('Sessão encerrada com sucesso. Redirecionando...', 'success');
        
        setTimeout(() => {
          window.location.href = data.redirect || '/login?logout=success';
        }, 500);

      } catch (err) {
        console.error('Erro ao realizar logout:', err);
        window.location.href = '/login?logout=success';
      }
    });
  }

  // Filtros de Norma (ISO vs LGPD)
  const frameworkBtns = document.querySelectorAll('.framework-btn');
  frameworkBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFrameworkFilter = btn.getAttribute('data-framework-filter');
      updateFilterButtonsUI();
      renderSectors();
    });
  });

  // Busca em Tempo Real
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderSectors();
    });
  }

  // Botão Atualizar Dados
  const refreshDataBtn = document.getElementById('refreshDataBtn');
  if (refreshDataBtn) {
    refreshDataBtn.addEventListener('click', async () => {
      showToast('Sincronizando controles...', 'info');
      await loadSectorsData();
      showToast('Dados atualizados com sucesso!', 'success');
    });
  }

  // Relatório Executivo / Imprimir
  const printSummaryBtn = document.getElementById('printSummaryBtn');
  if (printSummaryBtn) {
    printSummaryBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

function updateFilterButtonsUI() {
  // Atualiza botões de norma
  document.querySelectorAll('.framework-btn').forEach(btn => {
    const filter = btn.getAttribute('data-framework-filter');
    if (filter === currentFrameworkFilter) {
      btn.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
      btn.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
    } else {
      btn.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm');
      btn.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
    }
  });
}

/**
 * Toast de Feedback (Light Mode)
 */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  toastMsg.textContent = message;

  toast.classList.remove(
    'hidden',
    'bg-white', 'text-emerald-800', 'border-emerald-300',
    'text-rose-800', 'border-rose-300',
    'text-blue-800', 'border-blue-300',
    'bg-emerald-950', 'text-emerald-200', 'border-emerald-800',
    'bg-red-950', 'text-red-200', 'border-red-800',
    'bg-blue-950', 'text-blue-200', 'border-blue-800'
  );

  toast.classList.add('bg-white', 'border', 'shadow-lg');

  if (type === 'success') {
    toast.classList.add('text-emerald-800', 'border-emerald-300');
    toastIcon.setAttribute('data-lucide', 'check-circle-2');
    toastIcon.className = 'w-4 h-4 text-emerald-600';
  } else if (type === 'error') {
    toast.classList.add('text-rose-800', 'border-rose-300');
    toastIcon.setAttribute('data-lucide', 'alert-triangle');
    toastIcon.className = 'w-4 h-4 text-rose-600';
  } else {
    toast.classList.add('text-blue-800', 'border-blue-300');
    toastIcon.setAttribute('data-lucide', 'info');
    toastIcon.className = 'w-4 h-4 text-blue-600';
  }

  refreshIcons();

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

/**
 * Contador de Sessão
 */
function startSessionTimer(seconds) {
  let timeLeft = seconds;
  const timerElem = document.getElementById('sessionTimer');

  setInterval(() => {
    if (timeLeft <= 0) {
      window.location.href = '/login?error=expired';
      return;
    }
    timeLeft--;

    const hrs = Math.floor(timeLeft / 3600);
    const mins = Math.floor((timeLeft % 3600) / 60);
    const secs = timeLeft % 60;

    const pad = (n) => String(n).padStart(2, '0');
    if (timerElem) {
      timerElem.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
  }, 1000);
}
