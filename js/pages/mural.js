/* ============================================================
   js/pages/mural.js — Lógica da página Mural de Recados
   Luciane • 50 anos
   ============================================================ */

(function MuralPage() {
  'use strict';

  /* ---- Elementos do DOM ------------------------------------------ */
  const muralFeed     = document.getElementById('mural-feed');
  const muralLoading  = document.getElementById('mural-loading');
  const muralEmpty    = document.getElementById('mural-empty');
  const muralError    = document.getElementById('mural-error');
  const btnRetry      = document.getElementById('btn-retry');
  const muralCount    = document.getElementById('mural-count');

  if (!muralFeed) return; // Não estamos na página mural

  /* ---- Utilitários ----------------------------------------------- */

  /**
   * Formata data para exibição legível em pt-BR.
   * @param {string} isoDate
   * @returns {string}
   */
  function formatDate(isoDate) {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      const now  = new Date();
      const diffMs   = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs  = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 2)   return 'agora mesmo';
      if (diffMins < 60)  return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
      if (diffHrs  < 24)  return `há ${diffHrs} hora${diffHrs  > 1 ? 's' : ''}`;
      if (diffDays < 7)   return `há ${diffDays} dia${diffDays  > 1 ? 's' : ''}`;

      return date.toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
      });
    } catch {
      return '';
    }
  }

  /**
   * Retorna a inicial do nome para o avatar.
   * @param {string} name
   * @returns {string}
   */
  function getInitial(name) {
    const clean = String(name).trim();
    return clean.charAt(0).toUpperCase() || '?';
  }

  /**
   * Gera uma cor de avatar baseada no nome (determinística).
   * @param {string} name
   * @returns {string} CSS linear-gradient
   */
  function avatarGradient(name) {
    const GRADIENTS = [
      'linear-gradient(135deg, #D4AF37 0%, #E8C96A 100%)',
      'linear-gradient(135deg, #C87FA8 0%, #E8AFCF 100%)',
      'linear-gradient(135deg, #B8941F 0%, #D4AF37 100%)',
      'linear-gradient(135deg, #E8AFCF 0%, #F5D5E8 100%)',
      'linear-gradient(135deg, #9C6B8C 0%, #C87FA8 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
    }
    return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  }

  /* ---- Renderiza um único card de recado ------------------------- */
  function createMessageCard(msg, delay = 0) {
    const card = document.createElement('article');
    card.className = 'mural-card';
    card.style.animationDelay = `${delay}ms`;
    card.setAttribute('aria-label', `Recado de ${msg.name}`);

    const initial   = getInitial(msg.name);
    const gradient  = avatarGradient(msg.name);
    const dateText  = formatDate(msg.created_at);

    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'mural-card-avatar';
    avatar.style.background = gradient;
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = initial;

    // Meta
    const meta = document.createElement('div');
    meta.className = 'mural-card-meta';

    const nameEl = document.createElement('div');
    nameEl.className = 'mural-card-name';
    nameEl.textContent = msg.name;  // textContent — seguro contra XSS

    const dateEl = document.createElement('div');
    dateEl.className = 'mural-card-date';
    dateEl.textContent = dateText;

    meta.appendChild(nameEl);
    meta.appendChild(dateEl);

    // Ícone coração
    const heartIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    heartIcon.setAttribute('viewBox', '0 0 24 24');
    heartIcon.setAttribute('fill', 'currentColor');
    heartIcon.classList.add('mural-card-heart');
    heartIcon.setAttribute('aria-hidden', 'true');
    const heartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    heartPath.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
    heartIcon.appendChild(heartPath);

    // Header
    const header = document.createElement('div');
    header.className = 'mural-card-header';
    header.appendChild(avatar);
    header.appendChild(meta);
    header.appendChild(heartIcon);

    // Mensagem
    const messageEl = document.createElement('p');
    messageEl.className = 'mural-card-message';
    messageEl.textContent = msg.message;  // textContent — seguro contra XSS

    card.appendChild(header);
    card.appendChild(messageEl);

    return card;
  }

  /* ---- Estados UI ----------------------------------------------- */
  function showLoading() {
    if (muralLoading) muralLoading.style.display = 'flex';
    if (muralFeed)    muralFeed.style.display    = 'none';
    if (muralEmpty)   muralEmpty.style.display   = 'none';
    if (muralError)   muralError.style.display   = 'none';
  }

  function showError() {
    if (muralLoading) muralLoading.style.display = 'none';
    if (muralFeed)    muralFeed.style.display    = 'none';
    if (muralEmpty)   muralEmpty.style.display   = 'none';
    if (muralError)   muralError.style.display   = 'block';
  }

  function showEmpty() {
    if (muralLoading) muralLoading.style.display = 'none';
    if (muralFeed)    muralFeed.style.display    = 'none';
    if (muralEmpty)   muralEmpty.style.display   = 'block';
    if (muralError)   muralError.style.display   = 'none';
  }

  function showFeed() {
    if (muralLoading) muralLoading.style.display = 'none';
    if (muralFeed)    muralFeed.style.display    = 'flex';
    if (muralEmpty)   muralEmpty.style.display   = 'none';
    if (muralError)   muralError.style.display   = 'none';
  }

  /* ---- Carrega e renderiza os recados ---------------------------- */
  async function loadMessages() {
    showLoading();

    try {
      if (!window.SupabaseService) {
        throw new Error('Serviço indisponível.');
      }

      const { data, error } = await window.SupabaseService.fetchMessages();

      if (error) throw error;

      if (!data || data.length === 0) {
        showEmpty();
        return;
      }

      // Atualiza contador
      if (muralCount) {
        muralCount.textContent = `${data.length} recado${data.length !== 1 ? 's' : ''}`;
      }

      // Limpa feed
      muralFeed.innerHTML = '';

      // Renderiza cards com delay escalonado
      data.forEach((msg, index) => {
        const card = createMessageCard(msg, index * 60);
        muralFeed.appendChild(card);
      });

      showFeed();

    } catch (err) {
      console.error('[MuralPage] Erro ao carregar mensagens:', err);
      showError();
    }
  }

  /* ---- Listener de retry ---------------------------------------- */
  if (btnRetry) {
    btnRetry.addEventListener('click', loadMessages);
  }

  /* ---- Inicialização -------------------------------------------- */
  loadMessages();

})();
