/* ================= SLIDER ================= */

document.addEventListener("DOMContentLoaded",()=>{
  typedAlready=false;
});


let current = 1;

function goNext(){

  const currentSlide = document.getElementById("slide" + current);
  if(!currentSlide) return;

  // SLIDE 3 buka amplop dulu
  if(current === 3 && !currentSlide.classList.contains("open")){
    currentSlide.classList.add("open");
    return;
  }

  // pindah
  currentSlide.classList.remove("active");
  current++;

  const nextSlide = document.getElementById("slide" + current);
  if(!nextSlide) return;

  nextSlide.classList.add("active");

  /* trigger khusus tiap slide */
if(nextSlide.id === "slide2") setTimeout(startTyping,400);
if(nextSlide.id === "slide4") showPap();
if(nextSlide.id === "slide6") startSecretGame();

}

/* auto start game saat slide6 aktif */
const observer = new MutationObserver(()=>{
  const slide6=document.getElementById("slide6");
  if(slide6 && slide6.classList.contains("active")){
    startSecretGame();
  }
});
observer.observe(document.body,{attributes:true,subtree:true});



/* ================= PAP PHOTO ================= */

function showPap(){
  const paps = document.querySelectorAll('#slide4 .pap');
  const nextBtn = document.querySelector("#slide4 .next-btn");

  if(nextBtn) nextBtn.classList.add("hidden");

  paps.forEach((pap, i) => {
    pap.classList.remove("show");
    setTimeout(() => pap.classList.add("show"), i * 300);
  });

  if(nextBtn){
    setTimeout(() => {
      nextBtn.classList.remove("hidden");
    }, paps.length * 300);
  }
}

/* ================= MUSIC PLAYER ================= */

const audio = document.getElementById("audio");
const playBtn = document.querySelector(".play-btn");
const progressFill = document.getElementById("progressFill");
const progressBar = document.querySelector(".progress-bar");

function toggleMusic(){

  if(!audio) return;

  if(audio.paused){
    audio.play().then(()=>{
      if(playBtn) playBtn.innerHTML="⏸";
    }).catch(()=>{});
  }else{
    audio.pause();
    if(playBtn) playBtn.innerHTML="▶";
  }
}

/* progress jalan */
if(audio && progressFill){
  audio.addEventListener("timeupdate", ()=>{
    if(audio.duration){
      const percent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = percent + "%";
    }
  });
}

/* klik progress */
if(progressBar && audio){
  progressBar.addEventListener("click", (e)=>{
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    audio.currentTime = (clickX / width) * audio.duration;
  });
}


//* ================= SECRET GAME ================= */

let gameStarted = false;
let selectedDate = null;
let printing = false;
let gameFinished = false; // GLOBAL STATE (penting)

function startSecretGame(){

if(gameStarted || gameFinished) return;
gameStarted = true;

const words=[
'LOVE','CAKE','MUSIC','HUG','STAR','FOREVER','ANGEL',
'SMILE','BABY','MOON','GIFT','PEACE'
];

const secret="MEET";

const grid=document.getElementById("wordGrid");
const dateForm=document.getElementById("dateForm");
const datePicker=document.getElementById("datePicker");
const textTitle=document.getElementById("dateTitle");

if(!grid || !dateForm || !datePicker) return;

/* reset */
grid.innerHTML="";
datePicker.innerHTML="";
dateForm.style.display="none";
grid.style.display="flex";

/* acak kata */
const shuffled=[...words];
shuffled.splice(Math.floor(Math.random()*shuffled.length),0,secret);

/* tampilkan kata */
shuffled.forEach((word,i)=>{
  const btn=document.createElement("button");
  btn.className="word-btn";
  btn.innerText=word;
  grid.appendChild(btn);

  setTimeout(()=>btn.classList.add("show"), i*80);

  btn.onclick=()=>{
    if(gameFinished) return;

    if(word===secret){

      textTitle.innerText="YEEAAYY BENAARR, Pilih Tanggal Meet Kita!!!";

      grid.style.display="none";
      dateForm.style.display="block";
      createDatePicker();

    }else{
      btn.classList.add("wrong");
      setTimeout(()=>btn.classList.remove("wrong"),350);
    }
  };
});

/* tanggal */
function createDatePicker(){

  for(let i=1;i<=31;i++){
    const d=document.createElement("button");
    d.className="date-btn";
    d.innerText=i;
    datePicker.appendChild(d);

    d.onclick=()=>{
      if(gameFinished) return;

      document.querySelectorAll(".date-btn").forEach(b=>b.classList.remove("selected"));
      d.classList.add("selected");
      selectedDate=i;
    };
  }
}

}

/* ================= CONFIRM BUTTON ================= */

