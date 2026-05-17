// Kozmik Gemi · içerik veritabanı
window.KG = (function () {
  const rooms = [
    {
      id: 'reiki',
      title: 'Reiki Odası',
      ico: '✋',
      freq: '7.83 Hz · Schumann',
      color: 'linear-gradient(135deg, #c8a2ff, #5ad9ff)',
      tagline: 'Evrensel yaşam enerjisinin avuçlarındaki dansı.',
      hero:
        'Reiki, Japoncada "rei" (evrensel) ve "ki" (yaşam enerjisi) sözcüklerinden gelir. Mikao Usui tarafından 1922 yılında Kurama Dağı’ndaki 21 günlük inzivada yeniden hatırlanan bir el ile şifa sanatıdır. Aslında çok daha kadim: Tibet tıbbı, eski Mısır rahip okulları ve Hint pranasında aynı akış farklı isimlerle anılır.',
      teachings: [
        {
          h: 'Kadim Kök',
          p: 'Sanskritçe "prana", Çincede "qi", Polinezyacada "mana" olarak bilinen yaşam soluğu; Reiki’nin temelidir. Usui Sensei bu bilgiyi sutralardaki sembollerle yeniden hatırladı ve avuçlardan akıtmayı öğretti.'
        },
        {
          h: 'Beş İlke (Gokai)',
          p: 'Sadece bugün:',
          list: [
            'Öfkelenmeyeceğim.',
            'Endişelenmeyeceğim.',
            'Şükredeceğim.',
            'Görevimi dürüstçe yapacağım.',
            'Tüm canlılara nazik olacağım.'
          ]
        },
        {
          h: 'Üç Derece',
          p: 'Shoden (1. derece) bedeni açar. Okuden (2. derece) sembollerle uzaktan şifayı öğretir. Shinpiden (Usta) tohumu başka kalplere geçirme yetkisidir.'
        },
        {
          h: 'Pratik',
          p: 'Avuçlar 12 ana pozisyonda bedenin enerji kapılarına yerleştirilir: taç, üçüncü göz, boğaz, kalp, solar pleksus, sakral, kök. Süresi 60-75 dakikadır; alıcı uyur gibi bir gevşeme yaşar.'
        }
      ],
      teachers: [
        { name: 'Ayla Deniz', role: 'Usui Reiki Master', phone: '+90 532 412 88 91', addr: 'Cihangir, Beyoğlu / İstanbul' },
        { name: 'Mert Yıldırım', role: 'Holy Fire Reiki III', phone: '+90 555 207 14 36', addr: 'Alaçatı / İzmir' },
        { name: 'Selin Aksoy', role: 'Karuna Reiki®', phone: '+90 533 884 02 19', addr: 'Göynük / Antalya' }
      ]
    },
    {
      id: 'kundalini',
      title: 'Kundalini Yoga',
      ico: '🐍',
      freq: 'Mool Mantra',
      color: 'linear-gradient(135deg, #ff9ec7, #ffd28a)',
      tagline: 'Omurganda kıvrılan ışık yılanını uyandır.',
      hero:
        'Kundalini, Sanskritçe "kıvrılmış" demektir. Kök çakranın derinliğinde uyuyan ilahi enerjidir. Tantra geleneğinde Shakti olarak bilinir; nefes, mantra, beden kilitleri (bandha) ve mudra ile yukarı yükseltilir. Yogi Bhajan 1968’de Batı’ya açıkça öğretmeden önce bu bilgi sadece kapalı kapılar ardında aktarılırdı.',
      teachings: [
        { h: 'Yedi Çakra', p: 'Kök (Muladhara), Sakral (Svadhisthana), Solar (Manipura), Kalp (Anahata), Boğaz (Vishuddha), Üçüncü göz (Ajna), Taç (Sahasrara). Kundalini bu sütundan yükselir.' },
        { h: 'Ateş Nefesi', p: 'Burundan ritmik, hızlı, eşit nefes alıp verme. Karın pompası akciğeri körük gibi kullanır. 1-3 dakika başlayıp 11 dakikaya kadar artırılır.' },
        { h: 'Kriya', p: 'Bir kriya; nefes, hareket, mantra ve odaktan oluşan tam bir formüldür. "Sat Kriya" en temel arınma kriyasıdır.', list: ['Düz oturuş, eller başın üzerinde kenetli', 'İşaret parmakları yukarı', '“Sat” derken göbeği çek, “Nam” derken bırak', '3 dakikadan başla, 31 dakikaya uzat'] },
        { h: 'Mool Mantra', p: '“Ek Ong Kar Sat Nam Karta Purkh…” — Yaradan ile özün arasındaki köprü. Her sabah 3 kez söylendiğinde kalbi yeniden hizalar.' }
      ],
      teachers: [
        { name: 'Sat Kaur', role: 'KRI Sertifikalı Eğitmen', phone: '+90 532 778 90 14', addr: 'Etiler, Beşiktaş / İstanbul' },
        { name: 'Ravi Singh Tr.', role: 'Kundalini Research Institute', phone: '+90 555 391 22 08', addr: 'Konyaaltı / Antalya' }
      ]
    },
    {
      id: 'ses',
      title: 'Ses Şifası',
      ico: '🎵',
      freq: '432 / 528 Hz',
      color: 'linear-gradient(135deg, #5ad9ff, #b8a2ff)',
      tagline: 'Frekans, hücrenin anadilidir.',
      hero:
        'Ses şifası, evrenin titreşimsel doğasına dayanır. Pythagoras "musica universalis" ile gezegenlerin sesini ölçtü; Tibet rahipleri 2500 yıl önce 7 metalden tasları döktü; Aborjinler didgeridoo ile rüya zamanını çağırdı. 528 Hz "sevgi frekansı" olarak DNA onarımıyla ilişkilendirilmiştir.',
      teachings: [
        { h: 'Solfeggio Frekansları', p: '174, 285, 396, 417, 528, 639, 741, 852, 963 Hz. Her biri bir bedensel/zihinsel kapıyı açar.' },
        { h: 'Tibet Çanakları', p: '7 metalden döküm: altın (Güneş), gümüş (Ay), cıva (Merkür), bakır (Venüs), demir (Mars), kalay (Jüpiter), kurşun (Satürn). Her gezegen bir nota.' },
        { h: 'Gong Banyosu', p: 'Yatış, gözler kapalı, gong dalgaları beynin teta ritmine girmesini sağlar. 45 dakika gevşeme = 4 saat derin uyku.' },
        { h: 'Mantra ile Sesletme', p: '“OM” evrenin ilk titreşimidir. Diyaframdan, 12 saniyelik nefes verişle söylenir; vagus sinirini sakinleştirir.' }
      ],
      teachers: [
        { name: 'Aslı Tunç', role: 'Tibet Çanakları & Gong', phone: '+90 532 014 77 23', addr: 'Caddebostan, Kadıköy / İstanbul' },
        { name: 'Burak Erol', role: 'Vokal Toning · Overtone', phone: '+90 533 660 41 95', addr: 'Bodrum / Muğla' },
        { name: 'Lale Çetin', role: 'Kristal Çanaklar', phone: '+90 555 412 30 88', addr: 'Çankaya / Ankara' }
      ]
    },
    {
      id: 'su',
      title: 'Su Terapisi',
      ico: '💧',
      freq: 'H₂O · Hafıza',
      color: 'linear-gradient(135deg, #5ad9ff, #6fe6c1)',
      tagline: 'Su, niyetin hafızasıdır.',
      hero:
        'Masaru Emoto’nun fotoğrafladığı kristaller gösterdi ki su, dış ortamdan etkilenir; sevgi sözüne karşı simetrik bir kar tanesi oluşturur. Bedenin %70’i sudur. Antik Roma’dan Osmanlı hamamına, Kneipp terapisinden flotasyona; sıcak-soğuk döngüleri vagus sinirini eğitir, lenfi hareketlendirir.',
      teachings: [
        { h: 'Watsu', p: 'Suda yapılan shiatsu. 35°C suda destekli yüzdürme ile fasya yumuşar, kalp ritmi düşer, anne karnı hafızası uyanır.' },
        { h: 'Kontrast Banyosu', p: '3 dk sıcak (38–40°C) + 30 sn soğuk (10–15°C) × 3 tur. Bağışıklığı %30 güçlendirdiği gösterilmiştir.' },
        { h: 'Niyetli Su', p: 'Bir bardak suya elini koy, kalbini aç, üç nefes sonra "şükrediyorum" de. Iç. Bu ritüel suya bilgi yükler.' },
        { h: 'Deniz Hücresi', p: 'Plazmamız okyanusla aynı tuz oranındadır. Tuzlu suya batmak, hücresel hafızayı evine çağırır.' }
      ],
      teachers: [
        { name: 'Deniz Su', role: 'Watsu® Pratisyeni', phone: '+90 532 901 55 14', addr: 'Çeşme / İzmir' },
        { name: 'Ekin Yalçın', role: 'Aquatic Bodywork', phone: '+90 553 224 11 67', addr: 'Kalkan / Antalya' }
      ]
    },
    {
      id: 'atolye',
      title: 'Atölyeler',
      ico: '🛠',
      freq: 'Birlikte yap',
      color: 'linear-gradient(135deg, #ffd28a, #ff9ec7)',
      tagline: 'Eller toprakta, kalp gökyüzünde.',
      hero:
        'Atölye, çıraklığın ve aktarımın kadim formudur. Sümer rahipleri kil tablete yazarken, Anadolu kadınları kilim dokurken bilgiyi bedene işlerdi. Burada haftalık değişen pratiklerle eller, ses ve niyet birleşir.',
      teachings: [
        { h: 'Düzenli Pratikler', p: '', list: [
          'Çay Seremonisi (Çinli usulü Gong Fu Cha)',
          'Bitki Esansı & Aromaterapi',
          'Kil ile Çakra Tanıma',
          'Tarot ve Sembol Okuma',
          'Astroloji 101 — Doğum Haritası'
        ] },
        { h: 'Aktarım', p: 'Atölyeler 8–14 kişilik küçük dairelerle yapılır. Çırak-usta hattı korunur; öğrenilen şey önce ev sofrasına taşınır.' }
      ],
      teachers: [
        { name: 'İrem Karaca', role: 'Çay Seremonisi Ustası', phone: '+90 532 116 84 02', addr: 'Galata, Beyoğlu / İstanbul' },
        { name: 'Toprak Demir', role: 'Aromaterapi & Bitki', phone: '+90 555 002 91 47', addr: 'Şirince / İzmir' }
      ]
    },
    {
      id: 'yaratim',
      title: 'Yaratım Alanı',
      ico: '✨',
      freq: 'Sıfır nokta',
      color: 'linear-gradient(135deg, #b8a2ff, #ffd28a)',
      tagline: 'Niyet, evrenin ham maddesidir.',
      hero:
        'Hermes Trismegistos: "Yukarıda nasılsa, aşağıda da öyle." Yaratım, görünmeyenden görünene geçen frekanstır. Burada vizyon panoları, ay ritüelleri ve niyet dairelerini bir araya getiriyoruz. Sen bir izleyici değil, eş-yaratıcısın.',
      teachings: [
        { h: 'Üç Adımlı Yaratım', p: '', list: [
          'Net niyet (kelimeler kesin)',
          'Bedende hissetme (sanki olmuş gibi)',
          'Bırakma (sonucu evrene teslim)'
        ] },
        { h: 'Yeni Ay Ritüeli', p: 'Yeni ay niyetin tohumudur. Bir mum, beyaz kağıt ve 3 söz: "Hayatıma çağırıyorum…" Yaz, oku, yak, küle teşekkür et.' },
        { h: 'Vizyon Panosu', p: 'Yıllık niyetler için kalbin imgesini gözle hizalar. Önce hissi seç (huzur, bolluk, sevgi), sonra görüntüyü.' }
      ],
      teachers: [
        { name: 'Nehir Atalay', role: 'Niyet Daireleri Kolaylaştırıcı', phone: '+90 532 661 70 28', addr: 'Bebek, Beşiktaş / İstanbul' },
        { name: 'Cem Korkmaz', role: 'Ay Ritüelleri', phone: '+90 553 199 02 14', addr: 'Datça / Muğla' }
      ]
    },
    {
      id: 'tantra',
      title: 'Tantra',
      ico: '🔥',
      freq: 'Shiva · Shakti',
      color: 'linear-gradient(135deg, #ff7aa2, #c8a2ff)',
      tagline: 'Kutsalın ve bedenin buluştuğu eşik.',
      hero:
        'Tantra, Sanskritçe “dokuma” demektir. Cinsellikle eş tutulması bir Batı yanlış anlamasıdır. Asıl tantra; bedenin, nefesin ve farkındalığın kutsal kabul edildiği bir bütünlük yoludur. Kashmir Şivacılığında, evren Shiva’nın (saf farkındalık) ve Shakti’nin (yaratıcı güç) dansıdır.',
      teachings: [
        { h: 'Beden Tapınaktır', p: 'Tantra utancı kaldırır; bedenin her hücresi tapınağın bir taşı sayılır. Saygı ve sınır temeldir.' },
        { h: 'Nefes Dansı', p: 'Eşler/yalnız pratikte burundan dairesel nefes. Nefes verirken kalbe selam, alırken karna iniş. 21 nefes sonra dünya değişir.' },
        { h: 'Göz Bakışı (Trataka)', p: 'Karşıdaki gözün siyah noktasına 7 dakika kesintisiz bakış. İlk önce huzursuzluk, sonra erime, sonra tanışma.' },
        { h: 'Kutsal Sınır', p: 'Her tantra pratiği rıza, sözlü mutabakat ve “durmak özgürdür” ilkesiyle başlar. Kapı her zaman açıktır.' }
      ],
      teachers: [
        { name: 'Asya Mavi', role: 'Tantra Kolaylaştırıcı (ISTA Trained)', phone: '+90 532 805 31 47', addr: 'Cihangir, Beyoğlu / İstanbul' },
        { name: 'Devran Işık', role: 'Neo-Tantra & Nefes', phone: '+90 555 720 04 88', addr: 'Kaş / Antalya' }
      ]
    },
    {
      id: 'beden',
      title: 'Beden Egzersizleri',
      ico: '🌀',
      freq: 'Fasya · Akış',
      color: 'linear-gradient(135deg, #6fe6c1, #5ad9ff)',
      tagline: 'Beden, ruhun ilk dilidir.',
      hero:
        'Hareket, antik şamandan modern somatic terapiste kadar şifanın anahtarıdır. Wilhelm Reich “karakter zırhı” dedi; fasyanın hafıza tuttuğunu gösterdi. Tai Chi 800 yıllık bir akıştır, qi’yi bedende dolaştırır. Bu odada nefes, fasya ve titreşim birleşir.',
      teachings: [
        { h: 'Sabah 5 Tibet Ritüeli', p: '', list: [
          'Döndürme · 21 kez',
          'Bacak kaldırma · 21 kez',
          'Deve duruşu · 21 kez',
          'Köprü · 21 kez',
          'Yukarı-aşağı bakan köpek geçişi · 21 kez'
        ] },
        { h: 'Titreyiş (TRE)', p: 'Beden gerginliği titreyerek serbest bırakır. Hayvanlar bunu doğal yapar; biz kültürle bastırdık. 10–15 dk yumuşak titreme = saatlerce terapi.' },
        { h: 'Qi Gong', p: '“Kucağa altın taşımak”, “Bulutu eliyle dağıtmak” gibi yavaş formlar. Eklemleri akıcı, lenfi canlı tutar.' }
      ],
      teachers: [
        { name: 'Kıvılcım Öz', role: 'Somatic Experiencing® & TRE', phone: '+90 532 990 16 25', addr: 'Nişantaşı, Şişli / İstanbul' },
        { name: 'Hakan Bulut', role: 'Tai Chi & Qi Gong Ustası', phone: '+90 555 408 73 12', addr: 'Üsküdar / İstanbul' }
      ]
    }
  ];

  // Etkinlik takvimi — bugünden ileri tarihler
  const today = new Date();
  function plus(days, h=19, m=30) {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  }
  const events = [
    { id:'e1', roomId:'ses',     title:'Dolunay Gong Banyosu',      where:'İstanbul · Kuzguncuk Bahçe',  date: plus(3, 20, 0),  tag:'Ses Şifası',     teacher:'Aslı Tunç' },
    { id:'e2', roomId:'kundalini', title:'40 Günlük Sadhana — Açılış', where:'İzmir · Alaçatı Stüdyo',     date: plus(6, 7, 0),   tag:'Kundalini',      teacher:'Sat Kaur' },
    { id:'e3', roomId:'reiki',   title:'Reiki 1. Derece İnisiyasyon', where:'İstanbul · Cihangir',         date: plus(9, 10, 0),  tag:'Reiki',          teacher:'Ayla Deniz' },
    { id:'e4', roomId:'yaratim', title:'Yeni Ay Niyet Dairesi',     where:'İstanbul · Bebek Bahçe',       date: plus(12, 19, 30),tag:'Yaratım',        teacher:'Nehir Atalay' },
    { id:'e5', roomId:'su',      title:'Watsu Atölyesi · Tek Gün',  where:'Çeşme · Deniz Tapınağı',       date: plus(15, 9, 0),  tag:'Su Terapisi',    teacher:'Deniz Su' },
    { id:'e6', roomId:'tantra',  title:'Tantra Nefes Dansı',        where:'Antalya · Kaş Sahili',         date: plus(18, 18, 0), tag:'Tantra',         teacher:'Devran Işık' },
    { id:'e7', roomId:'beden',   title:'TRE Titreyiş Atölyesi',     where:'İstanbul · Nişantaşı',         date: plus(21, 11, 0), tag:'Beden',          teacher:'Kıvılcım Öz' },
    { id:'e8', roomId:'atolye',  title:'Çay Seremonisi · Gong Fu Cha', where:'İstanbul · Galata',         date: plus(25, 16, 0), tag:'Atölye',         teacher:'İrem Karaca' },
    { id:'e9', roomId:'ses',     title:'Kristal Çanaklar Akşamı',   where:'Ankara · Çankaya',             date: plus(28, 20, 30),tag:'Ses Şifası',     teacher:'Lale Çetin' },
    { id:'e10', roomId:'kundalini', title:'Sat Kriya İntensifi',    where:'Antalya · Konyaaltı',          date: plus(33, 7, 30), tag:'Kundalini',      teacher:'Ravi Singh Tr.' }
  ];

  // Kaptanın diyalog ağacı
  const captain = {
    greeting: 'Selam yolcu. Ben Kaptan. Gemide hangi frekansa yöneleceğini birlikte bulalım. Nasıl hissediyorsun?',
    quick: [
      { label: 'Yorgunum, dinlenmek istiyorum', reply: 'Anladım. Sana **Ses Şifası** ve **Su Terapisi** odalarını öneririm. Gong dalgaları sinir sistemini yatıştırır; suyun kucağı bedenin hafızasını yumuşatır.', go: 'ses' },
      { label: 'Kendimi tıkanmış hissediyorum', reply: 'Akış için **Kundalini Yoga** ya da **Beden Egzersizleri** seni çağırıyor olabilir. Ateş nefesi ve TRE titreyişi birikmiş enerjiyi serbest bırakır.', go: 'kundalini' },
      { label: 'Bir niyetimi gerçekleştirmek istiyorum', reply: '**Yaratım Alanı** tam sana göre. Yeni ay niyet dairesi ya da vizyon panosu pratiği niyetini hizalar.', go: 'yaratim' },
      { label: 'Sevgiyle bağlanmak istiyorum', reply: '**Reiki** ve **Tantra** odaları kalbi açar. Reiki ellerin sıcaklığı; tantra ise nefes ve bakışla buluşturur.', go: 'reiki' },
      { label: 'Bir öğretmen arıyorum', reply: 'Her odanın altında hocaların adı, adresi ve telefonu var. Bir odaya gir, kalbinin çağırdığı isme yaz ya da ara.' },
      { label: 'Yaklaşan etkinlikler?', reply: 'Köprünün altında “Yaklaşan Etkinlikler”i göreceksin. “Tümü” diyerek takvimi açabilirsin.' }
    ],
    fallback: 'Seni duydum. Gemide her oda bir nota; senin notana en yakın yer hangisi olabilir? Aşağıdaki seçeneklerden başlayabilirsin ya da “reiki, tantra, ses, su, kundalini, beden, yaratım, atölye” yazabilirsin.'
  };

  // Override katmanı: hocalar oda bazında ve etkinlik listesi tamamen
  // değiştirilebilir. Önce repo'daki data-overrides.json, sonra localStorage
  // (admin paneli) uygulanır. Boş/eksik alanlar varsayılanı korur.
  function applyOverrides(ov) {
    if (!ov || typeof ov !== 'object') return;
    if (ov.teachers && typeof ov.teachers === 'object') {
      rooms.forEach(r => {
        if (Array.isArray(ov.teachers[r.id])) r.teachers = ov.teachers[r.id];
      });
    }
    if (Array.isArray(ov.events)) {
      events.length = 0;
      ov.events.forEach(e => events.push(e));
    }
  }

  // Override'ı dosyadan + localStorage'tan toplayıp uygula
  async function loadOverrides() {
    try {
      const res = await fetch('data-overrides.json', { cache: 'no-store' });
      if (res.ok) applyOverrides(await res.json());
    } catch (_) {}
    try {
      const local = localStorage.getItem('kg_overrides');
      if (local) applyOverrides(JSON.parse(local));
    } catch (_) {}
  }

  // Admin için "varsayılan + uygulanmış override" durumunu dışa ver
  function snapshot() {
    return {
      teachers: Object.fromEntries(rooms.map(r => [r.id, r.teachers.map(t => ({ ...t }))])),
      events: events.map(e => ({ ...e }))
    };
  }

  return { rooms, events, captain, applyOverrides, loadOverrides, snapshot };
})();
