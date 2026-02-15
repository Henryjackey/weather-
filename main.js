// ===== DOM =====
const titleEl = document.getElementById("title");
const descEl  = document.getElementById("desc");
const scene   = document.getElementById("scene");

const precip    = document.getElementById("precip");
const windLayer = document.getElementById("wind");
const lightning = document.getElementById("lightning");

const magicBtn = document.getElementById("magicBtn");
const cycleBtn = document.getElementById("cycleBtn");
const fireBtn  = document.getElementById("fireBtn");

// Fireworks canvas
const fwCanvas = document.getElementById("fireworks");
const fwCtx = fwCanvas.getContext("2d", { alpha: true });

// ===== utils =====
const rand = (min, max) => min + Math.random() * (max - min);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const toast = document.getElementById("toast");

// =======================================================
// 🌦️ Weather（只有“随机/下一种”按钮，无下拉）
// =======================================================
const WEATHERS = [
  {
    id:"sunny", name:"晴天 ☀️",
    title:"晴天 ☀️",
    desc:"难得晴一会儿，能晒点就晒点 ~☀️",
    vars:{
      "--sky-1":"#a8dbff","--sky-2":"#e9f7ff",
      "--castle-opacity":".15","--castle-blur":".8px",
      "--cloud-opacity":".20","--cloud-speed":"13s",
      "--fog-opacity":".05","--precip-opacity":"0",
      "--wind-opacity":"0","--scene-sat":"1.03","--scene-ct":"1.05"
    },
    precip:{type:"none"}, wind:{on:false}, thunder:{on:false}
  },
  {
    id:"partly", name:"多云 ⛅",
    title:"多云 ⛅",
    desc:"太阳在打盹，云在加班......",
    vars:{
      "--sky-1":"#9fd3ff","--sky-2":"#e8f4ff",
      "--castle-opacity":".16","--castle-blur":"1px",
      "--cloud-opacity":".30","--cloud-speed":"11s",
      "--fog-opacity":".07","--precip-opacity":"0",
      "--wind-opacity":"0","--scene-sat":"1.0","--scene-ct":"1.04"
    },
    precip:{type:"none"}, wind:{on:false}, thunder:{on:false}
  },
  {
    id:"overcast", name:"阴天 ☁️",
    title:"阴天 ☁️",
    desc:"又是阴天…维生素D库存告急！",
    vars:{
      "--sky-1":"#8ec7ff","--sky-2":"#dbeeff",
      "--castle-opacity":".17","--castle-blur":"1.2px",
      "--cloud-opacity":".44","--cloud-speed":"10s",
      "--fog-opacity":".10","--precip-opacity":"0",
      "--wind-opacity":"0","--scene-sat":".97","--scene-ct":"1.02"
    },
    precip:{type:"none"}, wind:{on:false}, thunder:{on:false}
  },
  {
    id:"windy", name:"大风 💨",
    title:"大风 💨",
    desc:"云跑得更快咯......",
    vars:{
      "--sky-1":"#86c5ff","--sky-2":"#d9f0ff",
      "--castle-opacity":".15","--castle-blur":"1px",
      "--cloud-opacity":".26","--cloud-speed":"6.5s",
      "--fog-opacity":".06","--precip-opacity":"0",
      "--wind-opacity":".85","--wind-speed":"0.90s",
      "--scene-sat":".99","--scene-ct":"1.04"
    },
    precip:{type:"none"}, wind:{on:true, gusts:8}, thunder:{on:false}
  },
  {
    id:"foggy", name:"大雾 🌫️",
    title:"大雾 🌫️",
    desc:"城堡远远的像在梦里——",
    vars:{
      "--sky-1":"#9cc9f3","--sky-2":"#e9f2ff",
      "--castle-opacity":".10","--castle-blur":"2.2px",
      "--cloud-opacity":".20","--cloud-speed":"12s",
      "--fog-opacity":".46","--precip-opacity":"0",
      "--wind-opacity":"0","--scene-sat":".93","--scene-ct":"1.01"
    },
    precip:{type:"none"}, wind:{on:false}, thunder:{on:false}
  },

  // 雨
  {
    id:"rain_light", name:"小雨 🌦️",
    title:"小雨 🌦️",
    desc:"滴滴答答，滴滴答答",
    vars:{
      "--sky-1":"#84bfff","--sky-2":"#d7ecff",
      "--castle-opacity":".15","--castle-blur":"1.2px",
      "--cloud-opacity":".34","--cloud-speed":"10s",
      "--fog-opacity":".14","--precip-opacity":".85",
      "--wind-opacity":"0","--scene-sat":".97","--scene-ct":"1.02"
    },
    precip:{type:"rain", count:44, minDur:0.95, maxDur:1.55},
    wind:{on:false}, thunder:{on:false}
  },
  {
    id:"rain_medium", name:"中雨 🌧️",
    title:"中雨 🌧️",
    desc:"雨更密啦…",
    vars:{
      "--sky-1":"#76b6ff","--sky-2":"#cfe6ff",
      "--castle-opacity":".15","--castle-blur":"1.3px",
      "--cloud-opacity":".40","--cloud-speed":"9s",
      "--fog-opacity":".18","--precip-opacity":".95",
      "--wind-opacity":".12","--wind-speed":"1.10s",
      "--scene-sat":".96","--scene-ct":"1.02"
    },
    precip:{type:"rain", count:74, minDur:0.75, maxDur:1.25},
    wind:{on:true, gusts:3}, thunder:{on:false}
  },
  {
    id:"rain_heavy", name:"暴雨 🌧️",
    title:"暴雨 🌧️",
    desc:"这雨有点狠，卡皮巴拉也顶不住！",
    vars:{
      "--sky-1":"#6aaeff","--sky-2":"#c6ddff",
      "--castle-opacity":".13","--castle-blur":"1.6px",
      "--cloud-opacity":".48","--cloud-speed":"8s",
      "--fog-opacity":".22","--precip-opacity":"1",
      "--wind-opacity":".22","--wind-speed":"1.00s",
      "--scene-sat":".94","--scene-ct":"1.01"
    },
    precip:{type:"rain", count:115, minDur:0.55, maxDur:0.95},
    wind:{on:true, gusts:6}, thunder:{on:false}
  },
  {
    id:"thunder", name:"雷雨 ⛈️",
    title:"雷雨 ⛈️",
    desc:"轰隆一下，下一秒又装没事hh",
    vars:{
      "--sky-1":"#5aa3ff","--sky-2":"#bcd6ff",
      "--castle-opacity":".12","--castle-blur":"1.9px",
      "--cloud-opacity":".52","--cloud-speed":"7.5s",
      "--fog-opacity":".24","--precip-opacity":"1",
      "--wind-opacity":".26","--wind-speed":"0.95s",
      "--scene-sat":".93","--scene-ct":"1.01"
    },
    precip:{type:"rain", count:105, minDur:0.55, maxDur:0.95},
    wind:{on:true, gusts:7}, thunder:{on:true, minGap:900, maxGap:2400}
  },

  // 雪
  {
    id:"snow_light", name:"小雪 🌨️",
    title:"小雪 🌨️",
    desc:"轻轻飘，世界的音量被调小了一点点。",
    vars:{
      "--sky-1":"#b9dcff","--sky-2":"#f2f8ff",
      "--castle-opacity":".14","--castle-blur":"1.2px",
      "--cloud-opacity":".22","--cloud-speed":"12s",
      "--fog-opacity":".14","--precip-opacity":".95",
      "--wind-opacity":".08","--wind-speed":"1.2s",
      "--scene-sat":".98","--scene-ct":"1.03"
    },
    precip:{type:"snow", count:42, minDur:3.0, maxDur:5.6},
    wind:{on:true, gusts:2}, thunder:{on:false}
  },
  {
    id:"snow_medium", name:"中雪 ❄️",
    title:"中雪 ❄️",
    desc:"雪更密咯…路上走路要小心",
    vars:{
      "--sky-1":"#b2d6ff","--sky-2":"#eef6ff",
      "--castle-opacity":".12","--castle-blur":"1.6px",
      "--cloud-opacity":".26","--cloud-speed":"10.5s",
      "--fog-opacity":".18","--precip-opacity":"1",
      "--wind-opacity":".14","--wind-speed":"1.05s",
      "--scene-sat":".97","--scene-ct":"1.03"
    },
    precip:{type:"snow", count:70, minDur:2.4, maxDur:4.8},
    wind:{on:true, gusts:4}, thunder:{on:false}
  },
  {
    id:"snow_blizzard", name:"暴雪 🌨️💨",
    title:"暴雪 🌨️💨",
    desc:"风卷着雪跑——快撤回室内",
    vars:{
      "--sky-1":"#a9d0ff","--sky-2":"#e8f2ff",
      "--castle-opacity":".10","--castle-blur":"2.2px",
      "--cloud-opacity":".28","--cloud-speed":"8s",
      "--fog-opacity":".26","--precip-opacity":"1",
      "--wind-opacity":".68","--wind-speed":"0.82s",
      "--scene-sat":".95","--scene-ct":"1.02"
    },
    precip:{type:"snow", count:120, minDur:1.8, maxDur:3.2},
    wind:{on:true, gusts:10}, thunder:{on:false}
  },
];

