(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Seeded RNG — deterministic per card so each flight-path
     thumbnail is stable across renders but distinct per seed.
     --------------------------------------------------------- */
  function seededRandom(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function next() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function generatePathPoints(width, height, seed, count) {
    var rand = seededRandom(seed);
    var pad = height * 0.18;
    var points = [];
    for (var i = 0; i <= count; i++) {
      points.push({
        x: (width / count) * i,
        y: pad + rand() * (height - pad * 2)
      });
    }
    return points;
  }

  function tracePath(ctx, points, fraction) {
    fraction = fraction === undefined ? 1 : fraction;
    var totalSegs = points.length - 1;
    var segFloat = totalSegs * fraction;
    var fullSegs = Math.floor(segFloat);
    var partial = segFloat - fullSegs;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i <= fullSegs && i < points.length; i++) {
      var p0 = points[i - 1], p1 = points[i];
      var mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2;
      ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
      ctx.lineTo(p1.x, p1.y);
    }
    if (fullSegs < totalSegs && partial > 0) {
      var a = points[fullSegs], b = points[fullSegs + 1];
      var ex = a.x + (b.x - a.x) * partial;
      var ey = a.y + (b.y - a.y) * partial;
      ctx.lineTo(ex, ey);
    }
    ctx.stroke();

    var last = fullSegs < totalSegs ? {
      x: points[fullSegs].x + (points[fullSegs + 1].x - points[fullSegs].x) * partial,
      y: points[fullSegs].y + (points[fullSegs + 1].y - points[fullSegs].y) * partial
    } : points[points.length - 1];
    return last;
  }

  function drawGrid(ctx, width, height, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    var step = Math.max(28, width / 12);
    for (var x = step; x < width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (var y = step; y < height; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    ctx.restore();
  }

  function fitCanvas(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, width: w, height: h };
  }

  /* ---------------------------------------------------------
     Small thumbnail flight-path renderer (log cards, reel,
     pilot mark). Static draw, no animation loop.
     --------------------------------------------------------- */
  function renderThumb(canvas, seed) {
    var fit = fitCanvas(canvas);
    var ctx = fit.ctx, w = fit.width, h = fit.height;
    ctx.clearRect(0, 0, w, h);

    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#141B20');
    grad.addColorStop(1, '#0D1316');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    drawGrid(ctx, w, h, 'rgba(143,163,166,0.08)');

    var points = generatePathPoints(w, h, seed, 6);
    ctx.strokeStyle = 'rgba(242,134,60,0.85)';
    ctx.lineWidth = 1.75;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(242,134,60,0.55)';
    ctx.shadowBlur = 6;
    var end = tracePath(ctx, points, 1);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#F2863C';
    ctx.beginPath();
    ctx.arc(end.x, end.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ---------------------------------------------------------
     Hero canvas — larger, animated draw-on once, then a slow
     reticle drifting along the path (paused if reduced motion).
     --------------------------------------------------------- */
  function initHeroCanvas() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    var points, w, h, ctx;
    var seed = 7;

    function setup() {
      var fit = fitCanvas(canvas);
      ctx = fit.ctx; w = fit.width; h = fit.height;
      points = generatePathPoints(w, h, seed, 8);
    }

    function paint(fraction, driftT) {
      ctx.clearRect(0, 0, w, h);
      drawGrid(ctx, w, h, 'rgba(143,163,166,0.05)');

      ctx.strokeStyle = 'rgba(242,134,60,0.6)';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(242,134,60,0.5)';
      ctx.shadowBlur = 10;
      var end = tracePath(ctx, points, fraction);
      ctx.shadowBlur = 0;

      if (driftT !== undefined) {
        var pos = pointAtFraction(points, driftT);
        ctx.fillStyle = '#FFC98C';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,201,140,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#FFC98C';
        ctx.beginPath();
        ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function pointAtFraction(pts, t) {
      var totalSegs = pts.length - 1;
      var segFloat = totalSegs * t;
      var i = Math.min(Math.floor(segFloat), totalSegs - 1);
      var local = segFloat - i;
      var a = pts[i], b = pts[i + 1];
      return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
    }

    setup();

    if (reduceMotion) {
      paint(1);
    } else {
      var start = null;
      var drawDuration = 1400;
      function drawOn(ts) {
        if (!start) start = ts;
        var f = Math.min(1, (ts - start) / drawDuration);
        paint(f);
        if (f < 1) requestAnimationFrame(drawOn);
        else driftLoop(ts);
      }
      var driftStart = null;
      var driftDuration = 9000;
      function driftLoop(ts) {
        if (!driftStart) driftStart = ts;
        var t = ((ts - driftStart) % driftDuration) / driftDuration;
        paint(1, t);
        requestAnimationFrame(driftLoop);
      }
      requestAnimationFrame(drawOn);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        setup();
        if (reduceMotion) paint(1);
      }, 150);
    });
  }

  function initReelCanvas() {
    var canvas = document.getElementById('reelCanvas');
    if (!canvas) return;
    renderThumb(canvas, 91);
    window.addEventListener('resize', debounce(function () { renderThumb(canvas, 91); }, 150));
  }

  function initPilotCanvas() {
    var canvas = document.getElementById('pilotCanvas');
    if (!canvas) return;
    renderThumb(canvas, 33);
    window.addEventListener('resize', debounce(function () { renderThumb(canvas, 33); }, 150));
  }

  function initLogThumbs() {
    var cards = document.querySelectorAll('.log-card');
    var canvases = [];
    cards.forEach(function (card) {
      var seed = parseInt(card.getAttribute('data-seed'), 10) || 1;
      var canvas = card.querySelector('canvas');
      if (!canvas) return;
      renderThumb(canvas, seed);
      canvases.push({ canvas: canvas, seed: seed });
    });
    window.addEventListener('resize', debounce(function () {
      canvases.forEach(function (item) { renderThumb(item.canvas, item.seed); });
    }, 150));
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments;
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  /* ---------------------------------------------------------
     Boot screen
     --------------------------------------------------------- */
  function initBoot() {
    var boot = document.getElementById('bootScreen');
    if (!boot) return;
    if (reduceMotion) {
      boot.remove();
      return;
    }
    setTimeout(function () {
      boot.classList.add('is-done');
      setTimeout(function () { boot.remove(); }, 450);
    }, 950);
  }

  /* ---------------------------------------------------------
     Nav: scroll state + mobile toggle
     --------------------------------------------------------- */
  function initNav() {
    var nav = document.getElementById('siteNav');
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('primaryNav');
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          menu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  /* ---------------------------------------------------------
     REC timer
     --------------------------------------------------------- */
  function initRecTimer() {
    var el = document.getElementById('navTimer');
    if (!el || reduceMotion) return;
    var seconds = 0;
    setInterval(function () {
      seconds++;
      var m = Math.floor(seconds / 60);
      var s = seconds % 60;
      el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);
  }

  /* ---------------------------------------------------------
     Hero OSD ambient telemetry drift
     --------------------------------------------------------- */
  function initOsd() {
    if (reduceMotion) return;
    var bat = document.getElementById('osdBat');
    var rssi = document.getElementById('osdRssi');
    var alt = document.getElementById('osdAlt');
    var spd = document.getElementById('osdSpd');
    if (!bat) return;

    var t = 0;
    setInterval(function () {
      t += 1;
      var v = (16.8 - (t % 40) * 0.005).toFixed(1);
      bat.textContent = v + 'V';
      var r = 97 + Math.round(Math.sin(t / 3) * 2);
      rssi.textContent = r + '%';
      var a = (4.2 + Math.sin(t / 5) * 0.6).toFixed(1);
      alt.textContent = a + 'M';
      var s = 148 + Math.round(Math.sin(t / 2.2) * 9);
      spd.textContent = s + 'KM/H';
    }, 1200);
  }

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  function initReveal() {
    var targets = document.querySelectorAll('.log-card, .section-head, .rig-block, .pilot-content, .reel-frame');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      targets.forEach(function (t) { t.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---------------------------------------------------------
     Reel play button — placeholder affordance until a real
     <video>/<iframe> is wired in by the site owner.
     --------------------------------------------------------- */
  function initReelPlay() {
    var btn = document.querySelector('.reel-play');
    if (!btn) return;
    btn.addEventListener('click', function () {
      btn.setAttribute('aria-label', 'Reel-Datei noch nicht hinterlegt');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initBoot();
    initNav();
    initRecTimer();
    initOsd();
    initHeroCanvas();
    initReelCanvas();
    initPilotCanvas();
    initLogThumbs();
    initReveal();
    initReelPlay();
  });
})();
