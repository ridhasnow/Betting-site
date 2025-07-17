import React, { useState } from "react";
import { FaArrowLeft, FaSearch } from "react-icons/fa";

// صور ألعاب كازينو مشهورة (يمكنك التغيير بسهولة)
const casinoGames = [
  {
    name: "Gates of Olympus Super Scatter",
    image: "https://static.pragmaticplay.com/game-pictures/olympus.jpg",
    isNew: true,
    provider: "Pragmatic",
    type: "Slots",
  },
  {
    name: "5 Lions Megaways™ 2",
    image: "https://static.pragmaticplay.com/game-pictures/5lionsmegaways2.jpg",
    isNew: true,
    provider: "Pragmatic",
    type: "Slots",
  },
  {
    name: "Roulette Live",
    image: "https://www.evolution.com/sites/default/files/styles/media_crop/public/2022-02/ROULETTE-LIVE-THUMBNAIL.jpg",
    isNew: false,
    provider: "Evolution",
    type: "Roulette",
  },
  {
    name: "Blackjack Classic",
    image: "https://www.evolution.com/sites/default/files/styles/media_crop/public/2022-02/BLACKJACK-THUMBNAIL.jpg",
    isNew: false,
    provider: "Evolution",
    type: "Blackjack",
  },
  {
    name: "Sweet Bonanza",
    image: "https://static.pragmaticplay.com/game-pictures/sweetbonanza.jpg",
    isNew: false,
    provider: "Pragmatic",
    type: "Slots",
  },
  {
    name: "Aviator",
    image: "https://cdn.spribe.co/games/aviator/images/aviator_thumb.png",
    isNew: true,
    provider: "Spribe",
    type: "Crash",
  },
];

const providers = [
  "All", "Pgsoft", "Amatic", "Amatic2", "Vimplay", "Pragmatic", "Evolution", "Spribe"
];
const types = [
  "All", "New", "Roulette", "Blackjack", "Slots", "Crash"
];

export default function CasinoGamesPage() {
  const [selectedProvider, setSelectedProvider] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [search, setSearch] = useState("");

  // فلترة الألعاب حسب الفلاتر و البحث
  const filteredGames = casinoGames.filter((game) => {
    const matchProvider =
      selectedProvider === "All" || game.provider === selectedProvider;
    const matchType =
      selectedType === "All" ||
      (selectedType === "New" && game.isNew) ||
      game.type === selectedType;
    const matchSearch =
      search.trim() === "" ||
      game.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchProvider && matchType && matchSearch;
  });

  // زر الرجوع
  const goBack = () => {
    window.history.length > 1 ? window.history.back() : window.location.assign("/");
  };

  return (
    <div className="casino-main">
      {/* شريط علوي أسود */}
      <header className="casino-header">
        <button className="casino-back-btn" onClick={goBack} aria-label="رجوع">
          <FaArrowLeft />
        </button>
        <span className="casino-header-title">Jeux de casino</span>
      </header>

      {/* شريط أزرق */}
      <div className="casino-bluebar">
        Tous les jeux
      </div>

      {/* بانر ثابت */}
      <div className="casino-banner">
        <img
          src="https://static.pragmaticplay.com/game-pictures/banner/olympus-banner.jpg"
          alt="Casino Banner"
        />
      </div>

      {/* فلاتر الشركات */}
      <div className="casino-filters">
        <div className="casino-filters-providers">
          {providers.map((prov) => (
            <button
              key={prov}
              className={`casino-filter-btn ${selectedProvider === prov ? "active" : ""}`}
              onClick={() => setSelectedProvider(prov)}
            >
              {prov}
              {prov === "Amatic2" || prov === "Pgsoft" ? (
                <span className="casino-filter-badge">NEW</span>
              ) : null}
            </button>
          ))}
          <div className="casino-filter-search">
            <FaSearch />
            <input
              type="text"
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {/* فلاتر أنواع الألعاب */}
        <div className="casino-filters-types">
          {types.map((type) => (
            <button
              key={type}
              className={`casino-filter-btn ${selectedType === type ? "active" : ""}`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* قائمة الألعاب */}
      <div className="casino-games-grid">
        {filteredGames.length === 0 && (
          <div className="casino-empty">لا توجد ألعاب مطابقة للبحث</div>
        )}
        {filteredGames.map((game, idx) => (
          <div className="casino-game-card" key={idx}>
            <div className="casino-game-img">
              <img src={game.image} alt={game.name} />
              {game.isNew && <span className="casino-game-new">NEW</span>}
            </div>
            <div className="casino-game-title">{game.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
