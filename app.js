(function () {
  const { rooms, events, captain } = window.KG;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* ---------- Starfield ---------- */
  const canvas = $('#starfield');
  const ctx = canvas.getContext('2d');
  let stars = [], W=0, H=0;
  function resize() {
    W = canvas.width = window.innerWidth * devicePixelRatio;
    H = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth+'px';
    canvas.style.height = window.innerHeight+'px';
    const count = Math.min(220, Math.floor((W*H)/(devicePixelRatio*9000)));
    stars = Array.from({length: count}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.4*devicePixelRatio + 0.3,
      a: Math.random()*Math.PI*2,
      s: 0.15 + Math.random()*0.4,
      hue: Math.random() < 0.2 ? '200,220,255' : '230,210,255'
    }));
  }
  function tick() {
    ctx.clearRect(0,0,W,H);
    for (const st of stars) {
      st.a += 0.02;
      const tw = 0.6 + Math.sin(st.a)*0.4;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r*tw, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${st.hue},${0.5*tw+0.3})`;
      ctx.fill();
      st.y += st.s * 0.1;
      if (st.y > H) { st.y = -2; st.x = Math.random()*W; }
    }
    requestAnimationFrame(tick);
  }
  resize(); window.addEventListener('resize', resize); tick();

  /* ---------- Stardate ---------- */
  const stardate = `${new Date().getFullYear()}.${String(Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0))/86400000)).padStart(3,'0')}`;
  $('#stardate').textContent = stardate;
  $('#stardate2').textContent = stardate;

  /* ---------- Navigation ---------- */
  const screens = { boarding: $('#boarding'), bridge: $('#bridge'), room: $('#room'), events: $('#events') };
  function show(name) {
    Object.entries(screens).forEach(([k, el]) => el.classList.toggle('active', k === name));
    $('#tabbar').style.display = (name === 'boarding') ? 'none' : 'grid';
    window.scrollTo({ top: 0, behavior: 'instant' });
    // tab active
    $$('.tab').forEach(t => {
      const go = t.dataset.go;
      let on = false;
      if (name === 'bridge' && (go === 'bridge' || go === 'rooms-tab')) on = (go === 'bridge');
      if (name === 'room' && go === 'rooms-tab') on = true;
      if (name === 'events' && go === 'events') on = true;
      t.classList.toggle('active', on);
    });
  }

  $('#boardBtn').addEventListener('click', () => { show('bridge'); renderUpcoming(); });

  /* ---------- Rooms ---------- */
  function roomCardEl(r) {
    const el = document.createElement('button');
    el.className = 'room-card';
    el.innerHTML = `
      <span class="glow" style="background:${r.color}"></span>
      <span class="freq">${r.freq}</span>
      <div class="ico">${r.ico}</div>
      <h4>${r.title}</h4>
      <p>${r.tagline}</p>
    `;
    el.addEventListener('click', () => openRoom(r.id));
    return el;
  }
  function renderRooms() {
    const wrap = $('#rooms');
    wrap.innerHTML = '';
    rooms.forEach(r => wrap.appendChild(roomCardEl(r)));
  }

  function openRoom(id) {
    const r = rooms.find(x => x.id === id);
    if (!r) return;
    $('#roomTitle').textContent = r.title;
    const initials = (n) => n.split(' ').slice(0,2).map(s => s[0]).join('');
    const teachings = r.teachings.map(t => `
      <div class="scroll-card">
        <h3>${t.h}</h3>
        ${t.p ? `<p>${t.p}</p>` : ''}
        ${t.list ? `<ul>${t.list.map(li => `<li>${li}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('');
    const teachers = r.teachers.map(t => `
      <div class="teacher">
        <div class="avatar">${initials(t.name)}</div>
        <div>
          <h6>${t.name}</h6>
          <div class="role">${t.role}</div>
          <p class="meta">📍 ${t.addr}</p>
          <div class="actions">
            <a href="tel:${t.phone.replace(/\s/g,'')}">📞 ${t.phone}</a>
            <a href="https://wa.me/${t.phone.replace(/[^0-9]/g,'')}" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
      </div>
    `).join('');
    const roomEvents = events.filter(e => e.roomId === r.id).slice(0, 3);
    const roomEventsHtml = roomEvents.length ? `
      <div class="scroll-card">
        <h3>Bu Odadan Yaklaşanlar</h3>
        ${roomEvents.map(eventLine).join('')}
      </div>` : '';

    $('#roomContent').innerHTML = `
      <div class="hero">
        <span class="glow" style="background:${r.color}"></span>
        <div class="ico-big">${r.ico}</div>
        <div class="freq">${r.freq}</div>
        <h2>${r.title}</h2>
        <p>${r.hero}</p>
      </div>
      ${teachings}
      <div class="scroll-card">
        <h3>Bu Odanın Hocaları</h3>
        ${teachers}
      </div>
      ${roomEventsHtml}
    `;
    show('room');
  }
  $('#roomBack').addEventListener('click', () => show('bridge'));

  /* ---------- Events ---------- */
  const months = ['OCA','ŞUB','MAR','NİS','MAY','HAZ','TEM','AĞU','EYL','EKİ','KAS','ARA'];
  function eventCardEl(e) {
    const d = new Date(e.date);
    const r = rooms.find(x => x.id === e.roomId);
    const el = document.createElement('div');
    el.className = 'event-card';
    el.innerHTML = `
      <div class="event-date">
        <div class="d">${String(d.getDate()).padStart(2,'0')}</div>
        <div class="m">${months[d.getMonth()]}</div>
      </div>
      <div class="event-info">
        <h5>${e.title}</h5>
        <p>${d.toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit'})} · ${e.where}</p>
        <p style="margin-top:2px">${e.teacher}</p>
      </div>
      <span class="event-tag">${e.tag}</span>
      <button class="event-share" aria-label="Paylaş" title="Paylaş">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
      </button>
    `;
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => openRoom(e.roomId));
    el.querySelector('.event-share').addEventListener('click', (ev) => {
      ev.stopPropagation();
      openShareSheet(eventShareText(e), `${e.title} · Paylaş`);
    });
    return el;
  }

  /* ---------- Share ---------- */
  function siteUrl() {
    try { return localStorage.getItem('kg_site_url') || window.location.origin || 'https://kozmikgemi.com'; }
    catch (_) { return 'https://kozmikgemi.com'; }
  }
  function eventShareText(e) {
    const d = new Date(e.date);
    const dateStr = d.toLocaleString('tr-TR', { day: '2-digit', month: 'long', weekday: 'long', hour: '2-digit', minute: '2-digit' });
    return `✨ ${e.title}\n🗓 ${dateStr}\n📍 ${e.where}\n🎙 ${e.teacher} · ${e.tag}\n\nOrkestrada yerini al → ${siteUrl()}`;
  }
  function digestText(days = 7) {
    const now = new Date();
    const until = new Date(); until.setDate(until.getDate() + days);
    const list = events
      .filter(e => { const d = new Date(e.date); return d >= now && d <= until; })
      .sort((a,b) => new Date(a.date) - new Date(b.date));
    const header = days <= 7 ? '✨ Kozmik Gemi · Bu Haftanın Etkinlikleri ✨' :
                   days <= 14 ? '✨ Kozmik Gemi · Önümüzdeki 2 Hafta ✨' :
                                '✨ Kozmik Gemi · Önümüzdeki Etkinlikler ✨';
    if (!list.length) return `${header}\n\nBu dönemde planlı etkinlik yok. Yeni ay yaklaşırken takvimi tekrar kontrol et 🌙\n\n${siteUrl()}`;
    const lines = list.map(e => {
      const d = new Date(e.date);
      const dateStr = d.toLocaleString('tr-TR', { day: '2-digit', month: 'short', weekday: 'short', hour: '2-digit', minute: '2-digit' });
      return `🌙 ${dateStr}\n   ${e.title}\n   📍 ${e.where} · 🎙 ${e.teacher}`;
    });
    return `${header}\n\n${lines.join('\n\n')}\n\nOrkestrada yerini al → ${siteUrl()}`;
  }

  function openShareSheet(text, title='Paylaş') {
    $('#shareTitle').textContent = title;
    $('#shareText').value = text;
    renderShareGrid();
    $('#shareSheet').classList.add('open');
  }
  function closeShareSheet() { $('#shareSheet').classList.remove('open'); }
  $$('#shareSheet [data-share-close]').forEach(b => b.addEventListener('click', closeShareSheet));

  function currentShareText() { return $('#shareText').value; }
  function renderShareGrid() {
    const grid = $('#shareGrid');
    grid.innerHTML = '';
    const url = siteUrl();
    const targets = [
      { id: 'wa', label: 'WhatsApp', icon: '🟢', cls: 'wa', go: () => window.open(`https://wa.me/?text=${encodeURIComponent(currentShareText())}`, '_blank') },
      { id: 'tg', label: 'Telegram', icon: '✈', cls: 'tg', go: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(currentShareText())}`, '_blank') },
      { id: 'x', label: 'X', icon: '𝕏', cls: 'x', go: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentShareText())}`, '_blank') },
      { id: 'fb', label: 'Facebook', icon: 'f', cls: 'fb', go: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(currentShareText())}`, '_blank') },
      { id: 'ig', label: 'Instagram', icon: '◎', cls: 'ig', go: async () => {
          await copyText(currentShareText());
          toast('Metin kopyalandı · Instagram açılıyor');
          window.open('https://www.instagram.com/', '_blank');
        } },
      { id: 'em', label: 'E-posta', icon: '✉', cls: 'em', go: () => {
          const t = currentShareText();
          const subj = t.split('\n')[0].replace(/^[✨🌙]\s*/, '').slice(0, 80);
          window.location.href = `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(t)}`;
        } },
      { id: 'cp', label: 'Kopyala', icon: '⧉', cls: 'cp', go: async () => { await copyText(currentShareText()); toast('Kopyalandı'); } },
    ];
    if (navigator.share) {
      targets.push({ id: 'ns', label: 'Cihaz Paylaş', icon: '↗', cls: 'ns', go: async () => {
        try { await navigator.share({ text: currentShareText(), url: siteUrl() }); } catch (_) {}
      } });
    }
    targets.forEach(t => {
      const b = document.createElement('button');
      b.className = 'share-btn';
      b.innerHTML = `<span class="ic ${t.cls}">${t.icon}</span><span>${t.label}</span>`;
      b.addEventListener('click', t.go);
      grid.appendChild(b);
    });
  }
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); }
    catch (_) {
      const ta = document.createElement('textarea');
      ta.value = t; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      ta.remove();
    }
  }
  function toast(msg) {
    let t = document.getElementById('kg-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'kg-toast';
      t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:linear-gradient(120deg,var(--accent),var(--accent-2));color:#0a0a22;padding:10px 18px;border-radius:999px;font-weight:600;font-size:13px;box-shadow:var(--shadow);z-index:100;opacity:0;transition:opacity .2s';
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = 1;
    clearTimeout(t._h); t._h = setTimeout(() => t.style.opacity = 0, 1800);
  }

  // Bülten butonu
  $('#digestBtn').addEventListener('click', () => {
    openShareSheet(digestText(7), 'Haftalık Bülten');
  });
  // Hash ile direkt aç (admin'den)
  if (location.hash === '#digest') {
    setTimeout(() => { show('bridge'); openShareSheet(digestText(7), 'Haftalık Bülten'); }, 200);
  }
  // Expose for admin or console
  window.KG.share = { openShareSheet, eventShareText, digestText };
  function eventLine(e) {
    const d = new Date(e.date);
    return `<p style="display:flex;justify-content:space-between;gap:12px;border-top:1px dashed var(--line);padding-top:8px;margin-top:8px">
      <span>${d.toLocaleDateString('tr-TR',{day:'2-digit',month:'short'})} · ${e.title}</span>
      <span style="color:var(--accent-3)">${e.teacher}</span>
    </p>`;
  }

  function renderUpcoming() {
    const wrap = $('#upcomingEvents');
    wrap.innerHTML = '';
    const upcoming = events
      .filter(e => new Date(e.date) >= new Date())
      .sort((a,b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);
    upcoming.forEach(e => wrap.appendChild(eventCardEl(e)));
  }
  function renderAllEvents(filter='all') {
    const wrap = $('#allEvents');
    wrap.innerHTML = '';
    const list = events
      .filter(e => new Date(e.date) >= new Date())
      .filter(e => filter === 'all' ? true : e.roomId === filter)
      .sort((a,b) => new Date(a.date) - new Date(b.date));
    if (!list.length) {
      wrap.innerHTML = `<p style="color:var(--ink-mute);text-align:center;padding:30px 0">Bu odadan yaklaşan etkinlik yok. Yeni ayda haritayı yeniden çiz.</p>`;
      return;
    }
    list.forEach(e => wrap.appendChild(eventCardEl(e)));
  }
  function renderEventFilters() {
    const row = $('#eventFilters');
    row.innerHTML = '';
    const items = [{ id: 'all', label: 'Tümü' }, ...rooms.map(r => ({ id: r.id, label: r.title }))];
    items.forEach((it, i) => {
      const b = document.createElement('button');
      b.className = 'chip' + (i === 0 ? ' active' : '');
      b.textContent = it.label;
      b.addEventListener('click', () => {
        $$('.chip', row).forEach(c => c.classList.remove('active'));
        b.classList.add('active');
        renderAllEvents(it.id);
      });
      row.appendChild(b);
    });
  }

  $('#viewAllEvents').addEventListener('click', () => { show('events'); renderEventFilters(); renderAllEvents(); });

  /* ---------- Tabbar ---------- */
  $$('.tab').forEach(t => {
    t.addEventListener('click', () => {
      const go = t.dataset.go;
      if (!go) return;
      if (go === 'bridge') show('bridge');
      else if (go === 'rooms-tab') { show('bridge'); window.scrollTo({ top: $('#rooms').offsetTop - 60, behavior: 'smooth' }); }
      else if (go === 'events') { show('events'); renderEventFilters(); renderAllEvents(); }
    });
  });
  $('#captainTab').addEventListener('click', openCaptain);
  $$('[data-back]').forEach(b => b.addEventListener('click', () => show(b.dataset.back)));

  /* ---------- Captain modal ---------- */
  const modal = $('#captainModal');
  function openCaptain() { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); renderQuick(); }
  function closeCaptain() { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
  $('#captainBtn').addEventListener('click', openCaptain);
  $('#captainBtn2').addEventListener('click', openCaptain);
  $('#captainBtn3').addEventListener('click', openCaptain);
  $$('#captainModal [data-close]').forEach(b => b.addEventListener('click', closeCaptain));

  function addMsg(text, who='bot') {
    const m = document.createElement('div');
    m.className = 'msg ' + who;
    m.innerHTML = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    $('#chat').appendChild(m);
    $('#chat').scrollTop = $('#chat').scrollHeight;
  }
  function renderQuick() {
    const wrap = $('#quickReplies');
    wrap.innerHTML = '';
    captain.quick.forEach(q => {
      const b = document.createElement('button');
      b.textContent = q.label;
      b.addEventListener('click', () => {
        addMsg(q.label, 'user');
        wrap.innerHTML = '';
        setTimeout(() => {
          addMsg(q.reply, 'bot');
          if (q.go) {
            setTimeout(() => {
              const r = rooms.find(x => x.id === q.go);
              if (r) addMsg(`Hazırsan "${r.title}" odasına götüreyim mi? Aşağıya "evet" yaz, kapıyı açayım.`, 'bot');
              window._pendingRoom = q.go;
            }, 600);
          }
          setTimeout(renderQuick, 1200);
        }, 400);
      });
      wrap.appendChild(b);
    });
  }
  $('#composer').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const inp = $('#msgInput');
    const text = inp.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    inp.value = '';
    const lower = text.toLocaleLowerCase('tr');
    setTimeout(() => {
      if (window._pendingRoom && /^(evet|olur|tamam|aç|götür)/.test(lower)) {
        const r = rooms.find(x => x.id === window._pendingRoom);
        window._pendingRoom = null;
        addMsg(`Kapıyı açıyorum… ${r.title}’na hoş geldin.`, 'bot');
        setTimeout(() => { closeCaptain(); openRoom(r.id); }, 700);
        return;
      }
      const map = { reiki:'reiki', kundalini:'kundalini', yoga:'kundalini', ses:'ses', sound:'ses', çanak:'ses', su:'su', water:'su', tantra:'tantra', beden:'beden', body:'beden', yaratım:'yaratim', yaratim:'yaratim', niyet:'yaratim', atölye:'atolye', atolye:'atolye', çay:'atolye' };
      const hit = Object.keys(map).find(k => lower.includes(k));
      if (hit) {
        const r = rooms.find(x => x.id === map[hit]);
        addMsg(`Seni **${r.title}**na yönlendireyim mi? "evet" dersen kapıyı açarım.`, 'bot');
        window._pendingRoom = r.id;
      } else {
        addMsg(captain.fallback, 'bot');
      }
    }, 350);
  });

  /* ---------- Init ---------- */
  function render() {
    renderRooms();
    renderUpcoming();
  }
  // Override'lar geldikten sonra render
  window.KG.loadOverrides().then(render);
  // Boarding visible by default
  show('boarding');
})();
