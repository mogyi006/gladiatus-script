// ==UserScript==
// @name         Go to the Underworld
// @version      2024-09-24
// @description  Go to the Underworld Automatically
// @author       You
// @match        *://*.gladiatus.gameforge.com/game/index.php?*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    console.log("Tampermonkey script started...");

    function travelUnderworld() {
        const inHermitPage = $("body").first().attr("id") === "hermitPage";

        if (!inHermitPage) {
            // Go to the Hermit first, first location
            const locationElements = document.getElementById("submenu2").getElementsByClassName("menuitem");
            if (locationElements.length > 0) {
                locationElements[0].click();
            }
        } else {
            // Select the underworld option in the Hermit page
            const underworldLink = document.querySelector("a[href*='submod=underworld']");
            if (underworldLink) {
                underworldLink.click();
            }

            /* Select the first underworld level
            // <form action="index.php?mod=hermit&amp;submod=enterUnderworld&amp;sh=d30dc08b893275f6c09f949b01c3208b" method="POST" id="enterForm">
            <h2 class="section-header" style="cursor: pointer;">Enter the Underworld</h2>
            <section style="display: block;">
                    <br></p>
                                <input type="submit" name="difficulty_normal" value="Normal" style="margin-bottom:4px;" class="awesome-button big ">
                                <input type="submit" name="difficulty_medium" value="Middle" style="margin-bottom:4px;" class="awesome-button big ">
                                <input type="submit" name="difficulty_hard" value="Hard" style="margin-bottom:4px;" class="awesome-button big ">
                        </section>
            </form>*/
            const normalButton = document.querySelector("input[name='difficulty_normal']");
            if (normalButton) {
                normalButton.click();
            }

            /* Journey Time
            <a class="menuitem" href="index.php?mod=hermit&amp;submod=travel&amp;sh=d30dc08b893275f6c09f949b01c3208b" title="Journey time:" target="_self">
                                    Journey time: <span data-ticker-time-left="200000" data-ticker-type="countdown" data-ticker-loc="index.php?mod=hermit&amp;sh=d30dc08b893275f6c09f949b01c3208b" data-ticker-ref="1" class="ticker" style="font-size:12px;">0:00:27</span></a>*/
        }
    };

    setTimeout(function () {
        travelUnderworld();
    }, clickDelay);

    // Reload expedition page in case of failed goExpedition() call
    setTimeout(function () {
        document.getElementsByClassName("cooldown_bar_link")[0].click();
    }, clickDelay * 5);
}
)();