let weatherIdx = 1;
let thunderTimer = null;

function applyVars(vars){
  for (const [k,v] of Object.entries(vars)) scene.style.setProperty(k, v);
}

function clearPrecip(){ precip.innerHTML = ""; }

function makeRain({count, minDur, maxDur}){
  clearPrecip();
  for (let i=0;i<count;i++){
    const d = document.createElement("div");
    d.className = "p-drop p-rain";
    d.style.left = (Math.random()*100).toFixed(2) + "%";
    d.style.animationDelay = (Math.random()*0.8).toFixed(2) + "s";
    const dur = minDur + Math.random()*(maxDur-minDur);
    d.style.animationDuration = dur.toFixed(2) + "s";
    precip.appendChild(d);
  }
}

function makeSnow({count, minDur, maxDur}){
  clearPrecip();
  for (let i=0;i<count;i++){
    const s = document.createElement("div");
    s.className = "p-drop p-snow";
    s.style.left = (Math.random()*100).toFixed(2) + "%";
    s.style.animationDelay = (Math.random()*1.2).toFixed(2) + "s";
    const dur = minDur + Math.random()*(maxDur-minDur);
    s.style.animationDuration = dur.toFixed(2) + "s";
    const size = 3.5 + Math.random()*4.5;
    s.style.width = size.toFixed(1) + "px";
    s.style.height = size.toFixed(1) + "px";
    precip.appendChild(s);
  }
}

