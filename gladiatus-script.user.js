// ==UserScript==
// @name         Gladiatus Script
// @version      2.6.4
// @description  Dodatek do gry Gladiatus
// @author       Eryk Bodziony
// @match        *://*.gladiatus.gameforge.com/game/index.php*
// @exclude      *://*.gladiatus.gameforge.com/game/index.php?mod=start
// @downloadURL  https://github.com/mogyi006/gladiatus-script/raw/master/gladiatus-script.js
// @updateURL    https://github.com/mogyi006/gladiatus-script/raw/master/gladiatus-script.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @resource     customCSS_global  https://raw.githubusercontent.com/mogyi006/gladiatus-script/master/global.css?ver=2.6.4
// ==/UserScript==


(function () {
    'use strict';

    // Add CSS

    function addCustomCSS() {
        const globalCSS = GM_getResourceText("customCSS_global");
        GM_addStyle(globalCSS);
    };

    addCustomCSS();

    /*****************
    *     Global     *
    *****************/

    const assetsUrl = 'https://raw.githubusercontent.com/mogyi006/gladiatus-script/master/assets';

    let autoGoActive = sessionStorage.getItem('autoGoActive') === "true" ? true : false;

    const currentDate = $("#server-time").html().split(',')[0];

    const player = {
        level: Number($("#header_values_level").first().html()),
        hp: Number($("#header_values_hp_percent").first().html().replace(/[^0-9]/gi, '')),
        gold: Number($("#sstat_gold_val").first().html().replace(/\./g, '')),
    };

    /*****************
    *     Config     *
    *****************/

    // Mode

    let safeMode = false;
    let nextEncounterTime = Number(localStorage.getItem('nextEncounter'));

    // Quests

    let doQuests = true;
    if (localStorage.getItem('doQuests')) {
        doQuests = localStorage.getItem('doQuests') === "true" ? true : false;
    }
    let questTypes = {
        combat: true,
        arena: true,
        circus: true,
        expedition: true,
        dungeon: true,
        items: true
    };
    if (localStorage.getItem('questTypes')) {
        questTypes = JSON.parse(localStorage.getItem('questTypes'));
    }
    let nextQuestTime = 0;
    if (localStorage.getItem('nextQuestTime')) {
        nextQuestTime = Number(localStorage.getItem('nextQuestTime'));
    }

    // Expedition

    let doExpedition = true;
    if (localStorage.getItem('doExpedition')) {
        doExpedition = localStorage.getItem('doExpedition') === "true" ? true : false;
    };
    let monsterId = 0;
    if (localStorage.getItem('monsterId')) {
        monsterId = Number(localStorage.getItem('monsterId'));
    };
    let pauseToEat = false;
    if (localStorage.getItem('pauseToEat')) {
        pauseToEat = localStorage.getItem('pauseToEat') === "true" ? true : false;
    };
    // Queue of expeditions to do: location + number of times to do it
    let expeditionQueue = [];
    if (localStorage.getItem('expeditionQueue')) {
        expeditionQueue = JSON.parse(localStorage.getItem('expeditionQueue'));
    }


    // Dungeon

    let doDungeon = true;
    if (localStorage.getItem('doDungeon')) {
        doDungeon = localStorage.getItem('doDungeon') === "true" ? true : false;
    };
    if (player.level < 10) {
        doDungeon = false;
    };
    let dungeonDifficulty = localStorage.getItem('dungeonDifficulty') === 'advanced' ? 'advanced' : 'normal';

    // Arena

    let doArena = true;
    if (localStorage.getItem('doArena')) {
        doArena = localStorage.getItem('doArena') === "true" ? true : false;
    };
    if (player.level < 2) {
        doArena = false;
    };
    let arenaOpponentLevel = "min"
    if (localStorage.getItem('arenaOpponentLevel')) {
        arenaOpponentLevel = localStorage.getItem('arenaOpponentLevel');
    };

    // Circus

    let doCircus = true;
    if (localStorage.getItem('doCircus')) {
        doCircus = localStorage.getItem('doCircus') === "true" ? true : false;
    };
    if (player.level < 10) {
        doCircus = false;
    };
    let circusOpponentLevel = "min"
    if (localStorage.getItem('circusOpponentLevel')) {
        circusOpponentLevel = localStorage.getItem('circusOpponentLevel');
    };

    // Event Expedition

    let doEventExpedition = true;
    if (localStorage.getItem('doEventExpedition')) {
        doEventExpedition = localStorage.getItem('doEventExpedition') === "true" ? true : false;
    };
    if (!document.getElementById("submenu2").getElementsByClassName("menuitem glow")[0]) {
        doEventExpedition = false;
    };

    let eventMonsterId = 0;
    if (localStorage.getItem('eventMonsterId')) {
        eventMonsterId = Number(localStorage.getItem('eventMonsterId'));
    };

    let nextEventExpeditionTime = 0;
    if (localStorage.getItem('nextEventExpeditionTime')) {
        nextEventExpeditionTime = Number(localStorage.getItem('nextEventExpeditionTime'));
    };

    let eventPoints = 16;
    if (localStorage.getItem('eventPoints')) {
        const savedEventPoints = JSON.parse(localStorage.getItem('eventPoints'));

        if (savedEventPoints.date === currentDate) {
            eventPoints = savedEventPoints.count;
        };
    };

    // Eat Food
    let eatFood = true;
    if (localStorage.getItem('eatFood')) {
        eatFood = localStorage.getItem('eatFood') === "true" ? true : false;
    }

    // Save Gold
    let saveGold = true;
    if (localStorage.getItem('saveGold')) {
        saveGold = localStorage.getItem('saveGold') === "true" ? true : false;
    }
    let pauseToSaveGold = false;
    if (localStorage.getItem('pauseToSaveGold')) {
        pauseToSaveGold = localStorage.getItem('pauseToSaveGold') === "true" ? true : false;
    }
    let saveGoldState = 0;
    if (localStorage.getItem('saveGoldState')) {
        saveGoldState = Number(localStorage.getItem('saveGoldState'));
    }
    let saveGoldItemHash = "";
    if (localStorage.getItem('saveGoldItemHash')) {
        saveGoldItemHash = localStorage.getItem('saveGoldItemHash');
    }
    let saveGoldItemLevel = 0;
    if (localStorage.getItem('saveGoldItemLevel')) {
        saveGoldItemLevel = Number(localStorage.getItem('saveGoldItemLevel'));
    }
    let saveGoldAmount = 100000;
    if (localStorage.getItem('saveGoldAmount')) {
        saveGoldAmount = Number(localStorage.getItem('saveGoldAmount'));
    }

    /*****************
    *  Translations  *
    *****************/

    const contentEN = {
        advanced: 'Advanced',
        arena: 'Arena',
        circusTurma: 'Circus Turma',
        difficulty: 'Difficulty',
        dungeon: 'Dungeon',
        eventExpedition: 'Event Expedition',
        expedition: 'Expedition',
        highest: 'Highest',
        in: 'In',
        lastUsed: "Last Used",
        location: 'Location',
        lowest: 'Lowest',
        nextAction: 'Next action',
        no: 'No',
        normal: 'Normal',
        opponent: 'Opponent',
        opponentLevel: 'Opponent Level',
        quests: 'Quests',
        random: 'Random',
        settings: 'Settings',
        soon: 'Soon...',
        type: 'Type',
        yes: 'Yes',
        eatFood: 'Eat Food',
        saveGold: 'Save Gold',
        100: '100',
        250: '250',
        500: '500',
        750: '750',
        1000: '1M',
    }

    const contentPL = {
        advanced: 'Zaawansowane',
        arena: 'Arena',
        circusTurma: 'Circus Turma',
        difficulty: 'Trudność',
        dungeon: 'Lochy',
        eventExpedition: 'Wyprawa Eventowa',
        expedition: 'Wyprawa',
        highest: 'Najwyższy',
        in: 'Za',
        lastUsed: "Ostatnio Używana",
        location: 'Lokacja',
        lowest: 'Najniższy',
        nextAction: 'Następna akcja',
        no: 'Nie',
        normal: 'Normalne',
        opponent: 'Przeciwnik',
        opponentLevel: 'Poziom Przeciwnika',
        quests: 'Zadania',
        random: 'Losowy',
        settings: 'Ustawienia',
        soon: 'Wkrótce...',
        type: 'Rodzaj',
        yes: 'Tak',
        eatFood: 'Eat Food',
        saveGold: 'Save Gold',
        100: '100',
        250: '250',
        500: '500',
        750: '750',
        1000: '1M',
    }

    const contentES = {
        advanced: 'Avanzado',
        arena: 'Arena',
        circusTurma: 'Circus Turma',
        difficulty: 'Dificultad',
        dungeon: 'Mazmorra',
        eventExpedition: 'Expedición de Evento',
        expedition: 'Expedición',
        highest: 'Más alto',
        in: 'En',
        lastUsed: "Último visitado",
        location: 'Localización',
        lowest: 'Más bajo',
        nextAction: 'Próxima Acción',
        no: 'No',
        normal: 'Normal',
        opponent: 'Oponente',
        opponentLevel: 'Nivel de oponente',
        quests: 'Misiones',
        random: 'Aleatorio',
        settings: 'Configuración',
        soon: 'Próximamente...',
        type: 'Tipo',
        yes: 'Si',
        eatFood: 'Eat Food',
        saveGold: 'Save Gold',
        100: '100',
        250: '250',
        500: '500',
        750: '750',
        1000: '1M',
    }

    let content;

    const language = localStorage.getItem('settings.language')

    switch (language) {
        case 'EN':
            content = { ...contentEN }
            break;
        case 'PL':
            content = { ...contentPL }
            break;
        case 'ES':
            content = { ...contentES }
            break;
        default:
            content = { ...contentEN }
    }

    /****************
    *   Interface   *
    ****************/

    // Set Auto Go Active
    function setAutoGoActive() {
        sessionStorage.setItem('autoGoActive', true);
        document.getElementById("autoGoButton").innerHTML = 'STOP'
        document.getElementById("autoGoButton").removeEventListener("click", setAutoGoActive);
        document.getElementById("autoGoButton").addEventListener("click", setAutoGoInactive);
        document.getElementById("autoGoButton").removeEventListener("touchstart", setAutoGoActive);
        document.getElementById("autoGoButton").addEventListener("touchstart", setAutoGoInactive);
        autoGo();
    };

    // Set Auto Go Inactive
    function setAutoGoInactive() {
        sessionStorage.setItem('autoGoActive', false);
        document.getElementById("autoGoButton").innerHTML = 'Auto GO'
        document.getElementById("autoGoButton").addEventListener("click", setAutoGoActive);
        document.getElementById("autoGoButton").removeEventListener("click", setAutoGoInactive);
        document.getElementById("autoGoButton").addEventListener("touchstart", setAutoGoActive);
        document.getElementById("autoGoButton").removeEventListener("touchstart", setAutoGoInactive);

        clearTimeout(setTimeout);

        if (document.getElementById("nextActionWindow")) {
            document.getElementById("nextActionWindow").remove();
        };

        if (document.getElementById("lowHealth")) {
            document.getElementById("lowHealth").remove();
        };
    };

    // Open Settings
    function openSettings() {

        function closeSettings() {
            document.getElementById("settingsWindow").remove();
            document.getElementById("overlayBack").remove();
        };

        /*
            <div class="settingsHeaderSmall">${content.location}</div>
            <div class="settingsSubcontent">
                <div id="set_expedition_location" class="settingsButton">${content.lastUsed}</div>
            </div>
            <div class="settingsHeaderSmall">${content.location}</div>
            <div class="settingsSubcontent">
                <div id="set_dungeon_location" class="settingsButton">${content.lastUsed}</div>
            </div>
        */

        var settingsWindow = document.createElement("div");
        settingsWindow.setAttribute("id", "settingsWindow")
        settingsWindow.innerHTML = `
                <span id="settingsLanguage">
                    <img id="languageEN" src="${assetsUrl}/GB.png">
                    <img id="languagePL" src="${assetsUrl}/PL.png">
                    <img id="languageES" src="${assetsUrl}/ES.png">
                </span>
                <span id="settingsHeader">${content.settings}</span>
                <div id="settingsContent">
                    <div
                        id="expedition_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.expedition}</div>
                        <div class="settingsSubcontent">
                            <div id="do_expedition_true" class="settingsButton">${content.yes}</div>
                            <div id="do_expedition_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.opponent}</div>
                        <div class="settingsSubcontent">
                            <div id="set_monster_id_0" class="settingsButton">1</div>
                            <div id="set_monster_id_1" class="settingsButton">2</div>
                            <div id="set_monster_id_2" class="settingsButton">3</div>
                            <div id="set_monster_id_3" class="settingsButton">Boss</div>
                        </div>
                    </div>

                    <div
                        id="dungeon_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.dungeon}</div>
                        <div class="settingsSubcontent">
                            <div id="do_dungeon_true" class="settingsButton">${content.yes}</div>
                            <div id="do_dungeon_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.difficulty}</div>
                        <div class="settingsSubcontent">
                            <div id="set_dungeon_difficulty_normal" class="settingsButton">${content.normal}</div>
                            <div id="set_dungeon_difficulty_advanced" class="settingsButton">${content.advanced}</div>
                        </div>
                    </div>

                    <div
                        id="arena_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.arena}</div>
                        <div class="settingsSubcontent">
                            <div id="do_arena_true" class="settingsButton">${content.yes}</div>
                            <div id="do_arena_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.opponentLevel}</div>
                        <div class="settingsSubcontent">
                            <div id="set_arena_opponent_level_min" class="settingsButton">${content.lowest}</div>
                            <div id="set_arena_opponent_level_max" class="settingsButton">${content.highest}</div>
                            <div id="set_arena_opponent_level_random" class="settingsButton">${content.random}</div>
                        </div>
                    </div>

                    <div
                        id="circus_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.circusTurma}</div>
                        <div class="settingsSubcontent">
                            <div id="do_circus_true" class="settingsButton">${content.yes}</div>
                            <div id="do_circus_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.opponentLevel}</div>
                        <div class="settingsSubcontent">
                            <div id="set_circus_opponent_level_min" class="settingsButton">${content.lowest}</div>
                            <div id="set_circus_opponent_level_max" class="settingsButton">${content.highest}</div>
                            <div id="set_circus_opponent_level_random" class="settingsButton">${content.random}</div>
                        </div>
                    </div>

                    <div
                        id="quests_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.quests}</div>
                        <div class="settingsSubcontent">
                            <div id="do_quests_true" class="settingsButton">${content.yes}</div>
                            <div id="do_quests_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.type}</div>
                        <div class="settingsSubcontent">
                            <div id="do_combat_quests" class="settingsButton quest-type combat"></div>
                            <div id="do_arena_quests" class="settingsButton quest-type arena"></div>
                            <div id="do_circus_quests" class="settingsButton quest-type circus"></div>
                            <div id="do_expedition_quests" class="settingsButton quest-type expedition"></div>
                            <div id="do_dungeon_quests" class="settingsButton quest-type dungeon"></div>
                            <div id="do_items_quests" class="settingsButton quest-type items"></div>
                        </div>
                    </div>

                    <div
                        id="event_expedition_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.eventExpedition}</div>
                        <div class="settingsSubcontent">
                            <div id="do_event_expedition_true" class="settingsButton">${content.yes}</div>
                            <div id="do_event_expedition_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.opponent}</div>
                        <div class="settingsSubcontent">
                            <div id="set_event_monster_id_0" class="settingsButton">1</div>
                            <div id="set_event_monster_id_1" class="settingsButton">2</div>
                            <div id="set_event_monster_id_2" class="settingsButton">3</div>
                            <div id="set_event_monster_id_3" class="settingsButton">Boss</div>
                        </div>
                    </div>

                    <div
                        id="food_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.eatFood}</div>
                        <div class="settingsSubcontent">
                            <div id="eat_food_true" class="settingsButton">${content.yes}</div>
                            <div id="eat_food_false" class="settingsButton">${content.no}</div>
                        </div>
                    </div>

                    <div
                        id="gold_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.saveGold}</div>
                        <div class="settingsSubcontent">
                            <div id="save_gold_0" class="settingsButton">${content.no}</div>
                            <div id="save_gold_100" class="settingsButton">${content[100]}</div>
                            <div id="save_gold_250" class="settingsButton">${content[250]}</div>
                            <div id="save_gold_500" class="settingsButton">${content[500]}</div>
                            <div id="save_gold_750" class="settingsButton">${content[750]}</div>
                            <div id="save_gold_1000" class="settingsButton">${content[1000]}</div>
                        </div>
                    </div>
                </div>`;
        document.getElementById("header_game").insertBefore(settingsWindow, document.getElementById("header_game").children[0]);

        var overlayBack = document.createElement("div");
        const wrapperHeight = document.getElementById("wrapper_game").clientHeight;
        overlayBack.setAttribute("id", "overlayBack");
        overlayBack.setAttribute("style", `height: ${wrapperHeight}px;`);
        overlayBack.addEventListener("click", closeSettings);
        overlayBack.addEventListener("touchstart", closeSettings);
        document.getElementsByTagName("body")[0].appendChild(overlayBack);

        // Set Language

        function setLanguage(language) {
            localStorage.setItem('settings.language', language)

            switch (language) {
                case 'EN':
                    content = { ...contentEN }
                    break;
                case 'PL':
                    content = { ...contentPL }
                    break;
                case 'ES':
                    content = { ...contentES }
                    break;
                default:
                    content = { ...contentEN }
            };

            reloadSettings();
        };

        $("#languageEN").on('touchstart click', function () { setLanguage('EN') });
        $("#languagePL").on('touchstart click', function () { setLanguage('PL') });
        $("#languageES").on('touchstart click', function () { setLanguage('ES') });


        // Change Settings

        function setDoExpedition(bool) {
            doExpedition = bool;
            localStorage.setItem('doExpedition', bool);
            reloadSettings();
        };

        $("#do_expedition_true").on('touchstart click', function () { setDoExpedition(true) });
        $("#do_expedition_false").on('touchstart click', function () { setDoExpedition(false) });

        function setMonster(id) {
            monsterId = id;
            localStorage.setItem('monsterId', id);
            reloadSettings();
        };

        $("#set_monster_id_0").on('touchstart click', function () { setMonster('0') });
        $("#set_monster_id_1").on('touchstart click', function () { setMonster('1') });
        $("#set_monster_id_2").on('touchstart click', function () { setMonster('2') });
        $("#set_monster_id_3").on('touchstart click', function () { setMonster('3') });

        function setDoDungeon(bool) {
            doDungeon = bool;
            localStorage.setItem('doDungeon', bool);
            reloadSettings();
        };

        $("#do_dungeon_true").on('touchstart click', function () { setDoDungeon(true) });
        $("#do_dungeon_false").on('touchstart click', function () { setDoDungeon(false) });

        function setDungeonDifficulty(difficulty) {
            dungeonDifficulty = difficulty;
            localStorage.setItem('dungeonDifficulty', difficulty);
            reloadSettings();
        };

        $("#set_dungeon_difficulty_normal").on('touchstart click', function () { setDungeonDifficulty("normal") });
        $("#set_dungeon_difficulty_advanced").on('touchstart click', function () { setDungeonDifficulty("advanced") });

        function setDoArena(bool) {
            doArena = bool;
            localStorage.setItem('doArena', bool);
            reloadSettings();
        };

        $("#do_arena_true").on('touchstart click', function () { setDoArena(true) });
        $("#do_arena_false").on('touchstart click', function () { setDoArena(false) });

        function setArenaOpponentLevel(level) {
            arenaOpponentLevel = level;
            localStorage.setItem('arenaOpponentLevel', level);
            reloadSettings();
        };

        $("#set_arena_opponent_level_min").on('touchstart click', function () { setArenaOpponentLevel('min') });
        $("#set_arena_opponent_level_max").on('touchstart click', function () { setArenaOpponentLevel('max') });
        $("#set_arena_opponent_level_random").on('touchstart click', function () { setArenaOpponentLevel('random') });

        function setDoCircus(bool) {
            doCircus = bool;
            localStorage.setItem('doCircus', bool);
            reloadSettings();
        };

        $("#do_circus_true").on('touchstart click', function () { setDoCircus(true) });
        $("#do_circus_false").on('touchstart click', function () { setDoCircus(false) });

        function setCircusOpponentLevel(level) {
            circusOpponentLevel = level;
            localStorage.setItem('circusOpponentLevel', level);
            reloadSettings();
        };

        $("#set_circus_opponent_level_min").on('touchstart click', function () { setCircusOpponentLevel('min') });
        $("#set_circus_opponent_level_max").on('touchstart click', function () { setCircusOpponentLevel('max') });
        $("#set_circus_opponent_level_random").on('touchstart click', function () { setCircusOpponentLevel('random') });

        function setDoQuests(bool) {
            doQuests = bool;
            localStorage.setItem('doQuests', bool);
            reloadSettings();
        };

        $("#do_quests_true").on('touchstart click', function () { setDoQuests(true) });
        $("#do_quests_false").on('touchstart click', function () { setDoQuests(false) });

        function setQuestTypes(type) {
            questTypes[type] = !questTypes[type];
            localStorage.setItem('questTypes', JSON.stringify(questTypes));
            reloadSettings();
        };

        $("#do_combat_quests").on('touchstart click', function () { setQuestTypes('combat') });
        $("#do_arena_quests").on('touchstart click', function () { setQuestTypes('arena') });
        $("#do_circus_quests").on('touchstart click', function () { setQuestTypes('circus') });
        $("#do_expedition_quests").on('touchstart click', function () { setQuestTypes('expedition') });
        $("#do_dungeon_quests").on('touchstart click', function () { setQuestTypes('dungeon') });
        $("#do_items_quests").on('touchstart click', function () { setQuestTypes('items') });

        function setDoEventExpedition(bool) {
            doEventExpedition = bool;
            localStorage.setItem('doEventExpedition', bool);
            reloadSettings();
        };

        $("#do_event_expedition_true").on('touchstart click', function () { setDoEventExpedition(true) });
        $("#do_event_expedition_false").on('touchstart click', function () { setDoEventExpedition(false) });

        function setEventMonster(id) {
            eventMonsterId = id;
            localStorage.setItem('eventMonsterId', id);
            reloadSettings();
        };

        $("#set_event_monster_id_0").on('touchstart click', function () { setEventMonster('0') });
        $("#set_event_monster_id_1").on('touchstart click', function () { setEventMonster('1') });
        $("#set_event_monster_id_2").on('touchstart click', function () { setEventMonster('2') });
        $("#set_event_monster_id_3").on('touchstart click', function () { setEventMonster('3') });

        function setEatFood(bool) {
            eatFood = bool;
            localStorage.setItem('eatFood', bool);
            reloadSettings();
        };

        $("#eat_food_true").on('touchstart click', function () { setEatFood(true) });
        $("#eat_food_false").on('touchstart click', function () { setEatFood(false) });

        function setSaveGold(amount) {
            if (amount === '100') {
                saveGold = true;
                localStorage.setItem('saveGold', true);
                saveGoldAmount = 100000;
                localStorage.setItem('saveGoldAmount', 100000);
                saveGoldState = 0;
                localStorage.setItem('saveGoldState', 0);
            } else if (amount === '250') {
                saveGold = true;
                localStorage.setItem('saveGold', true);
                saveGoldAmount = 250000;
                localStorage.setItem('saveGoldAmount', 250000);
                saveGoldState = 0;
                localStorage.setItem('saveGoldState', 0);
            } else if (amount === '500') {
                saveGold = true;
                localStorage.setItem('saveGold', true);
                saveGoldAmount = 500000;
                localStorage.setItem('saveGoldAmount', 500000);
                saveGoldState = 0;
                localStorage.setItem('saveGoldState', 0);
            } else if (amount === '750') {
                saveGold = true;
                localStorage.setItem('saveGold', true);
                saveGoldAmount = 750000;
                localStorage.setItem('saveGoldAmount', 750000);
                saveGoldState = 0;
                localStorage.setItem('saveGoldState', 0);
            } else if (amount === '1000') {
                saveGold = true;
                localStorage.setItem('saveGold', true);
                saveGoldAmount = 1000000;
                localStorage.setItem('saveGoldAmount', 1000000);
                saveGoldState = 0;
                localStorage.setItem('saveGoldState', 0);
            }
            else {
                saveGold = false;
                localStorage.setItem('saveGold', false);
                saveGoldAmount = 0;
                localStorage.setItem('saveGoldAmount', 0);
                saveGoldState = 0;
                localStorage.setItem('saveGoldState', 0);
            }
            reloadSettings();
        };

        $("#save_gold_0").on('touchstart click', function () { setSaveGold('0') });
        $("#save_gold_100").on('touchstart click', function () { setSaveGold('100') });
        $("#save_gold_250").on('touchstart click', function () { setSaveGold('250') });
        $("#save_gold_500").on('touchstart click', function () { setSaveGold('500') });
        $("#save_gold_750").on('touchstart click', function () { setSaveGold('750') });
        $("#save_gold_1000").on('touchstart click', function () { setSaveGold('1000') });

        function reloadSettings() {
            closeSettings();
            openSettings();
        }

        function setActiveButtons() {
            $('#expedition_settings').addClass(doExpedition ? 'active' : 'inactive');
            $(`#do_expedition_${doExpedition}`).addClass('active');
            $(`#set_monster_id_${monsterId}`).addClass('active');

            $('#dungeon_settings').addClass(doDungeon ? 'active' : 'inactive');
            $(`#do_dungeon_${doDungeon}`).addClass('active');
            $(`#set_dungeon_difficulty_${dungeonDifficulty}`).addClass('active');

            $('#arena_settings').addClass(doArena ? 'active' : 'inactive');
            $(`#do_arena_${doArena}`).addClass('active');
            $(`#set_arena_opponent_level_${arenaOpponentLevel}`).addClass('active');

            $('#circus_settings').addClass(doCircus ? 'active' : 'inactive');
            $(`#do_circus_${doCircus}`).addClass('active');
            $(`#set_circus_opponent_level_${circusOpponentLevel}`).addClass('active');

            $('#quests_settings').addClass(doQuests ? 'active' : 'inactive');
            $(`#do_quests_${doQuests}`).addClass('active');

            for (const type in questTypes) {
                if (questTypes[type]) {
                    $(`#do_${type}_quests`).addClass('active');
                }
            }

            $('#event_expedition_settings').addClass(doEventExpedition ? 'active' : 'inactive');
            $(`#do_event_expedition_${doEventExpedition}`).addClass('active');
            $(`#set_event_monster_id_${eventMonsterId}`).addClass('active');

            $('#food_settings').addClass(eatFood ? 'active' : 'inactive');
            $(`#eat_food_${eatFood}`).addClass('active');

            $('#gold_settings').addClass(saveGold ? 'active' : 'inactive');
            for (let i of ['0', '100', '250', '500', '750', '1000']) {
                $(`#save_gold_${i}`).addClass(saveGoldAmount / 1000 === Number(i) ? 'active' : 'inactive');
            }
        };

        setActiveButtons();
    };

    // Auto GO button

    var autoGoButton = document.createElement("button");
    autoGoButton.setAttribute("id", "autoGoButton")
    autoGoButton.className = 'menuitem';

    if (autoGoActive == false) {
        autoGoButton.innerHTML = 'Auto GO';
        autoGoButton.addEventListener("click", setAutoGoActive);
        autoGoButton.addEventListener("touchstart", setAutoGoActive);
    } else {
        autoGoButton.innerHTML = 'STOP';
        autoGoButton.addEventListener("click", setAutoGoInactive);
        autoGoButton.addEventListener("touchstart", setAutoGoInactive);
    };

    document.getElementById("mainmenu").insertBefore(autoGoButton, document.getElementById("mainmenu").children[0]);

    // Settings button

    var settingsButton = document.createElement("button");
    settingsButton.className = 'menuitem';
    settingsButton.innerHTML = `<img src="${assetsUrl}/cog.svg" title="Ustawienia" height="20" width="20" style="filter: invert(83%) sepia(52%) saturate(503%) hue-rotate(85deg) brightness(103%) contrast(101%); z-index: 999;">`;
    settingsButton.setAttribute("style", "display: flex; justify-content: center; align-items: center; height: 27px; width: 27px; cursor: pointer; border: none; color: #5dce5d; padding: 0; background-image: url('https://i.imgur.com/jf7BXTX.png')");
    settingsButton.addEventListener("click", openSettings);
    settingsButton.addEventListener("touchstart", openSettings);
    document.getElementById("mainmenu").insertBefore(settingsButton, document.getElementById("mainmenu").children[1]);

    /****************
    *    Helpers    *
    ****************/

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    function getSmallestIntIndex(values) {
        let index = 0;
        let minValue = values[0];

        for (let i = 1; i < values.length; i++) {
            if (values[i] < minValue) {
                minValue = values[i];
                index = i;
            }
        };
        return index;
    };

    function getLargestIntIndex(values) {
        let index = 0;
        let maxValue = values[0];

        for (let i = 1; i < values.length; i++) {
            if (values[i] > maxValue) {
                maxValue = values[i];
                index = i;
            }
        };
        return index;
    };

    function getRandomIntIndex(values) {
        const index = Math.floor(Math.random() * values.length);

        return index;
    };

    function convertTimeToMs(t) {
        const ms = Number(t.split(':')[0]) * 60 * 60 * 1000 + Number(t.split(':')[1]) * 60 * 1000 + Number(t.split(':')[2]) * 1000;

        return ms;
    };

    function setDoExpedition(bool) {
        doExpedition = bool;
        localStorage.setItem('doExpedition', bool);
        setpauseToEat(false);
    };

    function setExpeditionQueue(queue) {
        expeditionQueue = queue;
        localStorage.setItem('expeditionQueue', JSON.stringify(queue));
    };

    function setpauseToEat(bool) {
        pauseToEat = bool;
        localStorage.setItem('pauseToEat', bool);
    };

    function setDoDungeon(bool) {
        doDungeon = bool;
        localStorage.setItem('doDungeon', bool);
    };

    function setDoEventExpedition(bool) {
        doEventExpedition = bool;
        localStorage.setItem('doEventExpedition', bool);
    };

    function setEatFood(bool) {
        eatFood = bool;
        localStorage.setItem('eatFood', bool);
    };

    function setPauseToSaveGold(bool) {
        pauseToSaveGold = bool;
        localStorage.setItem('pauseToSaveGold', bool);
    };

    function setSaveGoldState(value) {
        saveGoldState = value;
        localStorage.setItem('saveGoldState', value);
    }

    function setSaveGoldItemHash(value) {
        saveGoldItemHash = value;
        localStorage.setItem('saveGoldItemHash', value);
    }

    function setSaveGoldItemLevel(value) {
        saveGoldItemLevel = value;
        localStorage.setItem('saveGoldItemLevel', value);
    }

    function setSaveGoldAmount(value) {
        saveGoldAmount = value;
        localStorage.setItem('saveGoldAmount', value);
    }

    function setSaveGold(bool) {
        saveGold = bool;
        localStorage.setItem('saveGold', bool);
    }

    /****************
    *    Auto Go    *
    ****************/

    function autoGo() {

        // Variables

        const currentTime = new Date().getTime();
        const clickDelay = getRandomInt(900, 2400);

        // Claim Daily Reward
        if (document.getElementById("blackoutDialogLoginBonus") !== null) {
            setTimeout(function () {
                document.getElementById("blackoutDialogLoginBonus").getElementsByTagName("input")[0].click();
            }, clickDelay);
        };

        // Close Notifications
        if (document.getElementById("blackoutDialognotification") !== null && document.getElementById("blackoutDialognotification").isDisplayed()) {
            setTimeout(function () {
                document.getElementById("blackoutDialognotification").getElementsByTagName("input")[0].click();
            }, clickDelay);
        };

        /***************
        *   Use Food   *
        ***************/

        if (player.hp < 50) {
            console.log("Low health");
            //In case of low health, pause everything and eat food
            if (!pauseToEat) {
                setpauseToEat(true);
            }

            // var lowHealthAlert = document.createElement("div");

            // function showLowHealthAlert() {
            //     lowHealthAlert.setAttribute("id", "lowHealth")
            //     lowHealthAlert.setAttribute("style", `
            //         display: block;
            //         position: absolute;
            //         top: 120px;
            //         left: 506px;
            //         width: 365px;
            //         padding: 20px 0;
            //         color: #ea1414;
            //         background-color: #000000db;
            //         font-size: 20px;
            //         border-radius: 25px;
            //         border-left: 10px solid #ea1414;
            //         border-right: 10px solid #ea1414;
            //         z-index: 999;
            //     `);
            //     lowHealthAlert.innerHTML = '<span>Low Health!</span>';
            //     document.getElementById("header_game").insertBefore(lowHealthAlert, document.getElementById("header_game").children[0]);
            // };
            // showLowHealthAlert();

            // Use food
            /*
            # Eat Food Logic
                - Check if the health is below 40%
                - If yes, navigate to the overview page
                - Check if there is food in the inventory
                - If yes, double click on the food item
            */

            if (eatFood) {
                const inOverviewPage = $("body").first().attr("id") === "overviewPage";


                if (!inOverviewPage) {
                    setTimeout(function () {
                        $("#mainmenu a.menuitem")[0].click();
                    }, clickDelay);
                } else {
                    function getActiveTabBagNumber() {
                        const tabs = document.getElementById("inventory_nav").getElementsByClassName("awesome-tabs");
                        for (let i = 0; i < tabs.length; i++) {
                            if (tabs[i].classList.contains("current")) {
                                return tabs[i].getAttribute("data-bag-number");
                            }
                        }
                        return null; // No active tab found
                    };

                    const activeTabBagNumber = getActiveTabBagNumber();
                    console.log("Active Tab Bag Number: " + activeTabBagNumber);

                    if (activeTabBagNumber !== '513') {
                        function clickTabByBagNumber(bagNumber) {
                            const tabs = document.getElementById("inventory_nav").getElementsByClassName("awesome-tabs");
                            for (let i = 0; i < tabs.length; i++) {
                                if (tabs[i].getAttribute("data-bag-number") === bagNumber) {
                                    setTimeout(function () {
                                        tabs[i].click();
                                    }, clickDelay);
                                    return true; // Clicked the tab with the specified data-bag-number
                                }
                            }
                            return false; // No tab found with the specified data-bag-number
                        }

                        // Go to food tab if not already there
                        clickTabByBagNumber('513');
                        setTimeout(function () {
                            $("#mainmenu a.menuitem")[0].click();
                        }, clickDelay * 1.5);
                    } else {
                        // Any starting with item-i-7- is food like item-i-7-1, item-i-7-2, item-i-7-3
                        // "item-i-7-1 ui-draggable …ble-handle item-i-green"
                        // it must be ui-draggable because it has the double click event listener
                        const foodItemsNodeList = document.querySelectorAll("[class^='item-i-7-']");
                        const foodItemsArray = Array.from(foodItemsNodeList);
                        const draggableFoodItems = foodItemsArray.filter(item => item.classList.contains('ui-draggable'));
                        console.log("Food Items: " + draggableFoodItems.length);

                        if (draggableFoodItems.length === 0) {
                            console.log("No food items found, stopping eating food.");
                            setEatFood(false);
                            setpauseToEat(false);
                            if (!doExpedition) {
                                setDoExpedition(false);
                            }
                            if (!doArena) {
                                setDoArena(false);
                            }
                        } else {
                            console.log("HP: " + player.hp);
                            const randomFoodItem = draggableFoodItems[getRandomInt(0, draggableFoodItems.length - 1)];

                            setTimeout(function () {
                                randomFoodItem.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                            }, clickDelay * 2);
                        };
                        setTimeout(function () {
                            $("#mainmenu a.menuitem")[1].click();
                        }, clickDelay * 3);
                    }
                };
            } else {
                setpauseToEat(false);
                if (doExpedition) {
                    setDoExpedition(false);
                }
                if (doArena) {
                    setDoArena(false);
                }
                if (!doDungeon) {
                    setTimeout(function () {
                        $("#mainmenu a.menuitem")[1].click();
                    }, clickDelay * 2);
                }
            };
        } else if (player.hp > 49) {
            // Remove low health alert
            // if (document.getElementById("lowHealth")) {
            //     document.getElementById("lowHealth").remove();
            // };

            if (pauseToEat) {
                setpauseToEat(false);
            }
        } else {
        };

        /****************
         *  Save Gold   *
        ****************/

        if (!pauseToEat && saveGold) {
            if (player.gold < saveGoldAmount * 1.04 && saveGoldState === 0) {
                // Not enough gold and not in the process of saving gold
                console.log("Not enough gold: " + player.gold + " < " + saveGoldAmount * 1.04);
                if (pauseToSaveGold) {
                    setPauseToSaveGold(false);
                }
            } else {
                // Enough gold and not in the process of saving gold
                console.log("Enough gold: " + player.gold + " >= " + saveGoldAmount * 1.04);
                console.log("Starting to save gold.")
                if (!pauseToSaveGold) {
                    setPauseToSaveGold(true);
                }

                const inGuildPage = $("body").first().attr("id") === "guildPage";
                const inGuildMarketPage = $("body").first().attr("id") === "guildMarketPage";
                const inPackagesPage = $("body").first().attr("id") === "packagesPage";
                console.log("In Guild Page: " + inGuildPage);
                console.log("In Guild Market Page: " + inGuildMarketPage);
                console.log("In Packages Page: " + inPackagesPage);
                console.log("Save Gold State: " + saveGoldState);

                if (!inGuildPage && !inGuildMarketPage && !inPackagesPage) {
                    // Go to guild page
                    setTimeout(function () {
                        $("#mainmenu a.menuitem")[2].click();
                    }, clickDelay * 2);
                } else if (inGuildPage) {
                    // Go to guild market
                    const linkGuildMarket = document.getElementById('guild_market_div');
                    setTimeout(function () {
                        linkGuildMarket.click();
                    }, clickDelay * 2);
                } else if (inGuildMarketPage && saveGoldState === 0) {
                    // Buy the first item with value equal to saveGoldAmount
                    console.log("Buying item with value: " + saveGoldAmount);

                    // Select the table from the DOM
                    let table = document.getElementById('market_item_table');

                    // find the row with the item that can be bought
                    for (let row of table.rows) {
                        // Skip the first row (header)
                        if (row.rowIndex === 0) {
                            continue;
                        }

                        // Check if the item can be bought
                        if (row.cells[5].querySelector('input').value === "Cancel") {
                            continue;
                        }

                        // Check the price of the item
                        let price = parseInt(row.cells[2].textContent.trim().replace('.', ''));
                        console.log("Price: " + price);

                        // Check if the price and market fee (4%) is less than the player's gold
                        if (price === saveGoldAmount && price * 1.04 < player.gold) {
                            console.log("Found item to buy.");
                            let itemDataHash = row.cells[0].querySelector("[class^='item-']").getAttribute('data-hash');
                            let itemLevel = Number(row.cells[0].querySelector("[class^='item-']").getAttribute('data-level'));
                            console.log("Item Data Hash: " + itemDataHash);
                            console.log("Item Level: " + itemLevel);
                            setSaveGoldItemLevel(itemLevel);
                            setSaveGoldState(1);
                            // Buy the item
                            setTimeout(function () {
                                row.cells[5].querySelector('input').click();
                            }, clickDelay * 2);
                            break;
                        } else {
                        }
                    }
                    // No item found to buy at the saveGoldAmount price
                    // Set the saveGoldAmount lower
                    if (saveGoldState === 0) {
                        if (saveGoldAmount === 1000000) {
                            setSaveGoldState(0);
                            setSaveGoldAmount(750000);
                        } else if (saveGoldAmount === 750000) {
                            setSaveGoldState(0);
                            setSaveGoldAmount(500000);
                        } else if (saveGoldAmount === 500000) {
                            setSaveGoldState(0);
                            setSaveGoldAmount(250000);
                        } else if (saveGoldAmount === 250000) {
                            setSaveGoldState(0);
                            setSaveGoldAmount(100000);
                        } else {
                            setSaveGoldAmount(0);
                            setPauseToSaveGold(false);
                            setSaveGold(false);
                        }
                        // Refresh the page to get the latest items
                        setTimeout(function () {
                            location.reload();
                        }, clickDelay);
                    }
                } else if (inGuildMarketPage && saveGoldState === 1) {
                    // Item was bought, go to packages to retrieve
                    const linkPackages = document.getElementById('menue_packages');
                    setTimeout(function () {
                        linkPackages.click();
                    }, clickDelay * 2);
                } else if (inPackagesPage && saveGoldState === 1) {
                    // Retrieve the first package
                    let packagesDiv = document.getElementById('packages');
                    let packageItems = packagesDiv.querySelectorAll('.packageItem');
                    let packageItem = packageItems[0].querySelector("[class^='item-']");
                    let itemDataHash = packageItem.getAttribute('data-hash');
                    let itemLevel = Number(packageItem.getAttribute('data-level'));

                    console.log("Searching for hash: " + saveGoldItemHash);
                    console.log("Searching for level: " + saveGoldItemLevel);

                    console.log("Item Data Hash: " + itemDataHash);
                    console.log("Item Level: " + itemLevel);

                    if (itemLevel === saveGoldItemLevel) {
                        setTimeout(function () {
                            packageItem.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                        }, clickDelay * 2);

                        setSaveGoldState(2);
                        setSaveGoldItemHash(itemDataHash);
                        console.log("Retrieved Item: " + itemDataHash);

                        // Go back to guild market
                        setTimeout(function () {
                            $("#mainmenu a.menuitem")[2].click();
                        }, clickDelay * 4);
                    } else {
                        console.log("Item level does not match...");
                    }
                } else if (inGuildMarketPage && saveGoldState === 2) {
                    // Sell Package for the same price

                    // Find item based on data hash
                    let InventoryDiv = document.getElementById('inv');
                    let InventoryDivList = InventoryDiv.getElementsByTagName('div');

                    console.log("Searching for hash: " + saveGoldItemHash);
                    console.log("Searching for level: " + saveGoldItemLevel);
                    for (let item of InventoryDivList) {
                        console.log("Item hash: " + item.getAttribute('data-hash'));
                        console.log("Item level: " + item.getAttribute('data-level'));
                        if (item.getAttribute('data-hash') === saveGoldItemHash && Number(item.getAttribute('data-level')) === saveGoldItemLevel) {
                            console.log("Found item hash: " + item.getAttribute('data-hash'));
                            console.log("Found item level: " + item.getAttribute('data-level'));
                            setTimeout(function () {
                                item.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                            }, clickDelay * 2);

                            setTimeout(function () {
                                let marketPriceInput = document.getElementById('preis');
                                marketPriceInput.value = saveGoldAmount;
                                let marketDurationInput = document.getElementById('dauer');
                                marketDurationInput.value = "3";
                                let marketButton = document.querySelector('input[type="submit"][name="anbieten"]');
                                marketButton.click();
                            }, clickDelay * 4);
                            break;
                        }
                    }
                    setSaveGoldState(3);

                } else if (saveGoldState === 3) {
                    // Gold saving is done
                    setSaveGoldState(0);
                    setPauseToSaveGold(false);
                    // Stop expeditions if the available expedition points are not enough to reach saveGoldAmount
                    // if (!enoughExpeditionPoints()) {
                    //     setDoExpedition(false);
                    // }
                }
            }
        }

        function enoughExpeditionPoints() {
            let expeditionPoints = Number(document.getElementById('expeditionpoints_value_point').innerText);
            let expeditionPointsNeeded = Math.ceil((saveGoldAmount - player.gold) / 10000);
            console.log("Expedition Points: " + expeditionPoints);
            console.log("Expedition Points Needed: " + expeditionPointsNeeded);
            if (expeditionPoints < expeditionPointsNeeded) {
                return false;
            } else {
                return true;
            }
        }

        // Check if expedition points are enough to reach saveGoldAmount
        // if (enoughExpeditionPoints()) {
        //     setDoExpedition(true);
        // }

        // Start doing dungeons if the dungeon points are over 16
        if (!doDungeon) {
            let dungeonPoints = Number(document.getElementById('dungeonpoints_value_point').innerText);
            if (dungeonPoints > 18) {
                setDoDungeon(true);
            }
        }


        // Reset quest timer if there are completed quests
        function checkCompletedQuests() {
            if (!pauseToEat && !pauseToSaveGold && $("body").first().attr("id") === "questsPage") {
                const completedQuests = $("#content .contentboard_slot a.quest_slot_button_finish");
                if (completedQuests.length) {
                    nextQuestTime = currentTime - 1000;
                    localStorage.setItem('nextQuestTime', nextQuestTime);
                    setTimeout(function () {
                        completedQuests[0].click();
                    }, clickDelay);
                }
            }
        }
        checkCompletedQuests();


        // Update the expedition queue
        function updateExpeditonQueue() {
            if ($("body").first().attr("id") === "questsPage") {
                const activeQuests = $("#content .contentboard_slot_active");
                const newQueue = [];

                for (const quest of activeQuests) {
                    if (quest.getElementsByClassName("quest_slot_icon")[0].style.backgroundImage.includes('a3d2065a1dac3029b15d5e64ce7a90')) {
                        // Div Sample: <div class="quest_slot_title">Cliff Jumper: Defeat 5 opponents of your choice</div>
                        const questTitle = quest.getElementsByClassName("quest_slot_title")[0].innerText;
                        const questLocation = questTitle.split(":")[0].trim();
                        if (questTitle.includes("boss")) {
                            newQueue.push({ location: questLocation, times: 1 });
                        } else if (questTitle.includes("your choice")) {
                            // Check progress: <div class="quest_slot_progress">3 / 4</div>
                            const progress = quest.getElementsByClassName("quest_slot_progress")[0].innerText;
                            const progressCurrent = Number(progress.split(" / ")[0]);
                            const progressTotal = Number(progress.split(" / ")[1]);
                            newQueue.push({ location: questLocation, times: progressTotal - progressCurrent });
                        }
                    }
                }
                console.log('New Expedition Queue:' + newQueue);
                setExpeditionQueue(newQueue);
            }
        }
        updateExpeditonQueue();

        /****************
        * Handle Quests *
        ****************/
        if (!pauseToEat && !pauseToSaveGold && doQuests === true && (nextQuestTime < currentTime)) {
            function completeQuests() {
                const inPanteonPage = $("body").first().attr("id") === "questsPage";

                if (!inPanteonPage) {
                    setTimeout(function () {
                        $("#mainmenu a.menuitem")[1].click();
                    }, clickDelay);
                } else {
                    const completedQuests = $("#content .contentboard_slot a.quest_slot_button_finish");

                    if (completedQuests.length) {
                        setTimeout(function () {
                            completedQuests[0].click();
                        }, clickDelay);
                    } else {
                        repeatQuests();
                    }
                }
            };

            function repeatQuests() {
                const failedQuests = $("#content .contentboard_slot a.quest_slot_button_restart");

                if (failedQuests.length) {
                    setTimeout(function () {
                        failedQuests[0].click();
                    }, clickDelay);
                } else {
                    takeQuest();
                    checkDungeonQuests();
                }
            };

            function getIconName(url) {
                if (url.includes('8aada67d4c5601e009b9d2a88f478c')) {
                    return 'combat';
                }

                if (url.includes('00f1a594723515a77dcd6d66c918fb')) {
                    return 'arena';
                }

                if (url.includes('586768e942030301c484347698bc5e')) {
                    return 'circus';
                }

                if (url.includes('4e41ab43222200aa024ee177efef8f')) {
                    return 'expedition';
                }

                if (url.includes('dc366909fdfe69897d583583f6e446')) {
                    return 'dungeon';
                }

                if (url.includes('5a358e0a030d8551a5a65d284c8730')) {
                    return 'items';
                }

                if (url.includes('a8b91ecab5813f97708e0e86f35e06')) {
                    return 'work';
                }

                return null;
            }

            // Disable doDungeon if not every dungeon quest is accepted
            function checkDungeonQuests() {
                const activeQuests = $("#content .contentboard_slot_active");
                console.log('Active Quests: ' + activeQuests.length);

                let activeDungeonQuests = 0;
                let activeDungeonQuestsChoice = false;
                let activeDungeonQuestsEach = false;
                let activeDungeonQuestsBoss = false;
                let numberOfOpponents = 0;

                for (const quest of activeQuests) {
                    if (quest.getElementsByClassName("quest_slot_icon")[0].style.backgroundImage.includes('c903cea2513b6a20e1e92500c2a279')) {
                        activeDungeonQuests++;
                        const questTitle = quest.getElementsByClassName("quest_slot_title")[0].innerText;
                        if (questTitle.includes("each opponent")) {
                            activeDungeonQuestsEach = true;
                        } else if (questTitle.includes("boss") && getQuestReward(quest) > 4000) {
                            activeDungeonQuestsBoss = true;
                        } else if (questTitle.includes("your choice") && getQuestReward(quest) > 8000) {
                            activeDungeonQuestsChoice = true;
                            // Sasama`s last journey: Defeat 3 opponents of your choice
                            numberOfOpponents = Number(questTitle.split("Defeat ")[1].split(" ")[0]);
                        }
                    }
                }
                console.log('Active Dungeon Quests: ' + activeDungeonQuests);
                console.log('Defeat the boss: ' + activeDungeonQuestsBoss);
                console.log('Defeat each opponent: ' + activeDungeonQuestsEach);
                console.log('Defeat your choice: ' + activeDungeonQuestsChoice);

                let dungeonPoints = Number(document.getElementById('dungeonpoints_value_point').innerText);

                if (activeDungeonQuests < 2 || dungeonPoints < 8) {
                    setDoDungeon(false);
                } else if (activeDungeonQuests === 3) {
                    setDoDungeon(true);
                } else if (activeDungeonQuestsChoice && numberOfOpponents > 3 && activeDungeonQuestsEach) {
                    setDoDungeon(true);
                } else if (activeDungeonQuestsEach) {
                    setDoDungeon(true);
                }
            }

            function takeQuest() {
                const canTakeQuest = $("#content .contentboard_slot a.quest_slot_button_accept");

                if (canTakeQuest.length) {
                    function getExpeditionQuestType(quest) {
                        // Determines the type of expedition quest
                        // Type 1: Caravan: Defeat 6 x Caravan Guard
                        // Type 2: Cliff Jumper: Defeat 5 opponents of your choice
                        // Type 3: Umpokta Tribe: Defeat each opponent at least once
                        // Type 4: Umpokta Tribe: Defeat the boss in this territory
                        // Div Sample: <div class="quest_slot_title">Cliff Jumper: Defeat 5 opponents of your choice</div>
                        const questTitle = quest.getElementsByClassName("quest_slot_title")[0].innerText;

                        if (questTitle.includes("Mine") && questTitle.includes("your choice")) {
                            return 0;
                        } else if (questTitle.includes("Teuton Camp") && questTitle.includes("your choice")) {
                            return 1;
                        } else if (questTitle.includes("Koman Mountain") && questTitle.includes("your choice")) {
                            return 1;
                        } else if (questTitle.includes("the boss")) {
                            return 1;
                        } else {
                            return 0;
                        };
                    }

                    function getDungeonQuestType(quest) {
                        // Determines the type of dungeon quest
                        const questTitle = quest.getElementsByClassName("quest_slot_title")[0].innerText;

                        if (questTitle.includes("Externsteine")) {
                            let goldReward = getQuestReward(quest);
                            if (goldReward > 5000) {
                                return 1;
                            } else {
                                return 0;
                            }
                        } else {
                            return 0;
                        }
                    }

                    function getQuestReward(quest) {
                        // Function to determine total quest reward in gold
                        // Total gold reward = gold reward + gold value of item reward
                        /* Div Sample:
                        <div class="quest_slot_reward quest_slot_reward_gold">
                        <span data-tooltip="[[[&quot;Gold&quot;,&quot;white&quot;]]]">
                        4.703 <img alt="" src="//gf1.geo.gfsrv.net/cdn6b/71e68d38f81ee6f96a618f33c672e0.gif" title="" align="absmiddle" border="0" />                        </span>
                        </div>
                        <div class="quest_slot_reward quest_slot_reward_item">
                        <img alt="" src="//gf3.geo.gfsrv.net/cdn51/bb1eeb3f022dfe2c4e2cd14d745d2c.gif" width="16" height="16"
                        data-tooltip="[[[&quot;Opiehnzas Cheese sandwich of Health&quot;,&quot;lime; text-shadow: 0 0 2px #000, 0 0 2px lime&quot;],[&quot;Using: Heals 9489 of life&quot;,&quot;#DDD&quot;],[&quot;From intelligence: +4575 vitality point(s)&quot;,&quot;#DDD&quot;],[&quot;Level 91&quot;,&quot;#808080&quot;],[&quot;Value 1.475 &lt;div class=\&quot;icon_gold\&quot;&gt;&lt;\/div&gt;&quot;,&quot;#DDDDDD&quot;],[&quot;Hint: To use an item drag it onto your character picture in the overview.&quot;,&quot;#808080&quot;,250]]]" />
                        </div>
                        <div class="quest_slot_reward quest_slot_reward_item">
                            &nbsp;
                        </div>
                        */
                        const questRewards = quest.getElementsByClassName("quest_slot_reward");

                        let goldReward = 0;
                        let itemReward = 0;

                        for (const reward of questRewards) {
                            if (reward.classList.contains("quest_slot_reward_gold")) {
                                goldReward = Number(reward.getElementsByTagName("span")[0].innerText.replace(".", ""));
                            }
                            if (reward.classList.contains("quest_slot_reward_item")) {
                                // Check if there is an item reward
                                if (reward.getElementsByTagName("img").length) {
                                    const itemRewardValue = reward.getElementsByTagName("img")[0].getAttribute("data-tooltip");
                                    if (itemRewardValue) {
                                        itemReward = Number(itemRewardValue.split("Value ")[1].split(" <div")[0].replace(".", ""));
                                    }
                                }
                            }
                        }

                        console.log('Gold reward: ' + goldReward);
                        console.log('Item reward: ' + itemReward);
                        return goldReward + itemReward;
                    }

                    function isUnderworldItem(quest) {
                        // Function to determine the type of item reward of a quest
                        /* Div Samples:
                        <div class="quest_slot_reward quest_slot_reward_item quest_slot_reward_item_detailed" style="width: auto;">
                                            <img alt="" src="//gf3.geo.gfsrv.net/cdn51/bb1eeb3f022dfe2c4e2cd14d745d2c.gif" width="16" height="16" data-tooltip="[[[&quot;Shivas Sandals of Spreader&quot;,&quot;lime; text-shadow: 0 0 2px #000, 0 0 2px lime&quot;],[&quot;Armour +954&quot;,&quot;#DDD&quot;],[&quot;Strength +19% (+34)&quot;,&quot;#DDD&quot;],[&quot;Agility +4&quot;,&quot;#DDD&quot;],[&quot;Charisma -3&quot;,&quot;#DDD&quot;],[&quot;Charisma -7% (-12)&quot;,&quot;#DDD&quot;],[&quot;Intelligence +35% (+180)&quot;,&quot;#DDD&quot;],[&quot;Healing +72&quot;,&quot;#DDD&quot;],[&quot;Level 105&quot;,&quot;#808080&quot;],[&quot;Value 10.356 <div class=\&quot;icon_gold\&quot;><\/div>&quot;,&quot;#DDDDDD&quot;],[&quot;Durability 186888\/186888 (100%)&quot;,&quot;#00ff00&quot;],[&quot;Conditioning 0\/46722 (0%)&quot;,&quot;#808080&quot;]]]" align="absmiddle">
                                    Shivas Sandals of Spreader - 10.356 <img alt="" src="//gf1.geo.gfsrv.net/cdn6b/71e68d38f81ee6f96a618f33c672e0.gif" align="absmiddle" border="0"></div>
                            <div class="quest_slot_reward quest_slot_reward_item">
                                <img alt="" src="//gf3.geo.gfsrv.net/cdn51/bb1eeb3f022dfe2c4e2cd14d745d2c.gif" width="16" height="16"
                                data-tooltip="[[[&quot;Opiehnzas Cheese sandwich of Health&quot;,&quot;lime; text-shadow: 0 0 2px #000, 0 0 2px lime&quot;],[&quot;Using: Heals 9489 of life&quot;,&quot;#DDD&quot;],[&quot;From intelligence: +4575 vitality point(s)&quot;,&quot;#DDD&quot;],[&quot;Level 91&quot;,&quot;#808080&quot;],[&quot;Value 1.475 &lt;div class=\&quot;icon_gold\&quot;&gt;&lt;\/div&gt;&quot;,&quot;#DDDDDD&quot;],[&quot;Hint: To use an item drag it onto your character picture in the overview.&quot;,&quot;#808080&quot;,250]]]" />
                            </div>
                            <div class="quest_slot
                            _reward quest_slot_reward_item">
                                &nbsp;
                            </div>
                        */
                        const questRewards = quest.getElementsByClassName("quest_slot_reward");

                        for (const reward of questRewards) {
                            if (reward.classList.contains("quest_slot_reward_item")) {
                                if (reward.getElementsByTagName("img").length) {
                                    // It the tooltip contains "Durability" then it is an item
                                    const itemDataTooltip = reward.getElementsByTagName("img")[0].getAttribute("data-tooltip");
                                    if (itemDataTooltip.includes("Durability")) {
                                        // if it contains the following words, it is an underworld item
                                        // Cerberus, Apparition, Soul, Torment, Dusk, Bondage, Hydra, Escape, Unknown, Phantom, Sphinx, Gloom, Languor, Inferno
                                        if (itemDataTooltip.includes("Cerberus") || itemDataTooltip.includes("Apparition") || itemDataTooltip.includes("Soul") || itemDataTooltip.includes("Torment") || itemDataTooltip.includes("Dusk") || itemDataTooltip.includes("Bondage") || itemDataTooltip.includes("Hydra") || itemDataTooltip.includes("Escape") || itemDataTooltip.includes("Unknown") || itemDataTooltip.includes("Phantom") || itemDataTooltip.includes("Sphinx") || itemDataTooltip.includes("Gloom") || itemDataTooltip.includes("Languor") || itemDataTooltip.includes("Inferno")) {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    }
                                }
                            }
                        }
                        return false;
                    }



                    function getQuestGodReward(quest) {
                        // Function to determine the god reward of a quest
                        /* Div Samples:
                            <div class="quest_slot_reward quest_slot_reward_god">
                                                        <span data-tooltip="[[[&quot;0 grace from Diana&quot;,&quot;white&quot;]]]">
                                        <img alt="" src="//gf2.geo.gfsrv.net/cdn70/026bb622a42b4d00abc74c67f28d63.png" title="" align="absmiddle" border="0" />                        </span>
                                                </div>

                            <div class="quest_slot_reward quest_slot_reward_god">
                                                        <span data-tooltip="[[[&quot;2 grace from Vulcan&quot;,&quot;white&quot;]]]">
                                        <img alt="" src="//gf3.geo.gfsrv.net/cdn5c/6fbd05e43d699e65fc40cc92a17c51.png" title="" align="absmiddle" border="0" />                        </span>
                                                </div>
                        */
                        const questRewards = quest.getElementsByClassName("quest_slot_reward");

                        let totalGrace = 0;

                        for (const reward of questRewards) {
                            if (reward.classList.contains("quest_slot_reward_god")) {
                                const godReward = reward.getElementsByTagName("span")[0].innerText;

                                if (godReward) {
                                    totalGrace += Number(godReward.split(" grace from ")[0]);
                                }
                            }
                        }

                        console.log('God reward: ' + totalGrace);
                        return totalGrace;
                    }


                    function getQuestExperience(quest) {
                        // Function to determine the experience reward of a quest
                        /* Div Samples:
                            <div class="quest_slot_reward quest_slot_reward_xp">
                                &nbsp;
                            </div>
                            <div class="quest_slot_reward quest_slot_reward_xp">
                                <span data-tooltip="[[[&quot;6 Experience&quot;,&quot;white&quot;]]]">
                                <img alt="" src="//gf1.geo.gfsrv.net/cdnc9/43438b7e5563870240831358dc6a1a.gif" title="" align="absmiddle" border="0" />                        </span>
                            </div>
                        */
                        const questRewards = quest.getElementsByClassName("quest_slot_reward");

                        let experienceReward = 0;

                        for (const reward of questRewards) {
                            if (reward.classList.contains("quest_slot_reward_xp")) {
                                const xpReward = reward.getElementsByTagName("span")[0].innerText;

                                if (xpReward) {
                                    experienceReward = Number(xpReward.split(" Experience")[0]);
                                }
                            }
                        }

                        console.log('Experience reward: ' + experienceReward);
                        return experienceReward;
                    }


                    const availableQuests = $("#content .contentboard_slot_inactive");

                    for (const quest of availableQuests) {
                        let icon = getIconName(quest.getElementsByClassName("quest_slot_icon")[0].style.backgroundImage);

                        if (!icon) {
                            console.log('No quest was found')
                        };

                        if (questTypes[icon]) {
                            if (icon === 'expedition') {
                                // Only accept certain types of expedition quests
                                let expeditionType = getExpeditionQuestType(quest);

                                if (expeditionType === 1) {
                                    console.log('Expedition quest accepted');
                                    return quest.getElementsByClassName("quest_slot_button_accept")[0].click();
                                }
                                // } else if (icon === 'combat' || icon === 'items' || icon === 'arena') {
                                //     // Only accept quests with underworld items
                                //     if (isUnderworldItem(quest)) {
                                //         console.log('Combat/Items/Arena quest accepted');
                                //         return quest.getElementsByClassName("quest_slot_button_accept")[0].click();
                                //     }
                            } else if (icon === 'combat' || icon === 'items') {
                                // Only accept combat/items quests with a gold/experience ratio greater than 1500
                                let goldReward = getQuestReward(quest);
                                let experienceReward = getQuestExperience(quest);
                                let goldExperienceRatio = goldReward / experienceReward;

                                let godReward = getQuestGodReward(quest);

                                if (goldExperienceRatio > 2000.0 && godReward > 0) {
                                    console.log('Combat/Items quest accepted');
                                    return quest.getElementsByClassName("quest_slot_button_accept")[0].click();
                                }
                            } else if (icon === 'dungeon') {
                                // Only accept certain types of dungeon quests
                                let dungeonType = getDungeonQuestType(quest);

                                if (dungeonType === 1) {
                                    console.log('Dungeon quest accepted');
                                    return quest.getElementsByClassName("quest_slot_button_accept")[0].click();
                                }
                            } else {
                                // Not acceptable quest
                                // Go to the next quest
                            }
                        };
                    }
                    console.log('Querying for new quests');
                    $("#quest_footer_reroll input").first().click()
                }
                checkNextQuestTime();
            }

            function checkNextQuestTime() {
                const isTimer = $("#quest_header_cooldown")

                if (isTimer.length) {
                    const nextQuestIn = Number($("#quest_header_cooldown b span").attr("data-ticker-time-left"))

                    nextQuestTime = currentTime + nextQuestIn
                    localStorage.setItem('nextQuestTime', nextQuestTime)
                } else {
                    nextQuestTime = currentTime + 360000;
                    localStorage.setItem('nextQuestTime', nextQuestTime)
                }
                autoGo();
            }

            // const inPanteonPage = $("body").first().attr("id") === "questsPage";
            // if (inPanteonPage || (nextQuestTime < currentTime)) {
            setTimeout(function () {
                completeQuests();
            }, clickDelay);
            // }
        }

        /****************
        * Go Expedition *
        ****************/

        else if (!pauseToEat && !pauseToSaveGold && doExpedition === true && document.getElementById("cooldown_bar_fill_expedition").classList.contains("cooldown_bar_fill_ready") === true) {
            function goExpedition() {
                const inExpeditionPage = $("body").first().attr("id") === "locationPage";
                const inEventExpeditionPage = document.getElementById("content").getElementsByTagName('img')[1].getAttribute('src') === 'img/ui/expedition_points2.png';

                if (!inExpeditionPage || inEventExpeditionPage) {
                    document.getElementsByClassName("cooldown_bar_link")[0].click();
                } else {
                    // Current location: <a href="index.php?mod=location&amp;loc=7&amp;sh=38e12827038a096a39bd9813a68061b9" class="awesome-tabs current">Koman Mountain</a>
                    const currentLocation = document.getElementById("mainnav").getElementsByClassName("awesome-tabs current")[0].innerText;

                    // Select the highest active location from the expedition locations
                    const locationElements = document.getElementById("submenu2").getElementsByClassName("menuitem");
                    // Remove inactive locations
                    const activeLocationElements = Array.from(locationElements).filter(locationElement => !locationElement.classList.contains("inactive"));
                    const highestLocationElement = activeLocationElements[activeLocationElements.length - 1];
                    const highestLocation = highestLocationElement.innerText.trim();

                    // Do an expedition from the queue if there are any
                    if (expeditionQueue.length) {
                        let newQueue = expeditionQueue;
                        const expeditionLocation = expeditionQueue[0].location;
                        const expeditionTimes = expeditionQueue[0].times;

                        if (expeditionLocation === currentLocation) {
                            // Decrease the remaining times of the expedition
                            newQueue[0].times = expeditionTimes - 1;
                            setExpeditionQueue(newQueue);

                            // Reset nextQuestTime if only one (or 0) expedition is left
                            if (expeditionTimes < 2) {
                                nextQuestTime = currentTime - 1000;
                                localStorage.setItem('nextQuestTime', nextQuestTime);
                            }

                            if (expeditionTimes > 0) {
                                // Do the expedition if we are at the correct location
                                return document.getElementsByClassName("expedition_button")[monsterId].click();
                            }
                        } else {
                            // Go to the expedition location
                            for (const locationElement of activeLocationElements) {
                                if (locationElement.innerText.trim() === expeditionLocation) {
                                    return locationElement.click();
                                }
                            }
                        }
                    }

                    if (currentLocation === highestLocation) {
                        return document.getElementsByClassName("expedition_button")[monsterId].click();
                    } else {
                        // Go to the highest location
                        return highestLocationElement.click();
                    }
                }
            };

            setTimeout(function () {
                goExpedition();
            }, clickDelay);

            // Reload expedition page in case of failed goExpedition() call
            setTimeout(function () {
                document.getElementsByClassName("cooldown_bar_link")[0].click();
            }, clickDelay * 5);
        }

        /**************
        * Go Dungeon  *
        **************/

        else if (!pauseToEat && !pauseToSaveGold && doDungeon === true && document.getElementById("cooldown_bar_fill_dungeon").classList.contains("cooldown_bar_fill_ready") === true) {
            function goDungeon() {
                const inDungeonPage = $("body").first().attr("id") === "dungeonPage";

                if (!inDungeonPage) {
                    document.getElementsByClassName("cooldown_bar_link")[1].click();
                } else {
                    const inSelectDifficultyPage = !document.getElementById("content").getElementsByTagName("area")[0];

                    if (inSelectDifficultyPage) {
                        if (dungeonDifficulty === "advanced") {
                            document.getElementById("content").getElementsByClassName("button1")[1].click();
                        } else {
                            document.getElementById("content").getElementsByClassName("button1")[0].click();
                        }
                    } else {
                        const areaElements = document.getElementById("content").getElementsByTagName("area");
                        const mapLabels = document.querySelectorAll('.map_label');

                        // Go for boss if it is available and each opponent was attacked at least once
                        if (mapLabels.length) {
                            // Retreive the text content of the labels
                            const mapLabelsText = Array.from(mapLabels).map(label => label.textContent.trim());
                            const mapLabelsonClick = Array.from(mapLabels).map(label => label.getAttribute('onclick').split("'")[1]);

                            // Go for boss
                            if (mapLabelsText.includes("Boss") && (mapLabelsText.join().includes('1/2') || (mapLabelsText.join().includes('2/2') && mapLabels.length === 2))) {
                                return mapLabels[mapLabelsText.indexOf("Boss")].click();
                            }
                        }

                        // Go for the default opponent
                        const lastAreaElement = areaElements[areaElements.length - 1];
                        return lastAreaElement.click();
                    };
                };
            };

            setTimeout(function () {
                goDungeon();
            }, clickDelay);

            // Reload dungeon page in case of failed goDungeon() call
            setTimeout(function () {
                document.getElementsByClassName("cooldown_bar_link")[1].click();
            }, clickDelay * 5);
        }

        /************************
        * Go Arena Provinciarum *
        ************************/

        else if (!pauseToEat && !pauseToSaveGold && doArena === true && document.getElementById("cooldown_bar_fill_arena").classList.contains("cooldown_bar_fill_ready") === true) {
            function goArena() {
                const inArenaPage = document.getElementsByTagName("body")[0].id === "arenaPage";

                if (!inArenaPage && player.level < 10) {
                    document.getElementsByClassName("cooldown_bar_link")[1].click();
                } else if (!inArenaPage) {
                    document.getElementsByClassName("cooldown_bar_link")[2].click();
                } else {
                    const inArenaProvPage = document.getElementById("mainnav").getElementsByTagName("td")[1].firstChild.hasClass("awesome-tabs current");

                    if (!inArenaProvPage) {
                        document.getElementById("mainnav").getElementsByTagName("td")[1].firstElementChild.click();
                    } else {
                        const levels = new Array();
                        levels[0] = Number(document.getElementById("own2").getElementsByTagName("td")[1].firstChild.nodeValue)
                        levels[1] = Number(document.getElementById("own2").getElementsByTagName("td")[5].firstChild.nodeValue)
                        levels[2] = Number(document.getElementById("own2").getElementsByTagName("td")[9].firstChild.nodeValue)
                        levels[3] = Number(document.getElementById("own2").getElementsByTagName("td")[13].firstChild.nodeValue)
                        levels[4] = Number(document.getElementById("own2").getElementsByTagName("td")[17].firstChild.nodeValue)

                        let opponentIndex;

                        if (arenaOpponentLevel === "min") {
                            opponentIndex = getSmallestIntIndex(levels)
                        } else if (arenaOpponentLevel === "max") {
                            opponentIndex = getLargestIntIndex(levels)
                        } else {
                            opponentIndex = getRandomIntIndex(levels)
                        }

                        document.getElementsByClassName("attack")[opponentIndex].click();
                    }
                }
            };

            setTimeout(function () {
                goArena();
            }, clickDelay + 600);

        }

        /*************************
        * Go Circus Provinciarum *
        *************************/

        else if (!pauseToEat && !pauseToSaveGold && doCircus === true && document.getElementById("cooldown_bar_fill_ct").classList.contains("cooldown_bar_fill_ready") === true) {
            function goCircus() {
                const inArenaPage = document.getElementsByTagName("body")[0].id === "arenaPage";

                if (!inArenaPage) {
                    document.getElementsByClassName("cooldown_bar_link")[3].click();
                } else {
                    const inCircusProvPage = document.getElementById("mainnav").getElementsByTagName("td")[3].firstChild.hasClass("awesome-tabs current");

                    if (!inCircusProvPage) {
                        document.getElementById("mainnav").getElementsByTagName("td")[3].firstElementChild.click();
                    } else {
                        const levels = new Array();
                        levels[0] = Number(document.getElementById("own3").getElementsByTagName("td")[1].firstChild.nodeValue)
                        levels[1] = Number(document.getElementById("own3").getElementsByTagName("td")[5].firstChild.nodeValue)
                        levels[2] = Number(document.getElementById("own3").getElementsByTagName("td")[9].firstChild.nodeValue)
                        levels[3] = Number(document.getElementById("own3").getElementsByTagName("td")[13].firstChild.nodeValue)
                        levels[4] = Number(document.getElementById("own3").getElementsByTagName("td")[17].firstChild.nodeValue)

                        let opponentIndex;

                        if (circusOpponentLevel === "min") {
                            opponentIndex = getSmallestIntIndex(levels)
                        } else if (circusOpponentLevel === "max") {
                            opponentIndex = getLargestIntIndex(levels)
                        } else {
                            opponentIndex = getRandomIntIndex(levels)
                        }

                        document.getElementsByClassName("attack")[opponentIndex].click();
                    };
                };
            };

            setTimeout(function () {
                goCircus();
            }, clickDelay + 600);

        }

        /************************
        *  Go Event Expedition  *
        ************************/

        else if (!pauseToEat && !pauseToSaveGold && doEventExpedition === true && nextEventExpeditionTime < currentTime && eventPoints > 0) {
            function goEventExpedition() {
                const inEventExpeditionPage = document.getElementById("submenu2").getElementsByClassName("menuitem active glow")[0];

                if (!inEventExpeditionPage) {
                    document.getElementById("submenu2").getElementsByClassName("menuitem glow")[0].click();
                } else {
                    eventPoints = document.getElementById("content").getElementsByClassName("section-header")[0].getElementsByTagName("p")[1].firstChild.nodeValue.replace(/[^0-9]/gi, '')
                    localStorage.setItem('eventPoints', JSON.stringify({ count: eventPoints, date: currentDate }));

                    const isTimer = $('#content .ticker').first()

                    if (isTimer.length) {
                        nextEventExpeditionTime = currentTime + Number($('#content .ticker').first().attr('data-ticker-time-left'));
                        localStorage.setItem('nextEventExpeditionTime', nextEventExpeditionTime);

                        location.reload();
                    } else if (eventPoints == 0) {
                        location.reload();
                    } else if (eventPoints == 1 && eventMonsterId == 3) {
                        localStorage.setItem('eventPoints', JSON.stringify({ count: 0, date: currentDate }));

                        document.getElementsByClassName("expedition_button")[2].click();
                    } else {
                        if (eventMonsterId == 3) {
                            localStorage.setItem('eventPoints', JSON.stringify({ count: eventPoints - 2, date: currentDate }));
                        } else {
                            localStorage.setItem('eventPoints', JSON.stringify({ count: eventPoints - 1, date: currentDate }));
                        }

                        nextEventExpeditionTime = currentTime + 303000;
                        localStorage.setItem('nextEventExpeditionTime', nextEventExpeditionTime);

                        document.getElementsByClassName("expedition_button")[eventMonsterId].click();
                    }
                }
            };

            setTimeout(function () {
                goEventExpedition();
            }, clickDelay);

        }

        /***********************
        * Wait for Next Action *
        ***********************/

        else {

            /******************
            *    Fast Mode    *
            ******************/

            if (!pauseToEat && !pauseToSaveGold && safeMode === false) {
                const actions = [];

                if (doExpedition === true) {
                    const timeTo = convertTimeToMs(document.getElementById("cooldown_bar_text_expedition").innerText);

                    actions.push({
                        name: 'expedition',
                        time: timeTo,
                        index: 0
                    });
                };

                if (doDungeon === true) {
                    const timeTo = convertTimeToMs(document.getElementById("cooldown_bar_text_dungeon").innerText);

                    actions.push({
                        name: 'dungeon',
                        time: timeTo,
                        index: 1
                    });
                };

                if (doArena === true) {
                    const timeTo = convertTimeToMs(document.getElementById("cooldown_bar_text_arena").innerText);

                    actions.push({
                        name: 'arena',
                        time: timeTo,
                        index: 2,
                    });
                };

                if (doCircus === true) {
                    const timeTo = convertTimeToMs(document.getElementById("cooldown_bar_text_ct").innerText);

                    actions.push({
                        name: 'circusTurma',
                        time: timeTo,
                        index: 3,
                    });
                };

                if (doEventExpedition === true && eventPoints > 0) {
                    const timeTo = localStorage.getItem('nextEventExpeditionTime') - currentTime;

                    actions.push({
                        name: 'eventExpedition',
                        time: timeTo,
                        index: 4,
                    });
                };

                if (doQuests === true) {
                    const timeTo = localStorage.getItem('nextQuestTime') - currentTime;

                    actions.push({
                        name: 'quests',
                        time: timeTo,
                        index: 5,
                    });
                }

                function getNextAction(actions) {
                    let index = 0;
                    let minValue = actions[0].time;

                    for (let i = 1; i < actions.length; i++) {
                        if (actions[i].time < minValue) {
                            minValue = actions[i].time;
                            index = i;
                        }
                    };
                    return actions[index]
                };

                const nextAction = getNextAction(actions);

                // @TODO fix nextAction if !actions.length

                function formatTime(timeInMs) {
                    if (timeInMs < 1000) {
                        return "0:00:00"
                    };

                    let timeInSecs = timeInMs / 1000;
                    timeInSecs = Math.round(timeInSecs);
                    let secs = timeInSecs % 60;
                    if (secs < 10) {
                        secs = "0" + secs;
                    };
                    timeInSecs = (timeInSecs - secs) / 60;
                    let mins = timeInSecs % 60;
                    if (mins < 10) {
                        mins = "0" + mins;
                    };
                    let hrs = (timeInSecs - mins) / 60;

                    return hrs + ':' + mins + ':' + secs;
                };

                var nextActionWindow = document.createElement("div");

                function showNextActionWindow() {
                    nextActionWindow.setAttribute("id", "nextActionWindow")
                    nextActionWindow.setAttribute("style", `
                        display: block;
                        position: absolute;
                        top: 145px;
                        left: 520px;
                        height: 48px;
                        width: 365px;
                        padding-top: 13px;
                        color: #58ffbb;
                        background-color: #000000db;
                        font-size: 20px;
                        border-radius: 20px;
                        border-left: 10px solid #58ffbb;
                        border-right: 10px solid #58ffbb;
                        z-index: 999;
                    `);
                    nextActionWindow.innerHTML = `
                        <span>${content[nextAction.name]}  </span>
                        <span style="color: #fff;">${content.in}: </span>
                        <span>${formatTime(nextAction.time)}</span>`;
                    document.getElementById("header_game").insertBefore(nextActionWindow, document.getElementById("header_game").children[0]);
                };
                showNextActionWindow();

                let nextActionCounter;

                nextActionCounter = setInterval(function () {
                    nextAction.time = nextAction.time - 1000;

                    nextActionWindow.innerHTML = `
                        <span>${content[nextAction.name]}  </span>
                        <span style="color: #fff;">${content.in}: </span>
                        <span>${formatTime(nextAction.time)}</span>`;

                    if (nextAction.time <= 0) {
                        if (nextAction.index === 4) {
                            document.getElementById("submenu2").getElementsByClassName("menuitem glow")[0].click();
                        } else if (nextAction.index === 5) {
                            setTimeout(function () {
                                $("#mainmenu a.menuitem")[1].click();
                            }, clickDelay);
                        } else {
                            setTimeout(function () {
                                document.getElementsByClassName("cooldown_bar_link")[nextAction.index].click();
                            }, clickDelay);
                        };
                    };
                }, 1000);
            }

            /******************
            *    Safe Mode    *
            ******************/

            else {
                //TODO
                console.log("No safe mode yet")
            };
        };
    };

    if (autoGoActive) {
        // window.onload = autoGo();
        $(document).ready(function () {
            autoGo();
        });
    };

})();
