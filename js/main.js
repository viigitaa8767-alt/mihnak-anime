/* ══════════════════════════════════
   محنك الأنمي - نقطة انطلاق اللعبة
   ══════════════════════════════════ */

// عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
  // تهيئة الأصوات
  initAudio();

  // تحميل حالة اللاعب
  loadState();

  // شاشة البداية بعد شوية تحميل
  setTimeout(() => {
    showScreen('screen-home');
    updateHomeButtons();
  }, 1800);

  // ربط الأزرار
  bindEvents();
});

// ═══ ربط أزرار الواجهات ═══
function bindEvents() {
  // زر ابدأ اللعب
  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      sfxClick();
      renderKingdoms();
      showScreen('screen-kingdoms');
    });
  }

  // زر حذف البيانات
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      sfxClick();
      if (confirm('متأكد؟ هتخسر كل تقدمك.')) {
        resetState();
        updateHomeButtons();
        alert('تم حذف البيانات ✅');
      }
    });
  }

  // زر الخروج من اللعبة
  const exitBtn = document.getElementById('btn-exit');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      sfxClick();
      // محاولة إغلاق اللعبة (تشتغل في APK)
      if (window.Android && window.Android.exitApp) {
        window.Android.exitApp();
      } else {
        window.close();
      }
    });
  }

  // زر حذف البيانات من شاشة الفوز
  const wipeBtn = document.getElementById('btn-wipe');
  if (wipeBtn) {
    wipeBtn.addEventListener('click', () => {
      sfxClick();
      if (confirm('متأكد؟ هتبدأ من الأول.')) {
        resetState();
        renderKingdoms();
        showScreen('screen-home');
        updateHomeButtons();
      }
    });
  }

  // أزرار الرجوع
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      sfxClick();
      const target = btn.dataset.back;
      if (target === 'screen-kingdoms') {
        renderKingdoms();
      } else if (target === 'screen-provinces') {
        const meta = getKingdomsMeta();
        const k = meta.find(x => x.id === currentKingdomId);
        if (k) renderProvinces(currentKingdomId, k.provinces);
      } else if (target === 'screen-levels') {
        renderLevels(currentKingdomId, currentProvinceId);
      }
      if (target) showScreen(target);
    });
  });
}

// ═══ تحديث أزرار الشاشة الرئيسية ═══
function updateHomeButtons() {
  const continueBtn = document.getElementById('btn-continue');
  if (!continueBtn) return;

  // هل فيه تقدم محفوظ؟
  const hasProgress = Object.keys(gameState.kingdoms).length > 0 ||
                      gameState.totalScore > 0;

  if (hasProgress) {
    continueBtn.hidden = false;
    continueBtn.onclick = () => {
      sfxClick();
      renderKingdoms();
      showScreen('screen-kingdoms');
    };
  } else {
    continueBtn.hidden = true;
  }
}
