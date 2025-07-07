// استخدم v1 فقط لجلب الرياضات (لأن v2 لا تدعم all_sports.php)
const API_KEY = "807217";
// v1 لgetAllSports فقط، الباقي v2
const BASE_URL_V1 = "https://www.thesportsdb.com/api/v1/json/" + API_KEY + "/";
const BASE_URL_V2 = "https://www.thesportsdb.com/api/v2/json/" + API_KEY + "/";

// قائمة ثابتة للرياضات الأكثر شهرة (لو تحب)
export const STATIC_SPORTS = [
  { strSport: "Soccer" },
  { strSport: "Basketball" },
  { strSport: "Tennis" },
  { strSport: "Volleyball" },
  { strSport: "Rugby" }
];

// جلب كل الرياضات (من v1 فقط)
export async function getAllSports() {
  try {
    const res = await fetch(BASE_URL_V1 + "all_sports.php");
    const data = await res.json();
    return data.sports || STATIC_SPORTS;
  } catch {
    return STATIC_SPORTS;
  }
}

// جلب كل البطولات لرياضة معينة
export async function getLeaguesBySport(sport = "Soccer") {
  const res = await fetch(BASE_URL_V2 + "search_all_leagues.php?s=" + encodeURIComponent(sport));
  const data = await res.json();
  return data.countrys || [];
}

// جلب المباريات القادمة لبطولة
export async function getUpcomingEventsByLeague(idLeague) {
  const res = await fetch(BASE_URL_V2 + "eventsnextleague.php?id=" + idLeague);
  const data = await res.json();
  return data.events || [];
}

// جلب نتائج مباشرة (LIVE)
export async function getLiveScoresBySport(sport = "soccer") {
  const res = await fetch(BASE_URL_V2 + "livescore.php?s=" + encodeURIComponent(sport));
  const data = await res.json();
  return data.events || [];
}
