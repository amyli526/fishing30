// ===================== 状态（进度 = 本地保存） =====================
const K = "fishing30_v1";
let S = { done: {}, mood: {}, welcomed: false };
try { S = Object.assign(S, JSON.parse(localStorage.getItem(K) || "{}")); } catch (e) {}
function save() { localStorage.setItem(K, JSON.stringify(S)); }
const PHRASES = ["listen", "speak", "read", "write", "play"];
const PHRASE_NAMES = { listen: "听一听", speak: "说一说", read: "读一读", write: "写一写", play: "玩一玩" };

// ===================== 工具 =====================
function $(id) { return document.getElementById(id); }
function clearOverlays() { document.querySelectorAll(".overlay").forEach(o => o.remove()); }
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2000);
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function confetti() {
  const colors = ["#4FA9C8", "#A8D8E6", "#A8E6CF", "#A5C4F0", "#FFD97D"];
  for (let i = 0; i < 24; i++) {
    const d = document.createElement("div"); d.className = "confetti";
    d.style.left = (Math.random() * 100) + "vw";
    d.style.background = colors[i % colors.length];
    document.body.appendChild(d);
    const dx = (Math.random() - .5) * 180, dy = 200 + Math.random() * 340, r = 720 + Math.random() * 540;
    d.animate(
      [{ transform: "translate(0,0) rotate(0deg)", opacity: 1 },
       { transform: "translate(" + dx + "px," + dy + "px) rotate(" + r + "deg)", opacity: 0 }],
      { duration: 1100, easing: "cubic-bezier(.2,.6,.4,1)" }
    ).onfinish = () => d.remove();
    setTimeout(() => { if (d.isConnected) d.remove(); }, 1500);
  }
}

function doneListen() {
  markDone("listen");
  speak("太棒了，故事听完了！");
  toast("听一听完成！👂");
}
function doneSpeak() {
  stopRecord();
  markDone("speak");
  speak("你说得真响亮，像个小播音员！");
  toast("说一说完成！🗣️");
}

