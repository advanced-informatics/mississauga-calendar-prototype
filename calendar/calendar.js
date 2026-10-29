// Calendar prototype: search, upcoming collection, month switching, expandable cards, empty states,
// reminder sign-up with validation (nothing is sent) and an .ics download.
// Plain script (no modules) so it runs from disk.
(function () {
  var data = window.CALENDAR_DATA;
  var el = function (id) { return document.getElementById(id); };
  var views = { search: el('search'), result: el('result'), reminder: el('reminder'), calendar: el('calendar-panel') };
  var input = el('address'), list = el('suggestions'), notFound = el('not-found');
  var state = { address: null, months: [], monthIndex: 0, upcoming: null, view: 'list' };

  // --- Tell the host page our height, so it can size the iframe (no inner scrollbar). ---
  function reportHeight() {
    var cal = el('cal');
    var bottom = cal.offsetTop + cal.offsetHeight;
    var menu = el('month-list');
    if (!menu.hidden) bottom = Math.max(bottom, menu.getBoundingClientRect().bottom + window.scrollY + 8);
    var pop = document.querySelector('.popover');
    if (pop) bottom = Math.max(bottom, pop.getBoundingClientRect().bottom + window.scrollY + 8);
    window.parent.postMessage({ type: 'calendar-height', height: bottom }, '*');
  }
  if ('ResizeObserver' in window) new ResizeObserver(reportHeight).observe(el('cal'));
  window.addEventListener('load', reportHeight);

  function show(name, focusEl) {
    Object.keys(views).forEach(function (k) { views[k].hidden = (k !== name); });
    if (focusEl) focusEl.focus();
    reportHeight();
  }

  // --- Schedule rules: weekly organics, garbage and recycling on alternate weeks. ---
  function dayStart(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function weekIndex(date) {
    var epoch = Date.UTC(2026, 0, 5); // a Monday
    var day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor((day - epoch) / (7 * 86400000));
  }
  function collectionsFor(address, from, to) {
    var out = [];
    if (address.weekday === null) return out;
    var d = dayStart(from);
    while (d <= to) {
      if (d.getDay() === address.weekday) {
        var alt = (weekIndex(d) % 2 === address.recyclingWeek) ? 'recycling' : 'garbage';
        out.push({ date: new Date(d), types: [alt, 'organics'] });
      }
      d.setDate(d.getDate() + 1);
    }
    return out;
  }
  function lastDay() {
    var last = state.months[state.months.length - 1];
    return new Date(last.getFullYear(), last.getMonth() + 1, 0);
  }

  // --- Rendering helpers ---
  var dateFmt = new Intl.DateTimeFormat('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
  var monthFmt = new Intl.DateTimeFormat('en-CA', { month: 'long', year: 'numeric' });
  var uid = 0;

  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function dot(key) {
    var d = make('span', 'dot');
    d.style.background = data.wasteTypes[key].colour;
    d.setAttribute('aria-hidden', 'true');
    return d;
  }
  function typesList(types) {
    var ul = make('ul', 'types');
    types.forEach(function (key) {
      var li = make('li');
      li.appendChild(dot(key));
      li.appendChild(document.createTextNode(data.wasteTypes[key].label));
      ul.appendChild(li);
    });
    return ul;
  }
  function details(types) {
    var div = make('div', 'details');
    types.forEach(function (key) {
      var t = data.wasteTypes[key];
      var item = make('div', 'detail');
      var name = make('div', 'detail__name');
      name.appendChild(dot(key));
      name.appendChild(document.createTextNode(t.label));
      item.appendChild(name);
      item.appendChild(make('p', '', t.description));
      var a = make('a', '', 'Find out more');
      a.href = t.link;
      a.setAttribute('aria-label', 'Find out more about ' + t.label.toLowerCase());
      item.appendChild(a);
      div.appendChild(item);
    });
    return div;
  }
  // One expand control per card, as agreed with Carol on 22 October.
  function card(item, isNext) {
    var wrap = make('div', 'card' + (isNext ? ' card--next' : ''));
    var id = 'card-details-' + (++uid);
    var toggle = make('button', 'card__toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', id);
    var body = make('div');
    if (isNext) body.appendChild(make('div', 'card__eyebrow', 'Upcoming collection'));
    body.appendChild(make('div', 'card__date', dateFmt.format(item.date)));
    var summary = typesList(item.types);
    body.appendChild(summary);
    toggle.appendChild(body);
    toggle.insertAdjacentHTML('beforeend', '<svg class="card__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>');
    var more = details(item.types);
    more.id = id;
    more.hidden = true;
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      more.hidden = open;
      summary.hidden = !open;
      reportHeight();
    });
    wrap.appendChild(toggle);
    wrap.appendChild(more);
    return wrap;
  }
  function message(text) { return make('p', 'message', text); }

  // --- Schedule view ---
  function showAddress(address) {
    var today = dayStart(new Date());
    state.address = address;
    state.months = [];
    for (var i = 0; i <= data.monthsAhead; i++) state.months.push(new Date(today.getFullYear(), today.getMonth() + i, 1));
    state.monthIndex = 0;
    var all = collectionsFor(address, today, lastDay());
    state.upcoming = all[0] || null;

    el('selected-address').textContent = address.label;
    var up = el('upcoming');
    up.innerHTML = '';
    up.appendChild(state.upcoming ? card(state.upcoming, true) : message('No upcoming collections for the selected address.'));
    el('future-head').hidden = !state.upcoming;
    el('month-nav').hidden = !state.upcoming;
    el('month-collections').hidden = !state.upcoming;
    if (state.upcoming) renderMonth();
    show('result', el('change-address'));
  }

  function renderMonth() {
    var m = state.months[state.monthIndex];
    var monthEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    var from = m;
    if (state.monthIndex === 0) { from = new Date(state.upcoming.date); from.setDate(from.getDate() + 1); }
    var items = collectionsFor(state.address, from, monthEnd);

    el('month-btn').innerHTML = monthFmt.format(m) +
      ' <svg viewBox="0 0 24 24" aria-hidden="true" style="width:14px;height:14px;vertical-align:-2px;fill:none;stroke:currentColor;stroke-width:2"><path d="M6 9l6 6 6-6"/></svg>';
    el('month-btn').setAttribute('aria-label', 'Month: ' + monthFmt.format(m) + '. Choose a month');
    el('prev-month').disabled = state.monthIndex === 0;
    el('next-month').disabled = state.monthIndex === state.months.length - 1;

    var box = el('month-collections');
    box.innerHTML = '';
    if (state.view === 'calendar') box.appendChild(monthGrid(m));
    else if (items.length) items.forEach(function (c) { box.appendChild(card(c, false)); });
    else box.appendChild(message('No upcoming collections for the selected month.'));
    reportHeight();
  }

  // --- Calendar view: month grid, Monday first, with the next month's days greyed (Figma 204:2412) ---
  var dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  var longDayFmt = new Intl.DateTimeFormat('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
  function monthGrid(m) {
    var today = dayStart(new Date());
    var start = new Date(m.getFullYear(), m.getMonth(), 1);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    var end = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    end.setDate(end.getDate() + (6 - (end.getDay() + 6) % 7));
    var byDay = {};
    collectionsFor(state.address, start, end).forEach(function (c) { byDay[c.date.toDateString()] = c.types; });

    var grid = make('div', 'grid');
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', monthFmt.format(m));
    dayNames.forEach(function (n) { grid.appendChild(make('div', 'grid__head', n)); });
    for (var d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      var cell = make('div', 'grid__cell');
      if (d.getMonth() !== m.getMonth()) cell.classList.add('is-other');
      if (d.getTime() === today.getTime()) cell.classList.add('is-today');
      var num = make('span', 'grid__num', String(d.getDate()));
      cell.appendChild(num);
      var types = byDay[d.toDateString()] || [];
      if (types.length) {
        var ul = make('ul', 'grid__types');
        var dayLabel = longDayFmt.format(d);
        types.forEach(function (key) {
          var li = make('li');
          var b = make('button', 'grid__type');
          b.type = 'button';
          b.setAttribute('aria-label', data.wasteTypes[key].label + ', ' + dayLabel);
          b.appendChild(dot(key));
          b.appendChild(make('span', 'grid__label', data.wasteTypes[key].label));
          b.addEventListener('click', function (e) { e.stopPropagation(); openPopover(b, key); });
          li.appendChild(b);
          ul.appendChild(li);
        });
        cell.appendChild(ul);
      }
      grid.appendChild(cell);
    }
    return grid;
  }

  // --- Waste-type popover in the calendar view ---
  var popover = null, popoverFrom = null;
  function closePopover() {
    if (!popover) return;
    popover.remove();
    popover = null;
    if (popoverFrom) popoverFrom.focus();
    popoverFrom = null;
    reportHeight();
  }
  function openPopover(from, key) {
    closePopover();
    var t = data.wasteTypes[key];
    popover = make('div', 'popover');
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', t.label);
    var head = make('div', 'popover__head');
    var name = make('div', 'detail__name');
    name.appendChild(dot(key));
    name.appendChild(document.createTextNode(t.label));
    head.appendChild(name);
    var x = make('button', 'popover__close');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    x.addEventListener('click', closePopover);
    head.appendChild(x);
    popover.appendChild(head);
    popover.appendChild(make('p', '', t.description));
    var a = make('a', '', 'Find out more');
    a.href = t.link;
    a.setAttribute('aria-label', 'Find out more about ' + t.label.toLowerCase());
    popover.appendChild(a);

    var box = el('month-collections');
    box.appendChild(popover);
    var b = from.getBoundingClientRect(), r = box.getBoundingClientRect();
    var left = Math.min(b.left - r.left, r.width - popover.offsetWidth);
    popover.style.left = Math.max(0, left) + 'px';
    popover.style.top = (b.bottom - r.top + 4) + 'px';
    popoverFrom = from;
    x.focus();
    reportHeight();
  }
  document.addEventListener('click', function (e) {
    if (popover && !e.target.closest('.popover')) closePopover();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePopover(); });

  function setView(v) {
    state.view = v;
    el('view-list').setAttribute('aria-pressed', String(v === 'list'));
    el('view-calendar').setAttribute('aria-pressed', String(v === 'calendar'));
    closePopover();
    renderMonth();
  }
  el('view-list').addEventListener('click', function () { setView('list'); });
  el('view-calendar').addEventListener('click', function () { setView('calendar'); });
  function setMonth(i) {
    state.monthIndex = Math.max(0, Math.min(state.months.length - 1, i));
    closeMonthList();
    renderMonth();
  }
  el('prev-month').addEventListener('click', function () { setMonth(state.monthIndex - 1); });
  el('next-month').addEventListener('click', function () { setMonth(state.monthIndex + 1); });

  // --- Month picker (drop-down with radio-style options) ---
  function openMonthList() {
    var ul = el('month-list');
    ul.innerHTML = '';
    state.months.forEach(function (m, i) {
      var li = make('li');
      var b = make('button');
      b.type = 'button';
      b.setAttribute('role', 'option');
      b.setAttribute('aria-selected', String(i === state.monthIndex));
      b.appendChild(document.createTextNode(monthFmt.format(m)));
      b.appendChild(make('span', 'radio'));
      b.addEventListener('click', function () { setMonth(i); el('month-btn').focus(); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    ul.hidden = false;
    el('month-btn').setAttribute('aria-expanded', 'true');
    ul.querySelector('[aria-selected="true"]').focus();
    reportHeight();
  }
  function closeMonthList() {
    el('month-list').hidden = true;
    el('month-btn').setAttribute('aria-expanded', 'false');
    reportHeight();
  }
  el('month-btn').addEventListener('click', function () {
    if (el('month-list').hidden) openMonthList(); else closeMonthList();
  });
  document.addEventListener('click', function (e) {
    if (!el('month-list').hidden && !e.target.closest('.month-picker')) closeMonthList();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !el('month-list').hidden) { closeMonthList(); el('month-btn').focus(); }
  });

  // --- Search with suggestions ---
  function matches(q) {
    q = q.trim().toLowerCase();
    if (q.length < 2) return [];
    return data.addresses.filter(function (a) { return a.label.toLowerCase().indexOf(q) !== -1; });
  }
  function renderSuggestions() {
    var found = matches(input.value);
    list.innerHTML = '';
    notFound.hidden = true;
    found.forEach(function (a) {
      var li = make('li');
      var b = make('button', '', a.label + (a.postal ? ' ON ' + a.postal : ''));
      b.type = 'button';
      b.setAttribute('role', 'option');
      b.addEventListener('click', function () { showAddress(a); });
      li.appendChild(b);
      list.appendChild(li);
    });
    list.hidden = !found.length;
    input.setAttribute('aria-expanded', String(found.length > 0));
    reportHeight();
  }
  input.addEventListener('input', renderSuggestions);
  views.search.addEventListener('submit', function (e) {
    e.preventDefault();
    var found = matches(input.value);
    if (found.length === 1) showAddress(found[0]);
    else if (!found.length) { list.hidden = true; notFound.hidden = false; reportHeight(); }
    else renderSuggestions();
  });
  el('change-address').addEventListener('click', function () {
    input.value = '';
    list.hidden = true;
    notFound.hidden = true;
    show('search', input);
  });

  // --- Reminder sign-up (prototype: nothing is sent or stored) ---
  var channels = [
    { key: 'email', label: 'By email',      field: 'Email address', type: 'email', placeholder: 'address@example.com' },
    { key: 'sms',   label: 'By SMS',        field: 'Mobile number', type: 'tel',   placeholder: 'XXX-XXX-XXXX' }
  ];
  function timeOptions() {
    var out = [];
    for (var h = 7; h <= 20; h++) out.push((h < 10 ? '0' : '') + h + ':00');
    return out;
  }
  function select(id, label, options, value) {
    var s = make('select', 'field-select');
    s.id = id;
    s.setAttribute('aria-label', label);
    options.forEach(function (o) {
      var opt = make('option', '', o);
      if (o === value) opt.selected = true;
      s.appendChild(opt);
    });
    return s;
  }
  function buildReminderForm() {
    var box = el('channels');
    box.innerHTML = '';
    channels.forEach(function (c) {
      var wrap = make('div', 'channel');
      var label = make('label');
      var cb = make('input');
      cb.type = 'checkbox';
      cb.id = 'ch-' + c.key;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(c.label));
      wrap.appendChild(label);

      var fields = make('div', 'channel__fields');
      fields.hidden = true;
      var fl = make('label', 'field', c.field);
      fl.htmlFor = 'in-' + c.key;
      var inp = make('input', 'field-input');
      inp.type = c.type;
      inp.id = 'in-' + c.key;
      inp.placeholder = c.placeholder;
      inp.setAttribute('aria-describedby', 'err-' + c.key);
      var err = make('p', 'error');
      err.id = 'err-' + c.key;
      err.hidden = true;
      var tl = make('div', 'field', 'Notification time');
      var row = make('div', 'field-row');
      row.appendChild(select('when-' + c.key, c.label + ': which day', ['The day before', 'The same day'], 'The day before'));
      row.appendChild(select('time-' + c.key, c.label + ': time', timeOptions(), '11:00'));
      [fl, inp, err, tl, row].forEach(function (n) { fields.appendChild(n); });
      wrap.appendChild(fields);

      cb.addEventListener('change', function () {
        fields.hidden = !cb.checked;
        if (cb.checked) inp.focus();
        el('sign-up').disabled = !box.querySelector('input[type="checkbox"]:checked');
        reportHeight();
      });
      box.appendChild(wrap);
    });
    el('sign-up').disabled = true;
    el('error-summary').hidden = true;
    el('reminder-form').hidden = false;
    el('reminder-done').hidden = true;
  }
  function validate(c, value) {
    if (!value.trim()) return 'Enter your ' + c.field.toLowerCase() + '.';
    if (c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter an email address like name@example.com.';
    if (c.type === 'tel' && value.replace(/\D/g, '').length < 10) return 'Enter a 10-digit number, like 905-555-0100.';
    return '';
  }
  function showSummary(bad) {
    var box = el('error-summary'), ul = el('error-list');
    ul.innerHTML = '';
    bad.forEach(function (c) {
      var li = make('li'), a = make('a', '', c.field);
      a.href = '#in-' + c.key;
      a.addEventListener('click', function (e) { e.preventDefault(); el('in-' + c.key).focus(); });
      li.appendChild(a);
      ul.appendChild(li);
    });
    box.hidden = !bad.length;
    if (bad.length) box.focus();
  }
  el('reminder-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var chosen = [], bad = [];
    channels.forEach(function (c) {
      if (!el('ch-' + c.key).checked) return;
      var inp = el('in-' + c.key), err = el('err-' + c.key);
      var problem = validate(c, inp.value);
      err.textContent = problem;
      err.hidden = !problem;
      inp.setAttribute('aria-invalid', String(!!problem));
      if (problem) bad.push(c);
      chosen.push(c.label.replace('By ', '') + ' (' + el('when-' + c.key).value.toLowerCase() + ', ' + el('time-' + c.key).value + ')');
    });
    showSummary(bad);
    reportHeight();
    if (bad.length) return;
    el('reminder-summary').textContent = 'Reminders for ' + state.address.label + ': ' + chosen.join('; ') + '.';
    el('reminder-form').hidden = true;
    el('reminder-done').hidden = false;
    el('reminder-done').focus();
    reportHeight();
  });
  el('open-reminder').addEventListener('click', function () {
    buildReminderForm();
    show('reminder', el('reminder-back'));
  });
  el('reminder-back').addEventListener('click', function () { show('result', el('open-reminder')); });
  el('reminder-finish').addEventListener('click', function () { show('result', el('open-reminder')); });

  // --- Calendar file (.ics) for the months shown ---
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function icsDate(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }
  function buildIcs() {
    var items = collectionsFor(state.address, dayStart(new Date()), lastDay());
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Prototype//Collection schedule//EN', 'CALSCALE:GREGORIAN',
                 'X-WR-CALNAME:Collection schedule'];
    items.forEach(function (c) {
      var next = new Date(c.date);
      next.setDate(next.getDate() + 1);
      var names = c.types.map(function (k) { return data.wasteTypes[k].label; }).join(', ');
      lines.push('BEGIN:VEVENT', 'UID:' + state.address.id + '-' + icsDate(c.date) + '@prototype.invalid', 'DTSTAMP:' + stamp,
                 'DTSTART;VALUE=DATE:' + icsDate(c.date), 'DTEND;VALUE=DATE:' + icsDate(next),
                 'SUMMARY:Collection: ' + names, 'LOCATION:' + state.address.label.replace(/,/g, '\\,'),
                 'TRANSP:TRANSPARENT', 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }
  var icsUrl = null;
  el('open-calendar').addEventListener('click', function () {
    if (icsUrl) URL.revokeObjectURL(icsUrl);
    icsUrl = URL.createObjectURL(new Blob([buildIcs()], { type: 'text/calendar' }));
    el('ics-link').href = icsUrl;
    show('calendar', el('calendar-back'));
  });
  el('calendar-back').addEventListener('click', function () { show('result', el('open-calendar')); });
})();
