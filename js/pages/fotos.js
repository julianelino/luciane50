/* ============================================================
   js/pages/fotos.js — Lógica da página Álbum da Festa
   Luciane • 50 anos
   ============================================================ */

(function FotosPage() {
  'use strict';

  /**
   * Link público do álbum no Google Fotos.
   * Substituir pelo link real antes do deploy.
   */
  const ALBUM_URL = 'https://photos.app.goo.gl/qn5giCqvoE7g9axD6';

  /* ---- Botão abrir álbum ---------------------------------------- */
  const btnAlbum = document.getElementById('btn-open-album');

  if (btnAlbum) {
    btnAlbum.addEventListener('click', () => {
      window.open(ALBUM_URL, '_blank', 'noopener,noreferrer');
    });
  }

  /* ---- Link alternativo (âncora) --------------------------------- */
  const linkAlbum = document.getElementById('link-open-album');

  if (linkAlbum) {
    linkAlbum.href = ALBUM_URL;
    linkAlbum.setAttribute('rel', 'noopener noreferrer');
  }

})();