// ===================== 语音朗读（男播音员 · Web Speech API） =====================
let voicesCache = [];
function loadVoices() { try { voicesCache = speechSynthesis.getVoices(); } catch (e) {} }
if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
const ZH_MALE = [/yunxi/i, /云希/i, /yunyang/i, /云扬/i, /yunfeng/i, /云峰/i, /kangkang/i, /康康/i, /yujun/i, /羽俊/i, /guoyu/i, /国宇/i, /zhiwei/i, /志伟/i, /xiaofeng/i, /晓峰/i, /男/i, /老李/i, /man/i, /male/i];
function pickZh() {
  const zh = voicesCache.filter(v => /zh|cmn/i.test(v.lang));
  if (!zh.length) return null;
  const score = v =>
    ((v.localService ? 0 : 12)) +
    (/natural|在线|自然|online|网络/i.test(v.name) ? 18 : 0) +
    (/zh[-_]CN/i.test(v.lang) ? 8 : 0) +
    (ZH_MALE.some(r => r.test(v.name)) ? 30 : 0) +
    (/female|女生|女声|Xiaoxiao|晓晓|Huihui|慧慧|Yaoyao|Meijia|Ting-ting|婷婷/i.test(v.name) ? -40 : 0);
  return zh.slice().sort((a, b) => score(b) - score(a))[0] || null;
}
function speak(text) {
  if (!("speechSynthesis" in window)) { toast("此浏览器不支持语音，请用 Chrome 或 Edge 打开哦"); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN"; const v = pickZh(); if (v) u.voice = v;
  u.rate = 0.92; u.pitch = 0.95; u.volume = 1; speechSynthesis.speak(u);
}
function speakStory() {
  const d = DAY_DATA[CUR];
  const lines = d.story.map(l => l.t);
  const full = lines.join("。") + "。";
  const title = "🎣 第" + CUR + "天 · " + d.title + "（" + d.sub + "）";
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(
      '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + title + '</title><style>' +
      'body{margin:0;background:linear-gradient(180deg,#eaf7f4,#dff1ee);min-height:100vh;display:flex;justify-content:center;font-family:"Kaiti SC","KaiTi","STKaiti","Microsoft YaHei",serif;padding:24px;box-sizing:border-box}' +
      '.card{background:#fff;border-radius:20px;max-width:640px;width:100%;padding:36px 32px;box-shadow:0 10px 30px rgba(31,111,143,.15);border:1px solid #bfe3dd}' +
      '.chip{display:inline-block;background:#2F86A8;color:#fff;border-radius:99px;padding:4px 14px;font-size:13px;letter-spacing:1px}' +
      '.story-title{font-size:26px;font-weight:900;color:#1d5a73;margin:14px 0 4px}' +
      '.story-sub{color:#7aa3b3;margin:0 0 18px;font-size:15px}' +
      '.line{font-size:20px;line-height:2.05;color:#2c4a55;margin:0;padding:7px 0;border-bottom:1px dashed #dceeea}' +
      '.line span{display:block;font-size:13px;color:#a5c5cf;line-height:1.4;letter-spacing:.5px}' +
      '.btn{margin-top:22px;background:#2F86A8;border:none;color:#fff;border-radius:99px;padding:12px 10px;width:100%;font-size:16px;font-weight:bold;cursor:pointer}' +
      '.btn:hover{background:#256f8d}</style></head><body>' +
      '<div class="card"><span class="chip">小钓手的30天钓鱼学院</span>' +
      '<div class="story-title">' + title.split("·")[1] + '</div>' +
      '<div class="story-sub">' + d.sub + ' · 今天的故事</div>' +
      lines.map(l => '<div class="line">' + l + '</div>').join("") +
      '<button class="btn" onclick="speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(this.parentNode.textContent.trim());u.lang=\'zh-CN\';u.rate=0.92;u.pitch=0.95;speechSynthesis.speak(u)">🔊 在新页面再听一遍</button>' +
      '<button class="btn" style="background:#9fbf72;margin-top:10px" onclick="window.close()">✖ 听完关闭</button>' +
      '</div></body></html>'
    );
    w.document.close();
  }
  speak(full);
}

// ===================== 地图 / 首页 =====================
function doneDay(n) { return S.done[n] && S.done[n].length === PHRASES.length; }
function dayStatus(n) {
  if (doneDay(n)) return "done";
  if (n === 1) return "today";
  if (doneDay(n - 1)) return "today";
  return "locked";
}
function renderHome() {
  const map = $("home-map"); map.innerHTML = "";
  for (let i = 1; i <= 30; i++) {
    const st = dayStatus(i);
    const el = document.createElement("div");
    el.className = "dayitem " + st;
    const t = THEMES[i - 1];
    el.title = i + "·" + t[0];
    const dImg = DAY_DATA[i] && DAY_DATA[i].img;
    if (st === "done") el.innerHTML = '<div class="stamp" style="font-size:30px">🎏</div>';
    else if (st === "locked") el.innerHTML = '<div class="ico">🔒</div><div class="num">' + i + '</div>';
    else if (dImg) el.innerHTML = '<img class="day-thumb" src="' + dImg + '" alt=""><div class="num">' + i + '</div>';
    else el.innerHTML = '<div class="ico">' + t[2] + '</div><div class="num">' + i + '</div>';
    el.onclick = () => {
      if (st === "locked") { toast("完成「第" + (i - 1) + "天」就能解锁这一天啦 🔑"); return; }
      openDay(i);
    };
    map.appendChild(el);
  }
  const cnt = Object.keys(S.done).filter(doneDay).length;
  $("home-count").textContent = "已完成 " + cnt + " / 30 天";
  $("home-progress").style.width = (cnt / 30 * 100) + "%";
}

