export const SUPPORTED_SPORTS = [
  { strSport: "Soccer" },
  { strSport: "Basketball" },
  { strSport: "Tennis" },
  { strSport: "Volleyball" },
  { strSport: "Rugby" },
  { strSport: "Cricket" },
  { strSport: "Baseball" },
  { strSport: "Ice Hockey" },
  { strSport: "Handball" }
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
  const url = BASE_URL_V1 + "search_all_leagues.php?s=" + encodeURIComponent(sport);
  const res = await fetch(url);
  const data = await res.json();
  console.log("getLeaguesBySport", sport, url, data); // هام لمراقبة النتيجة الفعلية
  return data.countrys || data.leagues || [];
}

// جلب المباريات القادمة لبطولة معينة
export async function getUpcomingEventsByLeague(idLeague) {
  const res = await fetch(BASE_URL_V2 + "eventsnextleague.php?id=" + idLeague);
  const data = await res.json();
  return data.events || [];
}

// جلب نتائج مباشرة حسب الرياضة
export async function getLiveScoresBySport(sport = "soccer") {
  const res = await fetch(BASE_URL_V2 + "livescore.php?s=" + encodeURIComponent(sport));
  const data = await res.json();
  return data.events || [];
}
