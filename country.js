// ==UserScript==
// @name         Travel to another country
// @version      2024-09-24
// @description  Travel to another country Automatically
// @author       You
// @match        *://*.gladiatus.gameforge.com/game/index.php?*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    let country = "Unknown";
    const locationElementList = document.getElementById("submenu2").getElementsByClassName("menuitem");
    const locationNames = Array.from(locationElementList).map((element) => element.innerText.trim());

    if (locationNames.length > 0) {

        if (locationNames.includes("Grimwood")) {
            country = "Italy";
        } else if (locationNames.includes("Voodoo Temple")) {
            country = "Africa";
        } else if (locationNames.includes("Cave Temple")) {
            country = "Germania";
        } else if (locationNames.includes("Bank of the Thames")) {
            country = "Britannia";
        }

        console.log("Country:", country);

    } else {
        console.log("No location names found...");
    }

    function travel(targetCountry) {
        console.log("Traveling from", country);
        const inHermitPage = $("body").first().attr("id") === "hermitPage";

        if (!inHermitPage) {
            // Go to the Hermit first, first location
            const locationElements = document.getElementById("submenu2").getElementsByClassName("menuitem");
            console.log("Location elements:", locationElements);
            if (locationElements.length > 0) {
                locationElements[0].click();
            }
        } else {
            // Select the travel option in the Hermit page
            const travelLink = document.querySelector("a[href*='submod=travel']");
            if (travelLink) {
                travelLink.click();
            } else {
                // Select the option based on the country name in strong
                /* <form action="index.php?mod=hermit&amp;submod=startTravel&amp;sh=d30dc08b893275f6c09f949b01c3208b" method="POST" accept-charset="utf-8">
                <h2 class="section-header" style="cursor: pointer;">Travel to another land</h2>
        <section style="display: block;">
                        <p>
                <label>
                    <input type="radio" name="travelToCountry" value="0">
                    <strong>Italy</strong> (Minimum level: 1, Costs: 5.500 <img alt="" align="absmiddle" border="0" src="//gf1.geo.gfsrv.net/cdn6b/71e68d38f81ee6f96a618f33c672e0.gif" title="Gold">)
                </label>
                <br>
                Home is where the heart is.            </p>
                        <p>
                <label>
                    <input type="radio" name="travelToCountry" value="1">
                    <strong>Africa</strong> (Minimum level: 20, Costs: 6.750 <img alt="" align="absmiddle" border="0" src="//gf1.geo.gfsrv.net/cdn6b/71e68d38f81ee6f96a618f33c672e0.gif" title="Gold">)
                </label>
                <br>
                Be one of the first gladiators and proclaim the glory of Rome.            </p>
                        <p>
                <label>
                    <input type="radio" name="travelToCountry" value="2">
                    <strong>Germania</strong> (Minimum level: 40, Costs: 2.500 <img alt="" align="absmiddle" border="0" src="//gf1.geo.gfsrv.net/cdn6b/71e68d38f81ee6f96a618f33c672e0.gif" title="Gold">)
                </label>
                <br>
                Prove yourself against the mighty Germanic tribes.            </p>
                        <input type="submit" name="change" value="travel" class="awesome-button big" style="margin-bottom: 2px; margin-left: auto; margin-right: auto;">
        </section>
    </form>>*/
                const travelForm = document.querySelector("form[action*='startTravel']");
                if (travelForm) {
                    const countryElements = travelForm.querySelectorAll("strong");
                    const radioElements = travelForm.querySelectorAll("input[type='radio']");

                    for (let i = 0; i < countryElements.length; i++) {
                        const countryName = countryElements[i].innerText.trim();

                        if (countryName === targetCountry) {
                            radioElements[i].checked = true;
                        }
                    }
                }

                // Submit the form
                // <input type="submit" name="change" value="travel" class="awesome-button big" style="margin-bottom: 2px; margin-left: auto; margin-right: auto;">
                const submitButton = travelForm.querySelector("input[type='submit']");
                if (submitButton) {
                    submitButton.click();
                }
            }
        }
    };

    setTimeout(function () {
        travel("Germania");
    }, 1000);

    function getJourneyTime() {
        // <a class="menuitem" href="index.php?mod=hermit&amp;submod=travel&amp;sh=d30dc08b893275f6c09f949b01c3208b" title="Journey time:" target="_self">
        // Journey time: <span data-ticker-time-left="45000" data-ticker-type="countdown" data-ticker-loc="index.php?mod=hermit&amp;sh=d30dc08b893275f6c09f949b01c3208b" data-ticker-ref="1" class="ticker" style="font-size:12px;">0:00:30</span>                                </a>
        // 0:00:30 in this case
        const journeyTimeElement = document.querySelector("a[href*='submod=travel'] span");
        if (journeyTimeElement) {
            console.log("Journey time:", journeyTimeElement.innerText);
        }
    }

})();