// ===================== 打开某一天 =====================
let CUR = 1;
function openDay(n) {
  if (!DAY_DATA[n]) { toast("这一天正在制作中，钓手叔叔马上来！🎣"); return; }
  CUR = n;
  Object.keys(recBlobs).forEach(revokeBlob);
  stopRecord();
  $("screen-home").classList.add("hidden");
  $("screen-day").classList.remove("hidden");
  const d = DAY_DATA[n];
  $("day-title").textContent = "第" + n + "天";
  $("day-chip").textContent = "第 " + n + " 天";
  if (d.img) $("day-emoji").innerHTML = '<img class="day-emoji-img" src="' + d.img + '" alt="' + d.title + '">';
  else $("day-emoji").textContent = d.emoji;
  $("day-name").textContent = d.title;
  $("day-sub").textContent = d.sub;
  renderTabs(); renderListen(); renderSpeak(); threeInit(); renderTrace(); renderMatch(); renderQuiz();
  showPanel("listen");
  if (S.mood[n] === undefined && !(S.done[n] && S.done[n].length)) moodGreet(n);
}
function goHome() {
  stopRecord();
  Object.keys(recBlobs).forEach(revokeBlob);
  $("screen-day").classList.add("hidden");
  $("screen-home").classList.remove("hidden");
  renderHome();
}
function renderTabs() {
  const done = S.done[CUR] || [];
  document.querySelectorAll("#day-tabs .tab").forEach(tab => {
    const p = tab.getAttribute("data-p");
    tab.classList.toggle("done", done.indexOf(p) >= 0);
    tab.classList.toggle("active", p === curPanel);
    let tick = tab.querySelector(".tick");
    if (!tick) { tick = document.createElement("div"); tick.className = "tick"; tick.textContent = "✓"; tab.appendChild(tick); }
  });
}
let curPanel = "listen";
function getCurPanel() { return curPanel; }
function showPanel(p) {
  curPanel = p;
  document.querySelectorAll(".panel").forEach(el => el.classList.remove("active"));
  $("panel-" + p).classList.add("active");
  document.querySelectorAll("#day-tabs .tab").forEach(t =>
    t.classList.toggle("active", t.getAttribute("data-p") === p));
  if (p === "read") threeInit();
  if (p === "play") { renderMatch(); }
}
function markDone(phrase) {
  S.done[CUR] = S.done[CUR] || [];
  if (S.done[CUR].indexOf(phrase) < 0) S.done[CUR].push(phrase);
  save(); renderTabs();
  if (PHRASES.every(p => S.done[CUR].indexOf(p) >= 0)) {
    const d = DAY_DATA[CUR];
    setTimeout(() => {
      confetti();
      clearOverlays();
      const ov = document.createElement("div"); ov.className = "overlay";
      ov.innerHTML =
        '<div class="modal"><div class="big">' + d.emoji + '</div>' +
        '<h2>第' + CUR + '天完成啦！</h2>' +
        '<p>钓手叔叔给你盖个章 🎏 明天我们去下一片水域！</p>' +
        '<button onclick="this.closest(\'.overlay\').remove();goHome()">回地图看看</button></div>';
      document.body.appendChild(ov);
    }, 400);
  }
}

