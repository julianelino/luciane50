/* ============================================================
   js/pages/recado.js — Lógica da página Deixar Recado
   Luciane • 50 anos
   ============================================================ */

(function RecadoPage() {
  'use strict';

  /* ---- Configurações de validação -------------------------------- */
  const CONFIG = {
    MSG_MIN_LENGTH:  20,
    MSG_MAX_LENGTH: 300,
    COOLDOWN_MS:  20000,  // 20 segundos entre envios
  };

  /* ---- Estado ----------------------------------------------------- */
  let isCooldown = false;
  let isSubmitting = false;

  /* ---- Elementos do DOM ------------------------------------------ */
  const formCard     = document.getElementById('recado-form-card');
  const form         = document.getElementById('recado-form');
  const inputName    = document.getElementById('input-name');
  const inputMessage = document.getElementById('input-message');
  const charCounter  = document.getElementById('char-counter');
  const btnSubmit    = document.getElementById('btn-submit');
  const btnSubmitText = document.getElementById('btn-submit-text');
  const btnSubmitSpinner = document.getElementById('btn-submit-spinner');
  const successCard  = document.getElementById('recado-success');
  const btnBack      = document.getElementById('btn-back');
  const errorName    = document.getElementById('error-name');
  const errorMessage = document.getElementById('error-msg');

  if (!form) return; // Não estamos na página recado

  /* ---- Contador de caracteres ------------------------------------ */
  function updateCharCounter() {
    if (!charCounter || !inputMessage) return;
    const len = inputMessage.value.length;
    charCounter.textContent = `${len} / ${CONFIG.MSG_MAX_LENGTH}`;

    charCounter.className = 'form-counter';
    if (len >= CONFIG.MSG_MAX_LENGTH) {
      charCounter.classList.add('counter--danger');
    } else if (len >= CONFIG.MSG_MAX_LENGTH * 0.85) {
      charCounter.classList.add('counter--warning');
    }
  }

  /* ---- Limpar erro de um campo ----------------------------------- */
  function clearError(input, errorEl) {
    if (!input || !errorEl) return;
    input.classList.remove('input--error');
    errorEl.classList.remove('error--visible');
    errorEl.textContent = '';
  }

  /* ---- Mostrar erro em um campo ---------------------------------- */
  function showError(input, errorEl, message) {
    if (!input || !errorEl) return;
    input.classList.add('input--error');
    errorEl.textContent = message;
    errorEl.classList.add('error--visible');
  }

  /* ---- Validação do formulário ----------------------------------- */
  function validate() {
    let valid = true;

    clearError(inputName, errorName);
    clearError(inputMessage, errorMessage);

    const name    = inputName ? inputName.value.trim() : '';
    const message = inputMessage ? inputMessage.value.trim() : '';

    if (!name) {
      showError(inputName, errorName, 'Por favor, informe seu nome.');
      valid = false;
    }

    if (!message) {
      showError(inputMessage, errorMessage, 'Não é possível enviar mensagem vazia.');
      valid = false;
    } else if (message.length < CONFIG.MSG_MIN_LENGTH) {
      showError(
        inputMessage,
        errorMessage,
        `Sua mensagem precisa ter pelo menos ${CONFIG.MSG_MIN_LENGTH} caracteres.`
      );
      valid = false;
    } else if (message.length > CONFIG.MSG_MAX_LENGTH) {
      showError(
        inputMessage,
        errorMessage,
        `A mensagem pode ter no máximo ${CONFIG.MSG_MAX_LENGTH} caracteres.`
      );
      valid = false;
    }

    return valid;
  }

  /* ---- Estado de carregamento ------------------------------------ */
  function setLoading(loading) {
    isSubmitting = loading;
    if (!btnSubmit) return;

    btnSubmit.disabled = loading;

    if (btnSubmitText)    btnSubmitText.style.display    = loading ? 'none' : 'inline';
    if (btnSubmitSpinner) btnSubmitSpinner.style.display = loading ? 'inline-flex' : 'none';
  }

  /* ---- Exibir sucesso ------------------------------------------- */
  function showSuccess() {
    if (formCard && successCard) {
      formCard.style.display    = 'none';
      successCard.style.display = 'flex';
      successCard.classList.add('success--visible');

      // Focar no card de sucesso para acessibilidade
      successCard.setAttribute('tabindex', '-1');
      successCard.focus();
    }
  }

  /* ---- Cooldown anti-spam --------------------------------------- */
  function startCooldown() {
    isCooldown = true;
    setTimeout(() => {
      isCooldown = false;
    }, CONFIG.COOLDOWN_MS);
  }

  /* ---- Submit ---------------------------------------------------- */
  async function handleSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;

    if (isCooldown) {
      if (window.AppUtils) {
        window.AppUtils.showToast('Aguarde alguns segundos antes de enviar novamente.', 'error');
      }
      return;
    }

    if (!validate()) {
      // Foca no primeiro campo com erro
      const firstError = form.querySelector('.input--error');
      if (firstError) firstError.focus();
      return;
    }

    setLoading(true);

    const name    = inputName.value.trim();
    const message = inputMessage.value.trim();

    try {
      if (!window.SupabaseService) {
        throw new Error('Serviço indisponível.');
      }

      const { error } = await window.SupabaseService.insertMessage({ name, message });

      if (error) {
        throw new Error(error.message || 'Erro ao enviar recado.');
      }

      startCooldown();
      showSuccess();

    } catch (err) {
      console.error('[RecadoPage] Erro ao enviar:', err);
      if (window.AppUtils) {
        window.AppUtils.showToast(
          'Não foi possível enviar o recado. Tente novamente.',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /* ---- Voltar ao formulário -------------------------------------- */
  function handleBack() {
    if (successCard && formCard) {
      successCard.style.display = 'none';
      formCard.style.display    = 'block';
      successCard.classList.remove('success--visible');

      // Limpa o formulário
      form.reset();
      updateCharCounter();
      clearError(inputName, errorName);
      clearError(inputMessage, errorMessage);

      inputName && inputName.focus();
    }
  }

  /* ---- Listeners ------------------------------------------------- */
  form.addEventListener('submit', handleSubmit);

  if (inputMessage) {
    inputMessage.addEventListener('input', updateCharCounter);
  }

  if (inputName) {
    inputName.addEventListener('input', () => clearError(inputName, errorName));
  }

  if (inputMessage) {
    inputMessage.addEventListener('input', () => {
      if (inputMessage.classList.contains('input--error')) {
        clearError(inputMessage, errorMessage);
      }
    });
  }

  if (btnBack) {
    btnBack.addEventListener('click', handleBack);
  }

  /* ---- Inicialização -------------------------------------------- */
  updateCharCounter();

})();