function makeWind(gusts=5){
  windLayer.innerHTML = "";
  for (let i=0;i<gusts;i++){
    const g = document.createElement("div");
    g.className = "gust";
    g.style.top = (22 + Math.random()*60).toFixed(1) + "%";
    g.style.animationDelay = (Math.random()*1.0).toFixed(2) + "s";
    g.style.width = (110 + Math.random()*160).toFixed(0) + "px";
    windLayer.appendChild(g);
  }
}

function stopThunder(){
  if (thunderTimer){ clearTimeout(thunderTimer); thunderTimer=null; }
  lightning.style.opacity = "0";
}

function flashOnce(){
  lightning.style.opacity = "1";
  setTimeout(()=> lightning.style.opacity="0", 90);
  if (Math.random()<0.5){
    setTimeout(()=>{
      lightning.style.opacity="1";
      setTimeout(()=> lightning.style.opacity="0", 75);
    }, 150);
  }
}

function startThunder(minGap, maxGap){
  stopThunder();
  const loop = ()=>{
    flashOnce();
    thunderTimer = setTimeout(loop, rand(minGap, maxGap));
  };
  thunderTimer = setTimeout(loop, rand(minGap, maxGap));
}

function setWeatherByIndex(i){
  weatherIdx = (i + WEATHERS.length) % WEATHERS.length;
  const w = WEATHERS[weatherIdx];

  titleEl.textContent = w.title;
  descEl.textContent  = w.desc;

  scene.classList.toggle("is-windy", w.id==="windy" || w.id==="snow_blizzard");

  applyVars(w.vars);

  if (w.precip.type==="rain") makeRain(w.precip);
  else if (w.precip.type==="snow") makeSnow(w.precip);
  else clearPrecip();

  if (w.wind.on) makeWind(w.wind.gusts);
  else windLayer.innerHTML = "";

  if (w.thunder.on) startThunder(w.thunder.minGap, w.thunder.maxGap);
  else stopThunder();

  magicBtn.textContent =`✨ 随机一下（现在：${w.name}）`;

 // 切天气时清一下烟花残影，避免上一帧黑色拖尾残留
}

