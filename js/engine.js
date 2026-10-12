/* ══════════════════════════════════
   محنك الأنمي - محرك اللعبة (نسخة جديدة)
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

// ═══ خلط المصفوفة ═══
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══ جلب بنك أسئلة مملكة ═══
function getKingdomBank(kingdomId) {
  try {
    if (kingdomId === 1 && typeof KINGDOM_1 !== 'undefined') return KINGDOM_1;
    if (kingdomId === 2 && typeof KINGDOM_2 !== 'undefined') return KINGDOM_2;
    if (kingdomId === 3 && typeof KINGDOM_3 !== 'undefined') return KINGDOM_3;
    if (kingdomId === 4 && typeof KINGDOM_4 !== 'undefined') return KINGDOM_4;
    if (kingdomId === 5 && typeof KINGDOM_5 !== 'undefined') return KINGDOM_5;
    if (kingdomId === 6 && typeof KINGDOM_6 !== 'undefined') return KINGDOM_6;
  } catch (e) {
    console.error('خطأ في جلب بنك المملكة:', e);
  }
  return null;
}

// ═══ بدء مرحلة جديدة ═══
function startLevel(kingdomId, provinceId, levelId, onFinish) {
  session.kingdomId = kingdomId;
  session.provinceId = provinceId;
  session.levelId = levelId;
  session.currentIndex = 0;
  session.correctCount = 0;
  session.onFinish = onFinish;
  session.questions = [];

  const bank = getKingdomBank(kingdomId);
  if (!bank || !bank.byProvince) {
    console.error('مفيش بنك أسئلة للمملكة:', kingdomId);
    session.totalQuestions = 0;
    if (onFinish) onFinish(0, 0, false);
    return;
  }

  let pool = bank.byProvince[provinceId];
  if (!pool || pool.length === 0) {
    console.error('مفيش أسئلة للإقليم:', kingdomId, provinceId);
    session.totalQuestions = 0;
    if (onFinish) onFinish(0, 0, false);
    return;
  }

  const shuffled = shuffleArray(pool);
  session.questions = shuffled.slice(0, Math.min(QUESTIONS_PER_LEVEL, shuffled.length));
  session.totalQuestions = session.questions.length;

  console.log('بدأنا مرحلة بعدد أسئلة:', session.totalQuestions);
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

// ═══ إنهاء المرحلة ═══
function finishLevel() {
  const total = session.totalQuestions;
  const correct = session.correctCount;
  const percent = total > 0 ? (correct / total) * 100 : 0;
  const passed = percent >= 60;

  if (passed) {
    markLevelComplete(session.kingdomId, session.provinceId, session.levelId);
    addScore(correct * 10);
  }

  if (session.onFinish) {
    session.onFinish(correct, total, passed);
  }

  return { correct, total, passed, percent };
}

// ═══ بيانات الممالك ═══
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

// ═══ اسم إقليم ═══
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
