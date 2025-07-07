// إعدادات API المدفوعة v2
const API_KEY = "807217";
const BASE_URL = "https://www.thesportsdb.com/api/v2/json/" + API_KEY + "/";

// جلب كل الرياضات المتوفرة
export async function getAllSports() {
  const res = await fetch(BASE_URL + "all_sports.php");
  const data = await res.json();
  return data.sports || [];
}

// جلب كل البطولات لرياضة معينة (مثلاً Soccer أو Basketball ...)
export async function getLeaguesBySport(sport = "Soccer") {
  const res = await fetch(BASE_URL + "search_all_leagues.php?s=" + encodeURIComponent(sport));
  const data = await res.json();
  return data.countrys || [];
}

// جلب المباريات القادمة لبطولة معينة
export async function getUpcomingEventsByLeague(idLeague) {
  const res = await fetch(BASE_URL + "eventsnextleague.php?id=" + idLeague);
  const data = await res.json();
  return data.events || [];
}

// جلب نتائج آخر مباريات لبطولة معينة
export async function getLastEventsByLeague(idLeague) {
  const res = await fetch(BASE_URL + "eventspastleague.php?id=" + idLeague);
  const data = await res.json();
  return data.events || [];
}

// جلب تفاصيل مباراة واحدة
export async function getEventDetails(idEvent) {
  const res = await fetch(BASE_URL + "lookupevent.php?id=" + idEvent);
  const data = await res.json();
  return data.events && data.events[0];
}

// جلب كل الفرق لبطولة (دوري)
export async function getTeamsByLeague(idLeague) {
  const res = await fetch(BASE_URL + "lookup_all_teams.php?id=" + idLeague);
  const data = await res.json();
  return data.teams || [];
}

// جلب نتائج مباشرة (Live Score) لرياضة معينة (مثلاً soccer, basketball...)
export async function getLiveScoresBySport(sport = "soccer") {
  const res = await fetch(BASE_URL + "livescore.php?s=" + encodeURIComponent(sport));
  const data = await res.json();
  return data.events || [];
}

// جلب قائمة الدول المتاحة (للإكسرا، ممكن تفيد لاحقاً)
export async function getAllCountries() {
  const res = await fetch(BASE_URL + "all_countries.php");
  const data = await res.json();
  return data.countries || [];
}
