(function () {
  var input = document.getElementById("sticky-search-input");
  var grid = document.getElementById("home-grid");
  if (!input || !grid) return;

  var cards = grid.querySelectorAll(".home-card");
  var noResults = document.getElementById("search-no-results");

  function filterCards() {
    var q = input.value.trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var text = card.getAttribute("data-search") || "";
      var show = !q || text.indexOf(q) !== -1;
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });
    if (noResults) noResults.classList.toggle("hidden", visible > 0 || !q);
  }

  var timer;
  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(filterCards, 120);
  });

  if (input.value.trim()) filterCards();
})();
