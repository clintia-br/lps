/* Landing pages de especialidade · Clínica Mais Vida (v2, 29/09/2026) */
(function () {
  var cfg = window.LP || {};
  var emProducao = !/^(localhost|127\.|\[::1\])/.test(location.hostname) && location.protocol !== 'file:';

  /* títulos: quebra em palavras para entrarem uma a uma */
  document.querySelectorAll('.h2').forEach(function (h) {
    if (h.querySelector('.w')) return;
    var i = 0;
    (function quebra(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span'); w.className = 'w';
            var s = document.createElement('span'); s.textContent = p; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) { quebra(n); }
      });
    })(h);
    if (!h.closest('.reveal')) h.classList.add('reveal-h');
  });

  /* ícones dos benefícios: cada traço desenha sozinho */
  document.querySelectorAll('.tile > .ico > *').forEach(function (p) { p.setAttribute('pathLength', '1'); });

  /* revelar ao rolar: checagem direta da posição (IntersectionObserver não enxerga elemento com
     clip-path fechado e perde elementos em rolagem rápida) */
  var pendentes = Array.prototype.slice.call(document.querySelectorAll('.reveal, .reveal-h, .steps, .rimg, .tile'));
  function revelar() {
    if (!pendentes.length) return;
    var lim = innerHeight * 0.92;
    pendentes = pendentes.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < lim && r.bottom > 0) { el.classList.add('is-in'); return false; }
      if (r.bottom <= 0) { el.classList.add('is-in'); return false; }   /* passou direto por cima */
      return true;
    });
  }

  /* números que contam */
  function contar(el) {
    var fim = parseFloat(el.getAttribute('data-count'));
    var casas = parseInt(el.getAttribute('data-dec') || '0', 10);
    var inicio = null, dur = 1500;
    function passo(t) {
      if (!inicio) inicio = t;
      var p = Math.min(1, (t - inicio) / dur);
      var v = fim * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) { contar(e.target); io2.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (n) { io2.observe(n); });
  }

  /* rolagem: topo, barra de progresso, botão flutuante e paralaxe */
  var top = document.querySelector('.top');
  var barra = document.querySelector('.progress');
  var fab = document.querySelector('.fab');
  var par = Array.prototype.slice.call(document.querySelectorAll('[data-par]'));
  var desk = window.matchMedia('(min-width: 981px)');
  var pedido = false, dicaMostrada = false;
  function quadro() {
    pedido = false;
    revelar();
    var y = window.scrollY || 0, h = document.documentElement.scrollHeight - innerHeight;
    if (top) top.classList.toggle('is-stuck', y > 12);
    if (barra) barra.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    if (fab) {
      fab.classList.toggle('is-on', y > 420);
      if (y > 420 && !dicaMostrada) {
        dicaMostrada = true; fab.classList.add('hint');
        setTimeout(function () { fab.classList.remove('hint'); }, 3800);
      }
    }
    if (desk.matches) {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) return;
        var f = parseFloat(el.getAttribute('data-par')) || 0.08;
        var c = (r.top + r.height / 2 - innerHeight / 2);
        el.style.translate = '0 ' + (-c * f).toFixed(1) + 'px';
      });
    }
  }
  window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(quadro); } }, { passive: true });
  window.addEventListener('resize', quadro);
  window.addEventListener('load', quadro);
  quadro();

  /* vídeo real: só toca quando está na tela */
  document.querySelectorAll('video[data-auto]').forEach(function (v) {
    v.muted = true;
    if (!('IntersectionObserver' in window)) { v.play().catch(function () {}); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) v.play().catch(function () {}); else v.pause(); });
    }, { threshold: 0.2 }).observe(v);
  });

  /* origem (UTM) e registro do clique no WhatsApp */
  function registrar(unidade, lugar) {
    if (!emProducao) return;
    var dados = { especialidade: cfg.slug, unidade: unidade, posicao: lugar };
    try {
      if (window.gtag) {
        window.gtag('event', 'clique_whatsapp', dados);
        if (cfg.conversaoGoogle) window.gtag('event', 'conversion', { send_to: cfg.conversaoGoogle });
      }
      if (window.fbq) window.fbq('track', 'Contact', dados);
    } catch (e) {}
  }

  /* escolha de unidade */
  var sheet = document.getElementById('unidade');
  var ultimoFoco = null;
  function abrir(lugar) {
    if (!sheet) return;
    ultimoFoco = document.activeElement;
    sheet.setAttribute('data-lugar', lugar || '');
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var primeiro = sheet.querySelector('.opt');
    if (primeiro) setTimeout(function () { primeiro.focus(); }, 60);
  }
  function fechar() {
    if (!sheet || !sheet.classList.contains('is-open')) return;
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  document.querySelectorAll('[data-abrir]').forEach(function (b) {
    b.addEventListener('click', function (ev) { ev.preventDefault(); abrir(b.getAttribute('data-abrir')); });
  });
  document.querySelectorAll('[data-fechar]').forEach(function (b) { b.addEventListener('click', fechar); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') fechar(); });
  document.querySelectorAll('a[data-unidade]').forEach(function (a) {
    a.addEventListener('click', function () {
      var lugar = a.closest('.sheet') ? (sheet.getAttribute('data-lugar') || 'sheet') : (a.getAttribute('data-lugar') || 'pagina');
      registrar(a.getAttribute('data-unidade'), lugar);
    });
  });

  /* aviso de cookies */
  var ck = document.querySelector('.cookie');
  if (ck) {
    var ok = null;
    try { ok = localStorage.getItem('mv_cookie_consent'); } catch (e) {}
    if (!ok) ck.classList.add('is-on');
    var bt = ck.querySelector('button');
    if (bt) bt.addEventListener('click', function () {
      try { localStorage.setItem('mv_cookie_consent', '1'); } catch (e) {}
      ck.classList.remove('is-on');
    });
  }
})();
