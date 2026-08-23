function runExternalMamSearch() {
    'use strict';

    const CONTAINER_ID = 'mam-plus-h-external-search';
    const MAM_SEARCH_URL = 'https://www.myanonamouse.net/tor/browse.php';

    function normalizeText(value) {
        return String(value || '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function buildMamSearchUrl(query) {
        const url = new URL(MAM_SEARCH_URL);
        url.searchParams.set('tor[searchType]', 'all');
        url.searchParams.set('tor[searchIn]', 'torrents');
        url.searchParams.set('tor[text]', normalizeText(query));
        return url.toString();
    }

    function findBookInJsonLd(value) {
        if (!value) return null;

        if (Array.isArray(value)) {
            for (const item of value) {
                const found = findBookInJsonLd(item);
                if (found) return found;
            }
            return null;
        }

        if (typeof value !== 'object') return null;

        const type = value['@type'];
        const types = Array.isArray(type) ? type : [type];
        if (types.some((item) => item === 'Book' || item === 'Audiobook')) {
            return value;
        }

        if (value['@graph']) {
            const found = findBookInJsonLd(value['@graph']);
            if (found) return found;
        }

        return null;
    }

    function readGoodreadsBook() {
        let title = '';
        let author = '';

        for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
            try {
                const book = findBookInJsonLd(JSON.parse(script.textContent || 'null'));
                if (!book) continue;

                title = normalizeText(book.name);

                const authorData = Array.isArray(book.author) ? book.author[0] : book.author;
                author = normalizeText(authorData && (authorData.name || authorData));

                if (title) break;
            } catch (error) {
                console.debug('[MAM+] Goodreads JSON-LD ignored:', error);
            }
        }

        if (!title) {
            const titleElement = document.querySelector(
                '[data-testid="bookTitle"], h1.Text__title1, h1.BookPageTitleSection__title'
            );
            title = normalizeText(titleElement && titleElement.textContent);
        }

        if (!author) {
            const authorElement = document.querySelector(
                '.ContributorLink__name, [data-testid="name"], a[href*="/author/show/"]'
            );
            author = normalizeText(authorElement && authorElement.textContent);
        }

        const target = document.querySelector('.BookActions');
        return { title, author, target, site: 'goodreads' };
    }

    function cleanAmazonAuthor(value) {
        return normalizeText(value)
            .replace(/^by\s+/i, '')
            .replace(/\((author|auteur|autor|autrice)\)/gi, '')
            .replace(/\b(visit the .* store|suivez .* sur amazon)\b/gi, '')
            .trim();
    }

    function readAmazonBook() {
        const titleElement = document.querySelector('#productTitle');
        const title = normalizeText(titleElement && titleElement.textContent);

        let author = '';
        const byline = document.querySelector('#bylineInfo, #bylineInfo_feature_div');
        if (byline) {
            const authorLinks = Array.from(
                byline.querySelectorAll('a[href*="/author/"], a[href*="field-author"], a.a-link-normal')
            )
                .map((link) => cleanAmazonAuthor(link.textContent))
                .filter(Boolean);

            author = authorLinks.length
                ? [...new Set(authorLinks)].join(' ')
                : cleanAmazonAuthor(byline.textContent);
        }

        const target =
            document.querySelector('#bylineInfo_feature_div') ||
            document.querySelector('#title') ||
            document.querySelector('#centerCol');

        return { title, author, target, site: 'amazon' };
    }

    function readBabelioBook() {
        let title = '';
        let author = '';

        for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
            try {
                const book = findBookInJsonLd(JSON.parse(script.textContent || 'null'));
                if (book) {
                    title = normalizeText(book.name);
                    const authorData = Array.isArray(book.author) ? book.author[0] : book.author;
                    author = normalizeText(authorData && (authorData.name || authorData));
                    if (title) break;
                }
            } catch (e) {}
        }

        if (!title) {
            const titleElement = document.querySelector('h1[itemprop="name"], h1 a, h1');
            title = normalizeText(titleElement && titleElement.textContent);
        }
        if (!author) {
            const authorElement = document.querySelector('span[itemprop="author"] a, a[itemprop="author"], .livre_auteur a, a[href^="/auteur/"]');
            author = normalizeText(authorElement && authorElement.textContent);
        }

        const target = document.querySelector('.livre_boutons, .livre_actions, #livre_presentation, main');
        return { title, author, target, site: 'babelio' };
    }

    function readStoryGraphBook() {
        let title = '';
        let author = '';

        for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
            try {
                const book = findBookInJsonLd(JSON.parse(script.textContent || 'null'));
                if (book) {
                    title = normalizeText(book.name);
                    const authorData = Array.isArray(book.author) ? book.author[0] : book.author;
                    author = normalizeText(authorData && (authorData.name || authorData));
                    if (title) break;
                }
            } catch (e) {}
        }

        if (!title) {
            const titleElement = document.querySelector('h1');
            title = normalizeText(titleElement && titleElement.textContent);
        }
        if (!author) {
            const authorElement = document.querySelector('a[href^="/authors/"], a[href^="/author/"]');
            author = normalizeText(authorElement && authorElement.textContent);
        }

        const target = document.querySelector('.book-page-actions, .book-actions, [class*="BookActions"], main');
        return { title, author, target, site: 'storygraph' };
    }

    function createSearchButton(label, query, site, secondary = false) {
        const link = document.createElement('a');
        link.href = buildMamSearchUrl(query);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = label;
        link.title = `Search MyAnonamouse for: ${normalizeText(query)}`;

        if (site === 'goodreads') {
            link.className = 'Button Button--secondary Button--medium Button--block';
            Object.assign(link.style, {
                textDecoration: 'none',
                boxSizing: 'border-box'
            });
            const wrapper = document.createElement('div');
            wrapper.className = 'BookActions__button';
            wrapper.appendChild(link);
            return wrapper;
        } else {
            Object.assign(link.style, {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '34px',
                padding: '0 12px',
                border: '1px solid #285c45',
                borderRadius: '6px',
                background: secondary ? '#ffffff' : '#356f55',
                color: secondary ? '#285c45' : '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                lineHeight: '1.2',
                textDecoration: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box'
            });
            return link;
        }
    }

    function fetchTorrentCount(query, callback) {
        const searchUrl = `https://www.myanonamouse.net/tor/search.php?com[text]=${encodeURIComponent(query)}&com[searchIn][]=title&com[searchIn][]=author`;
        if (typeof GM_xmlhttpRequest === 'undefined') {
            callback(null);
            return;
        }
        GM_xmlhttpRequest({
            method: 'GET',
            url: searchUrl,
            onload: function(response) {
                try {
                    if (response.responseText.includes('login') || response.responseText.includes('Forgot password')) {
                        callback(null);
                        return;
                    }
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    const results = doc.querySelectorAll('#ssr tr[id^="tdr"]');
                    callback(results.length);
                } catch (e) {
                    console.debug('[MAM+] Error parsing search count:', e);
                    callback(null);
                }
            },
            onerror: function() {
                callback(null);
            }
        });
    }

    function updateButtonWithCount(button, query) {
        fetchTorrentCount(query, (count) => {
            if (count === null) return;
            const labelItem = button.querySelector('.Button__labelItem') || button;
            const originalLabel = labelItem.textContent.split(' (')[0];
            if (count > 0) {
                labelItem.textContent = `${originalLabel} (${count} trouvés)`;
                button.style.borderColor = '#10b981';
                button.style.color = '#10b981';
            } else {
                labelItem.textContent = `${originalLabel} (aucun résultat)`;
                button.style.opacity = '0.6';
            }
        });
    }

    function handleGoodreadsShelf() {
        if (document.getElementById('mam-shelf-check-all-btn')) return;

        const table = document.querySelector('#booksBody');
        if (!table) return;

        const controls = document.querySelector('#controls, #header, .leftContainer');
        if (controls) {
            const checkAllBtn = document.createElement('button');
            checkAllBtn.id = 'mam-shelf-check-all-btn';
            checkAllBtn.textContent = '🔎 Vérifier la disponibilité de tous les livres sur MAM';
            Object.assign(checkAllBtn.style, {
                margin: '10px 0',
                padding: '8px 16px',
                background: '#52766c',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
            });

            checkAllBtn.addEventListener('click', () => {
                checkAllBtn.disabled = true;
                checkAllBtn.textContent = 'Verification en cours...';
                checkAllBooks(checkAllBtn);
            });

            controls.appendChild(checkAllBtn);
        }

        const rows = document.querySelectorAll('#booksBody tr.bookvalue, #booksBody tr.review');
        rows.forEach(row => {
            const titleEl = row.querySelector('.field.title .value a, .title a, a[href*="/book/show/"]');
            if (!titleEl || row.querySelector('.mam-shelf-check')) return;

            const title = titleEl.textContent.replace(/\(.*?\)/g, '').trim();
            const authorEl = row.querySelector('.field.author .value a, .author a, a[href*="/author/show/"]');
            const author = authorEl ? authorEl.textContent.trim() : '';

            const checkSpan = document.createElement('span');
            checkSpan.className = 'mam-shelf-check';
            checkSpan.textContent = ' [🔎 Check MAM]';
            Object.assign(checkSpan.style, {
                fontSize: '11px',
                color: '#52766c',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginLeft: '6px'
            });

            const query = `${title} ${author}`;
            checkSpan.addEventListener('click', () => {
                checkSpan.textContent = ' [Vérification...]';
                checkSingleBookOnShelf(checkSpan, query);
            });

            const targetCell = row.querySelector('.field.title .value, .title');
            if (targetCell) {
                targetCell.appendChild(checkSpan);
            } else {
                titleEl.parentNode.appendChild(checkSpan);
            }
        });
    }

    function checkSingleBookOnShelf(span, query) {
        fetchTorrentCount(query, (count) => {
            if (count === null) {
                span.textContent = ' [MAM: Inconnu]';
                span.style.color = '#8b969b';
                return;
            }
            if (count > 0) {
                const searchUrl = `https://www.myanonamouse.net/tor/search.php?com[text]=${encodeURIComponent(query)}&com[searchIn][]=title&com[searchIn][]=author`;
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: searchUrl,
                    onload: function(response) {
                        let hasEpub = false;
                        let hasM4b = false;
                        try {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(response.responseText, 'text/html');
                            const results = doc.querySelectorAll('#ssr tr[id^="tdr"]');
                            results.forEach(r => {
                                const txt = r.textContent.toLowerCase();
                                if (txt.includes('epub')) hasEpub = true;
                                if (txt.includes('m4b') || txt.includes('audiobook') || txt.includes('m4a')) hasM4b = true;
                            });
                        } catch(e){}

                        span.innerHTML = '';
                        const link = document.createElement('a');
                        link.href = buildMamSearchUrl(query);
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.style.textDecoration = 'none';
                        link.style.fontWeight = 'bold';

                        if (hasEpub && hasM4b) {
                            link.textContent = ' [🟢 EPUB & M4B]';
                            link.style.color = '#507b67';
                        } else if (hasEpub) {
                            link.textContent = ' [🟢 EPUB]';
                            link.style.color = '#507b67';
                        } else if (hasM4b) {
                            link.textContent = ' [🟢 M4B]';
                            link.style.color = '#507b67';
                        } else {
                            link.textContent = ` [🟢 MAM (${count})]`;
                            link.style.color = '#507b67';
                        }
                        span.appendChild(link);
                    }
                });
            } else {
                span.textContent = ' [🔴 Aucun]';
                span.style.color = '#b96060';
            }
        });
    }

    function checkAllBooks(btn) {
        const spans = Array.from(document.querySelectorAll('.mam-shelf-check'));
        let index = 0;

        function next() {
            if (index >= spans.length) {
                btn.textContent = 'Vérification terminée !';
                return;
            }
            const span = spans[index];
            const row = span.closest('tr');
            const titleEl = row ? row.querySelector('.field.title .value a, .title a, a[href*="/book/show/"]') : null;
            if (titleEl) {
                const title = titleEl.textContent.replace(/\(.*?\)/g, '').trim();
                const authorEl = row.querySelector('.field.author .value a, .author a, a[href*="/author/show/"]');
                const author = authorEl ? authorEl.textContent.trim() : '';
                span.textContent = ' [Vérification...]';
                checkSingleBookOnShelf(span, `${title} ${author}`);
            }
            index++;
            btn.textContent = `Vérification : ${index} / ${spans.length}`;
            setTimeout(next, 600);
        }

        next();
    }

    function addButtons(book) {
        if (!book || !book.title) {
            return false;
        }
        console.debug('[MAM+] addButtons check: title =', book.title, 'target =', book.target);

        const existing = document.getElementById(CONTAINER_ID);
        if (existing) {
            if (book.target && existing.parentNode !== book.target) {
                console.info('[MAM+] Relocating search buttons to correct target:', book.target);
                if (book.site === 'goodreads') {
                    const secondButton = book.target.children[1];
                    if (secondButton) {
                        book.target.insertBefore(existing, secondButton);
                    } else {
                        book.target.appendChild(existing);
                    }
                } else {
                    book.target.appendChild(existing);
                }
                return true;
            }
            return false;
        }

        if (!book.target) {
            return false;
        }

        const container = document.createElement('div');
        container.id = CONTAINER_ID;
        container.dataset.site = book.site;

        if (book.site === 'goodreads') {
            Object.assign(container.style, {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
                marginTop: '8px',
                marginBottom: '8px'
            });
        } else {
            Object.assign(container.style, {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                width: '100%',
                margin: '10px 0 4px'
            });
        }

        if (book.author) {
            const btn = createSearchButton('🔎 Rechercher sur MAM (Titre + Auteur)', `${book.title} ${book.author}`, book.site);
            container.appendChild(btn);
            updateButtonWithCount(btn.querySelector('a') || btn, `${book.title} ${book.author}`);
        }

        const btnTitle = createSearchButton('🔎 Rechercher sur MAM (Titre seul)', book.title, book.site, Boolean(book.author));
        container.appendChild(btnTitle);
        updateButtonWithCount(btnTitle.querySelector('a') || btnTitle, book.title);

        if (book.site === 'goodreads') {
            const secondButton = book.target.children[1];
            if (secondButton) {
                book.target.insertBefore(container, secondButton);
            } else {
                book.target.appendChild(container);
            }
        } else {
            book.target.appendChild(container);
        }

        console.info(`[MAM+] Added ${book.site} → MAM search buttons.`, book.title, book.author);
        return true;
    }

    function tryInstall() {
        const host = window.location.hostname.toLowerCase();
        const path = window.location.pathname.toLowerCase();

        if (host.includes('goodreads.com')) {
            if (path.includes('/review/list')) {
                handleGoodreadsShelf();
                return true;
            }
            return addButtons(readGoodreadsBook());
        }

        if (host.includes('babelio.com')) {
            return addButtons(readBabelioBook());
        }

        if (host.includes('thestorygraph.com')) {
            return addButtons(readStoryGraphBook());
        }

        if (host.includes('amazon.')) {
            if (!document.querySelector('#productTitle')) return false;
            return addButtons(readAmazonBook());
        }

        return false;
    }

    function start() {
        tryInstall();

        const root = document.documentElement;
        if (!root) {
            setTimeout(start, 50);
            return;
        }

        const observer = new MutationObserver(() => {
            tryInstall();
        });

        observer.observe(root, { childList: true, subtree: true });
    }

    start();
}

runExternalMamSearch();
