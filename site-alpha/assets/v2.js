/* Policlínica Alpha · v2 (ClintIA, 02/10/2026). Sem biblioteca: vídeo da capa, cortina das fotos, parallax leve,
   entrada dos blocos dos artigos e barra de leitura. Não mexe em nenhum texto. */
(function () {
  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;

  function aoEntrar(els, cb, margem) {
    if (!els.length) return;
    if (!temIO) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { cb(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: margem || '0px 0px -60px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* fotos: cortina + zoom que assenta */
  /* o Chrome não "vê" entrar um elemento com clip-path fechado: observa o pai e abre a foto */
  [].slice.call(document.querySelectorAll('.v2-foto')).forEach(function (f) {
    aoEntrar([f.parentElement], function () { f.classList.add('in'); }, '0px 0px -12% 0px');
  });

  /* exames: cada item entra um pouco depois do outro */
  [].slice.call(document.querySelectorAll('.exams-list .exam-item')).forEach(function (el, i) { el.style.setProperty('--i', i); });

  /* artigos: blocos entram ao rolar + barra de leitura */
  if (document.body.classList.contains('v2-artigo')) {
    var blocos = [].slice.call(document.querySelectorAll('.article-body > h2, .article-body > h3, .article-body > ul, .article-body > ol, .banner-inline, .faq-section details, .footer-cta-inner'));
    blocos.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) el.classList.add('v2-rv');
    });
    aoEntrar(blocos.filter(function (el) { return el.classList.contains('v2-rv'); }), function (el) { el.classList.add('in'); }, '0px 0px -40px 0px');
    var barra = document.createElement('div');
    barra.className = 'v2-progresso';
    barra.setAttribute('aria-hidden', 'true');
    document.body.appendChild(barra);
    var corpo = document.querySelector('.article-body');
    var lendo = false;
    var mede = function () {
      lendo = false;
      if (!corpo) return;
      var r = corpo.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
      barra.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    };
    window.addEventListener('scroll', function () { if (!lendo) { lendo = true; requestAnimationFrame(mede); } }, { passive: true });
    mede();
  }

  /* vídeo da capa: só baixa no desktop/tablet (>= 768 px) e sem economia de dados; no celular fica o poster */
  var v = document.querySelector('.v2-hero-video');
  if (v) {
    var con = navigator.connection || {};
    var grande = window.matchMedia && matchMedia('(min-width: 768px)').matches;
    var botao = document.querySelector('.v2-vpausa');
    if (grande && !con.saveData) {
      v.src = v.getAttribute('data-src');
      v.muted = true;
      var tocar = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
      tocar();
      if (botao) {
        botao.hidden = false;
        botao.addEventListener('click', function () {
          if (v.paused) { tocar(); botao.classList.remove('pausado'); botao.setAttribute('aria-label', 'Pausar o vídeo'); botao.dataset.manual = ''; }
          else { v.pause(); botao.classList.add('pausado'); botao.setAttribute('aria-label', 'Tocar o vídeo'); botao.dataset.manual = '1'; }
        });
      }
      if (temIO) {   /* pausa fora da tela (economiza bateria) */
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (botao && botao.dataset.manual === '1') return;
            if (e.isIntersecting) tocar(); else v.pause();
          });
        }).observe(v);
      }
    }
  }

  /* parallax leve na capa (desligado com "menos movimento") */
  var px = [].slice.call(document.querySelectorAll('[data-v2-parallax]'));
  if (px.length && !reduz && window.matchMedia('(min-width: 981px)').matches) {
    var pendente = false;
    var move = function () {
      pendente = false;
      var y = window.scrollY || window.pageYOffset;
      if (y > window.innerHeight * 1.2) return;
      px.forEach(function (el) {
        var f = parseFloat(el.getAttribute('data-v2-parallax')) || 0;
        var base = el.classList.contains('v2-hero-fachada') ? ' rotate(2.5deg)' : '';
        el.style.transform = 'translate3d(0,' + (y * f).toFixed(1) + 'px,0)' + base;
      });
    };
    window.addEventListener('scroll', function () { if (!pendente) { pendente = true; requestAnimationFrame(move); } }, { passive: true });
  }
})();
