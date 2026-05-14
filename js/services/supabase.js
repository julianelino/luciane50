/* ============================================================
   js/services/supabase.js
   Integração com Supabase — Luciane • 50 anos
   ============================================================ */

/**
 * Configuração do Supabase
 * Substituir os valores abaixo pelas credenciais reais do projeto.
 * NUNCA utilizar a service_role_key — apenas anon public key.
 *
 * Para obter:
 *   1. Acessar https://app.supabase.com
 *   2. Selecionar o projeto
 *   3. Settings → API → Project URL e anon public key
 */

const SUPABASE_URL  = 'https://zxuvfpwlxhiunaoxvaot.supabase.co';
const SUPABASE_ANON = 'sb_publishable_drBlkPkVMR7zCMdf4r-66g_9XOqauNo';

/* ---- Cliente Supabase via CDN --------------------------------------- */
// O script da CDN do Supabase expõe window.supabase globalmente.
// Garantir que o script CDN seja carregado antes deste módulo.
let _client = null;

function getClient() {
  if (_client) return _client;

  if (!window.supabase) {
    console.error('[SupabaseService] SDK não carregado. Verifique o script CDN.');
    return null;
  }

  _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _client;
}

/* ---- Tabela de mensagens -------------------------------------------- */
const TABLE = 'messages';

/**
 * Sanitiza texto removendo HTML e scripts.
 * @param {string} raw
 * @returns {string}
 */
function sanitize(raw) {
  const el = document.createElement('div');
  el.textContent = raw;          // textContent escapa tudo automaticamente
  return el.textContent.trim();
}

/**
 * Insere um novo recado no banco.
 * @param {{ name: string, message: string }} payload
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
async function insertMessage({ name, message }) {
  const client = getClient();
  if (!client) return { data: null, error: { message: 'Cliente indisponível.' } };

  const safeName    = sanitize(name).slice(0, 100);
  const safeMessage = sanitize(message).slice(0, 300);

  if (!safeName || !safeMessage) {
    return { data: null, error: { message: 'Campos inválidos após sanitização.' } };
  }

  const { data, error } = await client
    .from(TABLE)
    .insert([{ name: safeName, message: safeMessage }])
    .select();

  return { data, error };
}

/**
 * Busca todos os recados em ordem decrescente de data.
 * @returns {Promise<{ data: Array|null, error: object|null }>}
 */
async function fetchMessages() {
  const client = getClient();
  if (!client) return { data: null, error: { message: 'Cliente indisponível.' } };

  const { data, error } = await client
    .from(TABLE)
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false });

  return { data, error };
}

/* ---- Export --------------------------------------------------------- */
window.SupabaseService = Object.freeze({
  insertMessage,
  fetchMessages,
});
