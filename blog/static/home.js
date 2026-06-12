(function () {
  var detail = document.getElementById("home-detail");
  if (!detail) return;

  var slug = detail.getAttribute("data-home-slug");
  var csrfMeta = document.querySelector('meta[name="csrf-token"]');
  var csrfToken = csrfMeta ? csrfMeta.getAttribute("content") : "";

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
        var summary = document.querySelector(".home-rating-summary .rating-text");
        if (summary) {
          summary.textContent = data.avg_rating.toFixed(1) + " average from " + data.rating_count + " rating" + (data.rating_count === 1 ? "" : "s");
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