function randomWeather(){
  let next = Math.floor(Math.random()*WEATHERS.length);
  if (next === weatherIdx) next = (next + 1) % WEATHERS.length;
  setWeatherByIndex(next);
}

magicBtn.addEventListener("click", randomWeather);
cycleBtn.addEventListener("click", ()=> setWeatherByIndex(weatherIdx + 1));

// 启动默认随机一次（更有“魔法”感）
setWeatherByIndex(weatherIdx);


// =======================================================
// 🧨 Fireworks（更盛大：齐射、多重爆裂、尾迹、闪光 bloom）
// 与天气完全独立
// =======================================================
let fireworksOn = false;
let rafId = null;
let autoTimer = null;

function resizeCanvas(){
  const rect = fwCanvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  fwCanvas.width  = Math.floor(rect.width  * dpr);
  fwCanvas.height = Math.floor(rect.height * dpr);
  fwCtx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 粒子系统
const rockets = [];
const sparks  = [];
const blooms  = []; // 闪光圈（盛大感）

function spawnRocketVolley(x, yTarget, n){
  for (let i=0;i<n;i++){
    rockets.push({
      x: x + rand(-30, 30),
      y: fwCanvas.clientHeight + 14,
      vx: rand(-0.9, 0.9),
      vy: rand(-10.8, -8.8),
      yTarget: yTarget + rand(-18, 18),
      hue: rand(0, 360),
      life: 0,
      trail: []
    });
  }
}

function explode(x, y, hue){
  // bloom 光圈（“盛大”关键）
  blooms.push({ x, y, r: 10, a: 0.55, hue });

  // 多花型：随机选择
  const mode = Math.random();
  if (mode < 0.45) burstChrysanthemum(x, y, hue);
  else if (mode < 0.75) burstSpiral(x, y, hue);
  else burstRing(x, y, hue);

  // 二次爆裂（更盛大）
  if (Math.random() < 0.55){
    setTimeout(()=>{
      blooms.push({ x, y, r: 8, a: 0.45, hue: hue + rand(-30,30) });
      burstChrysanthemum(x + rand(-18,18), y + rand(-10,10), hue + rand(-25,25), 0.8);
    }, rand(120, 260));
  }
}

function burstChrysanthemum(x, y, hue, strength=1){
  const count = Math.floor(rand(90, 150) * strength);
  for (let i=0;i<count;i++){
    const a = rand(0, Math.PI*2);
    const sp = rand(1.6, 5.4) * strength;
    sparks.push({
      x, y,
      vx: Math.cos(a)*sp,
      vy: Math.sin(a)*sp,
      g: 0.055,
      drag: 0.985,
      life: rand(46, 82),
      hue: hue + rand(-18, 18),
      a: 1
    });
  }
  // 金粉尾巴
  for (let i=0;i<Math.floor(rand(26, 44)*strength);i++){
    sparks.push({
      x, y,
      vx: rand(-1.6, 1.6),
      vy: rand(-1.6, 1.6),
      g: 0.04,
      drag: 0.97,
      life: rand(26, 44),
      hue: 45 + rand(-12, 12),
      a: 1
    });
  }
}

function burstRing(x, y, hue){
  const count = Math.floor(rand(80, 120));
  const base = rand(3.2, 5.0);
  for (let i=0;i<count;i++){
    const a = (Math.PI*2) * (i / count);
    const sp = base + rand(-0.25, 0.25);
    sparks.push({
      x, y,
      vx: Math.cos(a)*sp,
      vy: Math.sin(a)*sp,
      g: 0.04,
      drag: 0.988,
      life: rand(42, 70),
      hue: hue + rand(-10, 10),
      a: 1
    });
  }
}

function burstSpiral(x, y, hue){
  const count = Math.floor(rand(110, 160));
  for (let i=0;i<count;i++){
    const t = i / count;
    const a = t * Math.PI * 10 + rand(-0.08, 0.08);
    const sp = (1.2 + t * 4.2) + rand(-0.3, 0.3);
    sparks.push({
      x, y,
      vx: Math.cos(a)*sp,
      vy: Math.sin(a)*sp,
      g: 0.045,
      drag: 0.986,
      life: rand(46, 78),
      hue: hue + t * 40 + rand(-14, 14),
      a: 1
    });
  }
}

function drawBloom(b){
  // 软光圈
  fwCtx.beginPath();
  fwCtx.fillStyle = `hsla(${b.hue}, 95%, 70%, ${b.a})`;
  fwCtx.arc(b.x, b.y, b.r, 0, Math.PI*2);
  fwCtx.fill();
}

function stepFireworks(){
  const w = fwCanvas.clientWidth;
  const h = fwCanvas.clientHeight;

  // 更“盛大”的尾迹：残影更轻一些（黑底叠加透明）
  fwCtx.fillStyle = "rgba(0,0,0,0.10)";
  fwCtx.fillRect(0,0,w,h);

  // blooms
  for (let i=blooms.length-1;i>=0;i--){
    const b = blooms[i];
    b.r += 2.8;
    b.a *= 0.88;
    drawBloom(b);
    if (b.a < 0.03) blooms.splice(i,1);
  }

  // rockets
  for (let i=rockets.length-1;i>=0;i--){
    const r = rockets[i];
    r.life++;

    // 运动
    r.x += r.vx;
    r.y += r.vy;
    r.vy += 0.11;

    // 轨迹点
    r.trail.push({x:r.x, y:r.y});
    if (r.trail.length > 12) r.trail.shift();

    // 画拖尾
    for (let k=0;k<r.trail.length;k++){
      const t = r.trail[k];
      const a = k / r.trail.length;
      fwCtx.beginPath();
      fwCtx.fillStyle = `hsla(${r.hue}, 95%, 70%, ${0.12 + a*0.45})`;
      fwCtx.arc(t.x, t.y, 1.2 + a*1.8, 0, Math.PI*2);
      fwCtx.fill();
    }

    // 头部亮点
    fwCtx.beginPath();
    fwCtx.fillStyle = `hsla(${r.hue}, 95%, 78%, .95)`;
    fwCtx.arc(r.x, r.y, 2.3, 0, Math.PI*2);
    fwCtx.fill();

    if (r.y <= r.yTarget || r.vy >= -1.4 || r.life > 92){
      explode(r.x, r.y, r.hue);
      rockets.splice(i,1);
    }
  }

  // sparks
  for (let i=sparks.length-1;i>=0;i--){
    const p = sparks[i];
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
    p.a = Math.max(0, p.life / 86);

    fwCtx.beginPath();
    fwCtx.strokeStyle = `hsla(${p.hue}, 95%, 65%, ${p.a})`;
    fwCtx.lineWidth = 2;
    fwCtx.moveTo(p.x, p.y);
    fwCtx.lineTo(p.x - p.vx*1.8, p.y - p.vy*1.8);
    fwCtx.stroke();

    if (p.life <= 0 || p.y > h + 20 || p.x < -40 || p.x > w + 40){
      sparks.splice(i,1);
    }
  }

  rafId = requestAnimationFrame(stepFireworks);
}

function startFireworks(){
   fireworksOn = true;
  scene.classList.add("fireworks-on");
  fireBtn.classList.add("is-on");
  fireBtn.setAttribute("aria-pressed", "true");
  fireBtn.textContent = "🧨 烟花进行中";

  // 🎉 彩蛋气泡
  showToast("小宋同学，过年好呀！ 🧨", 2000);

  resizeCanvas();
  fwCtx.clearRect(0,0,fwCanvas.clientWidth, fwCanvas.clientHeight);

  if (!rafId) rafId = requestAnimationFrame(stepFireworks);

  // 自动盛大齐射：更密集、更“过年”
  const schedule = ()=>{
    if (!fireworksOn) return;

    const W = fwCanvas.clientWidth;
    const H = fwCanvas.clientHeight;

    const volleys = Math.random() < 0.55 ? 2 : 1; // 偶尔双齐射
    for (let v=0; v<volleys; v++){
      const x = rand(40, W - 40);
      const yT = rand(40, H * 0.52);
      const n = Math.random() < 0.65 ? Math.floor(rand(2,4)) : Math.floor(rand(4,7)); // 一次 2~6 发
      spawnRocketVolley(x, yT, n);
    }

    autoTimer = setTimeout(schedule, rand(380, 760)); // 更频繁
  };
  schedule();
}

function stopFireworks(){
  fireworksOn = false;
  scene.classList.remove("fireworks-on");
  fireBtn.classList.remove("is-on");
  fireBtn.setAttribute("aria-pressed", "false");
  fireBtn.textContent = "🧨来点烟花";

  if (autoTimer){ clearTimeout(autoTimer); autoTimer = null; }
  if (rafId){ cancelAnimationFrame(rafId); rafId = null; }

  rockets.length = 0;
  sparks.length = 0;
  blooms.length = 0;
  fwCtx.clearRect(0,0,fwCanvas.clientWidth, fwCanvas.clientHeight);
}

fireBtn.addEventListener("click", ()=>{
  if (fireworksOn) stopFireworks();
  else startFireworks();
});

// 点击场景：定点盛大齐射
function spawnAtClient(clientX, clientY){
  if (!fireworksOn) return;
  const rect = fwCanvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const yT = clamp(clientY - rect.top, 30, rect.height * 0.75);
  // 点击就来一波“更盛大”
  spawnRocketVolley(x, yT, Math.floor(rand(4,7)));
}

scene.addEventListener("click", (e)=> spawnAtClient(e.clientX, e.clientY));
scene.addEventListener("keydown", (e)=>{
  if (!fireworksOn) return;
  if (e.key === "Enter" || e.key === " "){
    const rect = fwCanvas.getBoundingClientRect();
    spawnAtClient(rect.left + rand(60, rect.width-60), rect.top + rand(50, rect.height*0.6));
  }
});

function jumpToWeather(changeFn){
  // 如果烟花开着：先关掉，保证场景立刻可见
  if (fireworksOn) stopFireworks();

  // 立刻切天气
  changeFn();
}

magicBtn.addEventListener("click", () => {
  jumpToWeather(randomWeather);
});

cycleBtn.addEventListener("click", () => {
  jumpToWeather(() => setWeatherByIndex(weatherIdx + 1));
});

let toastTimer = null;

function showToast(msg, duration = 1800){
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}
