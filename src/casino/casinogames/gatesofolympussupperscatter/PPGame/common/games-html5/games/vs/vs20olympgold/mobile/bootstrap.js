// إعدادات أساسية ومحلية للعبة (بدون أي ربط خارجي)
var UHT_LOCAL = false, UHT_ONLINE = false, UHT_DEBUG = false;
var UHT_SCRIPTS = ['build.js'], UHT_STYLES = ['style.css'];
var UHT_CLIENT_SIZES = 0, UHT_CLIENT_FILES = [], UHT_CLIENT_DOWNLOADED = 0;
var UHT_CLIENT_LOCALIZATION = null, UHT_GAME_SIZE = 0, UHT_OTHER_SIZE = 0;
var UHT_GAME_FILES = [], UHT_GUI_SIZE = 0, UHT_RESOURCES_SIZE = 0, UHT_GUI_RESOURCES_SIZE = 0, UHT_MODULES_SIZES = 0;
var UHT_RESOURCES_FILES = [], UHT_GAME_FILES_SIZES = [];
var UHT_BUILD_PATH = "", UHT_SYSTEM_MESSAGES = null, UHT_PACKAGES_INFO = null, UHT_CURRENCY_PATCH = null, UHT_RESOURCES = null, UHT_PACKAGES_INFO_OBJ = null;
var UHT_GAME_CONFIG = { LANGUAGE: "en", CURRENCY: "TND" }, UHT_GAME_CONFIG_SRC = {};
var UHT_REVISION = { common: '304469', desktop: '304469', mobile: '-', uncommon: "" };

// إعداد الرمز الخاص باللعبة
var UHT_CONFIG = { SYMBOL: 'vs20olympgold', GAME_URL: "" };
var UHT_CUSTOM_LOADER = false;

// حوسبة uncommon revision
var u = UHT_REVISION.common.split('');
UHT_REVISION.uncommon = '';
for (var i = 0; i < u.length; i++) UHT_REVISION.uncommon += 9 - u[i] | 0;
UHT_REVISION.uncommon = (0 | UHT_REVISION.uncommon).toString(16);

// رسائل النظام (بالإنجليزية فقط)
const UHT_SYSTEM_MESSAGES = {
  en: {
    Frozen: "val",
    ServerError: "val",
    NoMoney: "TO PLACE THIS BET, YOU WILL NEED TO ADD FUNDS TO YOUR GAME BALANCE",
    Techbreak: "SORRY! FOR THE MOMENT, BETTING IS UNAVAILABLE DUE TO MAINTENANCE. PLEASE TRY AGAIN SHORTLY.",
    GameAvailableOnlyAtRealMode: "SORRY! THIS GAME IS ONLY AVAILABLE TO PLAYERS IN REAL MONEY MODE.",
    ProgressiveJackpotGamesAvailableOnlyAtRealMode: "CAN BE PLAYED WITH REAL MONEY ONLY",
    ProgressiveJackpotGames: "PROGRESSIVE JACKPOT GAMES",
    SaveSettingError: "SETTINGS CAN ONLY BE SAVED LOCALLY DURING THIS SESSION.",
    LostConnect: "YOUR CONNECTION TO THE GAME HAS BEEN LOST. PLEASE TRY AGAIN SHORTLY.",
    PleaseLogin: "Please log in",
    UnsupportedBrowserTitle: "FOR A BETTER GAMING EXPERIENCE",
    UseGoogleChrome: "PLEASE USE GOOGLE CHROME",
    UseSafari: "PLEASE USE SAFARI",
    Timeout: "Your session has expired. Please restart the game.",
    JackpotsAreClosed: "ALL JACKPOTS ARE CLOSED IN THIS GAME AND BETS HAVE BEEN DISABLED.\nPLEASE TRY AGAIN LATER",
    BtOK: "OK",
    Regulation: "val",
    BtContinuePlaying: "CONTINUE PLAYING",
    BtStopPlaying: "STOP PLAYING",
    WindowTitle: "MESSAGE",
    BtRCHistory: "GAME HISTORY",
    BtCLOSE: "CLOSE",
    DeferredLoading: "Loading Features",
    ResumingGame: "A game is already in progress, resuming...",
    ClientRegulation: "You have been playing for {1} minutes. Press CONTINUE to keep playing",
    ClientRegulationTitleUKGC: "UKGC Reality Check",
    ClientRegulationTitleMalta: "Malta Reality Check",
    BtContinue: "Continue",
    Currency: "TND",
    GameFundsNotice: "GAME FUNDS ARE MANAGED LOCALLY. NO REAL MONEY IS USED OR REQUIRED.",
    BtQuit: "Quit",
    BtAccountHistory: "Account History",
    BtExit: "Exit"
  }
};

// معلومات الموارد (إنجليزي فقط)
const UHT_PACKAGES_INFO = {
  default_sound_suffix: "",
  languages: [ { language: "en", bundles: [ { name: "en" }, { name: "en_GUI" } ] } ]
};

