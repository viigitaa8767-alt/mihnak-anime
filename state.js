/* ══════════════════════════════════
   محنك الأنمي - إدارة حالة اللاعب
   حفظ / تحميل / تصفير التقدم
   ══════════════════════════════════ */

const STORAGE_KEY = 'mihnak_anime_save_v1';

// الشكل الافتراضي لحالة اللاعب
function createDefaultState() {
  return {
    // التقدم في كل مملكة
    // kingdoms[1] = { provinces: { 1: [true, true, false, false, false] } }
    kingdoms: {},

    // الجوائز المجموعة
    rewards: [],

    // إجمالي النقاط
    totalScore: 0,

    // هل أنهى اللعبة
    completed: false,

    // تاريخ آخر لعب
    lastPlayed: Date.now()
  };
}

// الحالة الحالية في الذاكرة
let gameState = null;

// ─── تحميل الحالة من التخزين المحلي ───
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      gameState = JSON.parse(raw);
      // ضمان وجود الحقول الأساسية
      if (!gameState.kingdoms) gameState.kingdoms = {};
      if (!gameState.rewards) gameState.rewards = [];
      if (typeof gameState.totalScore !== 'number') gameState.totalScore = 0;
      if (typeof gameState.completed !== 'boolean') gameState.completed = false;
    } else {
      gameState = createDefaultState();
    }
  } catch (e) {
    gameState = createDefaultState();
  }
  return gameState;
}

// ─── حفظ الحالة ───
function saveState() {
  try {
    gameState.lastPlayed = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (e) {
    // التخزين ممتلئ أو غير متاح
  }
}

// ─── تصفير كل البيانات ───
function resetState() {
  gameState = createDefaultState();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  return gameState;
}

// ─── هل المملكة مفتوحة؟ ───
function isKingdomUnlocked(kingdomId) {
  // المملكة الأولى دايمًا مفتوحة
  if (kingdomId === 1) return true;

  // المملكة الأخيرة (6) محتاجة كل الجوائز الخمسة
  if (kingdomId === 6) {
    return gameState.rewards.length >= 5;
  }

  // باقي الممالك: مفتوحة لو المملكة السابقة خلصت
  // (نعتبر المملكة السابقة خلصت لو اللاعب كسب جائزتها)
  const prevRewardId = kingdomId - 1;
  return gameState.rewards.includes(prevRewardId);
}

// ─── هل الإقليم مفتوح؟ ───
function isProvinceUnlocked(kingdomId, provinceId) {
  if (provinceId === 1) return true;
  const prevKey = `${kingdomId}_${provinceId - 1}`;
  const prevLevels = getLevelsProgress(kingdomId, provinceId - 1);
  // الإقليم السابق لازم يكون خلص كله
  return prevLevels.every(v => v === true);
}

// ─── هل المرحلة مفتوحة؟ ───
function isLevelUnlocked(kingdomId, provinceId, levelId) {
  if (levelId === 1) return true;
  const levels = getLevelsProgress(kingdomId, provinceId);
  return levels[levelId - 2] === true;
}

// ─── جلب تقدم مراحل إقليم معين ───
function getLevelsProgress(kingdomId, provinceId) {
  const k = gameState.kingdoms[kingdomId];
  if (!k || !k.provinces || !k.provinces[provinceId]) {
    return [false, false, false, false, false];
  }
  return k.provinces[provinceId];
}

// ─── تسجيل إنهاء مرحلة ───
function markLevelComplete(kingdomId, provinceId, levelId) {
  if (!gameState.kingdoms[kingdomId]) {
    gameState.kingdoms[kingdomId] = { provinces: {} };
  }
  if (!gameState.kingdoms[kingdomId].provinces[provinceId]) {
    gameState.kingdoms[kingdomId].provinces[provinceId] =
      [false, false, false, false, false];
  }
  gameState.kingdoms[kingdomId].provinces[provinceId][levelId - 1] = true;
  saveState();
}

// ─── هل الإقليم خلص كله؟ ───
function isProvinceComplete(kingdomId, provinceId) {
  const levels = getLevelsProgress(kingdomId, provinceId);
  return levels.every(v => v === true);
}

// ─── هل المملكة خلصت كلها؟ ───
function isKingdomComplete(kingdomId, totalProvinces) {
  for (let p = 1; p <= totalProvinces; p++) {
    if (!isProvinceComplete(kingdomId, p)) return false;
  }
  return true;
}

// ─── إضافة جائزة ───
function addReward(rewardId) {
  if (!gameState.rewards.includes(rewardId)) {
    gameState.rewards.push(rewardId);
    saveState();
  }
}

// ─── إضافة نقاط ───
function addScore(points) {
  gameState.totalScore += points;
  saveState();
}
