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

        const target = document.querySelector('.BookActions') || document.querySelector('.BookPage__rightColumn');
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

    function addButtons(book) {
        if (!book || !book.title) {
            return false;
        }
        console.debug('[MAM+] addButtons check: title =', book.title, 'target =', book.target);

        const existing = document.getElementById(CONTAINER_ID);
        if (existing) {
            if (book.target && existing.parentNode !== book.target) {
                console.info('[MAM+] Relocating search buttons to correct target:', book.target);
                book.target.appendChild(existing);
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
                marginTop: '8px'
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
            container.appendChild(
                createSearchButton('🔎 Search MAM (Title + Author)', `${book.title} ${book.author}`, book.site)
            );
        }

        container.appendChild(
            createSearchButton('🔎 Search MAM (Title Only)', book.title, book.site, Boolean(book.author))
        );

        book.target.appendChild(container);
        console.info(`[MAM+] Added ${book.site} → MAM search buttons.`, book.title, book.author);
        return true;
    }

    function tryInstall() {
        const host = window.location.hostname.toLowerCase();

        if (host.includes('goodreads.com')) {
            return addButtons(readGoodreadsBook());
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
