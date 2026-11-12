/* Course sites: collapsible syllabus sections.
   Everything is open by default; the page works without this script. */
(function () {
  var sections = Array.prototype.slice.call(document.querySelectorAll('details[id]'));
  if (!sections.length) return;
  var sessions = sections.filter(function (d) { return d.classList.contains('session'); });
  var KEY = 'collapsed:' + location.pathname;

  // Remember which sections the reader collapsed.
  function save() {
    try {
      var closed = sections.filter(function (d) { return !d.open; }).map(function (d) { return d.id; });
      localStorage.setItem(KEY, JSON.stringify(closed));
    } catch (e) { /* storage unavailable: carry on without it */ }
  }
  try {
    var closed = JSON.parse(localStorage.getItem(KEY) || '[]');
    sections.forEach(function (d) { if (closed.indexOf(d.id) !== -1) d.open = false; });
  } catch (e) { /* ignore */ }
  sections.forEach(function (d) { d.addEventListener('toggle', save); });

  // Expand all / collapse sessions.
  var toggles = document.querySelector('.toggles');
  if (toggles) {
    toggles.hidden = false;
    toggles.addEventListener('click', function (event) {
      var action = event.target.getAttribute('data-action');
      if (action === 'expand') sections.forEach(function (d) { d.open = true; });
      if (action === 'collapse') sessions.forEach(function (d) { d.open = false; });
    });
  }

  // Mark the next upcoming session.
  var today = new Date();
  var stamp = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  var first = sessions[0] && sessions[0].getAttribute('data-date');
  var next = sessions.filter(function (d) {
    var date = d.getAttribute('data-date');
    return date && date >= stamp;
  })[0];
  if (next && first && stamp >= first) {
    next.setAttribute('data-next', '');
    var badge = document.createElement('span');
    badge.className = 'next-badge';
    badge.textContent = next.getAttribute('data-date') === stamp ? 'Today' : 'Next';
    next.querySelector('summary').appendChild(badge);
  }

  // A link to something inside a collapsed section opens it.
  function reveal() {
    var target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    for (var el = target; el; el = el.parentElement) {
      if (el.tagName === 'DETAILS') el.open = true;
    }
  }
  window.addEventListener('hashchange', reveal);
  reveal();

  // Printing shows everything, then restores the reader's view.
  var before = null;
  window.addEventListener('beforeprint', function () {
    before = sections.map(function (d) { return d.open; });
    sections.forEach(function (d) { d.open = true; });
  });
  window.addEventListener('afterprint', function () {
    if (before) sections.forEach(function (d, i) { d.open = before[i]; });
    before = null;
  });
})();
