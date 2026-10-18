/* =========================================================
   KONZERT – App-Logik
   Normalerweise musst du hier nichts ändern.
   Die Kacheln stehen in tiles.js.
   ========================================================= */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var home = $('home');
  var playerScreen = $('player');
  var grid = $('grid');
  var toast = $('toast');
  var indicator = $('indicator');

  var player = null;          // YT.Player
  var playerReady = false;
  var pending = null;         // Kachel, die angetippt wurde, bevor der Player bereit war
  var current = null;         // aktuell spielende Kachel { title, source }
  var wakeLock = null;
  var hiddenSince = 0;
  var indicatorTimer = 0;
  var toastTimer = 0;
  var startCheckTimer = 0;
  var lastTileTap = 0;
  var titleFallbackTimer = 0;

  var ST = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };

  /* ---------- 1. tiles.js frisch laden (ohne alten Cache) ---------- */
  function loadTiles() {
    var s = document.createElement('script');
    s.src = 'tiles.js?t=' + Date.now();
    s.onload = renderTiles;
    s.onerror = function () { showToast('Kacheln konnten nicht geladen werden.', 0); };
    document.head.appendChild(s);
  }

  /* ---------- 2. Link auslesen: Playlist oder einzelnes Video ---------- */
  function parseLink(link) {
    if (!link) return null;
    link = String(link).trim();
    try {
      var u = new URL(link);
      var list = u.searchParams.get('list');
      var v = u.searchParams.get('v');
      if (!v) {
        if (/youtu\.be$/.test(u.hostname)) {
          v = u.pathname.slice(1).split('/')[0];
        } else {
          var m = u.pathname.match(/\/(embed|shorts|live|v)\/([\w-]{11})/);
          if (m) v = m[2];
        }
      }
      // "Mix"-Listen (RD…) lassen sich nicht einbetten → dann nur das Video
      if (list && !/^RD/.test(list)) return { list: list };
      if (v && /^[\w-]{11}$/.test(v)) return { video: v };
    } catch (e) { /* kein gültiger Link – unten weiter */ }
    if (/^(PL|UU|OL|FL)[\w-]{10,}$/.test(link)) return { list: link };
    if (/^[\w-]{11}$/.test(link)) return { video: link };
    return null;
  }

  // link kann auch eine Liste einzelner Video-Links sein: [ "…", "…" ]
  function parseTileLink(link) {
    if (!Array.isArray(link)) return parseLink(link);
    var ids = link.map(parseLink)
      .filter(function (s) { return s && s.video; })
      .map(function (s) { return s.video; });
    return ids.length ? { videos: ids } : null;
  }

  /* ---------- 3. Kacheln zeichnen ---------- */
  var NOTE_SVG =
    '<svg class="tile-note" viewBox="0 0 64 64" aria-hidden="true">' +
    '<path d="M24 48V14l28-6v34" stroke-width="3" stroke-linejoin="round"/>' +
    '<circle cx="18" cy="48" r="6"/><circle cx="46" cy="42" r="6"/></svg>';

  function renderTiles() {
    var tiles = (window.TILES || []).slice(0, 6);
    grid.innerHTML = '';
    tiles.forEach(function (t) {
      var btn = document.createElement('button');
      btn.className = 'tile no-img';
      btn.innerHTML = NOTE_SVG;

      if (t.image) {
        var img = document.createElement('img');
        img.className = 'tile-img';
        img.alt = '';
        img.decoding = 'async';
        img.onload = function () { btn.classList.remove('no-img'); };
        img.onerror = function () { img.remove(); };
        img.src = 'images/' + encodeURIComponent(t.image);
        btn.appendChild(img);
      }

      var shade = document.createElement('span');
      shade.className = 'tile-shade';
      btn.appendChild(shade);

      var title = document.createElement('span');
      title.className = 'tile-title';
      title.textContent = t.title || '';
      btn.appendChild(title);

      btn.addEventListener('click', function () { onTileTap(t); });
      grid.appendChild(btn);
    });
    fitTitles();
  }

  // Lange Wörter (z. B. "Neujahrskonzert") so weit verkleinern, dass sie in die Kachel passen
  function fitTitles() {
    var titles = grid.querySelectorAll('.tile-title');
    Array.prototype.forEach.call(titles, function (el) {
      el.style.fontSize = '';
      var tile = el.parentNode;
      var size = parseFloat(getComputedStyle(el).fontSize);
      while (size > 18 && (el.scrollWidth > el.clientWidth + 1 || el.offsetHeight > tile.clientHeight * 0.85)) {
        size -= 2;
        el.style.fontSize = size + 'px';
      }
    });
  }
  var fitTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitTitles, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitles);

  function onTileTap(t) {
    var now = Date.now();
    if (now - lastTileTap < 800) return;   // Doppeltippen ignorieren
    lastTileTap = now;

    var source = parseTileLink(t.link);
    if (!source) {
      showToast('Für diese Kachel fehlt noch der Link.', 3000);
      return;
    }
    if (!navigator.onLine) {
      showToast('Keine Internetverbindung.', 3000);
      return;
    }
    openPlayer({ title: t.title || '', source: source });
  }

  /* ---------- 4. YouTube-Player ---------- */
  function loadYouTubeApi() {
    window.onYouTubeIframeAPIReady = createPlayer;
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = function () { showToast('Keine Internetverbindung.', 0); };
    document.head.appendChild(s);
  }

  function createPlayer() {
    player = new YT.Player('yt', {
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 1,
        controls: 0,          // keine YouTube-Knöpfe
        disablekb: 1,
        fs: 0,                // kein Vollbild-Knopf
        iv_load_policy: 3,    // keine Einblendungen
        playsinline: 1,
        rel: 0,               // möglichst keine fremden Vorschläge
        cc_load_policy: 0
      },
      events: {
        onReady: function () {
          playerReady = true;
          try { player.unMute(); player.setVolume(100); } catch (e) {}
          if (pending) { var p = pending; pending = null; startSource(p.source); }
        },
        onStateChange: onStateChange,
        onError: onPlayerError
      }
    });
  }

  function startSource(source) {
    if (!player || !playerReady) return;
    try { player.unMute(); } catch (e) {}
    if (source.list) {
      player.loadPlaylist({ listType: 'playlist', list: source.list, index: 0 });
    } else if (source.videos) {
      player.loadPlaylist(source.videos, 0);
    } else {
      player.loadVideoById(source.video);
    }
    // Falls Android den Start mit Ton blockiert: nochmal anstoßen,
    // sonst Hinweis zeigen (Antippen startet dann sicher).
    clearTimeout(startCheckTimer);
    startCheckTimer = setTimeout(function () {
      if (!current) return;
      var s = player.getPlayerState();
      if (s === ST.UNSTARTED || s === ST.CUED) {
        player.playVideo();
        setTimeout(function () {
          if (current && player.getPlayerState() !== ST.PLAYING && player.getPlayerState() !== ST.BUFFERING) {
            showIndicator('play', 'Antippen', 0);
          }
        }, 1500);
      }
    }, 2500);
  }

  // Oben steht der Titel des gerade laufenden Videos (nicht der Kachel-Name)
  function updateTitle() {
    if (!current || !player || !playerReady) return;
    try {
      var d = player.getVideoData();
      if (d && d.title) {
        var t = d.title;
        if (t.length > 100) t = t.slice(0, 100).replace(/\s+\S*$/, '') + '…';   // auf 100 Zeichen kürzen
        $('playerTitle').textContent = t;
      }
    } catch (e) {}
  }

  function isLastInPlaylist() {
    var list = player.getPlaylist && player.getPlaylist();
    if (!list || !list.length) return true;         // einzelnes Video
    return player.getPlaylistIndex() >= list.length - 1;
  }

  function onStateChange(e) {
    if (!current) return;
    updateTitle();
    setTimeout(updateTitle, 1200);                   // Titel ist oft erst kurz nach dem Wechsel da
    if (e.data === ST.PLAYING) {
      hideIndicatorIfWaiting();
      requestWakeLock();
    }
    if (e.data === ST.ENDED && isLastInPlaylist()) {
      goHome();                                      // Playlist fertig → zurück zu den Kacheln
    }
  }

  function onPlayerError() {
    // Video nicht verfügbar / Einbetten verboten → einfach weiter
    if (!current) return;
    if (isLastInPlaylist()) {
      goHome();
      showToast('Dieses Stück lässt sich leider nicht abspielen.', 3500);
    } else {
      player.nextVideo();
    }
  }

  /* ---------- 5. Bildschirme wechseln ---------- */
  function openPlayer(entry) {
    current = entry;
    $('playerTitle').textContent = '';
    clearTimeout(titleFallbackTimer);
    // Falls YouTube keinen Titel liefert: Kachel-Name als Notlösung
    titleFallbackTimer = setTimeout(function () {
      if (current && !$('playerTitle').textContent) $('playerTitle').textContent = entry.title;
    }, 4000);
    home.hidden = true;
    playerScreen.hidden = false;
    hideIndicator();
    // Android-Zurück-Geste soll zu den Kacheln führen, nicht die App schließen
    history.pushState({ player: true }, '');
    if (playerReady) startSource(entry.source);
    else pending = entry;
    requestWakeLock();
  }

  function showHome() {
    current = null;
    pending = null;
    clearTimeout(startCheckTimer);
    try { if (player && playerReady) player.stopVideo(); } catch (e) {}
    hideIndicator();
    playerScreen.hidden = true;
    home.hidden = false;
    releaseWakeLock();
  }

  function goHome() {
    if (history.state && history.state.player) history.back(); // löst popstate → showHome aus
    else showHome();
  }

  window.addEventListener('popstate', function () {
    if (!playerScreen.hidden) showHome();
  });

  /* ---------- 6. Bedienung ---------- */
  $('tapLayer').addEventListener('click', function () {
    if (!player || !playerReady || !current) return;
    var s = player.getPlayerState();
    if (s === ST.PLAYING || s === ST.BUFFERING) {
      player.pauseVideo();
      showIndicator('pause', 'Pause', 1200);
    } else {
      player.playVideo();
      showIndicator('play', 'Weiter', 800);
    }
  });

  $('btnBack').addEventListener('click', goHome);

  $('btnNext').addEventListener('click', function () {
    if (!player || !playerReady || !current) return;
    if (isLastInPlaylist()) goHome();
    else player.nextVideo();
  });

  /* ---------- 7. Rückmeldungen ---------- */
  function showIndicator(icon, text, ms) {
    $('iconPause').style.display = icon === 'pause' ? '' : 'none';
    $('iconPlay').style.display = icon === 'play' ? '' : 'none';
    $('indicatorText').textContent = text;
    indicator.dataset.waiting = ms ? '' : '1';
    indicator.classList.add('show');
    clearTimeout(indicatorTimer);
    if (ms) indicatorTimer = setTimeout(hideIndicator, ms);
  }
  function hideIndicator() {
    clearTimeout(indicatorTimer);
    indicator.classList.remove('show');
    indicator.dataset.waiting = '';
  }
  function hideIndicatorIfWaiting() {
    if (indicator.dataset.waiting === '1') hideIndicator();
  }

  function showToast(text, ms) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    if (ms) toastTimer = setTimeout(function () { toast.classList.remove('show'); }, ms);
  }

  /* ---------- 8. Bildschirm wach halten ---------- */
  function requestWakeLock() {
    if (!('wakeLock' in navigator) || wakeLock || !current) return;
    navigator.wakeLock.request('screen').then(function (lock) {
      wakeLock = lock;
      lock.addEventListener('release', function () { wakeLock = null; });
    }).catch(function () {});
  }
  function releaseWakeLock() {
    if (wakeLock) { wakeLock.release().catch(function () {}); wakeLock = null; }
  }

  /* ---------- 9. Nach langer Pause neu laden (neue Kacheln holen) ---------- */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      hiddenSince = Date.now();
      return;
    }
    if (current) requestWakeLock();
    var away = hiddenSince ? Date.now() - hiddenSince : 0;
    if (!current && away > 30 * 60 * 1000) location.reload();
  });

  // Internet war weg und ist wieder da → neu starten, wenn er gerade auf den Kacheln ist
  window.addEventListener('online', function () {
    if (!current && !playerReady) location.reload();
  });

  /* ---------- Start ---------- */
  loadTiles();
  loadYouTubeApi();
})();
