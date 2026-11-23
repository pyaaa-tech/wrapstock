/* Seri Lestari Spa — tiny shared helpers used by every scene's timeline.
   Pure DOM prep (no timing): splitting text into letters and preparing
   SVG strokes for draw-on. Everything visible stays a function of timeline time. */
(function () {
  var K = {};
  // Wrap each character of every [data-split] element in <span class="ch">.
  K.split = function (root) {
    (root || document).querySelectorAll("[data-split]").forEach(function (el) {
      if (el.dataset.splitDone) return;
      var t = el.textContent;
      el.setAttribute("aria-label", t);
      el.textContent = "";
      for (var i = 0; i < t.length; i++) {
        var s = document.createElement("span");
        s.className = "ch";
        s.textContent = t[i] === " " ? " " : t[i];
        el.appendChild(s);
      }
      el.dataset.splitDone = "1";
    });
  };
  // Deterministic pseudo-random in [0,1) from an index (no Math.random).
  K.rnd = function (i) {
    var x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  // Hide a stroke so it can be drawn on by tweening strokeDashoffset → 0.
  K.prep = function (els) {
    Array.prototype.forEach.call(els, function (p) {
      var L = Math.ceil(p.getTotalLength()) + 2;
      p.style.strokeDasharray = L + " " + L;
      p.style.strokeDashoffset = L;
    });
    return els;
  };
  window.KIT = K;
})();
