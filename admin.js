(function () {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* ---------- Starfield (light) ---------- */
  const canvas = $('#starfield');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, stars;
    function resize() {
      W = canvas.width = innerWidth * devicePixelRatio;
      H = canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = innerWidth+'px';
      canvas.style.height = innerHeight+'px';
      stars = Array.from({length: 120}, () => ({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.3*devicePixelRatio+0.3, a: Math.random()*Math.PI*2 }));
    }
    function tick(){
      ctx.clearRect(0,0,W,H);
      for (const s of stars) { s.a += 0.02; const tw = 0.6+Math.sin(s.a)*0.4; ctx.beginPath(); ctx.arc(s.x,s.y,s.r*tw,0,Math.PI*2); ctx.fillStyle=`rgba(220,210,255,${0.4*tw+0.3})`; ctx.fill(); }
      requestAnimationFrame(tick);
    }
    resize(); addEventListener('resize', resize); tick();
  }

  /* ---------- State ---------- */
  // localStorage'tan oku, yoksa varsayılan snapshot
  let state;
  function freshDefaults() {
    // Yeni KG yükledikten sonra önce localStorage uygulanmadan saf hali al
    return window.KG.snapshot();
  }
  function loadState() {
    try {
      const raw = localStorage.getItem('kg_overrides');
      if (raw) {
        const ov = JSON.parse(raw);
        window.KG.applyOverrides(ov);
      }
    } catch(_) {}
    state = window.KG.snapshot();
  }
  loadState();

  /* ---------- Tabs ---------- */
  $$('.tabs button').forEach(b => b.addEventListener('click', () => {
    $$('.tabs button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    $$('.panel').forEach(p => p.classList.remove('active'));
    $('#panel-' + b.dataset.tab).classList.add('active');
  }));

  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('show'), 1800);
  }

  /* ---------- Room pickers ---------- */
  const rooms = window.KG.rooms;
  function fillRoomSelects() {
    [$('#roomPick'), $('#eRoom')].forEach(sel => {
      sel.innerHTML = '';
      rooms.forEach(r => {
        const o = document.createElement('option');
        o.value = r.id; o.textContent = r.title;
        sel.appendChild(o);
      });
    });
  }
  fillRoomSelects();

  /* ---------- Teachers ---------- */
  function currentRoomId() { return $('#roomPick').value; }
  function renderTeachers() {
    const rid = currentRoomId();
    const list = state.teachers[rid] || [];
    const wrap = $('#teachersList');
    wrap.innerHTML = '';
    if (!list.length) { wrap.innerHTML = '<div class="empty">Bu odada hoca yok. Yukarıdan ekleyebilirsin.</div>'; return; }
    list.forEach((t, i) => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `
        <div>
          <h6>${escapeHtml(t.name)}</h6>
          <div class="meta">${escapeHtml(t.role)} · 📞 ${escapeHtml(t.phone)} · 📍 ${escapeHtml(t.addr)}</div>
        </div>
        <div class="ctl">
          <button data-act="edit" data-i="${i}">Düzenle</button>
          <button data-act="del" data-i="${i}" class="danger">Sil</button>
        </div>
      `;
      wrap.appendChild(el);
    });
    wrap.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i;
      if (b.dataset.act === 'edit') editTeacher(i);
      if (b.dataset.act === 'del') deleteTeacher(i);
    }));
  }

  function resetTeacherForm() {
    $('#tIndex').value = '-1';
    $('#tName').value = ''; $('#tRole').value = ''; $('#tPhone').value = ''; $('#tAddr').value = '';
    $('#teacherFormTitle').textContent = 'Yeni Hoca Ekle';
  }
  function editTeacher(i) {
    const rid = currentRoomId();
    const t = state.teachers[rid][i];
    $('#tIndex').value = String(i);
    $('#tName').value = t.name; $('#tRole').value = t.role; $('#tPhone').value = t.phone; $('#tAddr').value = t.addr;
    $('#teacherFormTitle').textContent = 'Hocayı Düzenle';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function deleteTeacher(i) {
    if (!confirm('Bu hocayı silmek istediğinden emin misin?')) return;
    const rid = currentRoomId();
    state.teachers[rid].splice(i, 1);
    persist();
    renderTeachers();
  }

  $('#roomPick').addEventListener('change', () => { resetTeacherForm(); renderTeachers(); });
  $('#tCancel').addEventListener('click', resetTeacherForm);
  $('#teacherForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const rid = currentRoomId();
    const t = {
      name: $('#tName').value.trim(),
      role: $('#tRole').value.trim(),
      phone: $('#tPhone').value.trim(),
      addr: $('#tAddr').value.trim()
    };
    if (!state.teachers[rid]) state.teachers[rid] = [];
    const idx = parseInt($('#tIndex').value, 10);
    if (idx >= 0) state.teachers[rid][idx] = t;
    else state.teachers[rid].push(t);
    persist();
    resetTeacherForm();
    renderTeachers();
    toast(idx >= 0 ? 'Hoca güncellendi' : 'Hoca eklendi');
  });

  /* ---------- Events ---------- */
  function renderEvents() {
    const list = [...state.events].sort((a,b) => new Date(a.date) - new Date(b.date));
    const wrap = $('#eventsList');
    wrap.innerHTML = '';
    if (!list.length) { wrap.innerHTML = '<div class="empty">Henüz etkinlik yok.</div>'; return; }
    list.forEach(e => {
      const d = new Date(e.date);
      const past = d < new Date();
      const r = rooms.find(x => x.id === e.roomId);
      const el = document.createElement('div');
      el.className = 'item';
      el.style.opacity = past ? 0.55 : 1;
      el.innerHTML = `
        <div>
          <h6>${escapeHtml(e.title)} ${past ? '<small style="color:var(--ink-mute)">· geçmiş</small>' : ''}</h6>
          <div class="meta">${d.toLocaleString('tr-TR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})} · ${escapeHtml(e.where)} · ${escapeHtml(e.teacher)} · ${r ? r.title : e.roomId}</div>
        </div>
        <div class="ctl">
          <button data-act="edit" data-id="${e.id}">Düzenle</button>
          <button data-act="del" data-id="${e.id}" class="danger">Sil</button>
        </div>
      `;
      wrap.appendChild(el);
    });
    wrap.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.id;
      if (b.dataset.act === 'edit') editEvent(id);
      if (b.dataset.act === 'del') deleteEvent(id);
    }));
  }

  function resetEventForm() {
    $('#eId').value = ''; $('#eTitle').value=''; $('#eRoom').value = rooms[0].id;
    $('#eDate').value=''; $('#eTag').value=''; $('#eWhere').value=''; $('#eTeacher').value='';
    $('#eventFormTitle').textContent = 'Yeni Etkinlik Ekle';
  }
  function toLocalInput(iso) {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function editEvent(id) {
    const e = state.events.find(x => x.id === id);
    if (!e) return;
    $('#eId').value = e.id;
    $('#eTitle').value = e.title; $('#eRoom').value = e.roomId;
    $('#eDate').value = toLocalInput(e.date); $('#eTag').value = e.tag;
    $('#eWhere').value = e.where; $('#eTeacher').value = e.teacher;
    $('#eventFormTitle').textContent = 'Etkinliği Düzenle';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function deleteEvent(id) {
    if (!confirm('Bu etkinliği silmek istediğinden emin misin?')) return;
    const i = state.events.findIndex(x => x.id === id);
    if (i >= 0) state.events.splice(i, 1);
    persist();
    renderEvents();
  }
  function newId() { return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }

  $('#eCancel').addEventListener('click', resetEventForm);
  $('#eventForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const id = $('#eId').value || newId();
    const obj = {
      id,
      roomId: $('#eRoom').value,
      title: $('#eTitle').value.trim(),
      where: $('#eWhere').value.trim(),
      date: new Date($('#eDate').value).toISOString(),
      tag: $('#eTag').value.trim(),
      teacher: $('#eTeacher').value.trim()
    };
    const i = state.events.findIndex(x => x.id === id);
    if (i >= 0) state.events[i] = obj; else state.events.push(obj);
    persist();
    resetEventForm();
    renderEvents();
    toast(i >= 0 ? 'Etkinlik güncellendi' : 'Etkinlik eklendi');
  });

  /* ---------- Persist / Export / Import / Reset ---------- */
  function persist() {
    localStorage.setItem('kg_overrides', JSON.stringify(state));
  }
  $('#saveLocal').addEventListener('click', () => { persist(); toast('Tarayıcına kaydedildi'); });
  $('#exportJson').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'data-overrides.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast('JSON indirildi');
  });
  $('#importJson').addEventListener('change', async (ev) => {
    const file = ev.target.files[0]; if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!json || typeof json !== 'object') throw new Error('Geçersiz format');
      // Eksikleri varsayılanla doldur
      const base = freshSnapshotWithoutOverrides();
      state = {
        teachers: { ...base.teachers, ...(json.teachers || {}) },
        events: Array.isArray(json.events) ? json.events : base.events
      };
      persist();
      renderTeachers(); renderEvents();
      toast('JSON yüklendi');
    } catch (err) {
      alert('JSON okunamadı: ' + err.message);
    } finally {
      ev.target.value = '';
    }
  });
  $('#resetAll').addEventListener('click', () => {
    if (!confirm('Tüm yerel değişiklikler silinecek ve varsayılana dönülecek. Emin misin?')) return;
    localStorage.removeItem('kg_overrides');
    // Sayfayı yeniden yükle — temiz varsayılanlar için
    location.reload();
  });

  // Varsayılan snapshot'ı (override uygulanmamış) elde etmek için: data.js
  // halihazırda override'ı KG.rooms/events üzerine uyguladı, dolayısıyla
  // tam temiz hal için sayfayı tekrar yüklemek gerek. Bu yardımcı fonksiyon
  // yalnızca yapı şablonu olarak kullanılıyor.
  function freshSnapshotWithoutOverrides() {
    return { teachers: state.teachers, events: state.events };
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  /* ---------- Publish (GitHub API) ---------- */
  const CFG_KEY = 'kg_publish_cfg';
  const LAST_PUB = 'kg_last_publish';
  const defaultCfg = { owner: 'cetinarda', repo: 'maestroid', branch: 'main', path: 'data-overrides.json', token: '' };
  function getCfg() {
    try { return { ...defaultCfg, ...JSON.parse(localStorage.getItem(CFG_KEY) || '{}') }; }
    catch (_) { return { ...defaultCfg }; }
  }
  function saveCfg(cfg) { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); }

  function showStatus() {
    const el = $('#publishStatus');
    const ts = localStorage.getItem(LAST_PUB);
    const cfg = getCfg();
    const bits = [];
    bits.push(cfg.token ? '🔐 Token kayıtlı' : '⚠ Token yok — yayınlamak için ayarlardan ekle');
    bits.push(`🎯 ${cfg.owner}/${cfg.repo}@${cfg.branch} · ${cfg.path}`);
    if (ts) bits.push(`🕒 Son yayın: ${new Date(ts).toLocaleString('tr-TR')}`);
    el.innerHTML = bits.join(' &nbsp;·&nbsp; ');
  }

  // Settings modal
  function openCfg() {
    const cfg = getCfg();
    $('#cfgOwner').value = cfg.owner;
    $('#cfgRepo').value = cfg.repo;
    $('#cfgBranch').value = cfg.branch;
    $('#cfgPath').value = cfg.path;
    $('#cfgToken').value = cfg.token;
    $('#cfgModal').classList.add('open');
  }
  function closeCfg() { $('#cfgModal').classList.remove('open'); }
  $('#settingsBtn').addEventListener('click', openCfg);
  $$('#cfgModal [data-cfg-close]').forEach(b => b.addEventListener('click', closeCfg));
  $('#cfgSave').addEventListener('click', () => {
    saveCfg({
      owner: $('#cfgOwner').value.trim() || defaultCfg.owner,
      repo: $('#cfgRepo').value.trim() || defaultCfg.repo,
      branch: $('#cfgBranch').value.trim() || defaultCfg.branch,
      path: $('#cfgPath').value.trim() || defaultCfg.path,
      token: $('#cfgToken').value.trim()
    });
    closeCfg();
    showStatus();
    toast('Ayarlar kaydedildi');
  });
  $('#cfgClear').addEventListener('click', () => {
    const cfg = getCfg();
    cfg.token = '';
    saveCfg(cfg);
    $('#cfgToken').value = '';
    showStatus();
    toast('Token silindi');
  });

  // UTF-8 güvenli base64
  function b64encode(s) {
    return btoa(unescape(encodeURIComponent(s)));
  }

  async function ghRequest(cfg, method, path, body) {
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${cfg.token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    };
    const opts = { method, headers };
    if (body) { opts.body = JSON.stringify(body); headers['Content-Type'] = 'application/json'; }
    return fetch(url, opts);
  }

  async function publish() {
    const cfg = getCfg();
    if (!cfg.token) { openCfg(); toast('Önce token ekle'); return; }
    persist();
    const btn = $('#publishBtn');
    btn.disabled = true;
    const origLabel = btn.textContent;
    btn.textContent = '… Yayınlanıyor';
    try {
      // mevcut dosyanın sha'sını al (yoksa 404)
      let sha = undefined;
      const getRes = await ghRequest(cfg, 'GET', `${encodeURI(cfg.path)}?ref=${encodeURIComponent(cfg.branch)}`);
      if (getRes.ok) {
        const j = await getRes.json();
        sha = j.sha;
      } else if (getRes.status !== 404) {
        const txt = await getRes.text();
        throw new Error(`GET hatası ${getRes.status}: ${txt}`);
      }
      const content = JSON.stringify(state, null, 2);
      const putBody = {
        message: `kg: yönetim panosundan güncelle (${new Date().toISOString()})`,
        content: b64encode(content),
        branch: cfg.branch
      };
      if (sha) putBody.sha = sha;
      const putRes = await ghRequest(cfg, 'PUT', encodeURI(cfg.path), putBody);
      if (!putRes.ok) {
        const txt = await putRes.text();
        throw new Error(`PUT hatası ${putRes.status}: ${txt}`);
      }
      const j = await putRes.json();
      localStorage.setItem(LAST_PUB, new Date().toISOString());
      showStatus();
      const commitUrl = j.commit && j.commit.html_url;
      toast('Yayınlandı ✓');
      if (commitUrl) {
        const el = $('#publishStatus');
        el.innerHTML += ` · <a href="${commitUrl}" target="_blank" rel="noopener" style="color:var(--accent-2)">commit'i gör →</a>`;
      }
    } catch (err) {
      alert('Yayınlanamadı:\n\n' + err.message + '\n\nToken yetkilerini ve repo adını kontrol et.');
    } finally {
      btn.disabled = false;
      btn.textContent = origLabel;
    }
  }
  $('#publishBtn').addEventListener('click', publish);
  $('#digestAdminBtn').addEventListener('click', () => { window.open('index.html#digest', '_blank'); });
  const lockBtn = $('#lockBtn');
  if (lockBtn) lockBtn.addEventListener('click', () => {
    if (window.KG_AUTH && window.KG_AUTH.lock) window.KG_AUTH.lock();
  });

  /* ---------- Initial render ---------- */
  resetTeacherForm();
  resetEventForm();
  renderTeachers();
  renderEvents();
  showStatus();
})();
