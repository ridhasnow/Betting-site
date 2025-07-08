// قائمة الرياضات المدعومة (متوافقة مع الواجهة)
export const SUPPORTED_SPORTS = [
  { strSport: "Soccer" },
  { strSport: "Basketball" },
  { strSport: "Tennis" },
  { strSport: "Handball" },
  { strSport: "Rugby" },
  { strSport: "Ice Hockey" },
  { strSport: "Volleyball" },
  { strSport: "Table Tennis" }
];

const API_KEY = "807217";
const BASE_URL_V1 = "https://www.thesportsdb.com/api/v1/json/" + API_KEY + "/";
const BASE_URL_V2 = "https://www.thesportsdb.com/api/v2/json/" + API_KEY + "/";

// جلب الرياضات المدعومة فقط
export async function getAllSports() {
  return SUPPORTED_SPORTS;
}

// جلب البطولات لرياضة معينة => يجب استعمال v1 هنا فقط!
export async function getLeaguesBySport(sport = "Soccer") {
  try {
    const url = BASE_URL_V1 + "search_all_leagues.php?s=" + encodeURIComponent(sport);
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    // البطولات أحيانا في data.countries أو data.leagues حسب نوع الاستجابة
    const result = data.countries || data.leagues || [];
    // تصفية النتائج للتأكد من وجود idLeague وstrLeague
    return result
      .filter(lg => lg.idLeague && lg.strLeague)
      .map(lg => ({
        ...lg,
        strCountry: lg.strCountry || "Unknown",
        strLeagueAlternate: lg.strLeagueAlternate || "",
      }));
  } catch (e) {
    return [];
  }
}

// جلب المباريات القادمة لبطولة معينة (كل الأسبوع)
// معالجة الخطأ 404 بحيث ترجع مصفوفة فاضية بدل كسر الكود
export async function getUpcomingEventsByLeague(idLeague) {
  try {
    const url = BASE_URL_V2 + "eventsnextleague.php?id=" + idLeague;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch(e) {
    return [];
  }
}

// جلب مباريات بطولة ليوم معيّن
export async function getEventsByLeagueAndDate(idLeague, dateStr) {
  // نجلب كل أحداث الأسبوع ثم نفلتر حسب التاريخ
  const all = await getUpcomingEventsByLeague(idLeague);
  if (!dateStr) return all;
  // فلترة الأحداث حسب التاريخ بالضبط
  return all.filter(event => event.dateEvent === dateStr);
}

// جلب نتائج مباشرة حسب الرياضة (اختياري)
export async function getLiveScoresBySport(sport = "Soccer") {
  try {
    const url = BASE_URL_V2 + "livescore.php?s=" + encodeURIComponent(sport);
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch(e) {
    return [];
  }
}
