/* FitPreneur Agency - site interactions */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Header: scrolled state */
  var header = document.querySelector(".site-header");
  function onScrollHeader() { header.classList.toggle("is-scrolled", window.scrollY > 20); }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* Mobile menu */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* Active nav link by section */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav ul a"));
  var sections = links.map(function (a) {
    var id = a.getAttribute("href").slice(1);
    return id === "top" ? document.body : document.getElementById(id);
  });
  function onScrollNav() {
    var pos = window.scrollY + window.innerHeight * 0.35;
    var idx = 0;
    sections.forEach(function (s, i) { if (s && s !== document.body && s.offsetTop <= pos) idx = i; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) idx = links.length - 1;
    links.forEach(function (a, i) { a.classList.toggle("is-active", i === idx); });
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (el.closest(".stats") ? (i % 4) * 90 : 0) + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Stat count-up */
  var statEls = document.querySelectorAll(".stat-num[data-count]");
  function countUp(el) {
    var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || "0", 10);
    var suffix = el.dataset.suffix || "", start = null, dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); so.unobserve(en.target); } });
    }, { threshold: 0.6 });
    statEls.forEach(function (el) { so.observe(el); });
  }

  /* Marquees: duplicate content for a seamless loop */
  if (!reduceMotion) {
    document.querySelectorAll(".marquee").forEach(function (m) {
      var track = m.querySelector(".marquee-track");
      var items = Array.prototype.slice.call(track.children);
      // Make sure one copy is wider than the viewport, then duplicate it
      var minWidth = window.innerWidth * 1.2, guard = 0;
      while (track.scrollWidth < minWidth && guard++ < 6) {
        items.forEach(function (it) { track.appendChild(it.cloneNode(true)); });
      }
      Array.prototype.slice.call(track.children).forEach(function (it) {
        var c = it.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        c.querySelectorAll("a, button").forEach(function (f) { f.tabIndex = -1; });
        track.appendChild(c);
      });
      var speed = parseFloat(m.dataset.speed || "40"); // px per second
      var dur = (track.scrollWidth / 2) / speed;
      track.style.setProperty("--duration", dur + "s");
    });
  }

  /* Timeline progress */
  var timeline = document.querySelector(".timeline");
  var fill = document.querySelector(".tl-fill");
  var tlItems = Array.prototype.slice.call(document.querySelectorAll(".tl-item"));
  function onScrollTimeline() {
    if (!timeline) return;
    var rect = timeline.getBoundingClientRect();
    var trigger = window.innerHeight * 0.55;
    var progress = Math.max(0, Math.min(trigger - rect.top, rect.height));
    fill.style.height = progress + "px";
    var current = -1;
    tlItems.forEach(function (it, i) {
      var top = it.offsetTop + 10;
      var passed = progress >= top;
      it.classList.toggle("is-passed", passed);
      if (passed) current = i;
    });
    tlItems.forEach(function (it, i) { it.classList.toggle("is-current", i === current); });
  }
  window.addEventListener("scroll", onScrollTimeline, { passive: true });
  window.addEventListener("resize", onScrollTimeline);
  onScrollTimeline();

  /* Gold wave lines behind the timeline */
  var canvas = document.querySelector(".waves");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d"), t = 0, running = false, visible = false;
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      var w = canvas.clientWidth, h = canvas.clientHeight, lines = 26;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < lines; i++) {
        var k = i / (lines - 1);
        ctx.beginPath();
        ctx.strokeStyle = "rgba(214, 160, 20," + (0.10 + 0.35 * Math.sin(Math.PI * k)) + ")";
        ctx.lineWidth = 0.7;
        for (var x = 0; x <= w; x += 8) {
          var nx = x / w;
          var yv = h * 0.42
            + Math.sin(nx * 5.2 + t + k * 1.6) * h * 0.13 * (0.4 + k)
            + Math.sin(nx * 2.1 - t * 0.6 + k * 2.4) * h * 0.08
            - Math.pow(nx, 3) * h * 0.38 * k;
          if (x === 0) ctx.moveTo(x, yv); else ctx.lineTo(x, yv);
        }
        ctx.stroke();
      }
    }
    function loop() {
      if (!visible) { running = false; return; }
      t += 0.004; draw(); requestAnimationFrame(loop);
    }
    size(); draw();
    window.addEventListener("resize", function () { size(); draw(); });
    if (!reduceMotion && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !running) { running = true; requestAnimationFrame(loop); }
      }).observe(canvas);
    }
  }

  /* Newsletter form */
  var form = document.querySelector(".nl-form");
  if (form) {
    var status = form.querySelector(".nl-status");
    var btn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "nl-status";
      var name = form.name.value.trim(), email = form.email.value.trim();
      if (!name) { status.textContent = "Please add your name."; status.classList.add("err"); form.name.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = "Please enter a valid email address."; status.classList.add("err"); form.email.focus(); return; }
      btn.disabled = true; status.textContent = "Signing you up...";
      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email, company: form.company.value })
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok) {
            status.textContent = "You're in! Check your inbox for your free value.";
            status.classList.add("ok"); form.reset();
          } else {
            status.textContent = (res.d && res.d.error) || "Something went wrong. Please try again.";
            status.classList.add("err");
          }
        })
        .catch(function () { status.textContent = "Network error. Please try again."; status.classList.add("err"); })
        .finally(function () { btn.disabled = false; });
    });
  }
})();
