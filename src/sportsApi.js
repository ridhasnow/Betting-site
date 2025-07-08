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

// جلب كل البطولات (الاحترافية) لرياضة معينة من all_leagues.php
export async function getLeaguesBySport(sport = "Soccer") {
  try {
    const url = BASE_URL_V1 + "all_leagues.php";
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    // فلترة البطولات حسب الرياضة
    return (data.leagues || []).filter(lg => lg.strSport === sport && lg.idLeague && lg.strLeague);
  } catch (e) {
    return [];
  }
}

// جلب كل مباريات اليوم حسب الرياضة
export async function getTodayEventsBySport(sport, dateStr) {
  try {
    // dateStr بصيغة YYYY-MM-DD
    const url = `${BASE_URL_V1}eventsday.php?d=${dateStr}&s=${encodeURIComponent(sport)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch (e) {
    return [];
  }
}

// جلب المباريات القادمة لبطولة معينة (كل الأسبوع أو أكثر)
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

// جلب مباريات بطولة ليوم معيّن (تفلتر من كل القادمة)
export async function getEventsByLeagueAndDate(idLeague, dateStr) {
  const all = await getUpcomingEventsByLeague(idLeague);
  if (!dateStr) return all;
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
