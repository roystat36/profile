/* =========================================================
   Shared interactive layer for every page.
   Each feature only runs if its elements exist on the page.
   ========================================================= */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var root = document.documentElement;

    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
    function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

    /* ---------- Nav: theme toggle + mobile menu ---------- */
    var nav = $("nav");
    if (nav) {
        var menuBtn = document.createElement("button");
        menuBtn.className = "nav-btn menu-toggle";
        menuBtn.setAttribute("aria-label", "Toggle menu");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.textContent = "☰";
        menuBtn.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            menuBtn.setAttribute("aria-expanded", String(open));
            menuBtn.textContent = open ? "✕" : "☰";
        });
        nav.insertBefore(menuBtn, nav.firstChild);

        var themeBtn = document.createElement("button");
        themeBtn.className = "nav-btn theme-toggle";
        themeBtn.setAttribute("aria-label", "Toggle dark mode");
        var setThemeIcon = function () {
            themeBtn.textContent = root.dataset.theme === "dark" ? "☀" : "☾";
        };
        setThemeIcon();
        themeBtn.addEventListener("click", function () {
            root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
            try { localStorage.setItem("theme", root.dataset.theme); } catch (e) { /* storage blocked */ }
            setThemeIcon();
            document.dispatchEvent(new Event("themechange"));
        });
        nav.appendChild(themeBtn);
    }

    /* ---------- Scroll progress, sticky-nav shadow, back-to-top, timeline lines ---------- */
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    document.body.appendChild(progress);

    var topBtn = document.createElement("button");
    topBtn.className = "back-to-top";
    topBtn.setAttribute("aria-label", "Back to top");
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0 }); });
    document.body.appendChild(topBtn);

    var timelines = $all(".timeline");
    var ticking = false;
    function onScroll() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var y = window.scrollY;
        progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
        if (nav) nav.classList.toggle("scrolled", y > 10);
        topBtn.classList.toggle("show", y > 500);
        timelines.forEach(function (t) {
            var r = t.getBoundingClientRect();
            var p = (window.innerHeight * 0.85 - r.top) / r.height;
            t.style.setProperty("--line-progress", Math.max(0, Math.min(1, p)).toFixed(3));
        });
        ticking = false;
    }
    window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* ---------- Chips: turn "A • B • C" text into pill tags ---------- */
    $all("[data-chips]").forEach(function (el) {
        var sep = el.getAttribute("data-chips") || ",";
        var items = el.textContent.split(sep).map(function (s) { return s.trim(); }).filter(Boolean);
        var seen = {};
        var list = document.createElement("span");
        list.className = "chips";
        items.forEach(function (txt) {
            if (seen[txt]) return; // the source lists contain the odd duplicate
            seen[txt] = true;
            var c = document.createElement("span");
            c.className = "chip";
            c.textContent = txt;
            list.appendChild(c);
        });
        el.replaceWith(list);
    });

    /* ---------- Reveal on scroll ---------- */
    var revealTargets = $all([
        "main h2", ".intro p", ".right-column figure", ".stat",
        ".research > .research-details", ".pub", ".project",
        ".page-education .education-details",
        ".page-experience .experience-details > ul > li", ".membership li",
        ".page-awards .experience-details > ul > li",
        ".page-webapps .education-details", ".social-icons"
    ].join(","));

    if ("IntersectionObserver" in window && !reduceMotion) {
        revealTargets.forEach(function (el) { el.classList.add("reveal"); });
        var io = new IntersectionObserver(function (entries) {
            // Stagger the elements that enter the viewport together
            entries.filter(function (e) { return e.isIntersecting; }).forEach(function (e, i) {
                var el = e.target;
                el.style.setProperty("--reveal-delay", Math.min(i * 0.08, 0.5) + "s");
                el.classList.add("visible");
                io.unobserve(el);
                // Drop the delay afterwards so hover transitions stay snappy
                setTimeout(function () { el.style.removeProperty("--reveal-delay"); }, 1200);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        revealTargets.forEach(function (el) { io.observe(el); });
    } else {
        revealTargets.forEach(function (el) { el.classList.add("visible"); });
    }

    /* ---------- Count-up numbers ---------- */
    var counters = $all("[data-count]");
    function runCounter(el) {
        var target = parseFloat(el.getAttribute("data-count"));
        if (reduceMotion) { el.textContent = target; return; }
        var start = performance.now(), dur = 1400;
        (function frame(now) {
            var t = Math.min(1, (now - start) / dur);
            var eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased);
            if (t < 1) requestAnimationFrame(frame);
        })(start);
    }
    if (counters.length) {
        if ("IntersectionObserver" in window) {
            var cio = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
                });
            }, { threshold: 0.6 });
            counters.forEach(function (c) { cio.observe(c); });
        } else {
            counters.forEach(runCounter);
        }
    }

    /* ---------- Typewriter tagline ---------- */
    var typed = $(".typed[data-words]");
    if (typed) {
        var words = typed.getAttribute("data-words").split("|");
        if (reduceMotion) {
            typed.textContent = words[0];
        } else {
            var wi = 0, ci = 0, deleting = false;
            (function tick() {
                var w = words[wi];
                ci += deleting ? -1 : 1;
                typed.textContent = w.slice(0, ci);
                var delay = deleting ? 35 : 75;
                if (!deleting && ci === w.length) { deleting = true; delay = 1800; }
                else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 350; }
                setTimeout(tick, delay);
            })();
        }
    }

    /* ---------- 3D tilt on hover ---------- */
    if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
        $all("[data-tilt]").forEach(function (el) {
            var max = parseFloat(el.getAttribute("data-tilt")) || 8;
            el.addEventListener("mousemove", function (e) {
                var r = el.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width - 0.5;
                var y = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform = "perspective(700px) rotateX(" + (-y * max) + "deg) rotateY(" + (x * max) + "deg) translateY(-4px)";
            });
            el.addEventListener("mouseleave", function () { el.style.transform = ""; });
        });
    }

    /* ---------- Home: Galton board ---------- */
    var galton = $("#galton");
    if (galton && galton.getContext) {
        var ctx = galton.getContext("2d");
        var W = 260, H = 190, dpr = window.devicePixelRatio || 1;
        galton.width = W * dpr;
        galton.height = H * dpr;
        ctx.scale(dpr, dpr);

        var ROWS = 10, DX = 16, DY = 8.5, TOP = 12, CX = W / 2;
        var BIN_TOP = TOP + ROWS * DY + 6, BIN_BOTTOM = H - 4, UNIT = 1.6;
        var bins, balls, total, spawnTimer = 0, burst = 0, running = true;
        var colors = {};
        function readColors() {
            colors.accent = cssVar("--accent");
            colors.peg = cssVar("--text-muted");
            colors.curve = cssVar("--text");
        }
        readColors();
        document.addEventListener("themechange", function () { readColors(); if (!running) draw(); });

        function reset() {
            bins = new Array(ROWS + 1).fill(0);
            balls = [];
            total = 0;
        }
        reset();

        function xOf(r, k) { return CX + (k - r / 2) * DX; }
        var binom = (function () {
            var out = [], c = 1;
            for (var k = 0; k <= ROWS; k++) { out.push(c / Math.pow(2, ROWS)); c = c * (ROWS - k) / (k + 1); }
            return out;
        })();

        function spawn() { balls.push({ r: 0, k: 0, nk: Math.random() < 0.5 ? 0 : 1, t: 0 }); }

        function step() {
            spawnTimer++;
            if (burst > 0 && spawnTimer % 2 === 0) { spawn(); burst--; }
            else if (spawnTimer % 7 === 0) spawn();

            for (var i = balls.length - 1; i >= 0; i--) {
                var b = balls[i];
                if (b.fallY !== undefined) {
                    // past the last peg: drop straight down onto the pile
                    b.vy += 0.35;
                    b.fallY += b.vy;
                    if (b.fallY >= BIN_BOTTOM - bins[b.k] * UNIT - 2) {
                        bins[b.k]++; total++;
                        balls.splice(i, 1);
                    }
                    continue;
                }
                b.t += 0.16;
                if (b.t >= 1) {
                    b.r++; b.k = b.nk; b.t = 0;
                    if (b.r >= ROWS) { b.fallY = TOP + ROWS * DY - 1; b.vy = 1; continue; }
                    b.nk = b.k + (Math.random() < 0.5 ? 0 : 1);
                }
            }
            var tallest = Math.max.apply(null, bins) * UNIT;
            if (tallest > BIN_BOTTOM - BIN_TOP - 2) reset();
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            // pegs
            ctx.fillStyle = colors.peg;
            ctx.globalAlpha = 0.45;
            for (var r = 0; r < ROWS; r++) {
                for (var k = 0; k <= r; k++) {
                    ctx.beginPath();
                    ctx.arc(xOf(r, k), TOP + r * DY + 3, 1.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
            // bins
            ctx.fillStyle = colors.accent;
            for (var j = 0; j <= ROWS; j++) {
                var h = bins[j] * UNIT;
                ctx.globalAlpha = 0.85;
                ctx.fillRect(xOf(ROWS, j) - DX / 2 + 1.5, BIN_BOTTOM - h, DX - 3, h);
            }
            ctx.globalAlpha = 1;
            // theoretical binomial curve
            if (total > 20) {
                ctx.strokeStyle = colors.curve;
                ctx.lineWidth = 1.2;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                for (var q = 0; q <= ROWS; q++) {
                    var y = BIN_BOTTOM - binom[q] * total * UNIT;
                    if (q === 0) ctx.moveTo(xOf(ROWS, q), y); else ctx.lineTo(xOf(ROWS, q), y);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }
            // balls
            ctx.fillStyle = colors.accent;
            balls.forEach(function (b) {
                var x, y;
                if (b.fallY !== undefined) { x = xOf(ROWS, b.k); y = b.fallY; }
                else {
                    x = xOf(b.r, b.k) + (xOf(b.r + 1, b.nk) - xOf(b.r, b.k)) * b.t;
                    y = TOP + (b.r + b.t) * DY - Math.sin(Math.PI * b.t) * 4 - 1;
                }
                ctx.beginPath();
                ctx.arc(x, y, 2.6, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        if (reduceMotion) {
            for (var n = 0; n < 250; n++) {
                var k = 0;
                for (var r2 = 0; r2 < ROWS; r2++) k += Math.random() < 0.5 ? 0 : 1;
                bins[k]++; total++;
            }
            running = false;
            draw();
        } else {
            var visible = true;
            if ("IntersectionObserver" in window) {
                new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(galton);
            }
            (function loop() {
                if (visible && !document.hidden) { step(); draw(); }
                requestAnimationFrame(loop);
            })();
            galton.addEventListener("click", function () { burst += 40; });
        }
    }

    /* ---------- Research: search, filter, copy citation ---------- */
    var pubSearch = $("#pub-search");
    if (pubSearch) {
        var pubs = $all(".pub");
        var groups = $all(".pub-group");
        var filterBtns = $all(".toolbar .filter-btn");
        var noResults = $(".no-results");
        var labels = { journal: "Journal article", conference: "Conference talk", poster: "Poster" };
        var currentFilter = "all";

        pubs.forEach(function (p) {
            var cite = $(".cite", p);
            p._html = cite.innerHTML;
            p._text = cite.textContent.replace(/\s+/g, " ").trim();
            var meta = document.createElement("div");
            meta.className = "meta";
            meta.innerHTML = '<span class="badge"></span><span class="badge"></span>' +
                '<button type="button" class="copy-btn">Copy citation</button>';
            meta.children[0].textContent = labels[p.dataset.type] || p.dataset.type;
            meta.children[1].textContent = p.dataset.year;
            if (!p.dataset.year) meta.children[1].remove();
            p.appendChild(meta);
            $(".copy-btn", p).addEventListener("click", function (e) {
                var btn = e.currentTarget;
                var done = function () {
                    btn.textContent = "Copied ✓";
                    btn.classList.add("copied");
                    setTimeout(function () { btn.textContent = "Copy citation"; btn.classList.remove("copied"); }, 1600);
                };
                if (navigator.clipboard) navigator.clipboard.writeText(p._text).then(done, function () {});
            });
        });

        filterBtns.forEach(function (b) {
            var f = b.dataset.filter;
            var n = f === "all" ? pubs.length : pubs.filter(function (p) { return p.dataset.type === f; }).length;
            var c = document.createElement("span");
            c.className = "count";
            c.textContent = n;
            b.appendChild(c);
            b.addEventListener("click", function () {
                currentFilter = f;
                filterBtns.forEach(function (x) { x.classList.toggle("active", x === b); });
                apply();
            });
        });

        function highlight(node, q) {
            // Wrap case-insensitive matches of q inside text nodes with <mark>
            var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            var texts = [];
            while (walker.nextNode()) texts.push(walker.currentNode);
            texts.forEach(function (t) {
                var lower = t.nodeValue.toLowerCase(), idx = lower.indexOf(q);
                if (idx < 0) return;
                var frag = document.createDocumentFragment(), last = 0;
                while (idx >= 0) {
                    frag.appendChild(document.createTextNode(t.nodeValue.slice(last, idx)));
                    var m = document.createElement("mark");
                    m.textContent = t.nodeValue.slice(idx, idx + q.length);
                    frag.appendChild(m);
                    last = idx + q.length;
                    idx = lower.indexOf(q, last);
                }
                frag.appendChild(document.createTextNode(t.nodeValue.slice(last)));
                t.parentNode.replaceChild(frag, t);
            });
        }

        function apply() {
            var q = pubSearch.value.trim().toLowerCase();
            var shown = 0;
            pubs.forEach(function (p) {
                var cite = $(".cite", p);
                cite.innerHTML = p._html;
                var ok = (currentFilter === "all" || p.dataset.type === currentFilter) &&
                         (!q || p._text.toLowerCase().indexOf(q) >= 0);
                p.hidden = !ok;
                if (ok) { shown++; p.classList.add("visible"); if (q) highlight(cite, q); }
            });
            groups.forEach(function (g) {
                g.hidden = !$all(".pub", g).some(function (p) { return !p.hidden; });
            });
            if (noResults) noResults.classList.toggle("show", shown === 0);
        }
        pubSearch.addEventListener("input", apply);
    }

    /* ---------- Gallery: category filter + lightbox navigation ---------- */
    var galleryItems = $all(".gallery-item");
    if (galleryItems.length) {
        $all(".gallery-filters .filter-btn").forEach(function (b, _, all) {
            b.addEventListener("click", function () {
                var f = b.dataset.filter;
                all.forEach(function (x) { x.classList.toggle("active", x === b); });
                galleryItems.forEach(function (it, i) {
                    var show = f === "all" || it.dataset.cat === f;
                    it.classList.toggle("hide", !show);
                    it.classList.remove("pop");
                    if (show) {
                        void it.offsetWidth; // restart the animation
                        it.style.animationDelay = (i % 12) * 0.03 + "s";
                        it.classList.add("pop");
                    }
                });
            });
        });

        var visibleIds = function () {
            return galleryItems.filter(function (it) { return !it.classList.contains("hide"); })
                               .map(function (it) { return it.getAttribute("href"); });
        };
        var go = function (dir) {
            var ids = visibleIds(), i = ids.indexOf(location.hash);
            if (i < 0 || !ids.length) return;
            location.replace(ids[(i + dir + ids.length) % ids.length]);
        };
        var isOpen = function () { return /^#lb\d+$/.test(location.hash) && !!$(location.hash); };

        $all(".lightbox").forEach(function (lb) {
            [["lb-prev", "‹", -1], ["lb-next", "›", 1]].forEach(function (d) {
                var s = document.createElement("span");
                s.className = "lb-nav " + d[0];
                s.setAttribute("role", "button");
                s.setAttribute("aria-label", d[2] < 0 ? "Previous photo" : "Next photo");
                s.textContent = d[1];
                s.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); go(d[2]); });
                lb.appendChild(s);
            });
            var counter = document.createElement("div");
            counter.className = "lb-counter";
            lb.appendChild(counter);

            var sx = null;
            lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
            lb.addEventListener("touchend", function (e) {
                if (sx === null) return;
                var dx = e.changedTouches[0].clientX - sx;
                if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
                sx = null;
            });
        });

        var syncLightbox = function () {
            var open = isOpen();
            root.classList.toggle("lb-open", open);
            if (open) {
                var ids = visibleIds(), i = ids.indexOf(location.hash);
                var c = $(".lb-counter", $(location.hash));
                if (c) c.textContent = i >= 0 ? (i + 1) + " / " + ids.length : "";
            }
        };
        window.addEventListener("hashchange", syncLightbox);
        syncLightbox();

        document.addEventListener("keydown", function (e) {
            if (!isOpen()) return;
            if (e.key === "ArrowRight") go(1);
            else if (e.key === "ArrowLeft") go(-1);
            else if (e.key === "Escape") location.replace("#");
        });
    }
})();
