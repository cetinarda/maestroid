(async function () {
  const SALT_KEY = 'kg_admin_salt';
  const HASH_KEY = 'kg_admin_hash';
  const SESSION_KEY = 'kg_admin_unlocked';

  // Daha önce bu oturumda açıldıysa atla
  if (sessionStorage.getItem(SESSION_KEY) === '1') return;

  // Yardımcılar
  async function pbkdf2(password, saltB64) {
    const enc = new TextEncoder();
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
      key, 256
    );
    return btoa(String.fromCharCode(...new Uint8Array(bits)));
  }
  function randomSalt() {
    const a = new Uint8Array(16); crypto.getRandomValues(a);
    return btoa(String.fromCharCode(...a));
  }

  // Stil
  const style = document.createElement('style');
  style.textContent = `
    .auth-overlay { position: fixed; inset: 0; z-index: 999; background: radial-gradient(80% 60% at 50% 30%, rgba(20,20,50,0.95), rgba(4,4,15,0.98)); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-card { max-width: 380px; width: 100%; background: var(--card-strong); border: 1px solid var(--line); border-radius: 18px; padding: 26px 22px; text-align: center; box-shadow: var(--shadow); animation: rise .25s ease; }
    @keyframes rise { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .auth-emblem { width: 48px; height: 48px; margin: 0 auto 12px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-2)); display: flex; align-items: center; justify-content: center; color: #0a0a22; }
    .auth-card h2 { font-family: 'Cinzel', serif; font-size: 18px; letter-spacing: .25em; background: linear-gradient(120deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 4px; }
    .auth-card p { color: var(--ink-dim); font-size: 13px; margin: 6px 0 18px; line-height: 1.5; }
    .auth-card input { width: 100%; padding: 12px 14px; margin-bottom: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-radius: 12px; color: var(--ink); font-size: 14px; font-family: inherit; outline: none; }
    .auth-card input:focus { border-color: var(--accent); }
    .auth-card .btn { width: 100%; margin-top: 6px; }
    .auth-card .link-btn { display: block; margin: 14px auto 0; font-size: 12px; }
    .auth-err { color: #ff9eb3; font-size: 12px; margin: -4px 0 8px; min-height: 16px; }
    body.locked { overflow: hidden; }
    .admin-shell { filter: blur(0); }
    body.locked .admin-shell { filter: blur(14px); pointer-events: none; user-select: none; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  overlay.innerHTML = `
    <div class="auth-card">
      <div class="auth-emblem">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h2>YÖNETİM KÖPRÜSÜ</h2>
      <p id="authMsg">Şifreni gir</p>
      <form id="authForm">
        <input id="pw1" type="password" autocomplete="current-password" placeholder="Şifre" required autofocus />
        <input id="pw2" type="password" autocomplete="new-password" placeholder="Şifre (tekrar)" hidden />
        <div class="auth-err" id="authErr"></div>
        <button type="submit" class="btn primary">Aç</button>
        <button type="button" class="link-btn" id="forgotBtn">Şifreyi sıfırla</button>
      </form>
    </div>
  `;

  document.body.classList.add('locked');
  // DOM hazır olduğunda overlay'i ekle
  function attach() { document.body.appendChild(overlay); }
  if (document.body) attach();
  else document.addEventListener('DOMContentLoaded', attach, { once: true });

  const hasPw = !!localStorage.getItem(HASH_KEY);
  // Setup modu
  if (!hasPw) {
    setTimeout(() => {
      overlay.querySelector('#authMsg').textContent = 'İlk kullanım — yeni bir şifre belirle (en az 6 karakter)';
      overlay.querySelector('#pw1').placeholder = 'Yeni şifre';
      overlay.querySelector('#pw2').hidden = false;
      overlay.querySelector('#forgotBtn').hidden = true;
    }, 0);
  }

  function err(msg) {
    const el = overlay.querySelector('#authErr');
    el.textContent = msg || '';
    if (msg) setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 3500);
  }

  function unlock() {
    sessionStorage.setItem(SESSION_KEY, '1');
    document.body.classList.remove('locked');
    overlay.remove();
    // Kilitle butonu için global hook
    window.KG_AUTH = {
      lock() {
        sessionStorage.removeItem(SESSION_KEY);
        location.reload();
      },
      changePassword: changePassword
    };
  }

  async function changePassword() {
    const cur = prompt('Mevcut şifreni gir:');
    if (!cur) return;
    const salt = localStorage.getItem(SALT_KEY);
    const stored = localStorage.getItem(HASH_KEY);
    if (!salt || !stored) return alert('Şifre bulunamadı');
    const h = await pbkdf2(cur, salt);
    if (h !== stored) return alert('Mevcut şifre yanlış');
    const n1 = prompt('Yeni şifre (en az 6):'); if (!n1) return;
    if (n1.length < 6) return alert('Çok kısa');
    const n2 = prompt('Yeni şifre (tekrar):'); if (n1 !== n2) return alert('Eşleşmedi');
    const ns = randomSalt();
    const nh = await pbkdf2(n1, ns);
    localStorage.setItem(SALT_KEY, ns);
    localStorage.setItem(HASH_KEY, nh);
    alert('Şifre güncellendi');
  }

  // Form submit
  document.addEventListener('submit', async (ev) => {
    if (!ev.target.matches('#authForm')) return;
    ev.preventDefault();
    const p1 = overlay.querySelector('#pw1').value;
    const p2 = overlay.querySelector('#pw2').value;
    const hasPwNow = !!localStorage.getItem(HASH_KEY);
    if (!hasPwNow) {
      if (p1.length < 6) return err('Şifre en az 6 karakter olmalı');
      if (p1 !== p2) return err('Şifreler eşleşmiyor');
      const s = randomSalt();
      const h = await pbkdf2(p1, s);
      localStorage.setItem(SALT_KEY, s);
      localStorage.setItem(HASH_KEY, h);
      unlock();
    } else {
      const s = localStorage.getItem(SALT_KEY);
      const h = await pbkdf2(p1, s);
      if (h === localStorage.getItem(HASH_KEY)) unlock();
      else err('Yanlış şifre');
    }
  });

  document.addEventListener('click', (ev) => {
    if (!ev.target.matches('#forgotBtn')) return;
    if (!confirm('Şifreni unuttuysan sıfırlanır. Mevcut tarayıcıdaki ayarlar (override\'lar, GitHub token) korunur.\n\nDevam edilsin mi?')) return;
    localStorage.removeItem(SALT_KEY);
    localStorage.removeItem(HASH_KEY);
    location.reload();
  });
})();
