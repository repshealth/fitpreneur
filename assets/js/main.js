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

  /* Forms (newsletter + contact) -> FormSubmit AJAX endpoint */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  document.querySelectorAll("form.js-form").forEach(function (form) {
    var status = form.querySelector(".nl-status");
    var btn = form.querySelector("button[type=submit]");
    form.querySelectorAll("select").forEach(function (sel) {
      sel.addEventListener("change", function () { sel.classList.toggle("has-value", !!sel.value); });
    });
    function fail(msg, field) {
      status.textContent = msg; status.className = "nl-status err";
      if (field) field.focus();
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "nl-status"; status.textContent = "";
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = typeof v === "string" ? v.trim() : v; });
      if (data._honey) return; // bot
      if (form.name && !data.name) return fail("Please add your name.", form.querySelector("[name=name]"));
      if (!emailRe.test(data.email || "")) return fail("Please enter a valid email address.", form.querySelector("[name=email]"));
      var svc = form.querySelector("select[name=service]");
      if (svc && !svc.value) return fail("Please choose which service you're interested in.", svc);
      if (data.phone && data.country_code) { data.phone = data.country_code + " " + data.phone; }
      delete data.country_code;
      btn.disabled = true; status.textContent = "Sending...";
      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          var ok = res.ok && String(res.d.success) !== "false";
          if (ok) {
            status.textContent = form.dataset.success || "Thanks, we've got it!";
            status.className = "nl-status ok"; form.reset();
            form.querySelectorAll("select").forEach(function (sel) { sel.classList.remove("has-value"); });
          } else {
            fail("Something went wrong. Please try again, or email james@fitpreneuragency.com.");
          }
        })
        .catch(function () { fail("Network error. Please try again, or email james@fitpreneuragency.com."); })
        .finally(function () { btn.disabled = false; });
    });
  });

  /* About: numbered rows progress line */
  var arWrap = document.querySelector(".about-rows");
  if (arWrap) {
    var arFill = arWrap.querySelector(".ar-fill");
    var arLine = arWrap.querySelector(".ar-line");
    var arRows = Array.prototype.slice.call(arWrap.querySelectorAll(".ar-row"));
    var onAr = function () {
      var rect = arLine.getBoundingClientRect();
      var trigger = window.innerHeight * 0.5;
      var prog = Math.max(0, Math.min(trigger - rect.top, rect.height));
      arFill.style.height = prog + "px";
      arRows.forEach(function (row, i) {
        var num = row.querySelector(".ar-num").getBoundingClientRect();
        row.classList.toggle("is-active", i === 0 || num.top < trigger);
      });
    };
    window.addEventListener("scroll", onAr, { passive: true });
    window.addEventListener("resize", onAr);
    onAr();
  }

  /* Services: draw connector lines from the centre coin to each card */
  var map = document.querySelector(".svc-map");
  if (map) {
    var svg = map.querySelector(".svc-lines");
    var coin = map.querySelector(".svc-coin");
    var svcCards = Array.prototype.slice.call(map.querySelectorAll(".svc-card"));
    var drawLines = function () {
      if (getComputedStyle(svg).display === "none") return;
      var m = map.getBoundingClientRect(), c = coin.getBoundingClientRect();
      var cx = c.left + c.width / 2 - m.left, cy = c.top + c.height / 2 - m.top, r = c.width / 2;
      var paths = svcCards.map(function (card, i) {
        var b = card.getBoundingClientRect();
        var top = b.top - m.top, bottom = b.bottom - m.top, left = b.left - m.left, right = b.right - m.left;
        var midY = top + b.height / 2, off = (i % 2 ? 1 : -1) * 8;
        if (card.classList.contains("c-c")) {
          return "M" + cx + " " + (cy + r) + " V" + top;
        }
        var isLeft = card.classList.contains("c-l"), dir = isLeft ? -1 : 1;
        var edge = isLeft ? right : left;
        if (card.classList.contains("r2")) {
          // straight across, then a short step into the card
          return "M" + (cx + dir * r) + " " + cy + " H" + (edge - dir * 22) + " V" + midY + " H" + edge;
        }
        // leave the coin vertically, then turn into the card
        var startX = cx + dir * (r * 0.45) + off * 0;
        var startY = card.classList.contains("r1") ? cy - r * 0.9 : cy + r * 0.9;
        var elbowX = edge - dir * 18;
        return "M" + startX + " " + startY + " V" + (midY) + " H" + elbowX + " H" + edge;
      });
      svg.setAttribute("viewBox", "0 0 " + m.width + " " + m.height);
      svg.innerHTML = paths.map(function (d) { return '<path d="' + d + '"/>'; }).join("");
    };
    drawLines();
    window.addEventListener("resize", drawLines);
    window.addEventListener("load", drawLines);
  }

  /* About: video modal (only shown when a video URL is set) */
  var playBtn = document.querySelector(".play-btn");
  if (playBtn && playBtn.dataset.video) {
    playBtn.hidden = false;
    var modal = document.createElement("div");
    modal.className = "video-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Video");
    modal.innerHTML = '<button class="vm-close" type="button" aria-label="Close video">&times;</button><div class="vm-inner"></div>';
    document.body.appendChild(modal);
    var inner = modal.querySelector(".vm-inner");
    var closeVideo = function () { modal.classList.remove("is-open"); inner.innerHTML = ""; playBtn.focus(); };
    playBtn.addEventListener("click", function () {
      var url = playBtn.dataset.video;
      inner.innerHTML = /\.(mp4|webm)(\?|$)/i.test(url)
        ? '<video src="' + url + '" controls autoplay playsinline></video>'
        : '<iframe src="' + url + (url.indexOf("?") > -1 ? "&" : "?") + 'autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="FitPreneur video"></iframe>';
      modal.classList.add("is-open");
      modal.querySelector(".vm-close").focus();
    });
    modal.addEventListener("click", function (e) { if (e.target === modal || e.target.classList.contains("vm-close")) closeVideo(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("is-open")) closeVideo(); });
  }
})();
