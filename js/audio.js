/* ══════════════════════════════════
   محنك الأنمي - نظام الأصوات
   ══════════════════════════════════ */

// كائن الأصوات — بيحمل كل الملفات الصوتية
const SFX = {
  click: null,
  correct: null,
  wrong: null,
  win: null
};

// تشغيل الصوت مع حماية من الأخطاء
function playSound(name) {
  const sound = SFX[name];
  if (!sound) return;
  try {
    sound.currentTime = 0;
    sound.volume = 0.7;
    sound.play().catch(() => { /* الملف مش موجود — تجاهل */ });
  } catch (e) {
    // تجاهل أي خطأ في الصوت
  }
}

// تهيئة الأصوات عند تحميل الصفحة
function initAudio() {
  SFX.click = document.getElementById('sfx-click');
  SFX.correct = document.getElementById('sfx-correct');
  SFX.wrong = document.getElementById('sfx-wrong');
  SFX.win = document.getElementById('sfx-win');
}

// تفعيل الأصوات بعد أول لمسة من المستخدم
// (شرط من المتصفحات الحديثة لتشغيل الصوت)
function unlockAudio() {
  const sounds = Object.values(SFX);
  sounds.forEach(s => {
    if (s) {
      s.volume = 0;
      s.play().then(() => {
        s.pause();
        s.currentTime = 0;
      }).catch(() => {});
    }
  });
  document.removeEventListener('touchstart', unlockAudio);
  document.removeEventListener('click', unlockAudio);
}
