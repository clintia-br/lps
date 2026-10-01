/* Site da Unimedic · modelo ClintIA de clínica popular. Sem biblioteca: tudo aqui é pequeno e funciona com internet fraca. */
(function () {
  var d = document, raiz = d.documentElement;
  raiz.classList.add('js');
  var calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* entrada dos blocos ao rolar */
  var alvos = [].slice.call(d.querySelectorAll('.entra, .ponte, .una-foto'));
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    alvos.forEach(function (a) { obs.observe(a); });
    /* rede de segurança: se algo impedir o observador, nada fica invisível */
    setTimeout(function () { alvos.forEach(function (a) { if (a.getBoundingClientRect().top < innerHeight) a.classList.add('visto'); }); }, 1200);
    setTimeout(function () { alvos.forEach(function (a) { a.classList.add('visto'); }); }, 6000);
  } else { alvos.forEach(function (a) { a.classList.add('visto'); }); }

  /* cabeçalho ganha borda depois de rolar + barra de progresso da leitura */
  var topo = d.querySelector('.topo'), barra = d.querySelector('.progresso i');
  function rolou() {
    if (topo) topo.classList.toggle('rolou', scrollY > 8);
    if (barra) { var h = d.documentElement.scrollHeight - innerHeight; barra.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%'; }
  }
  addEventListener('scroll', rolou, { passive: true }); rolou();

  /* parallax leve na foto principal das montagens (desligado para quem pede menos movimento) */
  var px = [].slice.call(d.querySelectorAll('[data-parallax]'));
  if (px.length && !calmo) {
    var pedido = false;
    var move = function () {
      pedido = false;
      var h = innerHeight;
      px.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < -100 || r.top > h + 100) return;
        var desvio = ((r.top + r.height / 2) - h / 2) / h;
        el.style.transform = 'translate3d(0,' + (desvio * -3.5).toFixed(2) + '%,0)';
      });
    };
    addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(move); } }, { passive: true });
    addEventListener('resize', move); move();
  }

  /* números da capa sobem contando (só os que são número puro) */
  var fatos = [].slice.call(d.querySelectorAll('.fatos b'));
  fatos.forEach(function (b) {
    var txt = b.textContent.trim(), m = txt.match(/^(R\$\s?)?(\d+)$/);
    if (!m) return;
    var alvo = parseInt(m[2], 10), pref = m[1] || '', ini = null;
    b.textContent = pref + '0';
    var passo = function (t) {
      if (ini === null) ini = t;
      var k = Math.min(1, (t - ini) / 1100), e = 1 - Math.pow(1 - k, 3);
      b.textContent = pref + Math.round(alvo * e);
      if (k < 1) requestAnimationFrame(passo);
    };
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); requestAnimationFrame(passo); } }, { threshold: 0.5 });
    io.observe(b);
    setTimeout(function () { if (b.textContent === pref + '0') { io.disconnect(); b.textContent = txt; } }, 5000);
  });

  /* vídeo da capa: só roda quando está na tela (poupa bateria) */
  var vids = [].slice.call(d.querySelectorAll('video.vid'));
  if (vids.length && 'IntersectionObserver' in window) {
    var vo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
    }, { threshold: 0.15 });
    vids.forEach(function (v) { vo.observe(v); });
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

  /* especialidades: busca e filtro (convênio / particular) */
  var lista = d.querySelector('[data-especialidades]');
  if (lista) {
    var itens = [].slice.call(lista.querySelectorAll('.esp')), campo = d.getElementById('busca-esp'),
        chips = [].slice.call(d.querySelectorAll('.chip[data-unidade]')), vazio = d.getElementById('sem-esp'), un = 'todas';
    var limpa = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
    var filtra = function () {
      var q = limpa(campo ? campo.value : ''), n = 0;
      itens.forEach(function (li) {
        var ok = (un === 'todas' || li.dataset.unidades.indexOf(un) > -1) && limpa(li.dataset.nome).indexOf(q) > -1;
        if (un === 'particular') ok = ok && li.dataset.unidades.indexOf('convenios') === -1;
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
