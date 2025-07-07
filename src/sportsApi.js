// استعمل فقط الرياضات المدعومة (لها بطولات فعلية في TheSportsDB)
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
  // بإمكانك إضافة جلب ديناميكي من v1 لو أردت، لكن هنا نعيد فقط SUPPORTED_SPORTS
  return SUPPORTED_SPORTS;
}

// جلب البطولات لرياضة معينة => يجب استعمال v1 هنا!
export async function getLeaguesBySport(sport = "Soccer") {
  const res = await fetch(BASE_URL_V1 + "search_all_leagues.php?s=" + encodeURIComponent(sport));
  const data = await res.json();
  return data.countrys || [];
}

// جلب المباريات القادمة لبطولة معينة
export async function getUpcomingEventsByLeague(idLeague) {
  const res = await fetch(BASE_URL_V2 + "eventsnextleague.php?id=" + idLeague);
  const data = await res.json();
  return data.events || [];
}

// جلب نتائج مباشرة حسب الرياضة


// نفس التعريفات السابقة...
export async function getLeaguesBySport(sport = "Soccer") {
  const res = await fetch(BASE_URL_V1 + "search_all_leagues.php?s=" + encodeURIComponent(sport));
  const data = await res.json();
  // بعض الأحيان leagues أو countrys
  return data.countrys || data.leagues || [];
}
