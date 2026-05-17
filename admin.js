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

  /* ---------- Initial render ---------- */
  resetTeacherForm();
  resetEventForm();
  renderTeachers();
  renderEvents();
})();