// إعدادات العملة TND فقط
const UHT_CURRENCY_PATCH = {
  resources: [
    {
      type: "GameObject",
      id: "local-currency-patch",
      data: {
        root: [
          {
            name: "CurrencyPatch",
            activeSelf: true,
            layer: 0,
            components: [
              { componentType: "Transform", enabled: true, serializableData: { parent: { fileID: 0 }, children: [], psr: "d" }, fileID: 1 },
              { componentType: "CurrencyPatch", enabled: true, serializableData: {
                  currencyFile: { fileID: 4900000, guid: "local-tnd-currency" },
                  languageFormatFile: { fileID: 4900000, guid: "local-tnd-format" },
                  currencyName: "TND", languageName: "en", fonts: [], revisionNumber: 0, useTheForce: false
                }, fileID: 2 }
            ], fileID: 3
          }
        ]
      }
    },
    { type: "TextAsset", id: "local-tnd-currency", data: { text: { TNDsym: "TND" } } },
    { type: "TextAsset", id: "local-tnd-format", data: { text: { en_dsep: ".", en_dnum: "2", en_gsep: ",", en_gnum: "3", en_symp: "0" } } }
  ]
};

// replace helper
function UHTReplace(str) { return String(str).replace(/###APOS###/g, "'"); }

// Event broker: بدون أي business logic خارجي
var UHTEventBroker = function() {
  var defaultConfig = { GAME_URL: "", LANGUAGE: "en", CURRENCY: "TND" };
  var isOnline = false, gameConfig = { ...defaultConfig }, gameLoaded = false, eventHandlers = {};

  function parseOnlineConfig(config) { UHT_GAME_CONFIG = gameConfig; UHT_GAME_CONFIG_SRC = config; }
  function parseOfflineConfig() { UHT_GAME_CONFIG = UHT_GAME_CONFIG_SRC = gameConfig; }

  function loadScript(url) {
    if (url.indexOf("build.js") == -1)
      url = UHT_CONFIG.GAME_URL + url + "?key=" + UHT_REVISION.uncommon;
    else
      url = UHT_CONFIG.GAME_URL + window.UHT_SCRIPTS_SIZE.split(":")[0];
    var xmlhttp = new XMLHttpRequest;
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4)
        if (xmlhttp.status == 200) {
          var script = document.createElement("script");
          script.innerHTML = xmlhttp.responseText + "\r\n//# sourceURL=" + url;
          document.head.appendChild(script);
          loadScriptsOneByOne();
        } else setTimeout(function() { loadScript(url); }, 250);
    };
    xmlhttp.onprogress = function(progress) {
      if (progress.currentTarget.responseURL.indexOf("build.js") != -1) {
        if (!window.UHT_CUSTOM_LOADER)
          document.getElementById("loadingBar").style.width = progress.loaded / UHT_GAME_SIZE * 70 + 1 + "%";
        UHT_CLIENT_DOWNLOADED = progress.total != 0 ? progress.total : progress.loaded;
      }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }
  function loadScriptsOneByOne() {
    var script = UHT_SCRIPTS.shift();
    if (script) loadScript(script); else onScriptsLoaded();
  }
  function loadStyle(url) {
    var head = document.head, link = document.createElement("link");
    link.href = UHT_CONFIG.GAME_URL + url + "?key=" + UHT_REVISION.uncommon;
    link.type = "text/css"; link.rel = "stylesheet";
    link.onload = loadStyles;
    link.onerror = function() { head.removeChild(link); setTimeout(function() { UHT_STYLES.unshift(url); loadStyles(); }, 250); };
    head.appendChild(link);
  }
  function loadStyles() { var style = UHT_STYLES.shift(); if (style) loadStyle(style); }
  function loadGame() { loadScriptsOneByOne(); loadStyles(); }
  function onScriptsLoaded() { var main = window.main || null; if (main && window.globalGamePath !== undefined) main(); }

  function sendToAdapter() {}, sendToGame() {}, sendToGameInternal() {}, sendMessagesToGame() {}
  function triggerEvent(target, param) {
    if (eventHandlers[target]) for (var i = 0; i < eventHandlers[target].length; ++i) eventHandlers[target][i].call(param);
  }
  function onLoad() {
    UHTConsole.AllowToWrite(UHT_LOCAL);
    window.sendToGame = sendToGame;
    window.sendToAdapter = sendToAdapter;
    window.unityToWrapperMsg = sendToAdapter;
    parseOfflineConfig();
    loadGame();
  }

  var EM = {};
  EM.Handler = function(obj, cb) { this.object = obj; this.callback = cb; };
  EM.Handler.prototype.equals = function(obj, cb) { return obj == this.object && cb == this.callback; };
  EM.Handler.prototype.call = function() { this.callback.apply(this.object, arguments); };
  EM.Type = { Game: "sendToGame", Adapter: "sendToAdapter", Wrapper: "unityToWrapperMsg" };
  EM.AddHandler = function(target, handler) { (eventHandlers[target] = eventHandlers[target] || []).push(handler); };
  EM.Trigger = function(target, param) { if (target === EM.Type.Adapter || target === EM.Type.Wrapper) triggerEvent(target, param); };
  window.onload = onLoad;
  return EM;
}();

// فقط تحميل الموارد الإنجليزية
function UHTVarsInjected() {
  // تحميل الاستس فقط من السيرفر (صور/أصوات/GUI/Modules)
  // يتم تعطيل أي تخصيص أو تحميل لغات أخرى تلقائيًا
}

UHTVarsInjected();
