(function () {
  // Random CTA text
  var phrases = ["Continue to see more","Get instant access","Click here to unlock now","Proceed for more"];
  var link = document.getElementById("ctaLink");
  if (link) link.textContent = phrases[Math.floor(Math.random() * phrases.length)];

  var VIDEO_ID = "mTmdqUJH1";
  if (!VIDEO_ID) return;

  var player    = document.getElementById("player");
  var vsrc      = document.getElementById("vsrc");
  var vmsg      = document.getElementById("vmsg");
  var vbox      = document.getElementById("vbox");
  var spin      = document.getElementById("spin");
  var bigplay   = document.getElementById("bigplay");
  var ctrl      = document.getElementById("ctrl");
  var scrub     = document.getElementById("scrub");
  var buf       = document.getElementById("buf");
  var fill      = document.getElementById("fill");
  var knob      = document.getElementById("knob");
  var playBtn   = document.getElementById("playBtn");
  var muteBtn   = document.getElementById("muteBtn");
  var vrange    = document.getElementById("vrange");
  var curEl     = document.getElementById("cur");
  var durEl     = document.getElementById("dur");
  var setBtn    = document.getElementById("setBtn");
  var menu      = document.getElementById("menu");
  var loopState = document.getElementById("loopState");
  var fsBtn     = document.getElementById("fsBtn");

  var PRIMARY  = "https://cdn2.videy.co/";
  var FALLBACK = "https://cdn.slimedrive.com/";
  var tried    = false;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function(){});
  }

  function loadSrc(url){ vsrc.src = url; player.load(); }
  function fmt(t){ if(!isFinite(t)||t<0)t=0; var m=Math.floor(t/60),s=Math.floor(t%60); return m+":"+(s<10?"0"+s:s); }
  function setIcon(btn,on){ btn.querySelector(".ic-on").style.display=on?"block":"none"; btn.querySelector(".ic-off").style.display=on?"none":"block"; }

  // ── Play / pause ──
  function toggle(){ if(player.paused) player.play(); else player.pause(); }
  bigplay.addEventListener("click", toggle);
  playBtn.addEventListener("click", toggle);
  player.addEventListener("click", toggle);
  player.addEventListener("play", function(){ vbox.setAttribute("data-playing","1"); setIcon(playBtn,false); });
  player.addEventListener("pause", function(){ vbox.removeAttribute("data-playing"); setIcon(playBtn,true); });

  // ── Spinner ──
  player.addEventListener("waiting", function(){ spin.style.display="block"; });
  player.addEventListener("playing", function(){ spin.style.display="none"; });
  player.addEventListener("canplay", function(){ spin.style.display="none"; });

  // ── Time + progress ──
  player.addEventListener("loadedmetadata", function(){ durEl.textContent=fmt(player.duration); });
  player.addEventListener("timeupdate", function(){
    var d=player.duration||0, p=d?(player.currentTime/d)*100:0;
    fill.style.width=p+"%"; knob.style.left=p+"%"; curEl.textContent=fmt(player.currentTime);
  });
  player.addEventListener("progress", function(){
    try{ if(player.buffered.length&&player.duration){ buf.style.width=(player.buffered.end(player.buffered.length-1)/player.duration)*100+"%"; } }catch(e){}
  });

  // ── Seek ──
  function seek(x){ var r=scrub.getBoundingClientRect(); var ratio=Math.min(1,Math.max(0,(x-r.left)/r.width)); if(player.duration) player.currentTime=ratio*player.duration; }
  var sk=false;
  scrub.addEventListener("pointerdown", function(e){ sk=true; seek(e.clientX); });
  window.addEventListener("pointermove", function(e){ if(sk) seek(e.clientX); });
  window.addEventListener("pointerup", function(){ sk=false; });

  // ── Volume / mute ──
  muteBtn.addEventListener("click", function(){ player.muted=!player.muted; });
  vrange.addEventListener("input", function(){ player.volume=parseFloat(vrange.value); player.muted=(player.volume===0); });
  player.addEventListener("volumechange", function(){
    var m=player.muted||player.volume===0; setIcon(muteBtn,!m); vrange.value=m?0:player.volume;
  });

  // ── Settings: speed + loop ──
  setBtn.addEventListener("click", function(e){ e.stopPropagation(); menu.classList.toggle("open"); });
  document.addEventListener("click", function(){ menu.classList.remove("open"); });
  menu.addEventListener("click", function(e){ e.stopPropagation(); });
  menu.querySelectorAll("[data-speed]").forEach(function(b){
    b.addEventListener("click", function(){
      player.playbackRate=parseFloat(b.dataset.speed);
      menu.querySelectorAll("[data-speed]").forEach(function(x){ x.removeAttribute("data-on"); });
      b.setAttribute("data-on","1");
    });
  });
  var loopBtn=menu.querySelector("[data-loop]");
  loopBtn.addEventListener("click", function(){
    player.loop=!player.loop; loopState.textContent=player.loop?"On":"Off"; loopBtn.setAttribute("data-on",player.loop?"1":"0");
  });

  // ── Fullscreen ──
  fsBtn.addEventListener("click", function(){
    if(document.fullscreenElement) document.exitFullscreen();
    else if(vbox.requestFullscreen) vbox.requestFullscreen();
    else if(player.webkitEnterFullscreen) player.webkitEnterFullscreen();
  });
  document.addEventListener("fullscreenchange", function(){ setIcon(fsBtn,!document.fullscreenElement); });

  // ── Auto-hide controls ──
  var hideT;
  function showCtrl(){ vbox.setAttribute("data-show","1"); clearTimeout(hideT); hideT=setTimeout(function(){ if(!player.paused) vbox.removeAttribute("data-show"); },2600); }
  vbox.addEventListener("pointermove", showCtrl);
  vbox.addEventListener("pointerleave", function(){ if(!player.paused) vbox.removeAttribute("data-show"); });

  // ── CDN fallback ──
  player.addEventListener("error", function(){
    if(!tried){ tried=true; loadSrc(FALLBACK+VIDEO_ID+".mp4"); }
    else { player.style.display="none"; ctrl.style.display="none"; bigplay.style.display="none"; vmsg.style.display="flex"; }
  }, true);
  player.addEventListener("loadedmetadata", function(){ vmsg.style.display="none"; player.style.display="block"; });

  loadSrc(PRIMARY+VIDEO_ID+".mp4");
})();
