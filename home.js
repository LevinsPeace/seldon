/* Overview showpiece: Lorenz attractor hero + domain network hover. Plain JS, no libraries. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Lorenz: two paths a hair apart; pointer nudges one (sensitive dependence) ---- */
  var cv = document.getElementById('lorenz');
  if (cv) {
    var ctx = cv.getContext('2d'), W, H, sc, ox, oy, theta = 0.6, raf = 0, running = false;
    var S = 10, R = 28, B = 8 / 3, DT = 0.005, N = 1600, GROUPS = 16;
    var A = { c: '244,137,74', p: new Float32Array(N * 3), n: 0, s: [1, 1, 20] };
    var Bt = { c: '111,208,192', p: new Float32Array(N * 3), n: 0, s: [1.001, 1, 20] };
    function f(s, o) { o[0] = S * (s[1] - s[0]); o[1] = s[0] * (R - s[2]) - s[1]; o[2] = s[0] * s[1] - B * s[2]; }
    var k1 = [0, 0, 0], k2 = [0, 0, 0], k3 = [0, 0, 0], k4 = [0, 0, 0], t = [0, 0, 0];
    function step(tr) {
      var s = tr.s, i;
      f(s, k1); for (i = 0; i < 3; i++) t[i] = s[i] + k1[i] * DT / 2;
      f(t, k2); for (i = 0; i < 3; i++) t[i] = s[i] + k2[i] * DT / 2;
      f(t, k3); for (i = 0; i < 3; i++) t[i] = s[i] + k3[i] * DT;
      f(t, k4); for (i = 0; i < 3; i++) s[i] += DT * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) / 6;
      var idx = (tr.n % N) * 3; tr.p[idx] = s[0]; tr.p[idx + 1] = s[1]; tr.p[idx + 2] = s[2]; tr.n++;
    }
    function size() {
      var dpr = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var wide = W >= 900;
      sc = Math.min(H * 0.86 / 50, (W * (wide ? 0.5 : 1.3)) / 48);
      ox = wide ? W * 0.70 : W * 0.5; oy = H * 0.52;
    }
    function draw(tr) {
      var c = Math.cos(theta), s = Math.sin(theta), len = Math.min(tr.n, N), per = Math.ceil(len / GROUPS);
      var first = tr.n > N ? tr.n % N : 0, g, i, j, x, y, px, py, have;
      ctx.lineWidth = 1.15; ctx.lineCap = 'round';
      for (g = 0; g < GROUPS; g++) {
        ctx.beginPath(); have = false;
        for (j = g * per; j < Math.min(len, (g + 1) * per + 1); j++) {
          i = ((first + j) % N) * 3;
          x = ox + (tr.p[i] * c - tr.p[i + 1] * s) * sc; y = oy - (tr.p[i + 2] - 25) * sc;
          if (have) ctx.lineTo(x, y); else ctx.moveTo(x, y); have = true;
        }
        ctx.strokeStyle = 'rgba(' + tr.c + ',' + (0.06 + 0.8 * Math.pow((g + 1) / GROUPS, 2.2)).toFixed(3) + ')';
        ctx.stroke();
      }
      if (len) { // bright head
        i = ((first + len - 1) % N) * 3; x = ox + (tr.p[i] * c - tr.p[i + 1] * s) * sc; y = oy - (tr.p[i + 2] - 25) * sc;
        ctx.fillStyle = 'rgba(' + tr.c + ',1)'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 6.283); ctx.fill();
      }
    }
    function frame() {
      for (var k = 0; k < 2; k++) { step(A); step(Bt); }
      theta += 0.0007; ctx.clearRect(0, 0, W, H); draw(A); draw(Bt);
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!running && !reduce) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    size(); for (var w = 0; w < 600; w++) { step(A); step(Bt); }  // settle onto the attractor
    if (reduce) { for (w = 0; w < N; w++) { step(A); step(Bt); } ctx.clearRect(0, 0, W, H); draw(A); draw(Bt); }
    addEventListener('resize', function () { size(); if (reduce) { ctx.clearRect(0, 0, W, H); draw(A); draw(Bt); } });
    new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(cv);
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    cv.parentNode.addEventListener('pointermove', function (e) { // tiny nudge to path B
      if (reduce) return; var r = cv.getBoundingClientRect();
      Bt.s[0] += ((e.clientX - r.left) / r.width - 0.5) * 0.04; Bt.s[1] += ((e.clientY - r.top) / r.height - 0.5) * 0.04;
    });
  }

  /* ---- Network: highlight a node's threads ---- */
  var net = document.querySelector('svg.net');
  if (net) {
    var edges = [].slice.call(net.querySelectorAll('.edge'));
    function hl(n, on) { edges.forEach(function (e) { var hit = e.dataset.a === n || e.dataset.b === n; e.classList.toggle('on', on && hit); }); net.classList.toggle('hl', on); }
    [].forEach.call(net.querySelectorAll('.node'), function (nd) {
      var n = nd.dataset.n;
      ['mouseenter', 'focus'].forEach(function (ev) { nd.addEventListener(ev, function () { hl(n, true); nd.parentNode.appendChild(nd); }); });
      ['mouseleave', 'blur'].forEach(function (ev) { nd.addEventListener(ev, function () { hl(n, false); }); });
    });
  }
})();
