/* ══════════════════════════════════
   محنك الأنمي - نظام الأصوات (من الكود)
   Web Audio API — بدون ملفات خارجية
   ══════════════════════════════════ */

let audioCtx = null;

// إنشاء سياق الصوت (مرة واحدة)
function getCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// نغمة أساسية — القطعة اللي بنبني بيها كل الأصوات
function playTone(freq, duration, type, volume, delay) {
  const ctx = getCtx();
  if (!ctx) return;
  const startTime = ctx.currentTime + (delay || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume || 0.15, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// ═══ الأصوات الجاهزة ═══

// نقر زر — صوت قصير حاد
function sfxClick() {
  playTone(680, 0.08, 'square', 0.08, 0);
  playTone(880, 0.06, 'square', 0.05, 0.02);
}

// إجابة صحيحة — نغمة صاعدة
function sfxCorrect() {
  playTone(523, 0.12, 'sine', 0.15, 0);    // C5
  playTone(659, 0.12, 'sine', 0.15, 0.10); // E5
  playTone(784, 0.22, 'sine', 0.18, 0.20); // G5
}

// إجابة خاطئة — نغمة هابطة
function sfxWrong() {
  playTone(330, 0.15, 'sawtooth', 0.12, 0);   // E4
  playTone(247, 0.25, 'sawtooth', 0.12, 0.12); // B3
}

// فوز نهائي — لحن احتفالي
function sfxWin() {
  const notes = [523, 659, 784, 1047, 784, 1047]; // C-E-G-C-G-C
  notes.forEach((f, i) => {
    playTone(f, 0.25, 'triangle', 0.18, i * 0.14);
  });
}

// فتح قفل / إنجاز
function sfxUnlock() {
  playTone(440, 0.1, 'triangle', 0.12, 0);
  playTone(660, 0.18, 'triangle', 0.15, 0.08);
}

// تفعيل الصوت عند أول لمسة
function unlockAudio() {
  getCtx();
  document.removeEventListener('touchstart', unlockAudio);
  document.removeEventListener('click', unlockAudio);
}

// ربط الأحداث عند التحميل
function initAudio() {
  document.addEventListener('touchstart', unlockAudio, { once: true });
  document.addEventListener('click', unlockAudio, { once: true });
}
