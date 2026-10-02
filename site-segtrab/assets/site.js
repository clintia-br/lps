/* Site da SegTrab Saúde · modelo ClintIA de clínica popular. Sem biblioteca: tudo aqui é pequeno e funciona sem internet boa. */
(function () {
  var d = document, raiz = d.documentElement;
  raiz.classList.add('js');

  /* entrada dos blocos ao rolar */
  var alvos = [].slice.call(d.querySelectorAll('.entra, .ponte'));
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    alvos.forEach(function (a) { obs.observe(a); });
    /* rede de segurança: se algo impedir o observador, nada fica invisível */
    setTimeout(function () { alvos.forEach(function (a) { if (a.getBoundingClientRect().top < innerHeight) a.classList.add('visto'); }); }, 1200);
  } else { alvos.forEach(function (a) { a.classList.add('visto'); }); }

  /* cabeçalho ganha borda depois de rolar */
  var topo = d.querySelector('.topo');
  function rolou() { if (topo) topo.classList.toggle('rolou', scrollY > 8); }
  addEventListener('scroll', rolou, { passive: true }); rolou();

  /* parallax leve na foto principal das montagens (desligado para quem pede menos movimento) */
  var px = [].slice.call(d.querySelectorAll('[data-parallax]'));
  var calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (px.length && !calmo) {
    var pedido = false;
    var move = function () {
      pedido = false;
      var h = innerHeight;
      px.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < -100 || r.top > h + 100) return;
        var desvio = ((r.top + r.height / 2) - h / 2) / h;          /* -1 no alto da tela, +1 embaixo */
        el.style.transform = 'translate3d(0,' + (desvio * -3.5).toFixed(2) + '%,0)';
      });
    };
    addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(move); } }, { passive: true });
    addEventListener('resize', move); move();
  }

  /* menu do celular */
  var gaveta = d.querySelector('.menu-gaveta'), abre = d.querySelector('.abre-menu');
  function menu(aberto) {
    if (!gaveta) return;
    gaveta.classList.toggle('aberto', aberto);
    abre.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    d.body.style.overflow = aberto ? 'hidden' : '';
    if (aberto) { var f = gaveta.querySelector('.fecha'); if (f) f.focus(); } else abre.focus();
  }
  if (abre) abre.addEventListener('click', function () { menu(true); });
  if (gaveta) gaveta.addEventListener('click', function (e) {
    if (e.target.closest('.fecha') || e.target.classList.contains('fundo') || e.target.closest('a')) menu(false);
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gaveta && gaveta.classList.contains('aberto')) menu(false); });

  /* registro de cliques para o GTM (só no ar; local não conta) */
  var noAr = !/^(localhost|127\.|\[::1\])/.test(location.hostname) && location.protocol !== 'file:';
  function registra(evento, dados) {
    if (!noAr) return;
    window.dataLayer = window.dataLayer || [];
    var o = { event: evento, pagina: location.pathname };
    for (var k in dados) o[k] = dados[k];
    window.dataLayer.push(o);
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="wa.me/"]');
    if (a) registra('clique_whatsapp', { lugar: a.getAttribute('data-lugar') || 'pagina' });
    var t = e.target.closest('a[href*="tenex.com.br/contratar"]');
    if (t) registra('clique_adesao', { plano: t.getAttribute('data-plano') || '', lugar: t.getAttribute('data-lugar') || 'pagina' });
  });

  /* antes de agir: adesão online ou WhatsApp (a mensagem pronta segue o botão clicado) */
  var dlg = d.getElementById('escolha');
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-agendar]');
    if (b && dlg) {
      e.preventDefault();
      if (gaveta && gaveta.classList.contains('aberto')) menu(false);
      var msg = b.dataset.msg || 'Quero conhecer o Meu Parceiro.';
      [].forEach.call(dlg.querySelectorAll('[data-zap]'), function (z) {
        z.href = 'https://wa.me/' + z.dataset.zap + '?text=' + encodeURIComponent('Olá! Vim pelo site. ' + msg);
        z.setAttribute('data-lugar', b.dataset.lugar || 'janela');
      });
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    }
    if (dlg && (e.target.closest('#escolha .fecha') || e.target === dlg)) dlg.close();
  });

  /* planos: mensal ou anual */
  var botoesPer = [].slice.call(d.querySelectorAll('.periodo button'));
  botoesPer.forEach(function (bt) {
    bt.addEventListener('click', function () {
      var modo = bt.dataset.modo;
      botoesPer.forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.modo === modo ? 'true' : 'false'); });
      [].forEach.call(d.querySelectorAll('.plano[data-mensal]'), function (pl) {
        var anual = modo === 'anual';
        pl.querySelector('[data-valor]').textContent = anual ? pl.dataset.anualMes : pl.dataset.mensal;
        pl.querySelector('[data-nota]').textContent = anual
          ? 'por mês no anual parcelado (R$ ' + pl.dataset.anual + ' no ano, 5% de desconto)'
          : 'por mês, no pagamento mensal';
        var c = pl.querySelector('[data-contratar]');
        c.href = anual ? pl.dataset.linkAnual : pl.dataset.linkMensal;
      });
    });
  });

  /* vídeos: só tocam quando aparecem na tela */
  [].forEach.call(d.querySelectorAll('video[data-auto]'), function (v) {
    v.muted = true;
    if (!('IntersectionObserver' in window)) { v.play().catch(function () {}); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) v.play().catch(function () {}); else v.pause(); });
    }, { threshold: 0.15 }).observe(v);
  });

  /* especialidades: busca e filtro por unidade */
  var lista = d.querySelector('[data-especialidades]');
  if (lista) {
    var itens = [].slice.call(lista.querySelectorAll('.esp')), campo = d.getElementById('busca-esp'),
        chips = [].slice.call(d.querySelectorAll('.chip[data-unidade]')), vazio = d.getElementById('sem-esp'), un = 'todas';
    var limpa = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
    var filtra = function () {
      var q = limpa(campo ? campo.value : ''), n = 0;
      itens.forEach(function (li) {
        var ok = (un === 'todas' || li.dataset.unidades.indexOf(un) > -1) && limpa(li.dataset.nome).indexOf(q) > -1;
        li.hidden = !ok; if (ok) n++;
      });
      if (vazio) vazio.hidden = n > 0;
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        un = c.dataset.unidade;
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        filtra();
      });
    });
    if (campo) campo.addEventListener('input', filtra);
  }

  /* perguntas: abrir uma fecha as outras */
  var pergs = [].slice.call(d.querySelectorAll('.perg'));
  pergs.forEach(function (p) {
    p.addEventListener('toggle', function () { if (p.open) pergs.forEach(function (o) { if (o !== p) o.open = false; }); });
  });
})();

