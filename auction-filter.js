// ==UserScript==
// @name         Auction Filter
// @namespace    http://tampermonkey.net/
// @version      2024-11-22
// @description  try to take over the world!
// @author       You
// @match        https://s44-hu.gladiatus.gameforge.com/game/index.php?mod=auction*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Select the auction table
    const auctionTable = document.getElementById('auction_table');

    // Select all rows in the table body
    const rows = auctionTable.querySelectorAll('tbody tr');

    // Define the thresholds for dexterity and charisma
    const dexterityThreshold = 440;
    const charismaThreshold = 180;

    // Iterate over the rows
    rows.forEach(row => {
        // Iterate over the td in the row
        let hideRow = true;
        for (const td of row.querySelectorAll('td')) {
            let hideItem = true;
            // Find the form element within the td
            const form = td.querySelector('form');
            if (!form) return;

            // Check if the form has a data-item_name attribute containing "Porcius"
            const itemName = form.getAttribute('data-item_name');
            // console.log(itemName);
            const containsPorcius = itemName && itemName.includes('Porcius');
            if (containsPorcius) {
                hideItem = false;
            }

            // Find the div with class starting with "item-i-15-" inside the form
            const itemDiv = form.querySelector('div[class^="item-i-15-"]');
            if (itemDiv) {
                console.log(itemName);
                // Get the dexterity value from the data tooltip
                const tooltip = itemDiv.getAttribute('data-tooltip');
                const dexterity = tooltip.match(/Dexterity: (\d+)/)[1];
                const charisma = tooltip.match(/Charisma: (\d+)/)[1];
                console.log(dexterity, charisma);
                // Check if the dexterity value is above the threshold
                if (dexterity > dexterityThreshold && charisma > charismaThreshold) {
                    hideItem = false;
                }
            }
            if (!hideItem) {
                hideRow = false;
            }
            if (hideItem) {
                td.style.display = 'none';
            }
        }
        if (hideRow) {
            row.style.display = 'none';
        }
    });
})();