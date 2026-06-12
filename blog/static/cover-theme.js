(function () {
  var cache = new WeakMap();

  function rgbToPageBg(r, g, b) {
    var rn = r / 255;
    var gn = g / 255;
    var bn = b / 255;
    var max = Math.max(rn, gn, bn);
    var min = Math.min(rn, gn, bn);
    var h = 0;
    var s = 0;
    var l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
      else if (max === gn) h = ((bn - rn) / d + 2) * 60;
      else h = ((rn - gn) / d + 4) * 60;
    }
    s = Math.min(55, Math.max(18, s * 100 + 8));
    l = Math.min(92, Math.max(84, l * 100 + 14));
    return "hsl(" + Math.round(h) + ", " + Math.round(s) + "%, " + Math.round(l) + "%)";
  }

  function sampleImage(img, callback) {
    if (!img || !img.naturalWidth) {
      if (img) {
        img.addEventListener("load", function () { sampleImage(img, callback); }, { once: true });
      }
      return;
    }
    if (cache.has(img)) {
      callback(cache.get(img));
      return;
    }
    try {
      var canvas = document.createElement("canvas");
      var size = 40;
      canvas.width = size;
      canvas.height = size;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);
      var data = ctx.getImageData(0, 0, size, size).data;
      var r = 0;
      var g = 0;
      var b = 0;
      var n = 0;
      for (var i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }
      if (!n) {
        callback(null);
        return;
      }
      var bg = rgbToPageBg(Math.round(r / n), Math.round(g / n), Math.round(b / n));
      cache.set(img, bg);
      callback(bg);
    } catch (e) {
      callback(null);
    }
  }

  function setPageBg(bg) {
    if (!bg) return;
    document.documentElement.style.setProperty("--bg", bg);
    document.documentElement.style.setProperty("--surface", "color-mix(in srgb, " + bg + " 55%, #fffdf9)");
    document.documentElement.style.setProperty("--border", "color-mix(in srgb, " + bg + " 70%, #c4b8a8)");
  }

  window.CoverTheme = {
    sampleImage: sampleImage,
    setPageBg: setPageBg,
  };
})();