/* formulários que montam a mensagem do WhatsApp (nada é guardado no site) */
(function () {
  var d = document;
  [].forEach.call(d.querySelectorAll('form[data-form-zap]'), function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var erro = f.querySelector('.erro'), faltam = [];
      [].forEach.call(f.querySelectorAll('[required]'), function (c) { if (!c.value.trim()) faltam.push(c.getAttribute('data-rotulo') || c.name); });
      if (faltam.length) { if (erro) erro.textContent = 'Preencha: ' + faltam.join(', ') + '.'; return; }
      if (erro) erro.textContent = '';
      var linhas = [f.getAttribute('data-abertura') || 'Olá! Vim pelo site.'];
      [].forEach.call(f.querySelectorAll('[data-rotulo]'), function (c) {
        if (c.type === 'checkbox') return;
        if (c.value.trim()) linhas.push(c.getAttribute('data-rotulo') + ': ' + c.value.trim());
      });
      var marc = [].map.call(f.querySelectorAll('input[type=checkbox]:checked'), function (c) { return c.value; });
      if (marc.length) linhas.push((f.getAttribute('data-rotulo-checks') || 'Preciso de') + ': ' + marc.join(', '));
      var url = 'https://wa.me/' + f.getAttribute('data-zap') + '?text=' + encodeURIComponent(linhas.join('\n'));
      if (!/^(localhost|127\.|\[::1\])/.test(location.hostname) && location.protocol !== 'file:') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'formulario_whatsapp', formulario: f.getAttribute('data-form-zap') });
      }
      window.open(url, '_blank', 'noopener');
    });
  });
})();

/* "Agendar este" já escolhe o tipo de exame; links da janela fecham a janela */
(function () {
  var d = document, sel = d.getElementById('tipo-aso'), dlg = d.getElementById('escolha');
  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-tipo]');
    if (a && sel) { sel.value = a.getAttribute('data-tipo'); }
    if (dlg && e.target.closest('#escolha a[href^="exames.html"], #escolha a[href^="empresas.html"]') && dlg.open) dlg.close();
  });
})();
