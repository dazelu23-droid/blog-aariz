(function () {
  var detail = document.getElementById("home-detail");
  if (!detail) return;

  var slug = detail.getAttribute("data-home-slug");
  var csrfMeta = document.querySelector('meta[name="csrf-token"]');
  var csrfToken = csrfMeta ? csrfMeta.getAttribute("content") : "";
  var MIN_PUBLIC_RATINGS = 10;

  function apiPost(url, body) {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify(body),
    }).then(function (res) { return res.json(); });
  }

  function escapeText(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function ratingSummaryHtml(avg, count) {
    if (count >= MIN_PUBLIC_RATINGS) {
      var full = Math.round(avg);
      var stars = "";
      for (var i = 1; i <= 5; i++) {
        stars += '<span class="star' + (i <= full ? " filled" : "") + '">★</span>';
      }
      return '<span class="stars stars-lg" aria-label="' + avg.toFixed(1) + ' out of 5 stars">' + stars + '</span> ' +
        '<span class="rating-text">' + avg.toFixed(1) + " average from " + count + " rating" + (count === 1 ? "" : "s") + "</span>";
    }
    if (count === 0) {
      return '<span class="rating-pending"><span class="rating-text">Average shown after ' + MIN_PUBLIC_RATINGS + " ratings</span></span>";
    }
    return '<span class="rating-pending"><span class="rating-text">' + count + " of " + MIN_PUBLIC_RATINGS + " ratings for average</span></span>";
  }

  var coverThemeApi = window.CoverTheme || {
    setPageBg: function (bg) {
      if (!bg) return;
      document.documentElement.style.setProperty("--bg", bg);
      document.documentElement.style.setProperty("--surface", "color-mix(in srgb, " + bg + " 55%, #fffdf9)");
      document.documentElement.style.setProperty("--border", "color-mix(in srgb, " + bg + " 70%, #c4b8a8)");
    },
    sampleImage: function (img, cb) { cb(null); },
  };

  var slider = document.getElementById("image-slider");
  if (slider) {
    var slides = slider.querySelectorAll(".slider-slide");
    var dots = slider.querySelectorAll(".slider-dot");
    var caption = document.getElementById("slider-caption");
    var counter = document.getElementById("slider-counter");
    var prevBtn = document.getElementById("slider-prev");
    var nextBtn = document.getElementById("slider-next");
    var current = 0;
    var total = slides.length;
    var defaultTheme = slider.getAttribute("data-cover-theme") || "";

    function applySlideTheme(slide) {
      if (!slide) {
        coverThemeApi.setPageBg(defaultTheme);
        return;
      }
      var img = slide.querySelector("img");
      var fallback = slide.getAttribute("data-theme-fallback") || defaultTheme;
      if (!img) {
        coverThemeApi.setPageBg(fallback);
        return;
      }
      coverThemeApi.sampleImage(img, function (bg) {
        var theme = bg || slide.getAttribute("data-bg") || fallback;
        if (bg) slide.setAttribute("data-bg", bg);
        coverThemeApi.setPageBg(theme);
      });
    }

    function goTo(index) {
      if (!total) return;
      current = (index + total) % total;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
      var active = slides[current];
      if (caption && active) {
        var img = active.querySelector("img");
        caption.textContent = img ? img.getAttribute("alt") || "" : "";
      }
      if (counter) counter.textContent = (current + 1) + " / " + total;
      applySlideTheme(active);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); });
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goTo(Number(dot.getAttribute("data-index")));
      });
    });

    document.addEventListener("keydown", function (e) {
      if (!slider.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.key === "ArrowLeft") goTo(current - 1);
      if (e.key === "ArrowRight") goTo(current + 1);
    });

    slides.forEach(function (slide) {
      var img = slide.querySelector("img");
      if (img) {
        coverThemeApi.sampleImage(img, function (bg) {
          if (bg) slide.setAttribute("data-bg", bg);
        });
      }
    });

    goTo(0);
  }

  function buildCommentLi(c, isReply) {
    var li = document.createElement("li");
    li.className = "comment" + (isReply ? " comment-reply" : "");
    li.id = "comment-" + c.id;
    li.setAttribute("data-comment-id", c.id);

    var header = document.createElement("div");
    header.className = "comment-header";
    header.innerHTML = '<span class="comment-author">' + escapeText(c.author) + '</span>' +
      '<time class="comment-date">' + escapeText(c.created_at) + "</time>";

    var body = document.createElement("p");
    body.className = "comment-body";
    body.textContent = c.body;

    var actions = document.createElement("div");
    actions.className = "comment-actions";
    actions.innerHTML =
      '<button type="button" class="reaction-btn comment-like" data-comment-id="' + c.id + '" data-kind="like">👍 <span class="like-count">0</span></button>' +
      '<button type="button" class="reaction-btn comment-dislike" data-comment-id="' + c.id + '" data-kind="dislike">👎 <span class="dislike-count">0</span></button>';

    if (!isReply) {
      actions.innerHTML +=
        '<button type="button" class="btn btn-ghost btn-sm reply-toggle" data-comment-id="' + c.id + '">Reply</button>' +
        '<form class="reply-form hidden" id="reply-form-' + c.id + '" data-parent-id="' + c.id + '">' +
        '<textarea rows="2" maxlength="2000" placeholder="Write a reply..." required></textarea>' +
        '<button type="submit" class="btn btn-primary btn-sm">Post reply</button></form>';
    }

    li.appendChild(header);
    li.appendChild(body);
    li.appendChild(actions);
    return li;
  }

  document.querySelectorAll(".star-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var stars = Number(btn.getAttribute("data-stars"));
      apiPost("/api/home/" + slug + "/rate", { stars: stars }).then(function (data) {
        if (!data.ok) return;
        document.querySelectorAll(".star-btn").forEach(function (b, i) {
          b.classList.toggle("active", i < stars);
        });
        var summary = document.getElementById("home-rating-summary");
        if (summary) {
          summary.setAttribute("data-rating-count", data.rating_count);
          summary.innerHTML = ratingSummaryHtml(data.avg_rating, data.rating_count);
        }
      });
    });
  });

  document.addEventListener("click", function (e) {
    var target = e.target;
    if (!(target instanceof Element)) return;

    var reactBtn = target.closest(".comment-like, .comment-dislike");
    if (reactBtn) {
      var commentId = reactBtn.getAttribute("data-comment-id");
      var kind = reactBtn.getAttribute("data-kind");
      apiPost("/api/comment/" + commentId + "/react", { kind: kind }).then(function (data) {
        if (!data.ok) return;
        var li = document.getElementById("comment-" + commentId);
        if (!li) return;
        var likeBtn = li.querySelector(".comment-like");
        var dislikeBtn = li.querySelector(".comment-dislike");
        likeBtn.querySelector(".like-count").textContent = data.counts.like;
        dislikeBtn.querySelector(".dislike-count").textContent = data.counts.dislike;
        likeBtn.classList.toggle("active", data.reaction === "like");
        dislikeBtn.classList.toggle("active", data.reaction === "dislike");
      });
      return;
    }

    var replyToggle = target.closest(".reply-toggle");
    if (replyToggle) {
      var pid = replyToggle.getAttribute("data-comment-id");
      var form = document.getElementById("reply-form-" + pid);
      if (form) form.classList.toggle("hidden");
      return;
    }
  });

  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (form.classList.contains("reply-form")) {
      e.preventDefault();
      var parentId = form.getAttribute("data-parent-id");
      var textarea = form.querySelector("textarea");
      var body = textarea.value.trim();
      if (!body) return;

      apiPost("/api/comment/" + parentId + "/reply", { body: body }).then(function (data) {
        if (!data.ok) return;
        var parentLi = document.getElementById("comment-" + parentId);
        var repliesUl = parentLi.querySelector(".comment-replies");
        if (!repliesUl) {
          repliesUl = document.createElement("ul");
          repliesUl.className = "comment-replies";
          parentLi.appendChild(repliesUl);
        }
        repliesUl.appendChild(buildCommentLi(data.comment, true));
        textarea.value = "";
        form.classList.add("hidden");
      });
    }
  });

  var commentForm = document.getElementById("comment-form");
  if (commentForm) {
    commentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var bodyEl = document.getElementById("comment-body");
      var body = bodyEl.value.trim();
      if (!body) return;

      apiPost("/api/home/" + slug + "/comment", { body: body }).then(function (data) {
        if (!data.ok) return;
        var empty = document.getElementById("empty-comments");
        if (empty) empty.remove();
        var list = document.getElementById("comment-list");
        list.appendChild(buildCommentLi(data.comment, false));
        bodyEl.value = "";
      });
    });
  }
})();