// ===================== 听一听 =====================
function renderListen() {
  const d = DAY_DATA[CUR];
  const sv = d.story.map(l =>
    '<span>' + l.t + '<span class="pinyin">' + l.py + '</span></span>').join("<br>");
  $("listen-story").innerHTML = (d.img ? '<img class="story-img" src="' + d.img + '" alt="' + d.title + '">' : "") + sv;
  $("listen-moral").textContent = d.moral;
  $("listen-craft").textContent = d.craft;
  $("listen-parent").textContent = d.parent;
  $("day-craft").textContent = d.craft;
  $("listen-rhyme").innerHTML = d.rhymelines.map((line, i) =>
    '<div class="speak-line"><span class="txt">' + line + '</span>' +
    '<div class="sbtns"><button class="speaker" onclick="speak(\'' + line.replace(/'/g, "") + '\')">🔊</button></div></div>'
  ).join("");
}

// ===================== 说一说（录音） =====================
let recState = { on: false, idx: -1, rec: null, chunks: [], stream: null };
let recBlobs = {};
let replayAu = null;
function revokeBlob(idx) {
  if (recBlobs[idx]) { try { URL.revokeObjectURL(recBlobs[idx]); } catch (e) {} delete recBlobs[idx]; }
}
function stopRecord() {
  if (!recState.on) return;
  recState.on = false;
  try { recState.rec.stop(); } catch (e) {}
}
function startRecord(idx) {
  if (recState.on) { stopRecord(); return; }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { toast("此浏览器不支持录音哦"); return; }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    recState = { on: true, idx: idx, chunks: [], stream: stream, rec: null };
    const rec = new MediaRecorder(stream);
    recState.rec = rec;
    rec.ondataavailable = e => { if (e.data && e.data.size) recState.chunks.push(e.data); };
    rec.onstop = () => {
      recState.stream.getTracks().forEach(t => t.stop());
      const type = (recState.rec && recState.rec.mimeType) || "audio/webm";
      const blob = new Blob(recState.chunks, { type: type });
      revokeBlob(idx);
      recBlobs[idx] = URL.createObjectURL(blob);
      const box = $("audioBox-" + idx);
      if (box) {
        box.innerHTML = '<audio controls src="' + recBlobs[idx] + '" style="height:34px"></audio>' +
          '<button class="mic" onclick="speakReplay(' + idx + ')">🎣 再听听</button>';
      }
      syncRecBtn();
    };
    rec.start();
    syncRecBtn();
    $("speak-line-" + idx).scrollIntoView({ behavior: "smooth", block: "center" });
  }).catch(() => toast("请允许使用麦克风哦 🎤"));
}
function speakReplay(idx) {
  const a = recBlobs[idx];
  if (a) {
    if (replayAu) { try { replayAu.pause(); } catch (e) {} replayAu = null; }
    const au = new Audio(a);
    replayAu = au;
    au.onended = () => { if (replayAu === au) replayAu = null; };
    au.play();
  }
}
function syncRecBtn() {
  document.querySelectorAll("[data-mic]").forEach(b => {
    const idx = +b.getAttribute("data-mic");
    b.classList.toggle("recording", recState.on && recState.idx === idx);
    b.textContent = recState.on && recState.idx === idx ? "⏹ 保存" : (recBlobs[idx] ? "🎣 重录" : "🎣 录下来");
  });
}
function renderSpeak() {
  const d = DAY_DATA[CUR];
  $("speak-list").innerHTML = d.speak.map((line, i) => {
    const txt = (typeof line === "string") ? line : line.t;
    const img = (typeof line === "object" && line.img) ? line.img : "";
    const photo = img ? '<img class="speak-photo" src="' + img + '" loading="lazy" alt="">' : "";
    return '<div class="speak-line" id="speak-line-' + i + '">' + photo +
      '<div class="speak-main"><span class="txt">' + txt + '</span>' +
      '<div class="sbtns">' +
      '<button class="speaker" onclick="speak(\'' + txt.replace(/'/g, "") + '\')">🔊</button>' +
      '<button class="mic" data-mic="' + i + '" onclick="startRecord(' + i + ')">🎣 录下来</button>' +
      '</div></div><div id="audioBox-' + i + '" style="width:100%;display:flex;gap:8px;margin-top:6px"></div></div>';
  }).join("");
  syncRecBtn();
}

// ===================== 读一读：蒙氏三段式 =====================
let thr = { step: 1, i: 0, opted: [] };
function threeInit() {
  const d = DAY_DATA[CUR];
  thr = { step: 1, i: 0, opted: shuffle(d.vocab.map((v, k) => k)) };
  threeStage();
}
function threeStage() {
  const d = DAY_DATA[CUR], v = d.vocab;
  const hint = $("three-hint"), body = $("three-body"), ctl = $("three-ctl");
  const vocabImg = it => v[it].img ? '<img class="vocab-img" src="' + v[it].img + '" alt="">' : '<div class="emoji-lg">' + v[it].emoji + '</div>';
  if (thr.step === 1) { // 命名（图字卡/控制卡）
    hint.textContent = "第1段·命名：这是图字卡，跟着钓手叔叔读";
    const it = thr.opted[thr.i];
    body.innerHTML =
      '<div class="three-card">' + vocabImg(it) +
      '<div class="char-lg">' + v[it].char + '</div>' +
      '<div class="pylg">' + v[it].py + '</div>' +
      '<div class="word-sm">' + v[it].word + '</div></div>';
    speak(v[it].char + "，" + v[it].word);
    ctl.innerHTML =
      '<button class="ghost" onclick="speak(DAY_DATA[CUR].vocab[' + it + '].char)">🔊 再听</button>' +
      (thr.i < v.length - 1
        ? '<button onclick="thr.i++;threeStage()">下一个 ➡️</button>'
        : '<button onclick="thr.step=2;thr.i=0;threeStage()">到第2段啦 🌟</button>');
  } else if (thr.step === 2) { // 辨别（图卡 + 字卡配对）
    hint.textContent = "第2段·辨别：请把「" + v[thr.opted[thr.i]].char + "」指给我看！";
    const it = thr.opted[thr.i], target = v[it];
    const opts = shuffle(v.map((o, k) => k));
    body.innerHTML =
      '<div style="margin-bottom:10px"><div class="three-card three-card-sm">' + vocabImg(it) +
      '<div class="pylg">找一找：' + target.char + '</div></div></div>' +
      '<div class="pair-grid">' + opts.map((k, j) =>
        '<div class="vocab-cell vocab-cell-img" onclick="threePick(this,' + k + ')">' +
        (v[k].img ? '<img src="' + v[k].img + '" alt="">' : '<div class="emoji-lg">' + v[k].emoji + '</div>') +
        '</div>'
      ).join("") + '</div>';
    ctl.innerHTML = '<button class="ghost" onclick="speak(\'' + ('请把' + v[it].char + '指给我看') + '\')">🔊 提示</button>';
  } else { // 回忆（图卡 → 字卡）
    hint.textContent = "第3段·回忆：这是谁？它的字宝宝在哪里？";
    const it = thr.opted[thr.i];
    body.innerHTML =
      '<div style="margin-bottom:10px"><div class="three-card three-card-sm">' + vocabImg(it) + '</div></div>' +
      '<div class="pair-grid">' + shuffle(v.map((o, k) => k)).map(k =>
        '<div class="vocab-cell charcell" onclick="threePick(this,' + k + ')">' + v[k].char + '</div>'
      ).join("") + '</div>';
    ctl.innerHTML = '';
  }
}
function threePick(el, j) {
  const d = DAY_DATA[CUR], v = d.vocab;
  const jv = d.vocab[j];
  if (thr.step === 2) {
    const it = thr.opted[thr.i], target = v[it];
    if (target.char === jv.char) {
      el.classList.add("ansyes"); speak("对啦，判断准确！");
      setTimeout(() => {
        thr.i++;
        if (thr.i >= v.length) { thr.step = 3; thr.i = 0; threeStage(); }
        else threeStage();
      }, 900);
    } else { el.classList.add("ansno"); speak("再想一想哦"); setTimeout(() => el.classList.remove("ansno"), 500); }
  } else { // step 3
    const it = thr.opted[thr.i], target = v[it];
    if (target.char === jv.char) {
      el.classList.add("ansyes"); speak("答对啦，记性真好！");
      setTimeout(() => {
        thr.i++;
        if (thr.i >= v.length) { thr.i = 0; markDone("read"); cheer("读一读完成！生字宝宝都是你的好朋友啦 📖"); threeStage(); }
        else threeStage();
      }, 900);
    } else { el.classList.add("ansno"); speak("再想一想哦"); setTimeout(() => el.classList.remove("ansno"), 500); }
  }
}

// ===================== 写一写：描红画板 =====================
let traceChar = "鱼";
let strokes = [];
let drawing = false;
let cv = null, ctx = null;

function renderTrace() {
  const d = DAY_DATA[CUR];
  traceChar = d.chars[0];
  $("trace-tabs").innerHTML = d.chars.map(c =>
    '<button class="' + (c === traceChar ? "sel" : "") + '" onclick="setTraceChar(\'' + c + '\')">' + c + '</button>'
  ).join("");
  $("trace-seq").textContent = "✏️ 写字宝宝「" + traceChar + "」的笔顺：" + d.seq[traceChar];
  strokes = [];
  redrawTrace();
}
function setTraceChar(c) {
  traceChar = c; strokes = [];
  document.querySelectorAll("#trace-tabs button").forEach(b =>
    b.classList.toggle("sel", b.textContent === c));
  $("trace-seq").textContent = "✏️ 写字宝宝「" + traceChar + "」的笔顺：" + DAY_DATA[CUR].seq[c];
  redrawTrace();
}
function clearTrace() { strokes = []; redrawTrace(); }
function finishTrace() {
  if (strokes.length < 2) { toast("先描一描字宝宝，再告诉我写完啦 ✍️"); return; }
  confetti(); markDone("write"); toast("写一写完成！笔力越来越稳啦 ✍️");
}
function setupCanvas() {
  cv = $("trace-canvas"); if (!cv) return;
  ctx = cv.getContext("2d");
  cv.addEventListener("pointerdown", e => {
    e.preventDefault(); drawing = true;
    strokes.push([getPos(e)]);
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener("pointermove", e => {
    if (!drawing) return;
    strokes[strokes.length - 1].push(getPos(e));
    redrawTrace();
  });
  ["pointerup", "pointercancel"].forEach(ev =>
    cv.addEventListener(ev, e => { drawing = false; }));
}
function getPos(e) {
  const r = cv.getBoundingClientRect();
  const sx = r.width > 0 ? cv.width / r.width : 0;
  const sy = r.height > 0 ? cv.height / r.height : 0;
  const x = (e.clientX - r.left) * sx;
  const y = (e.clientY - r.top) * sy;
  return [
    Math.max(0, Math.min(cv.width, isFinite(x) ? x : 0)),
    Math.max(0, Math.min(cv.height, isFinite(y) ? y : 0))
  ];
}
function redrawTrace() {
  if (!ctx) return;
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = "#DCEFEF"; ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.beginPath();
  ctx.moveTo(W / 2, 20); ctx.lineTo(W / 2, H - 20);
  ctx.moveTo(20, H / 2); ctx.lineTo(W - 20, H / 2);
  ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "rgba(216,238,236,0.9)";
  ctx.font = "430px 'Kaiti SC','KaiTi','STKaiti','Microsoft YaHei',serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(traceChar, W / 2, H / 2 + 16);
  ctx.strokeStyle = "#2F86A8"; ctx.lineWidth = 20; ctx.lineCap = "round"; ctx.lineJoin = "round";
  strokes.forEach(st => {
    if (st.length < 1) return;
    ctx.beginPath();
    ctx.moveTo(st[0][0], st[0][1]);
    for (let i = 1; i < st.length; i++) ctx.lineTo(st[i][0], st[i][1]);
    ctx.stroke();
  });
}

// ===================== 玩一玩：配对游戏 + 过关 =====================
let matchSel = null;
let matchedCount = 0;
let matchComplete = false;
let sxI = 0, sxOk = 0;
function renderMatch() {
  const d = DAY_DATA[CUR], v = d.vocab;
  matchedCount = 0; matchComplete = false; matchSel = null;
  sxI = 0; sxOk = 0; renderSX();
  const eS = shuffle(v.map((o, k) => k));
  const cS = shuffle(v.map((o, k) => k));
  $("match-emoji").innerHTML = eS.map(k =>
    '<div class="pair-card" data-typ="e" data-k="' + k + '" onclick="matchTap(this)">' + (v[k].img ? '<img src="' + v[k].img + '" alt="">' : v[k].emoji) + '</div>'
  ).join("");
  $("match-char").innerHTML = cS.map(k =>
    '<div class="pair-card char" data-typ="c" data-k="' + k + '" onclick="matchTap(this)"><span class="miniN">' + v[k].char + '</span>' + v[k].char + '</div>'
  ).join("");
}
function matchTap(el) {
  if (el.classList.contains("matched")) return;
  const k = +el.getAttribute("data-k");
  const typ = el.getAttribute("data-typ");
  if (!matchSel) {
    matchSel = { typ: typ, k: k, el: el };
    el.classList.add("sel");
    return;
  }
  if (matchSel.typ === typ) {
    matchSel.el.classList.remove("sel");
    if (matchSel.k === k) return;
    matchSel = { typ: typ, k: k, el: el };
    el.classList.add("sel");
    return;
  }
  if (matchSel.k === k) {
    matchSel.el.classList.remove("sel"); el.classList.remove("sel");
    matchSel.el.classList.add("matched"); el.classList.add("matched");
    matchedCount++;
    if (matchedCount === DAY_DATA[CUR].vocab.length) {
      matchComplete = true;
      cheer("配对成功！你是配对小钓手 🧩🎉");
      speak("全部配对了，真棒！再答一答下面的小问题吧");
      maybePlayDone();
    } else { cheer("配对成功！"); speak("对了！"); }
    matchSel = null;
  } else {
    matchSel.el.classList.remove("sel"); el.classList.remove("sel");
    matchSel.el.classList.add("ansno"); el.classList.add("ansno");
    speak("不一样哦，再找找");
    const a = matchSel.el;
    matchSel = null;
    setTimeout(() => { a.classList.remove("ansno"); el.classList.remove("ansno"); }, 600);
  }
}

// ===================== 玩一玩：句式小屋（连词填空） =====================
function renderSX() {
  const d = DAY_DATA[CUR];
  const sx = d.sentence;
  $("sx-tip").textContent = sx ? "今天学「" + sx.name + "」：" + sx.tip : "";
  if (!sx) { $("sx-body").innerHTML = '<div class="done-msg">句式小屋正在装修中~</div>'; sxOk = 999; maybePlayDone(); return; }
  const s = sx.sents[sxI];
  $("sx-body").innerHTML =
    '<div class="sent-line"><span>' + s.pre + '</span><span class="blank">＿＿＿＿</span><span>' + s.post + '</span></div>' +
    '<div class="sx-opt">' + shuffle(s.opts.map((o, k) => k)).map(k =>
      '<button class="sx-chip" onclick="sxPick(this,' + k + ')">' + s.opts[k][0] + '</button>'
    ).join("") + '</div>';
}
function sxPick(btn, k) {
  const d = DAY_DATA[CUR].sentence;
  const s = d.sents[sxI];
  const opt = s.opts[k];
  if (opt[1] === 1) {
    btn.classList.add("correct");
    speak("对啦，「" + opt[0] + "」用得真准！");
    btn.disabled = true;
    setTimeout(() => {
      sxI++; sxOk++;
      if (sxI >= d.sents.length) {
        $("sx-body").innerHTML = '<div class="done-msg">🎉 句式小屋全装修好啦！「' + d.name + '」你会用啦！去答一答上面的配对和问题吧</div>';
        maybePlayDone();
      } else renderSX();
    }, 900);
  } else {
    btn.classList.add("wrong"); btn.disabled = true;
    speak("再想想，哪种连接更通顺？");
    setTimeout(() => { btn.classList.remove("wrong"); btn.disabled = false; }, 500);
  }
}

// ===================== 玩一玩：小过关测验 =====================
let qzCur = 0; let qzLock = false;
function renderQuiz() {
  qzCur = 0; qzLock = false;
  quizStage();
}
function maybePlayDone() {
  const d = DAY_DATA[CUR];
  const sxNeed = d.sentence ? d.sentence.sents.length : 0;
  if (matchedCount === d.vocab.length && qzCur >= d.quiz.length && sxOk >= sxNeed) {
    markDone("play");
  }
}
function quizStage() {
  const d = DAY_DATA[CUR], qs = d.quiz;
  if (qzCur >= qs.length) {
    $("quiz-body").innerHTML =
      '<div class="done-msg">🎖️ 小问题都答过啦！你听故事可真认真！</div>';
    maybePlayDone(); return;
  }
  const q = qs[qzCur];
  const opts = shuffle(q.opt.map((o, k) => k));
  $("quiz-body").innerHTML =
    '<div class="q">❓ ' + q.p + '</div>' +
    '<div class="qz-opt">' + opts.map(k => {
      const o = q.opt[k];
      return '<button data-k="' + k + '" onclick="quizPick(this,' + k + ')"><div>' + o.e + '</div><span>' + o.t + '</span></button>';
    }).join("") + '</div>';
  qzLock = false;
}
function quizPick(btn, k) {
  if (qzLock) return; qzLock = true;
  const q = DAY_DATA[CUR].quiz[qzCur];
  const right = q.opt[k].r === 1;
  btn.classList.add(right ? "right" : "wrong");
  speak(right ? "答对啦！" : "再想想另一个");
  setTimeout(() => {
    qzCur++; quizStage();
  }, right ? 900 : 500);
}

// ===================== 早安心情打卡 =====================
function moodGreet(n) {
  clearOverlays();
  const ov = document.createElement("div"); ov.className = "overlay";
  ov.innerHTML =
    '<div class="modal"><div class="big">🌞</div>' +
    '<h2>小钓手早上好！</h2><p>今天精神怎么样，准备去钓哪条"大鱼"？</p>' +
    '<div class="mood-row">' +
    '<button onclick="setMood(' + n + ',\'满电\')"><b>⚡</b>满电出发</button>' +
    '<button onclick="setMood(' + n + ',\'平稳\')"><b>😊</b>稳稳当当</button>' +
    '<button onclick="setMood(' + n + ',\'犯困\')"><b>😴</b>有点犯困</button>' +
    '</div></div>';
  document.body.appendChild(ov);
}
function setMood(n, m) {
  S.mood[n] = m; save();
  document.querySelectorAll(".overlay").forEach(o => o.remove());
  const words = { "满电": "好，精神满满！钓手叔叔陪你出发！", "平稳": "稳如老钓手，今天一定有好收获。", "犯困": "先喝水打个精神，我们慢慢来。" };
  speak(words[m]);
}

// ===================== 小横幅（激励语） =====================
function cheer(msg) {
  const el = document.createElement("div");
  el.className = "toast show";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

// ===================== 初始化 =====================
function resetAll() {
  localStorage.removeItem(K);
  S = { done: {}, mood: {}, welcomed: false };
  location.reload();
}
function startToday() {
  const t = document.querySelector(".dayitem.today");
  if (t) { t.click(); return; }
  for (let i = 1; i <= 30; i++) { if (dayStatus(i) !== "locked") { openDay(i); return; } }
  renderHome();
}
function init() {
  setupCanvas();
  renderHome();
  if (!S.welcomed) {
    S.welcomed = true; save();
    clearOverlays();
    const ov = document.createElement("div"); ov.className = "overlay";
    ov.innerHTML =
      '<div class="modal"><div class="big">🎣</div>' +
      '<h2>欢迎来到小钓手的30天钓鱼学院</h2>' +
      '<p style="text-align:left;font-size:15px;line-height:1.9;color:var(--ink)">' +
      '这是一个给 8 岁小钓手的中文成长营：<br>' +
      '👂 听一听：每天一个钓鱼故事／典故（自动朗读）<br>' +
      '🗣️ 说一说：跟读 + 录音回放<br>' +
      '📖 读一读：三段式识字卡<br>' +
      '✍️ 写一写：描红写字板<br>' +
      '🎮 玩一玩：配对游戏 + 小过关<br>' +
      '每天完成 5 个环节解锁下一天，共 30 天。' +
      '</p>' +
      '<button onclick="this.closest(\'.overlay\').remove();startToday()">开始第 1 天 🎣</button>' +
      '<div style="margin-top:8px"><button class="ghost" onclick="resetAll()">🗑️ 重置进度</button></div>' +
      '</div>';
    document.body.appendChild(ov);
  }
}
document.addEventListener("DOMContentLoaded", init);