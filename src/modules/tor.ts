/// <reference path="shared.ts" />
/// <reference path="../util.ts" />

/**
 * * Autofills the Gift box with a specified number of points.
 */
class TorGiftDefault implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'textbox',
        title: 'torGiftDefault',
        tag: 'Default Gift',
        placeholder: 'ex. 5000, max',
        desc:
            'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
    };
    private _tar: string = '#thanksArea input[name=points]';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        new Shared()
            .fillGiftBox(this._tar, this._settings.title)
            .then((points) =>
                console.log(`[M+] Set the default gift amount to ${points}`)
            );
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

/**
 * * Adds various links to Goodreads
 */
class GoodreadsButton implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'checkbox',
        title: 'goodreadsButton',
        desc: 'Enable the MAM-to-Goodreads buttons',
    };
    private _tar: string = '#submitInfo';
    private _share = new Shared();

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                } else {
                    console.log('[M+] Not a book category; skipping Goodreads buttons');
                }
            }
        });
    }

    private async _init() {
        // Select the data points
        const authorData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#torDetMainCon .torAuthors a');
        const bookData: HTMLSpanElement | null = document.querySelector(
            '#torDetMainCon .TorrentTitle'
        );
        const seriesData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#Series a');
        const target: HTMLDivElement | null = document.querySelector(this._tar);
        // Generate buttons
        this._share.goodreadsButtons(bookData, authorData, seriesData, target);
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Adds various links to Audible
 */
class AudibleButton implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'checkbox',
        title: 'audibleButton',
        desc: 'Enable the MAM-to-Audible buttons',
    };
    private _tar: string = '#submitInfo';
    private _share = new Shared();

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                } else {
                    console.log('[M+] Not a book category; skipping Audible buttons');
                }
            }
        });
    }

    private async _init() {
        // Select the data points
        const authorData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#torDetMainCon .torAuthors a');
        const bookData: HTMLSpanElement | null = document.querySelector(
            '#torDetMainCon .TorrentTitle'
        );
        const seriesData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#Series a');

        let target: HTMLDivElement | null = document.querySelector(this._tar);

        if (document.querySelector('.mp_sgRow')) {
            target = <HTMLDivElement>document.querySelector('.mp_sgRow');
        } else if (document.querySelector('.mp_grRow')) {
            target = <HTMLDivElement>document.querySelector('.mp_grRow');
        }

        // Generate buttons
        this._share.audibleButtons(bookData, authorData, seriesData, target);
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Adds various links to StoryGraph
 */
class StoryGraphButton implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'checkbox',
        title: 'storyGraphButton',
        desc: 'Enable the MAM-to-StoryGraph buttons',
    };
    private _tar: string = '#submitInfo';
    private _share = new Shared();

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                } else {
                    console.log('[M+] Not a book category; skipping StroyGraph buttons');
                }
            }
        });
    }

    private async _init() {
        // Select the data points
        const authorData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#torDetMainCon .torAuthors a');
        const bookData: HTMLSpanElement | null = document.querySelector(
            '#torDetMainCon .TorrentTitle'
        );
        const seriesData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#Series a');

        let target: HTMLDivElement | null = document.querySelector(this._tar);

        if (document.querySelector('.mp_grRow')) {
            target = <HTMLDivElement>document.querySelector('.mp_grRow');
        }

        // Generate buttons
        this._share.storyGraphButtons(bookData, authorData, seriesData, target);
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Generates a field for "Currently Reading" bbcode
 */
class CurrentlyReading implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        scope: SettingGroup['Torrent Page'],
        title: 'currentlyReading',
        desc: `Add a button to generate a "Currently Reading" forum snippet`,
    };
    private _tar: string = '#torDetMainCon .TorrentTitle';
    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        console.log('[M+] Adding Currently Reading section...');
        // Get the required information
        const title: string = document!.querySelector('#torDetMainCon .TorrentTitle')!
            .textContent!;
        const authors: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(
            '#torDetMainCon .torAuthors a'
        );
        const torID: string = window.location.pathname.split('/')[2];
        const rowTar: HTMLDivElement | null = document.querySelector('#fInfo');

        // Title can't be null
        if (title === null) {
            throw new Error(`Title field was null`);
        }

        // Build a new table row
        const crRow: HTMLDivElement = await Util.addTorDetailsRow(
            rowTar,
            'Currently Reading',
            'mp_crRow'
        );
        // Process data into string
        const blurb: string = await this._generateSnippet(torID, title, authors);
        // Build button
        const btn: HTMLDivElement = await this._buildButton(crRow, blurb);
        // Init button
        Util.clipboardifyBtn(btn, blurb);
    }

    /**
     * * Build a BB Code text snippet using the book info, then return it
     * @param id The string ID of the book
     * @param title The string title of the book
     * @param authors A node list of author links
     */
    private _generateSnippet(
        id: string,
        title: string,
        authors: NodeListOf<HTMLAnchorElement>
    ): string {
        /**
         * * Add Author Link
         * @param authorElem A link containing author information
         */
        const addAuthorLink = (authorElem: HTMLAnchorElement) => {
            return `[url=${authorElem.href.replace('https://www.myanonamouse.net', '')}]${
                authorElem.textContent
            }[/url]`;
        };

        // Convert the NodeList into an Array which is easier to work with
        let authorArray: string[] = [];
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
    private _buildButton(tar: HTMLDivElement, content: string): HTMLDivElement {
        // Build text display
        tar.innerHTML = `<textarea rows="1" cols="80" style='margin-right:5px'>${content}</textarea>`;
        // Build button
        Util.createButtonElement(
            '',
            'Copy',
            tar,
            { url: 'none', order: 2, relative: 'afterbegin', btnClass: 'mp_button_clone' }
        );
        document.querySelector('.mp_crRow .mp_button_clone')!.classList.add('mp_reading');
        // Return button
        return <HTMLDivElement>document.querySelector('.mp_reading');
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Protects the user from ratio troubles by adding warnings and displaying ratio delta
 */
class RatioProtect implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        scope: SettingGroup['Torrent Page'],
        title: 'ratioProtect',
        desc: `Protect your ratio with warnings &amp; ratio calculations`,
    };
    private _tar: string = '#ratio';
    private _rcRow: string = 'mp_ratioCostRow';
    private _share = new Shared();

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        console.log('[M+] Enabling ratio protection...');
        // TODO: Move this block to shared
        // The download text area
        const dlBtn: HTMLAnchorElement | null = document.querySelector('#tddl');
        // The currently unused label area above the download text
        const dlLabel: HTMLDivElement | null = document.querySelector(
            '#download .torDetInnerTop'
        );
        // Insertion target for messages
        const descBlock = await Check.elemLoad('.torDetBottom');
        // Would become ratio
        const rNew: HTMLDivElement | null = document.querySelector(this._tar);
        // Current ratio
        const rCur: HTMLSpanElement | null = document.querySelector('#tmR');
        // Seeding or downloading
        const seeding: HTMLSpanElement | null = document.querySelector('#DLhistory');
        // User has a ratio
        const userHasRatio = rCur.textContent.indexOf('Inf') < 0 ? true : false;

        // Get the custom ratio amounts (will return default values otherwise)
        const [r1, r2, r3] = await this._share.getRatioProtectLevels();
        if (MP.DEBUG) console.log(`Ratio protection levels set to: ${r1}, ${r2}, ${r3}`);

        // Create the box we will display text in
        if (descBlock) {
            // Add line under Torrent: detail for Cost data "Cost to Restore Ratio"
            descBlock.insertAdjacentHTML(
                'beforebegin',
                `<div class="torDetRow" id="mp_row"><div class="torDetLeft">Cost to Restore Ratio</div><div class="torDetRight ${this._rcRow}" style="flex-direction:column;align-items:flex-start;"><span id="mp_foobar"></span></div></div>`
            );
        } else {
            throw new Error(`'.torDetRow is ${descBlock}`);
        }

        // Only run the code if the ratio exists
        if (rNew && rCur && !seeding && userHasRatio) {
            const rDiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];

            if (MP.DEBUG)
                console.log(
                    `Current ${Util.extractFloat(rCur)[0]} | New ${
                        Util.extractFloat(rNew)[0]
                    } | Dif ${rDiff}`
                );

            // Only activate if a ratio change is expected
            if (!isNaN(rDiff) && rDiff > 0.009) {
                if (dlLabel) {
                    dlLabel.innerHTML = `Ratio loss ${rDiff.toFixed(2)}`;
                    dlLabel.style.fontWeight = 'normal'; //To distinguish from BOLD Titles
                }

                // Calculate & Display cost of download w/o FL
                // Always show calculations when there is a ratio loss
                const sizeElem: HTMLSpanElement | null = document.querySelector(
                    '#size span'
                );
                if (sizeElem) {
                    const size = sizeElem.textContent!.split(/\s+/);
                    const sizeMap = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
                    // Convert human readable size to bytes
                    const byteSized =
                        Number(size[0]) * Math.pow(1024, sizeMap.indexOf(size[1]));
                    const recovery = byteSized * Util.extractFloat(rCur)[0];
                    const pointAmnt = Math.floor(
                        (125 * recovery) / 268435456
                    ).toLocaleString();
                    const dayAmount = Math.floor((5 * recovery) / 2147483648);
                    const wedgeStoreCost = Util.formatBytes(
                        (268435456 * 50000) / (Util.extractFloat(rCur)[0] * 125)
                    );
                    const wedgeVaultCost = Util.formatBytes(
                        (268435456 * 200) / (Util.extractFloat(rCur)[0] * 125)
                    );

                    // Update the ratio cost row
                    document.querySelector(
                        `.${this._rcRow}`
                    )!.innerHTML = `<span><b>${Util.formatBytes(
                        recovery
                    )}</b>&nbsp;upload (${pointAmnt} BP; or one FL wedge per day for ${dayAmount} days).&nbsp;<abbr title='Contributing 2,000 BP to each vault cycle gives you almost one FL wedge per day on average.' style='text-decoration:none;cursor:help;'>&#128712;</abbr></span>
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

                    if (
                        rDiff > r3 ||
                        Util.extractFloat(rNew)[0] < GM_getValue('ratioProtectMin_val') ||
                        Util.extractFloat(rNew)[0] < 2
                    ) {
                        this._setButtonState(dlBtn, '3_alert');
                        // * This is the "I need to think about using a FL" threshold
                    } else if (rDiff > r2) {
                        this._setButtonState(dlBtn, '2_warn');
                    }
                }
            }
            // If the user does not have a ratio, display a short message
        } else if (!userHasRatio) {
            this._setButtonState(dlBtn, '1_notify');
            document.querySelector(
                `.${this._rcRow}`
            )!.innerHTML = `<span>Ratio points and cost to restore ratio will appear here after your ratio is a real number.</span>`;
        }
    }

    private _setButtonState(
        tar: HTMLAnchorElement,
        state: '1_notify' | '2_warn' | '3_alert',
        label?: HTMLDivElement
    ) {
        if (state === '1_notify') {
            tar.style.backgroundColor = 'SpringGreen';
            tar.style.color = 'black';
            tar.innerHTML = 'Download?';
        } else if (state === '2_warn') {
            tar.style.backgroundColor = 'Orange';
            tar.innerHTML = 'Suggest FL';
        } else if (state === '3_alert') {
            if (!label) {
                console.warn(`No label provided in _setButtonState()!`);
            }
            tar.style.backgroundColor = 'Red';
            tar.style.cursor = 'no-drop';
            tar.innerHTML = 'FL Needed';
            if (label) {
                label.style.fontWeight = 'bold';
            }
        } else {
            throw new Error(`State "${state}" does not exist.`);
        }
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Low ratio protection amount
 */
class RatioProtectL1 implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'textbox',
        title: 'ratioProtectL1',
        tag: 'Ratio Warn L1',
        placeholder: 'default: 0.5',
        desc: `Set the smallest threshhold to indicate ratio changes. (<em>This is a slight color change</em>).`,
    };
    private _tar: string = '#download';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        console.log('[M+] Enabled custom Ratio Protection L1!');
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

/**
 * * Medium ratio protection amount
 */
class RatioProtectL2 implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'textbox',
        title: 'ratioProtectL2',
        tag: 'Ratio Warn L2',
        placeholder: 'default: 1',
        desc: `Set the median threshhold to warn of ratio changes. (<em>This is a noticeable color change</em>).`,
    };
    private _tar: string = '#download';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        console.log('[M+] Enabled custom Ratio Protection L2!');
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

/**
 * * High ratio protection amount
 */
class RatioProtectL3 implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'textbox',
        title: 'ratioProtectL3',
        tag: 'Ratio Warn L3',
        placeholder: 'default: 2',
        desc: `Set the highest threshhold to prevent ratio changes. (<em>This disables download without FL use</em>).`,
    };
    private _tar: string = '#download';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        console.log('[M+] Enabled custom Ratio Protection L3!');
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

class RatioProtectMin implements Feature {
    private _settings: TextboxSetting = {
        type: 'textbox',
        title: 'ratioProtectMin',
        scope: SettingGroup['Torrent Page'],
        tag: 'Minimum Ratio',
        placeholder: 'ex. 100',
        desc: 'Trigger Ratio Warn L3 if your ratio would drop below this number.',
    };
    // An element that must exist in order for the feature to run
    private _tar: string = '#download';
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        console.log('[M+] Enabled custom Ratio Protection minimum!');
    }
    get settings(): TextboxSetting {
        return this._settings;
    }
}

class RatioProtectIcons implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        title: 'ratioProtectIcons',
        scope: SettingGroup['Torrent Page'],
        desc: 'Enable custom browser favicons based on Ratio Protect conditions?',
    };
    // An element that must exist in order for the feature to run
    private _tar: string = '#ratio';
    private _userID: number = 164109;
    private _share = new Shared();
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        console.log(
            `[M+] Enabling custom Ratio Protect favicons from user ${this._userID}...`
        );

        // Get the custom ratio amounts (will return default values otherwise)
        const [r1, r2, r3] = await this._share.getRatioProtectLevels();
        // Would become ratio
        const rNew: HTMLDivElement | null = document.querySelector(this._tar);
        // Current ratio
        const rCur: HTMLSpanElement | null = document.querySelector('#tmR');
        // Difference between new and old ratio
        const rDiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];
        // Seeding or downloading
        const seeding: HTMLSpanElement | null = document.querySelector('#DLhistory');
        // VIP status
        const vipstat: string | null = document.querySelector(
            '#ratio .torDetInnerBottomSpan'
        )
            ? document.querySelector('#ratio .torDetInnerBottomSpan').textContent
            : null;
        // Bookclub status
        const bookclub: HTMLSpanElement | null = document.querySelector(
            "div[id='bcfl'] span"
        );

        // Find favicon links and load a simple default.
        const siteFavicons = document.querySelectorAll("link[rel$='icon']") as NodeListOf<
            HTMLLinkElement
        >;
        if (siteFavicons) this._buildIconLinks(siteFavicons, 'tm_32x32');

        // Test if VIP
        if (vipstat) {
            if (MP.DEBUG) console.log(`VIP = ${vipstat}`);

            if (vipstat.search('VIP expires') > -1) {
                this._buildIconLinks(siteFavicons, 'mouseclock');
                document.title = document.title.replace(
                    ' | My Anonamouse',
                    ` | Expires ${vipstat.substring(26)}`
                );
            } else if (vipstat.search('VIP not set to expire') > -1) {
                this._buildIconLinks(siteFavicons, '0cir');
                document.title = document.title.replace(
                    ' | My Anonamouse',
                    ' | Not set to expire'
                );
            } else if (vipstat.search('This torrent is freeleech!') > -1) {
                this._buildIconLinks(siteFavicons, 'mouseclock');
                // Test if bookclub
                if (bookclub && bookclub.textContent.search('Bookclub Freeleech') > -1) {
                    document.title = document.title.replace(
                        ' | My Anonamouse',
                        ` | Club expires ${bookclub.textContent.substring(25)}`
                    );
                } else {
                    document.title = document.title.replace(
                        ' | My Anonamouse',
                        " | 'till next Site FL"
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
        } else if (vipstat.search('This torrent is personal freeleech') > -1) {
            this._buildIconLinks(siteFavicons, '5');
        }

        // Test if there will be ratio loss
        if (rNew && rCur && !seeding) {
            // Change icon based on Ratio Protect states
            if (
                rDiff > r3 ||
                Util.extractFloat(rNew)[0] < GM_getValue('ratioProtectMin_val') ||
                Util.extractFloat(rNew)[0] < 2
            ) {
                this._buildIconLinks(siteFavicons, '12');
            } else if (rDiff > r2) {
                this._buildIconLinks(siteFavicons, '3Qmouse');
                // Also try Orange, OrangeRed, Gold, or 14
            } else if (rDiff > r1) {
                this._buildIconLinks(siteFavicons, 'SpringGreen');
            }

            // Check if future VIP
            if (vipstat.search('On list for next FL pick') > -1) {
                this._buildIconLinks(siteFavicons, 'MirrorGreenClock'); // Also try greenclock
                document.title = document.title.replace(
                    ' | My Anonamouse',
                    ' | Next FL pick'
                );
            }
        }

        console.log('[M+] Custom Ratio Protect favicons enabled!');
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

    private async _buildIconLinks(elems: NodeListOf<HTMLLinkElement>, filename: string) {
        elems.forEach((elem) => {
            elem.href = `https://cdn.myanonamouse.net/imagebucket/${this._userID}/${filename}.png`;
        });
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }

    set userID(newID: number) {
        this._userID = newID;
    }
}

