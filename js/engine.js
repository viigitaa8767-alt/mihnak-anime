/* ══════════════════════════════════
   محنك الأنمي - محرك اللعبة
   إدارة الأسئلة وتشغيل المراحل
   ══════════════════════════════════ */

// ─── حالة الجلسة الحالية ───
const session = {
  kingdomId: 1,
  provinceId: 1,
  levelId: 1,
  questions: [],
  currentIndex: 0,
  correctCount: 0,
  totalQuestions: 5,
  onFinish: null
};

// عدد الأسئلة في كل مرحلة
const QUESTIONS_PER_LEVEL = 5;

// ═══ خلط المصفوفة (Fisher-Yates) ═══
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══ بدء مرحلة جديدة ═══
function startLevel(kingdomId, provinceId, levelId, onFinish) {
  session.kingdomId = kingdomId;
  session.provinceId = provinceId;
  session.levelId = levelId;
  session.currentIndex = 0;
  session.correctCount = 0;
  session.onFinish = onFinish;

  // جلب بنك الأسئلة للمملكة
  const bank = getKingdomBank(kingdomId);
  if (!bank || !bank.questions || bank.questions.length === 0) {
    session.questions = [];
    if (onFinish) onFinish(0, 0);
    return;
  }

  // فلترة الأسئلة حسب الإقليم (لو في بنك مقسّم)
  let pool = bank.questions;
  if (bank.byProvince && bank.byProvince[provinceId]) {
    pool = bank.byProvince[provinceId];
  }

  // خلط واختيار عدد الأسئلة المطلوب
  const shuffled = shuffleArray(pool);
  session.questions = shuffled.slice(0, Math.min(QUESTIONS_PER_LEVEL, shuffled.length));
  session.totalQuestions = session.questions.length;
}

// ═══ جلب سؤال حالي ═══
function getCurrentQuestion() {
  return session.questions[session.currentIndex] || null;
}

// ═══ الانتقال للسؤال التالي ═══
function nextQuestion() {
  session.currentIndex++;
  return session.currentIndex < session.totalQuestions;
}

// ═══ تسجيل إجابة صحيحة ═══
function registerCorrect() {
  session.correctCount++;
}

// ═══ هل المرحلة خلصت؟ ═══
function isLevelDone() {
  return session.currentIndex >= session.totalQuestions;
}

// ═══ إنهاء المرحلة ═══
function finishLevel() {
  const total = session.totalQuestions;
  const correct = session.correctCount;
  const percent = total > 0 ? (correct / total) * 100 : 0;

  // نجاح لو اللاعب جاوب على 60% أو أكثر صح
  const passed = percent >= 60;

  // حفظ التقدم لو نجح
  if (passed) {
    markLevelComplete(session.kingdomId, session.provinceId, session.levelId);
    addScore(correct * 10);

    // هل الإقليم خلص؟
    if (isProvinceComplete(session.kingdomId, session.provinceId)) {
      // جائزة الإقليم
      const bank = getKingdomBank(session.kingdomId);
      if (bank && bank.rewards) {
        const rewardIndex = session.provinceId - 1;
        if (bank.rewards[rewardIndex]) {
          addReward(bank.rewards[rewardIndex].id || session.kingdomId);
        }
      }
    }
  }

  if (session.onFinish) {
    session.onFinish(correct, total, passed);
  }

  return { correct, total, passed, percent };
}

// ═══ جلب بنك أسئلة مملكة ═══
function getKingdomBank(kingdomId) {
  const banks = {
    1: typeof KINGDOM_1 !== 'undefined' ? KINGDOM_1 : null,
    2: typeof KINGDOM_2 !== 'undefined' ? KINGDOM_2 : null,
    3: typeof KINGDOM_3 !== 'undefined' ? KINGDOM_3 : null,
    4: typeof KINGDOM_4 !== 'undefined' ? KINGDOM_4 : null,
    5: typeof KINGDOM_5 !== 'undefined' ? KINGDOM_5 : null,
    6: typeof KINGDOM_6 !== 'undefined' ? KINGDOM_6 : null
  };
  return banks[kingdomId] || null;
}

// ═══ جلب بيانات الممالك ═══
function getKingdomsMeta() {
  return [
    { id: 1, name: 'الغيلان', icon: '👹', desc: 'مستوحى من طوكيو غول', provinces: 2, color: '#A855F7' },
    { id: 2, name: 'الشينوبي', icon: '🍥', desc: 'مستوحى من ناروتو', provinces: 4, color: '#F97316' },
    { id: 3, name: 'الشينيغامي', icon: '⚔️', desc: 'مستوحى من بليتش', provinces: 4, color: '#3B82F6' },
    { id: 4, name: 'الأقمار والهاشيرا', icon: '🌙', desc: 'مستوحى من ديمون سلاير', provinces: 2, color: '#10B981' },
    { id: 5, name: 'الغراند لاين', icon: '🏴‍☠️', desc: 'مستوحى من ون بيس', provinces: 4, color: '#EF4444' },
    { id: 6, name: 'دراغون بول', icon: '🐉', desc: 'المملكة الأخيرة', provinces: 4, color: '#F5B301' }
  ];
}

// ═══ جلب اسم إقليم ═══
function getProvinceName(kingdomId, provinceId) {
  const names = {
    1: ['القهوة', 'الغيلان'],
    2: ['الورق', 'الرمل', 'الضباب', 'البرق'],
    3: ['الأرواح', 'السيف', 'القمر', 'النار'],
    4: ['الشمس', 'القمر'],
    5: ['الشرق', 'الغرب', 'الشمال', 'الجنوب'],
    6: ['الأرض', 'الكايوكن', 'الناميك', 'النهائي']
  };
  const list = names[kingdomId] || [];
  return list[provinceId - 1] || `الإقليم ${provinceId}`;
}
