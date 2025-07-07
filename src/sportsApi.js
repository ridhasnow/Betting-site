const API_KEY = "1"; // مجاني
const BASE_URL = "https://www.thesportsdb.com/api/v1/json/" + API_KEY + "/";

export async function getSoccerLeagues() {
  const res = await fetch(BASE_URL + "all_leagues.php");
  const data = await res.json();
  return data.leagues.filter(lg => lg.strSport === "Soccer");
}

export async function getEventsByLeague(idLeague, season = "2024-2025") {
  const res = await fetch(BASE_URL + "eventsseason.php?id=" + idLeague + "&s=" + season);
  const data = await res.json();
  return data.events || [];
}

export async function getTeamsByLeague(idLeague) {
  const res = await fetch(BASE_URL + "lookup_all_teams.php?id=" + idLeague);
  const data = await res.json();
  return data.teams || [];
}

export async function getEventDetails(idEvent) {
  const res = await fetch(BASE_URL + "lookupevent.php?id=" + idEvent);
  const data = await res.json();
  return data.events && data.events[0];
}