// TODO: Add feature to set RatioProtectIcon's `_userID` value. Only necessary once other icon sets exist.

class GoodreadsToMAM implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'checkbox',
        title: 'goodreadsToMAM',
        desc: 'Enable the Goodreads-to-MAM search buttons on Goodreads',
    };
    private _tar: string = '.BookActions';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['goodreads']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        if (document.getElementById('mam-search-buttons-container')) return;

        let title = '';
        let author = '';
        const jsonLdEl = document.querySelector('script[type="application/ld+json"]');
        if (jsonLdEl) {
            try {
                const data = JSON.parse(jsonLdEl.textContent || '{}');
                title = data.name || '';
                if (data.author && data.author[0]) {
                    author = data.author[0].name || '';
                }
            } catch (e) {
                console.error("Error parsing JSON-LD metadata", e);
            }
        }

        if (!title) {
            const titleEl = document.querySelector('[data-testid="bookTitle"]');
            if (titleEl) title = (titleEl as HTMLElement).innerText.trim();
        }
        if (!author) {
            const authorEl = document.querySelector('.ContributorLink__name');
            if (authorEl) author = (authorEl as HTMLElement).innerText.trim();
        }

        if (!title) return;

        const cleanTitle = title.replace(/\s\([^)]+\)/g, '').trim();
        const queryTitleAndAuthor = `${cleanTitle} ${author}`.trim();
        const queryTitleOnly = cleanTitle.trim();

        const searchUrlTitleAndAuthor =
            'https://www.myanonamouse.net/tor/browse.php' +
            '?tor[searchType]=all' +
            '&tor[searchIn]=torrents' +
            `&tor[text]=${encodeURIComponent(queryTitleAndAuthor)}`;

        const searchUrlTitleOnly =
            'https://www.myanonamouse.net/tor/browse.php' +
            '?tor[searchType]=all' +
            '&tor[searchIn]=torrents' +
            `&tor[text]=${encodeURIComponent(queryTitleOnly)}`;

        const bookActionsContainer = document.querySelector(this._tar);
        if (bookActionsContainer) {
            const container = document.createElement('div');
            container.id = 'mam-search-buttons-container';
            container.style.marginTop = '8px';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '8px';
            container.style.width = '100%';

            const btnBoth = document.createElement('a');
            btnBoth.href = searchUrlTitleAndAuthor;
            btnBoth.target = '_blank';
            btnBoth.className = 'Button Button--secondary Button--medium Button--block';
            btnBoth.style.textDecoration = 'none';
            btnBoth.innerHTML = '<span class="Button__labelItem">🔎 MAM (Title + Author)</span>';

            const btnTitle = document.createElement('a');
            btnTitle.href = searchUrlTitleOnly;
            btnTitle.target = '_blank';
            btnTitle.className = 'Button Button--secondary Button--medium Button--block';
            btnTitle.style.textDecoration = 'none';
            btnTitle.innerHTML = '<span class="Button__labelItem">🔎 MAM (Title Only)</span>';

            container.appendChild(btnBoth);
            container.appendChild(btnTitle);
            bookActionsContainer.appendChild(container);
        }
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

