/* ============================================
   Homework Buddy · 作业小助手
   共享逻辑：i18n / 账号存储 / 卡通形象 / 音效 / 工具
   ============================================ */

/* ---------- 国际化字典 ---------- */
const I18N = {
  zh: {
    appName: "作业小助手",
    login: "登录", register: "注册", logout: "退出登录",
    username: "用户名", password: "密码", confirmPassword: "确认密码",
    parentMode: "家长模式", parentPwd: "家长密码",
    welcome: "欢迎回来", slogan: "认真写作业，开心拿奖励！",
    calendar: "日历", addHomework: "新增作业", timer: "番茄钟",
    reward: "盲盒抽奖", progress: "进度管理", studyLock: "学习锁",
    settings: "设置", home: "首页",
    today: "今天", tomorrow: "明天", yesterday: "昨天",
    date: "日期", subject: "科目", difficulty: "难度",
    easy: "简单", medium: "中等", hard: "困难",
    title: "作业内容", save: "保存", cancel: "取消", delete: "删除",
    todo: "未开始", doing: "进行中", done: "已完成",
    start: "开始", pause: "暂停", reset: "重置", finish: "完成",
    timeUp: "时间到啦！休息一下吧~",
    draw: "抽奖", myRewards: "我的奖励", rewardPool: "奖励池",
    addReward: "添加奖励", rewardType: "奖励类型",
    snack: "零食", animation: "动画时长", money: "零花钱", points: "虚拟积分",
    history: "抽奖记录",
    monitor: "学习监控", lock: "锁定", unlock: "解锁",
    language: "语言", sound: "提醒音效", fontSize: "字号",
    cashNeedParent: "现金奖励需家长权限",
    emptyHW: "今天还没有作业哦，快去添加吧！",
    confirmDelete: "确定要删除这条作业吗？",
    saved: "保存成功！",
    noStudy: "小朋友，要认真写作业哦~",
    studying: "正在认真学习中",
    inputCity: "",
  },
  en: {
    appName: "Homework Buddy",
    login: "Login", register: "Register", logout: "Logout",
    username: "Username", password: "Password", confirmPassword: "Confirm Password",
    parentMode: "Parent Mode", parentPwd: "Parent Password",
    welcome: "Welcome back", slogan: "Study hard, get rewarded!",
    calendar: "Calendar", addHomework: "Add Homework", timer: "Timer",
    reward: "Lucky Box", progress: "Progress", studyLock: "Study Lock",
    settings: "Settings", home: "Home",
    today: "Today", tomorrow: "Tomorrow", yesterday: "Yesterday",
    date: "Date", subject: "Subject", difficulty: "Difficulty",
    easy: "Easy", medium: "Medium", hard: "Hard",
    title: "Homework", save: "Save", cancel: "Cancel", delete: "Delete",
    todo: "To Do", doing: "Doing", done: "Done",
    start: "Start", pause: "Pause", reset: "Reset", finish: "Finish",
    timeUp: "Time's up! Take a break~",
    draw: "Draw", myRewards: "My Rewards", rewardPool: "Reward Pool",
    addReward: "Add Reward", rewardType: "Reward Type",
    snack: "Snack", animation: "Screen Time", money: "Pocket Money", points: "Points",
    history: "Draw History",
    monitor: "Study Monitor", lock: "Lock", unlock: "Unlock",
    language: "Language", sound: "Sound", fontSize: "Font Size",
    cashNeedParent: "Pocket money rewards need parent permission",
    emptyHW: "No homework today. Add one now!",
    confirmDelete: "Delete this homework?",
    saved: "Saved!",
    noStudy: "Hey buddy, let's focus on homework~",
    studying: "Studying hard",
  }
};

