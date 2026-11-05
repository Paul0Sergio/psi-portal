document.addEventListener('DOMContentLoaded', () => {
  // Inicializa ícones Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const loginAlert = document.getElementById('loginAlert');
  const alertMessage = document.getElementById('alertMessage');

  // Verifica parâmetros da URL para alertas (ex: logout, sessão expirada)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('error')) {
    showAlert('error', 'Sua sessão expirou ou você tentou acessar uma área restrita. Efetue o login novamente.');
  } else if (urlParams.has('logout')) {
    showAlert('success', 'Você encerrou a sessão com sucesso.');
  }

  // Alternar visibilidade de senha
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      
      // Atualiza ícone
      eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  }

  // Submissão do Formulário
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        showAlert('error', 'Por favor, preencha todos os campos do formulário.');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showAlert('success', 'Credenciais validadas com sucesso! Redirecionando...');
          setTimeout(() => {
            window.location.href = data.redirect || '/dashboard';
          }, 600);
        } else {
          setLoading(false);
          showAlert('error', data.message || 'Falha na autenticação. Verifique os dados digitados.');
        }
      } catch (err) {
        setLoading(false);
        console.error('Erro de conexão:', err);
        showAlert('error', 'Não foi possível comunicar com o servidor de autenticação.');
      }
    });
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = 'Autenticando...';
      btnSpinner.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.textContent = 'Acessar Painel de Controles';
      btnSpinner.classList.add('hidden');
    }
  }

  function showAlert(type, message) {
    loginAlert.classList.remove('hidden', 
      'bg-red-950/80', 'text-red-300', 'border-red-800', 'border-red-800/80',
      'bg-emerald-950/80', 'text-emerald-300', 'border-emerald-800', 'border-emerald-800/80',
      'bg-blue-950/80', 'text-blue-300', 'border-blue-800', 'border-blue-800/80',
      'bg-rose-50', 'text-rose-800', 'border-rose-200',
      'bg-emerald-50', 'text-emerald-800', 'border-emerald-200',
      'bg-blue-50', 'text-blue-800', 'border-blue-200'
    );

    const alertIcon = document.getElementById('alertIcon');

    if (type === 'error') {
      loginAlert.classList.add('bg-rose-50', 'text-rose-800', 'border', 'border-rose-200');
      alertIcon.className = 'w-4 h-4 shrink-0 mt-0.5 text-rose-600';
      alertIcon.setAttribute('data-lucide', 'alert-triangle');
    } else if (type === 'success') {
      loginAlert.classList.add('bg-emerald-50', 'text-emerald-800', 'border', 'border-emerald-200');
      alertIcon.className = 'w-4 h-4 shrink-0 mt-0.5 text-emerald-600';
      alertIcon.setAttribute('data-lucide', 'check-circle-2');
    } else {
      loginAlert.classList.add('bg-blue-50', 'text-blue-800', 'border', 'border-blue-200');
      alertIcon.className = 'w-4 h-4 shrink-0 mt-0.5 text-blue-600';
      alertIcon.setAttribute('data-lucide', 'info');
    }

    alertMessage.textContent = message;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
});