class AmazonToMAM implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'checkbox',
        title: 'amazonToMAM',
        desc: 'Enable the Amazon-to-MAM search buttons on Amazon',
    };
    private _tar: string = '#bylineInfo_feature_div, #title';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['amazon']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        if (document.getElementById('mam-amazon-search-buttons-container')) return;

        const titleEl = document.querySelector('#productTitle');
        if (!titleEl) return;
        const title = titleEl.textContent || '';

        const authorEl = document.querySelector('#bylineInfo');
        let author = '';
        if (authorEl) {
            const links = authorEl.querySelectorAll('a');
            if (links.length > 0) {
                author = Array.from(links).map(a => a.textContent || '').join(' ');
            } else {
                author = authorEl.textContent || '';
            }
        }
        author = author.replace(/^(by\s+)/i, '').replace(/\s+\(Author\)/i, '').replace(/\(Author\)/ig, '').replace(/\s+/g, ' ').trim();

        const cleanTitle = title.replace(/\s\([^)]+\)/g, '').replace(/[\n\r]/g, '').replace(/\s+/g, ' ').trim();
        const queryTitleAndAuthor = `${cleanTitle} ${author}`.trim();
        const queryTitleOnly = cleanTitle.trim();

        const searchUrlTitleAndAuthor =
            'https://www.myanonamouse.net/tor/browse.php' +
            '?tor[searchType]=all' +
            '&tor[searchIn]=torrents' +
            `&tor[text]=${encodeURIComponent(queryTitleAndAuthor)}`;

        const searchUrlTitleOnly =
            'https://www.myanonamouse.net/tor/browse.php' +
            '?tor[searchType]=all' +
            '&tor[searchIn]=torrents' +
            `&tor[text]=${encodeURIComponent(queryTitleOnly)}`;

        const target = document.querySelector('#bylineInfo_feature_div') || document.querySelector('#title');
        if (target) {
            const container = document.createElement('div');
            container.id = 'mam-amazon-search-buttons-container';
            container.style.marginTop = '12px';
            container.style.display = 'flex';
            container.style.gap = '8px';
            container.style.flexWrap = 'wrap';

            const btnBoth = document.createElement('a');
            btnBoth.href = searchUrlTitleAndAuthor;
            btnBoth.target = '_blank';
            btnBoth.style.textDecoration = 'none';
            btnBoth.style.padding = '4px 8px';
            btnBoth.style.backgroundColor = '#f0c14b';
            btnBoth.style.border = '1px solid #a88734';
            btnBoth.style.color = '#111';
            btnBoth.style.borderRadius = '3px';
            btnBoth.style.fontSize = '12px';
            btnBoth.innerText = '🔎 MAM (Title + Author)';

            const btnTitle = document.createElement('a');
            btnTitle.href = searchUrlTitleOnly;
            btnTitle.target = '_blank';
            btnTitle.style.textDecoration = 'none';
            btnTitle.style.padding = '4px 8px';
            btnTitle.style.backgroundColor = '#f0c14b';
            btnTitle.style.border = '1px solid #a88734';
            btnTitle.style.color = '#111';
            btnTitle.style.borderRadius = '3px';
            btnTitle.style.fontSize = '12px';
            btnTitle.innerText = '🔎 MAM (Title Only)';

            container.appendChild(btnBoth);
            container.appendChild(btnTitle);
            target.appendChild(container);
        }
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