/* ---------- 语言与存储 ---------- */
const LS = {
  get(key, def) {
    try { const v = localStorage.getItem(key); return v == null ? def : JSON.parse(v); }
    catch { return def; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  remove(key) { localStorage.removeItem(key); }
};

function currentLang() { return LS.get("hw_lang", "zh"); }
function setLang(lang) {
  LS.set("hw_lang", lang);
  document.documentElement.lang = lang;
  applyI18n();
}
function t(key) {
  const lang = currentLang();
  return (I18N[lang] && I18N[lang][key]) || key;
}
function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    el.textContent = t(k);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
  document.title = t("appName");
}

/* ---------- 账号系统（本地模拟云端） ---------- */
const ACCOUNTS_KEY = "hw_accounts";
const SESSION_KEY  = "hw_session";

function getAccounts() { return LS.get(ACCOUNTS_KEY, {}); }
function setAccounts(a) { LS.set(ACCOUNTS_KEY, a); }
function currentUser() { return LS.get(SESSION_KEY, null); }
function requireLogin() {
  if (!currentUser()) {
    location.href = "index.html";
    return false;
  }
  return true;
}
function login(username, password) {
  const accs = getAccounts();
  if (!accs[username]) return { ok: false, msg: "账号不存在 / Account not found" };
  if (accs[username].password !== password) return { ok: false, msg: "密码错误 / Wrong password" };
  LS.set(SESSION_KEY, username);
  // 初始化该用户数据
  ensureUserData(username);
  return { ok: true };
}
function register(username, password) {
  const accs = getAccounts();
  if (!username || !password) return { ok: false, msg: "请输入用户名和密码" };
  if (accs[username]) return { ok: false, msg: "账号已存在" };
  accs[username] = { password, createdAt: Date.now() };
  setAccounts(accs);
  LS.set(SESSION_KEY, username);
  ensureUserData(username);
  return { ok: true };
}
function logout() { LS.remove(SESSION_KEY); location.href = "index.html"; }

// 每个用户独立命名空间
function uKey(key) {
  const u = currentUser();
  return `hw_${u}_${key}`;
}
function uGet(key, def) { return LS.get(uKey(key), def); }
function uSet(key, val) { LS.set(uKey(key), val); }

function ensureUserData(username) {
  const prefix = `hw_${username}_`;
  if (!LS.get(prefix + "homeworks", null)) uSetRaw(username, "homeworks", []);
  if (!LS.get(prefix + "rewards", null)) uSetRaw(username, "rewards", defaultRewards());
  if (!LS.get(prefix + "settings", null)) uSetRaw(username, "settings", { sound: true, fontSize: "md" });
  if (!LS.get(prefix + "studyLock", null)) uSetRaw(username, "studyLock", { password: "", enabled: false });
}
function uSetRaw(username, key, val) { LS.set(`hw_${username}_${key}`, val); }

function defaultRewards() {
  return [
    { id: id(), name: "小零食一包", type: "snack", icon: "🍪", count: 1 },
    { id: id(), name: "看动画30分钟", type: "animation", icon: "📺", count: 1 },
    { id: id(), name: "5元零花钱", type: "money", icon: "💰", count: 1, needParent: true },
    { id: id(), name: "10个积分", type: "points", icon: "⭐", count: 1 },
    { id: id(), name: "20个积分", type: "points", icon: "🌟", count: 1 },
  ];
}

/* ---------- 通用工具 ---------- */
function id() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function fmtDate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear(), m = String(dt.getMonth()+1).padStart(2,"0"), day = String(dt.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function todayStr() { return fmtDate(new Date()); }
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return fmtDate(d);
}
function weekdayLabel(dateStr) {
  const d = new Date(dateStr);
  const labels = currentLang() === "zh"
    ? ["周日","周一","周二","周三","周四","周五","周六"]
    : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return labels[d.getDay()];
}

/* ---------- 作业数据操作 ---------- */
function getHomeworks() { return uGet("homeworks", []); }
function saveHomeworks(list) { uSet("homeworks", list); }
function addHomework(hw) {
  const list = getHomeworks();
  hw.id = id();
  hw.status = hw.status || "todo";
  hw.createdAt = Date.now();
  list.push(hw);
  saveHomeworks(list);
  return hw;
}
function updateHomework(id, patch) {
  const list = getHomeworks();
  const i = list.findIndex(h => h.id === id);
  if (i >= 0) { list[i] = { ...list[i], ...patch }; saveHomeworks(list); }
}
function deleteHomework(id) {
  saveHomeworks(getHomeworks().filter(h => h.id !== id));
}
function getHomeworksByDate(dateStr) {
  return getHomeworks().filter(h => h.date === dateStr);
}

/* ---------- 音效（柔和提示音） ---------- */
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playBeep(freq = 660, duration = 0.18, type = "sine", vol = 0.18) {
  if (!uGet("settings", { sound: true }).sound) return;
  try {
    ensureAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    o.stop(audioCtx.currentTime + duration);
  } catch (e) { /* noop */ }
}
function playSuccess() {
  playBeep(523, 0.12, "sine");
  setTimeout(() => playBeep(659, 0.12, "sine"), 120);
  setTimeout(() => playBeep(784, 0.2, "sine"), 240);
}
function playTimeUp() {
  playBeep(880, 0.2, "triangle", 0.22);
  setTimeout(() => playBeep(660, 0.2, "triangle", 0.22), 220);
  setTimeout(() => playBeep(880, 0.3, "triangle", 0.22), 440);
}
function playClick() { playBeep(440, 0.05, "square", 0.08); }

/* ---------- Toast ---------- */
function toast(msg, ms = 2000) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; setTimeout(() => el.remove(), 300); }, ms);
}

