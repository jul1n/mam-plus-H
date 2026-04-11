// ==UserScript==
// @name         mam-plus_dev
// @namespace    https://github.com/GardenShade
// @version      4.4.2
// @description  Tweaks and features for MAM
// @author       GardenShade
// @run-at       document-start
// @include      https://*.myanonamouse.net/*
// @exclude      https://cdn.myanonamouse.net/*
// @icon         https://i.imgur.com/dX44pSv.png
// @resource     MP_CSS https://raw.githubusercontent.com/gardenshade/mam-plus/master/release/main.css?v=4.4.2
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_info
// @grant        GM_getResourceText
// ==/UserScript==
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Types, Interfaces, etc.
 */
var SettingGroup;
(function (SettingGroup) {
    SettingGroup[SettingGroup["Global"] = 0] = "Global";
    SettingGroup[SettingGroup["Home"] = 1] = "Home";
    SettingGroup[SettingGroup["Search"] = 2] = "Search";
    SettingGroup[SettingGroup["Requests"] = 3] = "Requests";
    SettingGroup[SettingGroup["Torrent Page"] = 4] = "Torrent Page";
    SettingGroup[SettingGroup["Shoutbox"] = 5] = "Shoutbox";
    SettingGroup[SettingGroup["Vault"] = 6] = "Vault";
    SettingGroup[SettingGroup["User Pages"] = 7] = "User Pages";
    SettingGroup[SettingGroup["Upload Page"] = 8] = "Upload Page";
    SettingGroup[SettingGroup["Forum"] = 9] = "Forum";
    SettingGroup[SettingGroup["Other"] = 10] = "Other";
})(SettingGroup || (SettingGroup = {}));
/**
 * Class containing common utility methods
 *
 * If the method should have user-changeable settings, consider using `Core.ts` instead
 */
var _a;
class Util {
    /**
     * Animation frame timer
     */
    static afTimer() {
        return new Promise((resolve) => {
            requestAnimationFrame(resolve);
        });
    }
    /**
     * Allows setting multiple attributes at once
     */
    static setAttr(el, attr) {
        return new Promise((resolve) => {
            for (const key in attr) {
                el.setAttribute(key, attr[key]);
            }
            resolve();
        });
    }
    /**
     * Returns the "length" of an Object
     */
    static objectLength(obj) {
        return Object.keys(obj).length;
    }
    /**
     * Forcefully empties any GM stored values
     */
    static purgeSettings() {
        for (const value of GM_listValues()) {
            GM_deleteValue(value);
        }
    }
    /**
     * Log a message about a counted result
     */
    static reportCount(did, num, thing) {
        const singular = 1;
        if (num !== singular) {
            thing += 's';
        }
        if (MP.DEBUG) {
            console.log(`> ${did} ${num} ${thing}`);
        }
    }
    /**
     * Initializes a feature
     */
    static startFeature(settings, elem, page) {
        return __awaiter(this, void 0, void 0, function* () {
            // Queue the settings in case they're needed
            MP.settingsGlob.push(settings);
            // Function to return true when the element is loaded
            function run() {
                return __awaiter(this, void 0, void 0, function* () {
                    const timer = new Promise((resolve) => setTimeout(resolve, 2000, false));
                    const checkElem = Check.elemLoad(elem);
                    return Promise.race([timer, checkElem]).then((val) => {
                        if (val) {
                            return true;
                        }
                        else {
                            console.warn(`startFeature(${settings.title}) Unable to initiate! Could not find element: ${elem}`);
                            return false;
                        }
                    });
                });
            }
            // Is the setting enabled?
            if (GM_getValue(settings.title)) {
                // A specific page is needed
                if (page && page.length > 0) {
                    // Loop over all required pages
                    const results = [];
                    yield page.forEach((p) => {
                        Check.page(p).then((r) => {
                            results.push(r);
                        });
                    });
                    // If any requested page matches the current page, run the feature
                    if (results.includes(true) === true)
                        return run();
                    else
                        return false;
                    // Skip to element checking
                }
                else {
                    return run();
                }
                // Setting is not enabled
            }
            else {
                return false;
            }
        });
    }
    /**
     * Trims a string longer than a specified char limit, to a full word
     */
    static trimString(inp, max) {
        if (inp.length > max) {
            inp = inp.substring(0, max + 1);
            inp = inp.substring(0, Math.min(inp.length, inp.lastIndexOf(' ')));
        }
        return inp;
    }
    /**
     * Removes brackets & all contained words from a string
     */
    static bracketRemover(inp) {
        return inp
            .replace(/{+.*?}+/g, '')
            .replace(/\[\[|\]\]/g, '')
            .replace(/<.*?>/g, '')
            .replace(/\(.*?\)/g, '')
            .trim();
    }
    /**
     * Converts a string to an array
     */
    static stringToArray(inp, splitPoint) {
        return splitPoint !== undefined && splitPoint !== 'ws'
            ? inp.split(splitPoint)
            : inp.match(/\S+/g) || [];
    }
    /**
     * Converts a comma (or other) separated value into an array
     * @param inp String to be divided
     * @param divider The divider (default: ',')
     */
    static csvToArray(inp, divider = ',') {
        const arr = [];
        inp.split(divider).forEach((item) => {
            arr.push(item.trim());
        });
        return arr;
    }
    /**
     * Convert an array to a string
     * @param inp string
     * @param end cut-off point
     */
    static arrayToString(inp, end) {
        let outp = '';
        inp.forEach((key, val) => {
            outp += key;
            if (end && val + 1 !== inp.length) {
                outp += ' ';
            }
        });
        return outp;
    }
    /**
     * Converts a DOM node reference into an HTML Element reference
     * @param node The node to convert
     */
    static nodeToElem(node) {
        if (node.firstChild !== null) {
            return node.firstChild.parentElement;
        }
        else {
            console.warn('Node-to-elem without childnode is untested');
            const tempNode = node;
            node.appendChild(tempNode);
            const selected = node.firstChild.parentElement;
            node.removeChild(tempNode);
            return selected;
        }
    }
    /**
     * Match strings while ignoring case sensitivity
     * @param a First string
     * @param b Second string
     */
    static caselessStringMatch(a, b) {
        const compare = a.localeCompare(b, 'en', {
            sensitivity: 'base',
        });
        return compare === 0 ? true : false;
    }
    /**
     * Add a new TorDetRow and return the inner div
     * @param tar The row to be targetted
     * @param label The name to be displayed for the new row
     * @param rowClass The row's classname (should start with mp_)
     */
    static addTorDetailsRow(tar, label, rowClass) {
        if (MP.DEBUG)
            console.log(tar);
        if (tar === null || tar.parentElement === null) {
            throw new Error(`Add Tor Details Row: empty node or parent node @ ${tar}`);
        }
        else {
            tar.parentElement.insertAdjacentHTML('afterend', `<div class="torDetRow"><div class="torDetLeft">${label}</div><div class="torDetRight ${rowClass}"><span class="flex"></span></div></div>`);
            return document.querySelector(`.${rowClass} .flex`);
        }
    }
    /**
     * Converts an element into a button that, when clicked, copies text to clipboard
     * @param btn An HTML Element being used as a button
     * @param payload The text that will be copied to clipboard on button click, or a callback function that will use the clipboard's current text
     */
    static clipboardifyBtn(btn, payload, copy = true) {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
            // Have to override the Navigator type to prevent TS errors
            const nav = navigator;
            if (nav === undefined) {
                alert('Failed to copy text, likely due to missing browser support.');
                throw new Error("browser doesn't support 'navigator'?");
            }
            else {
                /* Navigator Exists */
                if (copy && typeof payload === 'string') {
                    // Copy results to clipboard
                    nav.clipboard.writeText(payload);
                    console.log('[M+] Copied to your clipboard!');
                }
                else {
                    // Run payload function with clipboard text
                    nav.clipboard.readText().then((text) => {
                        payload(text);
                    });
                    console.log('[M+] Copied from your clipboard!');
                }
                btn.style.color = 'green';
            }
        });
    }
    /**
     * Creates an HTTPRequest for GET JSON, returns the full text of HTTP GET
     * @param url - a string of the URL to submit for GET request
     */
    static getJSON(url) {
        return new Promise((resolve, reject) => {
            const getHTTP = new XMLHttpRequest();
            //URL to GET results with the amount entered by user plus the username found on the menu selected
            getHTTP.open('GET', url, true);
            getHTTP.setRequestHeader('Content-Type', 'application/json');
            getHTTP.onreadystatechange = function () {
                if (getHTTP.readyState === 4 && getHTTP.status === 200) {
                    resolve(getHTTP.responseText);
                }
            };
            getHTTP.send();
        });
    }
    /**
     * #### Get the user gift history between the logged in user and a given ID
     * @param userID A user ID; can be a string or number
     */
    static getUserGiftHistory(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawGiftHistory = yield Util.getJSON(`https://www.myanonamouse.net/json/userBonusHistory.php?other_userid=${userID}`);
            const giftHistory = JSON.parse(rawGiftHistory);
            // Return the full data
            return giftHistory;
        });
    }
    /**
     * #### Get the user gift history between the logged in user and everyone
     */
    static getAllUserGiftHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            const rawGiftHistory = yield Util.getJSON(`https://www.myanonamouse.net/json/userBonusHistory.php`);
            const giftHistory = JSON.parse(rawGiftHistory);
            // Return the full data
            return giftHistory;
        });
    }
    /**
     * #### Gets the logged in user's userid
     */
    static getCurrentUserID() {
        const myInfo = (document.querySelector('.mmUserStats .avatar a'));
        if (myInfo) {
            const userID = this.endOfHref(myInfo);
            console.log(`[M+] Logged in userID is ${userID}`);
            return userID;
        }
        console.log('No logged in user found.');
        return '';
    }
    static prettySiteTime(unixTimestamp, date, time) {
        const timestamp = new Date(unixTimestamp * 1000).toISOString();
        if (date && !time) {
            return timestamp.split('T')[0];
        }
        else if (!date && time) {
            return timestamp.split('T')[1];
        }
        else {
            return timestamp;
        }
    }
    /**
     * #### Check a string to see if it's divided with a dash, returning the first half if it doesn't contain a specified string
     * @param original The original string being checked
     * @param contained A string that might be contained in the original
     */
    static checkDashes(original, contained) {
        if (MP.DEBUG) {
            console.log(`checkDashes( ${original}, ${contained} ): Count ${original.indexOf(' - ')}`);
        }
        // Dashes are present
        if (original.indexOf(' - ') !== -1) {
            if (MP.DEBUG) {
                console.log(`String contains a dash`);
            }
            const split = original.split(' - ');
            if (split[0] === contained) {
                if (MP.DEBUG) {
                    console.log(`> String before dash is "${contained}"; using string behind dash`);
                }
                return split[1];
            }
            else {
                return split[0];
            }
        }
        else {
            return original;
        }
    }
    /**
     * Inserts a button element with optional link and styling.
     * @param id The ID of the button (optional for link buttons)
     * @param text The text displayed in the button
     * @param tar The element to add the button to or the selector
     * @param options Additional configuration options
     *      - url: URL to link to (optional, if not provided, a non-link button will be created)
     *      - type: The HTML element to create. Default: `h1` for non-link buttons, `a` for link buttons
     *      - order: flex order (only applies if added as the first child of the target)
     *      - relative: The position of the button relative to the `tar`. Default: `afterend`
     *      - btnClass: The classname of the element. Default: `mp_btn`
     * @returns A Promise resolving to the created button element
     */
    static createButtonElement(id = '', text, tar, options = {}) {
        return new Promise((resolve, reject) => {
            // Default option values
            const { url = '', type = url ? 'a' : 'h1', order = 0, relative = 'afterend', btnClass = 'mp_btn', } = options;
            const target = typeof tar === 'string' ? document.querySelector(tar) : tar;
            if (!target) {
                reject(`${tar} is null!`);
                return;
            }
            // Create the button element (anchor if URL is provided, otherwise generic)
            const button = document.createElement(type);
            // Add attributes
            button.innerHTML = text;
            if (url) {
                button.setAttribute('href', url);
                button.setAttribute('target', '_blank');
                button.classList.add('mp_button_clone');
            }
            else {
                button.classList.add(btnClass);
                if (id)
                    button.setAttribute('id', `mp_${id}`);
                button.setAttribute('role', 'button');
            }
            // Apply flex order if inserting as the first child of the target
            if (relative === 'afterbegin' || relative === 'beforeend') {
                button.style.order = `${order}`;
                target.insertAdjacentElement(relative, button);
            }
            else {
                target.insertAdjacentElement(relative, button);
            }
            resolve(button);
        });
    }
}
_a = Util;
/**
 *Return the contents between brackets
 *
 * @static
 * @memberof Util
 */
Util.bracketContents = (inp) => {
    return inp.match(/\(([^)]+)\)/)[1];
};
/**
 * Returns a random number between two parameters
 * @param min a number of the bottom of random number pool
 * @param max a number of the top of the random number pool
 */
Util.randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
/**
 * Sleep util to be used in async functions to delay program
 */
Util.sleep = (m) => new Promise((r) => setTimeout(r, m));
/**
 * Return the last section of an HREF
 * @param elem An anchor element
 * @param split Optional divider. Defaults to `/`
 */
Util.endOfHref = (elem, split = '/') => elem.href.split(split).pop();
/**
 * Return the hex value of a component as a string.
 * From https://stackoverflow.com/questions/5623838
 *
 * @static
 * @param {number} c
 * @returns {string}
 * @memberof Util
 */
Util.componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
};
/**
 * Return a hex color code from RGB.
 * From https://stackoverflow.com/questions/5623838
 *
 * @static
 * @memberof Util
 */
Util.rgbToHex = (r, g, b) => {
    return `#${Util.componentToHex(r)}${Util.componentToHex(g)}${Util.componentToHex(b)}`;
};
/**
 * Extract numbers (with float) from text and return them
 * @param tar An HTML element that contains numbers
 */
Util.extractFloat = (tar) => {
    if (tar.textContent) {
        return (tar.textContent.replace(/,/g, '').match(/\d+\.\d+/) || []).map((n) => parseFloat(n));
    }
    else {
        throw new Error('Target contains no text');
    }
};
/**
 * ## Utilities specific to Goodreads
 */
Util.goodreads = {
    /**
     * * Removes spaces in author names that use adjacent intitials.
     * @param auth The author(s)
     * @example "H G Wells" -> "HG Wells"
     */
    smartAuth: (auth) => {
        let outp = '';
        const arr = Util.stringToArray(auth);
        arr.forEach((key, val) => {
            // Current key is an initial
            if (key.length < 2) {
                // If next key is an initial, don't add a space
                const nextLeng = arr[val + 1].length;
                if (nextLeng < 2) {
                    outp += key;
                }
                else {
                    outp += `${key} `;
                }
            }
            else {
                outp += `${key} `;
            }
        });
        // Trim trailing space
        return outp.trim();
    },
    /**
     * * Turns a string into a Goodreads search URL
     * @param type The type of URL to make
     * @param inp The extracted data to URI encode
     */
    buildSearchURL: (type, inp) => {
        if (MP.DEBUG) {
            console.log(`goodreads.buildGrSearchURL( ${type}, ${inp} )`);
        }
        let grType = type;
        const cases = {
            book: () => {
                grType = 'title';
            },
            series: () => {
                grType = 'on';
                inp += ', #';
            },
        };
        if (cases[type]) {
            cases[type]();
        }
        return `https://r.mrd.ninja/https://www.goodreads.com/search?q=${encodeURIComponent(inp.replace('%', '')).replace("'", '%27')}&search_type=books&search%5Bfield%5D=${grType}`;
    },
};
/**
 * #### Return a cleaned book title from an element
 * @param data The element containing the title text
 * @param auth A string of authors
 */
Util.getBookTitle = (data, auth = '') => __awaiter(_a, void 0, void 0, function* () {
    if (data === null) {
        throw new Error('getBookTitle() failed; element was null!');
    }
    let extracted = data.innerText;
    // Shorten title and check it for brackets & author names
    extracted = Util.trimString(Util.bracketRemover(extracted), 50);
    extracted = Util.checkDashes(extracted, auth);
    return extracted;
});
/**
 * #### Return GR-formatted authors as an array limited to `num`
 * @param data The element containing the author links
 * @param num The number of authors to return. Default 3
 */
Util.getBookAuthors = (data, num = 3) => __awaiter(_a, void 0, void 0, function* () {
    if (data === null) {
        console.warn('getBookAuthors() failed; element was null!');
        return [];
    }
    else {
        const authList = [];
        data.forEach((author) => {
            if (num > 0) {
                authList.push(Util.goodreads.smartAuth(author.innerText));
                num--;
            }
        });
        return authList;
    }
});
/**
 * #### Return series as an array
 * @param data The element containing the series links
 */
Util.getBookSeries = (data) => __awaiter(_a, void 0, void 0, function* () {
    if (data === null) {
        console.warn('getBookSeries() failed; element was null!');
        return [];
    }
    else {
        const seriesList = [];
        data.forEach((series) => {
            seriesList.push(series.innerText);
        });
        return seriesList;
    }
});
/**
 * #### Return a table-like array of rows as an object.
 * Store the returned object and access using the row title, ex. `stored['Title:']`
 * @param rowList An array of table-like rows
 * @param titleClass The class used by the title cells. Default `.torDetLeft`
 * @param dataClass The class used by the data cells. Default `.torDetRight`
 */
Util.rowsToObj = (rowList, titleClass = '.torDetLeft', dataClass = '.torDetRight') => {
    if (rowList.length < 1) {
        throw new Error(`Util.rowsToObj( ${rowList} ): Row list was empty!`);
    }
    const rows = [];
    rowList.forEach((row) => {
        const title = row.querySelector(titleClass);
        const data = row.querySelector(dataClass);
        if (title) {
            rows.push({
                key: title.textContent,
                value: data,
            });
        }
        else {
            console.warn('Row title was empty!');
        }
    });
    return rows.reduce((obj, item) => ((obj[item.key] = item.value), obj), {});
};
/**
 * #### Convert bytes into a human-readable string
 * Created by yyyzzz999
 * @param bytes Bytes to be formatted
 * @param b ?
 * @returns String in the format of ex. `123 MB`
 */
Util.formatBytes = (bytes, b = 2) => {
    if (bytes === 0)
        return '0 Bytes';
    const c = 0 > b ? 0 : b;
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return (parseFloat((bytes / Math.pow(1024, index)).toFixed(c)) +
        ' ' +
        ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'][index]);
};
Util.derefer = (url) => {
    return `https://r.mrd.ninja/${encodeURI(url)}`;
};
Util.delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
/// <reference path="util.ts" />
/**
 * # Class for handling validation & confirmation
 */
class Check {
    /**
     * * Wait for an element to exist, then return it
     * @param {string} selector - The DOM string that will be used to select an element
     * @return {Promise<HTMLElement>} Promise of an element that was selected
     */
    static elemLoad(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            if (MP.DEBUG) {
                console.log(`%c Looking for ${selector}`, 'background: #222; color: #555');
            }
            let _counter = 0;
            const _counterLimit = 200;
            const logic = (selector) => __awaiter(this, void 0, void 0, function* () {
                // Select the actual element
                const elem = typeof selector === 'string'
                    ? document.querySelector(selector)
                    : selector;
                if (elem === undefined) {
                    throw `${selector} is undefined!`;
                }
                if (elem === null && _counter < _counterLimit) {
                    yield Util.afTimer();
                    _counter++;
                    return yield logic(selector);
                }
                else if (elem === null && _counter >= _counterLimit) {
                    _counter = 0;
                    return false;
                }
                else if (elem) {
                    return elem;
                }
                else {
                    return false;
                }
            });
            return logic(selector);
        });
    }
    /**
     * * Run a function whenever an element changes
     * @param selector - The element to be observed. Can be a string.
     * @param callback - The function to run when the observer triggers
     * @return Promise of a mutation observer
     */
    static elemObserver(selector, callback, config = {
        childList: true,
        attributes: true,
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            let selected = null;
            if (typeof selector === 'string') {
                selected = document.querySelector(selector);
                if (selected === null) {
                    throw new Error(`Couldn't find '${selector}'`);
                }
            }
            if (MP.DEBUG) {
                console.log(`%c Setting observer on ${selector}: ${selected}`, 'background: #222; color: #5d8aa8');
            }
            const observer = new MutationObserver(callback);
            observer.observe(selected, config);
            return observer;
        });
    }
    /**
     * * Check to see if the script has been updated from an older version
     * @return The version string or false
     */
    static updated() {
        if (MP.DEBUG) {
            console.group('Check.updated()');
            console.log(`PREV VER = ${this.prevVer}`);
            console.log(`NEW VER = ${this.newVer}`);
        }
        return new Promise((resolve) => {
            // Different versions; the script was updated
            if (this.newVer !== this.prevVer) {
                if (MP.DEBUG) {
                    console.log('Script is new or updated');
                }
                // Store the new version
                GM_setValue('mp_version', this.newVer);
                if (this.prevVer) {
                    // The script has run before
                    if (MP.DEBUG) {
                        console.log('Script has run before');
                        console.groupEnd();
                    }
                    resolve('updated');
                }
                else {
                    // First-time run
                    if (MP.DEBUG) {
                        console.log('Script has never run');
                        console.groupEnd();
                    }
                    // Enable the most basic features
                    GM_setValue('goodreadsBtn', true);
                    GM_setValue('alerts', true);
                    resolve('firstRun');
                }
            }
            else {
                if (MP.DEBUG) {
                    console.log('Script not updated');
                    console.groupEnd();
                }
                resolve(false);
            }
        });
    }
    /**
     * * Check to see what page is being accessed
     * @param {ValidPage} pageQuery - An optional page to specifically check for
     * @return {Promise<string>} A promise containing the name of the current page
     * @return {Promise<boolean>} Optionally, a boolean if the current page matches the `pageQuery`
     */
    static page(pageQuery) {
        const storedPage = GM_getValue('mp_currentPage');
        let currentPage = undefined;
        return new Promise((resolve) => {
            // Check.page() has been run and a value was stored
            if (storedPage !== undefined) {
                // If we're just checking what page we're on, return the stored page
                if (!pageQuery) {
                    resolve(storedPage);
                    // If we're checking for a specific page, return TRUE/FALSE
                }
                else if (pageQuery === storedPage) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
                // Check.page() has not previous run
            }
            else {
                // Get the current page
                let path = window.location.pathname;
                path = path.indexOf('.php') ? path.split('.php')[0] : path;
                const page = path.split('/');
                page.shift();
                if (MP.DEBUG) {
                    console.log(`Page URL @ ${page.join(' -> ')}`);
                }
                // Create an object literal of sorts to use as a "switch"
                const cases = {
                    '': () => 'home',
                    index: () => 'home',
                    shoutbox: () => 'shoutbox',
                    preferences: () => 'settings',
                    millionaires: () => 'vault',
                    t: () => 'torrent',
                    u: () => 'user',
                    f: () => {
                        if (page[1] === 't')
                            return 'forum thread';
                    },
                    tor: () => {
                        if (page[1] === 'browse')
                            return 'browse';
                        else if (page[1] === 'requests2')
                            return 'request';
                        else if (page[1] === 'viewRequest')
                            return 'request details';
                        else if (page[1] === 'upload')
                            return 'upload';
                    },
                    newUsers: () => 'new users',
                };
                // Check to see if we have a case that matches the current page
                if (cases[page[0]]) {
                    currentPage = cases[page[0]]();
                }
                else {
                    console.warn(`Page "${page}" is not a valid M+ page. Path: ${path}`);
                }
                if (currentPage !== undefined) {
                    // Save the current page to be accessed later
                    GM_setValue('mp_currentPage', currentPage);
                    // If we're just checking what page we're on, return the page
                    if (!pageQuery) {
                        resolve(currentPage);
                        // If we're checking for a specific page, return TRUE/FALSE
                    }
                    else if (pageQuery === currentPage) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                }
            }
            if (MP.DEBUG) {
                console.groupEnd();
            }
        });
    }
    /**
     * * Check to see if a given category is an ebook/audiobook category
     */
    static isBookCat(cat) {
        // Currently, all book categories are assumed to be in the range of 39-120
        return cat >= 39 && cat <= 120 ? true : false;
    }
}
Check.newVer = GM_info.script.version;
Check.prevVer = GM_getValue('mp_version');
/// <reference path="check.ts" />
/**
 * Class for handling values and methods related to styles
 * @constructor Initializes theme based on last saved value; can be called before page content is loaded
 * @method theme Gets or sets the current theme
 */
class Style {
    constructor() {
        // The light theme is the default theme, so use M+ Light values
        this._theme = 'light';
        // Get the previously used theme object
        this._prevTheme = this._getPrevTheme();
        // If the previous theme object exists, assume the current theme is identical
        if (this._prevTheme !== undefined) {
            this._theme = this._prevTheme;
        }
        else if (MP.DEBUG)
            console.warn('no previous theme');
        // Fetch the CSS data
        this._cssData = GM_getResourceText('MP_CSS');
    }
    /** Allows the current theme to be returned */
    get theme() {
        return this._theme;
    }
    /** Allows the current theme to be set */
    set theme(val) {
        this._theme = val;
    }
    /** Sets the M+ theme based on the site theme */
    alignToSiteTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            const theme = yield this._getSiteCSS();
            this._theme = theme.indexOf('dark') > 0 ? 'dark' : 'light';
            if (this._prevTheme !== this._theme) {
                this._setPrevTheme();
            }
            // Inject the CSS class used by M+ for theming
            Check.elemLoad('body').then(() => {
                const body = document.querySelector('body');
                if (body) {
                    body.classList.add(`mp_${this._theme}`);
                }
                else if (MP.DEBUG) {
                    console.warn(`Body is ${body}`);
                }
            });
        });
    }
    /** Injects the stylesheet link into the header */
    injectLink() {
        const id = 'mp_css';
        if (!document.getElementById(id)) {
            const style = document.createElement('style');
            style.id = id;
            style.innerText = this._cssData !== undefined ? this._cssData : '';
            document.querySelector('head').appendChild(style);
        }
        else if (MP.DEBUG)
            console.warn(`an element with the id "${id}" already exists`);
    }
    /** Returns the previous theme object if it exists */
    _getPrevTheme() {
        return GM_getValue('style_theme');
    }
    /** Saves the current theme for future reference */
    _setPrevTheme() {
        GM_setValue('style_theme', this._theme);
    }
    _getSiteCSS() {
        return new Promise((resolve) => {
            const themeURL = document
                .querySelector('head link[href*="ICGstation"]')
                .getAttribute('href');
            if (typeof themeURL === 'string') {
                resolve(themeURL);
            }
            else if (MP.DEBUG)
                console.warn(`themeUrl is not a string: ${themeURL}`);
        });
    }
}
/// <reference path="../check.ts" />
/**
 * CORE FEATURES
 *
 * Your feature belongs here if the feature:
 * A) is critical to the userscript
 * B) is intended to be used by other features
 * C) will have settings displayed on the Settings page
 * If A & B are met but not C consider using `Utils.ts` instead
 */
/**
 * This feature creates a pop-up notification
 */
class Alerts {
    constructor() {
        this._settings = {
            scope: SettingGroup.Other,
            type: 'checkbox',
            title: 'alerts',
            desc: 'Enable the MAM+ Alert panel for update information, etc.',
        };
        MP.settingsGlob.push(this._settings);
    }
    notify(kind, log) {
        if (MP.DEBUG) {
            console.group(`Alerts.notify( ${kind} )`);
        }
        return new Promise((resolve) => {
            // Verify a notification request was made
            if (kind) {
                // Verify notifications are allowed
                if (GM_getValue('alerts')) {
                    // Internal function to build msg text
                    const buildMsg = (arr, title) => {
                        if (MP.DEBUG) {
                            console.log(`buildMsg( ${title} )`);
                        }
                        // Make sure the array isn't empty
                        if (arr.length > 0 && arr[0] !== '') {
                            // Display the section heading
                            let msg = `<h4>${title}:</h4><ul>`;
                            // Loop over each item in the message
                            arr.forEach((item) => {
                                msg += `<li>${item}</li>`;
                            }, msg);
                            // Close the message
                            msg += '</ul>';
                            return msg;
                        }
                        return '';
                    };
                    // Internal function to build notification panel
                    const buildPanel = (msg) => {
                        if (MP.DEBUG) {
                            console.log(`buildPanel( ${msg} )`);
                        }
                        Check.elemLoad('body').then(() => {
                            document.body.innerHTML += `<div class='mp_notification'>${msg}<span>X</span></div>`;
                            const msgBox = document.querySelector('.mp_notification');
                            const closeBtn = msgBox.querySelector('span');
                            try {
                                if (closeBtn) {
                                    // If the close button is clicked, remove it
                                    closeBtn.addEventListener('click', () => {
                                        if (msgBox) {
                                            msgBox.remove();
                                        }
                                    }, false);
                                }
                            }
                            catch (err) {
                                if (MP.DEBUG) {
                                    console.log(err);
                                }
                            }
                        });
                    };
                    let message = '';
                    if (kind === 'updated') {
                        if (MP.DEBUG) {
                            console.log('Building update message');
                        }
                        // Start the message
                        message = `<strong>MAM+ has been updated!</strong> You are now using v${MP.VERSION}, created on ${MP.TIMESTAMP}. Discuss it on <a href='forums.php?action=viewtopic&topicid=41863'>the forums</a>.<hr>`;
                        // Add the changelog
                        message += buildMsg(log.UPDATE_LIST, 'Changes');
                        message += buildMsg(log.BUG_LIST, 'Known Bugs');
                    }
                    else if (kind === 'firstRun') {
                        message =
                            '<h4>Welcome to MAM+!</h4>Please head over to your <a href="/preferences/index.php">preferences</a> to enable the MAM+ settings.<br>Any bug reports, feature requests, etc. can be made on <a href="https://github.com/gardenshade/mam-plus/issues">Github</a>, <a href="/forums.php?action=viewtopic&topicid=41863">the forums</a>, or <a href="/sendmessage.php?receiver=108303">through private message</a>.';
                        if (MP.DEBUG) {
                            console.log('Building first run message');
                        }
                    }
                    else if (MP.DEBUG) {
                        console.warn(`Received msg kind: ${kind}`);
                    }
                    buildPanel(message);
                    if (MP.DEBUG) {
                        console.groupEnd();
                    }
                    resolve(true);
                    // Notifications are disabled
                }
                else {
                    if (MP.DEBUG) {
                        console.log('Notifications are disabled.');
                        console.groupEnd();
                    }
                    resolve(false);
                }
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
class Debug {
    constructor() {
        this._settings = {
            scope: SettingGroup.Other,
            type: 'checkbox',
            title: 'debug',
            desc: 'Error log (<em>Click this checkbox to enable verbose logging to the console</em>)',
        };
        MP.settingsGlob.push(this._settings);
    }
    get settings() {
        return this._settings;
    }
}
/**
 * # GLOBAL FEATURES
 */
/**
 * ## Hide the home button or the banner
 */
class HideHome {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'dropdown',
            title: 'hideHome',
            tag: 'Remove banner/home',
            options: {
                default: 'Do not remove either',
                hideBanner: 'Hide the banner',
                hideHome: 'Hide the home button',
            },
            desc: 'Remove the header image or Home button, because both link to the homepage',
        };
        this._tar = '#mainmenu';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        const hider = GM_getValue(this._settings.title);
        if (hider === 'hideHome') {
            document.body.classList.add('mp_hide_home');
            console.log('[M+] Hid the home button!');
        }
        else if (hider === 'hideBanner') {
            document.body.classList.add('mp_hide_banner');
            console.log('[M+] Hid the banner!');
        }
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Bypass the vault info page
 */
class VaultLink {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'vaultLink',
            desc: 'Make the Vault link bypass the Vault Info page',
        };
        this._tar = '#millionInfo';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        document
            .querySelector(this._tar)
            .setAttribute('href', '/millionaires/donate.php');
        console.log('[M+] Made the vault text link to the donate page!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Shorten the vault & ratio text
 */
class MiniVaultInfo {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'miniVaultInfo',
            desc: 'Shorten the Vault link & ratio text',
        };
        this._tar = '#millionInfo';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        const vaultText = document.querySelector(this._tar);
        const ratioText = document.querySelector('#tmR');
        // Shorten the ratio text
        // TODO: move this to its own setting?
        /* This chained monstrosity does the following:
        - Extract the number (with float) from the element
        - Fix the float to 2 decimal places (which converts it back into a string)
        - Convert the string back into a number so that we can convert it with`toLocaleString` to get commas back */
        const num = Number(Util.extractFloat(ratioText)[0].toFixed(2)).toLocaleString();
        ratioText.innerHTML = `${num} <img src="/pic/updownBig.png" alt="ratio">`;
        // Turn the numeric portion of the vault link into a number
        let newText = parseInt(vaultText.textContent.split(':')[1].split(' ')[1].replace(/,/g, ''));
        // Convert the vault amount to millionths
        newText = Number((newText / 1e6).toFixed(3));
        // Update the vault text
        vaultText.textContent = `Vault: ${newText} million`;
        console.log('[M+] Shortened the vault & ratio numbers!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Display bonus point delta
 */
class BonusPointDelta {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'bonusPointDelta',
            desc: `Display how many bonus points you've gained since last pageload`,
        };
        this._tar = '#tmBP';
        this._prevBP = 0;
        this._currentBP = 0;
        this._delta = 0;
        this._displayBP = (bp) => {
            const bonusBox = document.querySelector(this._tar);
            let deltaBox = '';
            deltaBox = bp > 0 ? `+${bp}` : `${bp}`;
            if (bonusBox !== null) {
                bonusBox.innerHTML += `<span class='mp_bpDelta'> (${deltaBox})</span>`;
            }
        };
        this._setBP = (bp) => {
            GM_setValue(`${this._settings.title}Val`, `${bp}`);
        };
        this._getBP = () => {
            const stored = GM_getValue(`${this._settings.title}Val`);
            if (stored === undefined) {
                return 0;
            }
            else {
                return parseInt(stored);
            }
        };
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        const currentBPEl = document.querySelector(this._tar);
        // Get old BP value
        this._prevBP = this._getBP();
        if (currentBPEl !== null) {
            // Extract only the number from the BP element
            const current = currentBPEl.textContent.match(/\d+/g);
            // Set new BP value
            this._currentBP = parseInt(current[0]);
            this._setBP(this._currentBP);
            // Calculate delta
            this._delta = this._currentBP - this._prevBP;
            // Show the text if not 0
            if (this._delta !== 0 && !isNaN(this._delta)) {
                this._displayBP(this._delta);
            }
        }
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Blur the header background
 */
class BlurredHeader {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'blurredHeader',
            desc: `Add a blurred background to the header area`,
        };
        this._tar = '#siteMain > header';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const header = document.querySelector(`${this._tar}`);
            const headerImg = header.querySelector(`img`);
            if (headerImg) {
                const headerSrc = headerImg.getAttribute('src');
                // Generate a container for the background
                const blurredBack = document.createElement('div');
                header.classList.add('mp_blurredBack');
                header.append(blurredBack);
                blurredBack.style.backgroundImage = headerSrc ? `url(${headerSrc})` : '';
                blurredBack.classList.add('mp_container');
            }
            console.log('[M+] Added a blurred background to the header!');
        });
    }
    // This must match the type selected for `this._settings`
    get settings() {
        return this._settings;
    }
}
/**
 * ## Hide the seedbox link
 */
class HideSeedbox {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'hideSeedbox',
            scope: SettingGroup.Global,
            desc: 'Remove the "Get A Seedbox" menu item',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#menu .sbDonCrypto';
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const seedboxBtn = document.querySelector(this._tar);
            if (seedboxBtn) {
                seedboxBtn.style.display = 'none';
                console.log('[M+] Hid the Seedbox button!');
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Hide the donation link
 */
class HideDonationBox {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'hideDonationBox',
            scope: SettingGroup.Global,
            desc: 'Remove the Donations menu item',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#menu .mmDonBox';
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const donationBoxBtn = document.querySelector(this._tar);
            if (donationBoxBtn) {
                donationBoxBtn.style.display = 'none';
                console.log('[M+] Hid the Donation Box button!');
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * # Fixed navigation & search
 */
class FixedNav {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'fixedNav',
            scope: SettingGroup.Global,
            desc: 'Fix the navigation/search to the top of the page.',
        };
        this._tar = 'body';
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            document.querySelector('body').classList.add('mp_fixed_nav');
            console.log('[M+] Pinned the nav/search to the top!');
        });
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="../check.ts" />
/**
 * SHARED CODE
 *
 * This is for anything that's shared between files, but is not generic enough to
 * to belong in `Utils.ts`. I can't think of a better way to categorize DRY code.
 */
class Shared {
    constructor() {
        /**
         * Receive a target and `this._settings.title`
         * @param tar CSS selector for a text input box
         */
        // TODO: with all Checking being done in `Util.startFeature()` it's no longer necessary to Check in this function
        this.fillGiftBox = (tar, settingTitle) => {
            if (MP.DEBUG)
                console.log(`Shared.fillGiftBox( ${tar}, ${settingTitle} )`);
            return new Promise((resolve) => {
                Check.elemLoad(tar).then(() => {
                    const pointBox = (document.querySelector(tar));
                    if (pointBox) {
                        const userSetPoints = parseInt(GM_getValue(`${settingTitle}_val`));
                        let maxPoints = parseInt(pointBox.getAttribute('max'));
                        if (!isNaN(userSetPoints) && userSetPoints <= maxPoints) {
                            maxPoints = userSetPoints;
                        }
                        pointBox.value = maxPoints.toFixed(0);
                        resolve(maxPoints);
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        };
        /**
         * Returns list of all results from Browse page
         */
        this.getSearchList = () => {
            if (MP.DEBUG)
                console.log(`Shared.getSearchList( )`);
            return new Promise((resolve, reject) => {
                // Wait for the search results to exist
                Check.elemLoad('#ssr tr[id ^= "tdr"] td').then(() => {
                    // Select all search results
                    const snatchList = document.querySelectorAll('#ssr tr[id ^= "tdr"]');
                    if (snatchList === null || snatchList === undefined) {
                        reject(`snatchList is ${snatchList}`);
                    }
                    else {
                        resolve(snatchList);
                    }
                });
            });
        };
        // TODO: Make goodreadsButtons() into a generic framework for other site's buttons
        this.goodreadsButtons = (bookData, authorData, seriesData, target) => __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding the MAM-to-Goodreads buttons...');
            let seriesP, authorP;
            let authors = '';
            Util.addTorDetailsRow(target, 'Search Goodreads', 'mp_grRow');
            // Extract the Series and Author
            yield Promise.all([
                (seriesP = Util.getBookSeries(seriesData)),
                (authorP = Util.getBookAuthors(authorData)),
            ]);
            yield Check.elemLoad('.mp_grRow .flex');
            const buttonTar = (document.querySelector('.mp_grRow .flex'));
            if (buttonTar === null) {
                throw new Error('Button row cannot be targeted!');
            }
            // Build Series buttons
            seriesP.then((ser) => {
                if (ser.length > 0) {
                    ser.forEach((item) => {
                        const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                        const url = Util.goodreads.buildSearchURL('series', item);
                        Util.createButtonElement('', buttonTitle, buttonTar, { url: url, order: 4, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                    });
                }
                else {
                    console.warn('No series data detected!');
                }
            });
            // Build Author button
            authorP
                .then((auth) => {
                if (auth.length > 0) {
                    authors = auth.join(' ');
                    const url = Util.goodreads.buildSearchURL('author', authors);
                    Util.createButtonElement('', 'Author', buttonTar, { url: url, order: 3, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                }
                else {
                    console.warn('No author data detected!');
                }
            })
                // Build Title buttons
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const title = yield Util.getBookTitle(bookData, authors);
                if (title !== '') {
                    const url = Util.goodreads.buildSearchURL('book', title);
                    Util.createButtonElement('', 'Title', buttonTar, { url: url, order: 2, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = Util.goodreads.buildSearchURL('on', `${title} ${authors}`);
                        Util.createButtonElement('', 'Title + Author', buttonTar, { url: bothURL, order: 1, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                    }
                    else if (MP.DEBUG) {
                        console.log(`Failed to generate Title+Author link!\nTitle: ${title}\nAuthors: ${authors}`);
                    }
                }
                else {
                    console.warn('No title data detected!');
                }
            }));
            console.log(`[M+] Added the MAM-to-Goodreads buttons!`);
        });
        this.audibleButtons = (bookData, authorData, seriesData, target) => __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding the MAM-to-Audible buttons...');
            let seriesP, authorP;
            let authors = '';
            Util.addTorDetailsRow(target, 'Search Audible', 'mp_auRow');
            // Extract the Series and Author
            yield Promise.all([
                (seriesP = Util.getBookSeries(seriesData)),
                (authorP = Util.getBookAuthors(authorData)),
            ]);
            yield Check.elemLoad('.mp_auRow .flex');
            const buttonTar = (document.querySelector('.mp_auRow .flex'));
            if (buttonTar === null) {
                throw new Error('Button row cannot be targeted!');
            }
            // Build Series buttons
            seriesP.then((ser) => {
                if (ser.length > 0) {
                    ser.forEach((item) => {
                        const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                        const url = `https://www.audible.com/search?keywords=${item}`;
                        Util.createButtonElement('', buttonTitle, buttonTar, { url: url, order: 4, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                    });
                }
                else {
                    console.warn('No series data detected!');
                }
            });
            // Build Author button
            authorP
                .then((auth) => {
                if (auth.length > 0) {
                    authors = auth.join(' ');
                    const url = `https://www.audible.com/search?author_author=${authors}`;
                    Util.createButtonElement('', 'Author', buttonTar, { url: url, order: 3, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                }
                else {
                    console.warn('No author data detected!');
                }
            })
                // Build Title buttons
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const title = yield Util.getBookTitle(bookData, authors);
                if (title !== '') {
                    const url = `https://www.audible.com/search?title=${title}`;
                    Util.createButtonElement('', 'Title', buttonTar, { url: url, order: 2, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = `https://www.audible.com/search?title=${title}&author_author=${authors}`;
                        Util.createButtonElement('', 'Title + Author', buttonTar, { url: bothURL, order: 1, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                    }
                    else if (MP.DEBUG) {
                        console.log(`Failed to generate Title+Author link!\nTitle: ${title}\nAuthors: ${authors}`);
                    }
                }
                else {
                    console.warn('No title data detected!');
                }
            }));
            console.log(`[M+] Added the MAM-to-Audible buttons!`);
        });
        // TODO: Switch to StoryGraph API once it becomes available? Or advanced search
        this.storyGraphButtons = (bookData, authorData, seriesData, target) => __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding the MAM-to-StoryGraph buttons...');
            let seriesP, authorP;
            let authors = '';
            Util.addTorDetailsRow(target, 'Search TheStoryGraph', 'mp_sgRow');
            // Extract the Series and Author
            yield Promise.all([
                (seriesP = Util.getBookSeries(seriesData)),
                (authorP = Util.getBookAuthors(authorData)),
            ]);
            yield Check.elemLoad('.mp_sgRow .flex');
            const buttonTar = (document.querySelector('.mp_sgRow .flex'));
            if (buttonTar === null) {
                throw new Error('Button row cannot be targeted!');
            }
            // Build Series buttons
            seriesP.then((ser) => {
                if (ser.length > 0) {
                    ser.forEach((item) => {
                        const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                        const url = `https://app.thestorygraph.com/browse?search_term=${item}`;
                        Util.createButtonElement('', buttonTitle, buttonTar, { url: url, order: 4, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                    });
                }
                else {
                    console.warn('No series data detected!');
                }
            });
            // Build Author button
            authorP
                .then((auth) => {
                if (auth.length > 0) {
                    authors = auth.join(' ');
                    const url = `https://app.thestorygraph.com/browse?search_term=${authors}`;
                    Util.createButtonElement('', 'Author', buttonTar, { url: url, order: 3, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                }
                else {
                    console.warn('No author data detected!');
                }
            })
                // Build Title buttons
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const title = yield Util.getBookTitle(bookData, authors);
                if (title !== '') {
                    const url = `https://app.thestorygraph.com/browse?search_term=${title}`;
                    Util.createButtonElement('', 'Title', buttonTar, { url: url, order: 2, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = `https://app.thestorygraph.com/browse?search_term=${title} ${authors}`;
                        Util.createButtonElement('', 'Title + Author', buttonTar, { url: bothURL, order: 1, relative: 'afterbegin', btnClass: 'mp_button_clone' });
                    }
                    else if (MP.DEBUG) {
                        console.log(`Failed to generate Title+Author link!\nTitle: ${title}\nAuthors: ${authors}`);
                    }
                }
                else {
                    console.warn('No title data detected!');
                }
            }));
            console.log(`[M+] Added the MAM-to-StoryGraph buttons!`);
        });
        this.getRatioProtectLevels = () => __awaiter(this, void 0, void 0, function* () {
            let l1 = parseFloat(GM_getValue('ratioProtectL1_val'));
            let l2 = parseFloat(GM_getValue('ratioProtectL2_val'));
            let l3 = parseFloat(GM_getValue('ratioProtectL3_val'));
            const l1_def = 0.5;
            const l2_def = 1;
            const l3_def = 2;
            // Default values if empty
            if (isNaN(l3))
                l3 = l3_def;
            if (isNaN(l2))
                l2 = l2_def;
            if (isNaN(l1))
                l1 = l1_def;
            // If someone put things in a dumb order, ignore smaller numbers
            if (l2 > l3)
                l2 = l3;
            if (l1 > l2)
                l1 = l2;
            // If custom numbers are smaller than default values, ignore the lower warning
            if (isNaN(l2))
                l2 = l3 < l2_def ? l3 : l2_def;
            if (isNaN(l1))
                l1 = l2 < l1_def ? l2 : l1_def;
            return [l1, l2, l3];
        });
    }
}
/// <reference path="shared.ts" />
/**
 * #BROWSE PAGE FEATURES
 */
/**
 * Allows Snatched torrents to be hidden/shown
 */
class ToggleSnatched {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'toggleSnatched',
            desc: `Add a button to hide/show results that you've snatched`,
        };
        this._tar = '#ssr';
        this._isVisible = true;
        this._snatchedHook = 'td div[class^="browse"]';
        this._share = new Shared();
        this._snatchedCount = 0;
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let toggle;
            let resultList;
            let results;
            const storedState = GM_getValue(`${this._settings.title}State`);
            if (storedState === 'false' && GM_getValue('stickySnatchedToggle') === true) {
                this._setVisState(false);
            }
            else {
                this._setVisState(true);
            }
            const toggleText = this._isVisible
                ? `Hide Snatched (0)`
                : `Show Snatched (0)`;
            // Queue building the button and getting the results
            yield Promise.all([
                (toggle = Util.createButtonElement('snatchedToggle', // ID
                toggleText, // Text
                '#resetNewIcon', // Target element
                {
                    type: 'h1',
                    relative: 'beforebegin',
                    btnClass: 'torFormButton' // CSS class
                })),
                (resultList = this._share.getSearchList()),
            ]);
            toggle
                .then((btn) => {
                btn.addEventListener('click', () => {
                    this._isVisible = !this._isVisible;
                    btn.innerHTML = this._isVisible
                        ? `Hide Snatched (${this._snatchedCount})`
                        : `Show Snatched (${this._snatchedCount})`;
                    this._filterResults(results, this._snatchedHook);
                }, false);
            })
                .catch((err) => {
                throw new Error(err);
            });
            resultList
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                results = res;
                this._searchList = res;
                this._filterResults(results, this._snatchedHook);
                console.log('[M+] Added the Toggle Snatched button!');
            }))
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    resultList = this._share.getSearchList();
                    resultList.then((res) => __awaiter(this, void 0, void 0, function* () {
                        results = res;
                        this._searchList = res;
                        this._filterResults(results, this._snatchedHook);
                    }));
                });
            });
        });
    }
    /**
     * Filters search results
     * @param list a search results list
     * @param subTar the elements that must be contained in our filtered results
     */
    _filterResults(list, subTar) {
        this._snatchedCount = 0; // Reset snatched count before filtering
        list.forEach((snatch) => {
            const btn = (document.querySelector('#mp_snatchedToggle'));
            // Select only the items that match our sub element
            const result = snatch.querySelector(subTar);
            if (result !== null) {
                this._snatchedCount++; // Increment snatched count
                // Hide/show as required
                if (this._isVisible === false) {
                    btn.innerHTML = `Show Snatched (${this._snatchedCount})`;
                    snatch.style.display = 'none';
                }
                else {
                    btn.innerHTML = `Hide Snatched (${this._snatchedCount})`;
                    snatch.style.display = 'table-row';
                }
            }
        });
        // Update button text with the current snatched count
        const toggleSwitch = (document.querySelector('#mp_snatchedToggle'));
        toggleSwitch.innerHTML = this._isVisible
            ? `Hide Snatched (${this._snatchedCount})`
            : `Show Snatched (${this._snatchedCount})`;
    }
    _setVisState(val) {
        if (MP.DEBUG) {
            console.log('Snatch vis state:', this._isVisible, '\nval:', val);
        }
        GM_setValue(`${this._settings.title}State`, `${val}`);
        this._isVisible = val;
    }
    get settings() {
        return this._settings;
    }
    get searchList() {
        if (this._searchList === undefined) {
            throw new Error('searchlist is undefined');
        }
        return this._searchList;
    }
    get visible() {
        return this._isVisible;
    }
    set visible(val) {
        this._setVisState(val);
    }
}
/**
 * Remembers the state of ToggleSnatched between page loads
 */
class StickySnatchedToggle {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'stickySnatchedToggle',
            desc: `Make toggle state persist between page loads`,
        };
        this._tar = '#ssr';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Remembered snatch visibility state!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Generate a plaintext list of search results
 */
class PlaintextSearch {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'plaintextSearch',
            desc: `Insert plaintext search results at top of page`,
        };
        this._tar = '#ssr h1';
        this._isOpen = GM_getValue(`${this._settings.title}State`);
        this._share = new Shared();
        this._plainText = '';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let toggleBtn;
            let copyBtn;
            let resultList;
            // Queue building the toggle button and getting the results
            yield Promise.all([
                (toggleBtn = Util.createButtonElement('plainToggle', // ID
                'Show Plaintext', // Text
                '#ssr', // Target element
                {
                    type: 'div',
                    relative: 'beforebegin',
                    btnClass: 'mp_toggle mp_plainBtn' // CSS classes
                })),
                (resultList = this._share.getSearchList()),
            ]);
            // Process the results into plaintext
            resultList
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                // Build the copy button
                copyBtn = yield Util.createButtonElement('plainCopy', // ID
                'Copy Plaintext', // Text
                '#mp_plainToggle', // Target element
                {
                    type: 'div',
                    relative: 'afterend',
                    btnClass: 'mp_copy mp_plainBtn' // CSS classes
                });
                // Build the plaintext box
                copyBtn.insertAdjacentHTML('afterend', `<br><textarea class='mp_plaintextSearch' style='display: none'></textarea>`);
                // Insert plaintext results
                this._plainText = yield this._processResults(res);
                document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                // Set up a click listener
                Util.clipboardifyBtn(copyBtn, this._plainText);
            }))
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    document.querySelector('.mp_plaintextSearch').innerHTML = '';
                    resultList = this._share.getSearchList();
                    resultList.then((res) => __awaiter(this, void 0, void 0, function* () {
                        // Insert plaintext results
                        this._plainText = yield this._processResults(res);
                        document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                    }));
                });
            });
            // Init open state
            this._setOpenState(this._isOpen);
            // Set up toggle button functionality
            toggleBtn
                .then((btn) => {
                btn.addEventListener('click', () => {
                    // Textbox should exist, but just in case...
                    const textbox = document.querySelector('.mp_plaintextSearch');
                    if (textbox === null) {
                        throw new Error(`textbox doesn't exist!`);
                    }
                    else if (this._isOpen === 'false') {
                        this._setOpenState('true');
                        textbox.style.display = 'block';
                        btn.innerText = 'Hide Plaintext';
                    }
                    else {
                        this._setOpenState('false');
                        textbox.style.display = 'none';
                        btn.innerText = 'Show Plaintext';
                    }
                }, false);
            })
                .catch((err) => {
                throw new Error(err);
            });
            console.log('[M+] Inserted plaintext search results!');
        });
    }
    /**
     * Sets Open State to true/false internally and in script storage
     * @param val stringified boolean
     */
    _setOpenState(val) {
        if (val === undefined) {
            val = 'false';
        } // Default value
        GM_setValue('toggleSnatchedState', val);
        this._isOpen = val;
    }
    _processResults(results) {
        return __awaiter(this, void 0, void 0, function* () {
            let outp = '';
            results.forEach((node) => {
                // Reset each text field
                let title = '';
                let seriesTitle = '';
                let authTitle = '';
                let narrTitle = '';
                // Break out the important data from each node
                const rawTitle = node.querySelector('.torTitle');
                const seriesList = node.querySelectorAll('.series');
                const authList = node.querySelectorAll('.author');
                const narrList = node.querySelectorAll('.narrator');
                if (rawTitle === null) {
                    console.warn('Error Node:', node);
                    throw new Error(`Result title should not be null`);
                }
                else {
                    title = rawTitle.textContent.trim();
                }
                // Process series
                if (seriesList !== null && seriesList.length > 0) {
                    seriesList.forEach((series) => {
                        seriesTitle += `${series.textContent} / `;
                    });
                    // Remove trailing slash from last series, then style
                    seriesTitle = seriesTitle.substring(0, seriesTitle.length - 3);
                    seriesTitle = ` (${seriesTitle})`;
                }
                // Process authors
                if (authList !== null && authList.length > 0) {
                    authTitle = 'BY ';
                    authList.forEach((auth) => {
                        authTitle += `${auth.textContent} AND `;
                    });
                    // Remove trailing AND
                    authTitle = authTitle.substring(0, authTitle.length - 5);
                }
                // Process narrators
                if (narrList !== null && narrList.length > 0) {
                    narrTitle = 'FT ';
                    narrList.forEach((narr) => {
                        narrTitle += `${narr.textContent} AND `;
                    });
                    // Remove trailing AND
                    narrTitle = narrTitle.substring(0, narrTitle.length - 5);
                }
                outp += `${title}${seriesTitle} ${authTitle} ${narrTitle}\n`;
            });
            return outp;
        });
    }
    get settings() {
        return this._settings;
    }
    get isOpen() {
        return this._isOpen;
    }
    set isOpen(val) {
        this._setOpenState(val);
    }
}
/**
 * Allows the search features to be hidden/shown
 */
class ToggleSearchbox {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'toggleSearchbox',
            desc: `Collapse the Search box and make it toggleable`,
        };
        this._tar = '#torSearchControl';
        this._height = '26px';
        this._isOpen = 'false';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const searchbox = document.querySelector(this._tar);
            if (searchbox) {
                // Adjust the title to make it clear it is a toggle button
                const title = searchbox.querySelector('.blockHeadCon h4');
                if (title) {
                    // Adjust text & style
                    title.innerHTML = 'Toggle Search';
                    title.style.cursor = 'pointer';
                    // Set up click listener
                    title.addEventListener('click', () => {
                        this._toggle(searchbox);
                    });
                }
                else {
                    console.error('Could not set up toggle! Target does not exist');
                }
                // Collapse the searchbox
                Util.setAttr(searchbox, {
                    style: `height:${this._height};overflow:hidden;`,
                });
                // Hide extra text
                const notification = document.querySelector('#mainBody > h3');
                const guideLink = document.querySelector('#mainBody > h3 ~ a');
                if (notification)
                    notification.style.display = 'none';
                if (guideLink)
                    guideLink.style.display = 'none';
                console.log('[M+] Collapsed the Search box!');
            }
            else {
                console.error('Could not collapse Search box! Target does not exist');
            }
        });
    }
    _toggle(elem) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isOpen === 'false') {
                elem.style.height = 'unset';
                this._isOpen = 'true';
            }
            else {
                elem.style.height = this._height;
                this._isOpen = 'false';
            }
            if (MP.DEBUG)
                console.log('Toggled Search box!');
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Generates linked tags from the site's plaintext tag field
 */
class BuildTags {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'buildTags',
            desc: `Generate clickable Tags automatically`,
        };
        this._tar = '#ssr';
        this._share = new Shared();
        /**
         * * Code to run for every search result
         * @param res A search result row
         */
        this._processTagString = (res) => {
            const tagline = res.querySelector('.torRowDesc');
            if (MP.DEBUG)
                console.group(tagline);
            // Assume brackets contain tags
            let tagString = tagline.innerHTML.replace(/(?:\[|\]|\(|\)|$)/gi, ',');
            // Remove HTML Entities and turn them into breaks
            tagString = tagString.split(/(?:&.{1,5};)/g).join(';');
            // Split tags at ',' and ';' and '>' and '|'
            let tags = tagString.split(/\s*(?:;|,|>|\||$)\s*/);
            // Remove empty or long tags
            tags = tags.filter((tag) => tag.length <= 30 && tag.length > 0);
            // Are tags already added? Only add if null
            const tagBox = res.querySelector('.mp_tags');
            if (tagBox === null) {
                this._injectLinks(tags, tagline);
            }
            if (MP.DEBUG) {
                console.log(tags);
                console.groupEnd();
            }
        };
        /**
         * * Injects the generated tags
         * @param tags Array of tags to add
         * @param tar The search result row that the tags will be added to
         */
        this._injectLinks = (tags, tar) => {
            if (tags.length > 0) {
                // Insert the new tag row
                const tagRow = document.createElement('span');
                tagRow.classList.add('mp_tags');
                tar.insertAdjacentElement('beforebegin', tagRow);
                tar.style.display = 'none';
                tagRow.insertAdjacentElement('afterend', document.createElement('br'));
                // Add the tags to the tag row
                tags.forEach((tag) => {
                    tagRow.innerHTML += `<a class='mp_tag' href='/tor/browse.php?tor%5Btext%5D=%22${encodeURIComponent(tag)}%22&tor%5BsrchIn%5D%5Btags%5D=true'>${tag}</a>`;
                });
            }
        };
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let resultsList = this._share.getSearchList();
            // Build the tags
            resultsList
                .then((results) => {
                results.forEach((r) => this._processTagString(r));
                console.log('[M+] Built tag links!');
            })
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    resultsList = this._share.getSearchList();
                    resultsList.then((results) => {
                        // Build the tags again
                        results.forEach((r) => this._processTagString(r));
                        console.log('[M+] Built tag links!');
                    });
                });
            });
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Random Book feature to open a new tab/window with a random MAM Book
 */
class RandomBook {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'randomBook',
            desc: `Add a button to open a randomly selected book page. (<em>Uses the currently selected category in the dropdown</em>)`,
        };
        this._tar = '#ssr';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let rando;
            const randoText = 'Random Book';
            // Queue building the button and getting the results
            yield Promise.all([
                (rando = Util.createButtonElement('randomBook', // ID
                randoText, // Text
                '#resetNewIcon', // Target element
                {
                    type: 'h1',
                    relative: 'beforebegin',
                    btnClass: 'torFormButton' // CSS classes
                })),
            ]);
            rando
                .then((btn) => {
                btn.addEventListener('click', () => {
                    let countResult;
                    let categories = '';
                    //get the Category dropdown element
                    const catSelection = (document.getElementById('categoryPartial'));
                    //get the value currently selected in Category Dropdown
                    const catValue = catSelection.options[catSelection.selectedIndex].value;
                    //depending on category selected, create a category string for the JSON GET
                    switch (String(catValue)) {
                        case 'ALL':
                            categories = '';
                            break;
                        case 'defaults':
                            categories = '';
                            break;
                        case 'm13':
                            categories = '&tor[main_cat][]=13';
                            break;
                        case 'm14':
                            categories = '&tor[main_cat][]=14';
                            break;
                        case 'm15':
                            categories = '&tor[main_cat][]=15';
                            break;
                        case 'm16':
                            categories = '&tor[main_cat][]=16';
                            break;
                        default:
                            if (catValue.charAt(0) === 'c') {
                                categories = '&tor[cat][]=' + catValue.substring(1);
                            }
                    }
                    Promise.all([
                        (countResult = this._getRandomBookResults(categories)),
                    ]);
                    countResult
                        .then((getRandomResult) => {
                        //open new tab with the random book
                        window.open('https://www.myanonamouse.net/t/' + getRandomResult, '_blank');
                    })
                        .catch((err) => {
                        throw new Error(err);
                    });
                }, false);
                console.log('[M+] Added the Random Book button!');
            })
                .catch((err) => {
                throw new Error(err);
            });
        });
    }
    /**
     * Filters search results
     * @param cat a string containing the categories needed for JSON Get
     */
    _getRandomBookResults(cat) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let jsonResult;
                //URL to GET random search results
                const url = `https://www.myanonamouse.net/tor/js/loadSearchJSONbasic.php?tor[searchType]=all&tor[searchIn]=torrents${cat}&tor[perpage]=5&tor[browseFlagsHideVsShow]=0&tor[startDate]=&tor[endDate]=&tor[hash]=&tor[sortType]=random&thumbnail=true?${Util.randomNumber(1, 100000)}`;
                Promise.all([(jsonResult = Util.getJSON(url))]).then(() => {
                    jsonResult
                        .then((jsonFull) => {
                        //return the first torrent ID of the random JSON text
                        resolve(JSON.parse(jsonFull).data[0].id);
                    })
                        .catch((err) => {
                        throw new Error(err);
                    });
                });
            });
        });
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/// <reference path="../util.ts" />
/**
 * * Allows gifting of FL wedge to members through forum.
 */
class ForumFLGift {
    constructor() {
        this._settings = {
            type: 'checkbox',
            scope: SettingGroup.Forum,
            title: 'forumFLGift',
            desc: `Add a Thank button to forum posts. (<em>Sends a FL wedge</em>)`,
        };
        this._tar = '.forumLink';
        Util.startFeature(this._settings, this._tar, ['forum thread']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Enabling Forum Gift Button...');
            //mainBody is best element with an ID I could find that is a parent to all forum posts
            const mainBody = document.querySelector('#mainBody');
            //make array of forum posts - there is only one cursor classed object per forum post, so this was best to key off of. wish there were more IDs and such used in forums
            const forumPosts = Array.prototype.slice.call(mainBody.getElementsByClassName('coltable'));
            //for each post on the page
            forumPosts.forEach((forumPost) => {
                //work our way down the structure of the HTML to get to our post
                let bottomRow = forumPost.childNodes[1];
                bottomRow = bottomRow.childNodes[4];
                bottomRow = bottomRow.childNodes[3];
                //get the ID of the forum from the custom MAM attribute
                let postID = forumPost.previousSibling.getAttribute('name');
                //mam decided to have a different structure for last forum. wish they just had IDs or something instead of all this jumping around
                if (postID === 'last') {
                    postID = (forumPost.previousSibling.previousSibling).getAttribute('name');
                }
                //create a new element for our feature
                const giftElement = document.createElement('a');
                //set same class as other objects in area for same pointer and formatting options
                giftElement.setAttribute('class', 'cursor');
                //give our element an ID for future selection as needed
                giftElement.setAttribute('id', 'mp_' + postID + '_text');
                //create new img element to lead our new feature visuals
                const giftIconGif = document.createElement('img');
                //use site freeleech gif icon for our feature
                giftIconGif.setAttribute('src', 'https://cdn.myanonamouse.net/imagebucket/108303/thank.gif');
                //make the gif icon the first child of element
                giftElement.appendChild(giftIconGif);
                //add the feature element in line with the cursor object which is the quote and report buttons at bottom
                bottomRow.appendChild(giftElement);
                //make it a button via click listener
                giftElement.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                    //to avoid button triggering more than once per page load, check if already have json result
                    if (giftElement.childNodes.length <= 1) {
                        //due to lack of IDs and conflicting query selectable elements, need to jump up a few parent levels
                        const postParentNode = giftElement.parentElement.parentElement
                            .parentElement;
                        //once at parent node of the post, find the poster's user id
                        const userElem = postParentNode.querySelector(`a[href^="/u/"]`);
                        //get the URL of the post to add to message
                        const postURL = (postParentNode.querySelector(`a[href^="/f/t/"]`)).getAttribute('href');
                        //get the name of the current MAM user sending gift
                        let sender = document.getElementById('userMenu').innerText;
                        //clean up text of sender obj
                        sender = sender.substring(0, sender.indexOf(' '));
                        //get the title of the page so we can write in message
                        let forumTitle = document.title;
                        //cut down fluff from page title
                        forumTitle = forumTitle.substring(22, forumTitle.indexOf('|') - 1);
                        //get the members name for JSON string
                        const userName = userElem.innerText;
                        //URL to GET a gift result
                        let url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=sendWedge&giftTo=${userName}&message=${sender} wants to thank you for your contribution to the forum topic [url=https://myanonamouse.net${postURL}]${forumTitle}[/url]`;
                        //make # URI compatible
                        url = url.replace('#', '%23');
                        //use MAM+ json get utility to process URL and return results
                        const jsonResult = yield Util.getJSON(url);
                        if (MP.DEBUG)
                            console.log('Gift Result', jsonResult);
                        //if gift was successfully sent
                        if (JSON.parse(jsonResult).success) {
                            //add the feature text to show success
                            giftElement.appendChild(document.createTextNode('FL Gift Successful!'));
                            //based on failure, add feature text to show failure reason or generic
                        }
                        else if (JSON.parse(jsonResult).error ===
                            'You can only send a user one wedge per day.') {
                            giftElement.appendChild(document.createTextNode('Failed: Already Gifted This User Today!'));
                        }
                        else if (JSON.parse(jsonResult).error ===
                            'Invalid user, this user is not currently accepting wedges') {
                            giftElement.appendChild(document.createTextNode('Failed: This User Does Not Accept Gifts!'));
                        }
                        else {
                            //only known example of this 'other' is when gifting yourself
                            giftElement.appendChild(document.createTextNode('FL Gift Failed!'));
                        }
                    }
                }), false);
            });
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ### Adds ability to gift newest 30 members to MAM on Homepage or open their user pages
 */
class GiftNewest {
    constructor() {
        /* TODO: Refactor code to reduce duplication. */
        this._settings = {
            scope: SettingGroup.Home,
            type: 'checkbox',
            title: 'giftNewest',
            desc: `Add buttons to Gift/Open all newest members`,
        };
        this._tar = '#mainTable';
        Util.startFeature(this._settings, this._tar, ['home', 'new users']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    /**
     * * Decide which page to run on
     */
    _init() {
        Check.page().then((page) => {
            if (MP.DEBUG)
                console.log('User gifting init on', page);
            if (page === 'home') {
                this._homePageGifting();
            }
            else if (page === 'new users') {
                this._newUsersPageGifting();
            }
        });
    }
    /**
     * * Function that runs on the Home page
     */
    _homePageGifting() {
        return __awaiter(this, void 0, void 0, function* () {
            this._trimGiftList();
            // Wait for the container to render to avoid the empty array race condition
            yield Check.elemLoad('#newestMembers');
            // Helper to sync visual state with persistent history
            const syncState = () => {
                const container = document.querySelector('#newestMembers');
                if (!container)
                    return;
                const historyStr = String(GM_getValue('mp_lastNewGifted') || '');
                const history = historyStr.split(',');
                const members = Array.from(container.getElementsByTagName('a'));
                members.forEach((member) => {
                    const id = Util.endOfHref(member);
                    member.setAttribute('class', `mp_refPoint_${id}`);
                    // Exact match checking and gold color override
                    if (history.includes(id) && !member.classList.contains('mp_gifted')) {
                        member.classList.add('mp_gifted');
                        const span = member.querySelector('span');
                        if (span)
                            span.style.color = 'rgb(187, 170, 119)';
                    }
                });
            };
            // Run initial sync
            syncState();
            // Watch for MAM's native AJAX refresh button
            Check.elemObserver('#newestMembers', syncState);
            //get the default value of gifts set in preferences for user page
            let giftValueSetting = String(GM_getValue('userGiftDefault_val') || '100');
            //make sure the value falls within the acceptable range
            if (Number(giftValueSetting) > 100 || isNaN(Number(giftValueSetting))) {
                giftValueSetting = '100';
            }
            else if (Number(giftValueSetting) < 5) {
                giftValueSetting = '5';
            }
            // Hijack the block footer for UI controls
            const footerWrapper = document.querySelector('#fpNM .blockFoot');
            footerWrapper.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 6px; padding: 2px 0; min-height: 32px; white-space: nowrap;';
            //create the text input for how many points to give
            const giftAmounts = document.createElement('input');
            Util.setAttr(giftAmounts, {
                type: 'text',
                size: '3',
                id: 'mp_giftAmounts',
                title: 'Value between 5 and 100',
                value: giftValueSetting,
            });
            // Vertical alignment fix for input
            giftAmounts.style.height = '22px';
            giftAmounts.style.boxSizing = 'border-box';
            // append input to footer
            footerWrapper.appendChild(giftAmounts);
            // Standard DOM Button Generation (Bypasses missing Util properties on older branches)
            const giftAllBtn = document.createElement('button');
            giftAllBtn.id = 'mp_giftAll';
            giftAllBtn.className = 'mp_btn';
            giftAllBtn.innerText = 'Gift All';
            giftAmounts.insertAdjacentElement('beforebegin', giftAllBtn);
            // Vertical alignment fix for button
            giftAllBtn.style.height = '22px';
            giftAllBtn.style.display = 'inline-flex';
            giftAllBtn.style.alignItems = 'center';
            giftAllBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                // DYNAMIC FETCH: Get fresh container in case it was refreshed
                const container = document.querySelector('#newestMembers');
                if (!container)
                    return;
                syncState();
                const members = Array.from(container.getElementsByTagName('a'));
                const statusMsg = document.getElementById('mp_giftAllMsg');
                const giftFinalAmount = document.getElementById('mp_giftAmounts').value;
                let firstCall = true;
                for (const member of members) {
                    if (!member.classList.contains('mp_gifted')) {
                        statusMsg.innerText = 'Sending...';
                        const userName = member.innerText.trim();
                        const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftFinalAmount}&giftTo=${userName}`;
                        if (firstCall) {
                            firstCall = false;
                        }
                        else {
                            yield Util.sleep(3000);
                        }
                        const jsonResult = yield Util.getJSON(url);
                        if (MP.DEBUG)
                            console.log('Gift Result', jsonResult);
                        const res = JSON.parse(jsonResult);
                        // "Adopt" if success OR if they are already maxed out for the day
                        if (res.success || (res.error && res.error.includes('daily cap'))) {
                            member.classList.add('mp_gifted');
                            const span = member.querySelector('span');
                            if (span)
                                span.style.color = 'rgb(187, 170, 119)';
                            const id = Util.endOfHref(member);
                            const h = String(GM_getValue('mp_lastNewGifted') || '');
                            GM_setValue('mp_lastNewGifted', id + (h ? ',' + h : ''));
                        }
                        else {
                            console.warn(res.error);
                        }
                    }
                }
                giftAllBtn.disabled = true;
                statusMsg.innerText = 'Done!';
            }), false);
            //listen for changes to the input box and ensure its between 5 and 1000, if not disable button
            document.getElementById('mp_giftAmounts').addEventListener('input', () => {
                const valueToNumber = (document.getElementById('mp_giftAmounts')).value;
                const giftAll = document.getElementById('mp_giftAll');
                if (Number(valueToNumber) > 1000 ||
                    Number(valueToNumber) < 5 ||
                    isNaN(Number(valueToNumber))) {
                    giftAll.disabled = true;
                    giftAll.setAttribute('title', 'Disabled');
                }
                else {
                    giftAll.disabled = false;
                    giftAll.setAttribute('title', `Gift All ${valueToNumber}`);
                }
            });
            // Standard DOM Button Generation
            const openAllBtn = document.createElement('button');
            openAllBtn.id = 'mp_openTabs';
            openAllBtn.className = 'mp_btn';
            openAllBtn.innerText = 'Open Ungifted';
            giftAmounts.insertAdjacentElement('afterend', openAllBtn);
            // Vertical alignment fix for button
            openAllBtn.style.height = '22px';
            openAllBtn.style.display = 'inline-flex';
            openAllBtn.style.alignItems = 'center';
            openAllBtn.setAttribute('title', 'Open new tab for each');
            openAllBtn.addEventListener('click', () => {
                const container = document.querySelector('#newestMembers');
                if (container) {
                    const members = Array.from(container.getElementsByTagName('a'));
                    for (const member of members) {
                        if (!member.classList.contains('mp_gifted')) {
                            window.open(member.href, '_blank');
                        }
                    }
                }
            }, false);
            //get the current amount of bonus points available to spend
            let bonusPointsAvail = document.getElementById('tmBP').innerText;
            //clean up string for just the points
            bonusPointsAvail = bonusPointsAvail.includes(':') ? bonusPointsAvail.split(':')[1] : bonusPointsAvail;
            bonusPointsAvail = bonusPointsAvail.includes('(') ? bonusPointsAvail.split('(')[0] : bonusPointsAvail;
            //recreate the bonus points in new span and insert into footer
            const messageSpan = document.createElement('span');
            messageSpan.setAttribute('id', 'mp_giftAllMsg');
            messageSpan.style.lineHeight = '1';
            messageSpan.style.display = 'inline-flex';
            messageSpan.style.alignItems = 'center';
            messageSpan.innerText = 'BP: ' + bonusPointsAvail.trim();
            footerWrapper.appendChild(messageSpan);
            console.log(`[M+] Adding gift new members button to Home page...`);
        });
    }
    /**
     * * Function that runs on the New Users page
     */
    _newUsersPageGifting() {
        return __awaiter(this, void 0, void 0, function* () {
            this._trimGiftList();
            const fpNM = document.querySelector('.blockCon');
            const footer = document.querySelector('.blockFoot');
            const memberLabels = Array.from(fpNM.querySelectorAll('label'));
            // Use includes() for exact matching and add fallback for undefined
            const historyStr = String(GM_getValue('mp_lastNewGifted') || '');
            const history = historyStr.split(',');
            memberLabels.forEach((label) => {
                const member = label.querySelector('a');
                const id = Util.endOfHref(member);
                const memberRef = `mp_refPoint_${id}`;
                member.classList.add(memberRef);
                if (history.includes(id)) {
                    member.innerText += ' ✅';
                    member.classList.add('mp_gifted');
                }
            });
            let giftValueSetting = GM_getValue('userGiftDefault_val') || '100';
            giftValueSetting = Math.min(100, Math.max(5, Number(giftValueSetting))) || 100;
            const giftAmounts = document.createElement('input');
            Util.setAttr(giftAmounts, {
                type: 'text',
                size: '3',
                id: 'mp_giftAmounts',
                title: 'Value between 5 and 100',
                value: String(giftValueSetting),
            });
            let bpText = document.createElement('span');
            bpText.innerText = 'points ';
            const giftAllBtn = document.createElement('button');
            giftAllBtn.id = 'mp_giftAll';
            giftAllBtn.className = 'mp_btn';
            giftAllBtn.innerText = 'Gift All Selected';
            giftAllBtn.style.marginRight = '5px';
            giftAllBtn.style.marginTop = '5px';
            giftAllBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                document.getElementById('mp_giftAllMsg').innerText = 'Sending Gifts... Please Wait';
                let firstCall = true;
                const giftAmount = document.getElementById('mp_giftAmounts').value;
                for (const label of memberLabels) {
                    const member = label.querySelector('a');
                    const checkbox = label.querySelector('input[type="checkbox"]');
                    if (checkbox.checked && !member.classList.contains('mp_gifted')) {
                        // Strip the checkmark if it exists so we just send the name
                        const userName = member.innerText.replace(' ✅', '').trim();
                        const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftAmount}&giftTo=${userName}`;
                        if (!firstCall)
                            yield Util.sleep(3000);
                        firstCall = false;
                        const jsonResult = yield Util.getJSON(url);
                        if (MP.DEBUG)
                            console.log('Gift Result', jsonResult);
                        const res = JSON.parse(jsonResult);
                        // Apply the "daily cap" adoption fix here as well
                        if (res.success || (res.error && res.error.includes('daily cap'))) {
                            member.innerText += ' ✅';
                            member.classList.add('mp_gifted');
                            const id = Util.endOfHref(member);
                            const h = String(GM_getValue('mp_lastNewGifted') || '');
                            GM_setValue('mp_lastNewGifted', id + (h ? ',' + h : ''));
                        }
                        else {
                            console.warn(res.error);
                        }
                    }
                }
                giftAllBtn.disabled = true;
                document.getElementById('mp_giftAllMsg').innerText = 'Gifts completed to all Checked Users';
            }));
            giftAmounts.addEventListener('input', () => {
                const giftBtn = document.getElementById('mp_giftAll');
                const value = Number(giftAmounts.value);
                if (value < 5 || value > 100 || isNaN(value)) {
                    giftBtn.disabled = true;
                    giftBtn.title = 'Disabled';
                }
                else {
                    giftBtn.disabled = false;
                    giftBtn.title = `Gift All ${value}`;
                }
            });
            const openAllBtn = document.createElement('button');
            openAllBtn.id = 'mp_openTabs';
            openAllBtn.className = 'mp_btn';
            openAllBtn.innerText = 'Open Ungifted in Tabs';
            openAllBtn.title = 'Open a new tab for each ungifted member';
            openAllBtn.addEventListener('click', () => {
                for (const label of memberLabels) {
                    const member = label.querySelector('a');
                    const checkbox = label.querySelector('input[type="checkbox"]');
                    if (checkbox.checked && !member.classList.contains('mp_gifted')) {
                        window.open(member.href, '_blank');
                    }
                }
            });
            let bonusPointsAvail = document.getElementById('tmBP').innerText.split(':')[1];
            const messageSpan = document.createElement('span');
            messageSpan.id = 'mp_giftAllMsg';
            messageSpan.innerText = ` Available Points: ${bonusPointsAvail}`;
            const deselectBtn = document.createElement('button');
            deselectBtn.id = 'mp_deselectAll';
            deselectBtn.className = 'mp_btn';
            deselectBtn.innerText = 'Unselect all';
            deselectBtn.addEventListener('click', () => {
                const boxList = document.querySelectorAll('input[type=checkbox]');
                boxList.forEach((box) => {
                    box.checked = false;
                });
            });
            const selectUngiftedBtn = document.createElement('button');
            selectUngiftedBtn.id = 'mp_selectUngifted';
            selectUngiftedBtn.className = 'mp_btn';
            selectUngiftedBtn.innerText = 'Select 100 Ungifted';
            selectUngiftedBtn.title = 'Select the first 100 ungifted users';
            selectUngiftedBtn.addEventListener('click', () => {
                let count = 0;
                for (const label of memberLabels) {
                    const member = label.querySelector('a');
                    const checkbox = label.querySelector('input[type="checkbox"]');
                    if (!member.classList.contains('mp_gifted') && !checkbox.checked) {
                        checkbox.checked = true;
                        count++;
                        if (count >= 100)
                            break;
                    }
                }
                console.log(`[M+] Selected ${count} ungifted users.`);
            });
            footer.appendChild(selectUngiftedBtn);
            footer.appendChild(deselectBtn);
            footer.appendChild(giftAmounts);
            footer.appendChild(bpText);
            footer.appendChild(giftAllBtn);
            footer.appendChild(openAllBtn);
            footer.appendChild(messageSpan);
            console.log('[M+] Added gifting options to the footer of the page.');
        });
    }
    /**
     * * Trims the gifted list to last 500 names to avoid getting too large over time.
     */
    _trimGiftList() {
        const historyStr = String(GM_getValue('mp_lastNewGifted') || '');
        if (historyStr) {
            const giftNames = historyStr.split(',');
            let newGiftNames = '';
            if (giftNames.length > 500) {
                for (const giftName of giftNames) {
                    // Update bounds to use includes or strict indexing
                    if (giftNames.indexOf(giftName) <= 499) {
                        newGiftNames = newGiftNames + giftName + ',';
                        GM_setValue('mp_lastNewGifted', newGiftNames);
                    }
                    else {
                        break;
                    }
                }
            }
        }
        else {
            GM_setValue('mp_lastNewGifted', '');
        }
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ### Adds ability to hide news items on the page
 */
class HideNews {
    constructor() {
        this._settings = {
            scope: SettingGroup.Home,
            title: 'hideNews',
            type: 'checkbox',
            desc: 'Tidy the homepage and allow News to be hidden',
        };
        this._tar = '.mainPageNewsHead';
        this._valueTitle = `mp_${this._settings.title}_val`;
        this._icon = '\u274e';
        this._checkForSeen = () => __awaiter(this, void 0, void 0, function* () {
            const prevValue = GM_getValue(this._valueTitle);
            const news = this._getNewsItems();
            if (MP.DEBUG)
                console.log(this._valueTitle, ':\n', prevValue);
            if (prevValue && news) {
                // Use the icon to split out the known hidden messages
                const hiddenArray = prevValue.split(this._icon);
                /* If any of the hidden messages match a current message
                    remove the current message from the DOM */
                hiddenArray.forEach((hidden) => {
                    news.forEach((entry) => {
                        if (entry.textContent === hidden) {
                            entry.remove();
                        }
                    });
                });
                // If there are no current messages, hide the header
                if (!document.querySelector('.mainPageNewsSub')) {
                    this._adjustHeaderSize(this._tar, false);
                }
            }
            else {
                return;
            }
        });
        this._removeClock = () => {
            const clock = document.querySelector('#mainBody .fpTime');
            if (clock)
                clock.remove();
        };
        this._adjustHeaderSize = (selector, visible) => {
            const newsHeader = document.querySelector(selector);
            if (newsHeader) {
                if (visible === false) {
                    newsHeader.style.display = 'none';
                }
                else {
                    newsHeader.style.fontSize = '2em';
                }
            }
        };
        this._addHiderButton = () => {
            const news = this._getNewsItems();
            if (!news)
                return;
            // Loop over each news entry
            news.forEach((entry) => {
                // Create a button
                const xbutton = document.createElement('div');
                xbutton.textContent = this._icon;
                Util.setAttr(xbutton, {
                    style: 'display:inline-block;margin-right:0.7em;cursor:pointer;',
                    class: 'mp_clearBtn',
                });
                // Listen for clicks
                xbutton.addEventListener('click', () => {
                    // When clicked, append the content of the current news post to the
                    // list of remembered news items
                    const previousValue = GM_getValue(this._valueTitle)
                        ? GM_getValue(this._valueTitle)
                        : '';
                    if (MP.DEBUG)
                        console.log(`Hiding... ${previousValue}${entry.textContent}`);
                    GM_setValue(this._valueTitle, `${previousValue}${entry.textContent}`);
                    entry.remove();
                    // If there are no more news items, remove the header
                    const updatedNews = this._getNewsItems();
                    if (updatedNews && updatedNews.length < 1) {
                        this._adjustHeaderSize(this._tar, false);
                    }
                });
                // Add the button as the first child of the entry
                if (entry.firstChild)
                    entry.firstChild.before(xbutton);
            });
        };
        this._cleanValues = (num = 3) => {
            let value = GM_getValue(this._valueTitle);
            if (MP.DEBUG)
                console.log(`GM_getValue(${this._valueTitle})`, value);
            if (value) {
                // Return the last 3 stored items after splitting them at the icon
                value = Util.arrayToString(value.split(this._icon).slice(0 - num));
                // Store the new value
                GM_setValue(this._valueTitle, value);
            }
        };
        this._getNewsItems = () => {
            return document.querySelectorAll('div[class^="mainPageNews"]');
        };
        Util.startFeature(this._settings, this._tar, ['home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // NOTE: for development
            // GM_deleteValue(this._valueTitle);console.warn(`Value of ${this._valueTitle} will be deleted!`);
            this._removeClock();
            this._adjustHeaderSize(this._tar);
            yield this._checkForSeen();
            this._addHiderButton();
            // this._cleanValues(); // FIX: Not working as intended
            console.log('[M+] Cleaned up the home page!');
        });
    }
    // This must match the type selected for `this._settings`
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/**
 * # REQUEST PAGE FEATURES
 */
/**
 * * Hide requesters who are set to "hidden"
 */
class ToggleHiddenRequesters {
    constructor() {
        this._settings = {
            scope: SettingGroup.Requests,
            type: 'checkbox',
            title: 'toggleHiddenRequesters',
            desc: `Hide hidden requesters`,
        };
        this._tar = '#torRows';
        this._hide = true;
        this._hiddenCount = 0;
        Util.startFeature(this._settings, this._tar, ['request']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._addToggleSwitch();
            this._searchList = yield this._getRequestList();
            this._filterResults(this._searchList);
            Check.elemObserver(this._tar, () => __awaiter(this, void 0, void 0, function* () {
                this._searchList = yield this._getRequestList();
                this._filterResults(this._searchList);
            }));
        });
    }
    _addToggleSwitch() {
        // Make a new button and insert beside the Search button
        Util.createButtonElement('showHidden', 'Show Hidden (0)', // Initial count set to 0
        '#requestSearch .torrentSearch', { type: 'div', relative: 'afterend', btnClass: 'torFormButton' });
        // Select the new button and add a click listener
        const toggleSwitch = (document.querySelector('#mp_showHidden'));
        toggleSwitch.addEventListener('click', () => {
            const hiddenList = document.querySelectorAll('#torRows > .mp_hidden');
            this._hiddenCount = hiddenList.length; // Update hidden count
            if (this._hide) {
                this._hide = false;
                toggleSwitch.innerText = `Hide Hidden (${this._hiddenCount})`;
                hiddenList.forEach((item) => {
                    item.style.display = 'list-item';
                    item.style.opacity = '0.5';
                });
            }
            else {
                this._hide = true;
                toggleSwitch.innerText = `Show Hidden (${this._hiddenCount})`;
                hiddenList.forEach((item) => {
                    item.style.display = 'none';
                    item.style.opacity = '0';
                });
            }
        });
    }
    _getRequestList() {
        return new Promise((resolve, reject) => {
            // Wait for the requests to exist
            Check.elemLoad('#torRows .torRow .torRight').then(() => {
                // Grab all requests
                const reqList = document.querySelectorAll('#torRows .torRow');
                if (reqList === null || reqList === undefined) {
                    reject(`reqList is ${reqList}`);
                }
                else {
                    resolve(reqList);
                }
            });
        });
    }
    _filterResults(list) {
        this._hiddenCount = 0; // Reset hidden count before filtering
        list.forEach((request) => {
            const requester = request.querySelector('.torRight a');
            if (requester === null) {
                request.style.display = 'none';
                request.classList.add('mp_hidden');
                this._hiddenCount++; // Increment hidden count
            }
        });
        // Update button text with the initial hidden count
        const toggleSwitch = (document.querySelector('#mp_showHidden'));
        toggleSwitch.innerText = this._hide
            ? `Show Hidden (${this._hiddenCount})`
            : `Hide Hidden (${this._hiddenCount})`;
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Generate a plaintext list of request results
 */
class PlaintextRequest {
    constructor() {
        this._settings = {
            scope: SettingGroup.Requests,
            type: 'checkbox',
            title: 'plaintextRequest',
            desc: `Insert plaintext request results at top of request page`,
        };
        this._tar = '#ssr';
        this._isOpen = GM_getValue(`${this._settings.title}State`);
        this._plainText = '';
        this._getRequestList = () => {
            if (MP.DEBUG)
                console.log(`Shared.getSearchList( )`);
            return new Promise((resolve, reject) => {
                // Wait for the request results to exist
                Check.elemLoad('#torRows .torRow a').then(() => {
                    // Select all request results
                    const snatchList = (document.querySelectorAll('#torRows .torRow'));
                    if (snatchList === null || snatchList === undefined) {
                        reject(`snatchList is ${snatchList}`);
                    }
                    else {
                        resolve(snatchList);
                    }
                });
            });
        };
        Util.startFeature(this._settings, this._tar, ['request']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let toggleBtn;
            let copyBtn;
            let resultList;
            // Queue building the toggle button and getting the results
            yield Promise.all([
                (toggleBtn = Util.createButtonElement('plainToggle', // ID
                'Show Plaintext', // Text
                '#ssr', // Target element (selector)
                {
                    type: 'div',
                    relative: 'beforebegin',
                    btnClass: 'mp_toggle mp_plainBtn' // CSS classes
                })),
                (resultList = this._getRequestList()),
            ]);
            // Process the results into plaintext
            resultList
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                // Build the copy button
                copyBtn = yield Util.createButtonElement('plainCopy', // ID
                'Copy Plaintext', // Text
                '#mp_plainToggle', // Target element (selector)
                {
                    type: 'div',
                    relative: 'afterend',
                    btnClass: 'mp_copy mp_plainBtn' // CSS classes
                });
                // Build the plaintext box
                copyBtn.insertAdjacentHTML('afterend', `<br><textarea class='mp_plaintextSearch' style='display: none'></textarea>`);
                // Insert plaintext results
                this._plainText = yield this._processResults(res);
                document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                // Set up a click listener
                Util.clipboardifyBtn(copyBtn, this._plainText);
            }))
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    document.querySelector('.mp_plaintextSearch').innerHTML = '';
                    resultList = this._getRequestList();
                    resultList.then((res) => __awaiter(this, void 0, void 0, function* () {
                        // Insert plaintext results
                        this._plainText = yield this._processResults(res);
                        document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                    }));
                });
            });
            // Init open state
            this._setOpenState(this._isOpen);
            // Set up toggle button functionality
            toggleBtn
                .then((btn) => {
                btn.addEventListener('click', () => {
                    // Textbox should exist, but just in case...
                    const textbox = document.querySelector('.mp_plaintextSearch');
                    if (textbox === null) {
                        throw new Error(`textbox doesn't exist!`);
                    }
                    else if (this._isOpen === 'false') {
                        this._setOpenState('true');
                        textbox.style.display = 'block';
                        btn.innerText = 'Hide Plaintext';
                    }
                    else {
                        this._setOpenState('false');
                        textbox.style.display = 'none';
                        btn.innerText = 'Show Plaintext';
                    }
                }, false);
            })
                .catch((err) => {
                throw new Error(err);
            });
            console.log('[M+] Inserted plaintext request results!');
        });
    }
    /**
     * Sets Open State to true/false internally and in script storage
     * @param val stringified boolean
     */
    _setOpenState(val) {
        if (val === undefined) {
            val = 'false';
        } // Default value
        GM_setValue('toggleSnatchedState', val);
        this._isOpen = val;
    }
    _processResults(results) {
        return __awaiter(this, void 0, void 0, function* () {
            let outp = '';
            results.forEach((node) => {
                // Reset each text field
                let title = '';
                let seriesTitle = '';
                let authTitle = '';
                let narrTitle = '';
                // Break out the important data from each node
                const rawTitle = node.querySelector('.torTitle');
                const seriesList = node.querySelectorAll('.series');
                const authList = node.querySelectorAll('.author');
                const narrList = node.querySelectorAll('.narrator');
                if (rawTitle === null) {
                    console.warn('Error Node:', node);
                    throw new Error(`Result title should not be null`);
                }
                else {
                    title = rawTitle.textContent.trim();
                }
                // Process series
                if (seriesList !== null && seriesList.length > 0) {
                    seriesList.forEach((series) => {
                        seriesTitle += `${series.textContent} / `;
                    });
                    // Remove trailing slash from last series, then style
                    seriesTitle = seriesTitle.substring(0, seriesTitle.length - 3);
                    seriesTitle = ` (${seriesTitle})`;
                }
                // Process authors
                if (authList !== null && authList.length > 0) {
                    authTitle = 'BY ';
                    authList.forEach((auth) => {
                        authTitle += `${auth.textContent} AND `;
                    });
                    // Remove trailing AND
                    authTitle = authTitle.substring(0, authTitle.length - 5);
                }
                // Process narrators
                if (narrList !== null && narrList.length > 0) {
                    narrTitle = 'FT ';
                    narrList.forEach((narr) => {
                        narrTitle += `${narr.textContent} AND `;
                    });
                    // Remove trailing AND
                    narrTitle = narrTitle.substring(0, narrTitle.length - 5);
                }
                outp += `${title}${seriesTitle} ${authTitle} ${narrTitle}\n`;
            });
            return outp;
        });
    }
    get settings() {
        return this._settings;
    }
    get isOpen() {
        return this._isOpen;
    }
    set isOpen(val) {
        this._setOpenState(val);
    }
}
class GoodreadsButtonReq {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'goodreadsButtonReq',
            scope: SettingGroup.Requests,
            desc: 'Enable MAM-to-Goodreads buttons for requests',
        };
        this._tar = '#fillTorrent';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['request details']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Convert row structure into searchable object
            const reqRows = Util.rowsToObj(document.querySelectorAll('#torDetMainCon > div'));
            // Select the data points
            const bookData = reqRows['Title:'].querySelector('span');
            const authorData = reqRows['Author(s):'].querySelectorAll('a');
            const seriesData = reqRows['Series:']
                ? reqRows['Series:'].querySelectorAll('a')
                : null;
            const target = reqRows['Release Date'];
            // Generate buttons
            this._share.goodreadsButtons(bookData, authorData, seriesData, target);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Process & return information from the shoutbox
 */
class ProcessShouts {
    /**
     * Watch the shoutbox for changes, triggering actions for filtered shouts
     * @param tar The shoutbox element selector
     * @param names (Optional) List of usernames/IDs to filter for
     * @param usertype (Optional) What filter the names are for. Required if `names` is provided
     * @param mentionName (Optional) A specific username to style when mentioned
     */
    static watchShoutbox(tar, names, usertype, mentionName) {
        // Observe the shoutbox
        Check.elemObserver(tar, (mutList) => {
            // When the shoutbox updates, process the information
            mutList.forEach((mutRec) => {
                // Get the changed nodes
                mutRec.addedNodes.forEach((node) => {
                    var _a;
                    const nodeData = Util.nodeToElem(node);
                    // If the node is added by MAM+ for gift button, ignore
                    // Also ignore if the node is a date break
                    if (/^mp_/.test(nodeData.getAttribute('id')) ||
                        nodeData.classList.contains('dateBreak')) {
                        return;
                    }
                    // If we're looking for specific users...
                    if (mentionName && ((_a = nodeData.textContent) === null || _a === void 0 ? void 0 : _a.includes(`@${mentionName}`))) {
                        this.styleShout(node, 'mention');
                    }
                    // Only apply name filtering if names and usertype are defined
                    if (names && names.length > 0 && usertype) {
                        const userID = this.extractFromShout(node, 'a[href^="/u/"]', 'href');
                        const userName = this.extractFromShout(node, 'a > span', 'text');
                        // Apply styles if any of the names match
                        names.forEach((name) => {
                            if (`/u/${name}` === userID || Util.caselessStringMatch(name, userName)) {
                                this.styleShout(node, usertype);
                            }
                        });
                    }
                });
            });
        }, { childList: true });
    }
    /**
     * Watch the shoutbox for changes, triggering actions for filtered shouts
     * @param tar The shoutbox element selector
     * @param buttons Number to represent checkbox selections 1 = Reply, 2 = Reply With Quote
     * @param charLimit Number of characters to include in quote, , charLimit?:number - Currently unused
     */
    static watchShoutboxReply(tar, buttons) {
        if (MP.DEBUG)
            console.log('watchShoutboxReply(', tar, buttons, ')');
        const _getUID = (node) => this.extractFromShout(node, 'a[href^="/u/"]', 'href');
        const _getRawColor = (elem) => {
            if (elem.style.backgroundColor) {
                return elem.style.backgroundColor;
            }
            else if (elem.style.color) {
                return elem.style.color;
            }
            else {
                return null;
            }
        };
        const _getNameColor = (elem) => {
            if (elem) {
                const rawColor = _getRawColor(elem);
                if (rawColor) {
                    // Convert to hex
                    const rgb = Util.bracketContents(rawColor).split(',');
                    return Util.rgbToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]));
                }
                else {
                    return null;
                }
            }
            else {
                throw new Error(`Element is null!\n${elem}`);
            }
        };
        const _makeNameTag = (name, hex, uid) => {
            uid = uid.match(/\d+/g).join(''); // Get the UID, but only the digits
            hex = hex ? `;${hex}` : ''; // If there is a hex value, prepend `;`
            return `@[ulink=${uid}${hex}]${name}[/ulink]`;
        };
        // Get the reply box
        const replyBox = document.getElementById('shbox_text');
        // Observe the shoutbox
        Check.elemObserver(tar, (mutList) => {
            // When the shoutbox updates, process the information
            mutList.forEach((mutRec) => {
                // Get the changed nodes
                mutRec.addedNodes.forEach((node) => {
                    var _a;
                    const nodeData = Util.nodeToElem(node);
                    // If the node is added by MAM+ for gift button, ignore
                    // Also ignore if the node is a date break
                    if (/^mp_/.test(nodeData.getAttribute('id')) ||
                        nodeData.classList.contains('dateBreak')) {
                        return;
                    }
                    // Select the name information
                    const shoutName = nodeData.querySelector('a[href^="/u/"] span');
                    const userName = this.extractFromShout(node, 'a > span', 'text');
                    const userID = this.extractFromShout(node, 'a[href^="/u/"]', 'href');
                    // If buttons === 3, add UID next to the username
                    if (buttons === 3 && shoutName && userID) {
                        const uid = (_a = userID.match(/\d+/g)) === null || _a === void 0 ? void 0 : _a.join('');
                        if (uid && !shoutName.textContent.includes(`[${uid}]`)) {
                            shoutName.textContent += ` [${uid}]`;
                        }
                    }
                    // Fetch color information
                    const nameColor = _getNameColor(shoutName);
                    // Only create reply or quote buttons if buttons === 1 or buttons === 2
                    if (buttons === 1 || buttons === 2) {
                        const replyButton = document.createElement('span');
                        if (buttons === 1) {
                            replyButton.innerHTML = '<button>\u293a</button>';
                            replyButton.querySelector('button').addEventListener('click', () => {
                                if (replyBox.value === '') {
                                    replyBox.value = `${_makeNameTag(userName, nameColor, userID)}: `;
                                }
                                else {
                                    replyBox.value = `${replyBox.value} ${_makeNameTag(userName, nameColor, userID)} `;
                                }
                                replyBox.focus();
                            });
                        }
                        else if (buttons === 2) {
                            replyButton.innerHTML = '<button>\u293d</button>';
                            replyButton.querySelector('button').addEventListener('click', () => {
                                const text = this.quoteShout(node, 65);
                                if (text !== '') {
                                    replyBox.value = `${_makeNameTag(userName, nameColor, userID)}: \u201c[i]${text}[/i]\u201d `;
                                }
                                else {
                                    replyBox.value = `${_makeNameTag(userName, nameColor, userID)}: `;
                                }
                                replyBox.focus();
                            });
                        }
                        replyButton.setAttribute('class', 'mp_replyButton');
                        node.insertBefore(replyButton, node.childNodes[2]);
                    }
                });
            });
        }, { childList: true });
    }
    static quoteShout(shout, length) {
        const textArr = [];
        // Get number of reply buttons to remove from text
        const btnCount = shout.firstChild.parentElement.querySelectorAll('.mp_replyButton').length;
        // Get the text of all child nodes
        shout.childNodes.forEach((child) => {
            /* If the child is a node with children (ex. not plain text) check to see if
            the child is a link. If the link does NOT start with `/u/` (indicating a user)
            then change the link to the string `[Link]`.
            In all other cases, return the child text content. */
            if (child.childNodes.length > 0) {
                const childElem = Util.nodeToElem(child);
                if (!childElem.hasAttribute('href')) {
                    textArr.push(child.textContent);
                }
                else if (childElem.getAttribute('href').indexOf('/u/') < 0) {
                    textArr.push('[Link]');
                }
                else {
                    textArr.push(child.textContent);
                }
            }
            else {
                textArr.push(child.textContent);
            }
        });
        // Make a string, but toss out the first few nodes
        let nodeText = textArr.slice(3 + btnCount).join('');
        if (nodeText.indexOf(':') === 0) {
            nodeText = nodeText.substr(2);
        }
        // At this point we should have just the message text.
        // Remove any quotes that might be contained:
        nodeText = nodeText.replace(/\u{201c}(.*?)\u{201d}/gu, '');
        // Trim the text to a max length and add ... if shortened
        let trimmedText = Util.trimString(nodeText.trim(), length);
        if (trimmedText !== nodeText.trim()) {
            trimmedText += ' [\u2026]';
        }
        // Done!
        return trimmedText;
    }
    /**
     * Extract information from shouts
     * @param shout The node containing shout info
     * @param tar The element selector string
     * @param get The requested info (href or text)
     * @returns The string that was specified
     */
    static extractFromShout(shout, tar, get) {
        const nodeData = Util.nodeToElem(shout).classList.contains('dateBreak');
        if (shout !== null && !nodeData) {
            const shoutElem = Util.nodeToElem(shout).querySelector(tar);
            if (shoutElem !== null) {
                let extracted;
                if (get !== 'text') {
                    extracted = shoutElem.getAttribute(get);
                }
                else {
                    extracted = shoutElem.textContent;
                }
                if (extracted !== null) {
                    return extracted;
                }
                else {
                    throw new Error('Could not extract shout! Attribute was null');
                }
            }
            else {
                throw new Error('Could not extract shout! Element was null');
            }
        }
        else {
            throw new Error('Could not extract shout! Node was null');
        }
    }
    /**
     * Change the style of a shout based on filter lists
     * @param shout The node containing shout info
     * @param usertype The type of users that have been filtered
     */
    static styleShout(shout, usertype) {
        const shoutElem = Util.nodeToElem(shout);
        if (usertype === 'priority') {
            const customStyle = GM_getValue('priorityStyle_val');
            shoutElem.style.background = customStyle ? `hsla(${customStyle})` : 'hsla(0,0%,50%,0.3)';
        }
        else if (usertype === 'mute') {
            shoutElem.classList.add('mp_muted');
        }
        else if (usertype === 'mention') {
            // Apply styling for posts that mention your username
            const customStyle = GM_getValue('selfStyle_val');
            shoutElem.style.background = customStyle
                ? `hsla(${customStyle})`
                : 'hsla(266,75%,63%,0.25)';
            shoutElem.style.border = '1px solid hsla(266, 75%, 63%, 0.9)';
        }
    }
}
class PriorityUsers {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'textbox',
            title: 'priorityUsers',
            tag: 'Emphasize Users',
            placeholder: 'ex. system, 25420, 77618',
            desc: 'Emphasizes messages from the listed users in the shoutbox. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)',
        };
        this._tar = '.sbf div';
        this._priorityUsers = [];
        this._userType = 'priority';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const gmValue = GM_getValue(`${this.settings.title}_val`);
            if (gmValue !== undefined) {
                this._priorityUsers = yield Util.csvToArray(gmValue);
            }
            else {
                throw new Error('Userlist is not defined!');
            }
            ProcessShouts.watchShoutbox(this._tar, this._priorityUsers, this._userType);
            console.log(`[M+] Highlighting users in the shoutbox...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows a custom background to be applied to priority users
 */
class PriorityStyle {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'textbox',
            title: 'priorityStyle',
            tag: 'Emphasis Style',
            placeholder: 'default: 0, 0%, 50%, 0.3',
            desc: `Change the color/opacity of the highlighting rule for emphasized users' posts. (<em>This is formatted as Hue (0-360), Saturation (0-100%), Lightness (0-100%), Opacity (0-1)</em>)`,
        };
        this._tar = '.sbf div';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Setting custom highlight for priority users...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows a custom background to be applied to messages that mention your username
 */
class SelfStyle {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'textbox',
            title: 'selfStyle',
            tag: 'Self Emphasis',
            placeholder: 'default: 266, 75%, 63%, 0.25',
            desc: `Change the color/opacity of the highlighting rule for posts containing your username. (<em>This is formatted as Hue (0-360), Saturation (0-100%), Lightness (0-100%), Opacity (0-1)</em>)`,
        };
        this._tar = '.sbf div';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Setting custom highlight for posts containing your username...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows a custom background to be applied to desired muted users
 */
class MutedUsers {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'textbox',
            title: 'mutedUsers',
            tag: 'Mute users',
            placeholder: 'ex. 1234, gardenshade',
            desc: `Obscures messages from the listed users in the shoutbox until hovered. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)`,
        };
        this._tar = '.sbf div';
        this._mutedUsers = [];
        this._userType = 'mute';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const gmValue = GM_getValue(`${this.settings.title}_val`);
            if (gmValue !== undefined) {
                this._mutedUsers = yield Util.csvToArray(gmValue);
            }
            else {
                throw new Error('Userlist is not defined!');
            }
            ProcessShouts.watchShoutbox(this._tar, this._mutedUsers, this._userType);
            console.log(`[M+] Obscuring muted users...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows Gift button to be added to Shout Triple dot menu
 */
class GiftButton {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'giftButton',
            desc: `Places a Gift button in Shoutbox dot-menu`,
        };
        this._tar = '.sbf';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Initialized Gift Button.`);
            const sbfDiv = document.getElementById('sbf');
            const sbfDivChild = sbfDiv.firstChild;
            //add event listener for whenever something is clicked in the sbf div
            sbfDiv.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
                //pull the event target into an HTML Element
                const target = e.target;
                //add the Triple Dot Menu as an element
                const sbMenuElem = target.closest('.sb_menu');
                //find the message div
                const sbMenuParent = target.closest(`div`);
                //get the full text of the message div
                let giftMessage = sbMenuParent.innerText;
                //format message with standard text + message contents + server time of the message
                giftMessage =
                    `Sent on Shoutbox message: "` +
                        giftMessage.substring(giftMessage.indexOf(': ') + 2) +
                        `" at ` +
                        giftMessage.substring(0, 8);
                //if the target of the click is not the Triple Dot Menu OR
                //if menu is one of your own comments (only works for first 10 minutes of comment being sent)
                if (!target.closest('.sb_menu') ||
                    sbMenuElem.getAttribute('data-ee') === '1') {
                    return;
                }
                //get the Menu after it pops up
                console.log(`[M+] Adding Gift Button...`);
                const popupMenu = document.getElementById('sbMenuMain');
                do {
                    yield Util.sleep(5);
                } while (!popupMenu.hasChildNodes());
                //get the user details from the popup menu details
                const popupUser = Util.nodeToElem(popupMenu.childNodes[0]);
                //make username equal the data-uid, force not null
                const userName = popupUser.getAttribute('data-uid');
                //get the default value of gifts set in preferences for user page
                let giftValueSetting = GM_getValue('userGiftDefault_val');
                //if they did not set a value in preferences, set to 100
                if (!giftValueSetting) {
                    giftValueSetting = '100';
                }
                else if (Number(giftValueSetting) > 1000 ||
                    isNaN(Number(giftValueSetting))) {
                    giftValueSetting = '1000';
                }
                else if (Number(giftValueSetting) < 5) {
                    giftValueSetting = '5';
                }
                //create the HTML document that holds the button and value text
                const giftButton = document.createElement('span');
                giftButton.setAttribute('id', 'giftButton');
                //create the button element as well as a text element for value of gift. Populate with value from settings
                giftButton.innerHTML = `<button>🎁Gift: </button><span>&nbsp;</span><input type="text" size="3" id="mp_giftValue" title="Value between 5 and 1000" value="${giftValueSetting}">`;
                //add gift element with button and text to the menu
                popupMenu.childNodes[0].appendChild(giftButton);
                //add event listener for when gift button is clicked
                giftButton.querySelector('button').addEventListener('click', () => {
                    //pull whatever the final value of the text box equals
                    const giftFinalAmount = (document.getElementById('mp_giftValue')).value;
                    //begin setting up the GET request to MAM JSON
                    const giftHTTP = new XMLHttpRequest();
                    //URL to GET results with the amount entered by user plus the username found on the menu selected
                    //added message contents encoded to prevent unintended characters from breaking JSON URL
                    const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftFinalAmount}&giftTo=${userName}&message=${encodeURIComponent(giftMessage)}`;
                    giftHTTP.open('GET', url, true);
                    giftHTTP.setRequestHeader('Content-Type', 'application/json');
                    giftHTTP.onreadystatechange = function () {
                        if (giftHTTP.readyState === 4 && giftHTTP.status === 200) {
                            const json = JSON.parse(giftHTTP.responseText);
                            //create a new line in SB that shows gift was successful to acknowledge gift worked/failed
                            const newDiv = document.createElement('div');
                            newDiv.setAttribute('id', 'mp_giftStatusElem');
                            sbfDivChild.appendChild(newDiv);
                            //if the gift succeeded
                            if (json.success) {
                                const successMsg = document.createTextNode('Points Gift Successful: Value: ' + giftFinalAmount);
                                newDiv.appendChild(successMsg);
                                newDiv.classList.add('mp_success');
                            }
                            else {
                                const failedMsg = document.createTextNode('Points Gift Failed: Error: ' + json.error);
                                newDiv.appendChild(failedMsg);
                                newDiv.classList.add('mp_fail');
                            }
                            //after we add line in SB, scroll to bottom to show result
                            sbfDiv.scrollTop = sbfDiv.scrollHeight;
                        }
                        //after we add line in SB, scroll to bottom to show result
                        sbfDiv.scrollTop = sbfDiv.scrollHeight;
                    };
                    giftHTTP.send();
                    //return to main SB window after gift is clicked - these are two steps taken by MAM when clicking out of Menu
                    sbfDiv
                        .getElementsByClassName('sb_clicked_row')[0]
                        .removeAttribute('class');
                    document
                        .getElementById('sbMenuMain')
                        .setAttribute('class', 'sbBottom hideMe');
                });
                giftButton.querySelector('input').addEventListener('input', () => {
                    const valueToNumber = (document.getElementById('mp_giftValue')).value;
                    if (Number(valueToNumber) > 1000 ||
                        Number(valueToNumber) < 5 ||
                        isNaN(Number(valueToNumber))) {
                        giftButton.querySelector('button').disabled = true;
                    }
                    else {
                        giftButton.querySelector('button').disabled = false;
                    }
                });
                console.log(`[M+] Gift Button added!`);
            }));
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Style mentions of your username
 */
class StyleMention {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'styleMention',
            desc: `Style mentions of your username`,
        };
        this._tar = '.sbf div';
        this._mentionName = null; // Dynamically set mention name
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Extract username from DOM before initializing the shoutbox watcher
            this._mentionName = this._extractUsername();
            if (this._mentionName) {
                ProcessShouts.watchShoutbox(this._tar, undefined, undefined, this._mentionName);
            }
            else {
                console.warn("Could not find username for mention styling.");
            }
        });
    }
    _extractUsername() {
        var _a;
        // Select the anchor element by its id
        const userMenuElement = document.getElementById("userMenu");
        if (userMenuElement) {
            // Clone the element to manipulate without affecting the DOM
            const clone = userMenuElement.cloneNode(true);
            // Remove the <img> tag to isolate the username text
            const img = clone.querySelector('img');
            if (img) {
                clone.removeChild(img);
            }
            // Trim the "↓" and any extra whitespace and return the username
            return ((_a = clone.textContent) === null || _a === void 0 ? void 0 : _a.slice(0, -1).trim()) || null;
        }
        console.error("User menu element not found.");
        return null;
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows Reply button to be added to Shout
 */
class ReplySimple {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'replySimple',
            //tag: "Reply",
            desc: `Places a Reply button in Shoutbox: &#10554;`,
        };
        this._tar = '.sbf div';
        this._replySimple = 1;
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            ProcessShouts.watchShoutboxReply(this._tar, this._replySimple);
            console.log(`[M+] Adding Reply Button...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows Reply With Quote button to be added to Shout
 */
class ReplyQuote {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'replyQuote',
            //tag: "Reply With Quote",
            desc: `Places a Reply with Quote button in Shoutbox: &#10557;`,
        };
        this._tar = '.sbf div';
        this._replyQuote = 2;
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            ProcessShouts.watchShoutboxReply(this._tar, this._replyQuote);
            console.log(`[M+] Adding Reply with Quote Button...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * adds UID to Shout
 */
class AddUID {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'addUID',
            //tag: "Reply",
            desc: `Places the users UID next to the name`,
        };
        this._tar = '.sbf div';
        this._replySimple = 3;
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            ProcessShouts.watchShoutboxReply(this._tar, this._replySimple);
            console.log(`[M+] Adding UID Button...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Creates feature for building a library of quick shout items that can act as a copy/paste replacement.
 */
class QuickShout {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'quickShout',
            desc: `Create feature below shoutbox to store pre-set messages.`,
        };
        this._tar = '.sbf div';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Adding Quick Shout Buttons...`);
            //get the main shoutbox input field
            const replyBox = document.getElementById('shbox_text');
            //empty JSON was giving me issues, so decided to just make an intro for when the GM variable is empty
            let jsonList = JSON.parse(`{ "Intro":"Welcome to QuickShout MAM+er! Here you can create preset Shout messages for quick responses and knowledge sharing. 'Clear' clears the entry to start selection process over. 'Select' takes whatever QuickShout is in the TextArea and puts in your Shout response area. 'Save' will store the Selection Name and Text Area Combo for future use as a QuickShout, and has color indicators. Green = saved as-is. Yellow = QuickShout Name exists and is saved, but content does not match what is stored. Orange = no entry matching that name, not saved. 'Delete' will permanently remove that entry from your stored QuickShouts (button only shows when exists in storage). For new entries have your QuickShout Name typed in BEFORE you craft your text or risk it being overwritten by something that exists as you type it. Thanks for using MAM+!" }`);
            //get Shoutbox DIV
            const shoutBox = document.getElementById('fpShout');
            //get the footer where we will insert our feature
            const shoutFoot = shoutBox.querySelector('.blockFoot');
            //give it an ID and set the size
            shoutFoot.setAttribute('id', 'mp_blockFoot');
            shoutFoot.style.height = '2.5em';
            //create a new dive to hold our comboBox and buttons and set the style for formatting
            const comboBoxDiv = document.createElement('div');
            comboBoxDiv.style.float = 'left';
            comboBoxDiv.style.marginLeft = '1em';
            comboBoxDiv.style.marginBottom = '.5em';
            comboBoxDiv.style.marginTop = '.5em';
            //create the label text element and add the text and attributes for ID
            const comboBoxLabel = document.createElement('label');
            comboBoxLabel.setAttribute('for', 'quickShoutData');
            comboBoxLabel.innerText = 'Choose a QuickShout';
            comboBoxLabel.setAttribute('id', 'mp_comboBoxLabel');
            //create the input field to link to datalist and format style
            const comboBoxInput = document.createElement('input');
            comboBoxInput.style.marginLeft = '.5em';
            comboBoxInput.setAttribute('list', 'mp_comboBoxList');
            comboBoxInput.setAttribute('id', 'mp_comboBoxInput');
            //create a datalist to store our quickshouts
            const comboBoxList = document.createElement('datalist');
            comboBoxList.setAttribute('id', 'mp_comboBoxList');
            //if the GM variable exists
            if (GM_getValue('mp_quickShout')) {
                //overwrite jsonList variable with parsed data
                jsonList = JSON.parse(GM_getValue('mp_quickShout'));
                //for each key item
                Object.keys(jsonList).forEach((key) => {
                    //create a new Option element and add our data for display to user
                    const comboBoxOption = document.createElement('option');
                    comboBoxOption.value = key.replace(/ಠ/g, ' ');
                    comboBoxList.appendChild(comboBoxOption);
                });
                //if no GM variable
            }
            else {
                //create variable with out Intro data
                GM_setValue('mp_quickShout', JSON.stringify(jsonList));
                //for each key item
                // TODO: probably can get rid of the forEach and just do single execution since we know this is Intro only
                Object.keys(jsonList).forEach((key) => {
                    const comboBoxOption = document.createElement('option');
                    comboBoxOption.value = key.replace(/ಠ/g, ' ');
                    comboBoxList.appendChild(comboBoxOption);
                });
            }
            //append the above elements to our DIV for the combo box
            comboBoxDiv.appendChild(comboBoxLabel);
            comboBoxDiv.appendChild(comboBoxInput);
            comboBoxDiv.appendChild(comboBoxList);
            //create the clear button and add style
            const clearButton = document.createElement('button');
            clearButton.style.marginLeft = '1em';
            clearButton.innerHTML = 'Clear';
            //create delete button, add style, and then hide it for later use
            const deleteButton = document.createElement('button');
            deleteButton.style.marginLeft = '6em';
            deleteButton.style.display = 'none';
            deleteButton.style.backgroundColor = 'Red';
            deleteButton.innerHTML = 'DELETE';
            //create select button and style it
            const selectButton = document.createElement('button');
            selectButton.style.marginLeft = '1em';
            selectButton.innerHTML = '\u2191 Select';
            //create save button and style it
            const saveButton = document.createElement('button');
            saveButton.style.marginLeft = '1em';
            saveButton.innerHTML = 'Save';
            //add all 4 buttons to the comboBox DIV
            comboBoxDiv.appendChild(clearButton);
            comboBoxDiv.appendChild(selectButton);
            comboBoxDiv.appendChild(saveButton);
            comboBoxDiv.appendChild(deleteButton);
            //create our text area and style it, then hide it
            const quickShoutText = document.createElement('textarea');
            quickShoutText.style.height = '50%';
            quickShoutText.style.margin = '1em';
            quickShoutText.style.width = '97%';
            quickShoutText.id = 'mp_quickShoutText';
            quickShoutText.style.display = 'none';
            //executes when clicking select button
            selectButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //if there is something inside of the quickshout area
                if (quickShoutText.value) {
                    //put the text in the main site reply field and focus on it
                    replyBox.value = quickShoutText.value;
                    replyBox.focus();
                }
            }), false);
            //create a quickShout delete button
            deleteButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //if this is not the last quickShout
                if (Object.keys(jsonList).length > 1) {
                    //delete the entry from the JSON and update the GM variable with new json list
                    delete jsonList[comboBoxInput.value.replace(/ /g, 'ಠ')];
                    GM_setValue('mp_quickShout', JSON.stringify(jsonList));
                    //re-style the save button for new unsaved status
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //hide delete button now that its not a saved entry
                    deleteButton.style.display = 'none';
                    //delete the options from datalist to reset with newly created jsonList
                    comboBoxList.innerHTML = '';
                    //for each item in new jsonList
                    Object.keys(jsonList).forEach((key) => {
                        //new option element to add to list
                        const comboBoxOption = document.createElement('option');
                        //add the current key value to the element
                        comboBoxOption.value = key.replace(/ಠ/g, ' ');
                        //add element to the list
                        comboBoxList.appendChild(comboBoxOption);
                    });
                    //if the last item in the jsonlist
                }
                else {
                    //delete item from jsonList
                    delete jsonList[comboBoxInput.value.replace(/ಠ/g, 'ಠ')];
                    //delete entire variable so its not empty GM variable
                    GM_deleteValue('mp_quickShout');
                    //re-style the save button for new unsaved status
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //hide delete button now that its not a saved entry
                    deleteButton.style.display = 'none';
                }
                //create input event on input to force some updates and dispatch it
                const event = new Event('input');
                comboBoxInput.dispatchEvent(event);
            }), false);
            //create event on save button to save quickshout
            saveButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //if there is data in the key and value GUI fields, proceed
                if (quickShoutText.value && comboBoxInput.value) {
                    //was having issue with eval processing the .replace data so made a variable to intake it
                    const replacedText = comboBoxInput.value.replace(/ /g, 'ಠ');
                    //fun way to dynamically create statements - this takes whatever is in list field to create a key with that text and the value from the textarea
                    eval(`jsonList.` +
                        replacedText +
                        `= "` +
                        encodeURIComponent(quickShoutText.value) +
                        `";`);
                    //overwrite or create the GM variable with new jsonList
                    GM_setValue('mp_quickShout', JSON.stringify(jsonList));
                    //re-style save button to green now that its saved as-is
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //show delete button now that its a saved entry
                    deleteButton.style.display = '';
                    //delete existing datalist elements to rebuild with new jsonlist
                    comboBoxList.innerHTML = '';
                    //for each key in the jsonlist
                    Object.keys(jsonList).forEach((key) => {
                        //create new option element
                        const comboBoxOption = document.createElement('option');
                        //add key name to the option
                        comboBoxOption.value = key.replace(/ಠ/g, ' ');
                        //TODO: this may or may not be necessary, but was having issues with the unique symbol still randomly showing up after saves
                        comboBoxOption.value = comboBoxOption.value.replace(/ಠ/g, ' ');
                        //add to the list
                        // console.log(comboBoxOption);
                        comboBoxList.appendChild(comboBoxOption);
                    });
                }
            }), false);
            //add event for clear button to reset the datalist
            clearButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //clear the input field and textarea field
                comboBoxInput.value = '';
                quickShoutText.value = '';
                //create input event on input to force some updates and dispatch it
                const event = new Event('input');
                comboBoxInput.dispatchEvent(event);
            }), false);
            //Next two input functions are meat and potatoes of the logic for user functionality
            //whenever something is typed or changed whithin the input field
            comboBoxInput.addEventListener('input', () => __awaiter(this, void 0, void 0, function* () {
                //if input is blank
                if (!comboBoxInput.value) {
                    //if the textarea is also blank minimize real estate
                    if (!quickShoutText.value) {
                        //hide the text area
                        quickShoutText.style.display = 'none';
                        //shrink the footer
                        shoutFoot.style.height = '2.5em';
                        //re-style the save button to default
                        saveButton.style.backgroundColor = '';
                        saveButton.style.color = '';
                        //if something is still in the textarea we need to indicate that unsaved and unnamed data is there
                    }
                    else {
                        //style for unsaved and unnamed is organge save button
                        saveButton.style.backgroundColor = 'Orange';
                        saveButton.style.color = 'Black';
                    }
                    //either way, hide the delete button
                    deleteButton.style.display = 'none';
                }
                //if the input field has any text in it
                else {
                    const inputVal = comboBoxInput.value.replace(/ /g, 'ಠ');
                    //show the text area for input
                    quickShoutText.style.display = '';
                    //expand the footer to accomodate all feature aspects
                    shoutFoot.style.height = '11em';
                    //if what is in the input field is a saved entry key
                    if (jsonList[inputVal]) {
                        //this can be a sucky line of code because it can wipe out unsaved data, but i cannot think of better way
                        //replace the text area contents with what the value is in the matched pair
                        // quickShoutText.value = jsonList[JSON.parse(inputVal)];
                        quickShoutText.value = decodeURIComponent(jsonList[inputVal]);
                        //show the delete button since this is now exact match to saved entry
                        deleteButton.style.display = '';
                        //restyle save button to show its a saved combo
                        saveButton.style.backgroundColor = 'Green';
                        saveButton.style.color = '';
                        //if this is not a registered key name
                    }
                    else {
                        //restyle the save button to be an unsaved entry
                        saveButton.style.backgroundColor = 'Orange';
                        saveButton.style.color = 'Black';
                        //hide the delete button since this cannot be saved
                        deleteButton.style.display = 'none';
                    }
                }
            }), false);
            //whenever something is typed or deleted out of textarea
            quickShoutText.addEventListener('input', () => __awaiter(this, void 0, void 0, function* () {
                const inputVal = comboBoxInput.value.replace(/ /g, 'ಠ');
                //if the input field is blank
                if (!comboBoxInput.value) {
                    //restyle save button for unsaved and unnamed
                    saveButton.style.backgroundColor = 'Orange';
                    saveButton.style.color = 'Black';
                    //hide delete button
                    deleteButton.style.display = 'none';
                }
                //if input field has text in it
                else if (jsonList[inputVal] &&
                    quickShoutText.value !== decodeURIComponent(jsonList[inputVal])) {
                    //restyle save button as yellow for editted
                    saveButton.style.backgroundColor = 'Yellow';
                    saveButton.style.color = 'Black';
                    deleteButton.style.display = '';
                    //if the key is a match and the data is a match then we have a 100% saved entry and can put everything back to saved
                }
                else if (jsonList[inputVal] &&
                    quickShoutText.value === decodeURIComponent(jsonList[inputVal])) {
                    //restyle save button to green for saved
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    deleteButton.style.display = '';
                    //if the key is not found in the saved list, orange for unsaved and unnamed
                }
                else if (!jsonList[inputVal]) {
                    saveButton.style.backgroundColor = 'Orange';
                    saveButton.style.color = 'Black';
                    deleteButton.style.display = 'none';
                }
            }), false);
            //add the combobox and text area elements to the footer
            shoutFoot.appendChild(comboBoxDiv);
            shoutFoot.appendChild(quickShoutText);
        });
    }
    get settings() {
        return this._settings;
    }
}
class AddToLists {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'Add users to lists',
            desc: `Places add friend, block, mute, and emphasize buttons in Shoutbox dot-menu`,
        };
        this._tar = '.sbf';
        this._addUsers = [];
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Initialized Buttons.`);
            const sbfDiv = document.getElementById('sbf');
            // Add event listener for any click in the sbf div
            sbfDiv.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
                const target = e.target;
                const sbMenuElem = target.closest('.sb_menu');
                // Only proceed if the target is the triple dot menu in shoutbox
                if (!sbMenuElem)
                    return;
                // Get the Menu after it pops up
                console.log(`[M+] Attempting to Add Custom Buttons...`);
                const popupMenu = document.getElementById('sbMenuMain');
                do {
                    yield Util.sleep(5);
                } while (!popupMenu.hasChildNodes());
                //get the user details from the popup menu details
                const popupUser = Util.nodeToElem(popupMenu.childNodes[0]);
                if (!popupMenu || !popupUser) {
                    console.warn(`[M+] Popup menu or user element not found.`);
                    return;
                }
                const userName = popupUser.getAttribute('data-uid');
                if (!userName) {
                    console.warn(`[M+] User ID not found.`);
                    return;
                }
                do {
                    yield Util.sleep(5);
                } while (!(popupMenu === null || popupMenu === void 0 ? void 0 : popupMenu.hasChildNodes()));
                console.log(`[M+] Popup menu located, adding buttons...`);
                // Clear previous buttons to avoid duplicates
                popupMenu.querySelectorAll('.custom-button').forEach(button => button.remove());
                // Use the addButtonToSubMenu function to add each button with specific actions
                this._addButtonToSubMenu(popupMenu, "💖Add Friend", () => {
                    const addFriendUrl = `https://www.myanonamouse.net/friends.php?action=add&type=friend&targetid=${userName}`;
                    window.open(addFriendUrl, '_blank');
                });
                this._addButtonToSubMenu(popupMenu, "🚫Block", () => {
                    const blockUrl = `https://www.myanonamouse.net/friends.php?action=add&type=block&targetid=${userName}`;
                    window.open(blockUrl, '_blank');
                });
                /* TODO: Emphasize list is only loaded on page reload, fina a way to reload after list updated
                * Check if priorityUsers is true or not if not set it to true
                * */
                this._addButtonToSubMenu(popupMenu, "🔊Emphasize", () => {
                    this._add(userName, 'priority');
                    this._enablePriorityUsers();
                    if (MP.DEBUG)
                        console.log("Emphasize clicked");
                });
                /* Check if mutedUsers is true or not if not set it to true */
                this._addButtonToSubMenu(popupMenu, "🔇Mute", () => {
                    this._add(userName, 'muted');
                    this._enableMutedUsers();
                    if (MP.DEBUG)
                        console.log("Mute clicked");
                });
                console.log(`[M+] Custom buttons added successfully.`);
            }));
        });
    }
    _enablePriorityUsers() {
        const key = 'priorityUsers';
        // Retrieve the current value or default to false
        let currentValue = GM_getValue(key, false);
        // Check if the value is false
        if (!currentValue) {
            // Set the value to true
            GM_setValue(key, true);
            if (MP.DEBUG)
                console.log(`[UserManager] '${key}' was false and has been set to true.`);
        }
        else {
            if (MP.DEBUG)
                console.log(`[UserManager] '${key}' is already true.`);
        }
    }
    _enableMutedUsers() {
        const key = 'mutedUsers';
        let currentValue = GM_getValue(key, false);
        if (!currentValue) {
            GM_setValue(key, true);
            if (MP.DEBUG)
                console.log(`[UserManager] '${key}' was false and has been set to true.`);
        }
        else {
            if (MP.DEBUG)
                console.log(`[UserManager] '${key}' is already true.`);
        }
    }
    // Function to add a username to priorityUsers or mutedUsers if not already present and save it directly
    _add(userName, tar) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load the current list from storage, initialize as empty array if not yet created
            const gmValue = GM_getValue(`${tar}Users_val`);
            // Convert CSV to array if gmValue exists; otherwise, start with an empty array
            this._addUsers = gmValue ? yield Util.csvToArray(gmValue) : [];
            // Check if the user is already in _priorityUsers
            if (!this._addUsers.includes(userName)) {
                // Add the new user to the array
                this._addUsers.push(userName);
                // Convert the updated array to CSV format
                const updatedCsv = this._addUsers.join(',');
                // Save the CSV string back to storage to persist changes
                GM_setValue(`${tar}Users_val`, updatedCsv);
                console.log(`User ${userName} added to _priorityUsers and saved.`);
                this._addMessage(`Added to ${tar} list, reload required`);
            }
            else {
                console.log(`User ${userName} is already in the ${tar}Users list.`);
                // TODO: Remove user if they are already in the list, making the button into a toggle
                this._addMessage(`User already in ${tar} list`);
            }
        });
    }
    // Simple function to add a message to the shoutbox
    _addMessage(text) {
        // Locate the main shoutbox div
        const sbfDiv = document.getElementById('sbf');
        const sbfDivChild = sbfDiv.firstChild;
        if (sbfDiv) {
            // Create a new div for the message
            const messageDiv = document.createElement('div');
            messageDiv.setAttribute('id', 'mp_giftStatusElem');
            sbfDivChild.appendChild(messageDiv);
            // Create and append a text node with the provided message
            messageDiv.appendChild(document.createTextNode(text));
            messageDiv.classList.add('mp_success');
            // Scroll the shoutbox to the bottom to show the new message
            sbfDiv.scrollTop = sbfDiv.scrollHeight;
        }
        else {
            console.warn('[M+] Shoutbox div not found!');
        }
    }
    _addButtonToSubMenu(menu, label, onClick) {
        /* TODO: Generalise and move to util, make GiftButton use it. */
        const buttonContainer = document.createElement('span');
        buttonContainer.classList.add('custom-button'); // Class for easy debugging and removal if needed
        const button = document.createElement('button');
        button.innerText = label;
        // Set up button click event
        button.addEventListener('click', onClick);
        // Append elements to container
        buttonContainer.appendChild(button);
        buttonContainer.appendChild(document.createTextNode(' '));
        // Append buttonContainer to the first child of the menu or fallback to the menu itself
        (menu.childNodes[0] || menu).appendChild(buttonContainer);
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/// <reference path="../util.ts" />
/**
 * * Autofills the Gift box with a specified number of points.
 */
class TorGiftDefault {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'torGiftDefault',
            tag: 'Default Gift',
            placeholder: 'ex. 5000, max',
            desc: 'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
        };
        this._tar = '#thanksArea input[name=points]';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        new Shared()
            .fillGiftBox(this._tar, this._settings.title)
            .then((points) => console.log(`[M+] Set the default gift amount to ${points}`));
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Adds various links to Goodreads
 */
class GoodreadsButton {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'checkbox',
            title: 'goodreadsButton',
            desc: 'Enable the MAM-to-Goodreads buttons',
        };
        this._tar = '#submitInfo';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                }
                else {
                    console.log('[M+] Not a book category; skipping Goodreads buttons');
                }
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Select the data points
            const authorData = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const bookData = document.querySelector('#torDetMainCon .TorrentTitle');
            const seriesData = document.querySelectorAll('#Series a');
            const target = document.querySelector(this._tar);
            // Generate buttons
            this._share.goodreadsButtons(bookData, authorData, seriesData, target);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Adds various links to Audible
 */
class AudibleButton {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'checkbox',
            title: 'audibleButton',
            desc: 'Enable the MAM-to-Audible buttons',
        };
        this._tar = '#submitInfo';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                }
                else {
                    console.log('[M+] Not a book category; skipping Audible buttons');
                }
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Select the data points
            const authorData = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const bookData = document.querySelector('#torDetMainCon .TorrentTitle');
            const seriesData = document.querySelectorAll('#Series a');
            let target = document.querySelector(this._tar);
            if (document.querySelector('.mp_sgRow')) {
                target = document.querySelector('.mp_sgRow');
            }
            else if (document.querySelector('.mp_grRow')) {
                target = document.querySelector('.mp_grRow');
            }
            // Generate buttons
            this._share.audibleButtons(bookData, authorData, seriesData, target);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Adds various links to StoryGraph
 */
class StoryGraphButton {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'checkbox',
            title: 'storyGraphButton',
            desc: 'Enable the MAM-to-StoryGraph buttons',
        };
        this._tar = '#submitInfo';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                }
                else {
                    console.log('[M+] Not a book category; skipping StroyGraph buttons');
                }
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Select the data points
            const authorData = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const bookData = document.querySelector('#torDetMainCon .TorrentTitle');
            const seriesData = document.querySelectorAll('#Series a');
            let target = document.querySelector(this._tar);
            if (document.querySelector('.mp_grRow')) {
                target = document.querySelector('.mp_grRow');
            }
            // Generate buttons
            this._share.storyGraphButtons(bookData, authorData, seriesData, target);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Generates a field for "Currently Reading" bbcode
 */
class CurrentlyReading {
    constructor() {
        this._settings = {
            type: 'checkbox',
            scope: SettingGroup['Torrent Page'],
            title: 'currentlyReading',
            desc: `Add a button to generate a "Currently Reading" forum snippet`,
        };
        this._tar = '#torDetMainCon .TorrentTitle';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding Currently Reading section...');
            // Get the required information
            const title = document.querySelector('#torDetMainCon .TorrentTitle')
                .textContent;
            const authors = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const torID = window.location.pathname.split('/')[2];
            const rowTar = document.querySelector('#fInfo');
            // Title can't be null
            if (title === null) {
                throw new Error(`Title field was null`);
            }
            // Build a new table row
            const crRow = yield Util.addTorDetailsRow(rowTar, 'Currently Reading', 'mp_crRow');
            // Process data into string
            const blurb = yield this._generateSnippet(torID, title, authors);
            // Build button
            const btn = yield this._buildButton(crRow, blurb);
            // Init button
            Util.clipboardifyBtn(btn, blurb);
        });
    }
    /**
     * * Build a BB Code text snippet using the book info, then return it
     * @param id The string ID of the book
     * @param title The string title of the book
     * @param authors A node list of author links
     */
    _generateSnippet(id, title, authors) {
        /**
         * * Add Author Link
         * @param authorElem A link containing author information
         */
        const addAuthorLink = (authorElem) => {
            return `[url=${authorElem.href.replace('https://www.myanonamouse.net', '')}]${authorElem.textContent}[/url]`;
        };
        // Convert the NodeList into an Array which is easier to work with
        let authorArray = [];
        authors.forEach((authorElem) => authorArray.push(addAuthorLink(authorElem)));
        // Drop extra items
        if (authorArray.length > 3) {
            authorArray = [...authorArray.slice(0, 3), 'etc.'];
        }
        return `[url=/t/${id}]${title}[/url] by [i]${authorArray.join(', ')}[/i]`;
    }
    /**
     * * Build a button on the tor details page
     * @param tar Area where the button will be added into
     * @param content Content that will be added into the textarea
     */
    _buildButton(tar, content) {
        // Build text display
        tar.innerHTML = `<textarea rows="1" cols="80" style='margin-right:5px'>${content}</textarea>`;
        // Build button
        Util.createButtonElement('', 'Copy', tar, { url: 'none', order: 2, relative: 'afterbegin', btnClass: 'mp_button_clone' });
        document.querySelector('.mp_crRow .mp_button_clone').classList.add('mp_reading');
        // Return button
        return document.querySelector('.mp_reading');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Protects the user from ratio troubles by adding warnings and displaying ratio delta
 */
class RatioProtect {
    constructor() {
        this._settings = {
            type: 'checkbox',
            scope: SettingGroup['Torrent Page'],
            title: 'ratioProtect',
            desc: `Protect your ratio with warnings &amp; ratio calculations`,
        };
        this._tar = '#ratio';
        this._rcRow = 'mp_ratioCostRow';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Enabling ratio protection...');
            // TODO: Move this block to shared
            // The download text area
            const dlBtn = document.querySelector('#tddl');
            // The currently unused label area above the download text
            const dlLabel = document.querySelector('#download .torDetInnerTop');
            // Insertion target for messages
            const descBlock = yield Check.elemLoad('.torDetBottom');
            // Would become ratio
            const rNew = document.querySelector(this._tar);
            // Current ratio
            const rCur = document.querySelector('#tmR');
            // Seeding or downloading
            const seeding = document.querySelector('#DLhistory');
            // User has a ratio
            const userHasRatio = rCur.textContent.indexOf('Inf') < 0 ? true : false;
            // Get the custom ratio amounts (will return default values otherwise)
            const [r1, r2, r3] = yield this._share.getRatioProtectLevels();
            if (MP.DEBUG)
                console.log(`Ratio protection levels set to: ${r1}, ${r2}, ${r3}`);
            // Create the box we will display text in
            if (descBlock) {
                // Add line under Torrent: detail for Cost data "Cost to Restore Ratio"
                descBlock.insertAdjacentHTML('beforebegin', `<div class="torDetRow" id="mp_row"><div class="torDetLeft">Cost to Restore Ratio</div><div class="torDetRight ${this._rcRow}" style="flex-direction:column;align-items:flex-start;"><span id="mp_foobar"></span></div></div>`);
            }
            else {
                throw new Error(`'.torDetRow is ${descBlock}`);
            }
            // Only run the code if the ratio exists
            if (rNew && rCur && !seeding && userHasRatio) {
                const rDiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];
                if (MP.DEBUG)
                    console.log(`Current ${Util.extractFloat(rCur)[0]} | New ${Util.extractFloat(rNew)[0]} | Dif ${rDiff}`);
                // Only activate if a ratio change is expected
                if (!isNaN(rDiff) && rDiff > 0.009) {
                    if (dlLabel) {
                        dlLabel.innerHTML = `Ratio loss ${rDiff.toFixed(2)}`;
                        dlLabel.style.fontWeight = 'normal'; //To distinguish from BOLD Titles
                    }
                    // Calculate & Display cost of download w/o FL
                    // Always show calculations when there is a ratio loss
                    const sizeElem = document.querySelector('#size span');
                    if (sizeElem) {
                        const size = sizeElem.textContent.split(/\s+/);
                        const sizeMap = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
                        // Convert human readable size to bytes
                        const byteSized = Number(size[0]) * Math.pow(1024, sizeMap.indexOf(size[1]));
                        const recovery = byteSized * Util.extractFloat(rCur)[0];
                        const pointAmnt = Math.floor((125 * recovery) / 268435456).toLocaleString();
                        const dayAmount = Math.floor((5 * recovery) / 2147483648);
                        const wedgeStoreCost = Util.formatBytes((268435456 * 50000) / (Util.extractFloat(rCur)[0] * 125));
                        const wedgeVaultCost = Util.formatBytes((268435456 * 200) / (Util.extractFloat(rCur)[0] * 125));
                        // Update the ratio cost row
                        document.querySelector(`.${this._rcRow}`).innerHTML = `<span><b>${Util.formatBytes(recovery)}</b>&nbsp;upload (${pointAmnt} BP; or one FL wedge per day for ${dayAmount} days).&nbsp;<abbr title='Contributing 2,000 BP to each vault cycle gives you almost one FL wedge per day on average.' style='text-decoration:none;cursor:help;'>&#128712;</abbr></span>
                    <span>Wedge store price: <i>${wedgeStoreCost}</i>&nbsp;<abbr title='If you buy wedges from the store, this is how large a torrent must be to break even on the cost (50,000 BP) of a single wedge.' style='text-decoration:none;cursor:help;'>&#128712;</abbr></span>
                    <span>Wedge vault price: <i>${wedgeVaultCost}</i>&nbsp;<abbr title='If you contribute to the vault, this is how large a torrent must be to break even on the cost (200 BP) of 10 wedges for the maximum contribution of 2,000 BP.' style='text-decoration:none;cursor:help;'>&#128712;</abbr></span>`;
                    }
                    // Style the download button based on Ratio Protect level settings
                    if (dlBtn && dlLabel) {
                        // * This is the "trivial ratio loss" threshold
                        // These changes will always happen if the ratio conditions are met
                        if (rDiff > r1) {
                            this._setButtonState(dlBtn, '1_notify');
                        }
                        // * This is the "I never want to dl w/o FL" threshold
                        // This also uses the Minimum Ratio, if enabled
                        // This also prevents going below 2 ratio (PU requirement)
                        // TODO: Replace disable button with buy FL button
                        if (rDiff > r3 ||
                            Util.extractFloat(rNew)[0] < GM_getValue('ratioProtectMin_val') ||
                            Util.extractFloat(rNew)[0] < 2) {
                            this._setButtonState(dlBtn, '3_alert');
                            // * This is the "I need to think about using a FL" threshold
                        }
                        else if (rDiff > r2) {
                            this._setButtonState(dlBtn, '2_warn');
                        }
                    }
                }
                // If the user does not have a ratio, display a short message
            }
            else if (!userHasRatio) {
                this._setButtonState(dlBtn, '1_notify');
                document.querySelector(`.${this._rcRow}`).innerHTML = `<span>Ratio points and cost to restore ratio will appear here after your ratio is a real number.</span>`;
            }
        });
    }
    _setButtonState(tar, state, label) {
        if (state === '1_notify') {
            tar.style.backgroundColor = 'SpringGreen';
            tar.style.color = 'black';
            tar.innerHTML = 'Download?';
        }
        else if (state === '2_warn') {
            tar.style.backgroundColor = 'Orange';
            tar.innerHTML = 'Suggest FL';
        }
        else if (state === '3_alert') {
            if (!label) {
                console.warn(`No label provided in _setButtonState()!`);
            }
            tar.style.backgroundColor = 'Red';
            tar.style.cursor = 'no-drop';
            tar.innerHTML = 'FL Needed';
            label.style.fontWeight = 'bold';
        }
        else {
            throw new Error(`State "${state}" does not exist.`);
        }
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Low ratio protection amount
 */
class RatioProtectL1 {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'ratioProtectL1',
            tag: 'Ratio Warn L1',
            placeholder: 'default: 0.5',
            desc: `Set the smallest threshhold to indicate ratio changes. (<em>This is a slight color change</em>).`,
        };
        this._tar = '#download';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Enabled custom Ratio Protection L1!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Medium ratio protection amount
 */
class RatioProtectL2 {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'ratioProtectL2',
            tag: 'Ratio Warn L2',
            placeholder: 'default: 1',
            desc: `Set the median threshhold to warn of ratio changes. (<em>This is a noticeable color change</em>).`,
        };
        this._tar = '#download';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Enabled custom Ratio Protection L2!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * High ratio protection amount
 */
class RatioProtectL3 {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'ratioProtectL3',
            tag: 'Ratio Warn L3',
            placeholder: 'default: 2',
            desc: `Set the highest threshhold to prevent ratio changes. (<em>This disables download without FL use</em>).`,
        };
        this._tar = '#download';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Enabled custom Ratio Protection L3!');
    }
    get settings() {
        return this._settings;
    }
}
class RatioProtectMin {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'textbox',
            title: 'ratioProtectMin',
            scope: SettingGroup['Torrent Page'],
            tag: 'Minimum Ratio',
            placeholder: 'ex. 100',
            desc: 'Trigger Ratio Warn L3 if your ratio would drop below this number.',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#download';
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Enabled custom Ratio Protection minimum!');
        });
    }
    get settings() {
        return this._settings;
    }
}
class RatioProtectIcons {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'ratioProtectIcons',
            scope: SettingGroup['Torrent Page'],
            desc: 'Enable custom browser favicons based on Ratio Protect conditions?',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#ratio';
        this._userID = 164109;
        this._share = new Shared();
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Enabling custom Ratio Protect favicons from user ${this._userID}...`);
            // Get the custom ratio amounts (will return default values otherwise)
            const [r1, r2, r3] = yield this._share.getRatioProtectLevels();
            // Would become ratio
            const rNew = document.querySelector(this._tar);
            // Current ratio
            const rCur = document.querySelector('#tmR');
            // Difference between new and old ratio
            const rDiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];
            // Seeding or downloading
            const seeding = document.querySelector('#DLhistory');
            // VIP status
            const vipstat = document.querySelector('#ratio .torDetInnerBottomSpan')
                ? document.querySelector('#ratio .torDetInnerBottomSpan').textContent
                : null;
            // Bookclub status
            const bookclub = document.querySelector("div[id='bcfl'] span");
            // Find favicon links and load a simple default.
            const siteFavicons = document.querySelectorAll("link[rel$='icon']");
            if (siteFavicons)
                this._buildIconLinks(siteFavicons, 'tm_32x32');
            // Test if VIP
            if (vipstat) {
                if (MP.DEBUG)
                    console.log(`VIP = ${vipstat}`);
                if (vipstat.search('VIP expires') > -1) {
                    this._buildIconLinks(siteFavicons, 'mouseclock');
                    document.title = document.title.replace(' | My Anonamouse', ` | Expires ${vipstat.substring(26)}`);
                }
                else if (vipstat.search('VIP not set to expire') > -1) {
                    this._buildIconLinks(siteFavicons, '0cir');
                    document.title = document.title.replace(' | My Anonamouse', ' | Not set to expire');
                }
                else if (vipstat.search('This torrent is freeleech!') > -1) {
                    this._buildIconLinks(siteFavicons, 'mouseclock');
                    // Test if bookclub
                    if (bookclub && bookclub.textContent.search('Bookclub Freeleech') > -1) {
                        document.title = document.title.replace(' | My Anonamouse', ` | Club expires ${bookclub.textContent.substring(25)}`);
                    }
                    else {
                        document.title = document.title.replace(' | My Anonamouse', " | 'till next Site FL"
                        // TODO: Calculate when FL ends
                        // ` | 'till ${this._nextFLDate()}`
                        );
                    }
                }
            }
            // Test if seeding/downloading
            if (seeding) {
                this._buildIconLinks(siteFavicons, '13egg');
                // * Similar icons: 13seed8, 13seed7, 13egg, 13, 13cir, 13WhiteCir
            }
            else if (vipstat.search('This torrent is personal freeleech') > -1) {
                this._buildIconLinks(siteFavicons, '5');
            }
            // Test if there will be ratio loss
            if (rNew && rCur && !seeding) {
                // Change icon based on Ratio Protect states
                if (rDiff > r3 ||
                    Util.extractFloat(rNew)[0] < GM_getValue('ratioProtectMin_val') ||
                    Util.extractFloat(rNew)[0] < 2) {
                    this._buildIconLinks(siteFavicons, '12');
                }
                else if (rDiff > r2) {
                    this._buildIconLinks(siteFavicons, '3Qmouse');
                    // Also try Orange, OrangeRed, Gold, or 14
                }
                else if (rDiff > r1) {
                    this._buildIconLinks(siteFavicons, 'SpringGreen');
                }
                // Check if future VIP
                if (vipstat.search('On list for next FL pick') > -1) {
                    this._buildIconLinks(siteFavicons, 'MirrorGreenClock'); // Also try greenclock
                    document.title = document.title.replace(' | My Anonamouse', ' | Next FL pick');
                }
            }
            console.log('[M+] Custom Ratio Protect favicons enabled!');
        });
    }
    // TODO: Function for calculating when FL ends
    // ? How are we able to determine when the current FL period started?
    /* private async _nextFLDate() {
        const d = new Date('Jun 14, 2022 00:00:00 UTC'); // seed date over two weeks ago
        const now = new Date(); //Place test dates here like Date("Jul 14, 2022 00:00:00 UTC")
        let mssince = now.getTime() - d.getTime(); //time since FL start seed date
        let dayssince = mssince / 86400000;
        let q = Math.floor(dayssince / 14); // FL periods since seed date

        const addDays = (date, days) => {
            const current = new Date(date);
            return current.setDate(current.getDate() + days);
        };

        return d
            .addDays(q * 14 + 14)
            .toISOString()
            .substr(0, 10);
    } */
    _buildIconLinks(elems, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            elems.forEach((elem) => {
                elem.href = `https://cdn.myanonamouse.net/imagebucket/${this._userID}/${filename}.png`;
            });
        });
    }
    get settings() {
        return this._settings;
    }
    set userID(newID) {
        this._userID = newID;
    }
}
// TODO: Add feature to set RatioProtectIcon's `_userID` value. Only necessary once other icon sets exist.
/// <reference path="../util.ts" />
/**
 * #UPLOAD PAGE FEATURES
 */
/**
 * Allows easier checking for duplicate uploads
 */
class SearchForDuplicates {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'searchForDuplicates',
            scope: SettingGroup['Upload Page'],
            desc: 'Easier searching for duplicates when uploading content',
        };
        this._tar = '#uploadForm input[type="submit"]';
        Util.startFeature(this._settings, this._tar, ['upload']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const parentElement = document.querySelector('#mainBody');
            if (parentElement) {
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given title',
                    type: 'title',
                    inputSelector: 'input[name="tor[title]"]',
                    rowPosition: 7,
                    useWildcard: true,
                });
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given author(s)',
                    type: 'author',
                    inputSelector: 'input.ac_author',
                    rowPosition: 10,
                });
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given series',
                    type: 'series',
                    inputSelector: 'input.ac_series',
                    rowPosition: 11,
                });
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given narrator(s)',
                    type: 'narrator',
                    inputSelector: 'input.ac_narrator',
                    rowPosition: 12,
                });
            }
            console.log(`[M+] Adding search to uploads!`);
        });
    }
    _generateSearch({ parentElement, title, type, inputSelector, rowPosition, useWildcard = false, }) {
        var _a;
        const searchElement = document.createElement('a');
        Util.setAttr(searchElement, {
            target: '_blank',
            style: 'text-decoration: none; cursor: pointer;',
            title,
        });
        searchElement.textContent = ' 🔍';
        const linkBase = `/tor/browse.php?tor%5BsearchType%5D=all&tor%5BsearchIn%5D=torrents&tor%5Bcat%5D%5B%5D=0&tor%5BbrowseFlagsHideVsShow%5D=0&tor%5BsortType%5D=dateDesc&tor%5BsrchIn%5D%5B${type}%5D=true&tor%5Btext%5D=`;
        (_a = parentElement
            .querySelector(`#uploadForm > tbody > tr:nth-child(${rowPosition}) > td:nth-child(1)`)) === null || _a === void 0 ? void 0 : _a.insertAdjacentElement('beforeend', searchElement);
        searchElement.addEventListener('click', (event) => {
            const inputs = parentElement.querySelectorAll(inputSelector);
            if (inputs && inputs.length) {
                const inputsList = [];
                inputs.forEach((input) => {
                    if (input.value) {
                        inputsList.push(input.value);
                    }
                });
                const query = inputsList.join(' ').trim();
                if (query) {
                    const searchString = useWildcard
                        ? `*${encodeURIComponent(inputsList.join(' '))}*`
                        : encodeURIComponent(inputsList.join(' '));
                    searchElement.setAttribute('href', linkBase + searchString);
                }
                else {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            else {
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/// <reference path="../util.ts" />
/**
 * # USER PAGE FEATURES
 */
/**
 * #### Default User Gift Amount
 */
class UserGiftDefault {
    constructor() {
        this._settings = {
            scope: SettingGroup['User Pages'],
            type: 'textbox',
            title: 'userGiftDefault',
            tag: 'Default Gift',
            placeholder: 'ex. 1000, max',
            desc: 'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
        };
        this._tar = '#bonusgift';
        Util.startFeature(this._settings, this._tar, ['user']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        new Shared()
            .fillGiftBox(this._tar, this._settings.title)
            .then((points) => console.log(`[M+] Set the default gift amount to ${points}`));
    }
    get settings() {
        return this._settings;
    }
}
/**
 * #### User Gift History
 */
class UserGiftHistory {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'userGiftHistory',
            scope: SettingGroup['User Pages'],
            desc: 'Display gift history between you and another user',
        };
        this._sendSymbol = `<span style='color:orange' title='sent'>\u27F0</span>`;
        this._getSymbol = `<span style='color:teal' title='received'>\u27F1</span>`;
        this._tar = 'tbody';
        Util.startFeature(this._settings, this._tar, ['user']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Initiallizing user gift history...');
            // Name of the other user
            const otherUser = document.querySelector('#mainBody > h1').textContent.trim();
            // Create the gift history row
            const historyContainer = document.createElement('tr');
            const insert = document.querySelector('#mainBody tbody tr:last-of-type');
            if (insert)
                insert.insertAdjacentElement('beforebegin', historyContainer);
            // Create the gift history title field
            const historyTitle = document.createElement('td');
            historyTitle.classList.add('rowhead');
            historyTitle.textContent = 'Gift history';
            historyContainer.appendChild(historyTitle);
            // Create the gift history content field
            const historyBox = document.createElement('td');
            historyBox.classList.add('row1');
            historyBox.textContent = `You have not exchanged gifts with ${otherUser}.`;
            historyBox.align = 'left';
            historyContainer.appendChild(historyBox);
            // Get the User ID
            const userID = window.location.pathname.split('/').pop();
            const currentUserID = Util.getCurrentUserID();
            // TODO: use `cdn.` instead of `www.`; currently causes a 403 error
            if (userID) {
                if (userID === currentUserID) {
                    historyTitle.textContent = 'Recent Gift History';
                    return this._historyWithAll(historyBox);
                }
                return this._historyWithUserID(userID, historyBox);
            }
            else {
                throw new Error(`User ID not found: ${userID}`);
            }
        });
    }
    /**
     * #### Fill out history box
     * @param userID the user to get history from
     * @param historyBox the box to put it in
     */
    _historyWithUserID(userID, historyBox) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the gift history
            const giftHistory = yield Util.getUserGiftHistory(userID);
            // Only display a list if there is a history
            if (giftHistory.length) {
                // Determine Point & FL total values
                const [pointsIn, pointsOut] = this._sumGifts(giftHistory, 'giftPoints');
                const [wedgeIn, wedgeOut] = this._sumGifts(giftHistory, 'giftWedge');
                if (MP.DEBUG) {
                    console.log(`Points In/Out: ${pointsIn}/${pointsOut}`);
                    console.log(`Wedges In/Out: ${wedgeIn}/${wedgeOut}`);
                }
                const otherUser = giftHistory[0].other_name;
                // Generate a message
                historyBox.innerHTML = `You have sent ${this._sendSymbol} <strong>${pointsOut} points</strong> &amp; <strong>${wedgeOut} FL wedges</strong> to ${otherUser} and received ${this._getSymbol} <strong>${pointsIn} points</strong> &amp; <strong>${wedgeIn} FL wedges</strong>.<hr>`;
                // Add the message to the box
                historyBox.appendChild(this._showGifts(giftHistory));
                console.log('[M+] User gift history added!');
            }
            else {
                console.log(`[M+] No user gift history found with ${userID}.`);
            }
        });
    }
    /**
     * #### Fill out history box
     * @param historyBox the box to put it in
     */
    _historyWithAll(historyBox) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the gift history
            const giftHistory = yield Util.getAllUserGiftHistory();
            // Only display a list if there is a history
            if (giftHistory.length) {
                // Determine Point & FL total values
                const [pointsIn, pointsOut] = this._sumGifts(giftHistory, 'giftPoints');
                const [wedgeIn, wedgeOut] = this._sumGifts(giftHistory, 'giftWedge');
                if (MP.DEBUG) {
                    console.log(`Points In/Out: ${pointsIn}/${pointsOut}`);
                    console.log(`Wedges In/Out: ${wedgeIn}/${wedgeOut}`);
                }
                // Generate a message
                historyBox.innerHTML = `You have sent ${this._sendSymbol} <strong>${pointsOut} points</strong> &amp; <strong>${wedgeOut} FL wedges</strong> and received ${this._getSymbol} <strong>${pointsIn} points</strong> &amp; <strong>${wedgeIn} FL wedges</strong>.<hr>`;
                // Add the message to the box
                historyBox.appendChild(this._showGifts(giftHistory));
                console.log('[M+] User gift history added!');
            }
            else {
                console.log(`[M+] No user gift history found for current user.`);
            }
        });
    }
    /**
     * #### Sum the values of a given gift type as Inflow & Outflow sums
     * @param history the user gift history
     * @param type points or wedges
     */
    _sumGifts(history, type) {
        const outflow = [0];
        const inflow = [0];
        // Only retrieve amounts of a specified gift type
        history.map((gift) => {
            if (gift.type === type) {
                // Split into Inflow/Outflow
                if (gift.amount > 0) {
                    inflow.push(gift.amount);
                }
                else {
                    outflow.push(gift.amount);
                }
            }
        });
        // Sum all items in the filtered array
        const sumOut = outflow.reduce((accumulate, current) => accumulate + current);
        const sumIn = inflow.reduce((accumulate, current) => accumulate + current);
        return [sumIn, Math.abs(sumOut)];
    }
    /**
     * #### Creates a list of the most recent gifts
     * @param history The full gift history between two users
     */
    _showGifts(history) {
        // If the gift was a wedge, return custom text
        const _wedgeOrPoints = (gift) => {
            if (gift.type === 'giftPoints') {
                return `${Math.abs(gift.amount)}`;
            }
            else if (gift.type === 'giftWedge') {
                return '(FL)';
            }
            else {
                return `Error: unknown gift type... ${gift.type}: ${gift.amount}`;
            }
        };
        // Generate a list for the history
        const historyList = document.createElement('ul');
        Object.assign(historyList.style, {
            listStyle: 'none',
            padding: 'initial',
            height: '10em',
            overflow: 'auto',
        });
        // Loop over history items and add to an array
        const gifts = history
            .filter((gift) => gift.type === 'giftPoints' || gift.type === 'giftWedge')
            .map((gift) => {
            // Add some styling depending on pos/neg numbers
            let fancyGiftAmount = '';
            let fromTo = '';
            if (gift.amount > 0) {
                fancyGiftAmount = `${this._getSymbol} ${_wedgeOrPoints(gift)}`;
                fromTo = 'from';
            }
            else {
                fancyGiftAmount = `${this._sendSymbol} ${_wedgeOrPoints(gift)}`;
                fromTo = 'to';
            }
            // Make the date readable
            const date = Util.prettySiteTime(gift.timestamp, true);
            return `<li class='mp_giftItem'>${date} you ${fancyGiftAmount} ${fromTo} <a href='/u/${gift.other_userid}'>${gift.other_name}</a></li>`;
        });
        // Add history items to the list
        historyList.innerHTML = gifts.join('');
        return historyList;
    }
    get settings() {
        return this._settings;
    }
}
/**
 * VAULT FEATURES
 */
class SimpleVault {
    constructor() {
        this._settings = {
            scope: SettingGroup.Vault,
            type: 'checkbox',
            title: 'simpleVault',
            desc: 'Simplify the Vault pages. (<em>This removes everything except the donate button &amp; list of recent donations</em>)',
        };
        this._tar = '#mainBody';
        Util.startFeature(this._settings, this._tar, ['vault']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const subPage = GM_getValue('mp_currentPage');
            const page = document.querySelector(this._tar);
            console.group(`Applying Vault (${subPage}) settings...`);
            // Clone the important parts and reset the page
            const donateBtn = page.querySelector('form');
            const donateTbl = page.querySelector('table:last-of-type');
            page.innerHTML = '';
            // Add the donate button if it exists
            if (donateBtn !== null) {
                const newDonate = donateBtn.cloneNode(true);
                page.appendChild(newDonate);
                newDonate.classList.add('mp_vaultClone');
            }
            else {
                page.innerHTML = '<h1>Come back tomorrow!</h1>';
            }
            // Add the donate table if it exists
            if (donateTbl !== null) {
                const newTable = (donateTbl.cloneNode(true));
                page.appendChild(newTable);
                newTable.classList.add('mp_vaultClone');
            }
            else {
                page.style.paddingBottom = '25px';
            }
            console.log('[M+] Simplified the vault page!');
        });
    }
    get settings() {
        return this._settings;
    }
}
class PotHistory {
    constructor() {
        this._settings = {
            scope: SettingGroup.Vault,
            type: 'checkbox',
            title: 'potHistory',
            desc: 'Add the list of recent donations to the donation page.',
        };
        this._tar = '#mainBody';
        Util.startFeature(this._settings, this._tar, ['vault']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const subPage = GM_getValue('mp_currentPage');
            const form = (document.querySelector(this._tar + ' form[method="post"]'));
            if (!form) {
                return;
            }
            const potPageResp = yield fetch('/millionaires/pot.php');
            if (!potPageResp.ok) {
                console.group(`failed to get /millionaires/pot.php: ${potPageResp.status}/${potPageResp.statusText}`);
                return;
            }
            console.group(`Applying Vault (${subPage}) settings...`);
            const potPageText = yield potPageResp.text();
            const parser = new DOMParser();
            const potPage = parser.parseFromString(potPageText, 'text/html');
            // Clone the important parts and reset the page
            const donateTbl = potPage.querySelector('#mainTable table:last-of-type');
            // Add the donate table if it exists
            if (donateTbl !== null && form !== null) {
                const newTable = (donateTbl.cloneNode(true));
                (_a = form.parentElement) === null || _a === void 0 ? void 0 : _a.appendChild(newTable);
                newTable.classList.add('mp_vaultClone');
            }
            console.log('[M+] Added the donation history to the donation page!');
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ===========================
 * PLACE ALL M+ FEATURES HERE
 * ===========================
 *
 * Nearly all features belong here, as they should have internal checks
 * for DOM elements as needed. Only core features should be placed in `app.ts`
 *
 * This determines the order in which settings will be generated on the Settings page.
 * Settings will be grouped by type and Features of one type that are called before
 * other Features of the same type will appear first.
 *
 * The order of the feature groups is not determined here.
 */
class InitFeatures {
    constructor() {
        // Initialize Global functions
        new HideHome();
        new HideSeedbox();
        new HideDonationBox();
        new BlurredHeader();
        new VaultLink();
        new MiniVaultInfo();
        new BonusPointDelta();
        new FixedNav();
        // Initialize Home Page functions
        new HideNews();
        new GiftNewest();
        // Initialize Search Page functions
        new ToggleSnatched();
        new StickySnatchedToggle();
        new PlaintextSearch();
        new ToggleSearchbox();
        new BuildTags();
        new RandomBook();
        // Initialize Request Page functions
        new GoodreadsButtonReq();
        new ToggleHiddenRequesters();
        new PlaintextRequest();
        // Initialize Torrent Page functions
        new GoodreadsButton();
        new StoryGraphButton();
        new AudibleButton();
        new CurrentlyReading();
        new TorGiftDefault();
        new RatioProtect();
        new RatioProtectIcons();
        new RatioProtectL1();
        new RatioProtectL2();
        new RatioProtectL3();
        new RatioProtectMin();
        // Initialize Shoutbox functions
        new PriorityUsers();
        new PriorityStyle();
        new SelfStyle();
        new MutedUsers();
        // new ReplySimple();
        // new ReplyQuote(); /* TODO: Remove these functions completely */
        new GiftButton();
        new QuickShout();
        new AddUID();
        new AddToLists();
        new StyleMention();
        // Initialize Vault functions
        new SimpleVault();
        new PotHistory();
        // Initialize User Page functions
        new UserGiftDefault();
        new UserGiftHistory();
        // Initialize Forum Page functions
        new ForumFLGift();
        // Initialize Upload Page functions
        new SearchForDuplicates();
    }
}
/// <reference path="check.ts" />
/// <reference path="util.ts" />
/// <reference path="./modules/core.ts" />
/**
 * Class for handling settings and the Preferences page
 * @method init: turns features' settings info into a useable table
 */
class Settings {
    // Function for gathering the needed scopes
    static _getScopes(settings) {
        if (MP.DEBUG) {
            console.log('_getScopes(', settings, ')');
        }
        return new Promise((resolve) => {
            const scopeList = {};
            for (const setting of settings) {
                const index = Number(setting.scope);
                // If the Scope exists, push the settings into the array
                if (scopeList[index]) {
                    scopeList[index].push(setting);
                    // Otherwise, create the array
                }
                else {
                    scopeList[index] = [setting];
                }
            }
            resolve(scopeList);
        });
    }
    // Function for constructing the table from an object
    static _buildTable(page) {
        if (MP.DEBUG)
            console.log('_buildTable(', page, ')');
        return new Promise((resolve) => {
            let outp = `<tbody><tr><td class="row1" colspan="2"><br><strong>MAM+ v${MP.VERSION}</strong> - Here you can enable &amp; disable any feature from the <a href="/f/t/41863">MAM+ userscript</a>! However, these settings are <strong>NOT</strong> stored on MAM; they are stored within the Tampermonkey/Greasemonkey extension in your browser, and must be customized on each of your browsers/devices separately.<br><br>For a detailed look at the available features, <a href="${Util.derefer('https://github.com/gardenshade/mam-plus/wiki/Feature-Overview')}">check the Wiki!</a><br><br></td></tr>`;
            Object.keys(page).forEach((scope) => {
                const scopeNum = Number(scope);
                // Insert the section title
                outp += `<tr><td class='row2'>${SettingGroup[scopeNum]}</td><td class='row1'>`;
                // Create the required input field based on the setting
                Object.keys(page[scopeNum]).forEach((setting) => {
                    const settingNumber = Number(setting);
                    const item = page[scopeNum][settingNumber];
                    const cases = {
                        checkbox: () => {
                            outp += `<input type='checkbox' id='${item.title}' value='true'>${item.desc}<br>`;
                        },
                        textbox: () => {
                            outp += `<span class='mp_setTag'>${item.tag}:</span> <input type='text' id='${item.title}' placeholder='${item.placeholder}' class='mp_textInput' size='25'>${item.desc}<br>`;
                        },
                        dropdown: () => {
                            outp += `<span class='mp_setTag'>${item.tag}:</span> <select id='${item.title}' class='mp_dropInput'>`;
                            if (item.options) {
                                Object.keys(item.options).forEach((key) => {
                                    outp += `<option value='${key}'>${item.options[key]}</option>`;
                                });
                            }
                            outp += `</select>${item.desc}<br>`;
                        },
                    };
                    if (item.type)
                        cases[item.type]();
                });
                // Close the row
                outp += '</td></tr>';
            });
            // Add the save button & last part of the table
            outp +=
                '<tr><td class="row1" colspan="2"><div id="mp_submit" class="mp_settingBtn">Save M+ Settings??</div><div id="mp_copy" class="mp_settingBtn">Copy Settings</div><div id="mp_inject" class="mp_settingBtn">Paste Settings</div><span class="mp_savestate" style="opacity:0">Saved!</span></td></tr></tbody>';
            resolve(outp);
        });
    }
    // Function for retrieving the current settings values
    static _getSettings(page) {
        // Util.purgeSettings();
        const allValues = GM_listValues();
        if (MP.DEBUG) {
            console.log('_getSettings(', page, ')\nStored GM keys:', allValues);
        }
        Object.keys(page).forEach((scope) => {
            Object.keys(page[Number(scope)]).forEach((setting) => {
                const pref = page[Number(scope)][Number(setting)];
                if (MP.DEBUG) {
                    console.log('Pref:', pref.title, '| Set:', GM_getValue(`${pref.title}`), '| Value:', GM_getValue(`${pref.title}_val`));
                }
                if (pref !== null && typeof pref === 'object') {
                    const elem = (document.getElementById(pref.title));
                    const cases = {
                        checkbox: () => {
                            elem.setAttribute('checked', 'checked');
                        },
                        textbox: () => {
                            elem.value = GM_getValue(`${pref.title}_val`);
                        },
                        dropdown: () => {
                            elem.value = GM_getValue(pref.title);
                        },
                    };
                    if (cases[pref.type] && GM_getValue(pref.title))
                        cases[pref.type]();
                }
            });
        });
    }
    static _setSettings(obj) {
        if (MP.DEBUG)
            console.log(`_setSettings(`, obj, ')');
        Object.keys(obj).forEach((scope) => {
            Object.keys(obj[Number(scope)]).forEach((setting) => {
                const pref = obj[Number(scope)][Number(setting)];
                if (pref !== null && typeof pref === 'object') {
                    const elem = (document.getElementById(pref.title));
                    const cases = {
                        checkbox: () => {
                            if (elem.checked)
                                GM_setValue(pref.title, true);
                        },
                        textbox: () => {
                            const inp = elem.value;
                            if (inp !== '') {
                                GM_setValue(pref.title, true);
                                GM_setValue(`${pref.title}_val`, inp);
                            }
                        },
                        dropdown: () => {
                            GM_setValue(pref.title, elem.value);
                        },
                    };
                    if (cases[pref.type])
                        cases[pref.type]();
                }
            });
        });
        console.log('[M+] Saved!');
    }
    static _copySettings() {
        const gmList = GM_listValues();
        const outp = [];
        // Loop over all stored settings and push to output array
        gmList.map((setting) => {
            // Don't export mp_ settings as they should only be set at runtime
            if (setting.indexOf('mp_') < 0) {
                outp.push([setting, GM_getValue(setting)]);
            }
        });
        return JSON.stringify(outp);
    }
    static _pasteSettings(payload) {
        if (MP.DEBUG)
            console.group(`_pasteSettings( )`);
        const settings = JSON.parse(payload);
        settings.forEach((tuple) => {
            if (tuple[1]) {
                GM_setValue(`${tuple[0]}`, `${tuple[1]}`);
                if (MP.DEBUG)
                    console.log(tuple[0], ': ', tuple[1]);
            }
        });
    }
    // Function that saves the values of the settings table
    static _saveSettings(timer, obj) {
        if (MP.DEBUG)
            console.group(`_saveSettings()`);
        const savestate = (document.querySelector('span.mp_savestate'));
        const gmValues = GM_listValues();
        // Reset timer & message
        savestate.style.opacity = '0';
        window.clearTimeout(timer);
        console.log('[M+] Saving...');
        // Loop over all values stored in GM and reset everything
        for (const feature in gmValues) {
            if (typeof gmValues[feature] !== 'function') {
                // Only loop over values that are feature settings
                if (!['mp_version', 'style_theme'].includes(gmValues[feature])) {
                    //if not part of preferences page
                    if (gmValues[feature].indexOf('mp_') !== 0) {
                        GM_setValue(gmValues[feature], false);
                    }
                }
            }
        }
        // Save the settings to GM values
        this._setSettings(obj);
        // Display the confirmation message
        savestate.style.opacity = '1';
        try {
            timer = window.setTimeout(() => {
                savestate.style.opacity = '0';
            }, 2345);
        }
        catch (e) {
            if (MP.DEBUG)
                console.warn(e);
        }
        if (MP.DEBUG)
            console.groupEnd();
    }
    /**
     * Inserts the settings page.
     * @param result Value that must be passed down from `Check.page('settings')`
     * @param settings The array of features to provide settings for
     */
    static init(result, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            // This will only run if `Check.page('settings)` returns true & is passed here
            if (result === true) {
                if (MP.DEBUG) {
                    console.group(`new Settings()`);
                }
                // Make sure the settings table has loaded
                yield Check.elemLoad('#mainBody > table').then((r) => {
                    if (MP.DEBUG)
                        console.log(`[M+] Starting to build Settings table...`);
                    // Create new table elements
                    const settingNav = document.querySelector('#mainBody > table');
                    const settingTitle = document.createElement('h1');
                    const settingTable = document.createElement('table');
                    let pageScope;
                    // Insert table elements after the Pref navbar
                    settingNav.insertAdjacentElement('afterend', settingTitle);
                    settingTitle.insertAdjacentElement('afterend', settingTable);
                    Util.setAttr(settingTable, {
                        class: 'coltable',
                        cellspacing: '1',
                        style: 'width:100%;min-width:100%;max-width:100%;',
                    });
                    settingTitle.innerHTML = 'MAM+ Settings';
                    // Group settings by page
                    this._getScopes(settings)
                        // Generate table HTML from feature settings
                        .then((scopes) => {
                        pageScope = scopes;
                        return this._buildTable(scopes);
                    })
                        // Insert content into the new table elements
                        .then((result) => {
                        settingTable.innerHTML = result;
                        console.log('[M+] Added the MAM+ Settings table!');
                        return pageScope;
                    })
                        .then((scopes) => {
                        this._getSettings(scopes);
                        return scopes;
                    })
                        // Make sure the settings are done loading
                        .then((scopes) => {
                        const submitBtn = (document.querySelector('#mp_submit'));
                        const copyBtn = (document.querySelector('#mp_copy'));
                        const pasteBtn = (document.querySelector('#mp_inject'));
                        let ssTimer;
                        try {
                            submitBtn.addEventListener('click', () => {
                                this._saveSettings(ssTimer, scopes);
                            }, false);
                            Util.clipboardifyBtn(pasteBtn, this._pasteSettings, false);
                            Util.clipboardifyBtn(copyBtn, this._copySettings());
                        }
                        catch (err) {
                            if (MP.DEBUG)
                                console.warn(err);
                        }
                        if (MP.DEBUG) {
                            console.groupEnd();
                        }
                    });
                });
            }
        });
    }
}
/// <reference path="types.ts" />
/// <reference path="style.ts" />
/// <reference path="./modules/core.ts" />
/// <reference path="./modules/global.ts" />
/// <reference path="./modules/browse.ts" />
/// <reference path="./modules/forum.ts" />
/// <reference path="./modules/home.ts" />
/// <reference path="./modules/request.ts" />
/// <reference path="./modules/shout.ts" />
/// <reference path="./modules/tor.ts" />
/// <reference path="./modules/upload.ts" />
/// <reference path="./modules/user.ts" />
/// <reference path="./modules/vault.ts" />
/// <reference path="features.ts" />
/// <reference path="settings.ts" />
/**
 * * Userscript namespace
 * @constant CHANGELOG: Object containing a list of changes and known bugs
 * @constant TIMESTAMP: Placeholder hook for the current build time
 * @constant VERSION: The current userscript version
 * @constant PREV_VER: The last installed userscript version
 * @constant ERRORLOG: The target array for logging errors
 * @constant PAGE_PATH: The current page URL without the site address
 * @constant MP_CSS: The MAM+ stylesheet
 * @constant run(): Starts the userscript
 */
var MP;
(function (MP) {
    MP.DEBUG = GM_getValue('debug') ? true : false;
    MP.CHANGELOG = {
        /* 🆕♻️🐞 */
        UPDATE_LIST: [
            '🆕: Added ability to emphasize/block users from shoutbox menu. Gracias @sherman76400!',
            '🆕: Display UIDs in shoutbox. Merci @sherman76400!',
            '🆕: Style mentions of your username in shoutbox. Danke @sherman76400!',
            '🆕: ',
            '♻️: Added a counter when items are hidden. Grazzi @sherman76400!',
            '♻️: Removed Shoutbox Quote/Reply button features as they are now impleMAMted',
            '♻️: Many behind-the-scenes changes to how new user gifting logic is handled. Thanks @Photaz!',
            '🐞: Fixed site layout change breaking Gift New Users on home. Blessings @Photaz!',
        ],
        BUG_LIST: [
            "SB buttons are still in the codebase, they just don't run",
        ],
    };
    MP.TIMESTAMP = 'Apr 11';
    MP.VERSION = Check.newVer;
    MP.PREV_VER = Check.prevVer;
    MP.ERRORLOG = [];
    MP.PAGE_PATH = window.location.pathname;
    MP.MP_CSS = new Style();
    MP.settingsGlob = [];
    MP.run = () => __awaiter(this, void 0, void 0, function* () {
        /**
         * * PRE SCRIPT
         */
        console.group(`Welcome to MAM+ v${MP.VERSION}!`);
        // The current page is not yet known
        GM_deleteValue('mp_currentPage');
        Check.page();
        // Add a simple cookie to announce the script is being used
        document.cookie = 'mp_enabled=1;domain=myanonamouse.net;path=/;samesite=lax';
        // Initialize core functions
        const alerts = new Alerts();
        new Debug();
        // Notify the user if the script was updated
        Check.updated().then((result) => {
            if (result)
                alerts.notify(result, MP.CHANGELOG);
        });
        // Initialize the features
        new InitFeatures();
        /**
         * * SETTINGS
         */
        Check.page('settings').then((result) => {
            const subPg = window.location.search;
            if (result === true && (subPg === '' || subPg === '?view=general')) {
                // Initialize the settings page
                Settings.init(result, MP.settingsGlob);
            }
        });
        /**
         * * STYLES
         * Injects CSS
         */
        Check.elemLoad('head link[href*="ICGstation"]').then(() => {
            // Add custom CSS sheet
            MP.MP_CSS.injectLink();
            // Get the current site theme
            MP.MP_CSS.alignToSiteTheme();
        });
        console.groupEnd();
    });
})(MP || (MP = {}));
// * Start the userscript
MP.run();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIiwic3JjL2NoZWNrLnRzIiwic3JjL3N0eWxlLnRzIiwic3JjL21vZHVsZXMvY29yZS50cyIsInNyYy9tb2R1bGVzL2dsb2JhbC50cyIsInNyYy9tb2R1bGVzL3NoYXJlZC50cyIsInNyYy9tb2R1bGVzL2Jyb3dzZS50cyIsInNyYy9tb2R1bGVzL2ZvcnVtLnRzIiwic3JjL21vZHVsZXMvaG9tZS50cyIsInNyYy9tb2R1bGVzL3JlcXVlc3QudHMiLCJzcmMvbW9kdWxlcy9zaG91dC50cyIsInNyYy9tb2R1bGVzL3Rvci50cyIsInNyYy9tb2R1bGVzL3VwbG9hZC50cyIsInNyYy9tb2R1bGVzL3VzZXIudHMiLCJzcmMvbW9kdWxlcy92YXVsdC50cyIsInNyYy9mZWF0dXJlcy50cyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy9hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7O0dBRUc7QUFrQkgsSUFBSyxZQVlKO0FBWkQsV0FBSyxZQUFZO0lBQ2IsbURBQVEsQ0FBQTtJQUNSLCtDQUFNLENBQUE7SUFDTixtREFBUSxDQUFBO0lBQ1IsdURBQVUsQ0FBQTtJQUNWLCtEQUFjLENBQUE7SUFDZCx1REFBVSxDQUFBO0lBQ1YsaURBQU8sQ0FBQTtJQUNQLDJEQUFZLENBQUE7SUFDWiw2REFBYSxDQUFBO0lBQ2IsaURBQU8sQ0FBQTtJQUNQLGtEQUFPLENBQUE7QUFDWCxDQUFDLEVBWkksWUFBWSxLQUFaLFlBQVksUUFZaEI7QUNoQ0Q7Ozs7R0FJRzs7QUFFSCxNQUFNLElBQUk7SUFDTjs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPLENB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SUFDdkIsQ0FBQyxDQUFBLENBQUM7QUFDTixDQUFDLEVBdkVTLEVBQUUsS0FBRixFQUFFLFFBdUVYO0FBRUQseUJBQXlCO0FBQ3pCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyIsImZpbGUiOiJtYW0tcGx1c19kZXYudXNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUeXBlcywgSW50ZXJmYWNlcywgZXRjLlxyXG4gKi9cclxuXHJcbnR5cGUgVmFsaWRQYWdlID1cclxuICAgIHwgJ2hvbWUnXHJcbiAgICB8ICdicm93c2UnXHJcbiAgICB8ICdyZXF1ZXN0J1xyXG4gICAgfCAncmVxdWVzdCBkZXRhaWxzJ1xyXG4gICAgfCAndG9ycmVudCdcclxuICAgIHwgJ3Nob3V0Ym94J1xyXG4gICAgfCAndmF1bHQnXHJcbiAgICB8ICd1c2VyJ1xyXG4gICAgfCAndXBsb2FkJ1xyXG4gICAgfCAnZm9ydW0gdGhyZWFkJ1xyXG4gICAgfCAnc2V0dGluZ3MnXHJcbiAgICB8ICduZXcgdXNlcnMnO1xyXG5cclxudHlwZSBCb29rRGF0YSA9ICdib29rJyB8ICdhdXRob3InIHwgJ3Nlcmllcyc7XHJcblxyXG5lbnVtIFNldHRpbmdHcm91cCB7XHJcbiAgICAnR2xvYmFsJyxcclxuICAgICdIb21lJyxcclxuICAgICdTZWFyY2gnLFxyXG4gICAgJ1JlcXVlc3RzJyxcclxuICAgICdUb3JyZW50IFBhZ2UnLFxyXG4gICAgJ1Nob3V0Ym94JyxcclxuICAgICdWYXVsdCcsXHJcbiAgICAnVXNlciBQYWdlcycsXHJcbiAgICAnVXBsb2FkIFBhZ2UnLFxyXG4gICAgJ0ZvcnVtJyxcclxuICAgICdPdGhlcicsXHJcbn1cclxuXHJcbnR5cGUgU2hvdXRib3hVc2VyVHlwZSA9ICdwcmlvcml0eScgfCAnbXV0ZScgfCAnbWVudGlvbic7XHJcblxyXG50eXBlIFN0b3JlU291cmNlID1cclxuICAgIHwgMVxyXG4gICAgfCAnMi41J1xyXG4gICAgfCAnNCdcclxuICAgIHwgJzUnXHJcbiAgICB8ICc4J1xyXG4gICAgfCAnMjAnXHJcbiAgICB8ICcxMDAnXHJcbiAgICB8ICdwb2ludHMnXHJcbiAgICB8ICdjaGVlc2UnXHJcbiAgICB8ICdtYXgnXHJcbiAgICB8ICdNYXggQWZmb3JkYWJsZSdcclxuICAgIHwgJ3NlZWR0aW1lJ1xyXG4gICAgfCAnU2VsbCdcclxuICAgIHwgJ3JhdGlvJ1xyXG4gICAgfCAnRm9ydW0nO1xyXG5cclxuaW50ZXJmYWNlIFVzZXJHaWZ0SGlzdG9yeSB7XHJcbiAgICBhbW91bnQ6IG51bWJlcjtcclxuICAgIG90aGVyX25hbWU6IHN0cmluZztcclxuICAgIG90aGVyX3VzZXJpZDogbnVtYmVyO1xyXG4gICAgdGlkOiBudW1iZXIgfCBudWxsO1xyXG4gICAgdGltZXN0YW1wOiBudW1iZXI7XHJcbiAgICB0aXRsZTogc3RyaW5nIHwgbnVsbDtcclxuICAgIHR5cGU6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEFycmF5T2JqZWN0IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZ1tdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU3RyaW5nT2JqZWN0IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEJvb2tEYXRhT2JqZWN0IGV4dGVuZHMgU3RyaW5nT2JqZWN0IHtcclxuICAgIFsnZXh0cmFjdGVkJ106IHN0cmluZztcclxuICAgIFsnZGVzYyddOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBEaXZSb3dPYmplY3Qge1xyXG4gICAgWyd0aXRsZSddOiBzdHJpbmc7XHJcbiAgICBbJ2RhdGEnXTogSFRNTERpdkVsZW1lbnQ7XHJcbn1cclxuXHJcbmludGVyZmFjZSBTZXR0aW5nR2xvYk9iamVjdCB7XHJcbiAgICBba2V5OiBudW1iZXJdOiBGZWF0dXJlU2V0dGluZ3NbXTtcclxufVxyXG5cclxuaW50ZXJmYWNlIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICBzY29wZTogU2V0dGluZ0dyb3VwO1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIHR5cGU6ICdjaGVja2JveCcgfCAnZHJvcGRvd24nIHwgJ3RleHRib3gnO1xyXG4gICAgZGVzYzogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQW55RmVhdHVyZSBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICB0YWc/OiBzdHJpbmc7XHJcbiAgICBvcHRpb25zPzogU3RyaW5nT2JqZWN0O1xyXG4gICAgcGxhY2Vob2xkZXI/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBGZWF0dXJlIHtcclxuICAgIHNldHRpbmdzOiBDaGVja2JveFNldHRpbmcgfCBEcm9wZG93blNldHRpbmcgfCBUZXh0Ym94U2V0dGluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIENoZWNrYm94U2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICB0eXBlOiAnY2hlY2tib3gnO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRHJvcGRvd25TZXR0aW5nIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHR5cGU6ICdkcm9wZG93bic7XHJcbiAgICB0YWc6IHN0cmluZztcclxuICAgIG9wdGlvbnM6IFN0cmluZ09iamVjdDtcclxufVxyXG5cclxuaW50ZXJmYWNlIFRleHRib3hTZXR0aW5nIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHR5cGU6ICd0ZXh0Ym94JztcclxuICAgIHRhZzogc3RyaW5nO1xyXG4gICAgcGxhY2Vob2xkZXI6IHN0cmluZztcclxufVxyXG5cclxuLy8gbmF2aWdhdG9yLmNsaXBib2FyZC5kLnRzXHJcblxyXG4vLyBUeXBlIGRlY2xhcmF0aW9ucyBmb3IgQ2xpcGJvYXJkIEFQSVxyXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ2xpcGJvYXJkX0FQSVxyXG5pbnRlcmZhY2UgQ2xpcGJvYXJkIHtcclxuICAgIHdyaXRlVGV4dChuZXdDbGlwVGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcclxuICAgIC8vIEFkZCBhbnkgb3RoZXIgbWV0aG9kcyB5b3UgbmVlZCBoZXJlLlxyXG59XHJcblxyXG5pbnRlcmZhY2UgTmF2aWdhdG9yQ2xpcGJvYXJkIHtcclxuICAgIC8vIE9ubHkgYXZhaWxhYmxlIGluIGEgc2VjdXJlIGNvbnRleHQuXHJcbiAgICByZWFkb25seSBjbGlwYm9hcmQ/OiBDbGlwYm9hcmQ7XHJcbn1cclxuXHJcbmludGVyZmFjZSBOYXZpZ2F0b3JFeHRlbmRlZCBleHRlbmRzIE5hdmlnYXRvckNsaXBib2FyZCB7fVxyXG4iLCIvKipcclxuICogQ2xhc3MgY29udGFpbmluZyBjb21tb24gdXRpbGl0eSBtZXRob2RzXHJcbiAqXHJcbiAqIElmIHRoZSBtZXRob2Qgc2hvdWxkIGhhdmUgdXNlci1jaGFuZ2VhYmxlIHNldHRpbmdzLCBjb25zaWRlciB1c2luZyBgQ29yZS50c2AgaW5zdGVhZFxyXG4gKi9cclxuXHJcbmNsYXNzIFV0aWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBbmltYXRpb24gZnJhbWUgdGltZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhZlRpbWVyKCk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZXNvbHZlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWxsb3dzIHNldHRpbmcgbXVsdGlwbGUgYXR0cmlidXRlcyBhdCBvbmNlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc2V0QXR0cihlbDogRWxlbWVudCwgYXR0cjogU3RyaW5nT2JqZWN0KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHIpIHtcclxuICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJba2V5XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgXCJsZW5ndGhcIiBvZiBhbiBPYmplY3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBvYmplY3RMZW5ndGgob2JqOiBPYmplY3QpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvcmNlZnVsbHkgZW1wdGllcyBhbnkgR00gc3RvcmVkIHZhbHVlc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHB1cmdlU2V0dGluZ3MoKTogdm9pZCB7XHJcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBHTV9saXN0VmFsdWVzKCkpIHtcclxuICAgICAgICAgICAgR01fZGVsZXRlVmFsdWUodmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvZyBhIG1lc3NhZ2UgYWJvdXQgYSBjb3VudGVkIHJlc3VsdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlcG9ydENvdW50KGRpZDogc3RyaW5nLCBudW06IG51bWJlciwgdGhpbmc6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNpbmd1bGFyID0gMTtcclxuICAgICAgICBpZiAobnVtICE9PSBzaW5ndWxhcikge1xyXG4gICAgICAgICAgICB0aGluZyArPSAncyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgPiAke2RpZH0gJHtudW19ICR7dGhpbmd9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZXMgYSBmZWF0dXJlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgc3RhcnRGZWF0dXJlKFxyXG4gICAgICAgIHNldHRpbmdzOiBGZWF0dXJlU2V0dGluZ3MsXHJcbiAgICAgICAgZWxlbTogc3RyaW5nLFxyXG4gICAgICAgIHBhZ2U/OiBWYWxpZFBhZ2VbXVxyXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgLy8gUXVldWUgdGhlIHNldHRpbmdzIGluIGNhc2UgdGhleSdyZSBuZWVkZWRcclxuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaChzZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIC8vIEZ1bmN0aW9uIHRvIHJldHVybiB0cnVlIHdoZW4gdGhlIGVsZW1lbnQgaXMgbG9hZGVkXHJcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xyXG4gICAgICAgICAgICBjb25zdCB0aW1lcjogUHJvbWlzZTxmYWxzZT4gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT5cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgMjAwMCwgZmFsc2UpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrRWxlbSA9IENoZWNrLmVsZW1Mb2FkKGVsZW0pO1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yYWNlKFt0aW1lciwgY2hlY2tFbGVtXSkudGhlbigodmFsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICAgICAgYHN0YXJ0RmVhdHVyZSgke3NldHRpbmdzLnRpdGxlfSkgVW5hYmxlIHRvIGluaXRpYXRlISBDb3VsZCBub3QgZmluZCBlbGVtZW50OiAke2VsZW19YFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElzIHRoZSBzZXR0aW5nIGVuYWJsZWQ/XHJcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKHNldHRpbmdzLnRpdGxlKSkge1xyXG4gICAgICAgICAgICAvLyBBIHNwZWNpZmljIHBhZ2UgaXMgbmVlZGVkXHJcbiAgICAgICAgICAgIGlmIChwYWdlICYmIHBhZ2UubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGFsbCByZXF1aXJlZCBwYWdlc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0czogYm9vbGVhbltdID0gW107XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBwYWdlLmZvckVhY2goKHApID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBDaGVjay5wYWdlKHApLnRoZW4oKHIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKDxib29sZWFuPnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiBhbnkgcmVxdWVzdGVkIHBhZ2UgbWF0Y2hlcyB0aGUgY3VycmVudCBwYWdlLCBydW4gdGhlIGZlYXR1cmVcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzLmluY2x1ZGVzKHRydWUpID09PSB0cnVlKSByZXR1cm4gcnVuKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTa2lwIHRvIGVsZW1lbnQgY2hlY2tpbmdcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBydW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBTZXR0aW5nIGlzIG5vdCBlbmFibGVkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyaW1zIGEgc3RyaW5nIGxvbmdlciB0aGFuIGEgc3BlY2lmaWVkIGNoYXIgbGltaXQsIHRvIGEgZnVsbCB3b3JkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgdHJpbVN0cmluZyhpbnA6IHN0cmluZywgbWF4OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChpbnAubGVuZ3RoID4gbWF4KSB7XHJcbiAgICAgICAgICAgIGlucCA9IGlucC5zdWJzdHJpbmcoMCwgbWF4ICsgMSk7XHJcbiAgICAgICAgICAgIGlucCA9IGlucC5zdWJzdHJpbmcoMCwgTWF0aC5taW4oaW5wLmxlbmd0aCwgaW5wLmxhc3RJbmRleE9mKCcgJykpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlucDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYnJhY2tldHMgJiBhbGwgY29udGFpbmVkIHdvcmRzIGZyb20gYSBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBicmFja2V0UmVtb3ZlcihpbnA6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGlucFxyXG4gICAgICAgICAgICAucmVwbGFjZSgveysuKj99Ky9nLCAnJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcW1xcW3xcXF1cXF0vZywgJycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC88Lio/Pi9nLCAnJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcKC4qP1xcKS9nLCAnJylcclxuICAgICAgICAgICAgLnRyaW0oKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICpSZXR1cm4gdGhlIGNvbnRlbnRzIGJldHdlZW4gYnJhY2tldHNcclxuICAgICAqXHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGJyYWNrZXRDb250ZW50cyA9IChpbnA6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIHJldHVybiBpbnAubWF0Y2goL1xcKChbXildKylcXCkvKSFbMV07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBzdHJpbmcgdG8gYW4gYXJyYXlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmdUb0FycmF5KGlucDogc3RyaW5nLCBzcGxpdFBvaW50PzogJ3dzJyk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gc3BsaXRQb2ludCAhPT0gdW5kZWZpbmVkICYmIHNwbGl0UG9pbnQgIT09ICd3cydcclxuICAgICAgICAgICAgPyBpbnAuc3BsaXQoc3BsaXRQb2ludClcclxuICAgICAgICAgICAgOiBpbnAubWF0Y2goL1xcUysvZykgfHwgW107XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhIGNvbW1hIChvciBvdGhlcikgc2VwYXJhdGVkIHZhbHVlIGludG8gYW4gYXJyYXlcclxuICAgICAqIEBwYXJhbSBpbnAgU3RyaW5nIHRvIGJlIGRpdmlkZWRcclxuICAgICAqIEBwYXJhbSBkaXZpZGVyIFRoZSBkaXZpZGVyIChkZWZhdWx0OiAnLCcpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3N2VG9BcnJheShpbnA6IHN0cmluZywgZGl2aWRlcjogc3RyaW5nID0gJywnKTogc3RyaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IGFycjogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBpbnAuc3BsaXQoZGl2aWRlcikuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBhcnIucHVzaChpdGVtLnRyaW0oKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgYW4gYXJyYXkgdG8gYSBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBpbnAgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gZW5kIGN1dC1vZmYgcG9pbnRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhcnJheVRvU3RyaW5nKGlucDogc3RyaW5nW10sIGVuZD86IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIGlucC5mb3JFYWNoKChrZXksIHZhbCkgPT4ge1xyXG4gICAgICAgICAgICBvdXRwICs9IGtleTtcclxuICAgICAgICAgICAgaWYgKGVuZCAmJiB2YWwgKyAxICE9PSBpbnAubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwICs9ICcgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvdXRwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBET00gbm9kZSByZWZlcmVuY2UgaW50byBhbiBIVE1MIEVsZW1lbnQgcmVmZXJlbmNlXHJcbiAgICAgKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSB0byBjb252ZXJ0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbm9kZVRvRWxlbShub2RlOiBOb2RlKTogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGlmIChub2RlLmZpcnN0Q2hpbGQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxIVE1MRWxlbWVudD5ub2RlLmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTm9kZS10by1lbGVtIHdpdGhvdXQgY2hpbGRub2RlIGlzIHVudGVzdGVkJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBOb2RlOiBOb2RlID0gbm9kZTtcclxuICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZCh0ZW1wTm9kZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5ub2RlLmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhO1xyXG4gICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKHRlbXBOb2RlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hdGNoIHN0cmluZ3Mgd2hpbGUgaWdub3JpbmcgY2FzZSBzZW5zaXRpdml0eVxyXG4gICAgICogQHBhcmFtIGEgRmlyc3Qgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gYiBTZWNvbmQgc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY2FzZWxlc3NTdHJpbmdNYXRjaChhOiBzdHJpbmcsIGI6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IGNvbXBhcmU6IG51bWJlciA9IGEubG9jYWxlQ29tcGFyZShiLCAnZW4nLCB7XHJcbiAgICAgICAgICAgIHNlbnNpdGl2aXR5OiAnYmFzZScsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGNvbXBhcmUgPT09IDAgPyB0cnVlIDogZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBuZXcgVG9yRGV0Um93IGFuZCByZXR1cm4gdGhlIGlubmVyIGRpdlxyXG4gICAgICogQHBhcmFtIHRhciBUaGUgcm93IHRvIGJlIHRhcmdldHRlZFxyXG4gICAgICogQHBhcmFtIGxhYmVsIFRoZSBuYW1lIHRvIGJlIGRpc3BsYXllZCBmb3IgdGhlIG5ldyByb3dcclxuICAgICAqIEBwYXJhbSByb3dDbGFzcyBUaGUgcm93J3MgY2xhc3NuYW1lIChzaG91bGQgc3RhcnQgd2l0aCBtcF8pXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYWRkVG9yRGV0YWlsc1JvdyhcclxuICAgICAgICB0YXI6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBsYWJlbDogc3RyaW5nLFxyXG4gICAgICAgIHJvd0NsYXNzOiBzdHJpbmdcclxuICAgICk6IEhUTUxEaXZFbGVtZW50IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKHRhcik7XHJcblxyXG4gICAgICAgIGlmICh0YXIgPT09IG51bGwgfHwgdGFyLnBhcmVudEVsZW1lbnQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBZGQgVG9yIERldGFpbHMgUm93OiBlbXB0eSBub2RlIG9yIHBhcmVudCBub2RlIEAgJHt0YXJ9YCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGFyLnBhcmVudEVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwidG9yRGV0Um93XCI+PGRpdiBjbGFzcz1cInRvckRldExlZnRcIj4ke2xhYmVsfTwvZGl2PjxkaXYgY2xhc3M9XCJ0b3JEZXRSaWdodCAke3Jvd0NsYXNzfVwiPjxzcGFuIGNsYXNzPVwiZmxleFwiPjwvc3Bhbj48L2Rpdj48L2Rpdj5gXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3Jvd0NsYXNzfSAuZmxleGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGFuIGVsZW1lbnQgaW50byBhIGJ1dHRvbiB0aGF0LCB3aGVuIGNsaWNrZWQsIGNvcGllcyB0ZXh0IHRvIGNsaXBib2FyZFxyXG4gICAgICogQHBhcmFtIGJ0biBBbiBIVE1MIEVsZW1lbnQgYmVpbmcgdXNlZCBhcyBhIGJ1dHRvblxyXG4gICAgICogQHBhcmFtIHBheWxvYWQgVGhlIHRleHQgdGhhdCB3aWxsIGJlIGNvcGllZCB0byBjbGlwYm9hcmQgb24gYnV0dG9uIGNsaWNrLCBvciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgd2lsbCB1c2UgdGhlIGNsaXBib2FyZCdzIGN1cnJlbnQgdGV4dFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNsaXBib2FyZGlmeUJ0bihcclxuICAgICAgICBidG46IEhUTUxFbGVtZW50LFxyXG4gICAgICAgIHBheWxvYWQ6IGFueSxcclxuICAgICAgICBjb3B5OiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgYnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEhhdmUgdG8gb3ZlcnJpZGUgdGhlIE5hdmlnYXRvciB0eXBlIHRvIHByZXZlbnQgVFMgZXJyb3JzXHJcbiAgICAgICAgICAgIGNvbnN0IG5hdjogTmF2aWdhdG9yRXh0ZW5kZWQgfCB1bmRlZmluZWQgPSA8TmF2aWdhdG9yRXh0ZW5kZWQ+bmF2aWdhdG9yO1xyXG4gICAgICAgICAgICBpZiAobmF2ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gY29weSB0ZXh0LCBsaWtlbHkgZHVlIHRvIG1pc3NpbmcgYnJvd3NlciBzdXBwb3J0LicpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgJ25hdmlnYXRvcic/XCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLyogTmF2aWdhdG9yIEV4aXN0cyAqL1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjb3B5ICYmIHR5cGVvZiBwYXlsb2FkID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvcHkgcmVzdWx0cyB0byBjbGlwYm9hcmRcclxuICAgICAgICAgICAgICAgICAgICBuYXYuY2xpcGJvYXJkIS53cml0ZVRleHQocGF5bG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29waWVkIHRvIHlvdXIgY2xpcGJvYXJkIScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBSdW4gcGF5bG9hZCBmdW5jdGlvbiB3aXRoIGNsaXBib2FyZCB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgbmF2LmNsaXBib2FyZCEucmVhZFRleHQoKS50aGVuKCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQodGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29waWVkIGZyb20geW91ciBjbGlwYm9hcmQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBidG4uc3R5bGUuY29sb3IgPSAnZ3JlZW4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGFuIEhUVFBSZXF1ZXN0IGZvciBHRVQgSlNPTiwgcmV0dXJucyB0aGUgZnVsbCB0ZXh0IG9mIEhUVFAgR0VUXHJcbiAgICAgKiBAcGFyYW0gdXJsIC0gYSBzdHJpbmcgb2YgdGhlIFVSTCB0byBzdWJtaXQgZm9yIEdFVCByZXF1ZXN0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SlNPTih1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZ2V0SFRUUCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAvL1VSTCB0byBHRVQgcmVzdWx0cyB3aXRoIHRoZSBhbW91bnQgZW50ZXJlZCBieSB1c2VyIHBsdXMgdGhlIHVzZXJuYW1lIGZvdW5kIG9uIHRoZSBtZW51IHNlbGVjdGVkXHJcbiAgICAgICAgICAgIGdldEhUVFAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgZ2V0SFRUUC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICBnZXRIVFRQLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChnZXRIVFRQLnJlYWR5U3RhdGUgPT09IDQgJiYgZ2V0SFRUUC5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZ2V0SFRUUC5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBnZXRIVFRQLnNlbmQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gdHdvIHBhcmFtZXRlcnNcclxuICAgICAqIEBwYXJhbSBtaW4gYSBudW1iZXIgb2YgdGhlIGJvdHRvbSBvZiByYW5kb20gbnVtYmVyIHBvb2xcclxuICAgICAqIEBwYXJhbSBtYXggYSBudW1iZXIgb2YgdGhlIHRvcCBvZiB0aGUgcmFuZG9tIG51bWJlciBwb29sXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmFuZG9tTnVtYmVyID0gKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciA9PiB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbik7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2xlZXAgdXRpbCB0byBiZSB1c2VkIGluIGFzeW5jIGZ1bmN0aW9ucyB0byBkZWxheSBwcm9ncmFtXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc2xlZXAgPSAobTogYW55KTogUHJvbWlzZTx2b2lkPiA9PiBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCBtKSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGxhc3Qgc2VjdGlvbiBvZiBhbiBIUkVGXHJcbiAgICAgKiBAcGFyYW0gZWxlbSBBbiBhbmNob3IgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHNwbGl0IE9wdGlvbmFsIGRpdmlkZXIuIERlZmF1bHRzIHRvIGAvYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGVuZE9mSHJlZiA9IChlbGVtOiBIVE1MQW5jaG9yRWxlbWVudCwgc3BsaXQgPSAnLycpID0+XHJcbiAgICAgICAgZWxlbS5ocmVmLnNwbGl0KHNwbGl0KS5wb3AoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgaGV4IHZhbHVlIG9mIGEgY29tcG9uZW50IGFzIGEgc3RyaW5nLlxyXG4gICAgICogRnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4XHJcbiAgICAgKlxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNvbXBvbmVudFRvSGV4ID0gKGM6IG51bWJlciB8IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgY29uc3QgaGV4ID0gYy50b1N0cmluZygxNik7XHJcbiAgICAgICAgcmV0dXJuIGhleC5sZW5ndGggPT09IDEgPyBgMCR7aGV4fWAgOiBoZXg7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYSBoZXggY29sb3IgY29kZSBmcm9tIFJHQi5cclxuICAgICAqIEZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOFxyXG4gICAgICpcclxuICAgICAqIEBzdGF0aWNcclxuICAgICAqIEBtZW1iZXJvZiBVdGlsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmdiVG9IZXggPSAocjogbnVtYmVyLCBnOiBudW1iZXIsIGI6IG51bWJlcik6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGAjJHtVdGlsLmNvbXBvbmVudFRvSGV4KHIpfSR7VXRpbC5jb21wb25lbnRUb0hleChnKX0ke1V0aWwuY29tcG9uZW50VG9IZXgoXHJcbiAgICAgICAgICAgIGJcclxuICAgICAgICApfWA7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRXh0cmFjdCBudW1iZXJzICh3aXRoIGZsb2F0KSBmcm9tIHRleHQgYW5kIHJldHVybiB0aGVtXHJcbiAgICAgKiBAcGFyYW0gdGFyIEFuIEhUTUwgZWxlbWVudCB0aGF0IGNvbnRhaW5zIG51bWJlcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBleHRyYWN0RmxvYXQgPSAodGFyOiBIVE1MRWxlbWVudCk6IG51bWJlcltdID0+IHtcclxuICAgICAgICBpZiAodGFyLnRleHRDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGFyLnRleHRDb250ZW50IS5yZXBsYWNlKC8sL2csICcnKS5tYXRjaCgvXFxkK1xcLlxcZCsvKSB8fCBbXSkubWFwKChuKSA9PlxyXG4gICAgICAgICAgICAgICAgcGFyc2VGbG9hdChuKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGFyZ2V0IGNvbnRhaW5zIG5vIHRleHQnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBHZXQgdGhlIHVzZXIgZ2lmdCBoaXN0b3J5IGJldHdlZW4gdGhlIGxvZ2dlZCBpbiB1c2VyIGFuZCBhIGdpdmVuIElEXHJcbiAgICAgKiBAcGFyYW0gdXNlcklEIEEgdXNlciBJRDsgY2FuIGJlIGEgc3RyaW5nIG9yIG51bWJlclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGdldFVzZXJHaWZ0SGlzdG9yeShcclxuICAgICAgICB1c2VySUQ6IG51bWJlciB8IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxVc2VyR2lmdEhpc3RvcnlbXT4ge1xyXG4gICAgICAgIGNvbnN0IHJhd0dpZnRIaXN0b3J5OiBzdHJpbmcgPSBhd2FpdCBVdGlsLmdldEpTT04oXHJcbiAgICAgICAgICAgIGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vdXNlckJvbnVzSGlzdG9yeS5waHA/b3RoZXJfdXNlcmlkPSR7dXNlcklEfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGdpZnRIaXN0b3J5OiBBcnJheTxVc2VyR2lmdEhpc3Rvcnk+ID0gSlNPTi5wYXJzZShyYXdHaWZ0SGlzdG9yeSk7XHJcbiAgICAgICAgLy8gUmV0dXJuIHRoZSBmdWxsIGRhdGFcclxuICAgICAgICByZXR1cm4gZ2lmdEhpc3Rvcnk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIEdldCB0aGUgdXNlciBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB0aGUgbG9nZ2VkIGluIHVzZXIgYW5kIGV2ZXJ5b25lXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZ2V0QWxsVXNlckdpZnRIaXN0b3J5KCk6IFByb21pc2U8VXNlckdpZnRIaXN0b3J5W10+IHtcclxuICAgICAgICBjb25zdCByYXdHaWZ0SGlzdG9yeTogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKFxyXG4gICAgICAgICAgICBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL3VzZXJCb251c0hpc3RvcnkucGhwYFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgZ2lmdEhpc3Rvcnk6IEFycmF5PFVzZXJHaWZ0SGlzdG9yeT4gPSBKU09OLnBhcnNlKHJhd0dpZnRIaXN0b3J5KTtcclxuICAgICAgICAvLyBSZXR1cm4gdGhlIGZ1bGwgZGF0YVxyXG4gICAgICAgIHJldHVybiBnaWZ0SGlzdG9yeTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgR2V0cyB0aGUgbG9nZ2VkIGluIHVzZXIncyB1c2VyaWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXRDdXJyZW50VXNlcklEKCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgbXlJbmZvID0gPEhUTUxBbmNob3JFbGVtZW50PihcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1tVXNlclN0YXRzIC5hdmF0YXIgYScpXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAobXlJbmZvKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJRCA9IDxzdHJpbmc+dGhpcy5lbmRPZkhyZWYobXlJbmZvKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gTG9nZ2VkIGluIHVzZXJJRCBpcyAke3VzZXJJRH1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIHVzZXJJRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coJ05vIGxvZ2dlZCBpbiB1c2VyIGZvdW5kLicpO1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHByZXR0eVNpdGVUaW1lKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgZGF0ZT86IGJvb2xlYW4sIHRpbWU/OiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUodW5peFRpbWVzdGFtcCAqIDEwMDApLnRvSVNPU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKGRhdGUgJiYgIXRpbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcC5zcGxpdCgnVCcpWzBdO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIWRhdGUgJiYgdGltZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGltZXN0YW1wLnNwbGl0KCdUJylbMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIENoZWNrIGEgc3RyaW5nIHRvIHNlZSBpZiBpdCdzIGRpdmlkZWQgd2l0aCBhIGRhc2gsIHJldHVybmluZyB0aGUgZmlyc3QgaGFsZiBpZiBpdCBkb2Vzbid0IGNvbnRhaW4gYSBzcGVjaWZpZWQgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gb3JpZ2luYWwgVGhlIG9yaWdpbmFsIHN0cmluZyBiZWluZyBjaGVja2VkXHJcbiAgICAgKiBAcGFyYW0gY29udGFpbmVkIEEgc3RyaW5nIHRoYXQgbWlnaHQgYmUgY29udGFpbmVkIGluIHRoZSBvcmlnaW5hbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNoZWNrRGFzaGVzKG9yaWdpbmFsOiBzdHJpbmcsIGNvbnRhaW5lZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICBgY2hlY2tEYXNoZXMoICR7b3JpZ2luYWx9LCAke2NvbnRhaW5lZH0gKTogQ291bnQgJHtvcmlnaW5hbC5pbmRleE9mKFxyXG4gICAgICAgICAgICAgICAgICAgICcgLSAnXHJcbiAgICAgICAgICAgICAgICApfWBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERhc2hlcyBhcmUgcHJlc2VudFxyXG4gICAgICAgIGlmIChvcmlnaW5hbC5pbmRleE9mKCcgLSAnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU3RyaW5nIGNvbnRhaW5zIGEgZGFzaGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0OiBzdHJpbmdbXSA9IG9yaWdpbmFsLnNwbGl0KCcgLSAnKTtcclxuICAgICAgICAgICAgaWYgKHNwbGl0WzBdID09PSBjb250YWluZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgPiBTdHJpbmcgYmVmb3JlIGRhc2ggaXMgXCIke2NvbnRhaW5lZH1cIjsgdXNpbmcgc3RyaW5nIGJlaGluZCBkYXNoYFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRbMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMgVXRpbGl0aWVzIHNwZWNpZmljIHRvIEdvb2RyZWFkc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdvb2RyZWFkcyA9IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFJlbW92ZXMgc3BhY2VzIGluIGF1dGhvciBuYW1lcyB0aGF0IHVzZSBhZGphY2VudCBpbnRpdGlhbHMuXHJcbiAgICAgICAgICogQHBhcmFtIGF1dGggVGhlIGF1dGhvcihzKVxyXG4gICAgICAgICAqIEBleGFtcGxlIFwiSCBHIFdlbGxzXCIgLT4gXCJIRyBXZWxsc1wiXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc21hcnRBdXRoOiAoYXV0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgICAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBjb25zdCBhcnI6IHN0cmluZ1tdID0gVXRpbC5zdHJpbmdUb0FycmF5KGF1dGgpO1xyXG4gICAgICAgICAgICBhcnIuZm9yRWFjaCgoa2V5LCB2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQga2V5IGlzIGFuIGluaXRpYWxcclxuICAgICAgICAgICAgICAgIGlmIChrZXkubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIG5leHQga2V5IGlzIGFuIGluaXRpYWwsIGRvbid0IGFkZCBhIHNwYWNlXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dExlbmc6IG51bWJlciA9IGFyclt2YWwgKyAxXS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRMZW5nIDwgMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGAke2tleX0gYDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYCR7a2V5fSBgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gVHJpbSB0cmFpbGluZyBzcGFjZVxyXG4gICAgICAgICAgICByZXR1cm4gb3V0cC50cmltKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFR1cm5zIGEgc3RyaW5nIGludG8gYSBHb29kcmVhZHMgc2VhcmNoIFVSTFxyXG4gICAgICAgICAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIFVSTCB0byBtYWtlXHJcbiAgICAgICAgICogQHBhcmFtIGlucCBUaGUgZXh0cmFjdGVkIGRhdGEgdG8gVVJJIGVuY29kZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGJ1aWxkU2VhcmNoVVJMOiAodHlwZTogQm9va0RhdGEgfCAnb24nLCBpbnA6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGdvb2RyZWFkcy5idWlsZEdyU2VhcmNoVVJMKCAke3R5cGV9LCAke2lucH0gKWApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZ3JUeXBlOiBzdHJpbmcgPSB0eXBlO1xyXG4gICAgICAgICAgICBjb25zdCBjYXNlczogYW55ID0ge1xyXG4gICAgICAgICAgICAgICAgYm9vazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyVHlwZSA9ICd0aXRsZSc7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JUeXBlID0gJ29uJztcclxuICAgICAgICAgICAgICAgICAgICBpbnAgKz0gJywgIyc7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoY2FzZXNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2VzW3R5cGVdKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGBodHRwczovL3IubXJkLm5pbmphL2h0dHBzOi8vd3d3Lmdvb2RyZWFkcy5jb20vc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQoXHJcbiAgICAgICAgICAgICAgICBpbnAucmVwbGFjZSgnJScsICcnKVxyXG4gICAgICAgICAgICApLnJlcGxhY2UoXCInXCIsICclMjcnKX0mc2VhcmNoX3R5cGU9Ym9va3Mmc2VhcmNoJTVCZmllbGQlNUQ9JHtnclR5cGV9YDtcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIGEgY2xlYW5lZCBib29rIHRpdGxlIGZyb20gYW4gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdGl0bGUgdGV4dFxyXG4gICAgICogQHBhcmFtIGF1dGggQSBzdHJpbmcgb2YgYXV0aG9yc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEJvb2tUaXRsZSA9IGFzeW5jIChcclxuICAgICAgICBkYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsLFxyXG4gICAgICAgIGF1dGg6IHN0cmluZyA9ICcnXHJcbiAgICApID0+IHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dldEJvb2tUaXRsZSgpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGV4dHJhY3RlZCA9IGRhdGEuaW5uZXJUZXh0O1xyXG4gICAgICAgIC8vIFNob3J0ZW4gdGl0bGUgYW5kIGNoZWNrIGl0IGZvciBicmFja2V0cyAmIGF1dGhvciBuYW1lc1xyXG4gICAgICAgIGV4dHJhY3RlZCA9IFV0aWwudHJpbVN0cmluZyhVdGlsLmJyYWNrZXRSZW1vdmVyKGV4dHJhY3RlZCksIDUwKTtcclxuICAgICAgICBleHRyYWN0ZWQgPSBVdGlsLmNoZWNrRGFzaGVzKGV4dHJhY3RlZCwgYXV0aCk7XHJcbiAgICAgICAgcmV0dXJuIGV4dHJhY3RlZDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIFJldHVybiBHUi1mb3JtYXR0ZWQgYXV0aG9ycyBhcyBhbiBhcnJheSBsaW1pdGVkIHRvIGBudW1gXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBhdXRob3IgbGlua3NcclxuICAgICAqIEBwYXJhbSBudW0gVGhlIG51bWJlciBvZiBhdXRob3JzIHRvIHJldHVybi4gRGVmYXVsdCAzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Qm9va0F1dGhvcnMgPSBhc3luYyAoXHJcbiAgICAgICAgZGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIG51bTogbnVtYmVyID0gM1xyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdnZXRCb29rQXV0aG9ycygpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBkYXRhLmZvckVhY2goKGF1dGhvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRoTGlzdC5wdXNoKFV0aWwuZ29vZHJlYWRzLnNtYXJ0QXV0aChhdXRob3IuaW5uZXJUZXh0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbnVtLS07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gYXV0aExpc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIHNlcmllcyBhcyBhbiBhcnJheVxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgc2VyaWVzIGxpbmtzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Qm9va1NlcmllcyA9IGFzeW5jIChkYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwpID0+IHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2dldEJvb2tTZXJpZXMoKSBmYWlsZWQ7IGVsZW1lbnQgd2FzIG51bGwhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBkYXRhLmZvckVhY2goKHNlcmllcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5wdXNoKHNlcmllcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmllc0xpc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIGEgdGFibGUtbGlrZSBhcnJheSBvZiByb3dzIGFzIGFuIG9iamVjdC5cclxuICAgICAqIFN0b3JlIHRoZSByZXR1cm5lZCBvYmplY3QgYW5kIGFjY2VzcyB1c2luZyB0aGUgcm93IHRpdGxlLCBleC4gYHN0b3JlZFsnVGl0bGU6J11gXHJcbiAgICAgKiBAcGFyYW0gcm93TGlzdCBBbiBhcnJheSBvZiB0YWJsZS1saWtlIHJvd3NcclxuICAgICAqIEBwYXJhbSB0aXRsZUNsYXNzIFRoZSBjbGFzcyB1c2VkIGJ5IHRoZSB0aXRsZSBjZWxscy4gRGVmYXVsdCBgLnRvckRldExlZnRgXHJcbiAgICAgKiBAcGFyYW0gZGF0YUNsYXNzIFRoZSBjbGFzcyB1c2VkIGJ5IHRoZSBkYXRhIGNlbGxzLiBEZWZhdWx0IGAudG9yRGV0UmlnaHRgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcm93c1RvT2JqID0gKFxyXG4gICAgICAgIHJvd0xpc3Q6IE5vZGVMaXN0T2Y8RWxlbWVudD4sXHJcbiAgICAgICAgdGl0bGVDbGFzcyA9ICcudG9yRGV0TGVmdCcsXHJcbiAgICAgICAgZGF0YUNsYXNzID0gJy50b3JEZXRSaWdodCdcclxuICAgICkgPT4ge1xyXG4gICAgICAgIGlmIChyb3dMaXN0Lmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVdGlsLnJvd3NUb09iaiggJHtyb3dMaXN0fSApOiBSb3cgbGlzdCB3YXMgZW1wdHkhYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJvd3M6IGFueVtdID0gW107XHJcblxyXG4gICAgICAgIHJvd0xpc3QuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSByb3cucXVlcnlTZWxlY3Rvcih0aXRsZUNsYXNzKTtcclxuICAgICAgICAgICAgY29uc3QgZGF0YTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gcm93LnF1ZXJ5U2VsZWN0b3IoZGF0YUNsYXNzKTtcclxuICAgICAgICAgICAgaWYgKHRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICByb3dzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGtleTogdGl0bGUudGV4dENvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignUm93IHRpdGxlIHdhcyBlbXB0eSEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcm93cy5yZWR1Y2UoKG9iaiwgaXRlbSkgPT4gKChvYmpbaXRlbS5rZXldID0gaXRlbS52YWx1ZSksIG9iaiksIHt9KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIENvbnZlcnQgYnl0ZXMgaW50byBhIGh1bWFuLXJlYWRhYmxlIHN0cmluZ1xyXG4gICAgICogQ3JlYXRlZCBieSB5eXl6eno5OTlcclxuICAgICAqIEBwYXJhbSBieXRlcyBCeXRlcyB0byBiZSBmb3JtYXR0ZWRcclxuICAgICAqIEBwYXJhbSBiID9cclxuICAgICAqIEByZXR1cm5zIFN0cmluZyBpbiB0aGUgZm9ybWF0IG9mIGV4LiBgMTIzIE1CYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGZvcm1hdEJ5dGVzID0gKGJ5dGVzOiBudW1iZXIsIGIgPSAyKSA9PiB7XHJcbiAgICAgICAgaWYgKGJ5dGVzID09PSAwKSByZXR1cm4gJzAgQnl0ZXMnO1xyXG4gICAgICAgIGNvbnN0IGMgPSAwID4gYiA/IDAgOiBiO1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZygxMDI0KSk7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgcGFyc2VGbG9hdCgoYnl0ZXMgLyBNYXRoLnBvdygxMDI0LCBpbmRleCkpLnRvRml4ZWQoYykpICtcclxuICAgICAgICAgICAgJyAnICtcclxuICAgICAgICAgICAgWydCeXRlcycsICdLaUInLCAnTWlCJywgJ0dpQicsICdUaUInLCAnUGlCJywgJ0VpQicsICdaaUInLCAnWWlCJ11baW5kZXhdXHJcbiAgICAgICAgKTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBkZXJlZmVyID0gKHVybDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGBodHRwczovL3IubXJkLm5pbmphLyR7ZW5jb2RlVVJJKHVybCl9YDtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBkZWxheSA9IChtczogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbnNlcnRzIGEgYnV0dG9uIGVsZW1lbnQgd2l0aCBvcHRpb25hbCBsaW5rIGFuZCBzdHlsaW5nLlxyXG4gICAgICogQHBhcmFtIGlkIFRoZSBJRCBvZiB0aGUgYnV0dG9uIChvcHRpb25hbCBmb3IgbGluayBidXR0b25zKVxyXG4gICAgICogQHBhcmFtIHRleHQgVGhlIHRleHQgZGlzcGxheWVkIGluIHRoZSBidXR0b25cclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIGVsZW1lbnQgdG8gYWRkIHRoZSBidXR0b24gdG8gb3IgdGhlIHNlbGVjdG9yXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBBZGRpdGlvbmFsIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xyXG4gICAgICogICAgICAtIHVybDogVVJMIHRvIGxpbmsgdG8gKG9wdGlvbmFsLCBpZiBub3QgcHJvdmlkZWQsIGEgbm9uLWxpbmsgYnV0dG9uIHdpbGwgYmUgY3JlYXRlZClcclxuICAgICAqICAgICAgLSB0eXBlOiBUaGUgSFRNTCBlbGVtZW50IHRvIGNyZWF0ZS4gRGVmYXVsdDogYGgxYCBmb3Igbm9uLWxpbmsgYnV0dG9ucywgYGFgIGZvciBsaW5rIGJ1dHRvbnNcclxuICAgICAqICAgICAgLSBvcmRlcjogZmxleCBvcmRlciAob25seSBhcHBsaWVzIGlmIGFkZGVkIGFzIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGUgdGFyZ2V0KVxyXG4gICAgICogICAgICAtIHJlbGF0aXZlOiBUaGUgcG9zaXRpb24gb2YgdGhlIGJ1dHRvbiByZWxhdGl2ZSB0byB0aGUgYHRhcmAuIERlZmF1bHQ6IGBhZnRlcmVuZGBcclxuICAgICAqICAgICAgLSBidG5DbGFzczogVGhlIGNsYXNzbmFtZSBvZiB0aGUgZWxlbWVudC4gRGVmYXVsdDogYG1wX2J0bmBcclxuICAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSByZXNvbHZpbmcgdG8gdGhlIGNyZWF0ZWQgYnV0dG9uIGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVCdXR0b25FbGVtZW50KFxyXG4gICAgICAgIGlkOiBzdHJpbmcgPSAnJyxcclxuICAgICAgICB0ZXh0OiBzdHJpbmcsXHJcbiAgICAgICAgdGFyOiBzdHJpbmcgfCBIVE1MRWxlbWVudCxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIHVybD86IHN0cmluZztcclxuICAgICAgICAgICAgdHlwZT86IHN0cmluZztcclxuICAgICAgICAgICAgb3JkZXI/OiBudW1iZXI7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlPzogJ2JlZm9yZWJlZ2luJyB8ICdhZnRlcmVuZCcgfCAnYWZ0ZXJiZWdpbicgfCAnYmVmb3JlZW5kJztcclxuICAgICAgICAgICAgYnRuQ2xhc3M/OiBzdHJpbmc7XHJcbiAgICAgICAgfSA9IHt9XHJcbiAgICApOiBQcm9taXNlPEhUTUxFbGVtZW50PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgLy8gRGVmYXVsdCBvcHRpb24gdmFsdWVzXHJcbiAgICAgICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgICAgIHVybCA9ICcnLFxyXG4gICAgICAgICAgICAgICAgdHlwZSA9IHVybCA/ICdhJyA6ICdoMScsXHJcbiAgICAgICAgICAgICAgICBvcmRlciA9IDAsXHJcbiAgICAgICAgICAgICAgICByZWxhdGl2ZSA9ICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICBidG5DbGFzcyA9ICdtcF9idG4nLFxyXG4gICAgICAgICAgICB9ID0gb3B0aW9ucztcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID1cclxuICAgICAgICAgICAgICAgIHR5cGVvZiB0YXIgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXIpIDogdGFyO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChgJHt0YXJ9IGlzIG51bGwhYCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgYnV0dG9uIGVsZW1lbnQgKGFuY2hvciBpZiBVUkwgaXMgcHJvdmlkZWQsIG90aGVyd2lzZSBnZW5lcmljKVxyXG4gICAgICAgICAgICBjb25zdCBidXR0b246IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBhdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgICAgICAgICBpZiAodXJsKSB7XHJcbiAgICAgICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdocmVmJywgdXJsKTtcclxuICAgICAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsICdfYmxhbmsnKTtcclxuICAgICAgICAgICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdtcF9idXR0b25fY2xvbmUnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKGJ0bkNsYXNzKTtcclxuICAgICAgICAgICAgICAgIGlmIChpZCkgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaWQnLCBgbXBfJHtpZH1gKTtcclxuICAgICAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnYnV0dG9uJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFwcGx5IGZsZXggb3JkZXIgaWYgaW5zZXJ0aW5nIGFzIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGUgdGFyZ2V0XHJcbiAgICAgICAgICAgIGlmIChyZWxhdGl2ZSA9PT0gJ2FmdGVyYmVnaW4nIHx8IHJlbGF0aXZlID09PSAnYmVmb3JlZW5kJykge1xyXG4gICAgICAgICAgICAgICAgYnV0dG9uLnN0eWxlLm9yZGVyID0gYCR7b3JkZXJ9YDtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbnNlcnRBZGphY2VudEVsZW1lbnQocmVsYXRpdmUsIGJ1dHRvbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KHJlbGF0aXZlLCBidXR0b24pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXNvbHZlKGJ1dHRvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInV0aWwudHNcIiAvPlxyXG4vKipcclxuICogIyBDbGFzcyBmb3IgaGFuZGxpbmcgdmFsaWRhdGlvbiAmIGNvbmZpcm1hdGlvblxyXG4gKi9cclxuY2xhc3MgQ2hlY2sge1xyXG4gICAgcHVibGljIHN0YXRpYyBuZXdWZXI6IHN0cmluZyA9IEdNX2luZm8uc2NyaXB0LnZlcnNpb247XHJcbiAgICBwdWJsaWMgc3RhdGljIHByZXZWZXI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCdtcF92ZXJzaW9uJyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIFdhaXQgZm9yIGFuIGVsZW1lbnQgdG8gZXhpc3QsIHRoZW4gcmV0dXJuIGl0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgLSBUaGUgRE9NIHN0cmluZyB0aGF0IHdpbGwgYmUgdXNlZCB0byBzZWxlY3QgYW4gZWxlbWVudFxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxIVE1MRWxlbWVudD59IFByb21pc2Ugb2YgYW4gZWxlbWVudCB0aGF0IHdhcyBzZWxlY3RlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGVsZW1Mb2FkKFxyXG4gICAgICAgIHNlbGVjdG9yOiBzdHJpbmcgfCBIVE1MRWxlbWVudFxyXG4gICAgKTogUHJvbWlzZTxIVE1MRWxlbWVudCB8IGZhbHNlPiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAlYyBMb29raW5nIGZvciAke3NlbGVjdG9yfWAsICdiYWNrZ3JvdW5kOiAjMjIyOyBjb2xvcjogIzU1NScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgX2NvdW50ZXIgPSAwO1xyXG4gICAgICAgIGNvbnN0IF9jb3VudGVyTGltaXQgPSAyMDA7XHJcbiAgICAgICAgY29uc3QgbG9naWMgPSBhc3luYyAoXHJcbiAgICAgICAgICAgIHNlbGVjdG9yOiBzdHJpbmcgfCBIVE1MRWxlbWVudFxyXG4gICAgICAgICk6IFByb21pc2U8SFRNTEVsZW1lbnQgfCBmYWxzZT4gPT4ge1xyXG4gICAgICAgICAgICAvLyBTZWxlY3QgdGhlIGFjdHVhbCBlbGVtZW50XHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW06IEhUTUxFbGVtZW50IHwgbnVsbCA9XHJcbiAgICAgICAgICAgICAgICB0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnXHJcbiAgICAgICAgICAgICAgICAgICAgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxyXG4gICAgICAgICAgICAgICAgICAgIDogc2VsZWN0b3I7XHJcblxyXG4gICAgICAgICAgICBpZiAoZWxlbSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBgJHtzZWxlY3Rvcn0gaXMgdW5kZWZpbmVkIWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVsZW0gPT09IG51bGwgJiYgX2NvdW50ZXIgPCBfY291bnRlckxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBVdGlsLmFmVGltZXIoKTtcclxuICAgICAgICAgICAgICAgIF9jb3VudGVyKys7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgbG9naWMoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0gPT09IG51bGwgJiYgX2NvdW50ZXIgPj0gX2NvdW50ZXJMaW1pdCkge1xyXG4gICAgICAgICAgICAgICAgX2NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGxvZ2ljKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogUnVuIGEgZnVuY3Rpb24gd2hlbmV2ZXIgYW4gZWxlbWVudCBjaGFuZ2VzXHJcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgLSBUaGUgZWxlbWVudCB0byBiZSBvYnNlcnZlZC4gQ2FuIGJlIGEgc3RyaW5nLlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIC0gVGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBvYnNlcnZlciB0cmlnZ2Vyc1xyXG4gICAgICogQHJldHVybiBQcm9taXNlIG9mIGEgbXV0YXRpb24gb2JzZXJ2ZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBlbGVtT2JzZXJ2ZXIoXHJcbiAgICAgICAgc2VsZWN0b3I6IHN0cmluZyB8IEhUTUxFbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBjYWxsYmFjazogTXV0YXRpb25DYWxsYmFjayxcclxuICAgICAgICBjb25maWc6IE11dGF0aW9uT2JzZXJ2ZXJJbml0ID0ge1xyXG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXHJcbiAgICAgICAgfVxyXG4gICAgKTogUHJvbWlzZTxNdXRhdGlvbk9ic2VydmVyPiB7XHJcbiAgICAgICAgbGV0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkID0gPEhUTUxFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkbid0IGZpbmQgJyR7c2VsZWN0b3J9J2ApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgIGAlYyBTZXR0aW5nIG9ic2VydmVyIG9uICR7c2VsZWN0b3J9OiAke3NlbGVjdGVkfWAsXHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZDogIzIyMjsgY29sb3I6ICM1ZDhhYTgnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoY2FsbGJhY2spO1xyXG5cclxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHNlbGVjdGVkISwgY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSBpZiB0aGUgc2NyaXB0IGhhcyBiZWVuIHVwZGF0ZWQgZnJvbSBhbiBvbGRlciB2ZXJzaW9uXHJcbiAgICAgKiBAcmV0dXJuIFRoZSB2ZXJzaW9uIHN0cmluZyBvciBmYWxzZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHVwZGF0ZWQoKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoJ0NoZWNrLnVwZGF0ZWQoKScpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgUFJFViBWRVIgPSAke3RoaXMucHJldlZlcn1gKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYE5FVyBWRVIgPSAke3RoaXMubmV3VmVyfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgLy8gRGlmZmVyZW50IHZlcnNpb25zOyB0aGUgc2NyaXB0IHdhcyB1cGRhdGVkXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5ld1ZlciAhPT0gdGhpcy5wcmV2VmVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGlzIG5ldyBvciB1cGRhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBTdG9yZSB0aGUgbmV3IHZlcnNpb25cclxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF92ZXJzaW9uJywgdGhpcy5uZXdWZXIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJldlZlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBzY3JpcHQgaGFzIHJ1biBiZWZvcmVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBoYXMgcnVuIGJlZm9yZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJ3VwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QtdGltZSBydW5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBoYXMgbmV2ZXIgcnVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRW5hYmxlIHRoZSBtb3N0IGJhc2ljIGZlYXR1cmVzXHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ2dvb2RyZWFkc0J0bicsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdhbGVydHMnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCdmaXJzdFJ1bicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBub3QgdXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSB3aGF0IHBhZ2UgaXMgYmVpbmcgYWNjZXNzZWRcclxuICAgICAqIEBwYXJhbSB7VmFsaWRQYWdlfSBwYWdlUXVlcnkgLSBBbiBvcHRpb25hbCBwYWdlIHRvIHNwZWNpZmljYWxseSBjaGVjayBmb3JcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8c3RyaW5nPn0gQSBwcm9taXNlIGNvbnRhaW5pbmcgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgcGFnZVxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxib29sZWFuPn0gT3B0aW9uYWxseSwgYSBib29sZWFuIGlmIHRoZSBjdXJyZW50IHBhZ2UgbWF0Y2hlcyB0aGUgYHBhZ2VRdWVyeWBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBwYWdlKHBhZ2VRdWVyeT86IFZhbGlkUGFnZSk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZFBhZ2UgPSBHTV9nZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcclxuICAgICAgICBsZXQgY3VycmVudFBhZ2U6IFZhbGlkUGFnZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIENoZWNrLnBhZ2UoKSBoYXMgYmVlbiBydW4gYW5kIGEgdmFsdWUgd2FzIHN0b3JlZFxyXG4gICAgICAgICAgICBpZiAoc3RvcmVkUGFnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBqdXN0IGNoZWNraW5nIHdoYXQgcGFnZSB3ZSdyZSBvbiwgcmV0dXJuIHRoZSBzdG9yZWQgcGFnZVxyXG4gICAgICAgICAgICAgICAgaWYgKCFwYWdlUXVlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHN0b3JlZFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGNoZWNraW5nIGZvciBhIHNwZWNpZmljIHBhZ2UsIHJldHVybiBUUlVFL0ZBTFNFXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhZ2VRdWVyeSA9PT0gc3RvcmVkUGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sucGFnZSgpIGhhcyBub3QgcHJldmlvdXMgcnVuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgcGFnZVxyXG4gICAgICAgICAgICAgICAgbGV0IHBhdGg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgICAgICAgICAgIHBhdGggPSBwYXRoLmluZGV4T2YoJy5waHAnKSA/IHBhdGguc3BsaXQoJy5waHAnKVswXSA6IHBhdGg7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYWdlID0gcGF0aC5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgcGFnZS5zaGlmdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQYWdlIFVSTCBAICR7cGFnZS5qb2luKCcgLT4gJyl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIG9iamVjdCBsaXRlcmFsIG9mIHNvcnRzIHRvIHVzZSBhcyBhIFwic3dpdGNoXCJcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IFZhbGlkUGFnZSB8IHVuZGVmaW5lZCB9ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICcnOiAoKSA9PiAnaG9tZScsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6ICgpID0+ICdob21lJyxcclxuICAgICAgICAgICAgICAgICAgICBzaG91dGJveDogKCkgPT4gJ3Nob3V0Ym94JyxcclxuICAgICAgICAgICAgICAgICAgICBwcmVmZXJlbmNlczogKCkgPT4gJ3NldHRpbmdzJyxcclxuICAgICAgICAgICAgICAgICAgICBtaWxsaW9uYWlyZXM6ICgpID0+ICd2YXVsdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdDogKCkgPT4gJ3RvcnJlbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHU6ICgpID0+ICd1c2VyJyxcclxuICAgICAgICAgICAgICAgICAgICBmOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYWdlWzFdID09PSAndCcpIHJldHVybiAnZm9ydW0gdGhyZWFkJztcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFnZVsxXSA9PT0gJ2Jyb3dzZScpIHJldHVybiAnYnJvd3NlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFnZVsxXSA9PT0gJ3JlcXVlc3RzMicpIHJldHVybiAncmVxdWVzdCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhZ2VbMV0gPT09ICd2aWV3UmVxdWVzdCcpIHJldHVybiAncmVxdWVzdCBkZXRhaWxzJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFnZVsxXSA9PT0gJ3VwbG9hZCcpIHJldHVybiAndXBsb2FkJztcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG5ld1VzZXJzOiAoKSA9PiAnbmV3IHVzZXJzJyxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGhhdmUgYSBjYXNlIHRoYXQgbWF0Y2hlcyB0aGUgY3VycmVudCBwYWdlXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FzZXNbcGFnZVswXV0pIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50UGFnZSA9IGNhc2VzW3BhZ2VbMF1dKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgUGFnZSBcIiR7cGFnZX1cIiBpcyBub3QgYSB2YWxpZCBNKyBwYWdlLiBQYXRoOiAke3BhdGh9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRQYWdlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIHRoZSBjdXJyZW50IHBhZ2UgdG8gYmUgYWNjZXNzZWQgbGF0ZXJcclxuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnLCBjdXJyZW50UGFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGp1c3QgY2hlY2tpbmcgd2hhdCBwYWdlIHdlJ3JlIG9uLCByZXR1cm4gdGhlIHBhZ2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhZ2VRdWVyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGN1cnJlbnRQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgY2hlY2tpbmcgZm9yIGEgc3BlY2lmaWMgcGFnZSwgcmV0dXJuIFRSVUUvRkFMU0VcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhZ2VRdWVyeSA9PT0gY3VycmVudFBhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQ2hlY2sgdG8gc2VlIGlmIGEgZ2l2ZW4gY2F0ZWdvcnkgaXMgYW4gZWJvb2svYXVkaW9ib29rIGNhdGVnb3J5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgaXNCb29rQ2F0KGNhdDogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgLy8gQ3VycmVudGx5LCBhbGwgYm9vayBjYXRlZ29yaWVzIGFyZSBhc3N1bWVkIHRvIGJlIGluIHRoZSByYW5nZSBvZiAzOS0xMjBcclxuICAgICAgICByZXR1cm4gY2F0ID49IDM5ICYmIGNhdCA8PSAxMjAgPyB0cnVlIDogZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImNoZWNrLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiBDbGFzcyBmb3IgaGFuZGxpbmcgdmFsdWVzIGFuZCBtZXRob2RzIHJlbGF0ZWQgdG8gc3R5bGVzXHJcbiAqIEBjb25zdHJ1Y3RvciBJbml0aWFsaXplcyB0aGVtZSBiYXNlZCBvbiBsYXN0IHNhdmVkIHZhbHVlOyBjYW4gYmUgY2FsbGVkIGJlZm9yZSBwYWdlIGNvbnRlbnQgaXMgbG9hZGVkXHJcbiAqIEBtZXRob2QgdGhlbWUgR2V0cyBvciBzZXRzIHRoZSBjdXJyZW50IHRoZW1lXHJcbiAqL1xyXG5jbGFzcyBTdHlsZSB7XHJcbiAgICBwcml2YXRlIF90aGVtZTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfcHJldlRoZW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIF9jc3NEYXRhOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gVGhlIGxpZ2h0IHRoZW1lIGlzIHRoZSBkZWZhdWx0IHRoZW1lLCBzbyB1c2UgTSsgTGlnaHQgdmFsdWVzXHJcbiAgICAgICAgdGhpcy5fdGhlbWUgPSAnbGlnaHQnO1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIHByZXZpb3VzbHkgdXNlZCB0aGVtZSBvYmplY3RcclxuICAgICAgICB0aGlzLl9wcmV2VGhlbWUgPSB0aGlzLl9nZXRQcmV2VGhlbWUoKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIHRoZW1lIG9iamVjdCBleGlzdHMsIGFzc3VtZSB0aGUgY3VycmVudCB0aGVtZSBpcyBpZGVudGljYWxcclxuICAgICAgICBpZiAodGhpcy5fcHJldlRoZW1lICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fdGhlbWUgPSB0aGlzLl9wcmV2VGhlbWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykgY29uc29sZS53YXJuKCdubyBwcmV2aW91cyB0aGVtZScpO1xyXG5cclxuICAgICAgICAvLyBGZXRjaCB0aGUgQ1NTIGRhdGFcclxuICAgICAgICB0aGlzLl9jc3NEYXRhID0gR01fZ2V0UmVzb3VyY2VUZXh0KCdNUF9DU1MnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQWxsb3dzIHRoZSBjdXJyZW50IHRoZW1lIHRvIGJlIHJldHVybmVkICovXHJcbiAgICBnZXQgdGhlbWUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdGhlbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFsbG93cyB0aGUgY3VycmVudCB0aGVtZSB0byBiZSBzZXQgKi9cclxuICAgIHNldCB0aGVtZSh2YWw6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX3RoZW1lID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBTZXRzIHRoZSBNKyB0aGVtZSBiYXNlZCBvbiB0aGUgc2l0ZSB0aGVtZSAqL1xyXG4gICAgcHVibGljIGFzeW5jIGFsaWduVG9TaXRlVGhlbWUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgdGhlbWU6IHN0cmluZyA9IGF3YWl0IHRoaXMuX2dldFNpdGVDU1MoKTtcclxuICAgICAgICB0aGlzLl90aGVtZSA9IHRoZW1lLmluZGV4T2YoJ2RhcmsnKSA+IDAgPyAnZGFyaycgOiAnbGlnaHQnO1xyXG4gICAgICAgIGlmICh0aGlzLl9wcmV2VGhlbWUgIT09IHRoaXMuX3RoZW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldFByZXZUaGVtZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5qZWN0IHRoZSBDU1MgY2xhc3MgdXNlZCBieSBNKyBmb3IgdGhlbWluZ1xyXG4gICAgICAgIENoZWNrLmVsZW1Mb2FkKCdib2R5JykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJvZHk6IEhUTUxCb2R5RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XHJcbiAgICAgICAgICAgIGlmIChib2R5KSB7XHJcbiAgICAgICAgICAgICAgICBib2R5LmNsYXNzTGlzdC5hZGQoYG1wXyR7dGhpcy5fdGhlbWV9YCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQm9keSBpcyAke2JvZHl9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogSW5qZWN0cyB0aGUgc3R5bGVzaGVldCBsaW5rIGludG8gdGhlIGhlYWRlciAqL1xyXG4gICAgcHVibGljIGluamVjdExpbmsoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaWQ6IHN0cmluZyA9ICdtcF9jc3MnO1xyXG4gICAgICAgIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlOiBIVE1MU3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcclxuICAgICAgICAgICAgc3R5bGUuaWQgPSBpZDtcclxuICAgICAgICAgICAgc3R5bGUuaW5uZXJUZXh0ID0gdGhpcy5fY3NzRGF0YSAhPT0gdW5kZWZpbmVkID8gdGhpcy5fY3NzRGF0YSA6ICcnO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkJykhLmFwcGVuZENoaWxkKHN0eWxlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKVxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGFuIGVsZW1lbnQgd2l0aCB0aGUgaWQgXCIke2lkfVwiIGFscmVhZHkgZXhpc3RzYCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFJldHVybnMgdGhlIHByZXZpb3VzIHRoZW1lIG9iamVjdCBpZiBpdCBleGlzdHMgKi9cclxuICAgIHByaXZhdGUgX2dldFByZXZUaGVtZSgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiBHTV9nZXRWYWx1ZSgnc3R5bGVfdGhlbWUnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogU2F2ZXMgdGhlIGN1cnJlbnQgdGhlbWUgZm9yIGZ1dHVyZSByZWZlcmVuY2UgKi9cclxuICAgIHByaXZhdGUgX3NldFByZXZUaGVtZSgpOiB2b2lkIHtcclxuICAgICAgICBHTV9zZXRWYWx1ZSgnc3R5bGVfdGhlbWUnLCB0aGlzLl90aGVtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0U2l0ZUNTUygpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB0aGVtZVVSTDogc3RyaW5nIHwgbnVsbCA9IGRvY3VtZW50XHJcbiAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcignaGVhZCBsaW5rW2hyZWYqPVwiSUNHc3RhdGlvblwiXScpIVxyXG4gICAgICAgICAgICAgICAgLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoZW1lVVJMID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGVtZVVSTCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihgdGhlbWVVcmwgaXMgbm90IGEgc3RyaW5nOiAke3RoZW1lVVJMfWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jaGVjay50c1wiIC8+XHJcbi8qKlxyXG4gKiBDT1JFIEZFQVRVUkVTXHJcbiAqXHJcbiAqIFlvdXIgZmVhdHVyZSBiZWxvbmdzIGhlcmUgaWYgdGhlIGZlYXR1cmU6XHJcbiAqIEEpIGlzIGNyaXRpY2FsIHRvIHRoZSB1c2Vyc2NyaXB0XHJcbiAqIEIpIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgYnkgb3RoZXIgZmVhdHVyZXNcclxuICogQykgd2lsbCBoYXZlIHNldHRpbmdzIGRpc3BsYXllZCBvbiB0aGUgU2V0dGluZ3MgcGFnZVxyXG4gKiBJZiBBICYgQiBhcmUgbWV0IGJ1dCBub3QgQyBjb25zaWRlciB1c2luZyBgVXRpbHMudHNgIGluc3RlYWRcclxuICovXHJcblxyXG4vKipcclxuICogVGhpcyBmZWF0dXJlIGNyZWF0ZXMgYSBwb3AtdXAgbm90aWZpY2F0aW9uXHJcbiAqL1xyXG5jbGFzcyBBbGVydHMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5PdGhlcixcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnYWxlcnRzJyxcclxuICAgICAgICBkZXNjOiAnRW5hYmxlIHRoZSBNQU0rIEFsZXJ0IHBhbmVsIGZvciB1cGRhdGUgaW5mb3JtYXRpb24sIGV0Yy4nLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaCh0aGlzLl9zZXR0aW5ncyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG5vdGlmeShraW5kOiBzdHJpbmcgfCBib29sZWFuLCBsb2c6IEFycmF5T2JqZWN0KTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5ncm91cChgQWxlcnRzLm5vdGlmeSggJHtraW5kfSApYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgLy8gVmVyaWZ5IGEgbm90aWZpY2F0aW9uIHJlcXVlc3Qgd2FzIG1hZGVcclxuICAgICAgICAgICAgaWYgKGtpbmQpIHtcclxuICAgICAgICAgICAgICAgIC8vIFZlcmlmeSBub3RpZmljYXRpb25zIGFyZSBhbGxvd2VkXHJcbiAgICAgICAgICAgICAgICBpZiAoR01fZ2V0VmFsdWUoJ2FsZXJ0cycpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW50ZXJuYWwgZnVuY3Rpb24gdG8gYnVpbGQgbXNnIHRleHRcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidWlsZE1zZyA9IChcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyOiBzdHJpbmdbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgICAgICk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGJ1aWxkTXNnKCAke3RpdGxlfSApYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBhcnJheSBpc24ndCBlbXB0eVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyLmxlbmd0aCA+IDAgJiYgYXJyWzBdICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGlzcGxheSB0aGUgc2VjdGlvbiBoZWFkaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbXNnOiBzdHJpbmcgPSBgPGg0PiR7dGl0bGV9OjwvaDQ+PHVsPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMb29wIG92ZXIgZWFjaCBpdGVtIGluIHRoZSBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnIuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyArPSBgPGxpPiR7aXRlbX08L2xpPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBtc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2xvc2UgdGhlIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyArPSAnPC91bD4nO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtc2c7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEludGVybmFsIGZ1bmN0aW9uIHRvIGJ1aWxkIG5vdGlmaWNhdGlvbiBwYW5lbFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1aWxkUGFuZWwgPSAobXNnOiBzdHJpbmcpOiB2b2lkID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgYnVpbGRQYW5lbCggJHttc2d9IClgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnYm9keScpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgKz0gYDxkaXYgY2xhc3M9J21wX25vdGlmaWNhdGlvbic+JHttc2d9PHNwYW4+WDwvc3Bhbj48L2Rpdj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbXNnQm94OiBFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX25vdGlmaWNhdGlvbidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvc2VCdG46IEhUTUxTcGFuRWxlbWVudCA9IG1zZ0JveC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbG9zZUJ0bikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgY2xvc2UgYnV0dG9uIGlzIGNsaWNrZWQsIHJlbW92ZSBpdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobXNnQm94KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZ0JveC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlOiBzdHJpbmcgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtpbmQgPT09ICd1cGRhdGVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCdWlsZGluZyB1cGRhdGUgbWVzc2FnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN0YXJ0IHRoZSBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgPHN0cm9uZz5NQU0rIGhhcyBiZWVuIHVwZGF0ZWQhPC9zdHJvbmc+IFlvdSBhcmUgbm93IHVzaW5nIHYke01QLlZFUlNJT059LCBjcmVhdGVkIG9uICR7TVAuVElNRVNUQU1QfS4gRGlzY3VzcyBpdCBvbiA8YSBocmVmPSdmb3J1bXMucGhwP2FjdGlvbj12aWV3dG9waWMmdG9waWNpZD00MTg2Myc+dGhlIGZvcnVtczwvYT4uPGhyPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgY2hhbmdlbG9nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gYnVpbGRNc2cobG9nLlVQREFURV9MSVNULCAnQ2hhbmdlcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IGJ1aWxkTXNnKGxvZy5CVUdfTElTVCwgJ0tub3duIEJ1Z3MnKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGtpbmQgPT09ICdmaXJzdFJ1bicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGg0PldlbGNvbWUgdG8gTUFNKyE8L2g0PlBsZWFzZSBoZWFkIG92ZXIgdG8geW91ciA8YSBocmVmPVwiL3ByZWZlcmVuY2VzL2luZGV4LnBocFwiPnByZWZlcmVuY2VzPC9hPiB0byBlbmFibGUgdGhlIE1BTSsgc2V0dGluZ3MuPGJyPkFueSBidWcgcmVwb3J0cywgZmVhdHVyZSByZXF1ZXN0cywgZXRjLiBjYW4gYmUgbWFkZSBvbiA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2dhcmRlbnNoYWRlL21hbS1wbHVzL2lzc3Vlc1wiPkdpdGh1YjwvYT4sIDxhIGhyZWY9XCIvZm9ydW1zLnBocD9hY3Rpb249dmlld3RvcGljJnRvcGljaWQ9NDE4NjNcIj50aGUgZm9ydW1zPC9hPiwgb3IgPGEgaHJlZj1cIi9zZW5kbWVzc2FnZS5waHA/cmVjZWl2ZXI9MTA4MzAzXCI+dGhyb3VnaCBwcml2YXRlIG1lc3NhZ2U8L2E+Lic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0J1aWxkaW5nIGZpcnN0IHJ1biBtZXNzYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgUmVjZWl2ZWQgbXNnIGtpbmQ6ICR7a2luZH1gKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRQYW5lbChtZXNzYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBOb3RpZmljYXRpb25zIGFyZSBkaXNhYmxlZFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdGlmaWNhdGlvbnMgYXJlIGRpc2FibGVkLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBEZWJ1ZyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLk90aGVyLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdkZWJ1ZycsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ0Vycm9yIGxvZyAoPGVtPkNsaWNrIHRoaXMgY2hlY2tib3ggdG8gZW5hYmxlIHZlcmJvc2UgbG9nZ2luZyB0byB0aGUgY29uc29sZTwvZW0+KScsXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIE1QLnNldHRpbmdzR2xvYi5wdXNoKHRoaXMuX3NldHRpbmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqICMgR0xPQkFMIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqICMjIEhpZGUgdGhlIGhvbWUgYnV0dG9uIG9yIHRoZSBiYW5uZXJcclxuICovXHJcbmNsYXNzIEhpZGVIb21lIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogRHJvcGRvd25TZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIHR5cGU6ICdkcm9wZG93bicsXHJcbiAgICAgICAgdGl0bGU6ICdoaWRlSG9tZScsXHJcbiAgICAgICAgdGFnOiAnUmVtb3ZlIGJhbm5lci9ob21lJyxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICdEbyBub3QgcmVtb3ZlIGVpdGhlcicsXHJcbiAgICAgICAgICAgIGhpZGVCYW5uZXI6ICdIaWRlIHRoZSBiYW5uZXInLFxyXG4gICAgICAgICAgICBoaWRlSG9tZTogJ0hpZGUgdGhlIGhvbWUgYnV0dG9uJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc2M6ICdSZW1vdmUgdGhlIGhlYWRlciBpbWFnZSBvciBIb21lIGJ1dHRvbiwgYmVjYXVzZSBib3RoIGxpbmsgdG8gdGhlIGhvbWVwYWdlJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWFpbm1lbnUnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgaGlkZXI6IHN0cmluZyA9IEdNX2dldFZhbHVlKHRoaXMuX3NldHRpbmdzLnRpdGxlKTtcclxuICAgICAgICBpZiAoaGlkZXIgPT09ICdoaWRlSG9tZScpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdtcF9oaWRlX2hvbWUnKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSGlkIHRoZSBob21lIGJ1dHRvbiEnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGhpZGVyID09PSAnaGlkZUJhbm5lcicpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdtcF9oaWRlX2Jhbm5lcicpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBIaWQgdGhlIGJhbm5lciEnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IERyb3Bkb3duU2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMgQnlwYXNzIHRoZSB2YXVsdCBpbmZvIHBhZ2VcclxuICovXHJcbmNsYXNzIFZhdWx0TGluayBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndmF1bHRMaW5rJyxcclxuICAgICAgICBkZXNjOiAnTWFrZSB0aGUgVmF1bHQgbGluayBieXBhc3MgdGhlIFZhdWx0IEluZm8gcGFnZScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21pbGxpb25JbmZvJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGRvY3VtZW50XHJcbiAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKHRoaXMuX3RhcikhXHJcbiAgICAgICAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnL21pbGxpb25haXJlcy9kb25hdGUucGhwJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTWFkZSB0aGUgdmF1bHQgdGV4dCBsaW5rIHRvIHRoZSBkb25hdGUgcGFnZSEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIyBTaG9ydGVuIHRoZSB2YXVsdCAmIHJhdGlvIHRleHRcclxuICovXHJcbmNsYXNzIE1pbmlWYXVsdEluZm8gaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ21pbmlWYXVsdEluZm8nLFxyXG4gICAgICAgIGRlc2M6ICdTaG9ydGVuIHRoZSBWYXVsdCBsaW5rICYgcmF0aW8gdGV4dCcsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21pbGxpb25JbmZvJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHZhdWx0VGV4dDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGNvbnN0IHJhdGlvVGV4dDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RtUicpITtcclxuXHJcbiAgICAgICAgLy8gU2hvcnRlbiB0aGUgcmF0aW8gdGV4dFxyXG4gICAgICAgIC8vIFRPRE86IG1vdmUgdGhpcyB0byBpdHMgb3duIHNldHRpbmc/XHJcbiAgICAgICAgLyogVGhpcyBjaGFpbmVkIG1vbnN0cm9zaXR5IGRvZXMgdGhlIGZvbGxvd2luZzpcclxuICAgICAgICAtIEV4dHJhY3QgdGhlIG51bWJlciAod2l0aCBmbG9hdCkgZnJvbSB0aGUgZWxlbWVudFxyXG4gICAgICAgIC0gRml4IHRoZSBmbG9hdCB0byAyIGRlY2ltYWwgcGxhY2VzICh3aGljaCBjb252ZXJ0cyBpdCBiYWNrIGludG8gYSBzdHJpbmcpXHJcbiAgICAgICAgLSBDb252ZXJ0IHRoZSBzdHJpbmcgYmFjayBpbnRvIGEgbnVtYmVyIHNvIHRoYXQgd2UgY2FuIGNvbnZlcnQgaXQgd2l0aGB0b0xvY2FsZVN0cmluZ2AgdG8gZ2V0IGNvbW1hcyBiYWNrICovXHJcbiAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKFV0aWwuZXh0cmFjdEZsb2F0KHJhdGlvVGV4dClbMF0udG9GaXhlZCgyKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICByYXRpb1RleHQuaW5uZXJIVE1MID0gYCR7bnVtfSA8aW1nIHNyYz1cIi9waWMvdXBkb3duQmlnLnBuZ1wiIGFsdD1cInJhdGlvXCI+YDtcclxuXHJcbiAgICAgICAgLy8gVHVybiB0aGUgbnVtZXJpYyBwb3J0aW9uIG9mIHRoZSB2YXVsdCBsaW5rIGludG8gYSBudW1iZXJcclxuICAgICAgICBsZXQgbmV3VGV4dDogbnVtYmVyID0gcGFyc2VJbnQoXHJcbiAgICAgICAgICAgIHZhdWx0VGV4dC50ZXh0Q29udGVudCEuc3BsaXQoJzonKVsxXS5zcGxpdCgnICcpWzFdLnJlcGxhY2UoLywvZywgJycpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCB0aGUgdmF1bHQgYW1vdW50IHRvIG1pbGxpb250aHNcclxuICAgICAgICBuZXdUZXh0ID0gTnVtYmVyKChuZXdUZXh0IC8gMWU2KS50b0ZpeGVkKDMpKTtcclxuICAgICAgICAvLyBVcGRhdGUgdGhlIHZhdWx0IHRleHRcclxuICAgICAgICB2YXVsdFRleHQudGV4dENvbnRlbnQgPSBgVmF1bHQ6ICR7bmV3VGV4dH0gbWlsbGlvbmA7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2hvcnRlbmVkIHRoZSB2YXVsdCAmIHJhdGlvIG51bWJlcnMhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMgRGlzcGxheSBib251cyBwb2ludCBkZWx0YVxyXG4gKi9cclxuY2xhc3MgQm9udXNQb2ludERlbHRhIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdib251c1BvaW50RGVsdGEnLFxyXG4gICAgICAgIGRlc2M6IGBEaXNwbGF5IGhvdyBtYW55IGJvbnVzIHBvaW50cyB5b3UndmUgZ2FpbmVkIHNpbmNlIGxhc3QgcGFnZWxvYWRgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0bUJQJztcclxuICAgIHByaXZhdGUgX3ByZXZCUDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgX2N1cnJlbnRCUDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgX2RlbHRhOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRCUEVsOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcblxyXG4gICAgICAgIC8vIEdldCBvbGQgQlAgdmFsdWVcclxuICAgICAgICB0aGlzLl9wcmV2QlAgPSB0aGlzLl9nZXRCUCgpO1xyXG5cclxuICAgICAgICBpZiAoY3VycmVudEJQRWwgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgLy8gRXh0cmFjdCBvbmx5IHRoZSBudW1iZXIgZnJvbSB0aGUgQlAgZWxlbWVudFxyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50OiBSZWdFeHBNYXRjaEFycmF5ID0gY3VycmVudEJQRWwudGV4dENvbnRlbnQhLm1hdGNoKFxyXG4gICAgICAgICAgICAgICAgL1xcZCsvZ1xyXG4gICAgICAgICAgICApIGFzIFJlZ0V4cE1hdGNoQXJyYXk7XHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgbmV3IEJQIHZhbHVlXHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRCUCA9IHBhcnNlSW50KGN1cnJlbnRbMF0pO1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRCUCh0aGlzLl9jdXJyZW50QlApO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGRlbHRhXHJcbiAgICAgICAgICAgIHRoaXMuX2RlbHRhID0gdGhpcy5fY3VycmVudEJQIC0gdGhpcy5fcHJldkJQO1xyXG5cclxuICAgICAgICAgICAgLy8gU2hvdyB0aGUgdGV4dCBpZiBub3QgMFxyXG4gICAgICAgICAgICBpZiAodGhpcy5fZGVsdGEgIT09IDAgJiYgIWlzTmFOKHRoaXMuX2RlbHRhKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzcGxheUJQKHRoaXMuX2RlbHRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9kaXNwbGF5QlAgPSAoYnA6IG51bWJlcik6IHZvaWQgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJvbnVzQm94OiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgbGV0IGRlbHRhQm94OiBzdHJpbmcgPSAnJztcclxuXHJcbiAgICAgICAgZGVsdGFCb3ggPSBicCA+IDAgPyBgKyR7YnB9YCA6IGAke2JwfWA7XHJcblxyXG4gICAgICAgIGlmIChib251c0JveCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBib251c0JveC5pbm5lckhUTUwgKz0gYDxzcGFuIGNsYXNzPSdtcF9icERlbHRhJz4gKCR7ZGVsdGFCb3h9KTwvc3Bhbj5gO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBfc2V0QlAgPSAoYnA6IG51bWJlcik6IHZvaWQgPT4ge1xyXG4gICAgICAgIEdNX3NldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVZhbGAsIGAke2JwfWApO1xyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX2dldEJQID0gKCk6IG51bWJlciA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3RvcmVkOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1WYWxgKTtcclxuICAgICAgICBpZiAoc3RvcmVkID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHN0b3JlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIyBCbHVyIHRoZSBoZWFkZXIgYmFja2dyb3VuZFxyXG4gKi9cclxuY2xhc3MgQmx1cnJlZEhlYWRlciBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnYmx1cnJlZEhlYWRlcicsXHJcbiAgICAgICAgZGVzYzogYEFkZCBhIGJsdXJyZWQgYmFja2dyb3VuZCB0byB0aGUgaGVhZGVyIGFyZWFgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzaXRlTWFpbiA+IGhlYWRlcic7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGhlYWRlcjogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgJHt0aGlzLl90YXJ9YCk7XHJcbiAgICAgICAgY29uc3QgaGVhZGVySW1nOiBIVE1MSW1hZ2VFbGVtZW50IHwgbnVsbCA9IGhlYWRlci5xdWVyeVNlbGVjdG9yKGBpbWdgKTtcclxuXHJcbiAgICAgICAgaWYgKGhlYWRlckltZykge1xyXG4gICAgICAgICAgICBjb25zdCBoZWFkZXJTcmM6IHN0cmluZyB8IG51bGwgPSBoZWFkZXJJbWcuZ2V0QXR0cmlidXRlKCdzcmMnKTtcclxuICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBjb250YWluZXIgZm9yIHRoZSBiYWNrZ3JvdW5kXHJcbiAgICAgICAgICAgIGNvbnN0IGJsdXJyZWRCYWNrOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoJ21wX2JsdXJyZWRCYWNrJyk7XHJcbiAgICAgICAgICAgIGhlYWRlci5hcHBlbmQoYmx1cnJlZEJhY2spO1xyXG4gICAgICAgICAgICBibHVycmVkQmFjay5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBoZWFkZXJTcmMgPyBgdXJsKCR7aGVhZGVyU3JjfSlgIDogJyc7XHJcbiAgICAgICAgICAgIGJsdXJyZWRCYWNrLmNsYXNzTGlzdC5hZGQoJ21wX2NvbnRhaW5lcicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgYSBibHVycmVkIGJhY2tncm91bmQgdG8gdGhlIGhlYWRlciEnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGlzIG11c3QgbWF0Y2ggdGhlIHR5cGUgc2VsZWN0ZWQgZm9yIGB0aGlzLl9zZXR0aW5nc2BcclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICMjIEhpZGUgdGhlIHNlZWRib3ggbGlua1xyXG4gKi9cclxuY2xhc3MgSGlkZVNlZWRib3ggaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2hpZGVTZWVkYm94JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICBkZXNjOiAnUmVtb3ZlIHRoZSBcIkdldCBBIFNlZWRib3hcIiBtZW51IGl0ZW0nLFxyXG4gICAgfTtcclxuICAgIC8vIEFuIGVsZW1lbnQgdGhhdCBtdXN0IGV4aXN0IGluIG9yZGVyIGZvciB0aGUgZmVhdHVyZSB0byBydW5cclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtZW51IC5zYkRvbkNyeXB0byc7XHJcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHNlZWRib3hCdG46IEhUTUxMSUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGlmIChzZWVkYm94QnRuKSB7XHJcbiAgICAgICAgICAgIHNlZWRib3hCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSGlkIHRoZSBTZWVkYm94IGJ1dHRvbiEnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIyBIaWRlIHRoZSBkb25hdGlvbiBsaW5rXHJcbiAqL1xyXG5jbGFzcyBIaWRlRG9uYXRpb25Cb3ggaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2hpZGVEb25hdGlvbkJveCcsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgZGVzYzogJ1JlbW92ZSB0aGUgRG9uYXRpb25zIG1lbnUgaXRlbScsXHJcbiAgICB9O1xyXG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21lbnUgLm1tRG9uQm94JztcclxuICAgIC8vIFRoZSBjb2RlIHRoYXQgcnVucyB3aGVuIHRoZSBmZWF0dXJlIGlzIGNyZWF0ZWQgb24gYGZlYXR1cmVzLnRzYC5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIEFkZCAxKyB2YWxpZCBwYWdlIHR5cGUuIEV4Y2x1ZGUgZm9yIGdsb2JhbFxyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFtdKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgZG9uYXRpb25Cb3hCdG46IEhUTUxMSUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGlmIChkb25hdGlvbkJveEJ0bikge1xyXG4gICAgICAgICAgICBkb25hdGlvbkJveEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBIaWQgdGhlIERvbmF0aW9uIEJveCBidXR0b24hJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyBGaXhlZCBuYXZpZ2F0aW9uICYgc2VhcmNoXHJcbiAqL1xyXG5cclxuY2xhc3MgRml4ZWROYXYgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2ZpeGVkTmF2JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICBkZXNjOiAnRml4IHRoZSBuYXZpZ2F0aW9uL3NlYXJjaCB0byB0aGUgdG9wIG9mIHRoZSBwYWdlLicsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnYm9keSc7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSEuY2xhc3NMaXN0LmFkZCgnbXBfZml4ZWRfbmF2Jyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gUGlubmVkIHRoZSBuYXYvc2VhcmNoIHRvIHRoZSB0b3AhJyk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NoZWNrLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiBTSEFSRUQgQ09ERVxyXG4gKlxyXG4gKiBUaGlzIGlzIGZvciBhbnl0aGluZyB0aGF0J3Mgc2hhcmVkIGJldHdlZW4gZmlsZXMsIGJ1dCBpcyBub3QgZ2VuZXJpYyBlbm91Z2ggdG9cclxuICogdG8gYmVsb25nIGluIGBVdGlscy50c2AuIEkgY2FuJ3QgdGhpbmsgb2YgYSBiZXR0ZXIgd2F5IHRvIGNhdGVnb3JpemUgRFJZIGNvZGUuXHJcbiAqL1xyXG5cclxuY2xhc3MgU2hhcmVkIHtcclxuICAgIC8qKlxyXG4gICAgICogUmVjZWl2ZSBhIHRhcmdldCBhbmQgYHRoaXMuX3NldHRpbmdzLnRpdGxlYFxyXG4gICAgICogQHBhcmFtIHRhciBDU1Mgc2VsZWN0b3IgZm9yIGEgdGV4dCBpbnB1dCBib3hcclxuICAgICAqL1xyXG4gICAgLy8gVE9ETzogd2l0aCBhbGwgQ2hlY2tpbmcgYmVpbmcgZG9uZSBpbiBgVXRpbC5zdGFydEZlYXR1cmUoKWAgaXQncyBubyBsb25nZXIgbmVjZXNzYXJ5IHRvIENoZWNrIGluIHRoaXMgZnVuY3Rpb25cclxuICAgIHB1YmxpYyBmaWxsR2lmdEJveCA9IChcclxuICAgICAgICB0YXI6IHN0cmluZyxcclxuICAgICAgICBzZXR0aW5nVGl0bGU6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxudW1iZXIgfCB1bmRlZmluZWQ+ID0+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBTaGFyZWQuZmlsbEdpZnRCb3goICR7dGFyfSwgJHtzZXR0aW5nVGl0bGV9IClgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKHRhcikudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludEJveDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcilcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAocG9pbnRCb3gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyU2V0UG9pbnRzOiBudW1iZXIgPSBwYXJzZUludChcclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fZ2V0VmFsdWUoYCR7c2V0dGluZ1RpdGxlfV92YWxgKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1heFBvaW50czogbnVtYmVyID0gcGFyc2VJbnQocG9pbnRCb3guZ2V0QXR0cmlidXRlKCdtYXgnKSEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4odXNlclNldFBvaW50cykgJiYgdXNlclNldFBvaW50cyA8PSBtYXhQb2ludHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4UG9pbnRzID0gdXNlclNldFBvaW50cztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRCb3gudmFsdWUgPSBtYXhQb2ludHMudG9GaXhlZCgwKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1heFBvaW50cyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBsaXN0IG9mIGFsbCByZXN1bHRzIGZyb20gQnJvd3NlIHBhZ2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFNlYXJjaExpc3QgPSAoKTogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+PiA9PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgU2hhcmVkLmdldFNlYXJjaExpc3QoIClgKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgc2VhcmNoIHJlc3VsdHMgdG8gZXhpc3RcclxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJyNzc3IgdHJbaWQgXj0gXCJ0ZHJcIl0gdGQnKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFNlbGVjdCBhbGwgc2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNuYXRjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4gPSA8XHJcbiAgICAgICAgICAgICAgICAgICAgTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PlxyXG4gICAgICAgICAgICAgICAgPmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNzc3IgdHJbaWQgXj0gXCJ0ZHJcIl0nKTtcclxuICAgICAgICAgICAgICAgIGlmIChzbmF0Y2hMaXN0ID09PSBudWxsIHx8IHNuYXRjaExpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChgc25hdGNoTGlzdCBpcyAke3NuYXRjaExpc3R9YCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc25hdGNoTGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBUT0RPOiBNYWtlIGdvb2RyZWFkc0J1dHRvbnMoKSBpbnRvIGEgZ2VuZXJpYyBmcmFtZXdvcmsgZm9yIG90aGVyIHNpdGUncyBidXR0b25zXHJcbiAgICBwdWJsaWMgZ29vZHJlYWRzQnV0dG9ucyA9IGFzeW5jIChcclxuICAgICAgICBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXHJcbiAgICAgICAgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsXHJcbiAgICApID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRpbmcgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucy4uLicpO1xyXG4gICAgICAgIGxldCBzZXJpZXNQOiBQcm9taXNlPHN0cmluZ1tdPiwgYXV0aG9yUDogUHJvbWlzZTxzdHJpbmdbXT47XHJcbiAgICAgICAgbGV0IGF1dGhvcnMgPSAnJztcclxuXHJcbiAgICAgICAgVXRpbC5hZGRUb3JEZXRhaWxzUm93KHRhcmdldCwgJ1NlYXJjaCBHb29kcmVhZHMnLCAnbXBfZ3JSb3cnKTtcclxuXHJcbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgU2VyaWVzIGFuZCBBdXRob3JcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgIChzZXJpZXNQID0gVXRpbC5nZXRCb29rU2VyaWVzKHNlcmllc0RhdGEpKSxcclxuICAgICAgICAgICAgKGF1dGhvclAgPSBVdGlsLmdldEJvb2tBdXRob3JzKGF1dGhvckRhdGEpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy5tcF9nclJvdyAuZmxleCcpO1xyXG5cclxuICAgICAgICBjb25zdCBidXR0b25UYXI6IEhUTUxTcGFuRWxlbWVudCA9IDxIVE1MU3BhbkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cgLmZsZXgnKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKGJ1dHRvblRhciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1dHRvbiByb3cgY2Fubm90IGJlIHRhcmdldGVkIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQnVpbGQgU2VyaWVzIGJ1dHRvbnNcclxuICAgICAgICBzZXJpZXNQLnRoZW4oKHNlcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc2VyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHNlci5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uVGl0bGUgPSBzZXIubGVuZ3RoID4gMSA/IGBTZXJpZXM6ICR7aXRlbX1gIDogJ1Nlcmllcyc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ3NlcmllcycsIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlQnV0dG9uRWxlbWVudChcclxuICAgICAgICAgICAgICAgICAgICAgICAgJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvblRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b25UYXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdXJsOiB1cmwsIG9yZGVyOiA0LCByZWxhdGl2ZTogJ2FmdGVyYmVnaW4nLCBidG5DbGFzczogJ21wX2J1dHRvbl9jbG9uZScgfVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gc2VyaWVzIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQnVpbGQgQXV0aG9yIGJ1dHRvblxyXG4gICAgICAgIGF1dGhvclBcclxuICAgICAgICAgICAgLnRoZW4oKGF1dGgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChhdXRoLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRob3JzID0gYXV0aC5qb2luKCcgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ2F1dGhvcicsIGF1dGhvcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlQnV0dG9uRWxlbWVudChcclxuICAgICAgICAgICAgICAgICAgICAgICAgJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdBdXRob3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b25UYXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdXJsOiB1cmwsIG9yZGVyOiAzLCByZWxhdGl2ZTogJ2FmdGVyYmVnaW4nLCBidG5DbGFzczogJ21wX2J1dHRvbl9jbG9uZScgfVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gYXV0aG9yIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC8vIEJ1aWxkIFRpdGxlIGJ1dHRvbnNcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCBVdGlsLmdldEJvb2tUaXRsZShib29rRGF0YSwgYXV0aG9ycyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ2Jvb2snLCB0aXRsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVCdXR0b25FbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1RpdGxlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uVGFyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHVybDogdXJsLCBvcmRlcjogMiwgcmVsYXRpdmU6ICdhZnRlcmJlZ2luJywgYnRuQ2xhc3M6ICdtcF9idXR0b25fY2xvbmUnIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGEgdGl0bGUgYW5kIGF1dGhvciBib3RoIGV4aXN0LCBtYWtlIGEgVGl0bGUgKyBBdXRob3IgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhvcnMgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJvdGhVUkwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHt0aXRsZX0gJHthdXRob3JzfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVCdXR0b25FbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVGl0bGUgKyBBdXRob3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uVGFyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB1cmw6IGJvdGhVUkwsIG9yZGVyOiAxLCByZWxhdGl2ZTogJ2FmdGVyYmVnaW4nLCBidG5DbGFzczogJ21wX2J1dHRvbl9jbG9uZScgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGdlbmVyYXRlIFRpdGxlK0F1dGhvciBsaW5rIVxcblRpdGxlOiAke3RpdGxlfVxcbkF1dGhvcnM6ICR7YXV0aG9yc31gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHRpdGxlIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRlZCB0aGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zIWApO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgYXVkaWJsZUJ1dHRvbnMgPSBhc3luYyAoXHJcbiAgICAgICAgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXHJcbiAgICAgICAgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcclxuICAgICAgICB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIHRoZSBNQU0tdG8tQXVkaWJsZSBidXR0b25zLi4uJyk7XHJcbiAgICAgICAgbGV0IHNlcmllc1A6IFByb21pc2U8c3RyaW5nW10+LCBhdXRob3JQOiBQcm9taXNlPHN0cmluZ1tdPjtcclxuICAgICAgICBsZXQgYXV0aG9ycyA9ICcnO1xyXG5cclxuICAgICAgICBVdGlsLmFkZFRvckRldGFpbHNSb3codGFyZ2V0LCAnU2VhcmNoIEF1ZGlibGUnLCAnbXBfYXVSb3cnKTtcclxuXHJcbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgU2VyaWVzIGFuZCBBdXRob3JcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgIChzZXJpZXNQID0gVXRpbC5nZXRCb29rU2VyaWVzKHNlcmllc0RhdGEpKSxcclxuICAgICAgICAgICAgKGF1dGhvclAgPSBVdGlsLmdldEJvb2tBdXRob3JzKGF1dGhvckRhdGEpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy5tcF9hdVJvdyAuZmxleCcpO1xyXG5cclxuICAgICAgICBjb25zdCBidXR0b25UYXI6IEhUTUxTcGFuRWxlbWVudCA9IDxIVE1MU3BhbkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfYXVSb3cgLmZsZXgnKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKGJ1dHRvblRhciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1dHRvbiByb3cgY2Fubm90IGJlIHRhcmdldGVkIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQnVpbGQgU2VyaWVzIGJ1dHRvbnNcclxuICAgICAgICBzZXJpZXNQLnRoZW4oKHNlcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc2VyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHNlci5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uVGl0bGUgPSBzZXIubGVuZ3RoID4gMSA/IGBTZXJpZXM6ICR7aXRlbX1gIDogJ1Nlcmllcyc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3LmF1ZGlibGUuY29tL3NlYXJjaD9rZXl3b3Jkcz0ke2l0ZW19YDtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUJ1dHRvbkVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b25UaXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uVGFyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHVybDogdXJsLCBvcmRlcjogNCwgcmVsYXRpdmU6ICdhZnRlcmJlZ2luJywgYnRuQ2xhc3M6ICdtcF9idXR0b25fY2xvbmUnIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHNlcmllcyBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIEF1dGhvciBidXR0b25cclxuICAgICAgICBhdXRob3JQXHJcbiAgICAgICAgICAgIC50aGVuKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXV0aC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9ycyA9IGF1dGguam9pbignICcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5hdWRpYmxlLmNvbS9zZWFyY2g/YXV0aG9yX2F1dGhvcj0ke2F1dGhvcnN9YDtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUJ1dHRvbkVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQXV0aG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uVGFyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHVybDogdXJsLCBvcmRlcjogMywgcmVsYXRpdmU6ICdhZnRlcmJlZ2luJywgYnRuQ2xhc3M6ICdtcF9idXR0b25fY2xvbmUnIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGF1dGhvciBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAvLyBCdWlsZCBUaXRsZSBidXR0b25zXHJcbiAgICAgICAgICAgIC50aGVuKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gYXdhaXQgVXRpbC5nZXRCb29rVGl0bGUoYm9va0RhdGEsIGF1dGhvcnMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5hdWRpYmxlLmNvbS9zZWFyY2g/dGl0bGU9JHt0aXRsZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlQnV0dG9uRWxlbWVudChcclxuICAgICAgICAgICAgICAgICAgICAgICAgJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdUaXRsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvblRhcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgeyB1cmw6IHVybCwgb3JkZXI6IDIsIHJlbGF0aXZlOiAnYWZ0ZXJiZWdpbicsIGJ0bkNsYXNzOiAnbXBfYnV0dG9uX2Nsb25lJyB9XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBhIHRpdGxlIGFuZCBhdXRob3IgYm90aCBleGlzdCwgbWFrZSBhIFRpdGxlICsgQXV0aG9yIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRob3JzICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBib3RoVVJMID0gYGh0dHBzOi8vd3d3LmF1ZGlibGUuY29tL3NlYXJjaD90aXRsZT0ke3RpdGxlfSZhdXRob3JfYXV0aG9yPSR7YXV0aG9yc31gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUJ1dHRvbkVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdUaXRsZSArIEF1dGhvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidXR0b25UYXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHVybDogYm90aFVSTCwgb3JkZXI6IDEsIHJlbGF0aXZlOiAnYWZ0ZXJiZWdpbicsIGJ0bkNsYXNzOiAnbXBfYnV0dG9uX2Nsb25lJyB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gZ2VuZXJhdGUgVGl0bGUrQXV0aG9yIGxpbmshXFxuVGl0bGU6ICR7dGl0bGV9XFxuQXV0aG9yczogJHthdXRob3JzfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gdGl0bGUgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGVkIHRoZSBNQU0tdG8tQXVkaWJsZSBidXR0b25zIWApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBUT0RPOiBTd2l0Y2ggdG8gU3RvcnlHcmFwaCBBUEkgb25jZSBpdCBiZWNvbWVzIGF2YWlsYWJsZT8gT3IgYWR2YW5jZWQgc2VhcmNoXHJcbiAgICBwdWJsaWMgc3RvcnlHcmFwaEJ1dHRvbnMgPSBhc3luYyAoXHJcbiAgICAgICAgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXHJcbiAgICAgICAgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcclxuICAgICAgICB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIHRoZSBNQU0tdG8tU3RvcnlHcmFwaCBidXR0b25zLi4uJyk7XHJcbiAgICAgICAgbGV0IHNlcmllc1A6IFByb21pc2U8c3RyaW5nW10+LCBhdXRob3JQOiBQcm9taXNlPHN0cmluZ1tdPjtcclxuICAgICAgICBsZXQgYXV0aG9ycyA9ICcnO1xyXG5cclxuICAgICAgICBVdGlsLmFkZFRvckRldGFpbHNSb3codGFyZ2V0LCAnU2VhcmNoIFRoZVN0b3J5R3JhcGgnLCAnbXBfc2dSb3cnKTtcclxuXHJcbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgU2VyaWVzIGFuZCBBdXRob3JcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgIChzZXJpZXNQID0gVXRpbC5nZXRCb29rU2VyaWVzKHNlcmllc0RhdGEpKSxcclxuICAgICAgICAgICAgKGF1dGhvclAgPSBVdGlsLmdldEJvb2tBdXRob3JzKGF1dGhvckRhdGEpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy5tcF9zZ1JvdyAuZmxleCcpO1xyXG5cclxuICAgICAgICBjb25zdCBidXR0b25UYXI6IEhUTUxTcGFuRWxlbWVudCA9IDxIVE1MU3BhbkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfc2dSb3cgLmZsZXgnKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKGJ1dHRvblRhciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1dHRvbiByb3cgY2Fubm90IGJlIHRhcmdldGVkIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQnVpbGQgU2VyaWVzIGJ1dHRvbnNcclxuICAgICAgICBzZXJpZXNQLnRoZW4oKHNlcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc2VyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHNlci5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uVGl0bGUgPSBzZXIubGVuZ3RoID4gMSA/IGBTZXJpZXM6ICR7aXRlbX1gIDogJ1Nlcmllcyc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBwLnRoZXN0b3J5Z3JhcGguY29tL2Jyb3dzZT9zZWFyY2hfdGVybT0ke2l0ZW19YDtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUJ1dHRvbkVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b25UaXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uVGFyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHVybDogdXJsLCBvcmRlcjogNCwgcmVsYXRpdmU6ICdhZnRlcmJlZ2luJywgYnRuQ2xhc3M6ICdtcF9idXR0b25fY2xvbmUnIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHNlcmllcyBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIEF1dGhvciBidXR0b25cclxuICAgICAgICBhdXRob3JQXHJcbiAgICAgICAgICAgIC50aGVuKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXV0aC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9ycyA9IGF1dGguam9pbignICcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwcC50aGVzdG9yeWdyYXBoLmNvbS9icm93c2U/c2VhcmNoX3Rlcm09JHthdXRob3JzfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVCdXR0b25FbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0F1dGhvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvblRhcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgeyB1cmw6IHVybCwgb3JkZXI6IDMsIHJlbGF0aXZlOiAnYWZ0ZXJiZWdpbicsIGJ0bkNsYXNzOiAnbXBfYnV0dG9uX2Nsb25lJyB9XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBhdXRob3IgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLy8gQnVpbGQgVGl0bGUgYnV0dG9uc1xyXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IGF3YWl0IFV0aWwuZ2V0Qm9va1RpdGxlKGJvb2tEYXRhLCBhdXRob3JzKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aXRsZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAudGhlc3RvcnlncmFwaC5jb20vYnJvd3NlP3NlYXJjaF90ZXJtPSR7dGl0bGV9YDtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUJ1dHRvbkVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnVGl0bGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b25UYXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdXJsOiB1cmwsIG9yZGVyOiAyLCByZWxhdGl2ZTogJ2FmdGVyYmVnaW4nLCBidG5DbGFzczogJ21wX2J1dHRvbl9jbG9uZScgfVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYSB0aXRsZSBhbmQgYXV0aG9yIGJvdGggZXhpc3QsIG1ha2UgYSBUaXRsZSArIEF1dGhvciBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXV0aG9ycyAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYm90aFVSTCA9IGBodHRwczovL2FwcC50aGVzdG9yeWdyYXBoLmNvbS9icm93c2U/c2VhcmNoX3Rlcm09JHt0aXRsZX0gJHthdXRob3JzfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlQnV0dG9uRWxlbWVudChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1RpdGxlICsgQXV0aG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvblRhcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdXJsOiBib3RoVVJMLCBvcmRlcjogMSwgcmVsYXRpdmU6ICdhZnRlcmJlZ2luJywgYnRuQ2xhc3M6ICdtcF9idXR0b25fY2xvbmUnIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYEZhaWxlZCB0byBnZW5lcmF0ZSBUaXRsZStBdXRob3IgbGluayFcXG5UaXRsZTogJHt0aXRsZX1cXG5BdXRob3JzOiAke2F1dGhvcnN9YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyB0aXRsZSBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkZWQgdGhlIE1BTS10by1TdG9yeUdyYXBoIGJ1dHRvbnMhYCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBnZXRSYXRpb1Byb3RlY3RMZXZlbHMgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgbGV0IGwxID0gcGFyc2VGbG9hdChHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TDFfdmFsJykpO1xyXG4gICAgICAgIGxldCBsMiA9IHBhcnNlRmxvYXQoR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdEwyX3ZhbCcpKTtcclxuICAgICAgICBsZXQgbDMgPSBwYXJzZUZsb2F0KEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RMM192YWwnKSk7XHJcbiAgICAgICAgY29uc3QgbDFfZGVmID0gMC41O1xyXG4gICAgICAgIGNvbnN0IGwyX2RlZiA9IDE7XHJcbiAgICAgICAgY29uc3QgbDNfZGVmID0gMjtcclxuXHJcbiAgICAgICAgLy8gRGVmYXVsdCB2YWx1ZXMgaWYgZW1wdHlcclxuICAgICAgICBpZiAoaXNOYU4obDMpKSBsMyA9IGwzX2RlZjtcclxuICAgICAgICBpZiAoaXNOYU4obDIpKSBsMiA9IGwyX2RlZjtcclxuICAgICAgICBpZiAoaXNOYU4obDEpKSBsMSA9IGwxX2RlZjtcclxuXHJcbiAgICAgICAgLy8gSWYgc29tZW9uZSBwdXQgdGhpbmdzIGluIGEgZHVtYiBvcmRlciwgaWdub3JlIHNtYWxsZXIgbnVtYmVyc1xyXG4gICAgICAgIGlmIChsMiA+IGwzKSBsMiA9IGwzO1xyXG4gICAgICAgIGlmIChsMSA+IGwyKSBsMSA9IGwyO1xyXG5cclxuICAgICAgICAvLyBJZiBjdXN0b20gbnVtYmVycyBhcmUgc21hbGxlciB0aGFuIGRlZmF1bHQgdmFsdWVzLCBpZ25vcmUgdGhlIGxvd2VyIHdhcm5pbmdcclxuICAgICAgICBpZiAoaXNOYU4obDIpKSBsMiA9IGwzIDwgbDJfZGVmID8gbDMgOiBsMl9kZWY7XHJcbiAgICAgICAgaWYgKGlzTmFOKGwxKSkgbDEgPSBsMiA8IGwxX2RlZiA/IGwyIDogbDFfZGVmO1xyXG5cclxuICAgICAgICByZXR1cm4gW2wxLCBsMiwgbDNdO1xyXG4gICAgfTtcclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLyoqXHJcbiAqICNCUk9XU0UgUEFHRSBGRUFUVVJFU1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgU25hdGNoZWQgdG9ycmVudHMgdG8gYmUgaGlkZGVuL3Nob3duXHJcbiAqL1xyXG5jbGFzcyBUb2dnbGVTbmF0Y2hlZCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlU25hdGNoZWQnLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBidXR0b24gdG8gaGlkZS9zaG93IHJlc3VsdHMgdGhhdCB5b3UndmUgc25hdGNoZWRgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG4gICAgcHJpdmF0ZSBfaXNWaXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHByaXZhdGUgX3NlYXJjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4gfCB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIF9zbmF0Y2hlZEhvb2s6IHN0cmluZyA9ICd0ZCBkaXZbY2xhc3NePVwiYnJvd3NlXCJdJztcclxuICAgIHByaXZhdGUgX3NoYXJlOiBTaGFyZWQgPSBuZXcgU2hhcmVkKCk7XHJcbiAgICBwcml2YXRlIF9zbmF0Y2hlZENvdW50ID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGxldCB0b2dnbGU6IFByb21pc2U8SFRNTEVsZW1lbnQ+O1xyXG4gICAgICAgIGxldCByZXN1bHRMaXN0OiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4+O1xyXG4gICAgICAgIGxldCByZXN1bHRzOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+O1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZFN0YXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShcclxuICAgICAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKHN0b3JlZFN0YXRlID09PSAnZmFsc2UnICYmIEdNX2dldFZhbHVlKCdzdGlja3lTbmF0Y2hlZFRvZ2dsZScpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKGZhbHNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHRvZ2dsZVRleHQ6IHN0cmluZyA9IHRoaXMuX2lzVmlzaWJsZVxyXG4gICAgICAgICAgICA/IGBIaWRlIFNuYXRjaGVkICgwKWBcclxuICAgICAgICAgICAgOiBgU2hvdyBTbmF0Y2hlZCAoMClgO1xyXG5cclxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAodG9nZ2xlID0gVXRpbC5jcmVhdGVCdXR0b25FbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgJ3NuYXRjaGVkVG9nZ2xlJywgICAgICAgLy8gSURcclxuICAgICAgICAgICAgICAgIHRvZ2dsZVRleHQsICAgICAgICAgICAgIC8vIFRleHRcclxuICAgICAgICAgICAgICAgICcjcmVzZXROZXdJY29uJywgICAgICAgIC8vIFRhcmdldCBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2gxJywgICAgICAgICAvLyBIVE1MIGVsZW1lbnQgdHlwZVxyXG4gICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlOiAnYmVmb3JlYmVnaW4nLCAvLyBQb3NpdGlvbiByZWxhdGl2ZSB0byB0YXJnZXRcclxuICAgICAgICAgICAgICAgICAgICBidG5DbGFzczogJ3RvckZvcm1CdXR0b24nIC8vIENTUyBjbGFzc1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApKSxcclxuICAgICAgICAgICAgKHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICB0b2dnbGVcclxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzVmlzaWJsZSA9ICF0aGlzLl9pc1Zpc2libGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSB0aGlzLl9pc1Zpc2libGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gYEhpZGUgU25hdGNoZWQgKCR7dGhpcy5fc25hdGNoZWRDb3VudH0pYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBgU2hvdyBTbmF0Y2hlZCAoJHt0aGlzLl9zbmF0Y2hlZENvdW50fSlgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHJlc3VsdHMsIHRoaXMuX3NuYXRjaGVkSG9vayk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmVzdWx0TGlzdFxyXG4gICAgICAgICAgICAudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IHJlcztcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fc25hdGNoZWRIb29rKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBUb2dnbGUgU25hdGNoZWQgYnV0dG9uIScpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSByZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fc25hdGNoZWRIb29rKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbHRlcnMgc2VhcmNoIHJlc3VsdHNcclxuICAgICAqIEBwYXJhbSBsaXN0IGEgc2VhcmNoIHJlc3VsdHMgbGlzdFxyXG4gICAgICogQHBhcmFtIHN1YlRhciB0aGUgZWxlbWVudHMgdGhhdCBtdXN0IGJlIGNvbnRhaW5lZCBpbiBvdXIgZmlsdGVyZWQgcmVzdWx0c1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4sIHN1YlRhcjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc25hdGNoZWRDb3VudCA9IDA7IC8vIFJlc2V0IHNuYXRjaGVkIGNvdW50IGJlZm9yZSBmaWx0ZXJpbmdcclxuICAgICAgICBsaXN0LmZvckVhY2goKHNuYXRjaCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBidG46IEhUTUxIZWFkaW5nRWxlbWVudCA9IDxIVE1MSGVhZGluZ0VsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX3NuYXRjaGVkVG9nZ2xlJykhXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBTZWxlY3Qgb25seSB0aGUgaXRlbXMgdGhhdCBtYXRjaCBvdXIgc3ViIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gc25hdGNoLnF1ZXJ5U2VsZWN0b3Ioc3ViVGFyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NuYXRjaGVkQ291bnQrKzsgLy8gSW5jcmVtZW50IHNuYXRjaGVkIGNvdW50XHJcbiAgICAgICAgICAgICAgICAvLyBIaWRlL3Nob3cgYXMgcmVxdWlyZWRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc1Zpc2libGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9IGBTaG93IFNuYXRjaGVkICgke3RoaXMuX3NuYXRjaGVkQ291bnR9KWA7XHJcbiAgICAgICAgICAgICAgICAgICAgc25hdGNoLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSBgSGlkZSBTbmF0Y2hlZCAoJHt0aGlzLl9zbmF0Y2hlZENvdW50fSlgO1xyXG4gICAgICAgICAgICAgICAgICAgIHNuYXRjaC5zdHlsZS5kaXNwbGF5ID0gJ3RhYmxlLXJvdyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGJ1dHRvbiB0ZXh0IHdpdGggdGhlIGN1cnJlbnQgc25hdGNoZWQgY291bnRcclxuICAgICAgICBjb25zdCB0b2dnbGVTd2l0Y2g6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PihcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX3NuYXRjaGVkVG9nZ2xlJylcclxuICAgICAgICApO1xyXG4gICAgICAgIHRvZ2dsZVN3aXRjaC5pbm5lckhUTUwgPSB0aGlzLl9pc1Zpc2libGVcclxuICAgICAgICAgICAgPyBgSGlkZSBTbmF0Y2hlZCAoJHt0aGlzLl9zbmF0Y2hlZENvdW50fSlgXHJcbiAgICAgICAgICAgIDogYFNob3cgU25hdGNoZWQgKCR7dGhpcy5fc25hdGNoZWRDb3VudH0pYDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9zZXRWaXNTdGF0ZSh2YWw6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NuYXRjaCB2aXMgc3RhdGU6JywgdGhpcy5faXNWaXNpYmxlLCAnXFxudmFsOicsIHZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEdNX3NldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYCwgYCR7dmFsfWApO1xyXG4gICAgICAgIHRoaXMuX2lzVmlzaWJsZSA9IHZhbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNlYXJjaExpc3QoKTogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NlYXJjaExpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlYXJjaGxpc3QgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZWFyY2hMaXN0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2aXNpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc1Zpc2libGU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHZpc2libGUodmFsOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUodmFsKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbWVtYmVycyB0aGUgc3RhdGUgb2YgVG9nZ2xlU25hdGNoZWQgYmV0d2VlbiBwYWdlIGxvYWRzXHJcbiAqL1xyXG5jbGFzcyBTdGlja3lTbmF0Y2hlZFRvZ2dsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnc3RpY2t5U25hdGNoZWRUb2dnbGUnLFxyXG4gICAgICAgIGRlc2M6IGBNYWtlIHRvZ2dsZSBzdGF0ZSBwZXJzaXN0IGJldHdlZW4gcGFnZSBsb2Fkc2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBSZW1lbWJlcmVkIHNuYXRjaCB2aXNpYmlsaXR5IHN0YXRlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIGEgcGxhaW50ZXh0IGxpc3Qgb2Ygc2VhcmNoIHJlc3VsdHNcclxuICovXHJcbmNsYXNzIFBsYWludGV4dFNlYXJjaCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncGxhaW50ZXh0U2VhcmNoJyxcclxuICAgICAgICBkZXNjOiBgSW5zZXJ0IHBsYWludGV4dCBzZWFyY2ggcmVzdWx0cyBhdCB0b3Agb2YgcGFnZWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3NzciBoMSc7XHJcbiAgICBwcml2YXRlIF9pc09wZW46ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShcclxuICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcclxuICAgICk7XHJcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xyXG4gICAgcHJpdmF0ZSBfcGxhaW5UZXh0OiBzdHJpbmcgPSAnJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGxldCB0b2dnbGVCdG46IFByb21pc2U8SFRNTEVsZW1lbnQ+O1xyXG4gICAgICAgIGxldCBjb3B5QnRuOiBIVE1MRWxlbWVudDtcclxuICAgICAgICBsZXQgcmVzdWx0TGlzdDogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+PjtcclxuXHJcbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIHRvZ2dsZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgICh0b2dnbGVCdG4gPSBVdGlsLmNyZWF0ZUJ1dHRvbkVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgICAncGxhaW5Ub2dnbGUnLCAgICAgICAgICAgICAgIC8vIElEXHJcbiAgICAgICAgICAgICAgICAnU2hvdyBQbGFpbnRleHQnLCAgICAgICAgICAgIC8vIFRleHRcclxuICAgICAgICAgICAgICAgICcjc3NyJywgICAgICAgICAgICAgICAgICAgICAgLy8gVGFyZ2V0IGVsZW1lbnRcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZGl2JywgICAgICAgICAgICAgLy8gSFRNTCBlbGVtZW50IHR5cGVcclxuICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZTogJ2JlZm9yZWJlZ2luJywgLy8gUG9zaXRpb24gcmVsYXRpdmUgdG8gdGFyZ2V0XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuQ2xhc3M6ICdtcF90b2dnbGUgbXBfcGxhaW5CdG4nIC8vIENTUyBjbGFzc2VzXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICkpLFxyXG4gICAgICAgIChyZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgLy8gUHJvY2VzcyB0aGUgcmVzdWx0cyBpbnRvIHBsYWludGV4dFxyXG4gICAgICAgIHJlc3VsdExpc3RcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIGNvcHkgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b25FbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgICAgICdwbGFpbkNvcHknLCAgICAgICAgICAgICAgICAgIC8vIElEXHJcbiAgICAgICAgICAgICAgICAgICAgJ0NvcHkgUGxhaW50ZXh0JywgICAgICAgICAgICAgLy8gVGV4dFxyXG4gICAgICAgICAgICAgICAgICAgICcjbXBfcGxhaW5Ub2dnbGUnLCAgICAgICAgICAgIC8vIFRhcmdldCBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZGl2JywgICAgICAgICAgICAgIC8vIEhUTUwgZWxlbWVudCB0eXBlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlOiAnYWZ0ZXJlbmQnLCAgICAgLy8gUG9zaXRpb24gcmVsYXRpdmUgdG8gdGFyZ2V0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0bkNsYXNzOiAnbXBfY29weSBtcF9wbGFpbkJ0bicgLy8gQ1NTIGNsYXNzZXNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHBsYWludGV4dCBib3hcclxuICAgICAgICAgICAgICAgIGNvcHlCdG4uaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYDxicj48dGV4dGFyZWEgY2xhc3M9J21wX3BsYWludGV4dFNlYXJjaCcgc3R5bGU9J2Rpc3BsYXk6IG5vbmUnPjwvdGV4dGFyZWE+YFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgYSBjbGljayBsaXN0ZW5lclxyXG4gICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oY29weUJ0biwgdGhpcy5fcGxhaW5UZXh0KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgU2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfcGxhaW50ZXh0U2VhcmNoJykhLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdC50aGVuKGFzeW5jIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHBsYWludGV4dCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBJbml0IG9wZW4gc3RhdGVcclxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodGhpcy5faXNPcGVuKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHVwIHRvZ2dsZSBidXR0b24gZnVuY3Rpb25hbGl0eVxyXG4gICAgICAgIHRvZ2dsZUJ0blxyXG4gICAgICAgICAgICAudGhlbigoYnRuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGV4dGJveCBzaG91bGQgZXhpc3QsIGJ1dCBqdXN0IGluIGNhc2UuLi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dGJveDogSFRNTFRleHRBcmVhRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0Ym94ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRleHRib3ggZG9lc24ndCBleGlzdCFgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc09wZW4gPT09ICdmYWxzZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgndHJ1ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnSGlkZSBQbGFpbnRleHQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKCdmYWxzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdTaG93IFBsYWludGV4dCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBJbnNlcnRlZCBwbGFpbnRleHQgc2VhcmNoIHJlc3VsdHMhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIE9wZW4gU3RhdGUgdG8gdHJ1ZS9mYWxzZSBpbnRlcm5hbGx5IGFuZCBpbiBzY3JpcHQgc3RvcmFnZVxyXG4gICAgICogQHBhcmFtIHZhbCBzdHJpbmdpZmllZCBib29sZWFuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3NldE9wZW5TdGF0ZSh2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFsID0gJ2ZhbHNlJztcclxuICAgICAgICB9IC8vIERlZmF1bHQgdmFsdWVcclxuICAgICAgICBHTV9zZXRWYWx1ZSgndG9nZ2xlU25hdGNoZWRTdGF0ZScsIHZhbCk7XHJcbiAgICAgICAgdGhpcy5faXNPcGVuID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3Byb2Nlc3NSZXN1bHRzKFxyXG4gICAgICAgIHJlc3VsdHM6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD5cclxuICAgICk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBSZXNldCBlYWNoIHRleHQgZmllbGRcclxuICAgICAgICAgICAgbGV0IHRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IHNlcmllc1RpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IGF1dGhUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBuYXJyVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICAvLyBCcmVhayBvdXQgdGhlIGltcG9ydGFudCBkYXRhIGZyb20gZWFjaCBub2RlXHJcbiAgICAgICAgICAgIGNvbnN0IHJhd1RpdGxlOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJy50b3JUaXRsZScpO1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICAgICAgPiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZXJpZXMnKTtcclxuICAgICAgICAgICAgY29uc3QgYXV0aExpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcuYXV0aG9yJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBuYXJyTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgJy5uYXJyYXRvcidcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyYXdUaXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFcnJvciBOb2RlOicsIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXN1bHQgdGl0bGUgc2hvdWxkIG5vdCBiZSBudWxsYCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHJhd1RpdGxlLnRleHRDb250ZW50IS50cmltKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3Mgc2VyaWVzXHJcbiAgICAgICAgICAgIGlmIChzZXJpZXNMaXN0ICE9PSBudWxsICYmIHNlcmllc0xpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5mb3JFYWNoKChzZXJpZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSArPSBgJHtzZXJpZXMudGV4dENvbnRlbnR9IC8gYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gbGFzdCBzZXJpZXMsIHRoZW4gc3R5bGVcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gc2VyaWVzVGl0bGUuc3Vic3RyaW5nKDAsIHNlcmllc1RpdGxlLmxlbmd0aCAtIDMpO1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgPSBgICgke3Nlcmllc1RpdGxlfSlgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgYXV0aG9yc1xyXG4gICAgICAgICAgICBpZiAoYXV0aExpc3QgIT09IG51bGwgJiYgYXV0aExpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gJ0JZICc7XHJcbiAgICAgICAgICAgICAgICBhdXRoTGlzdC5mb3JFYWNoKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aFRpdGxlICs9IGAke2F1dGgudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSBhdXRoVGl0bGUuc3Vic3RyaW5nKDAsIGF1dGhUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIG5hcnJhdG9yc1xyXG4gICAgICAgICAgICBpZiAobmFyckxpc3QgIT09IG51bGwgJiYgbmFyckxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gJ0ZUICc7XHJcbiAgICAgICAgICAgICAgICBuYXJyTGlzdC5mb3JFYWNoKChuYXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFyclRpdGxlICs9IGAke25hcnIudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSBuYXJyVGl0bGUuc3Vic3RyaW5nKDAsIG5hcnJUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdXRwICs9IGAke3RpdGxlfSR7c2VyaWVzVGl0bGV9ICR7YXV0aFRpdGxlfSAke25hcnJUaXRsZX1cXG5gO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvdXRwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNPcGVuKCk6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc09wZW47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGlzT3Blbih2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodmFsKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyB0aGUgc2VhcmNoIGZlYXR1cmVzIHRvIGJlIGhpZGRlbi9zaG93blxyXG4gKi9cclxuY2xhc3MgVG9nZ2xlU2VhcmNoYm94IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd0b2dnbGVTZWFyY2hib3gnLFxyXG4gICAgICAgIGRlc2M6IGBDb2xsYXBzZSB0aGUgU2VhcmNoIGJveCBhbmQgbWFrZSBpdCB0b2dnbGVhYmxlYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG9yU2VhcmNoQ29udHJvbCc7XHJcbiAgICBwcml2YXRlIF9oZWlnaHQ6IHN0cmluZyA9ICcyNnB4JztcclxuICAgIHByaXZhdGUgX2lzT3BlbjogJ3RydWUnIHwgJ2ZhbHNlJyA9ICdmYWxzZSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCBzZWFyY2hib3g6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBpZiAoc2VhcmNoYm94KSB7XHJcbiAgICAgICAgICAgIC8vIEFkanVzdCB0aGUgdGl0bGUgdG8gbWFrZSBpdCBjbGVhciBpdCBpcyBhIHRvZ2dsZSBidXR0b25cclxuICAgICAgICAgICAgY29uc3QgdGl0bGU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHNlYXJjaGJveC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgJy5ibG9ja0hlYWRDb24gaDQnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmICh0aXRsZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gQWRqdXN0IHRleHQgJiBzdHlsZVxyXG4gICAgICAgICAgICAgICAgdGl0bGUuaW5uZXJIVE1MID0gJ1RvZ2dsZSBTZWFyY2gnO1xyXG4gICAgICAgICAgICAgICAgdGl0bGUuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgICAgICAgICAgLy8gU2V0IHVwIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgICAgICAgICB0aXRsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl90b2dnbGUoc2VhcmNoYm94ISk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBzZXQgdXAgdG9nZ2xlISBUYXJnZXQgZG9lcyBub3QgZXhpc3QnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBDb2xsYXBzZSB0aGUgc2VhcmNoYm94XHJcbiAgICAgICAgICAgIFV0aWwuc2V0QXR0cihzZWFyY2hib3gsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiBgaGVpZ2h0OiR7dGhpcy5faGVpZ2h0fTtvdmVyZmxvdzpoaWRkZW47YCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIEhpZGUgZXh0cmEgdGV4dFxyXG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb246IEhUTUxIZWFkaW5nRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgJyNtYWluQm9keSA+IGgzJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBndWlkZUxpbms6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAnI21haW5Cb2R5ID4gaDMgfiBhJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uKSBub3RpZmljYXRpb24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgaWYgKGd1aWRlTGluaykgZ3VpZGVMaW5rLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb2xsYXBzZWQgdGhlIFNlYXJjaCBib3ghJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGNvbGxhcHNlIFNlYXJjaCBib3ghIFRhcmdldCBkb2VzIG5vdCBleGlzdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF90b2dnbGUoZWxlbTogSFRNTERpdkVsZW1lbnQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBpZiAodGhpcy5faXNPcGVuID09PSAnZmFsc2UnKSB7XHJcbiAgICAgICAgICAgIGVsZW0uc3R5bGUuaGVpZ2h0ID0gJ3Vuc2V0JztcclxuICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gJ3RydWUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVsZW0uc3R5bGUuaGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xyXG4gICAgICAgICAgICB0aGlzLl9pc09wZW4gPSAnZmFsc2UnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdUb2dnbGVkIFNlYXJjaCBib3ghJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBHZW5lcmF0ZXMgbGlua2VkIHRhZ3MgZnJvbSB0aGUgc2l0ZSdzIHBsYWludGV4dCB0YWcgZmllbGRcclxuICovXHJcbmNsYXNzIEJ1aWxkVGFncyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnYnVpbGRUYWdzJyxcclxuICAgICAgICBkZXNjOiBgR2VuZXJhdGUgY2xpY2thYmxlIFRhZ3MgYXV0b21hdGljYWxseWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdHNMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xyXG5cclxuICAgICAgICAvLyBCdWlsZCB0aGUgdGFnc1xyXG4gICAgICAgIHJlc3VsdHNMaXN0XHJcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHRzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZvckVhY2goKHIpID0+IHRoaXMuX3Byb2Nlc3NUYWdTdHJpbmcocikpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQnVpbHQgdGFnIGxpbmtzIScpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNMaXN0LnRoZW4oKHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHRhZ3MgYWdhaW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChyKSA9PiB0aGlzLl9wcm9jZXNzVGFnU3RyaW5nKHIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQnVpbHQgdGFnIGxpbmtzIScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBDb2RlIHRvIHJ1biBmb3IgZXZlcnkgc2VhcmNoIHJlc3VsdFxyXG4gICAgICogQHBhcmFtIHJlcyBBIHNlYXJjaCByZXN1bHQgcm93XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3Byb2Nlc3NUYWdTdHJpbmcgPSAocmVzOiBIVE1MVGFibGVSb3dFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGFnbGluZSA9IDxIVE1MU3BhbkVsZW1lbnQ+cmVzLnF1ZXJ5U2VsZWN0b3IoJy50b3JSb3dEZXNjJyk7XHJcblxyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cCh0YWdsaW5lKTtcclxuXHJcbiAgICAgICAgLy8gQXNzdW1lIGJyYWNrZXRzIGNvbnRhaW4gdGFnc1xyXG4gICAgICAgIGxldCB0YWdTdHJpbmcgPSB0YWdsaW5lLmlubmVySFRNTC5yZXBsYWNlKC8oPzpcXFt8XFxdfFxcKHxcXCl8JCkvZ2ksICcsJyk7XHJcbiAgICAgICAgLy8gUmVtb3ZlIEhUTUwgRW50aXRpZXMgYW5kIHR1cm4gdGhlbSBpbnRvIGJyZWFrc1xyXG4gICAgICAgIHRhZ1N0cmluZyA9IHRhZ1N0cmluZy5zcGxpdCgvKD86Ji57MSw1fTspL2cpLmpvaW4oJzsnKTtcclxuICAgICAgICAvLyBTcGxpdCB0YWdzIGF0ICcsJyBhbmQgJzsnIGFuZCAnPicgYW5kICd8J1xyXG4gICAgICAgIGxldCB0YWdzID0gdGFnU3RyaW5nLnNwbGl0KC9cXHMqKD86O3wsfD58XFx8fCQpXFxzKi8pO1xyXG4gICAgICAgIC8vIFJlbW92ZSBlbXB0eSBvciBsb25nIHRhZ3NcclxuICAgICAgICB0YWdzID0gdGFncy5maWx0ZXIoKHRhZykgPT4gdGFnLmxlbmd0aCA8PSAzMCAmJiB0YWcubGVuZ3RoID4gMCk7XHJcbiAgICAgICAgLy8gQXJlIHRhZ3MgYWxyZWFkeSBhZGRlZD8gT25seSBhZGQgaWYgbnVsbFxyXG4gICAgICAgIGNvbnN0IHRhZ0JveDogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IHJlcy5xdWVyeVNlbGVjdG9yKCcubXBfdGFncycpO1xyXG4gICAgICAgIGlmICh0YWdCb3ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5faW5qZWN0TGlua3ModGFncywgdGFnbGluZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGFncyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBJbmplY3RzIHRoZSBnZW5lcmF0ZWQgdGFnc1xyXG4gICAgICogQHBhcmFtIHRhZ3MgQXJyYXkgb2YgdGFncyB0byBhZGRcclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIHNlYXJjaCByZXN1bHQgcm93IHRoYXQgdGhlIHRhZ3Mgd2lsbCBiZSBhZGRlZCB0b1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9pbmplY3RMaW5rcyA9ICh0YWdzOiBzdHJpbmdbXSwgdGFyOiBIVE1MU3BhbkVsZW1lbnQpID0+IHtcclxuICAgICAgICBpZiAodGFncy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIEluc2VydCB0aGUgbmV3IHRhZyByb3dcclxuICAgICAgICAgICAgY29uc3QgdGFnUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgICAgICB0YWdSb3cuY2xhc3NMaXN0LmFkZCgnbXBfdGFncycpO1xyXG4gICAgICAgICAgICB0YXIuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmViZWdpbicsIHRhZ1Jvdyk7XHJcbiAgICAgICAgICAgIHRhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB0YWdSb3cuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xyXG4gICAgICAgICAgICAvLyBBZGQgdGhlIHRhZ3MgdG8gdGhlIHRhZyByb3dcclxuICAgICAgICAgICAgdGFncy5mb3JFYWNoKCh0YWcpID0+IHtcclxuICAgICAgICAgICAgICAgIHRhZ1Jvdy5pbm5lckhUTUwgKz0gYDxhIGNsYXNzPSdtcF90YWcnIGhyZWY9Jy90b3IvYnJvd3NlLnBocD90b3IlNUJ0ZXh0JTVEPSUyMiR7ZW5jb2RlVVJJQ29tcG9uZW50KFxyXG4gICAgICAgICAgICAgICAgICAgIHRhZ1xyXG4gICAgICAgICAgICAgICAgKX0lMjImdG9yJTVCc3JjaEluJTVEJTVCdGFncyU1RD10cnVlJz4ke3RhZ308L2E+YDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSYW5kb20gQm9vayBmZWF0dXJlIHRvIG9wZW4gYSBuZXcgdGFiL3dpbmRvdyB3aXRoIGEgcmFuZG9tIE1BTSBCb29rXHJcbiAqL1xyXG5jbGFzcyBSYW5kb21Cb29rIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYW5kb21Cb29rJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIG9wZW4gYSByYW5kb21seSBzZWxlY3RlZCBib29rIHBhZ2UuICg8ZW0+VXNlcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGNhdGVnb3J5IGluIHRoZSBkcm9wZG93bjwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBsZXQgcmFuZG86IFByb21pc2U8SFRNTEVsZW1lbnQ+O1xyXG4gICAgICAgIGNvbnN0IHJhbmRvVGV4dDogc3RyaW5nID0gJ1JhbmRvbSBCb29rJztcclxuXHJcbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIGJ1dHRvbiBhbmQgZ2V0dGluZyB0aGUgcmVzdWx0c1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHJhbmRvID0gVXRpbC5jcmVhdGVCdXR0b25FbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgJ3JhbmRvbUJvb2snLCAgICAgICAgICAgICAgICAvLyBJRFxyXG4gICAgICAgICAgICAgICAgcmFuZG9UZXh0LCAgICAgICAgICAgICAgICAgICAvLyBUZXh0XHJcbiAgICAgICAgICAgICAgICAnI3Jlc2V0TmV3SWNvbicsICAgICAgICAgICAgIC8vIFRhcmdldCBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2gxJywgICAgICAgICAgICAgIC8vIEhUTUwgZWxlbWVudCB0eXBlXHJcbiAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmU6ICdiZWZvcmViZWdpbicsIC8vIFBvc2l0aW9uIHJlbGF0aXZlIHRvIHRoZSB0YXJnZXRcclxuICAgICAgICAgICAgICAgICAgICBidG5DbGFzczogJ3RvckZvcm1CdXR0b24nIC8vIENTUyBjbGFzc2VzXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICByYW5kb1xyXG4gICAgICAgICAgICAudGhlbigoYnRuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvdW50UmVzdWx0OiBQcm9taXNlPG51bWJlcj47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXRlZ29yaWVzOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIENhdGVnb3J5IGRyb3Bkb3duIGVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2F0U2VsZWN0aW9uOiBIVE1MU2VsZWN0RWxlbWVudCA9IDxIVE1MU2VsZWN0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2F0ZWdvcnlQYXJ0aWFsJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIHZhbHVlIGN1cnJlbnRseSBzZWxlY3RlZCBpbiBDYXRlZ29yeSBEcm9wZG93blxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRWYWx1ZTogc3RyaW5nID0gY2F0U2VsZWN0aW9uIS5vcHRpb25zW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0U2VsZWN0aW9uLnNlbGVjdGVkSW5kZXhcclxuICAgICAgICAgICAgICAgICAgICAgICAgXS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9kZXBlbmRpbmcgb24gY2F0ZWdvcnkgc2VsZWN0ZWQsIGNyZWF0ZSBhIGNhdGVnb3J5IHN0cmluZyBmb3IgdGhlIEpTT04gR0VUXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoU3RyaW5nKGNhdFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQUxMJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdkZWZhdWx0cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTEzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTMnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTE0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTE1JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTE2JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTYnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0VmFsdWUuY2hhckF0KDApID09PSAnYycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW2NhdF1bXT0nICsgY2F0VmFsdWUuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY291bnRSZXN1bHQgPSB0aGlzLl9nZXRSYW5kb21Cb29rUmVzdWx0cyhjYXRlZ29yaWVzKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudFJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGdldFJhbmRvbVJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vb3BlbiBuZXcgdGFiIHdpdGggdGhlIHJhbmRvbSBib29rXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L3QvJyArIGdldFJhbmRvbVJlc3VsdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ19ibGFuaydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgdGhlIFJhbmRvbSBCb29rIGJ1dHRvbiEnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbHRlcnMgc2VhcmNoIHJlc3VsdHNcclxuICAgICAqIEBwYXJhbSBjYXQgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgY2F0ZWdvcmllcyBuZWVkZWQgZm9yIEpTT04gR2V0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgX2dldFJhbmRvbUJvb2tSZXN1bHRzKGNhdDogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQganNvblJlc3VsdDogUHJvbWlzZTxzdHJpbmc+O1xyXG4gICAgICAgICAgICAvL1VSTCB0byBHRVQgcmFuZG9tIHNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L3Rvci9qcy9sb2FkU2VhcmNoSlNPTmJhc2ljLnBocD90b3Jbc2VhcmNoVHlwZV09YWxsJnRvcltzZWFyY2hJbl09dG9ycmVudHMke2NhdH0mdG9yW3BlcnBhZ2VdPTUmdG9yW2Jyb3dzZUZsYWdzSGlkZVZzU2hvd109MCZ0b3Jbc3RhcnREYXRlXT0mdG9yW2VuZERhdGVdPSZ0b3JbaGFzaF09JnRvcltzb3J0VHlwZV09cmFuZG9tJnRodW1ibmFpbD10cnVlPyR7VXRpbC5yYW5kb21OdW1iZXIoXHJcbiAgICAgICAgICAgICAgICAxLFxyXG4gICAgICAgICAgICAgICAgMTAwMDAwXHJcbiAgICAgICAgICAgICl9YDtcclxuICAgICAgICAgICAgUHJvbWlzZS5hbGwoWyhqc29uUmVzdWx0ID0gVXRpbC5nZXRKU09OKHVybCkpXSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBqc29uUmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGpzb25GdWxsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmV0dXJuIHRoZSBmaXJzdCB0b3JyZW50IElEIG9mIHRoZSByYW5kb20gSlNPTiB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShqc29uRnVsbCkuZGF0YVswXS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XHJcblxyXG4vKipcclxuICogKiBBbGxvd3MgZ2lmdGluZyBvZiBGTCB3ZWRnZSB0byBtZW1iZXJzIHRocm91Z2ggZm9ydW0uXHJcbiAqL1xyXG5jbGFzcyBGb3J1bUZMR2lmdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuRm9ydW0sXHJcbiAgICAgICAgdGl0bGU6ICdmb3J1bUZMR2lmdCcsXHJcbiAgICAgICAgZGVzYzogYEFkZCBhIFRoYW5rIGJ1dHRvbiB0byBmb3J1bSBwb3N0cy4gKDxlbT5TZW5kcyBhIEZMIHdlZGdlPC9lbT4pYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuZm9ydW1MaW5rJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2ZvcnVtIHRocmVhZCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxpbmcgRm9ydW0gR2lmdCBCdXR0b24uLi4nKTtcclxuICAgICAgICAvL21haW5Cb2R5IGlzIGJlc3QgZWxlbWVudCB3aXRoIGFuIElEIEkgY291bGQgZmluZCB0aGF0IGlzIGEgcGFyZW50IHRvIGFsbCBmb3J1bSBwb3N0c1xyXG4gICAgICAgIGNvbnN0IG1haW5Cb2R5ID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keScpO1xyXG4gICAgICAgIC8vbWFrZSBhcnJheSBvZiBmb3J1bSBwb3N0cyAtIHRoZXJlIGlzIG9ubHkgb25lIGN1cnNvciBjbGFzc2VkIG9iamVjdCBwZXIgZm9ydW0gcG9zdCwgc28gdGhpcyB3YXMgYmVzdCB0byBrZXkgb2ZmIG9mLiB3aXNoIHRoZXJlIHdlcmUgbW9yZSBJRHMgYW5kIHN1Y2ggdXNlZCBpbiBmb3J1bXNcclxuICAgICAgICBjb25zdCBmb3J1bVBvc3RzOiBIVE1MQW5jaG9yRWxlbWVudFtdID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoXHJcbiAgICAgICAgICAgIG1haW5Cb2R5LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NvbHRhYmxlJylcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vZm9yIGVhY2ggcG9zdCBvbiB0aGUgcGFnZVxyXG4gICAgICAgIGZvcnVtUG9zdHMuZm9yRWFjaCgoZm9ydW1Qb3N0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vd29yayBvdXIgd2F5IGRvd24gdGhlIHN0cnVjdHVyZSBvZiB0aGUgSFRNTCB0byBnZXQgdG8gb3VyIHBvc3RcclxuICAgICAgICAgICAgbGV0IGJvdHRvbVJvdyA9IGZvcnVtUG9zdC5jaGlsZE5vZGVzWzFdO1xyXG4gICAgICAgICAgICBib3R0b21Sb3cgPSBib3R0b21Sb3cuY2hpbGROb2Rlc1s0XTtcclxuICAgICAgICAgICAgYm90dG9tUm93ID0gYm90dG9tUm93LmNoaWxkTm9kZXNbM107XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBJRCBvZiB0aGUgZm9ydW0gZnJvbSB0aGUgY3VzdG9tIE1BTSBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgbGV0IHBvc3RJRCA9ICg8SFRNTEVsZW1lbnQ+Zm9ydW1Qb3N0LnByZXZpb3VzU2libGluZyEpLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICAvL21hbSBkZWNpZGVkIHRvIGhhdmUgYSBkaWZmZXJlbnQgc3RydWN0dXJlIGZvciBsYXN0IGZvcnVtLiB3aXNoIHRoZXkganVzdCBoYWQgSURzIG9yIHNvbWV0aGluZyBpbnN0ZWFkIG9mIGFsbCB0aGlzIGp1bXBpbmcgYXJvdW5kXHJcbiAgICAgICAgICAgIGlmIChwb3N0SUQgPT09ICdsYXN0Jykge1xyXG4gICAgICAgICAgICAgICAgcG9zdElEID0gKDxIVE1MRWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ydW1Qb3N0LnByZXZpb3VzU2libGluZyEucHJldmlvdXNTaWJsaW5nIVxyXG4gICAgICAgICAgICAgICAgKSkuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9jcmVhdGUgYSBuZXcgZWxlbWVudCBmb3Igb3VyIGZlYXR1cmVcclxuICAgICAgICAgICAgY29uc3QgZ2lmdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgICAgIC8vc2V0IHNhbWUgY2xhc3MgYXMgb3RoZXIgb2JqZWN0cyBpbiBhcmVhIGZvciBzYW1lIHBvaW50ZXIgYW5kIGZvcm1hdHRpbmcgb3B0aW9uc1xyXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2N1cnNvcicpO1xyXG4gICAgICAgICAgICAvL2dpdmUgb3VyIGVsZW1lbnQgYW4gSUQgZm9yIGZ1dHVyZSBzZWxlY3Rpb24gYXMgbmVlZGVkXHJcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfJyArIHBvc3RJRCArICdfdGV4dCcpO1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSBuZXcgaW1nIGVsZW1lbnQgdG8gbGVhZCBvdXIgbmV3IGZlYXR1cmUgdmlzdWFsc1xyXG4gICAgICAgICAgICBjb25zdCBnaWZ0SWNvbkdpZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgICAgICAvL3VzZSBzaXRlIGZyZWVsZWVjaCBnaWYgaWNvbiBmb3Igb3VyIGZlYXR1cmVcclxuICAgICAgICAgICAgZ2lmdEljb25HaWYuc2V0QXR0cmlidXRlKFxyXG4gICAgICAgICAgICAgICAgJ3NyYycsXHJcbiAgICAgICAgICAgICAgICAnaHR0cHM6Ly9jZG4ubXlhbm9uYW1vdXNlLm5ldC9pbWFnZWJ1Y2tldC8xMDgzMDMvdGhhbmsuZ2lmJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAvL21ha2UgdGhlIGdpZiBpY29uIHRoZSBmaXJzdCBjaGlsZCBvZiBlbGVtZW50XHJcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKGdpZnRJY29uR2lmKTtcclxuICAgICAgICAgICAgLy9hZGQgdGhlIGZlYXR1cmUgZWxlbWVudCBpbiBsaW5lIHdpdGggdGhlIGN1cnNvciBvYmplY3Qgd2hpY2ggaXMgdGhlIHF1b3RlIGFuZCByZXBvcnQgYnV0dG9ucyBhdCBib3R0b21cclxuICAgICAgICAgICAgYm90dG9tUm93LmFwcGVuZENoaWxkKGdpZnRFbGVtZW50KTtcclxuXHJcbiAgICAgICAgICAgIC8vbWFrZSBpdCBhIGJ1dHRvbiB2aWEgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90byBhdm9pZCBidXR0b24gdHJpZ2dlcmluZyBtb3JlIHRoYW4gb25jZSBwZXIgcGFnZSBsb2FkLCBjaGVjayBpZiBhbHJlYWR5IGhhdmUganNvbiByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ2lmdEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPD0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2R1ZSB0byBsYWNrIG9mIElEcyBhbmQgY29uZmxpY3RpbmcgcXVlcnkgc2VsZWN0YWJsZSBlbGVtZW50cywgbmVlZCB0byBqdW1wIHVwIGEgZmV3IHBhcmVudCBsZXZlbHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zdFBhcmVudE5vZGUgPSBnaWZ0RWxlbWVudC5wYXJlbnRFbGVtZW50IS5wYXJlbnRFbGVtZW50IVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmVudEVsZW1lbnQhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL29uY2UgYXQgcGFyZW50IG5vZGUgb2YgdGhlIHBvc3QsIGZpbmQgdGhlIHBvc3RlcidzIHVzZXIgaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlckVsZW0gPSBwb3N0UGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKGBhW2hyZWZePVwiL3UvXCJdYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBVUkwgb2YgdGhlIHBvc3QgdG8gYWRkIHRvIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zdFVSTCA9ICg8SFRNTEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhcmVudE5vZGUucXVlcnlTZWxlY3RvcihgYVtocmVmXj1cIi9mL3QvXCJdYCkhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkpLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgbmFtZSBvZiB0aGUgY3VycmVudCBNQU0gdXNlciBzZW5kaW5nIGdpZnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbmRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTWVudScpIS5pbm5lclRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY2xlYW4gdXAgdGV4dCBvZiBzZW5kZXIgb2JqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlciA9IHNlbmRlci5zdWJzdHJpbmcoMCwgc2VuZGVyLmluZGV4T2YoJyAnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSB0aXRsZSBvZiB0aGUgcGFnZSBzbyB3ZSBjYW4gd3JpdGUgaW4gbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZm9ydW1UaXRsZSA9IGRvY3VtZW50LnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2N1dCBkb3duIGZsdWZmIGZyb20gcGFnZSB0aXRsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3J1bVRpdGxlID0gZm9ydW1UaXRsZS5zdWJzdHJpbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAyMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcnVtVGl0bGUuaW5kZXhPZignfCcpIC0gMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgbWVtYmVycyBuYW1lIGZvciBKU09OIHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZSA9ICg8SFRNTEVsZW1lbnQ+dXNlckVsZW0hKS5pbm5lclRleHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1VSTCB0byBHRVQgYSBnaWZ0IHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi9ib251c0J1eS5waHA/c3BlbmR0eXBlPXNlbmRXZWRnZSZnaWZ0VG89JHt1c2VyTmFtZX0mbWVzc2FnZT0ke3NlbmRlcn0gd2FudHMgdG8gdGhhbmsgeW91IGZvciB5b3VyIGNvbnRyaWJ1dGlvbiB0byB0aGUgZm9ydW0gdG9waWMgW3VybD1odHRwczovL215YW5vbmFtb3VzZS5uZXQke3Bvc3RVUkx9XSR7Zm9ydW1UaXRsZX1bL3VybF1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL21ha2UgIyBVUkkgY29tcGF0aWJsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgnIycsICclMjMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy91c2UgTUFNKyBqc29uIGdldCB1dGlsaXR5IHRvIHByb2Nlc3MgVVJMIGFuZCByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uUmVzdWx0OiBzdHJpbmcgPSBhd2FpdCBVdGlsLmdldEpTT04odXJsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnR2lmdCBSZXN1bHQnLCBqc29uUmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBnaWZ0IHdhcyBzdWNjZXNzZnVsbHkgc2VudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSlNPTi5wYXJzZShqc29uUmVzdWx0KS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCB0aGUgZmVhdHVyZSB0ZXh0IHRvIHNob3cgc3VjY2Vzc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0ZMIEdpZnQgU3VjY2Vzc2Z1bCEnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYmFzZWQgb24gZmFpbHVyZSwgYWRkIGZlYXR1cmUgdGV4dCB0byBzaG93IGZhaWx1cmUgcmVhc29uIG9yIGdlbmVyaWNcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IgPT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnWW91IGNhbiBvbmx5IHNlbmQgYSB1c2VyIG9uZSB3ZWRnZSBwZXIgZGF5LidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZDogQWxyZWFkeSBHaWZ0ZWQgVGhpcyBVc2VyIFRvZGF5ISdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShqc29uUmVzdWx0KS5lcnJvciA9PT1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJbnZhbGlkIHVzZXIsIHRoaXMgdXNlciBpcyBub3QgY3VycmVudGx5IGFjY2VwdGluZyB3ZWRnZXMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQ6IFRoaXMgVXNlciBEb2VzIE5vdCBBY2NlcHQgR2lmdHMhJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL29ubHkga25vd24gZXhhbXBsZSBvZiB0aGlzICdvdGhlcicgaXMgd2hlbiBnaWZ0aW5nIHlvdXJzZWxmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnRkwgR2lmdCBGYWlsZWQhJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqICMjIyBBZGRzIGFiaWxpdHkgdG8gZ2lmdCBuZXdlc3QgMzAgbWVtYmVycyB0byBNQU0gb24gSG9tZXBhZ2Ugb3Igb3BlbiB0aGVpciB1c2VyIHBhZ2VzXHJcbiAqL1xyXG5jbGFzcyBHaWZ0TmV3ZXN0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICAvKiBUT0RPOiBSZWZhY3RvciBjb2RlIHRvIHJlZHVjZSBkdXBsaWNhdGlvbi4gKi9cclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5Ib21lLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdnaWZ0TmV3ZXN0JyxcclxuICAgICAgICBkZXNjOiBgQWRkIGJ1dHRvbnMgdG8gR2lmdC9PcGVuIGFsbCBuZXdlc3QgbWVtYmVyc2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5UYWJsZSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydob21lJywgJ25ldyB1c2VycyddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogRGVjaWRlIHdoaWNoIHBhZ2UgdG8gcnVuIG9uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgQ2hlY2sucGFnZSgpLnRoZW4oKHBhZ2U6VmFsaWRQYWdlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnVXNlciBnaWZ0aW5nIGluaXQgb24nLHBhZ2UpO1xyXG5cclxuICAgICAgICAgICAgaWYocGFnZSA9PT0gJ2hvbWUnKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hvbWVQYWdlR2lmdGluZygpO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZihwYWdlID09PSAnbmV3IHVzZXJzJyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9uZXdVc2Vyc1BhZ2VHaWZ0aW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBGdW5jdGlvbiB0aGF0IHJ1bnMgb24gdGhlIEhvbWUgcGFnZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFzeW5jIF9ob21lUGFnZUdpZnRpbmcoKSB7XHJcbiAgICAgICAgdGhpcy5fdHJpbUdpZnRMaXN0KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gV2FpdCBmb3IgdGhlIGNvbnRhaW5lciB0byByZW5kZXIgdG8gYXZvaWQgdGhlIGVtcHR5IGFycmF5IHJhY2UgY29uZGl0aW9uXHJcbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJyNuZXdlc3RNZW1iZXJzJyk7XHJcblxyXG4gICAgICAgIC8vIEhlbHBlciB0byBzeW5jIHZpc3VhbCBzdGF0ZSB3aXRoIHBlcnNpc3RlbnQgaGlzdG9yeVxyXG4gICAgICAgIGNvbnN0IHN5bmNTdGF0ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ld2VzdE1lbWJlcnMnKTtcclxuICAgICAgICAgICAgaWYgKCFjb250YWluZXIpIHJldHVybjtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IGhpc3RvcnlTdHIgPSBTdHJpbmcoR01fZ2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnKSB8fCAnJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGhpc3RvcnkgPSBoaXN0b3J5U3RyLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1lbWJlcnMgPSBBcnJheS5mcm9tKGNvbnRhaW5lci5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpKTtcclxuXHJcbiAgICAgICAgICAgIG1lbWJlcnMuZm9yRWFjaCgobWVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFV0aWwuZW5kT2ZIcmVmKG1lbWJlcik7XHJcbiAgICAgICAgICAgICAgICBtZW1iZXIuc2V0QXR0cmlidXRlKCdjbGFzcycsIGBtcF9yZWZQb2ludF8ke2lkfWApO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyBFeGFjdCBtYXRjaCBjaGVja2luZyBhbmQgZ29sZCBjb2xvciBvdmVycmlkZVxyXG4gICAgICAgICAgICAgICAgaWYgKGhpc3RvcnkuaW5jbHVkZXMoaWQpICYmICFtZW1iZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdtcF9naWZ0ZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlci5jbGFzc0xpc3QuYWRkKCdtcF9naWZ0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzcGFuID0gbWVtYmVyLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3Bhbikgc3Bhbi5zdHlsZS5jb2xvciA9ICdyZ2IoMTg3LCAxNzAsIDExOSknO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBSdW4gaW5pdGlhbCBzeW5jXHJcbiAgICAgICAgc3luY1N0YXRlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gV2F0Y2ggZm9yIE1BTSdzIG5hdGl2ZSBBSkFYIHJlZnJlc2ggYnV0dG9uXHJcbiAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjbmV3ZXN0TWVtYmVycycsIHN5bmNTdGF0ZSk7XHJcblxyXG4gICAgICAgIC8vZ2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIGdpZnRzIHNldCBpbiBwcmVmZXJlbmNlcyBmb3IgdXNlciBwYWdlXHJcbiAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyA9IFN0cmluZyhHTV9nZXRWYWx1ZSgndXNlckdpZnREZWZhdWx0X3ZhbCcpIHx8ICcxMDAnKTtcclxuICAgICAgICAvL21ha2Ugc3VyZSB0aGUgdmFsdWUgZmFsbHMgd2l0aGluIHRoZSBhY2NlcHRhYmxlIHJhbmdlXHJcbiAgICAgICAgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA+IDEwMCB8fCBpc05hTihOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykpKSB7XHJcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwJztcclxuICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA8IDUpIHtcclxuICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICc1JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhpamFjayB0aGUgYmxvY2sgZm9vdGVyIGZvciBVSSBjb250cm9sc1xyXG4gICAgICAgIGNvbnN0IGZvb3RlcldyYXBwZXIgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZwTk0gLmJsb2NrRm9vdCcpO1xyXG4gICAgICAgIGZvb3RlcldyYXBwZXIuc3R5bGUuY3NzVGV4dCA9ICdkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgZ2FwOiA2cHg7IHBhZGRpbmc6IDJweCAwOyBtaW4taGVpZ2h0OiAzMnB4OyB3aGl0ZS1zcGFjZTogbm93cmFwOyc7XHJcblxyXG4gICAgICAgIC8vY3JlYXRlIHRoZSB0ZXh0IGlucHV0IGZvciBob3cgbWFueSBwb2ludHMgdG8gZ2l2ZVxyXG4gICAgICAgIGNvbnN0IGdpZnRBbW91bnRzOiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBVdGlsLnNldEF0dHIoZ2lmdEFtb3VudHMsIHtcclxuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICBzaXplOiAnMycsXHJcbiAgICAgICAgICAgIGlkOiAnbXBfZ2lmdEFtb3VudHMnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ1ZhbHVlIGJldHdlZW4gNSBhbmQgMTAwJyxcclxuICAgICAgICAgICAgdmFsdWU6IGdpZnRWYWx1ZVNldHRpbmcsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gVmVydGljYWwgYWxpZ25tZW50IGZpeCBmb3IgaW5wdXRcclxuICAgICAgICBnaWZ0QW1vdW50cy5zdHlsZS5oZWlnaHQgPSAnMjJweCc7XHJcbiAgICAgICAgZ2lmdEFtb3VudHMuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGFwcGVuZCBpbnB1dCB0byBmb290ZXJcclxuICAgICAgICBmb290ZXJXcmFwcGVyLmFwcGVuZENoaWxkKGdpZnRBbW91bnRzKTtcclxuXHJcbiAgICAgICAgLy8gU3RhbmRhcmQgRE9NIEJ1dHRvbiBHZW5lcmF0aW9uIChCeXBhc3NlcyBtaXNzaW5nIFV0aWwgcHJvcGVydGllcyBvbiBvbGRlciBicmFuY2hlcylcclxuICAgICAgICBjb25zdCBnaWZ0QWxsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgZ2lmdEFsbEJ0bi5pZCA9ICdtcF9naWZ0QWxsJztcclxuICAgICAgICBnaWZ0QWxsQnRuLmNsYXNzTmFtZSA9ICdtcF9idG4nO1xyXG4gICAgICAgIGdpZnRBbGxCdG4uaW5uZXJUZXh0ID0gJ0dpZnQgQWxsJztcclxuICAgICAgICBnaWZ0QW1vdW50cy5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWJlZ2luJywgZ2lmdEFsbEJ0bik7XHJcblxyXG4gICAgICAgIC8vIFZlcnRpY2FsIGFsaWdubWVudCBmaXggZm9yIGJ1dHRvblxyXG4gICAgICAgIGdpZnRBbGxCdG4uc3R5bGUuaGVpZ2h0ID0gJzIycHgnO1xyXG4gICAgICAgIGdpZnRBbGxCdG4uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtZmxleCc7XHJcbiAgICAgICAgZ2lmdEFsbEJ0bi5zdHlsZS5hbGlnbkl0ZW1zID0gJ2NlbnRlcic7XHJcblxyXG4gICAgICAgIGdpZnRBbGxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gRFlOQU1JQyBGRVRDSDogR2V0IGZyZXNoIGNvbnRhaW5lciBpbiBjYXNlIGl0IHdhcyByZWZyZXNoZWRcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXdlc3RNZW1iZXJzJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBzeW5jU3RhdGUoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1lbWJlcnMgPSBBcnJheS5mcm9tKGNvbnRhaW5lci5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1c01zZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2lmdEZpbmFsQW1vdW50ID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QW1vdW50cycpKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGxldCBmaXJzdENhbGw6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIG1lbWJlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c01zZy5pbm5lclRleHQgPSAnU2VuZGluZy4uLic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZSA9IG1lbWJlci5pbm5lclRleHQudHJpbSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL2JvbnVzQnV5LnBocD9zcGVuZHR5cGU9Z2lmdCZhbW91bnQ9JHtnaWZ0RmluYWxBbW91bnR9JmdpZnRUbz0ke3VzZXJOYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RDYWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdENhbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuc2xlZXAoMzAwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb25SZXN1bHQ6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTih1cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdHaWZ0IFJlc3VsdCcsIGpzb25SZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzID0gSlNPTi5wYXJzZShqc29uUmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiQWRvcHRcIiBpZiBzdWNjZXNzIE9SIGlmIHRoZXkgYXJlIGFscmVhZHkgbWF4ZWQgb3V0IGZvciB0aGUgZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXMuc3VjY2VzcyB8fCAocmVzLmVycm9yICYmIHJlcy5lcnJvci5pbmNsdWRlcygnZGFpbHkgY2FwJykpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXIuY2xhc3NMaXN0LmFkZCgnbXBfZ2lmdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzcGFuID0gbWVtYmVyLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzcGFuKSBzcGFuLnN0eWxlLmNvbG9yID0gJ3JnYigxODcsIDE3MCwgMTE5KSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gVXRpbC5lbmRPZkhyZWYobWVtYmVyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGggPSBTdHJpbmcoR01fZ2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnKSB8fCAnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcsIGlkICsgKGggPyAnLCcgKyBoIDogJycpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihyZXMuZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIChnaWZ0QWxsQnRuIGFzIEhUTUxCdXR0b25FbGVtZW50KS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBzdGF0dXNNc2cuaW5uZXJUZXh0ID0gJ0RvbmUhJztcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL2xpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgaW5wdXQgYm94IGFuZCBlbnN1cmUgaXRzIGJldHdlZW4gNSBhbmQgMTAwMCwgaWYgbm90IGRpc2FibGUgYnV0dG9uXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJykhLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZVRvTnVtYmVyOiBzdHJpbmcgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJylcclxuICAgICAgICAgICAgKSkhLnZhbHVlO1xyXG4gICAgICAgICAgICBjb25zdCBnaWZ0QWxsID0gPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPiAxMDAwIHx8XHJcbiAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPCA1IHx8XHJcbiAgICAgICAgICAgICAgICBpc05hTihOdW1iZXIodmFsdWVUb051bWJlcikpXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLnNldEF0dHJpYnV0ZSgndGl0bGUnLCAnRGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdpZnRBbGwuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGdpZnRBbGwuc2V0QXR0cmlidXRlKCd0aXRsZScsIGBHaWZ0IEFsbCAke3ZhbHVlVG9OdW1iZXJ9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU3RhbmRhcmQgRE9NIEJ1dHRvbiBHZW5lcmF0aW9uXHJcbiAgICAgICAgY29uc3Qgb3BlbkFsbEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIG9wZW5BbGxCdG4uaWQgPSAnbXBfb3BlblRhYnMnO1xyXG4gICAgICAgIG9wZW5BbGxCdG4uY2xhc3NOYW1lID0gJ21wX2J0bic7XHJcbiAgICAgICAgb3BlbkFsbEJ0bi5pbm5lclRleHQgPSAnT3BlbiBVbmdpZnRlZCc7XHJcbiAgICAgICAgZ2lmdEFtb3VudHMuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIG9wZW5BbGxCdG4pO1xyXG5cclxuICAgICAgICAvLyBWZXJ0aWNhbCBhbGlnbm1lbnQgZml4IGZvciBidXR0b25cclxuICAgICAgICBvcGVuQWxsQnRuLnN0eWxlLmhlaWdodCA9ICcyMnB4JztcclxuICAgICAgICBvcGVuQWxsQnRuLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWZsZXgnO1xyXG4gICAgICAgIG9wZW5BbGxCdG4uc3R5bGUuYWxpZ25JdGVtcyA9ICdjZW50ZXInO1xyXG4gICAgICAgIG9wZW5BbGxCdG4uc2V0QXR0cmlidXRlKCd0aXRsZScsICdPcGVuIG5ldyB0YWIgZm9yIGVhY2gnKTtcclxuXHJcbiAgICAgICAgb3BlbkFsbEJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3ZXN0TWVtYmVycycpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lbWJlcnMgPSBBcnJheS5mcm9tKGNvbnRhaW5lci5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBtZW1iZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKG1lbWJlci5ocmVmLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9nZXQgdGhlIGN1cnJlbnQgYW1vdW50IG9mIGJvbnVzIHBvaW50cyBhdmFpbGFibGUgdG8gc3BlbmRcclxuICAgICAgICBsZXQgYm9udXNQb2ludHNBdmFpbDogc3RyaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RtQlAnKSEuaW5uZXJUZXh0O1xyXG4gICAgICAgIC8vY2xlYW4gdXAgc3RyaW5nIGZvciBqdXN0IHRoZSBwb2ludHNcclxuICAgICAgICBib251c1BvaW50c0F2YWlsID0gYm9udXNQb2ludHNBdmFpbC5pbmNsdWRlcygnOicpID8gYm9udXNQb2ludHNBdmFpbC5zcGxpdCgnOicpWzFdIDogYm9udXNQb2ludHNBdmFpbDtcclxuICAgICAgICBib251c1BvaW50c0F2YWlsID0gYm9udXNQb2ludHNBdmFpbC5pbmNsdWRlcygnKCcpID8gYm9udXNQb2ludHNBdmFpbC5zcGxpdCgnKCcpWzBdIDogYm9udXNQb2ludHNBdmFpbDtcclxuXHJcbiAgICAgICAgLy9yZWNyZWF0ZSB0aGUgYm9udXMgcG9pbnRzIGluIG5ldyBzcGFuIGFuZCBpbnNlcnQgaW50byBmb290ZXJcclxuICAgICAgICBjb25zdCBtZXNzYWdlU3BhbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgbWVzc2FnZVNwYW4uc2V0QXR0cmlidXRlKCdpZCcsICdtcF9naWZ0QWxsTXNnJyk7XHJcbiAgICAgICAgbWVzc2FnZVNwYW4uc3R5bGUubGluZUhlaWdodCA9ICcxJztcclxuICAgICAgICBtZXNzYWdlU3Bhbi5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1mbGV4JztcclxuICAgICAgICBtZXNzYWdlU3Bhbi5zdHlsZS5hbGlnbkl0ZW1zID0gJ2NlbnRlcic7XHJcbiAgICAgICAgbWVzc2FnZVNwYW4uaW5uZXJUZXh0ID0gJ0JQOiAnICsgYm9udXNQb2ludHNBdmFpbC50cmltKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9vdGVyV3JhcHBlci5hcHBlbmRDaGlsZChtZXNzYWdlU3Bhbik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIGdpZnQgbmV3IG1lbWJlcnMgYnV0dG9uIHRvIEhvbWUgcGFnZS4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBGdW5jdGlvbiB0aGF0IHJ1bnMgb24gdGhlIE5ldyBVc2VycyBwYWdlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgX25ld1VzZXJzUGFnZUdpZnRpbmcoKSB7XHJcbiAgICAgICAgdGhpcy5fdHJpbUdpZnRMaXN0KCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGZwTk0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYmxvY2tDb24nKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgICAgICBjb25zdCBmb290ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYmxvY2tGb290JykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgbWVtYmVyTGFiZWxzID0gQXJyYXkuZnJvbShmcE5NLnF1ZXJ5U2VsZWN0b3JBbGwoJ2xhYmVsJykpO1xyXG5cclxuICAgICAgICAvLyBVc2UgaW5jbHVkZXMoKSBmb3IgZXhhY3QgbWF0Y2hpbmcgYW5kIGFkZCBmYWxsYmFjayBmb3IgdW5kZWZpbmVkXHJcbiAgICAgICAgY29uc3QgaGlzdG9yeVN0ciA9IFN0cmluZyhHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpIHx8ICcnKTtcclxuICAgICAgICBjb25zdCBoaXN0b3J5ID0gaGlzdG9yeVN0ci5zcGxpdCgnLCcpO1xyXG5cclxuICAgICAgICBtZW1iZXJMYWJlbHMuZm9yRWFjaCgobGFiZWwpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gbGFiZWwucXVlcnlTZWxlY3RvcignYScpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IFV0aWwuZW5kT2ZIcmVmKG1lbWJlcik7XHJcbiAgICAgICAgICAgIGNvbnN0IG1lbWJlclJlZiA9IGBtcF9yZWZQb2ludF8ke2lkfWA7XHJcbiAgICAgICAgICAgIG1lbWJlci5jbGFzc0xpc3QuYWRkKG1lbWJlclJlZik7XHJcblxyXG4gICAgICAgICAgICBpZiAoaGlzdG9yeS5pbmNsdWRlcyhpZCkpIHtcclxuICAgICAgICAgICAgICAgIG1lbWJlci5pbm5lclRleHQgKz0gJyDinIUnO1xyXG4gICAgICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBnaWZ0VmFsdWVTZXR0aW5nID0gR01fZ2V0VmFsdWUoJ3VzZXJHaWZ0RGVmYXVsdF92YWwnKSB8fCAnMTAwJztcclxuICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gTWF0aC5taW4oMTAwLCBNYXRoLm1heCg1LCBOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykpKSB8fCAxMDA7XHJcblxyXG4gICAgICAgIGNvbnN0IGdpZnRBbW91bnRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBVdGlsLnNldEF0dHIoZ2lmdEFtb3VudHMsIHtcclxuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICBzaXplOiAnMycsXHJcbiAgICAgICAgICAgIGlkOiAnbXBfZ2lmdEFtb3VudHMnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ1ZhbHVlIGJldHdlZW4gNSBhbmQgMTAwJyxcclxuICAgICAgICAgICAgdmFsdWU6IFN0cmluZyhnaWZ0VmFsdWVTZXR0aW5nKSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgYnBUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgIGJwVGV4dC5pbm5lclRleHQgPSAncG9pbnRzICc7XHJcblxyXG4gICAgICAgIGNvbnN0IGdpZnRBbGxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBnaWZ0QWxsQnRuLmlkID0gJ21wX2dpZnRBbGwnO1xyXG4gICAgICAgIGdpZnRBbGxCdG4uY2xhc3NOYW1lID0gJ21wX2J0bic7XHJcbiAgICAgICAgZ2lmdEFsbEJ0bi5pbm5lclRleHQgPSAnR2lmdCBBbGwgU2VsZWN0ZWQnO1xyXG4gICAgICAgIGdpZnRBbGxCdG4uc3R5bGUubWFyZ2luUmlnaHQgPSAnNXB4JztcclxuICAgICAgICBnaWZ0QWxsQnRuLnN0eWxlLm1hcmdpblRvcCA9ICc1cHgnO1xyXG5cclxuICAgICAgICBnaWZ0QWxsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPSAnU2VuZGluZyBHaWZ0cy4uLiBQbGVhc2UgV2FpdCc7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdENhbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb25zdCBnaWZ0QW1vdW50ID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QW1vdW50cycpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBsYWJlbCBvZiBtZW1iZXJMYWJlbHMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ2EnKSBhcyBIVE1MQW5jaG9yRWxlbWVudDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrYm94ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tib3guY2hlY2tlZCAmJiAhbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTdHJpcCB0aGUgY2hlY2ttYXJrIGlmIGl0IGV4aXN0cyBzbyB3ZSBqdXN0IHNlbmQgdGhlIG5hbWVcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZSA9IG1lbWJlci5pbm5lclRleHQucmVwbGFjZSgnIOKchScsICcnKS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi9ib251c0J1eS5waHA/c3BlbmR0eXBlPWdpZnQmYW1vdW50PSR7Z2lmdEFtb3VudH0mZ2lmdFRvPSR7dXNlck5hbWV9YDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmaXJzdENhbGwpIGF3YWl0IFV0aWwuc2xlZXAoMzAwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RDYWxsID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb25SZXN1bHQgPSBhd2FpdCBVdGlsLmdldEpTT04odXJsKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdHaWZ0IFJlc3VsdCcsIGpzb25SZXN1bHQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBKU09OLnBhcnNlKGpzb25SZXN1bHQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBcHBseSB0aGUgXCJkYWlseSBjYXBcIiBhZG9wdGlvbiBmaXggaGVyZSBhcyB3ZWxsXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5zdWNjZXNzIHx8IChyZXMuZXJyb3IgJiYgcmVzLmVycm9yLmluY2x1ZGVzKCdkYWlseSBjYXAnKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyLmlubmVyVGV4dCArPSAnIOKchSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlci5jbGFzc0xpc3QuYWRkKCdtcF9naWZ0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gVXRpbC5lbmRPZkhyZWYobWVtYmVyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaCA9IFN0cmluZyhHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpIHx8ICcnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnLCBpZCArIChoID8gJywnICsgaCA6ICcnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHJlcy5lcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAoZ2lmdEFsbEJ0biBhcyBIVE1MQnV0dG9uRWxlbWVudCkuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPSAnR2lmdHMgY29tcGxldGVkIHRvIGFsbCBDaGVja2VkIFVzZXJzJztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZ2lmdEFtb3VudHMuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbCcpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IE51bWJlcihnaWZ0QW1vdW50cy52YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPCA1IHx8IHZhbHVlID4gMTAwIHx8IGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgZ2lmdEJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBnaWZ0QnRuLnRpdGxlID0gJ0Rpc2FibGVkJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdpZnRCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGdpZnRCdG4udGl0bGUgPSBgR2lmdCBBbGwgJHt2YWx1ZX1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IG9wZW5BbGxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBvcGVuQWxsQnRuLmlkID0gJ21wX29wZW5UYWJzJztcclxuICAgICAgICBvcGVuQWxsQnRuLmNsYXNzTmFtZSA9ICdtcF9idG4nO1xyXG4gICAgICAgIG9wZW5BbGxCdG4uaW5uZXJUZXh0ID0gJ09wZW4gVW5naWZ0ZWQgaW4gVGFicyc7XHJcbiAgICAgICAgb3BlbkFsbEJ0bi50aXRsZSA9ICdPcGVuIGEgbmV3IHRhYiBmb3IgZWFjaCB1bmdpZnRlZCBtZW1iZXInO1xyXG5cclxuICAgICAgICBvcGVuQWxsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxhYmVsIG9mIG1lbWJlckxhYmVscykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gbGFiZWwucXVlcnlTZWxlY3RvcignYScpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tib3ggPSBsYWJlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrYm94LmNoZWNrZWQgJiYgIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4obWVtYmVyLmhyZWYsICdfYmxhbmsnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgYm9udXNQb2ludHNBdmFpbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0bUJQJykhLmlubmVyVGV4dC5zcGxpdCgnOicpWzFdO1xyXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgIG1lc3NhZ2VTcGFuLmlkID0gJ21wX2dpZnRBbGxNc2cnO1xyXG4gICAgICAgIG1lc3NhZ2VTcGFuLmlubmVyVGV4dCA9IGAgQXZhaWxhYmxlIFBvaW50czogJHtib251c1BvaW50c0F2YWlsfWA7XHJcblxyXG4gICAgICAgIGNvbnN0IGRlc2VsZWN0QnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgZGVzZWxlY3RCdG4uaWQgPSAnbXBfZGVzZWxlY3RBbGwnO1xyXG4gICAgICAgIGRlc2VsZWN0QnRuLmNsYXNzTmFtZSA9ICdtcF9idG4nO1xyXG4gICAgICAgIGRlc2VsZWN0QnRuLmlubmVyVGV4dCA9ICdVbnNlbGVjdCBhbGwnO1xyXG4gICAgICAgIGRlc2VsZWN0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBib3hMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1jaGVja2JveF0nKSBhcyBOb2RlTGlzdE9mPEhUTUxJbnB1dEVsZW1lbnQ+O1xyXG4gICAgICAgICAgICBib3hMaXN0LmZvckVhY2goKGJveDogSFRNTElucHV0RWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYm94LmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbGVjdFVuZ2lmdGVkQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgc2VsZWN0VW5naWZ0ZWRCdG4uaWQgPSAnbXBfc2VsZWN0VW5naWZ0ZWQnO1xyXG4gICAgICAgIHNlbGVjdFVuZ2lmdGVkQnRuLmNsYXNzTmFtZSA9ICdtcF9idG4nO1xyXG4gICAgICAgIHNlbGVjdFVuZ2lmdGVkQnRuLmlubmVyVGV4dCA9ICdTZWxlY3QgMTAwIFVuZ2lmdGVkJztcclxuICAgICAgICBzZWxlY3RVbmdpZnRlZEJ0bi50aXRsZSA9ICdTZWxlY3QgdGhlIGZpcnN0IDEwMCB1bmdpZnRlZCB1c2Vycyc7XHJcbiAgICAgICAgc2VsZWN0VW5naWZ0ZWRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGFiZWwgb2YgbWVtYmVyTGFiZWxzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXIgPSBsYWJlbC5xdWVyeVNlbGVjdG9yKCdhJykgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGVja2JveCA9IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFtZW1iZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdtcF9naWZ0ZWQnKSAmJiAhY2hlY2tib3guY2hlY2tlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSB0cnVlOyAgXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY291bnQgPj0gMTAwKSBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZWxlY3RlZCAke2NvdW50fSB1bmdpZnRlZCB1c2Vycy5gKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKHNlbGVjdFVuZ2lmdGVkQnRuKTtcclxuICAgICAgICBmb290ZXIuYXBwZW5kQ2hpbGQoZGVzZWxlY3RCdG4pO1xyXG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChnaWZ0QW1vdW50cyk7XHJcbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKGJwVGV4dCk7XHJcbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKGdpZnRBbGxCdG4pO1xyXG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChvcGVuQWxsQnRuKTtcclxuICAgICAgICBmb290ZXIuYXBwZW5kQ2hpbGQobWVzc2FnZVNwYW4pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCBnaWZ0aW5nIG9wdGlvbnMgdG8gdGhlIGZvb3RlciBvZiB0aGUgcGFnZS4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogVHJpbXMgdGhlIGdpZnRlZCBsaXN0IHRvIGxhc3QgNTAwIG5hbWVzIHRvIGF2b2lkIGdldHRpbmcgdG9vIGxhcmdlIG92ZXIgdGltZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfdHJpbUdpZnRMaXN0KCkge1xyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlTdHIgPSBTdHJpbmcoR01fZ2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnKSB8fCAnJyk7XHJcbiAgICAgICAgaWYgKGhpc3RvcnlTdHIpIHtcclxuICAgICAgICAgICAgY29uc3QgZ2lmdE5hbWVzID0gaGlzdG9yeVN0ci5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICBsZXQgbmV3R2lmdE5hbWVzOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgaWYgKGdpZnROYW1lcy5sZW5ndGggPiA1MDApIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZ2lmdE5hbWUgb2YgZ2lmdE5hbWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIGJvdW5kcyB0byB1c2UgaW5jbHVkZXMgb3Igc3RyaWN0IGluZGV4aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdpZnROYW1lcy5pbmRleE9mKGdpZnROYW1lKSA8PSA0OTkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3R2lmdE5hbWVzID0gbmV3R2lmdE5hbWVzICsgZ2lmdE5hbWUgKyAnLCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJywgbmV3R2lmdE5hbWVzKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcsICcnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMjIEFkZHMgYWJpbGl0eSB0byBoaWRlIG5ld3MgaXRlbXMgb24gdGhlIHBhZ2VcclxuICovXHJcbmNsYXNzIEhpZGVOZXdzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuSG9tZSxcclxuICAgICAgICB0aXRsZTogJ2hpZGVOZXdzJyxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIGRlc2M6ICdUaWR5IHRoZSBob21lcGFnZSBhbmQgYWxsb3cgTmV3cyB0byBiZSBoaWRkZW4nLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5tYWluUGFnZU5ld3NIZWFkJztcclxuICAgIHByaXZhdGUgX3ZhbHVlVGl0bGU6IHN0cmluZyA9IGBtcF8ke3RoaXMuX3NldHRpbmdzLnRpdGxlfV92YWxgO1xyXG4gICAgcHJpdmF0ZSBfaWNvbiA9ICdcXHUyNzRlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICAvLyBOT1RFOiBmb3IgZGV2ZWxvcG1lbnRcclxuICAgICAgICAvLyBHTV9kZWxldGVWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKTtjb25zb2xlLndhcm4oYFZhbHVlIG9mICR7dGhpcy5fdmFsdWVUaXRsZX0gd2lsbCBiZSBkZWxldGVkIWApO1xyXG5cclxuICAgICAgICB0aGlzLl9yZW1vdmVDbG9jaygpO1xyXG4gICAgICAgIHRoaXMuX2FkanVzdEhlYWRlclNpemUodGhpcy5fdGFyKTtcclxuICAgICAgICBhd2FpdCB0aGlzLl9jaGVja0ZvclNlZW4oKTtcclxuICAgICAgICB0aGlzLl9hZGRIaWRlckJ1dHRvbigpO1xyXG4gICAgICAgIC8vIHRoaXMuX2NsZWFuVmFsdWVzKCk7IC8vIEZJWDogTm90IHdvcmtpbmcgYXMgaW50ZW5kZWRcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ2xlYW5lZCB1cCB0aGUgaG9tZSBwYWdlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIF9jaGVja0ZvclNlZW4gPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgY29uc3QgcHJldlZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKTtcclxuICAgICAgICBjb25zdCBuZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyh0aGlzLl92YWx1ZVRpdGxlLCAnOlxcbicsIHByZXZWYWx1ZSk7XHJcblxyXG4gICAgICAgIGlmIChwcmV2VmFsdWUgJiYgbmV3cykge1xyXG4gICAgICAgICAgICAvLyBVc2UgdGhlIGljb24gdG8gc3BsaXQgb3V0IHRoZSBrbm93biBoaWRkZW4gbWVzc2FnZXNcclxuICAgICAgICAgICAgY29uc3QgaGlkZGVuQXJyYXkgPSBwcmV2VmFsdWUuc3BsaXQodGhpcy5faWNvbik7XHJcbiAgICAgICAgICAgIC8qIElmIGFueSBvZiB0aGUgaGlkZGVuIG1lc3NhZ2VzIG1hdGNoIGEgY3VycmVudCBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICByZW1vdmUgdGhlIGN1cnJlbnQgbWVzc2FnZSBmcm9tIHRoZSBET00gKi9cclxuICAgICAgICAgICAgaGlkZGVuQXJyYXkuZm9yRWFjaCgoaGlkZGVuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBuZXdzLmZvckVhY2goKGVudHJ5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5LnRleHRDb250ZW50ID09PSBoaWRkZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gY3VycmVudCBtZXNzYWdlcywgaGlkZSB0aGUgaGVhZGVyXHJcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haW5QYWdlTmV3c1N1YicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGp1c3RIZWFkZXJTaXplKHRoaXMuX3RhciwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgX3JlbW92ZUNsb2NrID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNsb2NrOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgLmZwVGltZScpO1xyXG4gICAgICAgIGlmIChjbG9jaykgY2xvY2sucmVtb3ZlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIF9hZGp1c3RIZWFkZXJTaXplID0gKHNlbGVjdG9yOiBzdHJpbmcsIHZpc2libGU/OiBib29sZWFuKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbmV3c0hlYWRlcjogSFRNTEhlYWRpbmdFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgICAgIGlmIChuZXdzSGVhZGVyKSB7XHJcbiAgICAgICAgICAgIGlmICh2aXNpYmxlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgbmV3c0hlYWRlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbmV3c0hlYWRlci5zdHlsZS5mb250U2l6ZSA9ICcyZW0nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBfYWRkSGlkZXJCdXR0b24gPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbmV3cyA9IHRoaXMuX2dldE5ld3NJdGVtcygpO1xyXG4gICAgICAgIGlmICghbmV3cykgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBMb29wIG92ZXIgZWFjaCBuZXdzIGVudHJ5XHJcbiAgICAgICAgbmV3cy5mb3JFYWNoKChlbnRyeSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBDcmVhdGUgYSBidXR0b25cclxuICAgICAgICAgICAgY29uc3QgeGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICB4YnV0dG9uLnRleHRDb250ZW50ID0gdGhpcy5faWNvbjtcclxuICAgICAgICAgICAgVXRpbC5zZXRBdHRyKHhidXR0b24sIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiAnZGlzcGxheTppbmxpbmUtYmxvY2s7bWFyZ2luLXJpZ2h0OjAuN2VtO2N1cnNvcjpwb2ludGVyOycsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogJ21wX2NsZWFyQnRuJyxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2tzXHJcbiAgICAgICAgICAgIHhidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBXaGVuIGNsaWNrZWQsIGFwcGVuZCB0aGUgY29udGVudCBvZiB0aGUgY3VycmVudCBuZXdzIHBvc3QgdG8gdGhlXHJcbiAgICAgICAgICAgICAgICAvLyBsaXN0IG9mIHJlbWVtYmVyZWQgbmV3cyBpdGVtc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSlcclxuICAgICAgICAgICAgICAgICAgICA/IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpXHJcbiAgICAgICAgICAgICAgICAgICAgOiAnJztcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgSGlkaW5nLi4uICR7cHJldmlvdXNWYWx1ZX0ke2VudHJ5LnRleHRDb250ZW50fWApO1xyXG5cclxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUsIGAke3ByZXZpb3VzVmFsdWV9JHtlbnRyeS50ZXh0Q29udGVudH1gKTtcclxuICAgICAgICAgICAgICAgIGVudHJ5LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG1vcmUgbmV3cyBpdGVtcywgcmVtb3ZlIHRoZSBoZWFkZXJcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWROZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZWROZXdzICYmIHVwZGF0ZWROZXdzLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGp1c3RIZWFkZXJTaXplKHRoaXMuX3RhciwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgYnV0dG9uIGFzIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGUgZW50cnlcclxuICAgICAgICAgICAgaWYgKGVudHJ5LmZpcnN0Q2hpbGQpIGVudHJ5LmZpcnN0Q2hpbGQuYmVmb3JlKHhidXR0b24pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBfY2xlYW5WYWx1ZXMgPSAobnVtID0gMykgPT4ge1xyXG4gICAgICAgIGxldCB2YWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSk7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgR01fZ2V0VmFsdWUoJHt0aGlzLl92YWx1ZVRpdGxlfSlgLCB2YWx1ZSk7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8vIFJldHVybiB0aGUgbGFzdCAzIHN0b3JlZCBpdGVtcyBhZnRlciBzcGxpdHRpbmcgdGhlbSBhdCB0aGUgaWNvblxyXG4gICAgICAgICAgICB2YWx1ZSA9IFV0aWwuYXJyYXlUb1N0cmluZyh2YWx1ZS5zcGxpdCh0aGlzLl9pY29uKS5zbGljZSgwIC0gbnVtKSk7XHJcbiAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBuZXcgdmFsdWVcclxuICAgICAgICAgICAgR01fc2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgX2dldE5ld3NJdGVtcyA9ICgpOiBOb2RlTGlzdE9mPEhUTUxEaXZFbGVtZW50PiB8IG51bGwgPT4ge1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXZbY2xhc3NePVwibWFpblBhZ2VOZXdzXCJdJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFRoaXMgbXVzdCBtYXRjaCB0aGUgdHlwZSBzZWxlY3RlZCBmb3IgYHRoaXMuX3NldHRpbmdzYFxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxyXG4vKipcclxuICogIyBSRVFVRVNUIFBBR0UgRkVBVFVSRVNcclxuICovXHJcbi8qKlxyXG4gKiAqIEhpZGUgcmVxdWVzdGVycyB3aG8gYXJlIHNldCB0byBcImhpZGRlblwiXHJcbiAqL1xyXG5jbGFzcyBUb2dnbGVIaWRkZW5SZXF1ZXN0ZXJzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3RvZ2dsZUhpZGRlblJlcXVlc3RlcnMnLFxyXG4gICAgICAgIGRlc2M6IGBIaWRlIGhpZGRlbiByZXF1ZXN0ZXJzYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG9yUm93cyc7XHJcbiAgICBwcml2YXRlIF9zZWFyY2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+IHwgdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBfaGlkZSA9IHRydWU7XHJcbiAgICBwcml2YXRlIF9oaWRkZW5Db3VudCA9IDA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydyZXF1ZXN0J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgdGhpcy5fYWRkVG9nZ2xlU3dpdGNoKCk7XHJcbiAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IGF3YWl0IHRoaXMuX2dldFJlcXVlc3RMaXN0KCk7XHJcbiAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyh0aGlzLl9zZWFyY2hMaXN0KTtcclxuXHJcbiAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKHRoaXMuX3RhciwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9zZWFyY2hMaXN0ID0gYXdhaXQgdGhpcy5fZ2V0UmVxdWVzdExpc3QoKTtcclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyh0aGlzLl9zZWFyY2hMaXN0KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9hZGRUb2dnbGVTd2l0Y2goKSB7XHJcbiAgICAgICAgLy8gTWFrZSBhIG5ldyBidXR0b24gYW5kIGluc2VydCBiZXNpZGUgdGhlIFNlYXJjaCBidXR0b25cclxuICAgICAgICBVdGlsLmNyZWF0ZUJ1dHRvbkVsZW1lbnQoXHJcbiAgICAgICAgJ3Nob3dIaWRkZW4nLFxyXG4gICAgICAgICdTaG93IEhpZGRlbiAoMCknLCAvLyBJbml0aWFsIGNvdW50IHNldCB0byAwXHJcbiAgICAgICAgJyNyZXF1ZXN0U2VhcmNoIC50b3JyZW50U2VhcmNoJyxcclxuICAgICAgICB7IHR5cGU6ICdkaXYnLCByZWxhdGl2ZTogJ2FmdGVyZW5kJywgYnRuQ2xhc3M6ICd0b3JGb3JtQnV0dG9uJyB9XHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyBTZWxlY3QgdGhlIG5ldyBidXR0b24gYW5kIGFkZCBhIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgY29uc3QgdG9nZ2xlU3dpdGNoOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zaG93SGlkZGVuJylcclxuICAgICAgICApO1xyXG4gICAgICAgIHRvZ2dsZVN3aXRjaC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaGlkZGVuTGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAnI3RvclJvd3MgPiAubXBfaGlkZGVuJ1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5faGlkZGVuQ291bnQgPSBoaWRkZW5MaXN0Lmxlbmd0aDsgLy8gVXBkYXRlIGhpZGRlbiBjb3VudFxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hpZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZVN3aXRjaC5pbm5lclRleHQgPSBgSGlkZSBIaWRkZW4gKCR7dGhpcy5faGlkZGVuQ291bnR9KWA7XHJcbiAgICAgICAgICAgICAgICBoaWRkZW5MaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLmRpc3BsYXkgPSAnbGlzdC1pdGVtJztcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVTd2l0Y2guaW5uZXJUZXh0ID0gYFNob3cgSGlkZGVuICgke3RoaXMuX2hpZGRlbkNvdW50fSlgO1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuTGlzdC5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UmVxdWVzdExpc3QoKTogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHJlcXVlc3RzIHRvIGV4aXN0XHJcbiAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKCcjdG9yUm93cyAudG9yUm93IC50b3JSaWdodCcpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gR3JhYiBhbGwgcmVxdWVzdHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlcUxpc3Q6XHJcbiAgICAgICAgICAgICAgICAgICAgfCBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+XHJcbiAgICAgICAgICAgICAgICAgICAgfCBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgfCB1bmRlZmluZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgICAgICcjdG9yUm93cyAudG9yUm93J1xyXG4gICAgICAgICAgICAgICAgKSBhcyBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyZXFMaXN0ID09PSBudWxsIHx8IHJlcUxpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChgcmVxTGlzdCBpcyAke3JlcUxpc3R9YCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxTGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2ZpbHRlclJlc3VsdHMobGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pikge1xyXG4gICAgICAgIHRoaXMuX2hpZGRlbkNvdW50ID0gMDsgLy8gUmVzZXQgaGlkZGVuIGNvdW50IGJlZm9yZSBmaWx0ZXJpbmdcclxuICAgICAgICBsaXN0LmZvckVhY2goKHJlcXVlc3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdGVyOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSByZXF1ZXN0LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAnLnRvclJpZ2h0IGEnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0ZXIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3Quc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIHJlcXVlc3QuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRkZW5Db3VudCsrOyAvLyBJbmNyZW1lbnQgaGlkZGVuIGNvdW50XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGJ1dHRvbiB0ZXh0IHdpdGggdGhlIGluaXRpYWwgaGlkZGVuIGNvdW50XHJcbiAgICAgICAgY29uc3QgdG9nZ2xlU3dpdGNoOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zaG93SGlkZGVuJylcclxuICAgICAgICApO1xyXG4gICAgICAgIHRvZ2dsZVN3aXRjaC5pbm5lclRleHQgPSB0aGlzLl9oaWRlXHJcbiAgICAgICAgICAgID8gYFNob3cgSGlkZGVuICgke3RoaXMuX2hpZGRlbkNvdW50fSlgXHJcbiAgICAgICAgICAgIDogYEhpZGUgSGlkZGVuICgke3RoaXMuX2hpZGRlbkNvdW50fSlgO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogR2VuZXJhdGUgYSBwbGFpbnRleHQgbGlzdCBvZiByZXF1ZXN0IHJlc3VsdHNcclxuICovXHJcbmNsYXNzIFBsYWludGV4dFJlcXVlc3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5SZXF1ZXN0cyxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncGxhaW50ZXh0UmVxdWVzdCcsXHJcbiAgICAgICAgZGVzYzogYEluc2VydCBwbGFpbnRleHQgcmVxdWVzdCByZXN1bHRzIGF0IHRvcCBvZiByZXF1ZXN0IHBhZ2VgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG4gICAgcHJpdmF0ZSBfaXNPcGVuOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoXHJcbiAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXHJcbiAgICApO1xyXG4gICAgcHJpdmF0ZSBfcGxhaW5UZXh0OiBzdHJpbmcgPSAnJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3JlcXVlc3QnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBsZXQgdG9nZ2xlQnRuOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcclxuICAgICAgICBsZXQgY29weUJ0bjogSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj47XHJcblxyXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSB0b2dnbGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAodG9nZ2xlQnRuID0gVXRpbC5jcmVhdGVCdXR0b25FbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgJ3BsYWluVG9nZ2xlJywgICAgICAgICAgICAgIC8vIElEXHJcbiAgICAgICAgICAgICAgICAnU2hvdyBQbGFpbnRleHQnLCAgICAgICAgICAgLy8gVGV4dFxyXG4gICAgICAgICAgICAgICAgJyNzc3InLCAgICAgICAgICAgICAgICAgICAgIC8vIFRhcmdldCBlbGVtZW50IChzZWxlY3RvcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZGl2JywgICAgICAgICAgICAvLyBIVE1MIGVsZW1lbnQgdHlwZVxyXG4gICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlOiAnYmVmb3JlYmVnaW4nLCAvLyBQb3NpdGlvbiByZWxhdGl2ZSB0byB0YXJnZXRcclxuICAgICAgICAgICAgICAgICAgICBidG5DbGFzczogJ21wX3RvZ2dsZSBtcF9wbGFpbkJ0bicgLy8gQ1NTIGNsYXNzZXNcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKSksXHJcbiAgICAgICAgKHJlc3VsdExpc3QgPSB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgLy8gUHJvY2VzcyB0aGUgcmVzdWx0cyBpbnRvIHBsYWludGV4dFxyXG4gICAgICAgIHJlc3VsdExpc3RcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIGNvcHkgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b25FbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgICAgICdwbGFpbkNvcHknLCAgICAgICAgICAgICAgICAvLyBJRFxyXG4gICAgICAgICAgICAgICAgICAgICdDb3B5IFBsYWludGV4dCcsICAgICAgICAgICAvLyBUZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgJyNtcF9wbGFpblRvZ2dsZScsICAgICAgICAgIC8vIFRhcmdldCBlbGVtZW50IChzZWxlY3RvcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkaXYnLCAgICAgICAgICAgICAvLyBIVE1MIGVsZW1lbnQgdHlwZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZTogJ2FmdGVyZW5kJywgICAgLy8gUG9zaXRpb24gcmVsYXRpdmUgdG8gdGhlIHRhcmdldFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidG5DbGFzczogJ21wX2NvcHkgbXBfcGxhaW5CdG4nIC8vIENTUyBjbGFzc2VzXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBwbGFpbnRleHQgYm94XHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuLmluc2VydEFkamFjZW50SFRNTChcclxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGA8YnI+PHRleHRhcmVhIGNsYXNzPSdtcF9wbGFpbnRleHRTZWFyY2gnIHN0eWxlPSdkaXNwbGF5OiBub25lJz48L3RleHRhcmVhPmBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xyXG4gICAgICAgICAgICAgICAgLy8gU2V0IHVwIGEgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGNvcHlCdG4sIHRoaXMuX3BsYWluVGV4dCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3BsYWludGV4dFNlYXJjaCcpIS5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0ID0gdGhpcy5fZ2V0UmVxdWVzdExpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEluaXQgb3BlbiBzdGF0ZVxyXG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh0aGlzLl9pc09wZW4pO1xyXG5cclxuICAgICAgICAvLyBTZXQgdXAgdG9nZ2xlIGJ1dHRvbiBmdW5jdGlvbmFsaXR5XHJcbiAgICAgICAgdG9nZ2xlQnRuXHJcbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcclxuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXh0Ym94IHNob3VsZCBleGlzdCwgYnV0IGp1c3QgaW4gY2FzZS4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Ym94OiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRleHRib3ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdGV4dGJveCBkb2Vzbid0IGV4aXN0IWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3BlbiA9PT0gJ2ZhbHNlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKCd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdIaWRlIFBsYWludGV4dCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ2ZhbHNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ1Nob3cgUGxhaW50ZXh0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEluc2VydGVkIHBsYWludGV4dCByZXF1ZXN0IHJlc3VsdHMhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIE9wZW4gU3RhdGUgdG8gdHJ1ZS9mYWxzZSBpbnRlcm5hbGx5IGFuZCBpbiBzY3JpcHQgc3RvcmFnZVxyXG4gICAgICogQHBhcmFtIHZhbCBzdHJpbmdpZmllZCBib29sZWFuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3NldE9wZW5TdGF0ZSh2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFsID0gJ2ZhbHNlJztcclxuICAgICAgICB9IC8vIERlZmF1bHQgdmFsdWVcclxuICAgICAgICBHTV9zZXRWYWx1ZSgndG9nZ2xlU25hdGNoZWRTdGF0ZScsIHZhbCk7XHJcbiAgICAgICAgdGhpcy5faXNPcGVuID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3Byb2Nlc3NSZXN1bHRzKHJlc3VsdHM6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4pOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcclxuICAgICAgICByZXN1bHRzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgLy8gUmVzZXQgZWFjaCB0ZXh0IGZpZWxkXHJcbiAgICAgICAgICAgIGxldCB0aXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBzZXJpZXNUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBhdXRoVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgbmFyclRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgLy8gQnJlYWsgb3V0IHRoZSBpbXBvcnRhbnQgZGF0YSBmcm9tIGVhY2ggbm9kZVxyXG4gICAgICAgICAgICBjb25zdCByYXdUaXRsZTogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yKCcudG9yVGl0bGUnKTtcclxuICAgICAgICAgICAgY29uc3Qgc2VyaWVzTGlzdDogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XHJcbiAgICAgICAgICAgID4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCcuc2VyaWVzJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAnLmF1dGhvcidcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3QgbmFyckxpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcubmFycmF0b3InXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmF3VGl0bGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRXJyb3IgTm9kZTonLCBub2RlKTtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVzdWx0IHRpdGxlIHNob3VsZCBub3QgYmUgbnVsbGApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGl0bGUgPSByYXdUaXRsZS50ZXh0Q29udGVudCEudHJpbSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIHNlcmllc1xyXG4gICAgICAgICAgICBpZiAoc2VyaWVzTGlzdCAhPT0gbnVsbCAmJiBzZXJpZXNMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHNlcmllc0xpc3QuZm9yRWFjaCgoc2VyaWVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgKz0gYCR7c2VyaWVzLnRleHRDb250ZW50fSAvIGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBzbGFzaCBmcm9tIGxhc3Qgc2VyaWVzLCB0aGVuIHN0eWxlXHJcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IHNlcmllc1RpdGxlLnN1YnN0cmluZygwLCBzZXJpZXNUaXRsZS5sZW5ndGggLSAzKTtcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gYCAoJHtzZXJpZXNUaXRsZX0pYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIGF1dGhvcnNcclxuICAgICAgICAgICAgaWYgKGF1dGhMaXN0ICE9PSBudWxsICYmIGF1dGhMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGF1dGhUaXRsZSA9ICdCWSAnO1xyXG4gICAgICAgICAgICAgICAgYXV0aExpc3QuZm9yRWFjaCgoYXV0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhUaXRsZSArPSBgJHthdXRoLnRleHRDb250ZW50fSBBTkQgYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxyXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gYXV0aFRpdGxlLnN1YnN0cmluZygwLCBhdXRoVGl0bGUubGVuZ3RoIC0gNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyBuYXJyYXRvcnNcclxuICAgICAgICAgICAgaWYgKG5hcnJMaXN0ICE9PSBudWxsICYmIG5hcnJMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIG5hcnJUaXRsZSA9ICdGVCAnO1xyXG4gICAgICAgICAgICAgICAgbmFyckxpc3QuZm9yRWFjaCgobmFycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hcnJUaXRsZSArPSBgJHtuYXJyLnRleHRDb250ZW50fSBBTkQgYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxyXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gbmFyclRpdGxlLnN1YnN0cmluZygwLCBuYXJyVGl0bGUubGVuZ3RoIC0gNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3V0cCArPSBgJHt0aXRsZX0ke3Nlcmllc1RpdGxlfSAke2F1dGhUaXRsZX0gJHtuYXJyVGl0bGV9XFxuYDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gb3V0cDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRSZXF1ZXN0TGlzdCA9ICgpOiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4+ID0+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBTaGFyZWQuZ2V0U2VhcmNoTGlzdCggKWApO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSByZXF1ZXN0IHJlc3VsdHMgdG8gZXhpc3RcclxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJyN0b3JSb3dzIC50b3JSb3cgYScpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IGFsbCByZXF1ZXN0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNuYXRjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gPSA8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj4oXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvclJvd3MgLnRvclJvdycpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNuYXRjaExpc3QgPT09IG51bGwgfHwgc25hdGNoTGlzdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBzbmF0Y2hMaXN0IGlzICR7c25hdGNoTGlzdH1gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzbmF0Y2hMaXN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNPcGVuKCk6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc09wZW47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGlzT3Blbih2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodmFsKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgR29vZHJlYWRzQnV0dG9uUmVxIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdnb29kcmVhZHNCdXR0b25SZXEnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSBNQU0tdG8tR29vZHJlYWRzIGJ1dHRvbnMgZm9yIHJlcXVlc3RzJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZmlsbFRvcnJlbnQnO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3JlcXVlc3QgZGV0YWlscyddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgLy8gQ29udmVydCByb3cgc3RydWN0dXJlIGludG8gc2VhcmNoYWJsZSBvYmplY3RcclxuICAgICAgICBjb25zdCByZXFSb3dzID0gVXRpbC5yb3dzVG9PYmooZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gPiBkaXYnKSk7XHJcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBkYXRhIHBvaW50c1xyXG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gcmVxUm93c1snVGl0bGU6J10ucXVlcnlTZWxlY3Rvcignc3BhbicpO1xyXG4gICAgICAgIGNvbnN0IGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IHJlcVJvd3NbXHJcbiAgICAgICAgICAgICdBdXRob3Iocyk6J1xyXG4gICAgICAgIF0ucXVlcnlTZWxlY3RvckFsbCgnYScpO1xyXG4gICAgICAgIGNvbnN0IHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IHJlcVJvd3NbJ1NlcmllczonXVxyXG4gICAgICAgICAgICA/IHJlcVJvd3NbJ1NlcmllczonXS5xdWVyeVNlbGVjdG9yQWxsKCdhJylcclxuICAgICAgICAgICAgOiBudWxsO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gcmVxUm93c1snUmVsZWFzZSBEYXRlJ107XHJcbiAgICAgICAgLy8gR2VuZXJhdGUgYnV0dG9uc1xyXG4gICAgICAgIHRoaXMuX3NoYXJlLmdvb2RyZWFkc0J1dHRvbnMoYm9va0RhdGEsIGF1dGhvckRhdGEsIHNlcmllc0RhdGEsIHRhcmdldCk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIFByb2Nlc3MgJiByZXR1cm4gaW5mb3JtYXRpb24gZnJvbSB0aGUgc2hvdXRib3hcclxuICovXHJcbmNsYXNzIFByb2Nlc3NTaG91dHMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaCB0aGUgc2hvdXRib3ggZm9yIGNoYW5nZXMsIHRyaWdnZXJpbmcgYWN0aW9ucyBmb3IgZmlsdGVyZWQgc2hvdXRzXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzaG91dGJveCBlbGVtZW50IHNlbGVjdG9yXHJcbiAgICAgKiBAcGFyYW0gbmFtZXMgKE9wdGlvbmFsKSBMaXN0IG9mIHVzZXJuYW1lcy9JRHMgdG8gZmlsdGVyIGZvclxyXG4gICAgICogQHBhcmFtIHVzZXJ0eXBlIChPcHRpb25hbCkgV2hhdCBmaWx0ZXIgdGhlIG5hbWVzIGFyZSBmb3IuIFJlcXVpcmVkIGlmIGBuYW1lc2AgaXMgcHJvdmlkZWRcclxuICAgICAqIEBwYXJhbSBtZW50aW9uTmFtZSAoT3B0aW9uYWwpIEEgc3BlY2lmaWMgdXNlcm5hbWUgdG8gc3R5bGUgd2hlbiBtZW50aW9uZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyB3YXRjaFNob3V0Ym94KFxyXG4gICAgICAgIHRhcjogc3RyaW5nLFxyXG4gICAgICAgIG5hbWVzPzogc3RyaW5nW10sXHJcbiAgICAgICAgdXNlcnR5cGU/OiBTaG91dGJveFVzZXJUeXBlLFxyXG4gICAgICAgIG1lbnRpb25OYW1lPzogc3RyaW5nXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICAvLyBPYnNlcnZlIHRoZSBzaG91dGJveFxyXG4gICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcihcclxuICAgICAgICAgICAgdGFyLFxyXG4gICAgICAgICAgICAobXV0TGlzdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gV2hlbiB0aGUgc2hvdXRib3ggdXBkYXRlcywgcHJvY2VzcyB0aGUgaW5mb3JtYXRpb25cclxuICAgICAgICAgICAgICAgIG11dExpc3QuZm9yRWFjaCgobXV0UmVjKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBjaGFuZ2VkIG5vZGVzXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0UmVjLmFkZGVkTm9kZXMuZm9yRWFjaCgobm9kZTogTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShub2RlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBub2RlIGlzIGFkZGVkIGJ5IE1BTSsgZm9yIGdpZnQgYnV0dG9uLCBpZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyBpZ25vcmUgaWYgdGhlIG5vZGUgaXMgYSBkYXRlIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9ebXBfLy50ZXN0KG5vZGVEYXRhLmdldEF0dHJpYnV0ZSgnaWQnKSEpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlRGF0YS5jbGFzc0xpc3QuY29udGFpbnMoJ2RhdGVCcmVhaycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBsb29raW5nIGZvciBzcGVjaWZpYyB1c2Vycy4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWVudGlvbk5hbWUgJiYgbm9kZURhdGEudGV4dENvbnRlbnQ/LmluY2x1ZGVzKGBAJHttZW50aW9uTmFtZX1gKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHlsZVNob3V0KG5vZGUsICdtZW50aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgYXBwbHkgbmFtZSBmaWx0ZXJpbmcgaWYgbmFtZXMgYW5kIHVzZXJ0eXBlIGFyZSBkZWZpbmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYW1lcyAmJiBuYW1lcy5sZW5ndGggPiAwICYmIHVzZXJ0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySUQ6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWZePVwiL3UvXCJdJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaHJlZidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZTogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EgPiBzcGFuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGV4dCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXBwbHkgc3R5bGVzIGlmIGFueSBvZiB0aGUgbmFtZXMgbWF0Y2hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYC91LyR7bmFtZX1gID09PSB1c2VySUQgfHwgVXRpbC5jYXNlbGVzc1N0cmluZ01hdGNoKG5hbWUsIHVzZXJOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0eWxlU2hvdXQobm9kZSwgdXNlcnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeyBjaGlsZExpc3Q6IHRydWUgfVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaCB0aGUgc2hvdXRib3ggZm9yIGNoYW5nZXMsIHRyaWdnZXJpbmcgYWN0aW9ucyBmb3IgZmlsdGVyZWQgc2hvdXRzXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzaG91dGJveCBlbGVtZW50IHNlbGVjdG9yXHJcbiAgICAgKiBAcGFyYW0gYnV0dG9ucyBOdW1iZXIgdG8gcmVwcmVzZW50IGNoZWNrYm94IHNlbGVjdGlvbnMgMSA9IFJlcGx5LCAyID0gUmVwbHkgV2l0aCBRdW90ZVxyXG4gICAgICogQHBhcmFtIGNoYXJMaW1pdCBOdW1iZXIgb2YgY2hhcmFjdGVycyB0byBpbmNsdWRlIGluIHF1b3RlLCAsIGNoYXJMaW1pdD86bnVtYmVyIC0gQ3VycmVudGx5IHVudXNlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHdhdGNoU2hvdXRib3hSZXBseSh0YXI6IHN0cmluZywgYnV0dG9ucz86IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ3dhdGNoU2hvdXRib3hSZXBseSgnLCB0YXIsIGJ1dHRvbnMsICcpJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IF9nZXRVSUQgPSAobm9kZTogTm9kZSk6IHN0cmluZyA9PlxyXG4gICAgICAgICAgICB0aGlzLmV4dHJhY3RGcm9tU2hvdXQobm9kZSwgJ2FbaHJlZl49XCIvdS9cIl0nLCAnaHJlZicpO1xyXG5cclxuICAgICAgICBjb25zdCBfZ2V0UmF3Q29sb3IgPSAoZWxlbTogSFRNTFNwYW5FbGVtZW50KTogc3RyaW5nIHwgbnVsbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtLnN0eWxlLmJhY2tncm91bmRDb2xvcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW0uc3R5bGUuYmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0uc3R5bGUuY29sb3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLnN0eWxlLmNvbG9yO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IF9nZXROYW1lQ29sb3IgPSAoZWxlbTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCk6IHN0cmluZyB8IG51bGwgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmF3Q29sb3I6IHN0cmluZyB8IG51bGwgPSBfZ2V0UmF3Q29sb3IoZWxlbSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmF3Q29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRvIGhleFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJnYjogc3RyaW5nW10gPSBVdGlsLmJyYWNrZXRDb250ZW50cyhyYXdDb2xvcikuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbC5yZ2JUb0hleChcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmdiWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmdiWzFdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmdiWzJdKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbGVtZW50IGlzIG51bGwhXFxuJHtlbGVtfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBfbWFrZU5hbWVUYWcgPSAobmFtZTogc3RyaW5nLCBoZXg6IHN0cmluZyB8IG51bGwsIHVpZDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgICAgICAgICAgdWlkID0gdWlkLm1hdGNoKC9cXGQrL2cpIS5qb2luKCcnKTsgLy8gR2V0IHRoZSBVSUQsIGJ1dCBvbmx5IHRoZSBkaWdpdHNcclxuICAgICAgICAgICAgaGV4ID0gaGV4ID8gYDske2hleH1gIDogJyc7IC8vIElmIHRoZXJlIGlzIGEgaGV4IHZhbHVlLCBwcmVwZW5kIGA7YFxyXG4gICAgICAgICAgICByZXR1cm4gYEBbdWxpbms9JHt1aWR9JHtoZXh9XSR7bmFtZX1bL3VsaW5rXWA7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSByZXBseSBib3hcclxuICAgICAgICBjb25zdCByZXBseUJveCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaGJveF90ZXh0Jyk7XHJcbiAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgc2hvdXRib3hcclxuICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoXHJcbiAgICAgICAgICAgIHRhcixcclxuICAgICAgICAgICAgKG11dExpc3QpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gdGhlIHNob3V0Ym94IHVwZGF0ZXMsIHByb2Nlc3MgdGhlIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICBtdXRMaXN0LmZvckVhY2goKG11dFJlYykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY2hhbmdlZCBub2Rlc1xyXG4gICAgICAgICAgICAgICAgICAgIG11dFJlYy5hZGRlZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBVdGlsLm5vZGVUb0VsZW0obm9kZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbm9kZSBpcyBhZGRlZCBieSBNQU0rIGZvciBnaWZ0IGJ1dHRvbiwgaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsc28gaWdub3JlIGlmIHRoZSBub2RlIGlzIGEgZGF0ZSBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXm1wXy8udGVzdChub2RlRGF0YS5nZXRBdHRyaWJ1dGUoJ2lkJykhKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZURhdGEuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBuYW1lIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3V0TmFtZTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IG5vZGVEYXRhLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYVtocmVmXj1cIi91L1wiXSBzcGFuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZTogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KG5vZGUsICdhID4gc3BhbicsICd0ZXh0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJRDogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KG5vZGUsICdhW2hyZWZePVwiL3UvXCJdJywgJ2hyZWYnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGJ1dHRvbnMgPT09IDMsIGFkZCBVSUQgbmV4dCB0byB0aGUgdXNlcm5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJ1dHRvbnMgPT09IDMgJiYgc2hvdXROYW1lICYmIHVzZXJJRCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdWlkID0gdXNlcklELm1hdGNoKC9cXGQrL2cpPy5qb2luKCcnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1aWQgJiYgIXNob3V0TmFtZS50ZXh0Q29udGVudCEuaW5jbHVkZXMoYFske3VpZH1dYCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG91dE5hbWUudGV4dENvbnRlbnQgKz0gYCBbJHt1aWR9XWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZldGNoIGNvbG9yIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVDb2xvcjogc3RyaW5nIHwgbnVsbCA9IF9nZXROYW1lQ29sb3Ioc2hvdXROYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgY3JlYXRlIHJlcGx5IG9yIHF1b3RlIGJ1dHRvbnMgaWYgYnV0dG9ucyA9PT0gMSBvciBidXR0b25zID09PSAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChidXR0b25zID09PSAxIHx8IGJ1dHRvbnMgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcGx5QnV0dG9uOiBIVE1MU3BhbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYnV0dG9ucyA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uLmlubmVySFRNTCA9ICc8YnV0dG9uPlxcdTI5M2E8L2J1dHRvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcGx5Qm94LnZhbHVlID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWUgPSBgJHtfbWFrZU5hbWVUYWcodXNlck5hbWUsIG5hbWVDb2xvciwgdXNlcklEKX06IGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke3JlcGx5Qm94LnZhbHVlfSAke19tYWtlTmFtZVRhZyh1c2VyTmFtZSwgbmFtZUNvbG9yLCB1c2VySUQpfSBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJ1dHRvbnMgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvbi5pbm5lckhUTUwgPSAnPGJ1dHRvbj5cXHUyOTNkPC9idXR0b24+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnF1b3RlU2hvdXQobm9kZSwgNjUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGV4dCAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gYCR7X21ha2VOYW1lVGFnKHVzZXJOYW1lLCBuYW1lQ29sb3IsIHVzZXJJRCl9OiBcXHUyMDFjW2ldJHt0ZXh0fVsvaV1cXHUyMDFkIGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke19tYWtlTmFtZVRhZyh1c2VyTmFtZSwgbmFtZUNvbG9yLCB1c2VySUQpfTogYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b24uc2V0QXR0cmlidXRlKCdjbGFzcycsICdtcF9yZXBseUJ1dHRvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pbnNlcnRCZWZvcmUocmVwbHlCdXR0b24sIG5vZGUuY2hpbGROb2Rlc1syXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7IGNoaWxkTGlzdDogdHJ1ZSB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHF1b3RlU2hvdXQoc2hvdXQ6IE5vZGUsIGxlbmd0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3QgdGV4dEFycjogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAvLyBHZXQgbnVtYmVyIG9mIHJlcGx5IGJ1dHRvbnMgdG8gcmVtb3ZlIGZyb20gdGV4dFxyXG4gICAgICAgIGNvbnN0IGJ0bkNvdW50ID0gc2hvdXQuZmlyc3RDaGlsZCEucGFyZW50RWxlbWVudCEucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgJy5tcF9yZXBseUJ1dHRvbidcclxuICAgICAgICApLmxlbmd0aDtcclxuICAgICAgICAvLyBHZXQgdGhlIHRleHQgb2YgYWxsIGNoaWxkIG5vZGVzXHJcbiAgICAgICAgc2hvdXQuY2hpbGROb2Rlcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgICAgICAvKiBJZiB0aGUgY2hpbGQgaXMgYSBub2RlIHdpdGggY2hpbGRyZW4gKGV4LiBub3QgcGxhaW4gdGV4dCkgY2hlY2sgdG8gc2VlIGlmXHJcbiAgICAgICAgICAgIHRoZSBjaGlsZCBpcyBhIGxpbmsuIElmIHRoZSBsaW5rIGRvZXMgTk9UIHN0YXJ0IHdpdGggYC91L2AgKGluZGljYXRpbmcgYSB1c2VyKVxyXG4gICAgICAgICAgICB0aGVuIGNoYW5nZSB0aGUgbGluayB0byB0aGUgc3RyaW5nIGBbTGlua11gLlxyXG4gICAgICAgICAgICBJbiBhbGwgb3RoZXIgY2FzZXMsIHJldHVybiB0aGUgY2hpbGQgdGV4dCBjb250ZW50LiAqL1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEVsZW0gPSBVdGlsLm5vZGVUb0VsZW0oY2hpbGQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghY2hpbGRFbGVtLmhhc0F0dHJpYnV0ZSgnaHJlZicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKGNoaWxkLnRleHRDb250ZW50ISk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkRWxlbS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSEuaW5kZXhPZignL3UvJykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKCdbTGlua10nKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKGNoaWxkLnRleHRDb250ZW50ISk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QXJyLnB1c2goY2hpbGQudGV4dENvbnRlbnQhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIE1ha2UgYSBzdHJpbmcsIGJ1dCB0b3NzIG91dCB0aGUgZmlyc3QgZmV3IG5vZGVzXHJcbiAgICAgICAgbGV0IG5vZGVUZXh0ID0gdGV4dEFyci5zbGljZSgzICsgYnRuQ291bnQpLmpvaW4oJycpO1xyXG4gICAgICAgIGlmIChub2RlVGV4dC5pbmRleE9mKCc6JykgPT09IDApIHtcclxuICAgICAgICAgICAgbm9kZVRleHQgPSBub2RlVGV4dC5zdWJzdHIoMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgd2Ugc2hvdWxkIGhhdmUganVzdCB0aGUgbWVzc2FnZSB0ZXh0LlxyXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgcXVvdGVzIHRoYXQgbWlnaHQgYmUgY29udGFpbmVkOlxyXG4gICAgICAgIG5vZGVUZXh0ID0gbm9kZVRleHQucmVwbGFjZSgvXFx1ezIwMWN9KC4qPylcXHV7MjAxZH0vZ3UsICcnKTtcclxuICAgICAgICAvLyBUcmltIHRoZSB0ZXh0IHRvIGEgbWF4IGxlbmd0aCBhbmQgYWRkIC4uLiBpZiBzaG9ydGVuZWRcclxuICAgICAgICBsZXQgdHJpbW1lZFRleHQgPSBVdGlsLnRyaW1TdHJpbmcobm9kZVRleHQudHJpbSgpLCBsZW5ndGgpO1xyXG4gICAgICAgIGlmICh0cmltbWVkVGV4dCAhPT0gbm9kZVRleHQudHJpbSgpKSB7XHJcbiAgICAgICAgICAgIHRyaW1tZWRUZXh0ICs9ICcgW1xcdTIwMjZdJztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRG9uZSFcclxuICAgICAgICByZXR1cm4gdHJpbW1lZFRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFeHRyYWN0IGluZm9ybWF0aW9uIGZyb20gc2hvdXRzXHJcbiAgICAgKiBAcGFyYW0gc2hvdXQgVGhlIG5vZGUgY29udGFpbmluZyBzaG91dCBpbmZvXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBlbGVtZW50IHNlbGVjdG9yIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIGdldCBUaGUgcmVxdWVzdGVkIGluZm8gKGhyZWYgb3IgdGV4dClcclxuICAgICAqIEByZXR1cm5zIFRoZSBzdHJpbmcgdGhhdCB3YXMgc3BlY2lmaWVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICBzaG91dDogTm9kZSxcclxuICAgICAgICB0YXI6IHN0cmluZyxcclxuICAgICAgICBnZXQ6ICdocmVmJyB8ICd0ZXh0J1xyXG4gICAgKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKTtcclxuXHJcbiAgICAgICAgaWYgKHNob3V0ICE9PSBudWxsICYmICFub2RlRGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCBzaG91dEVsZW06IEhUTUxFbGVtZW50IHwgbnVsbCA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgIHRhclxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAoc2hvdXRFbGVtICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZXh0cmFjdGVkOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdldCAhPT0gJ3RleHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdGVkID0gc2hvdXRFbGVtLmdldEF0dHJpYnV0ZShnZXQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBleHRyYWN0ZWQgPSBzaG91dEVsZW0udGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFjdGVkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4dHJhY3RlZDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgQXR0cmlidXRlIHdhcyBudWxsJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBleHRyYWN0IHNob3V0ISBFbGVtZW50IHdhcyBudWxsJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBleHRyYWN0IHNob3V0ISBOb2RlIHdhcyBudWxsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hhbmdlIHRoZSBzdHlsZSBvZiBhIHNob3V0IGJhc2VkIG9uIGZpbHRlciBsaXN0c1xyXG4gICAgICogQHBhcmFtIHNob3V0IFRoZSBub2RlIGNvbnRhaW5pbmcgc2hvdXQgaW5mb1xyXG4gICAgICogQHBhcmFtIHVzZXJ0eXBlIFRoZSB0eXBlIG9mIHVzZXJzIHRoYXQgaGF2ZSBiZWVuIGZpbHRlcmVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc3R5bGVTaG91dChzaG91dDogTm9kZSwgdXNlcnR5cGU6IFNob3V0Ym94VXNlclR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzaG91dEVsZW06IEhUTUxFbGVtZW50ID0gVXRpbC5ub2RlVG9FbGVtKHNob3V0KTtcclxuICAgICAgICBpZiAodXNlcnR5cGUgPT09ICdwcmlvcml0eScpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VzdG9tU3R5bGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCdwcmlvcml0eVN0eWxlX3ZhbCcpO1xyXG4gICAgICAgICAgICBzaG91dEVsZW0uc3R5bGUuYmFja2dyb3VuZCA9IGN1c3RvbVN0eWxlID8gYGhzbGEoJHtjdXN0b21TdHlsZX0pYCA6ICdoc2xhKDAsMCUsNTAlLDAuMyknO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodXNlcnR5cGUgPT09ICdtdXRlJykge1xyXG4gICAgICAgICAgICBzaG91dEVsZW0uY2xhc3NMaXN0LmFkZCgnbXBfbXV0ZWQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHVzZXJ0eXBlID09PSAnbWVudGlvbicpIHtcclxuICAgICAgICAgICAgLy8gQXBwbHkgc3R5bGluZyBmb3IgcG9zdHMgdGhhdCBtZW50aW9uIHlvdXIgdXNlcm5hbWVcclxuICAgICAgICAgICAgY29uc3QgY3VzdG9tU3R5bGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCdzZWxmU3R5bGVfdmFsJyk7XHJcbiAgICAgICAgICAgIHNob3V0RWxlbS5zdHlsZS5iYWNrZ3JvdW5kID0gY3VzdG9tU3R5bGVcclxuICAgICAgICAgICAgICAgID8gYGhzbGEoJHtjdXN0b21TdHlsZX0pYFxyXG4gICAgICAgICAgICAgICAgOiAnaHNsYSgyNjYsNzUlLDYzJSwwLjI1KSc7XHJcbiAgICAgICAgICAgIHNob3V0RWxlbS5zdHlsZS5ib3JkZXIgPSAnMXB4IHNvbGlkIGhzbGEoMjY2LCA3NSUsIDYzJSwgMC45KSc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG5cclxuY2xhc3MgUHJpb3JpdHlVc2VycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncHJpb3JpdHlVc2VycycsXHJcbiAgICAgICAgdGFnOiAnRW1waGFzaXplIFVzZXJzJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiBzeXN0ZW0sIDI1NDIwLCA3NzYxOCcsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ0VtcGhhc2l6ZXMgbWVzc2FnZXMgZnJvbSB0aGUgbGlzdGVkIHVzZXJzIGluIHRoZSBzaG91dGJveC4gKDxlbT5UaGlzIGFjY2VwdHMgdXNlciBJRHMgYW5kIHVzZXJuYW1lcy4gSXQgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlLjwvZW0+KScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG4gICAgcHJpdmF0ZSBfcHJpb3JpdHlVc2Vyczogc3RyaW5nW10gPSBbXTtcclxuICAgIHByaXZhdGUgX3VzZXJUeXBlOiBTaG91dGJveFVzZXJUeXBlID0gJ3ByaW9yaXR5JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBnbVZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShgJHt0aGlzLnNldHRpbmdzLnRpdGxlfV92YWxgKTtcclxuICAgICAgICBpZiAoZ21WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW9yaXR5VXNlcnMgPSBhd2FpdCBVdGlsLmNzdlRvQXJyYXkoZ21WYWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VybGlzdCBpcyBub3QgZGVmaW5lZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgUHJvY2Vzc1Nob3V0cy53YXRjaFNob3V0Ym94KHRoaXMuX3RhciwgdGhpcy5fcHJpb3JpdHlVc2VycywgdGhpcy5fdXNlclR5cGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEhpZ2hsaWdodGluZyB1c2VycyBpbiB0aGUgc2hvdXRib3guLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBhIGN1c3RvbSBiYWNrZ3JvdW5kIHRvIGJlIGFwcGxpZWQgdG8gcHJpb3JpdHkgdXNlcnNcclxuICovXHJcbmNsYXNzIFByaW9yaXR5U3R5bGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3ByaW9yaXR5U3R5bGUnLFxyXG4gICAgICAgIHRhZzogJ0VtcGhhc2lzIFN0eWxlJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2RlZmF1bHQ6IDAsIDAlLCA1MCUsIDAuMycsXHJcbiAgICAgICAgZGVzYzogYENoYW5nZSB0aGUgY29sb3Ivb3BhY2l0eSBvZiB0aGUgaGlnaGxpZ2h0aW5nIHJ1bGUgZm9yIGVtcGhhc2l6ZWQgdXNlcnMnIHBvc3RzLiAoPGVtPlRoaXMgaXMgZm9ybWF0dGVkIGFzIEh1ZSAoMC0zNjApLCBTYXR1cmF0aW9uICgwLTEwMCUpLCBMaWdodG5lc3MgKDAtMTAwJSksIE9wYWNpdHkgKDAtMSk8L2VtPilgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZXR0aW5nIGN1c3RvbSBoaWdobGlnaHQgZm9yIHByaW9yaXR5IHVzZXJzLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgYSBjdXN0b20gYmFja2dyb3VuZCB0byBiZSBhcHBsaWVkIHRvIG1lc3NhZ2VzIHRoYXQgbWVudGlvbiB5b3VyIHVzZXJuYW1lXHJcbiAqL1xyXG5jbGFzcyBTZWxmU3R5bGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3NlbGZTdHlsZScsXHJcbiAgICAgICAgdGFnOiAnU2VsZiBFbXBoYXNpcycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAyNjYsIDc1JSwgNjMlLCAwLjI1JyxcclxuICAgICAgICBkZXNjOiBgQ2hhbmdlIHRoZSBjb2xvci9vcGFjaXR5IG9mIHRoZSBoaWdobGlnaHRpbmcgcnVsZSBmb3IgcG9zdHMgY29udGFpbmluZyB5b3VyIHVzZXJuYW1lLiAoPGVtPlRoaXMgaXMgZm9ybWF0dGVkIGFzIEh1ZSAoMC0zNjApLCBTYXR1cmF0aW9uICgwLTEwMCUpLCBMaWdodG5lc3MgKDAtMTAwJSksIE9wYWNpdHkgKDAtMSk8L2VtPilgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZXR0aW5nIGN1c3RvbSBoaWdobGlnaHQgZm9yIHBvc3RzIGNvbnRhaW5pbmcgeW91ciB1c2VybmFtZS4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIGEgY3VzdG9tIGJhY2tncm91bmQgdG8gYmUgYXBwbGllZCB0byBkZXNpcmVkIG11dGVkIHVzZXJzXHJcbiAqL1xyXG5jbGFzcyBNdXRlZFVzZXJzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdtdXRlZFVzZXJzJyxcclxuICAgICAgICB0YWc6ICdNdXRlIHVzZXJzJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiAxMjM0LCBnYXJkZW5zaGFkZScsXHJcbiAgICAgICAgZGVzYzogYE9ic2N1cmVzIG1lc3NhZ2VzIGZyb20gdGhlIGxpc3RlZCB1c2VycyBpbiB0aGUgc2hvdXRib3ggdW50aWwgaG92ZXJlZC4gKDxlbT5UaGlzIGFjY2VwdHMgdXNlciBJRHMgYW5kIHVzZXJuYW1lcy4gSXQgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlLjwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG4gICAgcHJpdmF0ZSBfbXV0ZWRVc2Vyczogc3RyaW5nW10gPSBbXTtcclxuICAgIHByaXZhdGUgX3VzZXJUeXBlOiBTaG91dGJveFVzZXJUeXBlID0gJ211dGUnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuc2V0dGluZ3MudGl0bGV9X3ZhbGApO1xyXG4gICAgICAgIGlmIChnbVZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fbXV0ZWRVc2VycyA9IGF3YWl0IFV0aWwuY3N2VG9BcnJheShnbVZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZXJsaXN0IGlzIG5vdCBkZWZpbmVkIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB0aGlzLl9tdXRlZFVzZXJzLCB0aGlzLl91c2VyVHlwZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gT2JzY3VyaW5nIG11dGVkIHVzZXJzLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgR2lmdCBidXR0b24gdG8gYmUgYWRkZWQgdG8gU2hvdXQgVHJpcGxlIGRvdCBtZW51XHJcbiAqL1xyXG5jbGFzcyBHaWZ0QnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2dpZnRCdXR0b24nLFxyXG4gICAgICAgIGRlc2M6IGBQbGFjZXMgYSBHaWZ0IGJ1dHRvbiBpbiBTaG91dGJveCBkb3QtbWVudWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gSW5pdGlhbGl6ZWQgR2lmdCBCdXR0b24uYCk7XHJcbiAgICAgICAgY29uc3Qgc2JmRGl2ID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYmYnKSE7XHJcbiAgICAgICAgY29uc3Qgc2JmRGl2Q2hpbGQgPSBzYmZEaXYhLmZpcnN0Q2hpbGQ7XHJcblxyXG4gICAgICAgIC8vYWRkIGV2ZW50IGxpc3RlbmVyIGZvciB3aGVuZXZlciBzb21ldGhpbmcgaXMgY2xpY2tlZCBpbiB0aGUgc2JmIGRpdlxyXG4gICAgICAgIHNiZkRpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vcHVsbCB0aGUgZXZlbnQgdGFyZ2V0IGludG8gYW4gSFRNTCBFbGVtZW50XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICAvL2FkZCB0aGUgVHJpcGxlIERvdCBNZW51IGFzIGFuIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3Qgc2JNZW51RWxlbSA9IHRhcmdldCEuY2xvc2VzdCgnLnNiX21lbnUnKTtcclxuICAgICAgICAgICAgLy9maW5kIHRoZSBtZXNzYWdlIGRpdlxyXG4gICAgICAgICAgICBjb25zdCBzYk1lbnVQYXJlbnQgPSB0YXJnZXQhLmNsb3Nlc3QoYGRpdmApO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgZnVsbCB0ZXh0IG9mIHRoZSBtZXNzYWdlIGRpdlxyXG4gICAgICAgICAgICBsZXQgZ2lmdE1lc3NhZ2UgPSBzYk1lbnVQYXJlbnQhLmlubmVyVGV4dDtcclxuICAgICAgICAgICAgLy9mb3JtYXQgbWVzc2FnZSB3aXRoIHN0YW5kYXJkIHRleHQgKyBtZXNzYWdlIGNvbnRlbnRzICsgc2VydmVyIHRpbWUgb2YgdGhlIG1lc3NhZ2VcclxuICAgICAgICAgICAgZ2lmdE1lc3NhZ2UgPVxyXG4gICAgICAgICAgICAgICAgYFNlbnQgb24gU2hvdXRib3ggbWVzc2FnZTogXCJgICtcclxuICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlLnN1YnN0cmluZyhnaWZ0TWVzc2FnZS5pbmRleE9mKCc6ICcpICsgMikgK1xyXG4gICAgICAgICAgICAgICAgYFwiIGF0IGAgK1xyXG4gICAgICAgICAgICAgICAgZ2lmdE1lc3NhZ2Uuc3Vic3RyaW5nKDAsIDgpO1xyXG4gICAgICAgICAgICAvL2lmIHRoZSB0YXJnZXQgb2YgdGhlIGNsaWNrIGlzIG5vdCB0aGUgVHJpcGxlIERvdCBNZW51IE9SXHJcbiAgICAgICAgICAgIC8vaWYgbWVudSBpcyBvbmUgb2YgeW91ciBvd24gY29tbWVudHMgKG9ubHkgd29ya3MgZm9yIGZpcnN0IDEwIG1pbnV0ZXMgb2YgY29tbWVudCBiZWluZyBzZW50KVxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAhdGFyZ2V0IS5jbG9zZXN0KCcuc2JfbWVudScpIHx8XHJcbiAgICAgICAgICAgICAgICBzYk1lbnVFbGVtIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZWUnKSEgPT09ICcxJ1xyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2dldCB0aGUgTWVudSBhZnRlciBpdCBwb3BzIHVwXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBHaWZ0IEJ1dHRvbi4uLmApO1xyXG4gICAgICAgICAgICBjb25zdCBwb3B1cE1lbnU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYk1lbnVNYWluJyk7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuc2xlZXAoNSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCFwb3B1cE1lbnUhLmhhc0NoaWxkTm9kZXMoKSk7XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSB1c2VyIGRldGFpbHMgZnJvbSB0aGUgcG9wdXAgbWVudSBkZXRhaWxzXHJcbiAgICAgICAgICAgIGNvbnN0IHBvcHVwVXNlcjogSFRNTEVsZW1lbnQgPSBVdGlsLm5vZGVUb0VsZW0ocG9wdXBNZW51IS5jaGlsZE5vZGVzWzBdKTtcclxuICAgICAgICAgICAgLy9tYWtlIHVzZXJuYW1lIGVxdWFsIHRoZSBkYXRhLXVpZCwgZm9yY2Ugbm90IG51bGxcclxuICAgICAgICAgICAgY29uc3QgdXNlck5hbWU6IFN0cmluZyA9IHBvcHVwVXNlciEuZ2V0QXR0cmlidXRlKCdkYXRhLXVpZCcpITtcclxuICAgICAgICAgICAgLy9nZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgZ2lmdHMgc2V0IGluIHByZWZlcmVuY2VzIGZvciB1c2VyIHBhZ2VcclxuICAgICAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJyk7XHJcbiAgICAgICAgICAgIC8vaWYgdGhleSBkaWQgbm90IHNldCBhIHZhbHVlIGluIHByZWZlcmVuY2VzLCBzZXQgdG8gMTAwXHJcbiAgICAgICAgICAgIGlmICghZ2lmdFZhbHVlU2V0dGluZykge1xyXG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpID4gMTAwMCB8fFxyXG4gICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwMCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpIDwgNSkge1xyXG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICc1JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgSFRNTCBkb2N1bWVudCB0aGF0IGhvbGRzIHRoZSBidXR0b24gYW5kIHZhbHVlIHRleHRcclxuICAgICAgICAgICAgY29uc3QgZ2lmdEJ1dHRvbjogSFRNTFNwYW5FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLnNldEF0dHJpYnV0ZSgnaWQnLCAnZ2lmdEJ1dHRvbicpO1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgYnV0dG9uIGVsZW1lbnQgYXMgd2VsbCBhcyBhIHRleHQgZWxlbWVudCBmb3IgdmFsdWUgb2YgZ2lmdC4gUG9wdWxhdGUgd2l0aCB2YWx1ZSBmcm9tIHNldHRpbmdzXHJcbiAgICAgICAgICAgIGdpZnRCdXR0b24uaW5uZXJIVE1MID0gYDxidXR0b24+8J+OgUdpZnQ6IDwvYnV0dG9uPjxzcGFuPiZuYnNwOzwvc3Bhbj48aW5wdXQgdHlwZT1cInRleHRcIiBzaXplPVwiM1wiIGlkPVwibXBfZ2lmdFZhbHVlXCIgdGl0bGU9XCJWYWx1ZSBiZXR3ZWVuIDUgYW5kIDEwMDBcIiB2YWx1ZT1cIiR7Z2lmdFZhbHVlU2V0dGluZ31cIj5gO1xyXG4gICAgICAgICAgICAvL2FkZCBnaWZ0IGVsZW1lbnQgd2l0aCBidXR0b24gYW5kIHRleHQgdG8gdGhlIG1lbnVcclxuICAgICAgICAgICAgcG9wdXBNZW51IS5jaGlsZE5vZGVzWzBdLmFwcGVuZENoaWxkKGdpZnRCdXR0b24pO1xyXG4gICAgICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lciBmb3Igd2hlbiBnaWZ0IGJ1dHRvbiBpcyBjbGlja2VkXHJcbiAgICAgICAgICAgIGdpZnRCdXR0b24ucXVlcnlTZWxlY3RvcignYnV0dG9uJykhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9wdWxsIHdoYXRldmVyIHRoZSBmaW5hbCB2YWx1ZSBvZiB0aGUgdGV4dCBib3ggZXF1YWxzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBnaWZ0RmluYWxBbW91bnQgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0VmFsdWUnKVxyXG4gICAgICAgICAgICAgICAgKSkhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgLy9iZWdpbiBzZXR0aW5nIHVwIHRoZSBHRVQgcmVxdWVzdCB0byBNQU0gSlNPTlxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2lmdEhUVFAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByZXN1bHRzIHdpdGggdGhlIGFtb3VudCBlbnRlcmVkIGJ5IHVzZXIgcGx1cyB0aGUgdXNlcm5hbWUgZm91bmQgb24gdGhlIG1lbnUgc2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgIC8vYWRkZWQgbWVzc2FnZSBjb250ZW50cyBlbmNvZGVkIHRvIHByZXZlbnQgdW5pbnRlbmRlZCBjaGFyYWN0ZXJzIGZyb20gYnJlYWtpbmcgSlNPTiBVUkxcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1naWZ0JmFtb3VudD0ke2dpZnRGaW5hbEFtb3VudH0mZ2lmdFRvPSR7dXNlck5hbWV9Jm1lc3NhZ2U9JHtlbmNvZGVVUklDb21wb25lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgZ2lmdE1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICl9YDtcclxuICAgICAgICAgICAgICAgIGdpZnRIVFRQLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBnaWZ0SFRUUC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEhUVFAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnaWZ0SFRUUC5yZWFkeVN0YXRlID09PSA0ICYmIGdpZnRIVFRQLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGdpZnRIVFRQLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGEgbmV3IGxpbmUgaW4gU0IgdGhhdCBzaG93cyBnaWZ0IHdhcyBzdWNjZXNzZnVsIHRvIGFja25vd2xlZGdlIGdpZnQgd29ya2VkL2ZhaWxlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfZ2lmdFN0YXR1c0VsZW0nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2JmRGl2Q2hpbGQhLmFwcGVuZENoaWxkKG5ld0Rpdik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGdpZnQgc3VjY2VlZGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NNc2cgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUG9pbnRzIEdpZnQgU3VjY2Vzc2Z1bDogVmFsdWU6ICcgKyBnaWZ0RmluYWxBbW91bnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuYXBwZW5kQ2hpbGQoc3VjY2Vzc01zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuY2xhc3NMaXN0LmFkZCgnbXBfc3VjY2VzcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFpbGVkTXNnID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BvaW50cyBHaWZ0IEZhaWxlZDogRXJyb3I6ICcgKyBqc29uLmVycm9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmFwcGVuZENoaWxkKGZhaWxlZE1zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuY2xhc3NMaXN0LmFkZCgnbXBfZmFpbCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWZ0ZXIgd2UgYWRkIGxpbmUgaW4gU0IsIHNjcm9sbCB0byBib3R0b20gdG8gc2hvdyByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2JmRGl2LnNjcm9sbFRvcCA9IHNiZkRpdi5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vYWZ0ZXIgd2UgYWRkIGxpbmUgaW4gU0IsIHNjcm9sbCB0byBib3R0b20gdG8gc2hvdyByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICBzYmZEaXYuc2Nyb2xsVG9wID0gc2JmRGl2LnNjcm9sbEhlaWdodDtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZ2lmdEhUVFAuc2VuZCgpO1xyXG4gICAgICAgICAgICAgICAgLy9yZXR1cm4gdG8gbWFpbiBTQiB3aW5kb3cgYWZ0ZXIgZ2lmdCBpcyBjbGlja2VkIC0gdGhlc2UgYXJlIHR3byBzdGVwcyB0YWtlbiBieSBNQU0gd2hlbiBjbGlja2luZyBvdXQgb2YgTWVudVxyXG4gICAgICAgICAgICAgICAgc2JmRGl2XHJcbiAgICAgICAgICAgICAgICAgICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NiX2NsaWNrZWRfcm93JylbMF0hXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgLmdldEVsZW1lbnRCeUlkKCdzYk1lbnVNYWluJykhXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnc2JCb3R0b20gaGlkZU1lJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykhLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVUb051bWJlcjogU3RyaW5nID0gKDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdFZhbHVlJylcclxuICAgICAgICAgICAgICAgICkpIS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPiAxMDAwIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgTnVtYmVyKHZhbHVlVG9OdW1iZXIpIDwgNSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIGlzTmFOKE51bWJlcih2YWx1ZVRvTnVtYmVyKSlcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdpZnRCdXR0b24ucXVlcnlTZWxlY3RvcignYnV0dG9uJykhLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSEuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEdpZnQgQnV0dG9uIGFkZGVkIWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFN0eWxlIG1lbnRpb25zIG9mIHlvdXIgdXNlcm5hbWVcclxuICovXHJcbmNsYXNzIFN0eWxlTWVudGlvbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdzdHlsZU1lbnRpb24nLFxyXG4gICAgICAgIGRlc2M6IGBTdHlsZSBtZW50aW9ucyBvZiB5b3VyIHVzZXJuYW1lYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcbiAgICBwcml2YXRlIF9tZW50aW9uTmFtZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7IC8vIER5bmFtaWNhbGx5IHNldCBtZW50aW9uIG5hbWVcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICAvLyBFeHRyYWN0IHVzZXJuYW1lIGZyb20gRE9NIGJlZm9yZSBpbml0aWFsaXppbmcgdGhlIHNob3V0Ym94IHdhdGNoZXJcclxuICAgICAgICB0aGlzLl9tZW50aW9uTmFtZSA9IHRoaXMuX2V4dHJhY3RVc2VybmFtZSgpO1xyXG4gICAgICAgIGlmICh0aGlzLl9tZW50aW9uTmFtZSkge1xyXG4gICAgICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdGhpcy5fbWVudGlvbk5hbWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkNvdWxkIG5vdCBmaW5kIHVzZXJuYW1lIGZvciBtZW50aW9uIHN0eWxpbmcuXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9leHRyYWN0VXNlcm5hbWUoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBhbmNob3IgZWxlbWVudCBieSBpdHMgaWRcclxuICAgICAgICBjb25zdCB1c2VyTWVudUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXJNZW51XCIpO1xyXG5cclxuICAgICAgICBpZiAodXNlck1lbnVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIC8vIENsb25lIHRoZSBlbGVtZW50IHRvIG1hbmlwdWxhdGUgd2l0aG91dCBhZmZlY3RpbmcgdGhlIERPTVxyXG4gICAgICAgICAgICBjb25zdCBjbG9uZSA9IHVzZXJNZW51RWxlbWVudC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIDxpbWc+IHRhZyB0byBpc29sYXRlIHRoZSB1c2VybmFtZSB0ZXh0XHJcbiAgICAgICAgICAgIGNvbnN0IGltZyA9IGNsb25lLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpO1xyXG4gICAgICAgICAgICBpZiAoaW1nKSB7XHJcbiAgICAgICAgICAgICAgICBjbG9uZS5yZW1vdmVDaGlsZChpbWcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBUcmltIHRoZSBcIuKGk1wiIGFuZCBhbnkgZXh0cmEgd2hpdGVzcGFjZSBhbmQgcmV0dXJuIHRoZSB1c2VybmFtZVxyXG4gICAgICAgICAgICByZXR1cm4gY2xvbmUudGV4dENvbnRlbnQ/LnNsaWNlKDAsIC0xKS50cmltKCkgfHwgbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVc2VyIG1lbnUgZWxlbWVudCBub3QgZm91bmQuXCIpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBSZXBseSBidXR0b24gdG8gYmUgYWRkZWQgdG8gU2hvdXRcclxuICovXHJcbmNsYXNzIFJlcGx5U2ltcGxlIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3JlcGx5U2ltcGxlJyxcclxuICAgICAgICAvL3RhZzogXCJSZXBseVwiLFxyXG4gICAgICAgIGRlc2M6IGBQbGFjZXMgYSBSZXBseSBidXR0b24gaW4gU2hvdXRib3g6ICYjMTA1NTQ7YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcbiAgICBwcml2YXRlIF9yZXBseVNpbXBsZTogbnVtYmVyID0gMTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3hSZXBseSh0aGlzLl90YXIsIHRoaXMuX3JlcGx5U2ltcGxlKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgUmVwbHkgQnV0dG9uLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIFJlcGx5IFdpdGggUXVvdGUgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0XHJcbiAqL1xyXG5jbGFzcyBSZXBseVF1b3RlIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3JlcGx5UXVvdGUnLFxyXG4gICAgICAgIC8vdGFnOiBcIlJlcGx5IFdpdGggUXVvdGVcIixcclxuICAgICAgICBkZXNjOiBgUGxhY2VzIGEgUmVwbHkgd2l0aCBRdW90ZSBidXR0b24gaW4gU2hvdXRib3g6ICYjMTA1NTc7YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcbiAgICBwcml2YXRlIF9yZXBseVF1b3RlOiBudW1iZXIgPSAyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIFByb2Nlc3NTaG91dHMud2F0Y2hTaG91dGJveFJlcGx5KHRoaXMuX3RhciwgdGhpcy5fcmVwbHlRdW90ZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIFJlcGx5IHdpdGggUXVvdGUgQnV0dG9uLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogYWRkcyBVSUQgdG8gU2hvdXRcclxuICovXHJcbmNsYXNzIEFkZFVJRCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdhZGRVSUQnLFxyXG4gICAgICAgIC8vdGFnOiBcIlJlcGx5XCIsXHJcbiAgICAgICAgZGVzYzogYFBsYWNlcyB0aGUgdXNlcnMgVUlEIG5leHQgdG8gdGhlIG5hbWVgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuICAgIHByaXZhdGUgX3JlcGx5U2ltcGxlOiBudW1iZXIgPSAzO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIFByb2Nlc3NTaG91dHMud2F0Y2hTaG91dGJveFJlcGx5KHRoaXMuX3RhciwgdGhpcy5fcmVwbHlTaW1wbGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBVSUQgQnV0dG9uLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBmZWF0dXJlIGZvciBidWlsZGluZyBhIGxpYnJhcnkgb2YgcXVpY2sgc2hvdXQgaXRlbXMgdGhhdCBjYW4gYWN0IGFzIGEgY29weS9wYXN0ZSByZXBsYWNlbWVudC5cclxuICovXHJcbmNsYXNzIFF1aWNrU2hvdXQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncXVpY2tTaG91dCcsXHJcbiAgICAgICAgZGVzYzogYENyZWF0ZSBmZWF0dXJlIGJlbG93IHNob3V0Ym94IHRvIHN0b3JlIHByZS1zZXQgbWVzc2FnZXMuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIFF1aWNrIFNob3V0IEJ1dHRvbnMuLi5gKTtcclxuICAgICAgICAvL2dldCB0aGUgbWFpbiBzaG91dGJveCBpbnB1dCBmaWVsZFxyXG4gICAgICAgIGNvbnN0IHJlcGx5Qm94ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYm94X3RleHQnKTtcclxuICAgICAgICAvL2VtcHR5IEpTT04gd2FzIGdpdmluZyBtZSBpc3N1ZXMsIHNvIGRlY2lkZWQgdG8ganVzdCBtYWtlIGFuIGludHJvIGZvciB3aGVuIHRoZSBHTSB2YXJpYWJsZSBpcyBlbXB0eVxyXG4gICAgICAgIGxldCBqc29uTGlzdCA9IEpTT04ucGFyc2UoXHJcbiAgICAgICAgICAgIGB7IFwiSW50cm9cIjpcIldlbGNvbWUgdG8gUXVpY2tTaG91dCBNQU0rZXIhIEhlcmUgeW91IGNhbiBjcmVhdGUgcHJlc2V0IFNob3V0IG1lc3NhZ2VzIGZvciBxdWljayByZXNwb25zZXMgYW5kIGtub3dsZWRnZSBzaGFyaW5nLiAnQ2xlYXInIGNsZWFycyB0aGUgZW50cnkgdG8gc3RhcnQgc2VsZWN0aW9uIHByb2Nlc3Mgb3Zlci4gJ1NlbGVjdCcgdGFrZXMgd2hhdGV2ZXIgUXVpY2tTaG91dCBpcyBpbiB0aGUgVGV4dEFyZWEgYW5kIHB1dHMgaW4geW91ciBTaG91dCByZXNwb25zZSBhcmVhLiAnU2F2ZScgd2lsbCBzdG9yZSB0aGUgU2VsZWN0aW9uIE5hbWUgYW5kIFRleHQgQXJlYSBDb21ibyBmb3IgZnV0dXJlIHVzZSBhcyBhIFF1aWNrU2hvdXQsIGFuZCBoYXMgY29sb3IgaW5kaWNhdG9ycy4gR3JlZW4gPSBzYXZlZCBhcy1pcy4gWWVsbG93ID0gUXVpY2tTaG91dCBOYW1lIGV4aXN0cyBhbmQgaXMgc2F2ZWQsIGJ1dCBjb250ZW50IGRvZXMgbm90IG1hdGNoIHdoYXQgaXMgc3RvcmVkLiBPcmFuZ2UgPSBubyBlbnRyeSBtYXRjaGluZyB0aGF0IG5hbWUsIG5vdCBzYXZlZC4gJ0RlbGV0ZScgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgdGhhdCBlbnRyeSBmcm9tIHlvdXIgc3RvcmVkIFF1aWNrU2hvdXRzIChidXR0b24gb25seSBzaG93cyB3aGVuIGV4aXN0cyBpbiBzdG9yYWdlKS4gRm9yIG5ldyBlbnRyaWVzIGhhdmUgeW91ciBRdWlja1Nob3V0IE5hbWUgdHlwZWQgaW4gQkVGT1JFIHlvdSBjcmFmdCB5b3VyIHRleHQgb3IgcmlzayBpdCBiZWluZyBvdmVyd3JpdHRlbiBieSBzb21ldGhpbmcgdGhhdCBleGlzdHMgYXMgeW91IHR5cGUgaXQuIFRoYW5rcyBmb3IgdXNpbmcgTUFNKyFcIiB9YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9nZXQgU2hvdXRib3ggRElWXHJcbiAgICAgICAgY29uc3Qgc2hvdXRCb3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnBTaG91dCcpO1xyXG4gICAgICAgIC8vZ2V0IHRoZSBmb290ZXIgd2hlcmUgd2Ugd2lsbCBpbnNlcnQgb3VyIGZlYXR1cmVcclxuICAgICAgICBjb25zdCBzaG91dEZvb3QgPSA8SFRNTEVsZW1lbnQ+c2hvdXRCb3ghLnF1ZXJ5U2VsZWN0b3IoJy5ibG9ja0Zvb3QnKTtcclxuICAgICAgICAvL2dpdmUgaXQgYW4gSUQgYW5kIHNldCB0aGUgc2l6ZVxyXG4gICAgICAgIHNob3V0Rm9vdCEuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9ibG9ja0Zvb3QnKTtcclxuICAgICAgICBzaG91dEZvb3QhLnN0eWxlLmhlaWdodCA9ICcyLjVlbSc7XHJcbiAgICAgICAgLy9jcmVhdGUgYSBuZXcgZGl2ZSB0byBob2xkIG91ciBjb21ib0JveCBhbmQgYnV0dG9ucyBhbmQgc2V0IHRoZSBzdHlsZSBmb3IgZm9ybWF0dGluZ1xyXG4gICAgICAgIGNvbnN0IGNvbWJvQm94RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUuZmxvYXQgPSAnbGVmdCc7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLm1hcmdpbkJvdHRvbSA9ICcuNWVtJztcclxuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5tYXJnaW5Ub3AgPSAnLjVlbSc7XHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIGxhYmVsIHRleHQgZWxlbWVudCBhbmQgYWRkIHRoZSB0ZXh0IGFuZCBhdHRyaWJ1dGVzIGZvciBJRFxyXG4gICAgICAgIGNvbnN0IGNvbWJvQm94TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgIGNvbWJvQm94TGFiZWwuc2V0QXR0cmlidXRlKCdmb3InLCAncXVpY2tTaG91dERhdGEnKTtcclxuICAgICAgICBjb21ib0JveExhYmVsLmlubmVyVGV4dCA9ICdDaG9vc2UgYSBRdWlja1Nob3V0JztcclxuICAgICAgICBjb21ib0JveExhYmVsLnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfY29tYm9Cb3hMYWJlbCcpO1xyXG4gICAgICAgIC8vY3JlYXRlIHRoZSBpbnB1dCBmaWVsZCB0byBsaW5rIHRvIGRhdGFsaXN0IGFuZCBmb3JtYXQgc3R5bGVcclxuICAgICAgICBjb25zdCBjb21ib0JveElucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBjb21ib0JveElucHV0LnN0eWxlLm1hcmdpbkxlZnQgPSAnLjVlbSc7XHJcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5zZXRBdHRyaWJ1dGUoJ2xpc3QnLCAnbXBfY29tYm9Cb3hMaXN0Jyk7XHJcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2NvbWJvQm94SW5wdXQnKTtcclxuICAgICAgICAvL2NyZWF0ZSBhIGRhdGFsaXN0IHRvIHN0b3JlIG91ciBxdWlja3Nob3V0c1xyXG4gICAgICAgIGNvbnN0IGNvbWJvQm94TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGFsaXN0Jyk7XHJcbiAgICAgICAgY29tYm9Cb3hMaXN0LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfY29tYm9Cb3hMaXN0Jyk7XHJcbiAgICAgICAgLy9pZiB0aGUgR00gdmFyaWFibGUgZXhpc3RzXHJcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdtcF9xdWlja1Nob3V0JykpIHtcclxuICAgICAgICAgICAgLy9vdmVyd3JpdGUganNvbkxpc3QgdmFyaWFibGUgd2l0aCBwYXJzZWQgZGF0YVxyXG4gICAgICAgICAgICBqc29uTGlzdCA9IEpTT04ucGFyc2UoR01fZ2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnKSk7XHJcbiAgICAgICAgICAgIC8vZm9yIGVhY2gga2V5IGl0ZW1cclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgYSBuZXcgT3B0aW9uIGVsZW1lbnQgYW5kIGFkZCBvdXIgZGF0YSBmb3IgZGlzcGxheSB0byB1c2VyXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBrZXkucmVwbGFjZSgv4LKgL2csICcgJyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy9pZiBubyBHTSB2YXJpYWJsZVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIHZhcmlhYmxlIHdpdGggb3V0IEludHJvIGRhdGFcclxuICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xyXG4gICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpdGVtXHJcbiAgICAgICAgICAgIC8vIFRPRE86IHByb2JhYmx5IGNhbiBnZXQgcmlkIG9mIHRoZSBmb3JFYWNoIGFuZCBqdXN0IGRvIHNpbmdsZSBleGVjdXRpb24gc2luY2Ugd2Uga25vdyB0aGlzIGlzIEludHJvIG9ubHlcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmFwcGVuZENoaWxkKGNvbWJvQm94T3B0aW9uKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2FwcGVuZCB0aGUgYWJvdmUgZWxlbWVudHMgdG8gb3VyIERJViBmb3IgdGhlIGNvbWJvIGJveFxyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94TGFiZWwpO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94SW5wdXQpO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94TGlzdCk7XHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIGNsZWFyIGJ1dHRvbiBhbmQgYWRkIHN0eWxlXHJcbiAgICAgICAgY29uc3QgY2xlYXJCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBjbGVhckJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XHJcbiAgICAgICAgY2xlYXJCdXR0b24uaW5uZXJIVE1MID0gJ0NsZWFyJztcclxuICAgICAgICAvL2NyZWF0ZSBkZWxldGUgYnV0dG9uLCBhZGQgc3R5bGUsIGFuZCB0aGVuIGhpZGUgaXQgZm9yIGxhdGVyIHVzZVxyXG4gICAgICAgIGNvbnN0IGRlbGV0ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzZlbSc7XHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdSZWQnO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5pbm5lckhUTUwgPSAnREVMRVRFJztcclxuICAgICAgICAvL2NyZWF0ZSBzZWxlY3QgYnV0dG9uIGFuZCBzdHlsZSBpdFxyXG4gICAgICAgIGNvbnN0IHNlbGVjdEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIHNlbGVjdEJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XHJcbiAgICAgICAgc2VsZWN0QnV0dG9uLmlubmVySFRNTCA9ICdcXHUyMTkxIFNlbGVjdCc7XHJcbiAgICAgICAgLy9jcmVhdGUgc2F2ZSBidXR0b24gYW5kIHN0eWxlIGl0XHJcbiAgICAgICAgY29uc3Qgc2F2ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIHNhdmVCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIHNhdmVCdXR0b24uaW5uZXJIVE1MID0gJ1NhdmUnO1xyXG4gICAgICAgIC8vYWRkIGFsbCA0IGJ1dHRvbnMgdG8gdGhlIGNvbWJvQm94IERJVlxyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNsZWFyQnV0dG9uKTtcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChzZWxlY3RCdXR0b24pO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKHNhdmVCdXR0b24pO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGRlbGV0ZUJ1dHRvbik7XHJcbiAgICAgICAgLy9jcmVhdGUgb3VyIHRleHQgYXJlYSBhbmQgc3R5bGUgaXQsIHRoZW4gaGlkZSBpdFxyXG4gICAgICAgIGNvbnN0IHF1aWNrU2hvdXRUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5oZWlnaHQgPSAnNTAlJztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5tYXJnaW4gPSAnMWVtJztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS53aWR0aCA9ICc5NyUnO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LmlkID0gJ21wX3F1aWNrU2hvdXRUZXh0JztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAvL2V4ZWN1dGVzIHdoZW4gY2xpY2tpbmcgc2VsZWN0IGJ1dHRvblxyXG4gICAgICAgIHNlbGVjdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZXJlIGlzIHNvbWV0aGluZyBpbnNpZGUgb2YgdGhlIHF1aWNrc2hvdXQgYXJlYVxyXG4gICAgICAgICAgICAgICAgaWYgKHF1aWNrU2hvdXRUZXh0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9wdXQgdGhlIHRleHQgaW4gdGhlIG1haW4gc2l0ZSByZXBseSBmaWVsZCBhbmQgZm9jdXMgb24gaXRcclxuICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IHF1aWNrU2hvdXRUZXh0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9jcmVhdGUgYSBxdWlja1Nob3V0IGRlbGV0ZSBidXR0b25cclxuICAgICAgICBkZWxldGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIG5vdCB0aGUgbGFzdCBxdWlja1Nob3V0XHJcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoanNvbkxpc3QpLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB0aGUgZW50cnkgZnJvbSB0aGUgSlNPTiBhbmQgdXBkYXRlIHRoZSBHTSB2YXJpYWJsZSB3aXRoIG5ldyBqc29uIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKV07XHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgdGhlIHNhdmUgYnV0dG9uIGZvciBuZXcgdW5zYXZlZCBzdGF0dXNcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBub3QgYSBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBvcHRpb25zIGZyb20gZGF0YWxpc3QgdG8gcmVzZXQgd2l0aCBuZXdseSBjcmVhdGVkIGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZm9yIGVhY2ggaXRlbSBpbiBuZXcganNvbkxpc3RcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbmV3IG9wdGlvbiBlbGVtZW50IHRvIGFkZCB0byBsaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBjdXJyZW50IGtleSB2YWx1ZSB0byB0aGUgZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgZWxlbWVudCB0byB0aGUgbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGxhc3QgaXRlbSBpbiB0aGUganNvbmxpc3RcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgaXRlbSBmcm9tIGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgv4LKgL2csICfgsqAnKV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZW50aXJlIHZhcmlhYmxlIHNvIGl0cyBub3QgZW1wdHkgR00gdmFyaWFibGVcclxuICAgICAgICAgICAgICAgICAgICBHTV9kZWxldGVWYWx1ZSgnbXBfcXVpY2tTaG91dCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgdGhlIHNhdmUgYnV0dG9uIGZvciBuZXcgdW5zYXZlZCBzdGF0dXNcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBub3QgYSBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgaW5wdXQgZXZlbnQgb24gaW5wdXQgdG8gZm9yY2Ugc29tZSB1cGRhdGVzIGFuZCBkaXNwYXRjaCBpdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vY3JlYXRlIGV2ZW50IG9uIHNhdmUgYnV0dG9uIHRvIHNhdmUgcXVpY2tzaG91dFxyXG4gICAgICAgIHNhdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGVyZSBpcyBkYXRhIGluIHRoZSBrZXkgYW5kIHZhbHVlIEdVSSBmaWVsZHMsIHByb2NlZWRcclxuICAgICAgICAgICAgICAgIGlmIChxdWlja1Nob3V0VGV4dC52YWx1ZSAmJiBjb21ib0JveElucHV0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy93YXMgaGF2aW5nIGlzc3VlIHdpdGggZXZhbCBwcm9jZXNzaW5nIHRoZSAucmVwbGFjZSBkYXRhIHNvIG1hZGUgYSB2YXJpYWJsZSB0byBpbnRha2UgaXRcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlZFRleHQgPSBjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZnVuIHdheSB0byBkeW5hbWljYWxseSBjcmVhdGUgc3RhdGVtZW50cyAtIHRoaXMgdGFrZXMgd2hhdGV2ZXIgaXMgaW4gbGlzdCBmaWVsZCB0byBjcmVhdGUgYSBrZXkgd2l0aCB0aGF0IHRleHQgYW5kIHRoZSB2YWx1ZSBmcm9tIHRoZSB0ZXh0YXJlYVxyXG4gICAgICAgICAgICAgICAgICAgIGV2YWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGBqc29uTGlzdC5gICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZWRUZXh0ICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYD0gXCJgICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHF1aWNrU2hvdXRUZXh0LnZhbHVlKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGBcIjtgXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAvL292ZXJ3cml0ZSBvciBjcmVhdGUgdGhlIEdNIHZhcmlhYmxlIHdpdGggbmV3IGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgc2F2ZSBidXR0b24gdG8gZ3JlZW4gbm93IHRoYXQgaXRzIHNhdmVkIGFzLWlzXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL3Nob3cgZGVsZXRlIGJ1dHRvbiBub3cgdGhhdCBpdHMgYSBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZXhpc3RpbmcgZGF0YWxpc3QgZWxlbWVudHMgdG8gcmVidWlsZCB3aXRoIG5ldyBqc29ubGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpbiB0aGUganNvbmxpc3RcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIG5ldyBvcHRpb24gZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCBrZXkgbmFtZSB0byB0aGUgb3B0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1RPRE86IHRoaXMgbWF5IG9yIG1heSBub3QgYmUgbmVjZXNzYXJ5LCBidXQgd2FzIGhhdmluZyBpc3N1ZXMgd2l0aCB0aGUgdW5pcXVlIHN5bWJvbCBzdGlsbCByYW5kb21seSBzaG93aW5nIHVwIGFmdGVyIHNhdmVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0gY29tYm9Cb3hPcHRpb24udmFsdWUucmVwbGFjZSgv4LKgL2csICcgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIHRvIHRoZSBsaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNvbWJvQm94T3B0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9hZGQgZXZlbnQgZm9yIGNsZWFyIGJ1dHRvbiB0byByZXNldCB0aGUgZGF0YWxpc3RcclxuICAgICAgICBjbGVhckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2NsZWFyIHRoZSBpbnB1dCBmaWVsZCBhbmQgdGV4dGFyZWEgZmllbGRcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94SW5wdXQudmFsdWUgPSAnJztcclxuICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgICAgICAvL2NyZWF0ZSBpbnB1dCBldmVudCBvbiBpbnB1dCB0byBmb3JjZSBzb21lIHVwZGF0ZXMgYW5kIGRpc3BhdGNoIGl0XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94SW5wdXQuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9OZXh0IHR3byBpbnB1dCBmdW5jdGlvbnMgYXJlIG1lYXQgYW5kIHBvdGF0b2VzIG9mIHRoZSBsb2dpYyBmb3IgdXNlciBmdW5jdGlvbmFsaXR5XHJcblxyXG4gICAgICAgIC8vd2hlbmV2ZXIgc29tZXRoaW5nIGlzIHR5cGVkIG9yIGNoYW5nZWQgd2hpdGhpbiB0aGUgaW5wdXQgZmllbGRcclxuICAgICAgICBjb21ib0JveElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdpbnB1dCcsXHJcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vaWYgaW5wdXQgaXMgYmxhbmtcclxuICAgICAgICAgICAgICAgIGlmICghY29tYm9Cb3hJbnB1dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIHRleHRhcmVhIGlzIGFsc28gYmxhbmsgbWluaW1pemUgcmVhbCBlc3RhdGVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXF1aWNrU2hvdXRUZXh0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgdGV4dCBhcmVhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2hyaW5rIHRoZSBmb290ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdXRGb290IS5zdHlsZS5oZWlnaHQgPSAnMi41ZW0nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiB0byBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBzb21ldGhpbmcgaXMgc3RpbGwgaW4gdGhlIHRleHRhcmVhIHdlIG5lZWQgdG8gaW5kaWNhdGUgdGhhdCB1bnNhdmVkIGFuZCB1bm5hbWVkIGRhdGEgaXMgdGhlcmVcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3N0eWxlIGZvciB1bnNhdmVkIGFuZCB1bm5hbWVkIGlzIG9yZ2FuZ2Ugc2F2ZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vZWl0aGVyIHdheSwgaGlkZSB0aGUgZGVsZXRlIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgaW5wdXQgZmllbGQgaGFzIGFueSB0ZXh0IGluIGl0XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnB1dFZhbCA9IGNvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9zaG93IHRoZSB0ZXh0IGFyZWEgZm9yIGlucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZXhwYW5kIHRoZSBmb290ZXIgdG8gYWNjb21vZGF0ZSBhbGwgZmVhdHVyZSBhc3BlY3RzXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdXRGb290IS5zdHlsZS5oZWlnaHQgPSAnMTFlbSc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB3aGF0IGlzIGluIHRoZSBpbnB1dCBmaWVsZCBpcyBhIHNhdmVkIGVudHJ5IGtleVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uTGlzdFtpbnB1dFZhbF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGNhbiBiZSBhIHN1Y2t5IGxpbmUgb2YgY29kZSBiZWNhdXNlIGl0IGNhbiB3aXBlIG91dCB1bnNhdmVkIGRhdGEsIGJ1dCBpIGNhbm5vdCB0aGluayBvZiBiZXR0ZXIgd2F5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVwbGFjZSB0aGUgdGV4dCBhcmVhIGNvbnRlbnRzIHdpdGggd2hhdCB0aGUgdmFsdWUgaXMgaW4gdGhlIG1hdGNoZWQgcGFpclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWlja1Nob3V0VGV4dC52YWx1ZSA9IGpzb25MaXN0W0pTT04ucGFyc2UoaW5wdXRWYWwpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnQoanNvbkxpc3RbaW5wdXRWYWxdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2hvdyB0aGUgZGVsZXRlIGJ1dHRvbiBzaW5jZSB0aGlzIGlzIG5vdyBleGFjdCBtYXRjaCB0byBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gdG8gc2hvdyBpdHMgYSBzYXZlZCBjb21ib1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIG5vdCBhIHJlZ2lzdGVyZWQga2V5IG5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgdGhlIHNhdmUgYnV0dG9uIHRvIGJlIGFuIHVuc2F2ZWQgZW50cnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgZGVsZXRlIGJ1dHRvbiBzaW5jZSB0aGlzIGNhbm5vdCBiZSBzYXZlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy93aGVuZXZlciBzb21ldGhpbmcgaXMgdHlwZWQgb3IgZGVsZXRlZCBvdXQgb2YgdGV4dGFyZWFcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnaW5wdXQnLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dFZhbCA9IGNvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgaW5wdXQgZmllbGQgaXMgYmxhbmtcclxuICAgICAgICAgICAgICAgIGlmICghY29tYm9Cb3hJbnB1dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiBmb3IgdW5zYXZlZCBhbmQgdW5uYW1lZFxyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGRlbGV0ZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vaWYgaW5wdXQgZmllbGQgaGFzIHRleHQgaW4gaXRcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb25MaXN0W2lucHV0VmFsXSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlICE9PSBkZWNvZGVVUklDb21wb25lbnQoanNvbkxpc3RbaW5wdXRWYWxdKVxyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIGFzIHllbGxvdyBmb3IgZWRpdHRlZFxyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ1llbGxvdyc7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBrZXkgaXMgYSBtYXRjaCBhbmQgdGhlIGRhdGEgaXMgYSBtYXRjaCB0aGVuIHdlIGhhdmUgYSAxMDAlIHNhdmVkIGVudHJ5IGFuZCBjYW4gcHV0IGV2ZXJ5dGhpbmcgYmFjayB0byBzYXZlZFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICBqc29uTGlzdFtpbnB1dFZhbF0gJiZcclxuICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSA9PT0gZGVjb2RlVVJJQ29tcG9uZW50KGpzb25MaXN0W2lucHV0VmFsXSlcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiB0byBncmVlbiBmb3Igc2F2ZWRcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUga2V5IGlzIG5vdCBmb3VuZCBpbiB0aGUgc2F2ZWQgbGlzdCwgb3JhbmdlIGZvciB1bnNhdmVkIGFuZCB1bm5hbWVkXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFqc29uTGlzdFtpbnB1dFZhbF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9hZGQgdGhlIGNvbWJvYm94IGFuZCB0ZXh0IGFyZWEgZWxlbWVudHMgdG8gdGhlIGZvb3RlclxyXG4gICAgICAgIHNob3V0Rm9vdC5hcHBlbmRDaGlsZChjb21ib0JveERpdik7XHJcbiAgICAgICAgc2hvdXRGb290LmFwcGVuZENoaWxkKHF1aWNrU2hvdXRUZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEFkZFRvTGlzdHMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnQWRkIHVzZXJzIHRvIGxpc3RzJyxcclxuICAgICAgICAgICAgZGVzYzogYFBsYWNlcyBhZGQgZnJpZW5kLCBibG9jaywgbXV0ZSwgYW5kIGVtcGhhc2l6ZSBidXR0b25zIGluIFNob3V0Ym94IGRvdC1tZW51YCxcclxuICAgICAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZic7XHJcbiAgICBwcml2YXRlIF9hZGRVc2Vyczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEluaXRpYWxpemVkIEJ1dHRvbnMuYCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNiZkRpdiA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JmJykhO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyIGZvciBhbnkgY2xpY2sgaW4gdGhlIHNiZiBkaXZcclxuICAgICAgICAgICAgc2JmRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2JNZW51RWxlbSA9IHRhcmdldC5jbG9zZXN0KCcuc2JfbWVudScpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE9ubHkgcHJvY2VlZCBpZiB0aGUgdGFyZ2V0IGlzIHRoZSB0cmlwbGUgZG90IG1lbnUgaW4gc2hvdXRib3hcclxuICAgICAgICAgICAgICAgIGlmICghc2JNZW51RWxlbSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgTWVudSBhZnRlciBpdCBwb3BzIHVwXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBdHRlbXB0aW5nIHRvIEFkZCBDdXN0b20gQnV0dG9ucy4uLmApO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcG9wdXBNZW51OiBIVE1MRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JNZW51TWFpbicpO1xyXG4gICAgICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuc2xlZXAoNSk7XHJcbiAgICAgICAgICAgICAgICB9IHdoaWxlICghcG9wdXBNZW51IS5oYXNDaGlsZE5vZGVzKCkpO1xyXG4gICAgICAgICAgICAgICAgLy9nZXQgdGhlIHVzZXIgZGV0YWlscyBmcm9tIHRoZSBwb3B1cCBtZW51IGRldGFpbHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvcHVwVXNlcjogSFRNTEVsZW1lbnQgPSBVdGlsLm5vZGVUb0VsZW0ocG9wdXBNZW51IS5jaGlsZE5vZGVzWzBdKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXBvcHVwTWVudSB8fCAhcG9wdXBVc2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbTStdIFBvcHVwIG1lbnUgb3IgdXNlciBlbGVtZW50IG5vdCBmb3VuZC5gKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWU6IHN0cmluZyA9IHBvcHVwVXNlci5nZXRBdHRyaWJ1dGUoJ2RhdGEtdWlkJykhO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1c2VyTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW00rXSBVc2VyIElEIG5vdCBmb3VuZC5gKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuc2xlZXAoNSk7XHJcbiAgICAgICAgICAgICAgICB9IHdoaWxlICghcG9wdXBNZW51Py5oYXNDaGlsZE5vZGVzKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFBvcHVwIG1lbnUgbG9jYXRlZCwgYWRkaW5nIGJ1dHRvbnMuLi5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDbGVhciBwcmV2aW91cyBidXR0b25zIHRvIGF2b2lkIGR1cGxpY2F0ZXNcclxuICAgICAgICAgICAgICAgIHBvcHVwTWVudS5xdWVyeVNlbGVjdG9yQWxsKCcuY3VzdG9tLWJ1dHRvbicpLmZvckVhY2goYnV0dG9uID0+IGJ1dHRvbi5yZW1vdmUoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVXNlIHRoZSBhZGRCdXR0b25Ub1N1Yk1lbnUgZnVuY3Rpb24gdG8gYWRkIGVhY2ggYnV0dG9uIHdpdGggc3BlY2lmaWMgYWN0aW9uc1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uVG9TdWJNZW51KHBvcHVwTWVudSwgXCLwn5KWQWRkIEZyaWVuZFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWRkRnJpZW5kVXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvZnJpZW5kcy5waHA/YWN0aW9uPWFkZCZ0eXBlPWZyaWVuZCZ0YXJnZXRpZD0ke3VzZXJOYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oYWRkRnJpZW5kVXJsLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b25Ub1N1Yk1lbnUocG9wdXBNZW51LCBcIvCfmqtCbG9ja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmxvY2tVcmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9mcmllbmRzLnBocD9hY3Rpb249YWRkJnR5cGU9YmxvY2smdGFyZ2V0aWQ9JHt1c2VyTmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKGJsb2NrVXJsLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8qIFRPRE86IEVtcGhhc2l6ZSBsaXN0IGlzIG9ubHkgbG9hZGVkIG9uIHBhZ2UgcmVsb2FkLCBmaW5hIGEgd2F5IHRvIHJlbG9hZCBhZnRlciBsaXN0IHVwZGF0ZWRcclxuICAgICAgICAgICAgICAgICogQ2hlY2sgaWYgcHJpb3JpdHlVc2VycyBpcyB0cnVlIG9yIG5vdCBpZiBub3Qgc2V0IGl0IHRvIHRydWVcclxuICAgICAgICAgICAgICAgICogKi9cclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEJ1dHRvblRvU3ViTWVudShwb3B1cE1lbnUsIFwi8J+UikVtcGhhc2l6ZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkKHVzZXJOYW1lLCdwcmlvcml0eScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VuYWJsZVByaW9yaXR5VXNlcnMoKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhcIkVtcGhhc2l6ZSBjbGlja2VkXCIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLyogQ2hlY2sgaWYgbXV0ZWRVc2VycyBpcyB0cnVlIG9yIG5vdCBpZiBub3Qgc2V0IGl0IHRvIHRydWUgKi9cclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEJ1dHRvblRvU3ViTWVudShwb3B1cE1lbnUsIFwi8J+Uh011dGVcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZCh1c2VyTmFtZSwnbXV0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVNdXRlZFVzZXJzKClcclxuICAgICAgICAgICAgICAgICAgICBpZihNUC5ERUJVRykgY29uc29sZS5sb2coXCJNdXRlIGNsaWNrZWRcIik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBDdXN0b20gYnV0dG9ucyBhZGRlZCBzdWNjZXNzZnVsbHkuYCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIHByaXZhdGUgX2VuYWJsZVByaW9yaXR5VXNlcnMoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGtleSA9ICdwcmlvcml0eVVzZXJzJztcclxuXHJcbiAgICAgICAgICAgIC8vIFJldHJpZXZlIHRoZSBjdXJyZW50IHZhbHVlIG9yIGRlZmF1bHQgdG8gZmFsc2VcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRWYWx1ZSA9IEdNX2dldFZhbHVlKGtleSwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHZhbHVlIGlzIGZhbHNlXHJcbiAgICAgICAgICAgIGlmICghY3VycmVudFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIHZhbHVlIHRvIHRydWVcclxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGtleSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZihNUC5ERUJVRykgY29uc29sZS5sb2coYFtVc2VyTWFuYWdlcl0gJyR7a2V5fScgd2FzIGZhbHNlIGFuZCBoYXMgYmVlbiBzZXQgdG8gdHJ1ZS5gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgW1VzZXJNYW5hZ2VyXSAnJHtrZXl9JyBpcyBhbHJlYWR5IHRydWUuYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZW5hYmxlTXV0ZWRVc2Vycygpe1xyXG4gICAgICAgIGNvbnN0IGtleSA9ICdtdXRlZFVzZXJzJztcclxuICAgICAgICBsZXQgY3VycmVudFZhbHVlID0gR01fZ2V0VmFsdWUoa2V5LCBmYWxzZSk7XHJcbiAgICAgICAgaWYgKCFjdXJyZW50VmFsdWUpe1xyXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZShrZXksIHRydWUpO1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBbVXNlck1hbmFnZXJdICcke2tleX0nIHdhcyBmYWxzZSBhbmQgaGFzIGJlZW4gc2V0IHRvIHRydWUuYCk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFtVc2VyTWFuYWdlcl0gJyR7a2V5fScgaXMgYWxyZWFkeSB0cnVlLmApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAgICAgLy8gRnVuY3Rpb24gdG8gYWRkIGEgdXNlcm5hbWUgdG8gcHJpb3JpdHlVc2VycyBvciBtdXRlZFVzZXJzIGlmIG5vdCBhbHJlYWR5IHByZXNlbnQgYW5kIHNhdmUgaXQgZGlyZWN0bHlcclxuICAgIHByaXZhdGUgYXN5bmMgX2FkZCh1c2VyTmFtZTogc3RyaW5nLCB0YXI6J3ByaW9yaXR5J3wnbXV0ZWQnKSB7XHJcbiAgICAgICAgICAgIC8vIExvYWQgdGhlIGN1cnJlbnQgbGlzdCBmcm9tIHN0b3JhZ2UsIGluaXRpYWxpemUgYXMgZW1wdHkgYXJyYXkgaWYgbm90IHlldCBjcmVhdGVkXHJcbiAgICAgICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3Rhcn1Vc2Vyc192YWxgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENvbnZlcnQgQ1NWIHRvIGFycmF5IGlmIGdtVmFsdWUgZXhpc3RzOyBvdGhlcndpc2UsIHN0YXJ0IHdpdGggYW4gZW1wdHkgYXJyYXlcclxuICAgICAgICAgICAgdGhpcy5fYWRkVXNlcnMgPSBnbVZhbHVlID8gYXdhaXQgVXRpbC5jc3ZUb0FycmF5KGdtVmFsdWUpIDogW107XHJcblxyXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgdXNlciBpcyBhbHJlYWR5IGluIF9wcmlvcml0eVVzZXJzXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fYWRkVXNlcnMuaW5jbHVkZXModXNlck5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIG5ldyB1c2VyIHRvIHRoZSBhcnJheVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVXNlcnMucHVzaCh1c2VyTmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgdXBkYXRlZCBhcnJheSB0byBDU1YgZm9ybWF0XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkQ3N2ID0gdGhpcy5fYWRkVXNlcnMuam9pbignLCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIENTViBzdHJpbmcgYmFjayB0byBzdG9yYWdlIHRvIHBlcnNpc3QgY2hhbmdlc1xyXG4gICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoYCR7dGFyfVVzZXJzX3ZhbGAsIHVwZGF0ZWRDc3YpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVzZXIgJHt1c2VyTmFtZX0gYWRkZWQgdG8gX3ByaW9yaXR5VXNlcnMgYW5kIHNhdmVkLmApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkTWVzc2FnZShgQWRkZWQgdG8gJHt0YXJ9IGxpc3QsIHJlbG9hZCByZXF1aXJlZGApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVzZXIgJHt1c2VyTmFtZX0gaXMgYWxyZWFkeSBpbiB0aGUgJHt0YXJ9VXNlcnMgbGlzdC5gKTtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSB1c2VyIGlmIHRoZXkgYXJlIGFscmVhZHkgaW4gdGhlIGxpc3QsIG1ha2luZyB0aGUgYnV0dG9uIGludG8gYSB0b2dnbGVcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZE1lc3NhZ2UoYFVzZXIgYWxyZWFkeSBpbiAke3Rhcn0gbGlzdGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTaW1wbGUgZnVuY3Rpb24gdG8gYWRkIGEgbWVzc2FnZSB0byB0aGUgc2hvdXRib3hcclxuICAgIHByaXZhdGUgX2FkZE1lc3NhZ2UodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIC8vIExvY2F0ZSB0aGUgbWFpbiBzaG91dGJveCBkaXZcclxuICAgICAgICAgICAgY29uc3Qgc2JmRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NiZicpO1xyXG4gICAgICAgICAgICBjb25zdCBzYmZEaXZDaGlsZCA9IHNiZkRpdiEuZmlyc3RDaGlsZDtcclxuXHJcbiAgICAgICAgICAgIGlmIChzYmZEaXYpIHtcclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG5ldyBkaXYgZm9yIHRoZSBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlRGl2LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfZ2lmdFN0YXR1c0VsZW0nKTtcclxuICAgICAgICAgICAgICAgIHNiZkRpdkNoaWxkIS5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYW5kIGFwcGVuZCBhIHRleHQgbm9kZSB3aXRoIHRoZSBwcm92aWRlZCBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpKTtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2VEaXYuY2xhc3NMaXN0LmFkZCgnbXBfc3VjY2VzcycpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNjcm9sbCB0aGUgc2hvdXRib3ggdG8gdGhlIGJvdHRvbSB0byBzaG93IHRoZSBuZXcgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgc2JmRGl2LnNjcm9sbFRvcCA9IHNiZkRpdi5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tNK10gU2hvdXRib3ggZGl2IG5vdCBmb3VuZCEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9hZGRCdXR0b25Ub1N1Yk1lbnUobWVudTogSFRNTEVsZW1lbnQsIGxhYmVsOiBzdHJpbmcsIG9uQ2xpY2s6ICgpID0+IHZvaWQpIHtcclxuICAgICAgICAgICAgLyogVE9ETzogR2VuZXJhbGlzZSBhbmQgbW92ZSB0byB1dGlsLCBtYWtlIEdpZnRCdXR0b24gdXNlIGl0LiAqL1xyXG4gICAgICAgICAgICBjb25zdCBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgIGJ1dHRvbkNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdjdXN0b20tYnV0dG9uJyk7IC8vIENsYXNzIGZvciBlYXN5IGRlYnVnZ2luZyBhbmQgcmVtb3ZhbCBpZiBuZWVkZWRcclxuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5pbm5lclRleHQgPSBsYWJlbDtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCB1cCBidXR0b24gY2xpY2sgZXZlbnRcclxuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljayk7XHJcblxyXG4gICAgICAgICAgICAvLyBBcHBlbmQgZWxlbWVudHMgdG8gY29udGFpbmVyXHJcbiAgICAgICAgICAgIGJ1dHRvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b24pO1xyXG4gICAgICAgICAgICBidXR0b25Db250YWluZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJyAnKSk7XHJcblxyXG4gICAgICAgICAgICAvLyBBcHBlbmQgYnV0dG9uQ29udGFpbmVyIHRvIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGUgbWVudSBvciBmYWxsYmFjayB0byB0aGUgbWVudSBpdHNlbGZcclxuICAgICAgICAgICAgKG1lbnUuY2hpbGROb2Rlc1swXSB8fCBtZW51KS5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiAqIEF1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLlxyXG4gKi9cclxuY2xhc3MgVG9yR2lmdERlZmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICd0b3JHaWZ0RGVmYXVsdCcsXHJcbiAgICAgICAgdGFnOiAnRGVmYXVsdCBHaWZ0JyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiA1MDAwLCBtYXgnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdBdXRvZmlsbHMgdGhlIEdpZnQgYm94IHdpdGggYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBvaW50cy4gKDxlbT5PciB0aGUgbWF4IGFsbG93YWJsZSB2YWx1ZSwgd2hpY2hldmVyIGlzIGxvd2VyPC9lbT4pJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdGhhbmtzQXJlYSBpbnB1dFtuYW1lPXBvaW50c10nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIG5ldyBTaGFyZWQoKVxyXG4gICAgICAgICAgICAuZmlsbEdpZnRCb3godGhpcy5fdGFyLCB0aGlzLl9zZXR0aW5ncy50aXRsZSlcclxuICAgICAgICAgICAgLnRoZW4oKHBvaW50cykgPT5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNldCB0aGUgZGVmYXVsdCBnaWZ0IGFtb3VudCB0byAke3BvaW50c31gKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBBZGRzIHZhcmlvdXMgbGlua3MgdG8gR29vZHJlYWRzXHJcbiAqL1xyXG5jbGFzcyBHb29kcmVhZHNCdXR0b24gaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2dvb2RyZWFkc0J1dHRvbicsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3VibWl0SW5mbyc7XHJcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIGZlYXR1cmUgc2hvdWxkIG9ubHkgcnVuIG9uIGJvb2sgY2F0ZWdvcmllc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvIFtjbGFzc149Y2F0XScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhdCAmJiBDaGVjay5pc0Jvb2tDYXQocGFyc2VJbnQoY2F0LmNsYXNzTmFtZS5zdWJzdHJpbmcoMykpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm90IGEgYm9vayBjYXRlZ29yeTsgc2tpcHBpbmcgR29vZHJlYWRzIGJ1dHRvbnMnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBkYXRhIHBvaW50c1xyXG4gICAgICAgIGNvbnN0IGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XHJcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yRGV0TWFpbkNvbiAudG9yQXV0aG9ycyBhJyk7XHJcbiAgICAgICAgY29uc3QgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAnI3RvckRldE1haW5Db24gLlRvcnJlbnRUaXRsZSdcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XHJcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjU2VyaWVzIGEnKTtcclxuICAgICAgICBjb25zdCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICAvLyBHZW5lcmF0ZSBidXR0b25zXHJcbiAgICAgICAgdGhpcy5fc2hhcmUuZ29vZHJlYWRzQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEFkZHMgdmFyaW91cyBsaW5rcyB0byBBdWRpYmxlXHJcbiAqL1xyXG5jbGFzcyBBdWRpYmxlQnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdhdWRpYmxlQnV0dG9uJyxcclxuICAgICAgICBkZXNjOiAnRW5hYmxlIHRoZSBNQU0tdG8tQXVkaWJsZSBidXR0b25zJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3VibWl0SW5mbyc7XHJcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIGZlYXR1cmUgc2hvdWxkIG9ubHkgcnVuIG9uIGJvb2sgY2F0ZWdvcmllc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvIFtjbGFzc149Y2F0XScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhdCAmJiBDaGVjay5pc0Jvb2tDYXQocGFyc2VJbnQoY2F0LmNsYXNzTmFtZS5zdWJzdHJpbmcoMykpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm90IGEgYm9vayBjYXRlZ29yeTsgc2tpcHBpbmcgQXVkaWJsZSBidXR0b25zJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGF0YSBwb2ludHNcclxuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYScpO1xyXG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI1NlcmllcyBhJyk7XHJcblxyXG4gICAgICAgIGxldCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuXHJcbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9zZ1JvdycpKSB7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfc2dSb3cnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9nclJvdycpKSB7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIGJ1dHRvbnNcclxuICAgICAgICB0aGlzLl9zaGFyZS5hdWRpYmxlQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEFkZHMgdmFyaW91cyBsaW5rcyB0byBTdG9yeUdyYXBoXHJcbiAqL1xyXG5jbGFzcyBTdG9yeUdyYXBoQnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdzdG9yeUdyYXBoQnV0dG9uJyxcclxuICAgICAgICBkZXNjOiAnRW5hYmxlIHRoZSBNQU0tdG8tU3RvcnlHcmFwaCBidXR0b25zJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3VibWl0SW5mbyc7XHJcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIGZlYXR1cmUgc2hvdWxkIG9ubHkgcnVuIG9uIGJvb2sgY2F0ZWdvcmllc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvIFtjbGFzc149Y2F0XScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhdCAmJiBDaGVjay5pc0Jvb2tDYXQocGFyc2VJbnQoY2F0LmNsYXNzTmFtZS5zdWJzdHJpbmcoMykpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm90IGEgYm9vayBjYXRlZ29yeTsgc2tpcHBpbmcgU3Ryb3lHcmFwaCBidXR0b25zJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGF0YSBwb2ludHNcclxuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYScpO1xyXG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI1NlcmllcyBhJyk7XHJcblxyXG4gICAgICAgIGxldCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuXHJcbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9nclJvdycpKSB7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIGJ1dHRvbnNcclxuICAgICAgICB0aGlzLl9zaGFyZS5zdG9yeUdyYXBoQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEdlbmVyYXRlcyBhIGZpZWxkIGZvciBcIkN1cnJlbnRseSBSZWFkaW5nXCIgYmJjb2RlXHJcbiAqL1xyXG5jbGFzcyBDdXJyZW50bHlSZWFkaW5nIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdGl0bGU6ICdjdXJyZW50bHlSZWFkaW5nJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIGdlbmVyYXRlIGEgXCJDdXJyZW50bHkgUmVhZGluZ1wiIGZvcnVtIHNuaXBwZXRgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIEN1cnJlbnRseSBSZWFkaW5nIHNlY3Rpb24uLi4nKTtcclxuICAgICAgICAvLyBHZXQgdGhlIHJlcXVpcmVkIGluZm9ybWF0aW9uXHJcbiAgICAgICAgY29uc3QgdGl0bGU6IHN0cmluZyA9IGRvY3VtZW50IS5xdWVyeVNlbGVjdG9yKCcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJykhXHJcbiAgICAgICAgICAgIC50ZXh0Q29udGVudCE7XHJcbiAgICAgICAgY29uc3QgYXV0aG9yczogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYSdcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IHRvcklEOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKVsyXTtcclxuICAgICAgICBjb25zdCByb3dUYXI6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbycpO1xyXG5cclxuICAgICAgICAvLyBUaXRsZSBjYW4ndCBiZSBudWxsXHJcbiAgICAgICAgaWYgKHRpdGxlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGl0bGUgZmllbGQgd2FzIG51bGxgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIGEgbmV3IHRhYmxlIHJvd1xyXG4gICAgICAgIGNvbnN0IGNyUm93OiBIVE1MRGl2RWxlbWVudCA9IGF3YWl0IFV0aWwuYWRkVG9yRGV0YWlsc1JvdyhcclxuICAgICAgICAgICAgcm93VGFyLFxyXG4gICAgICAgICAgICAnQ3VycmVudGx5IFJlYWRpbmcnLFxyXG4gICAgICAgICAgICAnbXBfY3JSb3cnXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyBQcm9jZXNzIGRhdGEgaW50byBzdHJpbmdcclxuICAgICAgICBjb25zdCBibHVyYjogc3RyaW5nID0gYXdhaXQgdGhpcy5fZ2VuZXJhdGVTbmlwcGV0KHRvcklELCB0aXRsZSwgYXV0aG9ycyk7XHJcbiAgICAgICAgLy8gQnVpbGQgYnV0dG9uXHJcbiAgICAgICAgY29uc3QgYnRuOiBIVE1MRGl2RWxlbWVudCA9IGF3YWl0IHRoaXMuX2J1aWxkQnV0dG9uKGNyUm93LCBibHVyYik7XHJcbiAgICAgICAgLy8gSW5pdCBidXR0b25cclxuICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihidG4sIGJsdXJiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQnVpbGQgYSBCQiBDb2RlIHRleHQgc25pcHBldCB1c2luZyB0aGUgYm9vayBpbmZvLCB0aGVuIHJldHVybiBpdFxyXG4gICAgICogQHBhcmFtIGlkIFRoZSBzdHJpbmcgSUQgb2YgdGhlIGJvb2tcclxuICAgICAqIEBwYXJhbSB0aXRsZSBUaGUgc3RyaW5nIHRpdGxlIG9mIHRoZSBib29rXHJcbiAgICAgKiBAcGFyYW0gYXV0aG9ycyBBIG5vZGUgbGlzdCBvZiBhdXRob3IgbGlua3NcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2VuZXJhdGVTbmlwcGV0KFxyXG4gICAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcclxuICAgICAgICBhdXRob3JzOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PlxyXG4gICAgKTogc3RyaW5nIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIEFkZCBBdXRob3IgTGlua1xyXG4gICAgICAgICAqIEBwYXJhbSBhdXRob3JFbGVtIEEgbGluayBjb250YWluaW5nIGF1dGhvciBpbmZvcm1hdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IGFkZEF1dGhvckxpbmsgPSAoYXV0aG9yRWxlbTogSFRNTEFuY2hvckVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGBbdXJsPSR7YXV0aG9yRWxlbS5ocmVmLnJlcGxhY2UoJ2h0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQnLCAnJyl9XSR7XHJcbiAgICAgICAgICAgICAgICBhdXRob3JFbGVtLnRleHRDb250ZW50XHJcbiAgICAgICAgICAgIH1bL3VybF1gO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgdGhlIE5vZGVMaXN0IGludG8gYW4gQXJyYXkgd2hpY2ggaXMgZWFzaWVyIHRvIHdvcmsgd2l0aFxyXG4gICAgICAgIGxldCBhdXRob3JBcnJheTogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBhdXRob3JzLmZvckVhY2goKGF1dGhvckVsZW0pID0+IGF1dGhvckFycmF5LnB1c2goYWRkQXV0aG9yTGluayhhdXRob3JFbGVtKSkpO1xyXG4gICAgICAgIC8vIERyb3AgZXh0cmEgaXRlbXNcclxuICAgICAgICBpZiAoYXV0aG9yQXJyYXkubGVuZ3RoID4gMykge1xyXG4gICAgICAgICAgICBhdXRob3JBcnJheSA9IFsuLi5hdXRob3JBcnJheS5zbGljZSgwLCAzKSwgJ2V0Yy4nXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBgW3VybD0vdC8ke2lkfV0ke3RpdGxlfVsvdXJsXSBieSBbaV0ke2F1dGhvckFycmF5LmpvaW4oJywgJyl9Wy9pXWA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIEJ1aWxkIGEgYnV0dG9uIG9uIHRoZSB0b3IgZGV0YWlscyBwYWdlXHJcbiAgICAgKiBAcGFyYW0gdGFyIEFyZWEgd2hlcmUgdGhlIGJ1dHRvbiB3aWxsIGJlIGFkZGVkIGludG9cclxuICAgICAqIEBwYXJhbSBjb250ZW50IENvbnRlbnQgdGhhdCB3aWxsIGJlIGFkZGVkIGludG8gdGhlIHRleHRhcmVhXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2J1aWxkQnV0dG9uKHRhcjogSFRNTERpdkVsZW1lbnQsIGNvbnRlbnQ6IHN0cmluZyk6IEhUTUxEaXZFbGVtZW50IHtcclxuICAgICAgICAvLyBCdWlsZCB0ZXh0IGRpc3BsYXlcclxuICAgICAgICB0YXIuaW5uZXJIVE1MID0gYDx0ZXh0YXJlYSByb3dzPVwiMVwiIGNvbHM9XCI4MFwiIHN0eWxlPSdtYXJnaW4tcmlnaHQ6NXB4Jz4ke2NvbnRlbnR9PC90ZXh0YXJlYT5gO1xyXG4gICAgICAgIC8vIEJ1aWxkIGJ1dHRvblxyXG4gICAgICAgIFV0aWwuY3JlYXRlQnV0dG9uRWxlbWVudChcclxuICAgICAgICAgICAgJycsXHJcbiAgICAgICAgICAgICdDb3B5JyxcclxuICAgICAgICAgICAgdGFyLFxyXG4gICAgICAgICAgICB7IHVybDogJ25vbmUnLCBvcmRlcjogMiwgcmVsYXRpdmU6ICdhZnRlcmJlZ2luJywgYnRuQ2xhc3M6ICdtcF9idXR0b25fY2xvbmUnIH1cclxuICAgICAgICApO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9jclJvdyAubXBfYnV0dG9uX2Nsb25lJykhLmNsYXNzTGlzdC5hZGQoJ21wX3JlYWRpbmcnKTtcclxuICAgICAgICAvLyBSZXR1cm4gYnV0dG9uXHJcbiAgICAgICAgcmV0dXJuIDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfcmVhZGluZycpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogUHJvdGVjdHMgdGhlIHVzZXIgZnJvbSByYXRpbyB0cm91YmxlcyBieSBhZGRpbmcgd2FybmluZ3MgYW5kIGRpc3BsYXlpbmcgcmF0aW8gZGVsdGFcclxuICovXHJcbmNsYXNzIFJhdGlvUHJvdGVjdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0JyxcclxuICAgICAgICBkZXNjOiBgUHJvdGVjdCB5b3VyIHJhdGlvIHdpdGggd2FybmluZ3MgJmFtcDsgcmF0aW8gY2FsY3VsYXRpb25zYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjcmF0aW8nO1xyXG4gICAgcHJpdmF0ZSBfcmNSb3c6IHN0cmluZyA9ICdtcF9yYXRpb0Nvc3RSb3cnO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGluZyByYXRpbyBwcm90ZWN0aW9uLi4uJyk7XHJcbiAgICAgICAgLy8gVE9ETzogTW92ZSB0aGlzIGJsb2NrIHRvIHNoYXJlZFxyXG4gICAgICAgIC8vIFRoZSBkb3dubG9hZCB0ZXh0IGFyZWFcclxuICAgICAgICBjb25zdCBkbEJ0bjogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RkZGwnKTtcclxuICAgICAgICAvLyBUaGUgY3VycmVudGx5IHVudXNlZCBsYWJlbCBhcmVhIGFib3ZlIHRoZSBkb3dubG9hZCB0ZXh0XHJcbiAgICAgICAgY29uc3QgZGxMYWJlbDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyNkb3dubG9hZCAudG9yRGV0SW5uZXJUb3AnXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyBJbnNlcnRpb24gdGFyZ2V0IGZvciBtZXNzYWdlc1xyXG4gICAgICAgIGNvbnN0IGRlc2NCbG9jayA9IGF3YWl0IENoZWNrLmVsZW1Mb2FkKCcudG9yRGV0Qm90dG9tJyk7XHJcbiAgICAgICAgLy8gV291bGQgYmVjb21lIHJhdGlvXHJcbiAgICAgICAgY29uc3Qgck5ldzogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIC8vIEN1cnJlbnQgcmF0aW9cclxuICAgICAgICBjb25zdCByQ3VyOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RtUicpO1xyXG4gICAgICAgIC8vIFNlZWRpbmcgb3IgZG93bmxvYWRpbmdcclxuICAgICAgICBjb25zdCBzZWVkaW5nOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI0RMaGlzdG9yeScpO1xyXG4gICAgICAgIC8vIFVzZXIgaGFzIGEgcmF0aW9cclxuICAgICAgICBjb25zdCB1c2VySGFzUmF0aW8gPSByQ3VyLnRleHRDb250ZW50LmluZGV4T2YoJ0luZicpIDwgMCA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBjdXN0b20gcmF0aW8gYW1vdW50cyAod2lsbCByZXR1cm4gZGVmYXVsdCB2YWx1ZXMgb3RoZXJ3aXNlKVxyXG4gICAgICAgIGNvbnN0IFtyMSwgcjIsIHIzXSA9IGF3YWl0IHRoaXMuX3NoYXJlLmdldFJhdGlvUHJvdGVjdExldmVscygpO1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFJhdGlvIHByb3RlY3Rpb24gbGV2ZWxzIHNldCB0bzogJHtyMX0sICR7cjJ9LCAke3IzfWApO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGJveCB3ZSB3aWxsIGRpc3BsYXkgdGV4dCBpblxyXG4gICAgICAgIGlmIChkZXNjQmxvY2spIHtcclxuICAgICAgICAgICAgLy8gQWRkIGxpbmUgdW5kZXIgVG9ycmVudDogZGV0YWlsIGZvciBDb3N0IGRhdGEgXCJDb3N0IHRvIFJlc3RvcmUgUmF0aW9cIlxyXG4gICAgICAgICAgICBkZXNjQmxvY2suaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcclxuICAgICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwidG9yRGV0Um93XCIgaWQ9XCJtcF9yb3dcIj48ZGl2IGNsYXNzPVwidG9yRGV0TGVmdFwiPkNvc3QgdG8gUmVzdG9yZSBSYXRpbzwvZGl2PjxkaXYgY2xhc3M9XCJ0b3JEZXRSaWdodCAke3RoaXMuX3JjUm93fVwiIHN0eWxlPVwiZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7XCI+PHNwYW4gaWQ9XCJtcF9mb29iYXJcIj48L3NwYW4+PC9kaXY+PC9kaXY+YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJy50b3JEZXRSb3cgaXMgJHtkZXNjQmxvY2t9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBPbmx5IHJ1biB0aGUgY29kZSBpZiB0aGUgcmF0aW8gZXhpc3RzXHJcbiAgICAgICAgaWYgKHJOZXcgJiYgckN1ciAmJiAhc2VlZGluZyAmJiB1c2VySGFzUmF0aW8pIHtcclxuICAgICAgICAgICAgY29uc3QgckRpZmYgPSBVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXSAtIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdO1xyXG5cclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICAgICAgYEN1cnJlbnQgJHtVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXX0gfCBOZXcgJHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF1cclxuICAgICAgICAgICAgICAgICAgICB9IHwgRGlmICR7ckRpZmZ9YFxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE9ubHkgYWN0aXZhdGUgaWYgYSByYXRpbyBjaGFuZ2UgaXMgZXhwZWN0ZWRcclxuICAgICAgICAgICAgaWYgKCFpc05hTihyRGlmZikgJiYgckRpZmYgPiAwLjAwOSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRsTGFiZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBkbExhYmVsLmlubmVySFRNTCA9IGBSYXRpbyBsb3NzICR7ckRpZmYudG9GaXhlZCgyKX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIGRsTGFiZWwuc3R5bGUuZm9udFdlaWdodCA9ICdub3JtYWwnOyAvL1RvIGRpc3Rpbmd1aXNoIGZyb20gQk9MRCBUaXRsZXNcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgJiBEaXNwbGF5IGNvc3Qgb2YgZG93bmxvYWQgdy9vIEZMXHJcbiAgICAgICAgICAgICAgICAvLyBBbHdheXMgc2hvdyBjYWxjdWxhdGlvbnMgd2hlbiB0aGVyZSBpcyBhIHJhdGlvIGxvc3NcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNpemVFbGVtOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAnI3NpemUgc3BhbidcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2l6ZUVsZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaXplID0gc2l6ZUVsZW0udGV4dENvbnRlbnQhLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2l6ZU1hcCA9IFsnQnl0ZXMnLCAnS2lCJywgJ01pQicsICdHaUInLCAnVGlCJ107XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCBodW1hbiByZWFkYWJsZSBzaXplIHRvIGJ5dGVzXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnl0ZVNpemVkID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgTnVtYmVyKHNpemVbMF0pICogTWF0aC5wb3coMTAyNCwgc2l6ZU1hcC5pbmRleE9mKHNpemVbMV0pKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWNvdmVyeSA9IGJ5dGVTaXplZCAqIFV0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50QW1udCA9IE1hdGguZmxvb3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgxMjUgKiByZWNvdmVyeSkgLyAyNjg0MzU0NTZcclxuICAgICAgICAgICAgICAgICAgICApLnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF5QW1vdW50ID0gTWF0aC5mbG9vcigoNSAqIHJlY292ZXJ5KSAvIDIxNDc0ODM2NDgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdlZGdlU3RvcmVDb3N0ID0gVXRpbC5mb3JtYXRCeXRlcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDI2ODQzNTQ1NiAqIDUwMDAwKSAvIChVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXSAqIDEyNSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdlZGdlVmF1bHRDb3N0ID0gVXRpbC5mb3JtYXRCeXRlcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDI2ODQzNTQ1NiAqIDIwMCkgLyAoVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF0gKiAxMjUpXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByYXRpbyBjb3N0IHJvd1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGAuJHt0aGlzLl9yY1Jvd31gXHJcbiAgICAgICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gYDxzcGFuPjxiPiR7VXRpbC5mb3JtYXRCeXRlcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjb3ZlcnlcclxuICAgICAgICAgICAgICAgICAgICApfTwvYj4mbmJzcDt1cGxvYWQgKCR7cG9pbnRBbW50fSBCUDsgb3Igb25lIEZMIHdlZGdlIHBlciBkYXkgZm9yICR7ZGF5QW1vdW50fSBkYXlzKS4mbmJzcDs8YWJiciB0aXRsZT0nQ29udHJpYnV0aW5nIDIsMDAwIEJQIHRvIGVhY2ggdmF1bHQgY3ljbGUgZ2l2ZXMgeW91IGFsbW9zdCBvbmUgRkwgd2VkZ2UgcGVyIGRheSBvbiBhdmVyYWdlLicgc3R5bGU9J3RleHQtZGVjb3JhdGlvbjpub25lO2N1cnNvcjpoZWxwOyc+JiMxMjg3MTI7PC9hYmJyPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5XZWRnZSBzdG9yZSBwcmljZTogPGk+JHt3ZWRnZVN0b3JlQ29zdH08L2k+Jm5ic3A7PGFiYnIgdGl0bGU9J0lmIHlvdSBidXkgd2VkZ2VzIGZyb20gdGhlIHN0b3JlLCB0aGlzIGlzIGhvdyBsYXJnZSBhIHRvcnJlbnQgbXVzdCBiZSB0byBicmVhayBldmVuIG9uIHRoZSBjb3N0ICg1MCwwMDAgQlApIG9mIGEgc2luZ2xlIHdlZGdlLicgc3R5bGU9J3RleHQtZGVjb3JhdGlvbjpub25lO2N1cnNvcjpoZWxwOyc+JiMxMjg3MTI7PC9hYmJyPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5XZWRnZSB2YXVsdCBwcmljZTogPGk+JHt3ZWRnZVZhdWx0Q29zdH08L2k+Jm5ic3A7PGFiYnIgdGl0bGU9J0lmIHlvdSBjb250cmlidXRlIHRvIHRoZSB2YXVsdCwgdGhpcyBpcyBob3cgbGFyZ2UgYSB0b3JyZW50IG11c3QgYmUgdG8gYnJlYWsgZXZlbiBvbiB0aGUgY29zdCAoMjAwIEJQKSBvZiAxMCB3ZWRnZXMgZm9yIHRoZSBtYXhpbXVtIGNvbnRyaWJ1dGlvbiBvZiAyLDAwMCBCUC4nIHN0eWxlPSd0ZXh0LWRlY29yYXRpb246bm9uZTtjdXJzb3I6aGVscDsnPiYjMTI4NzEyOzwvYWJicj48L3NwYW4+YDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTdHlsZSB0aGUgZG93bmxvYWQgYnV0dG9uIGJhc2VkIG9uIFJhdGlvIFByb3RlY3QgbGV2ZWwgc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIGlmIChkbEJ0biAmJiBkbExhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gKiBUaGlzIGlzIHRoZSBcInRyaXZpYWwgcmF0aW8gbG9zc1wiIHRocmVzaG9sZFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZXNlIGNoYW5nZXMgd2lsbCBhbHdheXMgaGFwcGVuIGlmIHRoZSByYXRpbyBjb25kaXRpb25zIGFyZSBtZXRcclxuICAgICAgICAgICAgICAgICAgICBpZiAockRpZmYgPiByMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRCdXR0b25TdGF0ZShkbEJ0biwgJzFfbm90aWZ5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyAqIFRoaXMgaXMgdGhlIFwiSSBuZXZlciB3YW50IHRvIGRsIHcvbyBGTFwiIHRocmVzaG9sZFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgYWxzbyB1c2VzIHRoZSBNaW5pbXVtIFJhdGlvLCBpZiBlbmFibGVkXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBhbHNvIHByZXZlbnRzIGdvaW5nIGJlbG93IDIgcmF0aW8gKFBVIHJlcXVpcmVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlcGxhY2UgZGlzYWJsZSBidXR0b24gd2l0aCBidXkgRkwgYnV0dG9uXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgckRpZmYgPiByMyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXSA8IEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RNaW5fdmFsJykgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF0gPCAyXHJcbiAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEJ1dHRvblN0YXRlKGRsQnRuLCAnM19hbGVydCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAqIFRoaXMgaXMgdGhlIFwiSSBuZWVkIHRvIHRoaW5rIGFib3V0IHVzaW5nIGEgRkxcIiB0aHJlc2hvbGRcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJEaWZmID4gcjIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0QnV0dG9uU3RhdGUoZGxCdG4sICcyX3dhcm4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gSWYgdGhlIHVzZXIgZG9lcyBub3QgaGF2ZSBhIHJhdGlvLCBkaXNwbGF5IGEgc2hvcnQgbWVzc2FnZVxyXG4gICAgICAgIH0gZWxzZSBpZiAoIXVzZXJIYXNSYXRpbykge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRCdXR0b25TdGF0ZShkbEJ0biwgJzFfbm90aWZ5Jyk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICBgLiR7dGhpcy5fcmNSb3d9YFxyXG4gICAgICAgICAgICApIS5pbm5lckhUTUwgPSBgPHNwYW4+UmF0aW8gcG9pbnRzIGFuZCBjb3N0IHRvIHJlc3RvcmUgcmF0aW8gd2lsbCBhcHBlYXIgaGVyZSBhZnRlciB5b3VyIHJhdGlvIGlzIGEgcmVhbCBudW1iZXIuPC9zcGFuPmA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NldEJ1dHRvblN0YXRlKFxyXG4gICAgICAgIHRhcjogSFRNTEFuY2hvckVsZW1lbnQsXHJcbiAgICAgICAgc3RhdGU6ICcxX25vdGlmeScgfCAnMl93YXJuJyB8ICczX2FsZXJ0JyxcclxuICAgICAgICBsYWJlbD86IEhUTUxEaXZFbGVtZW50XHJcbiAgICApIHtcclxuICAgICAgICBpZiAoc3RhdGUgPT09ICcxX25vdGlmeScpIHtcclxuICAgICAgICAgICAgdGFyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdTcHJpbmdHcmVlbic7XHJcbiAgICAgICAgICAgIHRhci5zdHlsZS5jb2xvciA9ICdibGFjayc7XHJcbiAgICAgICAgICAgIHRhci5pbm5lckhUTUwgPSAnRG93bmxvYWQ/JztcclxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAnMl93YXJuJykge1xyXG4gICAgICAgICAgICB0YXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgIHRhci5pbm5lckhUTUwgPSAnU3VnZ2VzdCBGTCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJzNfYWxlcnQnKSB7XHJcbiAgICAgICAgICAgIGlmICghbGFiZWwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgTm8gbGFiZWwgcHJvdmlkZWQgaW4gX3NldEJ1dHRvblN0YXRlKCkhYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGFyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdSZWQnO1xyXG4gICAgICAgICAgICB0YXIuc3R5bGUuY3Vyc29yID0gJ25vLWRyb3AnO1xyXG4gICAgICAgICAgICB0YXIuaW5uZXJIVE1MID0gJ0ZMIE5lZWRlZCc7XHJcbiAgICAgICAgICAgIGxhYmVsLnN0eWxlLmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdGF0ZSBcIiR7c3RhdGV9XCIgZG9lcyBub3QgZXhpc3QuYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogTG93IHJhdGlvIHByb3RlY3Rpb24gYW1vdW50XHJcbiAqL1xyXG5jbGFzcyBSYXRpb1Byb3RlY3RMMSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdEwxJyxcclxuICAgICAgICB0YWc6ICdSYXRpbyBXYXJuIEwxJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2RlZmF1bHQ6IDAuNScsXHJcbiAgICAgICAgZGVzYzogYFNldCB0aGUgc21hbGxlc3QgdGhyZXNoaG9sZCB0byBpbmRpY2F0ZSByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgaXMgYSBzbGlnaHQgY29sb3IgY2hhbmdlPC9lbT4pLmAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGVkIGN1c3RvbSBSYXRpbyBQcm90ZWN0aW9uIEwxIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBNZWRpdW0gcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcclxuICovXHJcbmNsYXNzIFJhdGlvUHJvdGVjdEwyIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDInLFxyXG4gICAgICAgIHRhZzogJ1JhdGlvIFdhcm4gTDInLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZGVmYXVsdDogMScsXHJcbiAgICAgICAgZGVzYzogYFNldCB0aGUgbWVkaWFuIHRocmVzaGhvbGQgdG8gd2FybiBvZiByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgaXMgYSBub3RpY2VhYmxlIGNvbG9yIGNoYW5nZTwvZW0+KS5gLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNkb3dubG9hZCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxlZCBjdXN0b20gUmF0aW8gUHJvdGVjdGlvbiBMMiEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogSGlnaCByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMycsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAyJyxcclxuICAgICAgICBkZXNjOiBgU2V0IHRoZSBoaWdoZXN0IHRocmVzaGhvbGQgdG8gcHJldmVudCByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgZGlzYWJsZXMgZG93bmxvYWQgd2l0aG91dCBGTCB1c2U8L2VtPikuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsZWQgY3VzdG9tIFJhdGlvIFByb3RlY3Rpb24gTDMhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFJhdGlvUHJvdGVjdE1pbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdE1pbicsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdGFnOiAnTWluaW11bSBSYXRpbycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gMTAwJyxcclxuICAgICAgICBkZXNjOiAnVHJpZ2dlciBSYXRpbyBXYXJuIEwzIGlmIHlvdXIgcmF0aW8gd291bGQgZHJvcCBiZWxvdyB0aGlzIG51bWJlci4nLFxyXG4gICAgfTtcclxuICAgIC8vIEFuIGVsZW1lbnQgdGhhdCBtdXN0IGV4aXN0IGluIG9yZGVyIGZvciB0aGUgZmVhdHVyZSB0byBydW5cclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNkb3dubG9hZCc7XHJcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsZWQgY3VzdG9tIFJhdGlvIFByb3RlY3Rpb24gbWluaW11bSEnKTtcclxuICAgIH1cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBSYXRpb1Byb3RlY3RJY29ucyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0SWNvbnMnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIGRlc2M6ICdFbmFibGUgY3VzdG9tIGJyb3dzZXIgZmF2aWNvbnMgYmFzZWQgb24gUmF0aW8gUHJvdGVjdCBjb25kaXRpb25zPycsXHJcbiAgICB9O1xyXG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3JhdGlvJztcclxuICAgIHByaXZhdGUgX3VzZXJJRDogbnVtYmVyID0gMTY0MTA5O1xyXG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XHJcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICBgW00rXSBFbmFibGluZyBjdXN0b20gUmF0aW8gUHJvdGVjdCBmYXZpY29ucyBmcm9tIHVzZXIgJHt0aGlzLl91c2VySUR9Li4uYFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgY3VzdG9tIHJhdGlvIGFtb3VudHMgKHdpbGwgcmV0dXJuIGRlZmF1bHQgdmFsdWVzIG90aGVyd2lzZSlcclxuICAgICAgICBjb25zdCBbcjEsIHIyLCByM10gPSBhd2FpdCB0aGlzLl9zaGFyZS5nZXRSYXRpb1Byb3RlY3RMZXZlbHMoKTtcclxuICAgICAgICAvLyBXb3VsZCBiZWNvbWUgcmF0aW9cclxuICAgICAgICBjb25zdCByTmV3OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgLy8gQ3VycmVudCByYXRpb1xyXG4gICAgICAgIGNvbnN0IHJDdXI6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdG1SJyk7XHJcbiAgICAgICAgLy8gRGlmZmVyZW5jZSBiZXR3ZWVuIG5ldyBhbmQgb2xkIHJhdGlvXHJcbiAgICAgICAgY29uc3QgckRpZmYgPSBVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXSAtIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdO1xyXG4gICAgICAgIC8vIFNlZWRpbmcgb3IgZG93bmxvYWRpbmdcclxuICAgICAgICBjb25zdCBzZWVkaW5nOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI0RMaGlzdG9yeScpO1xyXG4gICAgICAgIC8vIFZJUCBzdGF0dXNcclxuICAgICAgICBjb25zdCB2aXBzdGF0OiBzdHJpbmcgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyNyYXRpbyAudG9yRGV0SW5uZXJCb3R0b21TcGFuJ1xyXG4gICAgICAgIClcclxuICAgICAgICAgICAgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmF0aW8gLnRvckRldElubmVyQm90dG9tU3BhbicpLnRleHRDb250ZW50XHJcbiAgICAgICAgICAgIDogbnVsbDtcclxuICAgICAgICAvLyBCb29rY2x1YiBzdGF0dXNcclxuICAgICAgICBjb25zdCBib29rY2x1YjogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgIFwiZGl2W2lkPSdiY2ZsJ10gc3BhblwiXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gRmluZCBmYXZpY29uIGxpbmtzIGFuZCBsb2FkIGEgc2ltcGxlIGRlZmF1bHQuXHJcbiAgICAgICAgY29uc3Qgc2l0ZUZhdmljb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImxpbmtbcmVsJD0naWNvbiddXCIpIGFzIE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgIEhUTUxMaW5rRWxlbWVudFxyXG4gICAgICAgID47XHJcbiAgICAgICAgaWYgKHNpdGVGYXZpY29ucykgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAndG1fMzJ4MzInKTtcclxuXHJcbiAgICAgICAgLy8gVGVzdCBpZiBWSVBcclxuICAgICAgICBpZiAodmlwc3RhdCkge1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBWSVAgPSAke3ZpcHN0YXR9YCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodmlwc3RhdC5zZWFyY2goJ1ZJUCBleHBpcmVzJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAnbW91c2VjbG9jaycpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcclxuICAgICAgICAgICAgICAgICAgICBgIHwgRXhwaXJlcyAke3ZpcHN0YXQuc3Vic3RyaW5nKDI2KX1gXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZpcHN0YXQuc2VhcmNoKCdWSVAgbm90IHNldCB0byBleHBpcmUnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICcwY2lyJyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IGRvY3VtZW50LnRpdGxlLnJlcGxhY2UoXHJcbiAgICAgICAgICAgICAgICAgICAgJyB8IE15IEFub25hbW91c2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICcgfCBOb3Qgc2V0IHRvIGV4cGlyZSdcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmlwc3RhdC5zZWFyY2goJ1RoaXMgdG9ycmVudCBpcyBmcmVlbGVlY2ghJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAnbW91c2VjbG9jaycpO1xyXG4gICAgICAgICAgICAgICAgLy8gVGVzdCBpZiBib29rY2x1YlxyXG4gICAgICAgICAgICAgICAgaWYgKGJvb2tjbHViICYmIGJvb2tjbHViLnRleHRDb250ZW50LnNlYXJjaCgnQm9va2NsdWIgRnJlZWxlZWNoJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gZG9jdW1lbnQudGl0bGUucmVwbGFjZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgJyB8IE15IEFub25hbW91c2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgIHwgQ2x1YiBleHBpcmVzICR7Ym9va2NsdWIudGV4dENvbnRlbnQuc3Vic3RyaW5nKDI1KX1gXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnIHwgTXkgQW5vbmFtb3VzZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiIHwgJ3RpbGwgbmV4dCBTaXRlIEZMXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogQ2FsY3VsYXRlIHdoZW4gRkwgZW5kc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBgIHwgJ3RpbGwgJHt0aGlzLl9uZXh0RkxEYXRlKCl9YFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRlc3QgaWYgc2VlZGluZy9kb3dubG9hZGluZ1xyXG4gICAgICAgIGlmIChzZWVkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzEzZWdnJyk7XHJcbiAgICAgICAgICAgIC8vICogU2ltaWxhciBpY29uczogMTNzZWVkOCwgMTNzZWVkNywgMTNlZ2csIDEzLCAxM2NpciwgMTNXaGl0ZUNpclxyXG4gICAgICAgIH0gZWxzZSBpZiAodmlwc3RhdC5zZWFyY2goJ1RoaXMgdG9ycmVudCBpcyBwZXJzb25hbCBmcmVlbGVlY2gnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRlc3QgaWYgdGhlcmUgd2lsbCBiZSByYXRpbyBsb3NzXHJcbiAgICAgICAgaWYgKHJOZXcgJiYgckN1ciAmJiAhc2VlZGluZykge1xyXG4gICAgICAgICAgICAvLyBDaGFuZ2UgaWNvbiBiYXNlZCBvbiBSYXRpbyBQcm90ZWN0IHN0YXRlc1xyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICByRGlmZiA+IHIzIHx8XHJcbiAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXSA8IEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RNaW5fdmFsJykgfHxcclxuICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdIDwgMlxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzEyJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAockRpZmYgPiByMikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAnM1Ftb3VzZScpO1xyXG4gICAgICAgICAgICAgICAgLy8gQWxzbyB0cnkgT3JhbmdlLCBPcmFuZ2VSZWQsIEdvbGQsIG9yIDE0XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAockRpZmYgPiByMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAnU3ByaW5nR3JlZW4nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZnV0dXJlIFZJUFxyXG4gICAgICAgICAgICBpZiAodmlwc3RhdC5zZWFyY2goJ09uIGxpc3QgZm9yIG5leHQgRkwgcGljaycpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ01pcnJvckdyZWVuQ2xvY2snKTsgLy8gQWxzbyB0cnkgZ3JlZW5jbG9ja1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcclxuICAgICAgICAgICAgICAgICAgICAnIHwgTmV4dCBGTCBwaWNrJ1xyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ3VzdG9tIFJhdGlvIFByb3RlY3QgZmF2aWNvbnMgZW5hYmxlZCEnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBGdW5jdGlvbiBmb3IgY2FsY3VsYXRpbmcgd2hlbiBGTCBlbmRzXHJcbiAgICAvLyA/IEhvdyBhcmUgd2UgYWJsZSB0byBkZXRlcm1pbmUgd2hlbiB0aGUgY3VycmVudCBGTCBwZXJpb2Qgc3RhcnRlZD9cclxuICAgIC8qIHByaXZhdGUgYXN5bmMgX25leHRGTERhdGUoKSB7XHJcbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCdKdW4gMTQsIDIwMjIgMDA6MDA6MDAgVVRDJyk7IC8vIHNlZWQgZGF0ZSBvdmVyIHR3byB3ZWVrcyBhZ29cclxuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpOyAvL1BsYWNlIHRlc3QgZGF0ZXMgaGVyZSBsaWtlIERhdGUoXCJKdWwgMTQsIDIwMjIgMDA6MDA6MDAgVVRDXCIpXHJcbiAgICAgICAgbGV0IG1zc2luY2UgPSBub3cuZ2V0VGltZSgpIC0gZC5nZXRUaW1lKCk7IC8vdGltZSBzaW5jZSBGTCBzdGFydCBzZWVkIGRhdGVcclxuICAgICAgICBsZXQgZGF5c3NpbmNlID0gbXNzaW5jZSAvIDg2NDAwMDAwO1xyXG4gICAgICAgIGxldCBxID0gTWF0aC5mbG9vcihkYXlzc2luY2UgLyAxNCk7IC8vIEZMIHBlcmlvZHMgc2luY2Ugc2VlZCBkYXRlXHJcblxyXG4gICAgICAgIGNvbnN0IGFkZERheXMgPSAoZGF0ZSwgZGF5cykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gbmV3IERhdGUoZGF0ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50LnNldERhdGUoY3VycmVudC5nZXREYXRlKCkgKyBkYXlzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gZFxyXG4gICAgICAgICAgICAuYWRkRGF5cyhxICogMTQgKyAxNClcclxuICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgLnN1YnN0cigwLCAxMCk7XHJcbiAgICB9ICovXHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfYnVpbGRJY29uTGlua3MoZWxlbXM6IE5vZGVMaXN0T2Y8SFRNTExpbmtFbGVtZW50PiwgZmlsZW5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIGVsZW1zLmZvckVhY2goKGVsZW0pID0+IHtcclxuICAgICAgICAgICAgZWxlbS5ocmVmID0gYGh0dHBzOi8vY2RuLm15YW5vbmFtb3VzZS5uZXQvaW1hZ2VidWNrZXQvJHt0aGlzLl91c2VySUR9LyR7ZmlsZW5hbWV9LnBuZ2A7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCB1c2VySUQobmV3SUQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX3VzZXJJRCA9IG5ld0lEO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBUT0RPOiBBZGQgZmVhdHVyZSB0byBzZXQgUmF0aW9Qcm90ZWN0SWNvbidzIGBfdXNlcklEYCB2YWx1ZS4gT25seSBuZWNlc3Nhcnkgb25jZSBvdGhlciBpY29uIHNldHMgZXhpc3QuXHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiAjVVBMT0FEIFBBR0UgRkVBVFVSRVNcclxuICovXHJcblxyXG4vKipcclxuICogQWxsb3dzIGVhc2llciBjaGVja2luZyBmb3IgZHVwbGljYXRlIHVwbG9hZHNcclxuICovXHJcblxyXG5jbGFzcyBTZWFyY2hGb3JEdXBsaWNhdGVzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdzZWFyY2hGb3JEdXBsaWNhdGVzJyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydVcGxvYWQgUGFnZSddLFxyXG4gICAgICAgIGRlc2M6ICdFYXNpZXIgc2VhcmNoaW5nIGZvciBkdXBsaWNhdGVzIHdoZW4gdXBsb2FkaW5nIGNvbnRlbnQnLFxyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdXBsb2FkRm9ybSBpbnB1dFt0eXBlPVwic3VibWl0XCJdJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3VwbG9hZCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgcGFyZW50RWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5Jyk7XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gdGl0bGUnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RpdGxlJyxcclxuICAgICAgICAgICAgICAgIGlucHV0U2VsZWN0b3I6ICdpbnB1dFtuYW1lPVwidG9yW3RpdGxlXVwiXScsXHJcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogNyxcclxuICAgICAgICAgICAgICAgIHVzZVdpbGRjYXJkOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gYXV0aG9yKHMpJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdhdXRob3InLFxyXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0LmFjX2F1dGhvcicsXHJcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogMTAsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVTZWFyY2goe1xyXG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ2hlY2sgZm9yIHJlc3VsdHMgd2l0aCBnaXZlbiBzZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3NlcmllcycsXHJcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXQuYWNfc2VyaWVzJyxcclxuICAgICAgICAgICAgICAgIHJvd1Bvc2l0aW9uOiAxMSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIG5hcnJhdG9yKHMpJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICduYXJyYXRvcicsXHJcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXQuYWNfbmFycmF0b3InLFxyXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDEyLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIHNlYXJjaCB0byB1cGxvYWRzIWApO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfZ2VuZXJhdGVTZWFyY2goe1xyXG4gICAgICAgIHBhcmVudEVsZW1lbnQsXHJcbiAgICAgICAgdGl0bGUsXHJcbiAgICAgICAgdHlwZSxcclxuICAgICAgICBpbnB1dFNlbGVjdG9yLFxyXG4gICAgICAgIHJvd1Bvc2l0aW9uLFxyXG4gICAgICAgIHVzZVdpbGRjYXJkID0gZmFsc2UsXHJcbiAgICB9OiB7XHJcbiAgICAgICAgcGFyZW50RWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGl0bGU6IHN0cmluZztcclxuICAgICAgICB0eXBlOiBzdHJpbmc7XHJcbiAgICAgICAgaW5wdXRTZWxlY3Rvcjogc3RyaW5nO1xyXG4gICAgICAgIHJvd1Bvc2l0aW9uOiBudW1iZXI7XHJcbiAgICAgICAgdXNlV2lsZGNhcmQ/OiBib29sZWFuO1xyXG4gICAgfSkge1xyXG4gICAgICAgIGNvbnN0IHNlYXJjaEVsZW1lbnQ6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgICAgIFV0aWwuc2V0QXR0cihzZWFyY2hFbGVtZW50LCB7XHJcbiAgICAgICAgICAgIHRhcmdldDogJ19ibGFuaycsXHJcbiAgICAgICAgICAgIHN0eWxlOiAndGV4dC1kZWNvcmF0aW9uOiBub25lOyBjdXJzb3I6IHBvaW50ZXI7JyxcclxuICAgICAgICAgICAgdGl0bGUsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VhcmNoRWxlbWVudC50ZXh0Q29udGVudCA9ICcg8J+UjSc7XHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmtCYXNlID0gYC90b3IvYnJvd3NlLnBocD90b3IlNUJzZWFyY2hUeXBlJTVEPWFsbCZ0b3IlNUJzZWFyY2hJbiU1RD10b3JyZW50cyZ0b3IlNUJjYXQlNUQlNUIlNUQ9MCZ0b3IlNUJicm93c2VGbGFnc0hpZGVWc1Nob3clNUQ9MCZ0b3IlNUJzb3J0VHlwZSU1RD1kYXRlRGVzYyZ0b3IlNUJzcmNoSW4lNUQlNUIke3R5cGV9JTVEPXRydWUmdG9yJTVCdGV4dCU1RD1gO1xyXG5cclxuICAgICAgICBwYXJlbnRFbGVtZW50XHJcbiAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgYCN1cGxvYWRGb3JtID4gdGJvZHkgPiB0cjpudGgtY2hpbGQoJHtyb3dQb3NpdGlvbn0pID4gdGQ6bnRoLWNoaWxkKDEpYFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgID8uaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmVlbmQnLCBzZWFyY2hFbGVtZW50KTtcclxuXHJcbiAgICAgICAgc2VhcmNoRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnB1dHM6IE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICAgICAgICAgID4gfCBudWxsID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGlucHV0U2VsZWN0b3IpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlucHV0cyAmJiBpbnB1dHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dHNMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHNMaXN0LnB1c2goaW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gaW5wdXRzTGlzdC5qb2luKCcgJykudHJpbSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChxdWVyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaFN0cmluZyA9IHVzZVdpbGRjYXJkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCoke2VuY29kZVVSSUNvbXBvbmVudChpbnB1dHNMaXN0LmpvaW4oJyAnKSl9KmBcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBlbmNvZGVVUklDb21wb25lbnQoaW5wdXRzTGlzdC5qb2luKCcgJykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hFbGVtZW50LnNldEF0dHJpYnV0ZSgnaHJlZicsIGxpbmtCYXNlICsgc2VhcmNoU3RyaW5nKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XHJcblxyXG4vKipcclxuICogIyBVU0VSIFBBR0UgRkVBVFVSRVNcclxuICovXHJcblxyXG4vKipcclxuICogIyMjIyBEZWZhdWx0IFVzZXIgR2lmdCBBbW91bnRcclxuICovXHJcbmNsYXNzIFVzZXJHaWZ0RGVmYXVsdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VzZXIgUGFnZXMnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICd1c2VyR2lmdERlZmF1bHQnLFxyXG4gICAgICAgIHRhZzogJ0RlZmF1bHQgR2lmdCcsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gMTAwMCwgbWF4JyxcclxuICAgICAgICBkZXNjOlxyXG4gICAgICAgICAgICAnQXV0b2ZpbGxzIHRoZSBHaWZ0IGJveCB3aXRoIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwb2ludHMuICg8ZW0+T3IgdGhlIG1heCBhbGxvd2FibGUgdmFsdWUsIHdoaWNoZXZlciBpcyBsb3dlcjwvZW0+KScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2JvbnVzZ2lmdCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd1c2VyJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgbmV3IFNoYXJlZCgpXHJcbiAgICAgICAgICAgIC5maWxsR2lmdEJveCh0aGlzLl90YXIsIHRoaXMuX3NldHRpbmdzLnRpdGxlKVxyXG4gICAgICAgICAgICAudGhlbigocG9pbnRzKSA9PlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gU2V0IHRoZSBkZWZhdWx0IGdpZnQgYW1vdW50IHRvICR7cG9pbnRzfWApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIyMjIFVzZXIgR2lmdCBIaXN0b3J5XHJcbiAqL1xyXG5jbGFzcyBVc2VyR2lmdEhpc3RvcnkgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3VzZXJHaWZ0SGlzdG9yeScsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVXNlciBQYWdlcyddLFxyXG4gICAgICAgIGRlc2M6ICdEaXNwbGF5IGdpZnQgaGlzdG9yeSBiZXR3ZWVuIHlvdSBhbmQgYW5vdGhlciB1c2VyJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF9zZW5kU3ltYm9sID0gYDxzcGFuIHN0eWxlPSdjb2xvcjpvcmFuZ2UnIHRpdGxlPSdzZW50Jz5cXHUyN0YwPC9zcGFuPmA7XHJcbiAgICBwcml2YXRlIF9nZXRTeW1ib2wgPSBgPHNwYW4gc3R5bGU9J2NvbG9yOnRlYWwnIHRpdGxlPSdyZWNlaXZlZCc+XFx1MjdGMTwvc3Bhbj5gO1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAndGJvZHknO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd1c2VyJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBJbml0aWFsbGl6aW5nIHVzZXIgZ2lmdCBoaXN0b3J5Li4uJyk7XHJcblxyXG4gICAgICAgIC8vIE5hbWUgb2YgdGhlIG90aGVyIHVzZXJcclxuICAgICAgICBjb25zdCBvdGhlclVzZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgPiBoMScpIS50ZXh0Q29udGVudCEudHJpbSgpO1xyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZ2lmdCBoaXN0b3J5IHJvd1xyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG4gICAgICAgIGNvbnN0IGluc2VydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keSB0Ym9keSB0cjpsYXN0LW9mLXR5cGUnKTtcclxuICAgICAgICBpZiAoaW5zZXJ0KSBpbnNlcnQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmViZWdpbicsIGhpc3RvcnlDb250YWluZXIpO1xyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZ2lmdCBoaXN0b3J5IHRpdGxlIGZpZWxkXHJcbiAgICAgICAgY29uc3QgaGlzdG9yeVRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgICAgICBoaXN0b3J5VGl0bGUuY2xhc3NMaXN0LmFkZCgncm93aGVhZCcpO1xyXG4gICAgICAgIGhpc3RvcnlUaXRsZS50ZXh0Q29udGVudCA9ICdHaWZ0IGhpc3RvcnknO1xyXG4gICAgICAgIGhpc3RvcnlDb250YWluZXIuYXBwZW5kQ2hpbGQoaGlzdG9yeVRpdGxlKTtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSBjb250ZW50IGZpZWxkXHJcbiAgICAgICAgY29uc3QgaGlzdG9yeUJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICAgICAgaGlzdG9yeUJveC5jbGFzc0xpc3QuYWRkKCdyb3cxJyk7XHJcbiAgICAgICAgaGlzdG9yeUJveC50ZXh0Q29udGVudCA9IGBZb3UgaGF2ZSBub3QgZXhjaGFuZ2VkIGdpZnRzIHdpdGggJHtvdGhlclVzZXJ9LmA7XHJcbiAgICAgICAgaGlzdG9yeUJveC5hbGlnbiA9ICdsZWZ0JztcclxuICAgICAgICBoaXN0b3J5Q29udGFpbmVyLmFwcGVuZENoaWxkKGhpc3RvcnlCb3gpO1xyXG4gICAgICAgIC8vIEdldCB0aGUgVXNlciBJRFxyXG4gICAgICAgIGNvbnN0IHVzZXJJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLnBvcCgpO1xyXG5cclxuICAgICAgICBjb25zdCBjdXJyZW50VXNlcklEID0gVXRpbC5nZXRDdXJyZW50VXNlcklEKCk7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IHVzZSBgY2RuLmAgaW5zdGVhZCBvZiBgd3d3LmA7IGN1cnJlbnRseSBjYXVzZXMgYSA0MDMgZXJyb3JcclxuICAgICAgICBpZiAodXNlcklEKSB7XHJcbiAgICAgICAgICAgIGlmICh1c2VySUQgPT09IGN1cnJlbnRVc2VySUQpIHtcclxuICAgICAgICAgICAgICAgIGhpc3RvcnlUaXRsZS50ZXh0Q29udGVudCA9ICdSZWNlbnQgR2lmdCBIaXN0b3J5JztcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9oaXN0b3J5V2l0aEFsbChoaXN0b3J5Qm94KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faGlzdG9yeVdpdGhVc2VySUQodXNlcklELCBoaXN0b3J5Qm94KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVzZXIgSUQgbm90IGZvdW5kOiAke3VzZXJJRH1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIEZpbGwgb3V0IGhpc3RvcnkgYm94XHJcbiAgICAgKiBAcGFyYW0gdXNlcklEIHRoZSB1c2VyIHRvIGdldCBoaXN0b3J5IGZyb21cclxuICAgICAqIEBwYXJhbSBoaXN0b3J5Qm94IHRoZSBib3ggdG8gcHV0IGl0IGluXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgX2hpc3RvcnlXaXRoVXNlcklEKHVzZXJJRDogc3RyaW5nLCBoaXN0b3J5Qm94OiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIC8vIEdldCB0aGUgZ2lmdCBoaXN0b3J5XHJcbiAgICAgICAgY29uc3QgZ2lmdEhpc3RvcnkgPSBhd2FpdCBVdGlsLmdldFVzZXJHaWZ0SGlzdG9yeSh1c2VySUQpO1xyXG4gICAgICAgIC8vIE9ubHkgZGlzcGxheSBhIGxpc3QgaWYgdGhlcmUgaXMgYSBoaXN0b3J5XHJcbiAgICAgICAgaWYgKGdpZnRIaXN0b3J5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgUG9pbnQgJiBGTCB0b3RhbCB2YWx1ZXNcclxuICAgICAgICAgICAgY29uc3QgW3BvaW50c0luLCBwb2ludHNPdXRdID0gdGhpcy5fc3VtR2lmdHMoZ2lmdEhpc3RvcnksICdnaWZ0UG9pbnRzJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IFt3ZWRnZUluLCB3ZWRnZU91dF0gPSB0aGlzLl9zdW1HaWZ0cyhnaWZ0SGlzdG9yeSwgJ2dpZnRXZWRnZScpO1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQb2ludHMgSW4vT3V0OiAke3BvaW50c0lufS8ke3BvaW50c091dH1gKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBXZWRnZXMgSW4vT3V0OiAke3dlZGdlSW59LyR7d2VkZ2VPdXR9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgb3RoZXJVc2VyID0gZ2lmdEhpc3RvcnlbMF0ub3RoZXJfbmFtZTtcclxuICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBtZXNzYWdlXHJcbiAgICAgICAgICAgIGhpc3RvcnlCb3guaW5uZXJIVE1MID0gYFlvdSBoYXZlIHNlbnQgJHt0aGlzLl9zZW5kU3ltYm9sfSA8c3Ryb25nPiR7cG9pbnRzT3V0fSBwb2ludHM8L3N0cm9uZz4gJmFtcDsgPHN0cm9uZz4ke3dlZGdlT3V0fSBGTCB3ZWRnZXM8L3N0cm9uZz4gdG8gJHtvdGhlclVzZXJ9IGFuZCByZWNlaXZlZCAke3RoaXMuX2dldFN5bWJvbH0gPHN0cm9uZz4ke3BvaW50c0lufSBwb2ludHM8L3N0cm9uZz4gJmFtcDsgPHN0cm9uZz4ke3dlZGdlSW59IEZMIHdlZGdlczwvc3Ryb25nPi48aHI+YDtcclxuICAgICAgICAgICAgLy8gQWRkIHRoZSBtZXNzYWdlIHRvIHRoZSBib3hcclxuICAgICAgICAgICAgaGlzdG9yeUJveC5hcHBlbmRDaGlsZCh0aGlzLl9zaG93R2lmdHMoZ2lmdEhpc3RvcnkpKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gVXNlciBnaWZ0IGhpc3RvcnkgYWRkZWQhJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gTm8gdXNlciBnaWZ0IGhpc3RvcnkgZm91bmQgd2l0aCAke3VzZXJJRH0uYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBGaWxsIG91dCBoaXN0b3J5IGJveFxyXG4gICAgICogQHBhcmFtIGhpc3RvcnlCb3ggdGhlIGJveCB0byBwdXQgaXQgaW5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBfaGlzdG9yeVdpdGhBbGwoaGlzdG9yeUJveDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAvLyBHZXQgdGhlIGdpZnQgaGlzdG9yeVxyXG4gICAgICAgIGNvbnN0IGdpZnRIaXN0b3J5ID0gYXdhaXQgVXRpbC5nZXRBbGxVc2VyR2lmdEhpc3RvcnkoKTtcclxuICAgICAgICAvLyBPbmx5IGRpc3BsYXkgYSBsaXN0IGlmIHRoZXJlIGlzIGEgaGlzdG9yeVxyXG4gICAgICAgIGlmIChnaWZ0SGlzdG9yeS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIFBvaW50ICYgRkwgdG90YWwgdmFsdWVzXHJcbiAgICAgICAgICAgIGNvbnN0IFtwb2ludHNJbiwgcG9pbnRzT3V0XSA9IHRoaXMuX3N1bUdpZnRzKGdpZnRIaXN0b3J5LCAnZ2lmdFBvaW50cycpO1xyXG4gICAgICAgICAgICBjb25zdCBbd2VkZ2VJbiwgd2VkZ2VPdXRdID0gdGhpcy5fc3VtR2lmdHMoZ2lmdEhpc3RvcnksICdnaWZ0V2VkZ2UnKTtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUG9pbnRzIEluL091dDogJHtwb2ludHNJbn0vJHtwb2ludHNPdXR9YCk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgV2VkZ2VzIEluL091dDogJHt3ZWRnZUlufS8ke3dlZGdlT3V0fWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbWVzc2FnZVxyXG4gICAgICAgICAgICBoaXN0b3J5Qm94LmlubmVySFRNTCA9IGBZb3UgaGF2ZSBzZW50ICR7dGhpcy5fc2VuZFN5bWJvbH0gPHN0cm9uZz4ke3BvaW50c091dH0gcG9pbnRzPC9zdHJvbmc+ICZhbXA7IDxzdHJvbmc+JHt3ZWRnZU91dH0gRkwgd2VkZ2VzPC9zdHJvbmc+IGFuZCByZWNlaXZlZCAke3RoaXMuX2dldFN5bWJvbH0gPHN0cm9uZz4ke3BvaW50c0lufSBwb2ludHM8L3N0cm9uZz4gJmFtcDsgPHN0cm9uZz4ke3dlZGdlSW59IEZMIHdlZGdlczwvc3Ryb25nPi48aHI+YDtcclxuICAgICAgICAgICAgLy8gQWRkIHRoZSBtZXNzYWdlIHRvIHRoZSBib3hcclxuICAgICAgICAgICAgaGlzdG9yeUJveC5hcHBlbmRDaGlsZCh0aGlzLl9zaG93R2lmdHMoZ2lmdEhpc3RvcnkpKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gVXNlciBnaWZ0IGhpc3RvcnkgYWRkZWQhJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gTm8gdXNlciBnaWZ0IGhpc3RvcnkgZm91bmQgZm9yIGN1cnJlbnQgdXNlci5gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIFN1bSB0aGUgdmFsdWVzIG9mIGEgZ2l2ZW4gZ2lmdCB0eXBlIGFzIEluZmxvdyAmIE91dGZsb3cgc3Vtc1xyXG4gICAgICogQHBhcmFtIGhpc3RvcnkgdGhlIHVzZXIgZ2lmdCBoaXN0b3J5XHJcbiAgICAgKiBAcGFyYW0gdHlwZSBwb2ludHMgb3Igd2VkZ2VzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3N1bUdpZnRzKFxyXG4gICAgICAgIGhpc3Rvcnk6IFVzZXJHaWZ0SGlzdG9yeVtdLFxyXG4gICAgICAgIHR5cGU6ICdnaWZ0UG9pbnRzJyB8ICdnaWZ0V2VkZ2UnXHJcbiAgICApOiBbbnVtYmVyLCBudW1iZXJdIHtcclxuICAgICAgICBjb25zdCBvdXRmbG93ID0gWzBdO1xyXG4gICAgICAgIGNvbnN0IGluZmxvdyA9IFswXTtcclxuICAgICAgICAvLyBPbmx5IHJldHJpZXZlIGFtb3VudHMgb2YgYSBzcGVjaWZpZWQgZ2lmdCB0eXBlXHJcbiAgICAgICAgaGlzdG9yeS5tYXAoKGdpZnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGdpZnQudHlwZSA9PT0gdHlwZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gU3BsaXQgaW50byBJbmZsb3cvT3V0Zmxvd1xyXG4gICAgICAgICAgICAgICAgaWYgKGdpZnQuYW1vdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZmxvdy5wdXNoKGdpZnQuYW1vdW50KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0Zmxvdy5wdXNoKGdpZnQuYW1vdW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIFN1bSBhbGwgaXRlbXMgaW4gdGhlIGZpbHRlcmVkIGFycmF5XHJcbiAgICAgICAgY29uc3Qgc3VtT3V0ID0gb3V0Zmxvdy5yZWR1Y2UoKGFjY3VtdWxhdGUsIGN1cnJlbnQpID0+IGFjY3VtdWxhdGUgKyBjdXJyZW50KTtcclxuICAgICAgICBjb25zdCBzdW1JbiA9IGluZmxvdy5yZWR1Y2UoKGFjY3VtdWxhdGUsIGN1cnJlbnQpID0+IGFjY3VtdWxhdGUgKyBjdXJyZW50KTtcclxuICAgICAgICByZXR1cm4gW3N1bUluLCBNYXRoLmFicyhzdW1PdXQpXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgQ3JlYXRlcyBhIGxpc3Qgb2YgdGhlIG1vc3QgcmVjZW50IGdpZnRzXHJcbiAgICAgKiBAcGFyYW0gaGlzdG9yeSBUaGUgZnVsbCBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB0d28gdXNlcnNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2hvd0dpZnRzKGhpc3Rvcnk6IFVzZXJHaWZ0SGlzdG9yeVtdKSB7XHJcbiAgICAgICAgLy8gSWYgdGhlIGdpZnQgd2FzIGEgd2VkZ2UsIHJldHVybiBjdXN0b20gdGV4dFxyXG4gICAgICAgIGNvbnN0IF93ZWRnZU9yUG9pbnRzID0gKGdpZnQ6IFVzZXJHaWZ0SGlzdG9yeSk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChnaWZ0LnR5cGUgPT09ICdnaWZ0UG9pbnRzJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke01hdGguYWJzKGdpZnQuYW1vdW50KX1gO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdpZnQudHlwZSA9PT0gJ2dpZnRXZWRnZScpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnKEZMKSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYEVycm9yOiB1bmtub3duIGdpZnQgdHlwZS4uLiAke2dpZnQudHlwZX06ICR7Z2lmdC5hbW91bnR9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIGEgbGlzdCBmb3IgdGhlIGhpc3RvcnlcclxuICAgICAgICBjb25zdCBoaXN0b3J5TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihoaXN0b3J5TGlzdC5zdHlsZSwge1xyXG4gICAgICAgICAgICBsaXN0U3R5bGU6ICdub25lJyxcclxuICAgICAgICAgICAgcGFkZGluZzogJ2luaXRpYWwnLFxyXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMGVtJyxcclxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdhdXRvJyxcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBMb29wIG92ZXIgaGlzdG9yeSBpdGVtcyBhbmQgYWRkIHRvIGFuIGFycmF5XHJcbiAgICAgICAgY29uc3QgZ2lmdHM6IHN0cmluZ1tdID0gaGlzdG9yeVxyXG4gICAgICAgICAgICAuZmlsdGVyKChnaWZ0KSA9PiBnaWZ0LnR5cGUgPT09ICdnaWZ0UG9pbnRzJyB8fCBnaWZ0LnR5cGUgPT09ICdnaWZ0V2VkZ2UnKVxyXG4gICAgICAgICAgICAubWFwKChnaWZ0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgc29tZSBzdHlsaW5nIGRlcGVuZGluZyBvbiBwb3MvbmVnIG51bWJlcnNcclxuICAgICAgICAgICAgICAgIGxldCBmYW5jeUdpZnRBbW91bnQ6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyb21Ubzogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGdpZnQuYW1vdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZhbmN5R2lmdEFtb3VudCA9IGAke3RoaXMuX2dldFN5bWJvbH0gJHtfd2VkZ2VPclBvaW50cyhnaWZ0KX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIGZyb21UbyA9ICdmcm9tJztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFuY3lHaWZ0QW1vdW50ID0gYCR7dGhpcy5fc2VuZFN5bWJvbH0gJHtfd2VkZ2VPclBvaW50cyhnaWZ0KX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIGZyb21UbyA9ICd0byc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTWFrZSB0aGUgZGF0ZSByZWFkYWJsZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0ZSA9IFV0aWwucHJldHR5U2l0ZVRpbWUoZ2lmdC50aW1lc3RhbXAsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8bGkgY2xhc3M9J21wX2dpZnRJdGVtJz4ke2RhdGV9IHlvdSAke2ZhbmN5R2lmdEFtb3VudH0gJHtmcm9tVG99IDxhIGhyZWY9Jy91LyR7Z2lmdC5vdGhlcl91c2VyaWR9Jz4ke2dpZnQub3RoZXJfbmFtZX08L2E+PC9saT5gO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAvLyBBZGQgaGlzdG9yeSBpdGVtcyB0byB0aGUgbGlzdFxyXG4gICAgICAgIGhpc3RvcnlMaXN0LmlubmVySFRNTCA9IGdpZnRzLmpvaW4oJycpO1xyXG4gICAgICAgIHJldHVybiBoaXN0b3J5TGlzdDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIFZBVUxUIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuY2xhc3MgU2ltcGxlVmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5WYXVsdCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnc2ltcGxlVmF1bHQnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdTaW1wbGlmeSB0aGUgVmF1bHQgcGFnZXMuICg8ZW0+VGhpcyByZW1vdmVzIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBkb25hdGUgYnV0dG9uICZhbXA7IGxpc3Qgb2YgcmVjZW50IGRvbmF0aW9uczwvZW0+KScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5Cb2R5JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3ZhdWx0J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3Qgc3ViUGFnZTogc3RyaW5nID0gR01fZ2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XHJcbiAgICAgICAgY29uc3QgcGFnZSA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgY29uc29sZS5ncm91cChgQXBwbHlpbmcgVmF1bHQgKCR7c3ViUGFnZX0pIHNldHRpbmdzLi4uYCk7XHJcblxyXG4gICAgICAgIC8vIENsb25lIHRoZSBpbXBvcnRhbnQgcGFydHMgYW5kIHJlc2V0IHRoZSBwYWdlXHJcbiAgICAgICAgY29uc3QgZG9uYXRlQnRuOiBIVE1MRm9ybUVsZW1lbnQgfCBudWxsID0gcGFnZS5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XHJcbiAgICAgICAgY29uc3QgZG9uYXRlVGJsOiBIVE1MVGFibGVFbGVtZW50IHwgbnVsbCA9IHBhZ2UucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJ3RhYmxlOmxhc3Qtb2YtdHlwZSdcclxuICAgICAgICApO1xyXG4gICAgICAgIHBhZ2UuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgZG9uYXRlIGJ1dHRvbiBpZiBpdCBleGlzdHNcclxuICAgICAgICBpZiAoZG9uYXRlQnRuICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0RvbmF0ZTogSFRNTEZvcm1FbGVtZW50ID0gPEhUTUxGb3JtRWxlbWVudD5kb25hdGVCdG4uY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICBwYWdlLmFwcGVuZENoaWxkKG5ld0RvbmF0ZSk7XHJcbiAgICAgICAgICAgIG5ld0RvbmF0ZS5jbGFzc0xpc3QuYWRkKCdtcF92YXVsdENsb25lJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGFnZS5pbm5lckhUTUwgPSAnPGgxPkNvbWUgYmFjayB0b21vcnJvdyE8L2gxPic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIGRvbmF0ZSB0YWJsZSBpZiBpdCBleGlzdHNcclxuICAgICAgICBpZiAoZG9uYXRlVGJsICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1RhYmxlOiBIVE1MVGFibGVFbGVtZW50ID0gPEhUTUxUYWJsZUVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgZG9uYXRlVGJsLmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBwYWdlLmFwcGVuZENoaWxkKG5ld1RhYmxlKTtcclxuICAgICAgICAgICAgbmV3VGFibGUuY2xhc3NMaXN0LmFkZCgnbXBfdmF1bHRDbG9uZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBhZ2Uuc3R5bGUucGFkZGluZ0JvdHRvbSA9ICcyNXB4JztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2ltcGxpZmllZCB0aGUgdmF1bHQgcGFnZSEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFBvdEhpc3RvcnkgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5WYXVsdCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncG90SGlzdG9yeScsXHJcbiAgICAgICAgZGVzYzogJ0FkZCB0aGUgbGlzdCBvZiByZWNlbnQgZG9uYXRpb25zIHRvIHRoZSBkb25hdGlvbiBwYWdlLicsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5Cb2R5JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3ZhdWx0J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3Qgc3ViUGFnZTogc3RyaW5nID0gR01fZ2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XHJcbiAgICAgICAgY29uc3QgZm9ybSA9IDxIVE1MRWxlbWVudD4oXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyICsgJyBmb3JtW21ldGhvZD1cInBvc3RcIl0nKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICghZm9ybSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwb3RQYWdlUmVzcCA9IGF3YWl0IGZldGNoKCcvbWlsbGlvbmFpcmVzL3BvdC5waHAnKTtcclxuICAgICAgICBpZiAoIXBvdFBhZ2VSZXNwLm9rKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoXHJcbiAgICAgICAgICAgICAgICBgZmFpbGVkIHRvIGdldCAvbWlsbGlvbmFpcmVzL3BvdC5waHA6ICR7cG90UGFnZVJlc3Auc3RhdHVzfS8ke3BvdFBhZ2VSZXNwLnN0YXR1c1RleHR9YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFwcGx5aW5nIFZhdWx0ICgke3N1YlBhZ2V9KSBzZXR0aW5ncy4uLmApO1xyXG4gICAgICAgIGNvbnN0IHBvdFBhZ2VUZXh0OiBzdHJpbmcgPSBhd2FpdCBwb3RQYWdlUmVzcC50ZXh0KCk7XHJcbiAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xyXG4gICAgICAgIGNvbnN0IHBvdFBhZ2U6IERvY3VtZW50ID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhwb3RQYWdlVGV4dCwgJ3RleHQvaHRtbCcpO1xyXG5cclxuICAgICAgICAvLyBDbG9uZSB0aGUgaW1wb3J0YW50IHBhcnRzIGFuZCByZXNldCB0aGUgcGFnZVxyXG4gICAgICAgIGNvbnN0IGRvbmF0ZVRibDogSFRNTFRhYmxlRWxlbWVudCB8IG51bGwgPSBwb3RQYWdlLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjbWFpblRhYmxlIHRhYmxlOmxhc3Qtb2YtdHlwZSdcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIGRvbmF0ZSB0YWJsZSBpZiBpdCBleGlzdHNcclxuICAgICAgICBpZiAoZG9uYXRlVGJsICE9PSBudWxsICYmIGZvcm0gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3VGFibGU6IEhUTUxUYWJsZUVsZW1lbnQgPSA8SFRNTFRhYmxlRWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICBkb25hdGVUYmwuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGZvcm0ucGFyZW50RWxlbWVudD8uYXBwZW5kQ2hpbGQobmV3VGFibGUpO1xyXG4gICAgICAgICAgICBuZXdUYWJsZS5jbGFzc0xpc3QuYWRkKCdtcF92YXVsdENsb25lJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBkb25hdGlvbiBoaXN0b3J5IHRvIHRoZSBkb25hdGlvbiBwYWdlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIFBMQUNFIEFMTCBNKyBGRUFUVVJFUyBIRVJFXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKlxyXG4gKiBOZWFybHkgYWxsIGZlYXR1cmVzIGJlbG9uZyBoZXJlLCBhcyB0aGV5IHNob3VsZCBoYXZlIGludGVybmFsIGNoZWNrc1xyXG4gKiBmb3IgRE9NIGVsZW1lbnRzIGFzIG5lZWRlZC4gT25seSBjb3JlIGZlYXR1cmVzIHNob3VsZCBiZSBwbGFjZWQgaW4gYGFwcC50c2BcclxuICpcclxuICogVGhpcyBkZXRlcm1pbmVzIHRoZSBvcmRlciBpbiB3aGljaCBzZXR0aW5ncyB3aWxsIGJlIGdlbmVyYXRlZCBvbiB0aGUgU2V0dGluZ3MgcGFnZS5cclxuICogU2V0dGluZ3Mgd2lsbCBiZSBncm91cGVkIGJ5IHR5cGUgYW5kIEZlYXR1cmVzIG9mIG9uZSB0eXBlIHRoYXQgYXJlIGNhbGxlZCBiZWZvcmVcclxuICogb3RoZXIgRmVhdHVyZXMgb2YgdGhlIHNhbWUgdHlwZSB3aWxsIGFwcGVhciBmaXJzdC5cclxuICpcclxuICogVGhlIG9yZGVyIG9mIHRoZSBmZWF0dXJlIGdyb3VwcyBpcyBub3QgZGV0ZXJtaW5lZCBoZXJlLlxyXG4gKi9cclxuY2xhc3MgSW5pdEZlYXR1cmVzIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgR2xvYmFsIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBIaWRlSG9tZSgpO1xyXG4gICAgICAgIG5ldyBIaWRlU2VlZGJveCgpO1xyXG4gICAgICAgIG5ldyBIaWRlRG9uYXRpb25Cb3goKTtcclxuICAgICAgICBuZXcgQmx1cnJlZEhlYWRlcigpO1xyXG4gICAgICAgIG5ldyBWYXVsdExpbmsoKTtcclxuICAgICAgICBuZXcgTWluaVZhdWx0SW5mbygpO1xyXG4gICAgICAgIG5ldyBCb251c1BvaW50RGVsdGEoKTtcclxuICAgICAgICBuZXcgRml4ZWROYXYoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBIb21lIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEhpZGVOZXdzKCk7XHJcbiAgICAgICAgbmV3IEdpZnROZXdlc3QoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBTZWFyY2ggUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgVG9nZ2xlU25hdGNoZWQoKTtcclxuICAgICAgICBuZXcgU3RpY2t5U25hdGNoZWRUb2dnbGUoKTtcclxuICAgICAgICBuZXcgUGxhaW50ZXh0U2VhcmNoKCk7XHJcbiAgICAgICAgbmV3IFRvZ2dsZVNlYXJjaGJveCgpO1xyXG4gICAgICAgIG5ldyBCdWlsZFRhZ3MoKTtcclxuICAgICAgICBuZXcgUmFuZG9tQm9vaygpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFJlcXVlc3QgUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgR29vZHJlYWRzQnV0dG9uUmVxKCk7XHJcbiAgICAgICAgbmV3IFRvZ2dsZUhpZGRlblJlcXVlc3RlcnMoKTtcclxuICAgICAgICBuZXcgUGxhaW50ZXh0UmVxdWVzdCgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFRvcnJlbnQgUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgR29vZHJlYWRzQnV0dG9uKCk7XHJcbiAgICAgICAgbmV3IFN0b3J5R3JhcGhCdXR0b24oKTtcclxuICAgICAgICBuZXcgQXVkaWJsZUJ1dHRvbigpO1xyXG4gICAgICAgIG5ldyBDdXJyZW50bHlSZWFkaW5nKCk7XHJcbiAgICAgICAgbmV3IFRvckdpZnREZWZhdWx0KCk7XHJcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdCgpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RJY29ucygpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMSgpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMigpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMygpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RNaW4oKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBTaG91dGJveCBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgUHJpb3JpdHlVc2VycygpO1xyXG4gICAgICAgIG5ldyBQcmlvcml0eVN0eWxlKCk7XHJcbiAgICAgICAgbmV3IFNlbGZTdHlsZSgpO1xyXG4gICAgICAgIG5ldyBNdXRlZFVzZXJzKCk7XHJcbiAgICAgICAgLy8gbmV3IFJlcGx5U2ltcGxlKCk7XHJcbiAgICAgICAgLy8gbmV3IFJlcGx5UXVvdGUoKTsgLyogVE9ETzogUmVtb3ZlIHRoZXNlIGZ1bmN0aW9ucyBjb21wbGV0ZWx5ICovXHJcbiAgICAgICAgbmV3IEdpZnRCdXR0b24oKTtcclxuICAgICAgICBuZXcgUXVpY2tTaG91dCgpO1xyXG4gICAgICAgIG5ldyBBZGRVSUQoKTtcclxuICAgICAgICBuZXcgQWRkVG9MaXN0cygpO1xyXG4gICAgICAgIG5ldyBTdHlsZU1lbnRpb24oKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBWYXVsdCBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgU2ltcGxlVmF1bHQoKTtcclxuICAgICAgICBuZXcgUG90SGlzdG9yeSgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFVzZXIgUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgVXNlckdpZnREZWZhdWx0KCk7XHJcbiAgICAgICAgbmV3IFVzZXJHaWZ0SGlzdG9yeSgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIEZvcnVtIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEZvcnVtRkxHaWZ0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgVXBsb2FkIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFNlYXJjaEZvckR1cGxpY2F0ZXMoKTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiY2hlY2sudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidXRpbC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvY29yZS50c1wiIC8+XHJcblxyXG4vKipcclxuICogQ2xhc3MgZm9yIGhhbmRsaW5nIHNldHRpbmdzIGFuZCB0aGUgUHJlZmVyZW5jZXMgcGFnZVxyXG4gKiBAbWV0aG9kIGluaXQ6IHR1cm5zIGZlYXR1cmVzJyBzZXR0aW5ncyBpbmZvIGludG8gYSB1c2VhYmxlIHRhYmxlXHJcbiAqL1xyXG5jbGFzcyBTZXR0aW5ncyB7XHJcbiAgICAvLyBGdW5jdGlvbiBmb3IgZ2F0aGVyaW5nIHRoZSBuZWVkZWQgc2NvcGVzXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfZ2V0U2NvcGVzKHNldHRpbmdzOiBBbnlGZWF0dXJlW10pOiBQcm9taXNlPFNldHRpbmdHbG9iT2JqZWN0PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdfZ2V0U2NvcGVzKCcsIHNldHRpbmdzLCAnKScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc2NvcGVMaXN0OiBTZXR0aW5nR2xvYk9iamVjdCA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNldHRpbmcgb2Ygc2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBOdW1iZXIoc2V0dGluZy5zY29wZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgU2NvcGUgZXhpc3RzLCBwdXNoIHRoZSBzZXR0aW5ncyBpbnRvIHRoZSBhcnJheVxyXG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlTGlzdFtpbmRleF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZUxpc3RbaW5kZXhdLnB1c2goc2V0dGluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBjcmVhdGUgdGhlIGFycmF5XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlTGlzdFtpbmRleF0gPSBbc2V0dGluZ107XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzb2x2ZShzY29wZUxpc3QpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZ1bmN0aW9uIGZvciBjb25zdHJ1Y3RpbmcgdGhlIHRhYmxlIGZyb20gYW4gb2JqZWN0XHJcbiAgICBwcml2YXRlIHN0YXRpYyBfYnVpbGRUYWJsZShwYWdlOiBTZXR0aW5nR2xvYk9iamVjdCk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnX2J1aWxkVGFibGUoJywgcGFnZSwgJyknKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgbGV0IG91dHAgPSBgPHRib2R5Pjx0cj48dGQgY2xhc3M9XCJyb3cxXCIgY29sc3Bhbj1cIjJcIj48YnI+PHN0cm9uZz5NQU0rIHYke1xyXG4gICAgICAgICAgICAgICAgTVAuVkVSU0lPTlxyXG4gICAgICAgICAgICB9PC9zdHJvbmc+IC0gSGVyZSB5b3UgY2FuIGVuYWJsZSAmYW1wOyBkaXNhYmxlIGFueSBmZWF0dXJlIGZyb20gdGhlIDxhIGhyZWY9XCIvZi90LzQxODYzXCI+TUFNKyB1c2Vyc2NyaXB0PC9hPiEgSG93ZXZlciwgdGhlc2Ugc2V0dGluZ3MgYXJlIDxzdHJvbmc+Tk9UPC9zdHJvbmc+IHN0b3JlZCBvbiBNQU07IHRoZXkgYXJlIHN0b3JlZCB3aXRoaW4gdGhlIFRhbXBlcm1vbmtleS9HcmVhc2Vtb25rZXkgZXh0ZW5zaW9uIGluIHlvdXIgYnJvd3NlciwgYW5kIG11c3QgYmUgY3VzdG9taXplZCBvbiBlYWNoIG9mIHlvdXIgYnJvd3NlcnMvZGV2aWNlcyBzZXBhcmF0ZWx5Ljxicj48YnI+Rm9yIGEgZGV0YWlsZWQgbG9vayBhdCB0aGUgYXZhaWxhYmxlIGZlYXR1cmVzLCA8YSBocmVmPVwiJHtVdGlsLmRlcmVmZXIoXHJcbiAgICAgICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL2dhcmRlbnNoYWRlL21hbS1wbHVzL3dpa2kvRmVhdHVyZS1PdmVydmlldydcclxuICAgICAgICAgICAgKX1cIj5jaGVjayB0aGUgV2lraSE8L2E+PGJyPjxicj48L3RkPjwvdHI+YDtcclxuXHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHBhZ2UpLmZvckVhY2goKHNjb3BlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzY29wZU51bTogbnVtYmVyID0gTnVtYmVyKHNjb3BlKTtcclxuICAgICAgICAgICAgICAgIC8vIEluc2VydCB0aGUgc2VjdGlvbiB0aXRsZVxyXG4gICAgICAgICAgICAgICAgb3V0cCArPSBgPHRyPjx0ZCBjbGFzcz0ncm93Mic+JHtTZXR0aW5nR3JvdXBbc2NvcGVOdW1dfTwvdGQ+PHRkIGNsYXNzPSdyb3cxJz5gO1xyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSByZXF1aXJlZCBpbnB1dCBmaWVsZCBiYXNlZCBvbiB0aGUgc2V0dGluZ1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMocGFnZVtzY29wZU51bV0pLmZvckVhY2goKHNldHRpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nTnVtYmVyOiBudW1iZXIgPSBOdW1iZXIoc2V0dGluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbTogQW55RmVhdHVyZSA9IHBhZ2Vbc2NvcGVOdW1dW3NldHRpbmdOdW1iZXJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXNlcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxpbnB1dCB0eXBlPSdjaGVja2JveCcgaWQ9JyR7aXRlbS50aXRsZX0nIHZhbHVlPSd0cnVlJz4ke2l0ZW0uZGVzY308YnI+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPHNwYW4gY2xhc3M9J21wX3NldFRhZyc+JHtpdGVtLnRhZ306PC9zcGFuPiA8aW5wdXQgdHlwZT0ndGV4dCcgaWQ9JyR7aXRlbS50aXRsZX0nIHBsYWNlaG9sZGVyPScke2l0ZW0ucGxhY2Vob2xkZXJ9JyBjbGFzcz0nbXBfdGV4dElucHV0JyBzaXplPScyNSc+JHtpdGVtLmRlc2N9PGJyPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8c3BhbiBjbGFzcz0nbXBfc2V0VGFnJz4ke2l0ZW0udGFnfTo8L3NwYW4+IDxzZWxlY3QgaWQ9JyR7aXRlbS50aXRsZX0nIGNsYXNzPSdtcF9kcm9wSW5wdXQnPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoaXRlbS5vcHRpb25zKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPG9wdGlvbiB2YWx1ZT0nJHtrZXl9Jz4ke1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5vcHRpb25zIVtrZXldXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH08L29wdGlvbj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPC9zZWxlY3Q+JHtpdGVtLmRlc2N9PGJyPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlKSBjYXNlc1tpdGVtLnR5cGVdKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIENsb3NlIHRoZSByb3dcclxuICAgICAgICAgICAgICAgIG91dHAgKz0gJzwvdGQ+PC90cj4nO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gQWRkIHRoZSBzYXZlIGJ1dHRvbiAmIGxhc3QgcGFydCBvZiB0aGUgdGFibGVcclxuICAgICAgICAgICAgb3V0cCArPVxyXG4gICAgICAgICAgICAgICAgJzx0cj48dGQgY2xhc3M9XCJyb3cxXCIgY29sc3Bhbj1cIjJcIj48ZGl2IGlkPVwibXBfc3VibWl0XCIgY2xhc3M9XCJtcF9zZXR0aW5nQnRuXCI+U2F2ZSBNKyBTZXR0aW5ncz8/PC9kaXY+PGRpdiBpZD1cIm1wX2NvcHlcIiBjbGFzcz1cIm1wX3NldHRpbmdCdG5cIj5Db3B5IFNldHRpbmdzPC9kaXY+PGRpdiBpZD1cIm1wX2luamVjdFwiIGNsYXNzPVwibXBfc2V0dGluZ0J0blwiPlBhc3RlIFNldHRpbmdzPC9kaXY+PHNwYW4gY2xhc3M9XCJtcF9zYXZlc3RhdGVcIiBzdHlsZT1cIm9wYWNpdHk6MFwiPlNhdmVkITwvc3Bhbj48L3RkPjwvdHI+PC90Ym9keT4nO1xyXG5cclxuICAgICAgICAgICAgcmVzb2x2ZShvdXRwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgY3VycmVudCBzZXR0aW5ncyB2YWx1ZXNcclxuICAgIHByaXZhdGUgc3RhdGljIF9nZXRTZXR0aW5ncyhwYWdlOiBTZXR0aW5nR2xvYk9iamVjdCkge1xyXG4gICAgICAgIC8vIFV0aWwucHVyZ2VTZXR0aW5ncygpO1xyXG4gICAgICAgIGNvbnN0IGFsbFZhbHVlczogc3RyaW5nW10gPSBHTV9saXN0VmFsdWVzKCk7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdfZ2V0U2V0dGluZ3MoJywgcGFnZSwgJylcXG5TdG9yZWQgR00ga2V5czonLCBhbGxWYWx1ZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBPYmplY3Qua2V5cyhwYWdlKS5mb3JFYWNoKChzY29wZSkgPT4ge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwYWdlW051bWJlcihzY29wZSldKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmID0gcGFnZVtOdW1iZXIoc2NvcGUpXVtOdW1iZXIoc2V0dGluZyldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnUHJlZjonLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnfCBTZXQ6JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fZ2V0VmFsdWUoYCR7cHJlZi50aXRsZX1gKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3wgVmFsdWU6JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fZ2V0VmFsdWUoYCR7cHJlZi50aXRsZX1fdmFsYClcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwcmVmICE9PSBudWxsICYmIHR5cGVvZiBwcmVmID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsZW06IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByZWYudGl0bGUpIVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FzZXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsICdjaGVja2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0udmFsdWUgPSBHTV9nZXRWYWx1ZShgJHtwcmVmLnRpdGxlfV92YWxgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcGRvd246ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0udmFsdWUgPSBHTV9nZXRWYWx1ZShwcmVmLnRpdGxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXNlc1twcmVmLnR5cGVdICYmIEdNX2dldFZhbHVlKHByZWYudGl0bGUpKSBjYXNlc1twcmVmLnR5cGVdKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9zZXRTZXR0aW5ncyhvYmo6IFNldHRpbmdHbG9iT2JqZWN0KSB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgX3NldFNldHRpbmdzKGAsIG9iaiwgJyknKTtcclxuICAgICAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKHNjb3BlKSA9PiB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKG9ialtOdW1iZXIoc2NvcGUpXSkuZm9yRWFjaCgoc2V0dGluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZiA9IG9ialtOdW1iZXIoc2NvcGUpXVtOdW1iZXIoc2V0dGluZyldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwcmVmICE9PSBudWxsICYmIHR5cGVvZiBwcmVmID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsZW06IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByZWYudGl0bGUpIVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0uY2hlY2tlZCkgR01fc2V0VmFsdWUocHJlZi50aXRsZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlucDogc3RyaW5nID0gZWxlbS52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5wICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKHByZWYudGl0bGUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGAsIGlucCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShwcmVmLnRpdGxlLCBlbGVtLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXNlc1twcmVmLnR5cGVdKSBjYXNlc1twcmVmLnR5cGVdKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNhdmVkIScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9jb3B5U2V0dGluZ3MoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBnbUxpc3QgPSBHTV9saXN0VmFsdWVzKCk7XHJcbiAgICAgICAgY29uc3Qgb3V0cDogW3N0cmluZywgc3RyaW5nXVtdID0gW107XHJcblxyXG4gICAgICAgIC8vIExvb3Agb3ZlciBhbGwgc3RvcmVkIHNldHRpbmdzIGFuZCBwdXNoIHRvIG91dHB1dCBhcnJheVxyXG4gICAgICAgIGdtTGlzdC5tYXAoKHNldHRpbmcpID0+IHtcclxuICAgICAgICAgICAgLy8gRG9uJ3QgZXhwb3J0IG1wXyBzZXR0aW5ncyBhcyB0aGV5IHNob3VsZCBvbmx5IGJlIHNldCBhdCBydW50aW1lXHJcbiAgICAgICAgICAgIGlmIChzZXR0aW5nLmluZGV4T2YoJ21wXycpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgb3V0cC5wdXNoKFtzZXR0aW5nLCBHTV9nZXRWYWx1ZShzZXR0aW5nKV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvdXRwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfcGFzdGVTZXR0aW5ncyhwYXlsb2FkOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXAoYF9wYXN0ZVNldHRpbmdzKCApYCk7XHJcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBKU09OLnBhcnNlKHBheWxvYWQpO1xyXG4gICAgICAgIHNldHRpbmdzLmZvckVhY2goKHR1cGxlOiBbc3RyaW5nLCBzdHJpbmddW10pID0+IHtcclxuICAgICAgICAgICAgaWYgKHR1cGxlWzFdKSB7XHJcbiAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShgJHt0dXBsZVswXX1gLCBgJHt0dXBsZVsxXX1gKTtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codHVwbGVbMF0sICc6ICcsIHR1cGxlWzFdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZ1bmN0aW9uIHRoYXQgc2F2ZXMgdGhlIHZhbHVlcyBvZiB0aGUgc2V0dGluZ3MgdGFibGVcclxuICAgIHByaXZhdGUgc3RhdGljIF9zYXZlU2V0dGluZ3ModGltZXI6IG51bWJlciwgb2JqOiBTZXR0aW5nR2xvYk9iamVjdCkge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cChgX3NhdmVTZXR0aW5ncygpYCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNhdmVzdGF0ZTogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ubXBfc2F2ZXN0YXRlJykhXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBnbVZhbHVlczogc3RyaW5nW10gPSBHTV9saXN0VmFsdWVzKCk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRpbWVyICYgbWVzc2FnZVxyXG4gICAgICAgIHNhdmVzdGF0ZS5zdHlsZS5vcGFjaXR5ID0gJzAnO1xyXG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTYXZpbmcuLi4nKTtcclxuXHJcbiAgICAgICAgLy8gTG9vcCBvdmVyIGFsbCB2YWx1ZXMgc3RvcmVkIGluIEdNIGFuZCByZXNldCBldmVyeXRoaW5nXHJcbiAgICAgICAgZm9yIChjb25zdCBmZWF0dXJlIGluIGdtVmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZ21WYWx1ZXNbZmVhdHVyZV0gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIC8vIE9ubHkgbG9vcCBvdmVyIHZhbHVlcyB0aGF0IGFyZSBmZWF0dXJlIHNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICBpZiAoIVsnbXBfdmVyc2lvbicsICdzdHlsZV90aGVtZSddLmluY2x1ZGVzKGdtVmFsdWVzW2ZlYXR1cmVdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgbm90IHBhcnQgb2YgcHJlZmVyZW5jZXMgcGFnZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnbVZhbHVlc1tmZWF0dXJlXS5pbmRleE9mKCdtcF8nKSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShnbVZhbHVlc1tmZWF0dXJlXSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2F2ZSB0aGUgc2V0dGluZ3MgdG8gR00gdmFsdWVzXHJcbiAgICAgICAgdGhpcy5fc2V0U2V0dGluZ3Mob2JqKTtcclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSB0aGUgY29uZmlybWF0aW9uIG1lc3NhZ2VcclxuICAgICAgICBzYXZlc3RhdGUuc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB0aW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNhdmVzdGF0ZS5zdHlsZS5vcGFjaXR5ID0gJzAnO1xyXG4gICAgICAgICAgICB9LCAyMzQ1KTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS53YXJuKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnNlcnRzIHRoZSBzZXR0aW5ncyBwYWdlLlxyXG4gICAgICogQHBhcmFtIHJlc3VsdCBWYWx1ZSB0aGF0IG11c3QgYmUgcGFzc2VkIGRvd24gZnJvbSBgQ2hlY2sucGFnZSgnc2V0dGluZ3MnKWBcclxuICAgICAqIEBwYXJhbSBzZXR0aW5ncyBUaGUgYXJyYXkgb2YgZmVhdHVyZXMgdG8gcHJvdmlkZSBzZXR0aW5ncyBmb3JcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBpbml0KHJlc3VsdDogYm9vbGVhbiwgc2V0dGluZ3M6IEFueUZlYXR1cmVbXSkge1xyXG4gICAgICAgIC8vIFRoaXMgd2lsbCBvbmx5IHJ1biBpZiBgQ2hlY2sucGFnZSgnc2V0dGluZ3MpYCByZXR1cm5zIHRydWUgJiBpcyBwYXNzZWQgaGVyZVxyXG4gICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwKGBuZXcgU2V0dGluZ3MoKWApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHNldHRpbmdzIHRhYmxlIGhhcyBsb2FkZWRcclxuICAgICAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJyNtYWluQm9keSA+IHRhYmxlJykudGhlbigocikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgW00rXSBTdGFydGluZyB0byBidWlsZCBTZXR0aW5ncyB0YWJsZS4uLmApO1xyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIG5ldyB0YWJsZSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ05hdjogRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keSA+IHRhYmxlJykhO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ1RpdGxlOiBIVE1MSGVhZGluZ0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMScpO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ1RhYmxlOiBIVE1MVGFibGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgICAgICAgICAgICAgIGxldCBwYWdlU2NvcGU6IFNldHRpbmdHbG9iT2JqZWN0O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEluc2VydCB0YWJsZSBlbGVtZW50cyBhZnRlciB0aGUgUHJlZiBuYXZiYXJcclxuICAgICAgICAgICAgICAgIHNldHRpbmdOYXYuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIHNldHRpbmdUaXRsZSk7XHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nVGl0bGUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIHNldHRpbmdUYWJsZSk7XHJcbiAgICAgICAgICAgICAgICBVdGlsLnNldEF0dHIoc2V0dGluZ1RhYmxlLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6ICdjb2x0YWJsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbHNwYWNpbmc6ICcxJyxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ3dpZHRoOjEwMCU7bWluLXdpZHRoOjEwMCU7bWF4LXdpZHRoOjEwMCU7JyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgc2V0dGluZ1RpdGxlLmlubmVySFRNTCA9ICdNQU0rIFNldHRpbmdzJztcclxuICAgICAgICAgICAgICAgIC8vIEdyb3VwIHNldHRpbmdzIGJ5IHBhZ2VcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dldFNjb3BlcyhzZXR0aW5ncylcclxuICAgICAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSB0YWJsZSBIVE1MIGZyb20gZmVhdHVyZSBzZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChzY29wZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVNjb3BlID0gc2NvcGVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYnVpbGRUYWJsZShzY29wZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5zZXJ0IGNvbnRlbnQgaW50byB0aGUgbmV3IHRhYmxlIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nVGFibGUuaW5uZXJIVE1MID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgTUFNKyBTZXR0aW5ncyB0YWJsZSEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZ2VTY29wZTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChzY29wZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0U2V0dGluZ3Moc2NvcGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlcztcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgc2V0dGluZ3MgYXJlIGRvbmUgbG9hZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChzY29wZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VibWl0QnRuOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfc3VibWl0JykhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvcHlCdG46IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9jb3B5JykhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhc3RlQnRuOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfaW5qZWN0JykhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzc1RpbWVyOiBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2F2ZVNldHRpbmdzKHNzVGltZXIsIHNjb3Blcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKHBhc3RlQnRuLCB0aGlzLl9wYXN0ZVNldHRpbmdzLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihjb3B5QnRuLCB0aGlzLl9jb3B5U2V0dGluZ3MoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInR5cGVzLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInN0eWxlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9jb3JlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9nbG9iYWwudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2Jyb3dzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvZm9ydW0udHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2hvbWUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3JlcXVlc3QudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3Nob3V0LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy90b3IudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3VwbG9hZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdXNlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdmF1bHQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZmVhdHVyZXMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwic2V0dGluZ3MudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICogVXNlcnNjcmlwdCBuYW1lc3BhY2VcclxuICogQGNvbnN0YW50IENIQU5HRUxPRzogT2JqZWN0IGNvbnRhaW5pbmcgYSBsaXN0IG9mIGNoYW5nZXMgYW5kIGtub3duIGJ1Z3NcclxuICogQGNvbnN0YW50IFRJTUVTVEFNUDogUGxhY2Vob2xkZXIgaG9vayBmb3IgdGhlIGN1cnJlbnQgYnVpbGQgdGltZVxyXG4gKiBAY29uc3RhbnQgVkVSU0lPTjogVGhlIGN1cnJlbnQgdXNlcnNjcmlwdCB2ZXJzaW9uXHJcbiAqIEBjb25zdGFudCBQUkVWX1ZFUjogVGhlIGxhc3QgaW5zdGFsbGVkIHVzZXJzY3JpcHQgdmVyc2lvblxyXG4gKiBAY29uc3RhbnQgRVJST1JMT0c6IFRoZSB0YXJnZXQgYXJyYXkgZm9yIGxvZ2dpbmcgZXJyb3JzXHJcbiAqIEBjb25zdGFudCBQQUdFX1BBVEg6IFRoZSBjdXJyZW50IHBhZ2UgVVJMIHdpdGhvdXQgdGhlIHNpdGUgYWRkcmVzc1xyXG4gKiBAY29uc3RhbnQgTVBfQ1NTOiBUaGUgTUFNKyBzdHlsZXNoZWV0XHJcbiAqIEBjb25zdGFudCBydW4oKTogU3RhcnRzIHRoZSB1c2Vyc2NyaXB0XHJcbiAqL1xyXG5uYW1lc3BhY2UgTVAge1xyXG4gICAgZXhwb3J0IGNvbnN0IERFQlVHOiBib29sZWFuIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ2RlYnVnJykgPyB0cnVlIDogZmFsc2U7XHJcbiAgICBleHBvcnQgY29uc3QgQ0hBTkdFTE9HOiBBcnJheU9iamVjdCA9IHtcclxuICAgICAgICAvKiDwn4aV4pm777iP8J+QniAqL1xyXG4gICAgICAgIFVQREFURV9MSVNUOiBbXHJcbiAgICAgICAgICAgICfwn4aVOiBBZGRlZCBhYmlsaXR5IHRvIGVtcGhhc2l6ZS9ibG9jayB1c2VycyBmcm9tIHNob3V0Ym94IG1lbnUuIEdyYWNpYXMgQHNoZXJtYW43NjQwMCEnLFxyXG4gICAgICAgICAgICAn8J+GlTogRGlzcGxheSBVSURzIGluIHNob3V0Ym94LiBNZXJjaSBAc2hlcm1hbjc2NDAwIScsXHJcbiAgICAgICAgICAgICfwn4aVOiBTdHlsZSBtZW50aW9ucyBvZiB5b3VyIHVzZXJuYW1lIGluIHNob3V0Ym94LiBEYW5rZSBAc2hlcm1hbjc2NDAwIScsXHJcbiAgICAgICAgICAgICfwn4aVOiAnLFxyXG4gICAgICAgICAgICAn4pm777iPOiBBZGRlZCBhIGNvdW50ZXIgd2hlbiBpdGVtcyBhcmUgaGlkZGVuLiBHcmF6emkgQHNoZXJtYW43NjQwMCEnLFxyXG4gICAgICAgICAgICAn4pm777iPOiBSZW1vdmVkIFNob3V0Ym94IFF1b3RlL1JlcGx5IGJ1dHRvbiBmZWF0dXJlcyBhcyB0aGV5IGFyZSBub3cgaW1wbGVNQU10ZWQnLFxyXG4gICAgICAgICAgICAn4pm777iPOiBNYW55IGJlaGluZC10aGUtc2NlbmVzIGNoYW5nZXMgdG8gaG93IG5ldyB1c2VyIGdpZnRpbmcgbG9naWMgaXMgaGFuZGxlZC4gVGhhbmtzIEBQaG90YXohJyxcclxuICAgICAgICAgICAgJ/CfkJ46IEZpeGVkIHNpdGUgbGF5b3V0IGNoYW5nZSBicmVha2luZyBHaWZ0IE5ldyBVc2VycyBvbiBob21lLiBCbGVzc2luZ3MgQFBob3RheiEnLFxyXG4gICAgICAgIF0gYXMgc3RyaW5nW10sXHJcbiAgICAgICAgQlVHX0xJU1Q6IFtcclxuICAgICAgICAgICAgXCJTQiBidXR0b25zIGFyZSBzdGlsbCBpbiB0aGUgY29kZWJhc2UsIHRoZXkganVzdCBkb24ndCBydW5cIixcclxuICAgICAgICBdIGFzIHN0cmluZ1tdLFxyXG4gICAgfTtcclxuICAgIGV4cG9ydCBjb25zdCBUSU1FU1RBTVA6IHN0cmluZyA9ICcjI21ldGFfdGltZXN0YW1wIyMnO1xyXG4gICAgZXhwb3J0IGNvbnN0IFZFUlNJT046IHN0cmluZyA9IENoZWNrLm5ld1ZlcjtcclxuICAgIGV4cG9ydCBjb25zdCBQUkVWX1ZFUjogc3RyaW5nIHwgdW5kZWZpbmVkID0gQ2hlY2sucHJldlZlcjtcclxuICAgIGV4cG9ydCBjb25zdCBFUlJPUkxPRzogc3RyaW5nW10gPSBbXTtcclxuICAgIGV4cG9ydCBjb25zdCBQQUdFX1BBVEg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgIGV4cG9ydCBjb25zdCBNUF9DU1M6IFN0eWxlID0gbmV3IFN0eWxlKCk7XHJcbiAgICBleHBvcnQgY29uc3Qgc2V0dGluZ3NHbG9iOiBBbnlGZWF0dXJlW10gPSBbXTtcclxuXHJcbiAgICBleHBvcnQgY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogUFJFIFNDUklQVFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYFdlbGNvbWUgdG8gTUFNKyB2JHtWRVJTSU9OfSFgKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGN1cnJlbnQgcGFnZSBpcyBub3QgeWV0IGtub3duXHJcbiAgICAgICAgR01fZGVsZXRlVmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XHJcbiAgICAgICAgQ2hlY2sucGFnZSgpO1xyXG4gICAgICAgIC8vIEFkZCBhIHNpbXBsZSBjb29raWUgdG8gYW5ub3VuY2UgdGhlIHNjcmlwdCBpcyBiZWluZyB1c2VkXHJcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gJ21wX2VuYWJsZWQ9MTtkb21haW49bXlhbm9uYW1vdXNlLm5ldDtwYXRoPS87c2FtZXNpdGU9bGF4JztcclxuICAgICAgICAvLyBJbml0aWFsaXplIGNvcmUgZnVuY3Rpb25zXHJcbiAgICAgICAgY29uc3QgYWxlcnRzOiBBbGVydHMgPSBuZXcgQWxlcnRzKCk7XHJcbiAgICAgICAgbmV3IERlYnVnKCk7XHJcbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIGlmIHRoZSBzY3JpcHQgd2FzIHVwZGF0ZWRcclxuICAgICAgICBDaGVjay51cGRhdGVkKCkudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIGFsZXJ0cy5ub3RpZnkocmVzdWx0LCBDSEFOR0VMT0cpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGZlYXR1cmVzXHJcbiAgICAgICAgbmV3IEluaXRGZWF0dXJlcygpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFNFVFRJTkdTXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQ2hlY2sucGFnZSgnc2V0dGluZ3MnKS50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc3ViUGc6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUgJiYgKHN1YlBnID09PSAnJyB8fCBzdWJQZyA9PT0gJz92aWV3PWdlbmVyYWwnKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2V0dGluZ3MgcGFnZVxyXG4gICAgICAgICAgICAgICAgU2V0dGluZ3MuaW5pdChyZXN1bHQsIHNldHRpbmdzR2xvYik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKiBTVFlMRVNcclxuICAgICAgICAgKiBJbmplY3RzIENTU1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIENoZWNrLmVsZW1Mb2FkKCdoZWFkIGxpbmtbaHJlZio9XCJJQ0dzdGF0aW9uXCJdJykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEFkZCBjdXN0b20gQ1NTIHNoZWV0XHJcbiAgICAgICAgICAgIE1QX0NTUy5pbmplY3RMaW5rKCk7XHJcbiAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBzaXRlIHRoZW1lXHJcbiAgICAgICAgICAgIE1QX0NTUy5hbGlnblRvU2l0ZVRoZW1lKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8vICogU3RhcnQgdGhlIHVzZXJzY3JpcHRcclxuTVAucnVuKCk7XHJcbiJdfQ==