document.addEventListener("click",(e)=>{
  if(e.target && e.target.id==="confirmBtn"){
    e.stopPropagation();
    handleConfirm();
  }
});

/* ================= CONFIRM → PRINT → DOWNLOAD ================= */

async function handleConfirm() {
  if (printing || gameFinished) return;
  if (!selectedDate) {
    alert("pilih tanggal dulu ❤️");
    return;
  }

  printing = true;
  const fullDate = selectedDate + " Mei 2026";
  const ticket = document.getElementById("ticket"); // Elemen .paper asli
  const qr = document.getElementById("qrcode");

  // 1. Update data di tiket asli agar QR Code muncul
  qr.innerHTML = "";
  new QRCode(qr, { text: "Meet With Liana Sabirah - " + fullDate, width: 70, height: 70 });
  document.getElementById("ticketDate").textContent = fullDate;
  if (document.getElementById("ticketDate2")) document.getElementById("ticketDate2").textContent = fullDate;

  // 2. Tampilkan animasi printer
  document.getElementById("ticketPrinter").classList.add("active");
  document.querySelector("#slide6 .printer").classList.add("shake");
  
  await new Promise(r => setTimeout(r, 500));
  document.querySelector(".paper-viewport").style.height = ticket.scrollHeight + "px";
  document.querySelector("#slide6 .printer").classList.remove("shake");

  // Tunggu animasi kertas keluar selesai
  await new Promise(r => setTimeout(r, 2500));

  // --- TRIK CLONING AGAR HASIL HP SAMA DENGAN DESKTOP ---
  
  // A. Buat kloningan tiket
  const clone = ticket.cloneNode(true);
  
  // B. Beri gaya khusus agar kloningan ini berukuran DESKTOP dan tersembunyi
  Object.assign(clone.style, {
    position: "absolute",
    left: "-9999px",
    top: "0",
    width: "520px",    // Ukuran desktop asli
    height: "250px",   // Ukuran desktop asli
    transform: "none", // Hapus scale HP
    display: "block",
    backgroundColor: "white"
  });
  
  document.body.appendChild(clone);

  // C. Potret kloningan tersebut
  try {
    const canvas = await html2canvas(clone, {
      scale: 3, // Kualitas tinggi
      backgroundColor: null,
      useCORS: true,
      logging: false,
      width: 520,
      height: 250
    });

    const link = document.createElement("a");
    link.download = "Meet-Ticket.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Gagal unduh:", err);
  }

  // D. Hapus kloningan setelah selesai
  document.body.removeChild(clone);

  // --- SELESAI ---
  
  gameFinished = true;
  printing = false;
  document.querySelectorAll(".slide *").forEach(el => el.style.pointerEvents = "none");
  document.getElementById("ticketPrinter").style.pointerEvents = "auto";
  const backBtn = document.getElementById("backBtn");
  backBtn.style.display = "block";
  backBtn.style.pointerEvents = "auto";
}

function startTyping(){

  if(typedAlready) return;

  const el = document.getElementById("typingText");
  if(!el) return;

  typedAlready = true;

  const text = el.textContent.trim();
  el.textContent="";

  let i=0;

  function type(){

    if(i < text.length){

      let speed = 20;

      if(text[i] === ".") speed = 260;
      else if(text[i] === ",") speed = 140;
      else if(text[i] === " ") speed = 10;

      el.textContent += text[i];
      i++;

      setTimeout(type, speed);

    }
  }

  type();
}

function printTicket() {
    window.print();

    // setelah print tampilkan tombol back
    document.getElementById("backBtn").style.display = "block";
}

const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
  location.reload();
});

document.addEventListener("DOMContentLoaded", () => {

  const backBtn = document.getElementById("backBtn");

  if(backBtn){
    backBtn.addEventListener("click", () => {
      location.reload();
    });
  }

});

if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock("landscape").catch(()=>{});
}

// Tambahkan di HTML atau JS file
window.addEventListener('orientationchange', function() {
  if (window.orientation === 0) { // Portrait
    document.body.style.overflow = 'hidden';
  } else { // Landscape
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }
});

function scaleApp(){
  const app = document.querySelector('.app');
  if(!app) return;

  // ✅ DESKTOP NORMAL
  if(window.innerWidth > 768){
    app.style.position = "relative";
    app.style.transform = "none";
    app.style.top = "0";
    app.style.left = "0";
    return;
  }

  // 📱 MOBILE
  const baseWidth = 1920;
const scale = 412 / 1920; // ≈ 0.21

  app.style.position = "relative";
  app.style.top = "100%";
  app.style.left = "100px";

  app.style.transformOrigin = "top center";
  app.style.transform = `translateX(-50%) scale(${scale})`;
}