/* ---------- 卡通吉祥物气泡 ---------- */
function mascotSay(msg, ms = 2800) {
  let bubble = document.querySelector(".mascot-bubble");
  if (!bubble) return;
  bubble.textContent = msg;
  bubble.classList.add("show");
  clearTimeout(bubble._t);
  bubble._t = setTimeout(() => bubble.classList.remove("show"), ms);
}
function mascotInit() {
  const m = document.querySelector(".mascot");
  if (!m) return;
  m.addEventListener("click", () => {
    const tips = currentLang() === "zh"
      ? ["加油哦！你真棒！🌟", "写完作业可以抽奖啦~ 🎁", "记得认真写字哦！✍️", "学习累了就休息一下吧~ 😊"]
      : ["You're doing great! 🌟", "Finish homework to get a reward! 🎁", "Write carefully! ✍️", "Take a break if tired~ 😊"];
    mascotSay(tips[Math.floor(Math.random()*tips.length)]);
    playClick();
  });
}

/* ---------- 渲染通用头部 ---------- */
function renderHeader(active) {
  const h = document.querySelector(".app-header");
  if (!h) return;
  const u = currentUser() || "Guest";
  const items = [
    { k: "calendar",     href: "calendar.html",  label: "calendar" },
    { k: "addHomework",  href: "add-homework.html", label: "addHomework" },
    { k: "timer",        href: "timer.html",     label: "timer" },
    { k: "reward",       href: "reward.html",    label: "reward" },
    { k: "progress",     href: "progress.html",  label: "progress" },
    { k: "studyLock",    href: "study-lock.html",label: "studyLock" },
    { k: "settings",     href: "settings.html",  label: "settings" },
  ];
  h.innerHTML = `
    <div class="logo">📘</div>
    <h1 data-i18n="appName">作业小助手</h1>
    <div class="nav-btns">
      ${items.map(it => `<a class="nav-btn ${it.k===active?'active':''}" href="${it.href}" data-i18n="${it.label}">${t(it.label)}</a>`).join("")}
      <span class="nav-btn" style="cursor:default">👤 ${u}</span>
    </div>`;
}

/* ---------- 渲染底部手机导航 ---------- */
function renderBottomNav(active) {
  const b = document.querySelector(".bottom-nav");
  if (!b) return;
  const items = [
    { k: "calendar",    href: "calendar.html",  ico: "📅", label: "calendar" },
    { k: "addHomework", href: "add-homework.html", ico: "➕", label: "addHomework" },
    { k: "timer",       href: "timer.html",     ico: "⏱️", label: "timer" },
    { k: "reward",      href: "reward.html",    ico: "🎁", label: "reward" },
    { k: "progress",    href: "progress.html",  ico: "📊", label: "progress" },
    { k: "settings",    href: "settings.html",  ico: "⚙️", label: "settings" },
  ];
  b.innerHTML = items.map(it =>
    `<a href="${it.href}" class="${it.k===active?'active':''}"><span class="ico">${it.ico}</span><span data-i18n="${it.label}">${t(it.label)}</span></a>`
  ).join("");
}

/* ---------- 通用难度/状态显示 ---------- */
function diffLabel(d) {
  const map = { easy: {c:"diff-easy",   t:"easy",   e:"😊"}, medium:{c:"diff-medium",t:"medium",e:"🤔"}, hard:{c:"diff-hard",t:"hard",e:"😤"} };
  const o = map[d] || map.medium;
  return `<span class="diff ${o.c}">${o.e} ${t(o.t)}</span>`;
}
function statusLabel(s) {
  const map = { todo:{c:"status-todo",t:"todo",e:"⭕"}, doing:{c:"status-doing",t:"doing",e:"▶️"}, done:{c:"status-done",t:"done",e:"✅"} };
  const o = map[s] || map.todo;
  return `<span class="status-tag ${o.c}">${o.e} ${t(o.t)}</span>`;
}
function subjectIcon(s) {
  const map = { 语文:"📖", 数学:"🔢", 英语:"🔤", 科学:"🔬", 美术:"🎨", 音乐:"🎵", 体育:"⚽", 其他:"📚",
                Chinese:"📖", Math:"🔢", English:"🔤", Science:"🔬", Art:"🎨", Music:"🎵", PE:"⚽", Other:"📚" };
  return map[s] || "📚";
}

/* ---------- 页面初始化通用 ---------- */
function initPage(active) {
  renderHeader(active);
  renderBottomNav(active);
  applyI18n();
  mascotInit();
  // 字号
  const fs = uGet("settings", {fontSize:"md"}).fontSize;
  if (fs === "lg") document.body.style.fontSize = "20px";
  else if (fs === "sm") document.body.style.fontSize = "16px";
}

/* ---------- 暴露到全局 ---------- */
window.HW = {
  I18N, t, setLang, currentLang,
  currentUser, requireLogin, login, register, logout,
  uGet, uSet, getHomeworks, saveHomeworks, addHomework, updateHomework, deleteHomework, getHomeworksByDate,
  id, fmtDate, todayStr, addDays, weekdayLabel,
  playBeep, playSuccess, playTimeUp, playClick,
  toast, mascotSay, mascotInit, initPage,
  diffLabel, statusLabel, subjectIcon,
};
