// ==UserScript==
// @name         Forge Leather Gloves
// @version      2024-09-24
// @description  Set Leather Gloves Automatically
// @author       You
// @match        *://*.gladiatus.gameforge.com/game/index.php?mod=forge&submod=forge*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    console.log("Tampermonkey script started...");

    const prefixName = "";
    const basicName = "Leather gloves";
    const suffixName = "of Fire";

    // Get the slot-closed element by its ID
    const slotClosed = document.getElementById("slot-closed");
    if (slotClosed) {
        // Check if the class attribute is empty
        if (slotClosed.classList.length === 0) {
            console.log("The 'slot-closed' class is empty.");
        } else {
            console.log("The 'slot-closed' class is not empty.");
            return;
        }
    }

    // Add a delay before executing the selection
    setTimeout(function () {
        // Get the dropdown element by its ID
        const prefixDropdown = document.getElementById("prefix0");

        if (prefixDropdown) {
            console.log("Prefix Dropdown element found");

            let optionFound = false;

            if (prefixName === "") {
                console.log("Prefix name is empty. Skipping the selection.");
                return;
            }

            for (let i = 0; i < prefixDropdown.options.length; i++) {
                const option = prefixDropdown.options[i];

                // Check if the data-name attribute is "XXXX"
                if (option.getAttribute('data-name') === prefixName) {
                    console.log('Found option! Selecting it now.');
                    // Set this option as the selected one
                    prefixDropdown.selectedIndex = i;

                    // Create a CustomEvent for 'change' and dispatch it
                    const event = new CustomEvent('change');
                    prefixDropdown.dispatchEvent(event);
                    optionFound = true;
                    break;
                }
            }

            if (!optionFound) {
                console.log('"Korks" option not found in the dropdown.');
            }
        } else {
            console.log("Dropdown element not found!");
        }
    }, 500); // Delay in milliseconds

    // Add a delay before executing the selection
    setTimeout(function () {
        // Get the dropdown element by its ID
        const basicDropdown = document.getElementById("basic0");

        if (basicDropdown) {
            console.log("Basic Dropdown element found");

            // Iterate over the options to find the one with the name "Leather gloves"
            for (let i = 0; i < basicDropdown.options.length; i++) {
                const option = basicDropdown.options[i];

                // Check if the option text contains "Leather gloves"
                if (option.textContent.includes(basicName)) {
                    console.log('Found "Leather gloves" option! Selecting it now.');
                    // Set this option as the selected one
                    basicDropdown.selectedIndex = i;

                    // Trigger the onchange event to preview the changes
                    const event = new CustomEvent('change');
                    basicDropdown.dispatchEvent(event);
                    break;
                }
            }
        } else {
            console.log("Dropdown element not found!");
        }
    }, 1000); // Delay in milliseconds

    // Add a delay before executing the selection
    setTimeout(function () {
        // Get the dropdown element by its ID
        const suffixDropdown = document.getElementById("suffix0");

        if (suffixDropdown) {
            console.log("Suffix Dropdown element found");

            let optionFound = false;

            if (suffixName === "") {
                console.log("Suffix name is empty. Skipping the selection.");
                return;
            }

            for (let i = 0; i < suffixDropdown.options.length; i++) {
                const option = suffixDropdown.options[i];

                // Check if the data-name attribute is "XXXX" in lowercase
                if (option.getAttribute('data-name') === suffixName.toLowerCase()) {
                    console.log('Found option! Selecting it now.');
                    // Set this option as the selected one
                    suffixDropdown.selectedIndex = i;

                    // Create a CustomEvent for 'change' and dispatch it
                    const event = new CustomEvent('change');
                    suffixDropdown.dispatchEvent(event);
                    optionFound = true;
                    break;
                }
            }

            if (!optionFound) {
                console.log('"Korks" option not found in the dropdown.');
            }
        } else {
            console.log("Dropdown element not found!");
        }
    }, 1500); // Delay in milliseconds
})();