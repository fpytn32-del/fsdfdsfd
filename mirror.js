(function () {
    'use strict';

    const GITHUB_BASE = "https://raw.githubusercontent.com/fpytn32-del/fsdfdsfd/main/";
    const ORIGIN_DOMAIN = "https://drgn21ney.casino";
    const TARGET_TITLE = "DragonMoney | Играть на деньги";
    const TARGET_ICON = "https://drgn21ney.casino/favicon.ico";

    const GAME_ALIASES = {
        "the dog house": "pragmatic/vs20doghouse",
        "sugar rush 1000": "pragmatic/vs20sugarrushx",
        "sweet bonanza": "pragmatic/vs20fruitsw",
        "gates of olympus": "pragmatic/vs20olympgate"
    };

    // =========================================================================
    // 🌀 ЛОГИКА ДЛЯ ОРИГИНАЛЬНОГО САЙТА (drgn21ney.casino)
    // =========================================================================
    if (window.location.hostname.includes("drgn21ney")) {
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (!target) return;

            const href = target.getAttribute('href');
            if (!href || !href.includes('/game/')) return; 

            try {
                const decodedHref = decodeURIComponent(href).toLowerCase();
                let streamPath = null;
                let githubId = null;

                for (let origName in GAME_ALIASES) {
                    if (decodedHref.includes(origName)) {
                        streamPath = "/play-game/" + GAME_ALIASES[origName];
                        githubId = GAME_ALIASES[origName].split('/').pop(); 
                        break;
                    }
                }

                if (streamPath && githubId) {
                    e.preventDefault(); e.stopPropagation();
                    
                    // Нативный сверхбыстрый запрос
                    fetch(GITHUB_BASE + githubId + ".html", { method: "HEAD" })
                        .then(res => {
                            if (res.ok) window.location.href = `https://stream.win${streamPath}`;
                            else window.location.href = href;
                        })
                        .catch(() => { window.location.href = href; });
                }
            } catch(err) {}
        }, true);
        return; 
    }

    // =========================================================================
    // 🎮 ЛОГИКА ДЛЯ stream.win 
    // =========================================================================

    const BASE_SCREEN_WIDTH = 1920; 
    const SLOT_WIDTH  = 1340;
    const SLOT_HEIGHT = 754;
    const SLOT_TOP    = 220;
    const SLOT_LEFT   = 328;

    let lastGameId = null;
    let designHtml = null;
    let slotInserted = false;
    let isCinemaMode = false;
    let initStarted = false;
    let preloaderRemoved = false;

    function enforceFakeTab() {
        const applyFakeTab = () => {
            if (document.title !== TARGET_TITLE) document.title = TARGET_TITLE;
            let foundCorrectIcon = false;
            document.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']").forEach(link => {
                if (link.href !== TARGET_ICON) link.remove(); 
                else foundCorrectIcon = true;
            });
            if (!foundCorrectIcon && document.head) {
                const link = document.createElement('link');
                link.rel = 'icon';
                link.href = TARGET_ICON;
                document.head.appendChild(link);
            }
        };

        applyFakeTab();
        const headObserver = new MutationObserver(() => applyFakeTab());
        const checkHead = setInterval(() => {
            if (document.head) {
                clearInterval(checkHead);
                headObserver.observe(document.head, { childList: true, subtree: true, characterData: true });
                setInterval(applyFakeTab, 500);
            }
        }, 10);
    }

    function showPreloader() {
        if (document.getElementById("dm-preloader")) return;
        const preloader = document.createElement("div");
        preloader.id = "dm-preloader";
        preloader.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:#161924; z-index:9999999; transition:opacity 0.4s ease, visibility 0.4s ease;";
        preloader.innerHTML = `
            <div id="LOADER_FOR_FCP" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:100">
                <style>@-webkit-keyframes spin{to{transform:rotate(1turn)}}@keyframes spin{to{transform:rotate(1turn)}}</style>
                <svg style="width:72px;height:72px;fill:#f2a100;animation:spin 1s linear infinite" class="animate-spin text-[72px] text-yellow" width="72" height="72" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12H22C22 17.5228 17.5228 22 12 22V20ZM4 12C4 7.58172 7.58172 4 12 4V2C6.47715 2 2 6.47715 2 12H4Z"></path>
                </svg>
            </div>
        `;
        const tryInsertLoader = setInterval(() => {
            if (document.body || document.documentElement) {
                (document.body || document.documentElement).appendChild(preloader);
                clearInterval(tryInsertLoader);
            }
        }, 10);
        setTimeout(hidePreloader, 4000);
    }

    function hidePreloader() {
        if (preloaderRemoved) return;
        preloaderRemoved = true;
        const preloader = document.getElementById("dm-preloader");
        if (preloader) {
            preloader.style.opacity = "0"; 
            preloader.style.visibility = "hidden"; 
            setTimeout(() => preloader.remove(), 500); 
        }
    }

    function getGameId() {
        const match = location.href.match(/\/play-game\/[^/]+\/([^/?#]+)/);
        return match ? match[1] : null;
    }

    function hideOriginalSite() {
        const lockStyle = document.createElement("style");
        lockStyle.innerHTML = `
            html, body { margin:0!important; padding:0!important; overflow:hidden!important; background:#161924!important; width:100vw!important; height:100vh!important; max-width:100vw!important; max-height:100vh!important; }
            body > *:not(#dm-wrapper):not(#dm-preloader) { display:none!important; }
            :fullscreen, :fullscreen *, :fullscreen body, :fullscreen html { scrollbar-width:none!important; overflow:hidden!important; }
            :fullscreen::-webkit-scrollbar, :fullscreen *::-webkit-scrollbar { display:none!important; width:0px!important; height:0px!important; background:transparent!important; }
            html.dm-is-fullscreen, body.dm-is-fullscreen { overflow:hidden!important; }
        `;
        const tryInsertStyle = setInterval(() => {
            if (document.head) {
                document.head.appendChild(lockStyle);
                clearInterval(tryInsertStyle);
            }
        }, 10);
    }

    function syncVh() {
        const dFrame = document.getElementById("dm-design-frame");
        if (dFrame && dFrame.contentWindow) {
            try {
                const doc = dFrame.contentDocument;
                const vh = window.innerHeight * 0.01;
                doc.documentElement.style.setProperty('--vh', `${vh}px`, 'important');
                doc.body.style.setProperty('--vh', `${vh}px`, 'important');
                doc.getElementById('app')?.style.setProperty('height', '100vh', 'important');
                doc.querySelector('#app > div')?.style.setProperty('height', '100vh', 'important');
            } catch (e) {}
        }
    }

    function applyDesign(html) {
        hideOriginalSite();
        document.getElementById("dm-wrapper")?.remove();

        const wrapper = document.createElement("div");
        wrapper.id = "dm-wrapper";
        wrapper.style.cssText = "position:fixed!important; top:0!important; left:0!important; width:100vw!important; height:100vh!important; z-index:9999!important; background:#161924!important; overflow:hidden!important;";

        const designFrame = document.createElement("iframe");
        designFrame.id = "dm-design-frame";
        designFrame.style.cssText = "position:absolute!important; top:0!important; left:0!important; width:100%!important; height:100%!important; border:none!important; z-index:1!important;";
        
        const slotContainer = document.createElement("div");
        slotContainer.id = "dm-slot-container";
        slotContainer.style.cssText = `position:fixed!important; top:${SLOT_TOP}px!important; left:${SLOT_LEFT}px!important; width:${SLOT_WIDTH}px!important; height:${SLOT_HEIGHT}px!important; z-index:99999!important; background:transparent!important; transform:translateY(0px)!important; transition:none!important; will-change:transform; overflow:hidden!important;`;

        wrapper.append(designFrame, slotContainer);
        document.body.appendChild(wrapper);

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        doc.querySelectorAll("script, iframe").forEach(e => e.remove());

        const styleFix = doc.createElement("style");
        styleFix.innerHTML = `
            body { background: #161924 !important; }
            .is-arrow, [class*="is-arrow"] { display: none !important; }
            [class*="balance"], [class*="amount"] { display: flex !important; align-items: center !important; }
            [class*="balance"] img, [class*="amount"] img { margin: auto 4px auto 0 !important; }
            main, #page-content-container { background: transparent !important; }
            a, button, [role="button"], .nav-control { cursor: pointer !important; }
            .provider-game-wrapper { opacity: 0 !important; pointer-events: none !important; display: block !important;}
            html.dm-hide-scrollbar, body.dm-hide-scrollbar, .dm-hide-scrollbar { overflow: hidden !important; scrollbar-width: none !important; }
            html.dm-hide-scrollbar *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        `;
        doc.head.appendChild(styleFix);

        const redirectScript = doc.createElement("script");
        redirectScript.textContent = `
            const TARGET_DOMAIN = "${ORIGIN_DOMAIN}";
            const SIDEBAR_LINKS = ["/", "/play-game/crash", "/play-game/double", "/play-game/nvuti-game", "/play-game/jackpot-game", "/play-game/tickets-game", "/play-game/plinko-game", "/wallet/deposit", "/bonuses", "/support"];

            document.addEventListener('click', function(e) {
                const target = e.target.closest('a, button, [role="button"], .nav-control');
                if (target) {
                    e.preventDefault(); e.stopPropagation();
                    const html = target.outerHTML.toLowerCase();
                    const text = target.textContent.toLowerCase();

                    if (html.includes('full') || html.includes('screen') || html.includes('expand')) {
                        window.parent.postMessage({ type: "TOGGLE_CINEMA" }, "*");
                        return;
                    }
                    if (text.includes('вернуться') || text.includes('назад') || html.includes('вернуться')) {
                        window.top.location.href = TARGET_DOMAIN + "/games/providers/list/categories"; return;
                    }
                    
                    let url = TARGET_DOMAIN;
                    const sidebar = document.querySelector('aside');
                    if (sidebar && sidebar.contains(target)) {
                        const idx = Array.from(sidebar.querySelectorAll('a, button, .nav-control')).indexOf(target);
                        url += SIDEBAR_LINKS[idx] || "/";
                    } else {
                        const href = target.getAttribute('href');
                        if (href && !href.startsWith('javascript')) url = href.startsWith('http') ? href : url + href;
                    }
                    window.top.location.href = url;
                }
            }, true);
        `;
        doc.body.appendChild(redirectScript);

        designFrame.contentWindow.document.open();
        designFrame.contentWindow.document.write(doc.documentElement.outerHTML);
        designFrame.contentWindow.document.close();
    }

    function findGameIframe() {
        return Array.from(document.querySelectorAll('iframe')).find(f => {
            const s = f.src || "";
            return s && s !== "about:blank" && !s.includes("google") && !s.includes("yandex") && !s.includes("analytics") && !s.includes("chat");
        });
    }

    function insertSlot() {
        if (slotInserted) return;
        const iframe = findGameIframe();
        if (!iframe) { setTimeout(insertSlot, 200); return; }

        slotInserted = true;
        applyDesign(designHtml);

        const slotContainer = document.getElementById("dm-slot-container");
        slotContainer.appendChild(iframe);
        iframe.style.cssText = "position:absolute!important; top:0!important; left:0!important; width:100.5%!important; height:100%!important; border:none!important; margin:0!important; padding:0!important; overflow:hidden!important;";
        
        const shield = document.createElement("div");
        shield.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; z-index:10000; background:transparent;";
        slotContainer.appendChild(shield);

        const updateScroll = () => {
            if (isCinemaMode) return;
            try {
                const doc = document.getElementById("dm-design-frame")?.contentDocument;
                const ghost = doc?.querySelector('.provider-game-wrapper'); 
                if (ghost) {
                    const rect = ghost.getBoundingClientRect();
                    slotContainer.style.setProperty("width", rect.width + "px", "important");
                    slotContainer.style.setProperty("height", rect.height + "px", "important");
                    slotContainer.style.setProperty("top", rect.top + "px", "important");
                    slotContainer.style.setProperty("left", rect.left + "px", "important");
                    slotContainer.style.setProperty("transform", "none", "important"); 
                }
            } catch(e) {}
            requestAnimationFrame(updateScroll); 
        };

        shield.addEventListener('wheel', (e) => {
            if (isCinemaMode) return;
            e.preventDefault();
            const scroller = document.getElementById("dm-design-frame")?.contentDocument?.querySelector('#page-content-container');
            if (scroller) scroller.scrollTop += e.deltaY;
        });

        shield.addEventListener('click', () => shield.style.display = 'none');
        slotContainer.addEventListener('mouseleave', () => { if (!isCinemaMode) shield.style.display = 'block'; });

        const dFrame = document.getElementById("dm-design-frame");
        dFrame.onload = () => {
            syncVh(); 
            requestAnimationFrame(updateScroll); 
            setTimeout(hidePreloader, 300);
        };
        
        window.addEventListener('resize', syncVh);

        window.addEventListener("message", (e) => {
            if (e.data?.type === "TOGGLE_CINEMA") {
                document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
            }
        });

        document.addEventListener("fullscreenchange", () => {
            isCinemaMode = !!document.fullscreenElement;
            document.documentElement.classList.toggle("dm-is-fullscreen", isCinemaMode);
            
            try { 
                const dDoc = dFrame.contentDocument;
                dDoc.documentElement.classList.toggle("dm-hide-scrollbar", isCinemaMode); 
                dDoc.body.classList.toggle("dm-hide-scrollbar", isCinemaMode); 
                dDoc.querySelector('#page-content-container')?.classList.toggle("dm-hide-scrollbar", isCinemaMode); 
            } catch(e){}

            if (isCinemaMode) {
                slotContainer.style.cssText += "top:0px!important; left:0px!important; width:100vw!important; height:100vh!important; transform:none!important;";
                dFrame.style.filter = "brightness(0.3)";
                shield.style.display = "none"; 
            } else {
                dFrame.style.filter = "none";
                shield.style.display = "block"; 
            }
        });
    }

    function loadDesign(gameId) {
        // Нативный Fetch API работает в разы быстрее и стабильнее
        fetch(GITHUB_BASE + gameId + ".html")
            .then(res => {
                if (!res.ok) throw new Error("Not found");
                return res.text();
            })
            .then(html => {
                designHtml = html;
                slotInserted = false;
                insertSlot();
            })
            .catch(() => hidePreloader());
    }

    function init() {
        if (initStarted) return;
        const gameId = getGameId();
        if (!gameId) return;

        initStarted = true;
        enforceFakeTab(); 
        showPreloader(); 

        if (gameId === lastGameId) return;
        lastGameId = gameId;
        designHtml = null;
        slotInserted = false;
        loadDesign(gameId);
    }

    enforceFakeTab(); 
    init();
    document.addEventListener("DOMContentLoaded", init);
    new MutationObserver(init).observe(document.documentElement, { childList: true, subtree: true });

})();
