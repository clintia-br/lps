/* Site de clínica popular · modelo ClintIA. Sem biblioteca: tudo aqui é pequeno e funciona sem internet boa. */
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

  /* escolher a unidade antes de agendar */
  var dlg = d.getElementById('escolha');
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-agendar]');
    if (b && dlg) {
      e.preventDefault();
      if (gaveta && gaveta.classList.contains('aberto')) menu(false);
      /* a mensagem pronta do WhatsApp segue o botão clicado (ex.: um plano do Videx) */
      [].forEach.call(dlg.querySelectorAll('[data-zap]'), function (a) {
        var txt = 'Olá! Vim pelo site. ' + (b.dataset.msg ? b.dataset.msg + ' Unidade ' + a.dataset.un + '.' : 'Quero agendar na unidade ' + a.dataset.un + '.');
        a.href = 'https://wa.me/' + a.dataset.zap + '?text=' + encodeURIComponent(txt);
      });
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    }
    if (dlg && (e.target.closest('#escolha .fecha') || e.target === dlg)) dlg.close();
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

  /* galeria: setas (computador), bolinhas, teclado e pausa do vídeo. No celular é só arrastar. */
  [].forEach.call(d.querySelectorAll('[data-galeria]'), function (g) {
    var trilho = g.querySelector('.gal-trilho'), itens = [].slice.call(trilho.children),
        ant = g.querySelector('[data-gal="ant"]'), prox = g.querySelector('[data-gal="prox"]'), pontos = g.querySelector('.gal-pontos');
    var passo = function () { return Math.max(trilho.clientWidth * 0.8, 260); };
    if (ant) ant.addEventListener('click', function () { trilho.scrollBy({ left: -passo(), behavior: 'smooth' }); });
    if (prox) prox.addEventListener('click', function () { trilho.scrollBy({ left: passo(), behavior: 'smooth' }); });
    trilho.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); trilho.scrollBy({ left: passo(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); trilho.scrollBy({ left: -passo(), behavior: 'smooth' }); }
    });
    var bts = itens.map(function (it, i) {
      var b = d.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Foto ' + (i + 1) + ' de ' + itens.length);
      b.addEventListener('click', function () { trilho.scrollTo({ left: it.offsetLeft - trilho.offsetLeft - 20, behavior: 'smooth' }); });
      if (pontos) pontos.appendChild(b); return b;
    });
    var marca = function () {
      var x = trilho.scrollLeft, atual = 0;
      itens.forEach(function (it, i) { if (it.offsetLeft - trilho.offsetLeft - 24 <= x) atual = i; });
      if (x + trilho.clientWidth >= trilho.scrollWidth - 4) atual = itens.length - 1;
      bts.forEach(function (b, i) { b.setAttribute('aria-current', i === atual ? 'true' : 'false'); });
      if (ant) ant.disabled = x <= 4;
      if (prox) prox.disabled = x + trilho.clientWidth >= trilho.scrollWidth - 4;
    };
    var esperando = false;
    trilho.addEventListener('scroll', function () { if (!esperando) { esperando = true; requestAnimationFrame(function () { esperando = false; marca(); }); } }, { passive: true });
    addEventListener('resize', marca); marca();

    /* vídeo: toca sem som e em loop só enquanto aparece na tela; o botão pausa e retoma */
    var v = g.querySelector('video'), pausa = g.querySelector('.gal-pausa'), parado = false;
    if (v) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting && !parado) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
        }, { threshold: 0.35 }).observe(v);
      }
      if (pausa) pausa.addEventListener('click', function () {
        parado = !v.paused ? true : false;
        if (parado) v.pause(); else { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        pausa.setAttribute('aria-pressed', parado ? 'true' : 'false');
        pausa.setAttribute('aria-label', parado ? 'Tocar o vídeo' : 'Pausar o vídeo');
      });
    }
  });
})();

