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

// RapidAPI Football API config (تستخدم فقط لكرة القدم)
const RAPIDAPI_KEY = "5915cc956amsh7c4b63e2d2d2e8bp1ee65bjsnb56f28ec67fd";
const RAPIDAPI_HOST = "api-football-v1.p.rapidapi.com";
const BASE_URL_FOOTBALL = "https://api-football-v1.p.rapidapi.com/v3";

// جلب كل البطولات لرياضة معينة (حقيقية فقط لكرة القدم)
export async function getLeaguesBySport(sport = "Soccer") {
  if (sport === "Soccer") {
    try {
      const res = await fetch(`${BASE_URL_FOOTBALL}/leagues`, {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST
        }
      });
      const data = await res.json();
      return (data.response || [])
        .filter(lg => lg.sport === "Soccer" && lg.league?.name && lg.seasons.some(season => season.current))
        .map(lg => ({
          idLeague: String(lg.league.id),
          strLeague: lg.league.name,
          strCountry: lg.country.name,
          logo: lg.league.logo
        }));
    } catch (e) {
      return [];
    }
  } else {
    // البطولات غير مدعومة لغير كرة القدم حالياً
    return [];
  }
}

// جلب مباريات اليوم لبطولة معينة (كرة القدم فقط)
export async function getEventsByLeagueAndDate(idLeague, dateStr) {
  try {
    const res = await fetch(`${BASE_URL_FOOTBALL}/fixtures?league=${idLeague}&date=${dateStr}`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    const data = await res.json();
    return (data.response || [])
      .filter(ev => ev.fixture.status.short === "NS")
      .map(ev => ({
        idEvent: String(ev.fixture.id),
        strHomeTeam: ev.teams.home.name,
        strAwayTeam: ev.teams.away.name,
        dateEvent: ev.fixture.date.slice(0, 10),
        strTime: ev.fixture.date.slice(11, 16),
        leagueLogo: ev.league.logo,
        fixtureId: ev.fixture.id
      }));
  } catch (e) {
    return [];
  }
}

// جلب كوتات 1X2 لمباراة واحدة (كرة القدم فقط)
export async function getOdds1X2ByFixture(fixtureId) {
  try {
    const res = await fetch(`${BASE_URL_FOOTBALL}/odds?fixture=${fixtureId}&bet=1`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    const data = await res.json();
    if (!data.response || !data.response.length) return null;
    for (const bookmaker of data.response[0].bookmakers || []) {
      const bet = bookmaker.bets && bookmaker.bets.find(b => b.id === 1);
      if (bet && bet.values) {
        const odds = {};
        bet.values.forEach(val => {
          if (val.value === "Home") odds["1"] = val.odd;
          if (val.value === "Draw") odds["X"] = val.odd;
          if (val.value === "Away") odds["2"] = val.odd;
        });
        return odds;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// جلب كل الأسواق (كل الرهانات) لمباراة واحدة من Bookmaker معيّن (id=1 = Bet365 غالبا)
export async function getAllMarketsByFixture(fixtureId, bookmakerId = 1) {
  try {
    const res = await fetch(`${BASE_URL_FOOTBALL}/odds?fixture=${fixtureId}&bookmaker=${bookmakerId}`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    const data = await res.json();
    if (!data.response || !data.response.length) return [];
    const bookmaker = data.response[0].bookmakers.find(bm => bm.id === bookmakerId) || data.response[0].bookmakers[0];
    if (!bookmaker || !bookmaker.bets) return [];
    return bookmaker.bets.map(bet => ({
      id: bet.id,
      name: bet.name,
      values: bet.values
    }));
  } catch {
    return [];
  }
}

// جلب كل المباريات الجارية الآن (LIVE) مع بياناتها (كرة القدم فقط)
export async function getLiveFixtures() {
  try {
    const res = await fetch(`${BASE_URL_FOOTBALL}/fixtures?live=all`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    const data = await res.json();
    return (data.response || []).map(ev => ({
      idEvent: String(ev.fixture.id),
      strHomeTeam: ev.teams.home.name,
      strAwayTeam: ev.teams.away.name,
      dateEvent: ev.fixture.date.slice(0, 10),
      strTime: ev.fixture.date.slice(11, 16),
      leagueLogo: ev.league.logo,
      fixtureId: ev.fixture.id,
      status: ev.fixture.status, // لمعلومات أكثر (الشوط، الوقت)
      goals: ev.goals
    }));
  } catch (e) {
    return [];
  }
}

// جلب الكوتات الحية (Live odds) لكل المباريات الجارية (كل Bookmaker وكل سوق)
export async function getLiveOdds() {
  try {
    const res = await fetch(`${BASE_URL_FOOTBALL}/odds/live`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    const data = await res.json();
    return data.response || [];
  } catch {
    return [];
  }
}

// جلب أنواع الأسواق (bets/markets) المتوفرة حالياً في live odds
export async function getLiveOddsBets() {
  try {
    const res = await fetch(`${BASE_URL_FOOTBALL}/odds/live/bets`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    const data = await res.json();
    return data.response || [];
  } catch {
    return [];
  }
}
// جلب النتائج المباشرة لكرة القدم فقط
export async function getLiveScoresBySport(sport = "Soccer") {
  if (sport !== "Soccer") return [];
  try {
    const res = await fetch(`${BASE_URL_FOOTBALL}/fixtures?live=all`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    const data = await res.json();
    return (data.response || []);
  } catch {
    return [];
  }
}
