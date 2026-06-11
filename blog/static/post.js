(function () {
  var postDetail = document.getElementById("post-detail");
  if (!postDetail) return;

  var postId = postDetail.getAttribute("data-post-id");
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
    });
  }

  var likeBtn = document.getElementById("like-btn");
  var dislikeBtn = document.getElementById("dislike-btn");
  var likeCount = document.getElementById("like-count");
  var dislikeCount = document.getElementById("dislike-count");

  function handleReaction(kind) {
    apiPost("/api/post/" + postId + "/react", { kind: kind })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.ok) return;
        likeCount.textContent = data.counts.like;
        dislikeCount.textContent = data.counts.dislike;
        likeBtn.classList.toggle("active", data.reaction === "like");
        dislikeBtn.classList.toggle("active", data.reaction === "dislike");
      });
  }

  if (likeBtn) {
    likeBtn.addEventListener("click", function () { handleReaction("like"); });
  }
  if (dislikeBtn) {
    dislikeBtn.addEventListener("click", function () { handleReaction("dislike"); });
  }

  var commentForm = document.getElementById("comment-form");
  if (commentForm) {
    commentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var bodyEl = document.getElementById("comment-body");
      var body = bodyEl.value.trim();
      if (!body) return;

      apiPost("/api/post/" + postId + "/comment", { body: body })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!data.ok) return;
          var list = document.getElementById("comment-list");
          var li = document.createElement("li");
          li.className = "comment";
          li.id = "comment-" + data.comment.id;

          var author = document.createElement("span");
          author.className = "comment-author";
          author.textContent = data.comment.author;

          var date = document.createElement("time");
          date.className = "comment-date";
          date.textContent = data.comment.created_at;

          var p = document.createElement("p");
          p.className = "comment-body";
          p.textContent = data.comment.body;

          li.appendChild(author);
          li.appendChild(date);
          li.appendChild(p);
          list.appendChild(li);
          bodyEl.value = "";
        });
    });
  }
})();
