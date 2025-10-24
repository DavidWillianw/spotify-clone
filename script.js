document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM Content Loaded. Starting script..."); // DEBUG

    // --- VARIÁVEIS GLOBAIS ---
    let db = { artists: [], albums: [], singles: [], songs: [], players: [] };
    let currentPlayer = null;
    let albumTracklistSortable = null;
    let activeArtist = null;
    let currentFeatTarget = null;
    let viewHistory = [];
    let editingTrackItem = null;
    // Dados charts anteriores
    let previousMusicChartData = {};
    let previousAlbumChartData = {};
    let previousRpgChartData = {};
    let albumCountdownInterval = null;
    // Novas variáveis para form de single
    let launchExistingTrackCheck, newTrackInfoGroup, existingTrackGroup, existingTrackSelect;

    // --- ELEMENTOS DO DOM ---
    // Declared globally, assigned in initializeDOMElements
    let allViews, searchInput, studioView, loginPrompt, loggedInInfo, playerSelect,
        loginButton, logoutButton, studioLaunchWrapper, studioTabs, studioForms,
        newSingleForm, singleArtistSelect, singleReleaseDateInput, singleFeatList,
        newAlbumForm, albumArtistSelect, albumReleaseDateInput,
        albumTracklistEditor,
        featModal, featArtistSelect,
        featTypeSelect, confirmFeatBtn, cancelFeatBtn,
        trackTypeModal, trackTypeSelect, confirmTrackTypeBtn, cancelTrackTypeBtn,
        albumTrackModal, albumTrackModalTitle, openAddTrackModalBtn,
        albumTrackNameInput, albumTrackDurationInput, albumTrackTypeSelect,
        albumTrackFeatList, saveAlbumTrackBtn, cancelAlbumTrackBtn, editingTrackItemId,
        inlineFeatAdder, inlineFeatArtistSelect, inlineFeatTypeSelect,
        confirmInlineFeatBtn, cancelInlineFeatBtn, addInlineFeatBtn,
        trackNameInput, trackDurationInput; // Renomeados (form single)

    const AIRTABLE_BASE_ID = 'appG5NOoblUmtSMVI';
    const AIRTABLE_API_KEY = 'pat5T28kjmJ4t6TQG.69bf34509e687fff6a3f76bd52e64518d6c92be8b1ee0a53bcc9f50fedcb5c70'; // Certifique-se que esta chave ainda é válida

    const PREVIOUS_MUSIC_CHART_KEY = 'spotifyRpg_previousMusicChart';
    const PREVIOUS_ALBUM_CHART_KEY = 'spotifyRpg_previousAlbumChart';
    const PREVIOUS_RPG_CHART_KEY = 'spotifyRpg_previousRpgChart';

    // --- FUNÇÃO PARA INICIALIZAR ELEMENTOS DO DOM ---
    function initializeDOMElements() {
        console.log("DEBUG: Running initializeDOMElements...");
        try {
            allViews = document.querySelectorAll('.page-view');
            searchInput = document.getElementById('searchInput');
            studioView = document.getElementById('studioView');
            loginPrompt = document.getElementById('loginPrompt');
            loggedInInfo = document.getElementById('loggedInInfo');
            playerSelect = document.getElementById('playerSelect');
            loginButton = document.getElementById('loginButton');
            logoutButton = document.getElementById('logoutButton');
            studioLaunchWrapper = document.getElementById('studioLaunchWrapper');
            studioTabs = document.querySelectorAll('.studio-tab-btn');
            studioForms = document.querySelectorAll('.studio-form-content');
            newSingleForm = document.getElementById('newSingleForm');
            singleArtistSelect = document.getElementById('singleArtistSelect');
            singleReleaseDateInput = document.getElementById('singleReleaseDate');
            singleFeatList = document.getElementById('singleFeatList');
            newAlbumForm = document.getElementById('newAlbumForm');
            albumArtistSelect = document.getElementById('albumArtistSelect');
            albumReleaseDateInput = document.getElementById('albumReleaseDate');
            albumTracklistEditor = document.getElementById('albumTracklistEditor');

            featModal = document.getElementById('featModal');
            featArtistSelect = document.getElementById('featArtistSelect');
            featTypeSelect = document.getElementById('featTypeSelect');
            confirmFeatBtn = document.getElementById('confirmFeatBtn');
            cancelFeatBtn = document.getElementById('cancelFeatBtn');

            trackTypeModal = document.getElementById('trackTypeModal');
            trackTypeSelect = document.getElementById('trackTypeSelect');
            confirmTrackTypeBtn = document.getElementById('confirmTrackTypeBtn');
            cancelTrackTypeBtn = document.getElementById('cancelTrackTypeBtn');

            albumTrackModal = document.getElementById('albumTrackModal');
            albumTrackModalTitle = document.getElementById('albumTrackModalTitle');
            openAddTrackModalBtn = document.getElementById('openAddTrackModalBtn');
            albumTrackNameInput = document.getElementById('albumTrackNameInput');
            albumTrackDurationInput = document.getElementById('albumTrackDurationInput');
            albumTrackTypeSelect = document.getElementById('albumTrackTypeSelect');
            albumTrackFeatList = document.getElementById('albumTrackFeatList');
            saveAlbumTrackBtn = document.getElementById('saveAlbumTrackBtn');
            cancelAlbumTrackBtn = document.getElementById('cancelAlbumTrackBtn');
            editingTrackItemId = document.getElementById('editingTrackItemId');

            inlineFeatAdder = document.getElementById('inlineFeatAdder');
            inlineFeatArtistSelect = document.getElementById('inlineFeatArtistSelect');
            inlineFeatTypeSelect = document.getElementById('inlineFeatTypeSelect');
            confirmInlineFeatBtn = document.getElementById('confirmInlineFeatBtn');
            cancelInlineFeatBtn = document.getElementById('cancelInlineFeatBtn');
             // addInlineFeatBtn precisa ser pego dentro de initializeStudio OU aqui APÓS albumTrackModal ser definido
             if (albumTrackModal) {
                 addInlineFeatBtn = albumTrackModal.querySelector('.add-inline-feat-btn');
             }

            // Inputs renomeados do form single para nova faixa
            trackNameInput = document.getElementById('trackName');
            trackDurationInput = document.getElementById('trackDuration');

            // Novos elementos do form single para faixa existente
            launchExistingTrackCheck = document.getElementById('launchExistingTrackCheck');
            newTrackInfoGroup = document.getElementById('newTrackInfoGroup');
            existingTrackGroup = document.getElementById('existingTrackGroup');
            existingTrackSelect = document.getElementById('existingTrackSelect');

            const essentialElements = [
                allViews, searchInput, studioView, loginPrompt, loggedInInfo, playerSelect, loginButton, logoutButton,
                studioLaunchWrapper, studioTabs, studioForms, newSingleForm, singleArtistSelect, singleReleaseDateInput,
                singleFeatList, newAlbumForm, albumArtistSelect, albumReleaseDateInput, albumTracklistEditor, featModal,
                featArtistSelect, featTypeSelect, confirmFeatBtn, cancelFeatBtn, trackTypeModal, trackTypeSelect,
                confirmTrackTypeBtn, cancelTrackTypeBtn, albumTrackModal, albumTrackModalTitle, openAddTrackModalBtn,
                albumTrackNameInput, albumTrackDurationInput, albumTrackTypeSelect, albumTrackFeatList, saveAlbumTrackBtn,
                cancelAlbumTrackBtn, editingTrackItemId, inlineFeatAdder, inlineFeatArtistSelect, inlineFeatTypeSelect,
                confirmInlineFeatBtn, cancelInlineFeatBtn, addInlineFeatBtn, // addInlineFeatBtn pode ser null aqui se albumTrackModal não foi achado
                // Novos
                trackNameInput, trackDurationInput, launchExistingTrackCheck, newTrackInfoGroup, existingTrackGroup, existingTrackSelect
            ];

            // Verifica se todos os elementos essenciais foram encontrados
            if (essentialElements.some(el => el === null || el === undefined || (el instanceof NodeList && el.length === 0)) || !allViews || allViews.length === 0 ) {
                 const missing = essentialElements.map((el, index) => {
                     const names = ["allViews", "searchInput", "studioView", "loginPrompt", "loggedInInfo", "playerSelect", "loginButton", "logoutButton", "studioLaunchWrapper", "studioTabs", "studioForms", "newSingleForm", "singleArtistSelect", "singleReleaseDateInput", "singleFeatList", "newAlbumForm", "albumArtistSelect", "albumReleaseDateInput", "albumTracklistEditor", "featModal", "featArtistSelect", "featTypeSelect", "confirmFeatBtn", "cancelFeatBtn", "trackTypeModal", "trackTypeSelect", "confirmTrackTypeBtn", "cancelTrackTypeBtn", "albumTrackModal", "albumTrackModalTitle", "openAddTrackModalBtn", "albumTrackNameInput", "albumTrackDurationInput", "albumTrackTypeSelect", "albumTrackFeatList", "saveAlbumTrackBtn", "cancelAlbumTrackBtn", "editingTrackItemId", "inlineFeatAdder", "inlineFeatArtistSelect", "inlineFeatTypeSelect", "confirmInlineFeatBtn", "cancelInlineFeatBtn", "addInlineFeatBtn", "trackNameInput", "trackDurationInput", "launchExistingTrackCheck", "newTrackInfoGroup", "existingTrackGroup", "existingTrackSelect"];
                     let elValue = el;
                     if(el instanceof NodeList) elValue = el.length > 0 ? el : null;
                     return elValue ? null : `Element ${names[index] || 'index ' + index}`;
                 }).filter(Boolean);

                 console.error("ERRO CRÍTICO: Elementos essenciais do HTML não foram encontrados!", { missing });
                 document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Interface</h1><p>Elementos essenciais não encontrados: ' + missing.join(', ') + '. Ver console.</p></div>';
                 return false;
            }

            const today = new Date().toISOString().split('T')[0];
            singleReleaseDateInput.value = today;
            albumReleaseDateInput.value = today;

            console.log("DEBUG: initializeDOMElements successful.");
            return true;
        } catch (error) {
             console.error("Erro CRÍTICO dentro de initializeDOMElements:", error);
             document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Interface</h1><p>Erro inesperado ao buscar elementos. Ver console.</p></div>';
             return false;
        }
    }


    // --- 1. CARREGAMENTO DE DADOS ---
    // *** MODIFICADO com logs de debug ***
    async function fetchAllAirtablePages(baseUrl, fetchOptions, tableNameForDebug = "Unknown") { // Added tableNameForDebug
        let allRecords = [];
        let offset = null;
        console.log(`DEBUG fetchAll: Starting fetch for ${tableNameForDebug}... Base URL: ${baseUrl}`); // DEBUG
        try {
            do {
                const sep = baseUrl.includes('?') ? '&' : '?';
                const url = offset ? `${baseUrl}${sep}offset=${offset}` : baseUrl;
                // console.log(`DEBUG fetchAll: Fetching page for ${tableNameForDebug}... URL: ${url}`); // Optional: Log each page fetch
                const res = await fetch(url, fetchOptions);
                if (!res.ok) {
                    const errorBody = await res.text();
                    console.error(`DEBUG fetchAll: FAILED fetch for ${tableNameForDebug}. Status: ${res.status}. URL: ${url}. Response: ${errorBody}`); // DEBUG
                    // Throw a more informative error
                    throw new Error(`Fetch failed for table ${tableNameForDebug}. Status: ${res.status}. Response: ${errorBody}`);
                }
                const data = await res.json();
                if (data.records) {
                    allRecords.push(...data.records);
                }
                offset = data.offset;
            } while (offset);
            console.log(`DEBUG fetchAll: Successfully fetched ${allRecords.length} records for ${tableNameForDebug}.`); // DEBUG
            return { records: allRecords };
        } catch (error) {
            console.error(`DEBUG fetchAll: CRITICAL error during fetch for ${tableNameForDebug}:`, error); // DEBUG
            throw error; // Re-throw the error so Promise.all catches it
        }
    }

    // *** MODIFICADO com logs de debug e tratamento de erro ***
    async function loadAllData() {
        const artistsURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Artists?filterByFormula=%7BArtista%20Principal%7D%3D1`;
        const albumsURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Álbuns')}`;
        const musicasURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Músicas')}`;
        const singlesURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Singles e EPs')}`;
        const playersURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Jogadores`;

        const fetchOptions = { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } };
        console.log("DEBUG loadAllData: Starting data loading..."); // DEBUG
        try {
            console.log("DEBUG loadAllData: Initiating Promise.all..."); // DEBUG
            const [artistsData, albumsData, musicasData, singlesData, playersData] = await Promise.all([
                fetchAllAirtablePages(artistsURL, fetchOptions, "Artists"),
                fetchAllAirtablePages(albumsURL, fetchOptions, "Álbuns"),
                fetchAllAirtablePages(musicasURL, fetchOptions, "Músicas"),
                fetchAllAirtablePages(singlesURL, fetchOptions, "Singles e EPs"),
                fetchAllAirtablePages(playersURL, fetchOptions, "Jogadores")
            ]);
            console.log("DEBUG loadAllData: Promise.all finished successfully."); // DEBUG

            // --- Processamento de dados (copiado da sua versão anterior) ---
            const musicasMap = new Map();
            (musicasData.records || []).forEach(r => {
                const artistIds = Array.isArray(r.fields['Artista']) ? r.fields['Artista'] : [r.fields['Artista']].filter(Boolean);
                const pId = (r.fields['Álbuns']?.[0]) || (r.fields['Singles e EPs']?.[0]) || null;
                musicasMap.set(r.id, {
                    id: r.id, title: r.fields['Nome da Faixa']||'?',
                    duration: r.fields['Duração']?new Date(r.fields['Duração']*1000).toISOString().substr(14,5):"0:00",
                    trackNumber: r.fields['Nº da Faixa']||0, durationSeconds: r.fields['Duração']||0,
                    artistIds: artistIds, collabType: r.fields['Tipo de Colaboração'], albumId: pId,
                    streams: r.fields.Streams||0, totalStreams: r.fields['Streams Totais']||0,
                    trackType: r.fields['Tipo de Faixa'] || 'Album Track'
                });
            });

            const artistsMapById = new Map();
            const artistsList = (artistsData.records || []).map(r => {
                const a = {
                    id: r.id, name: r.fields.Name||'?',
                    imageUrl: (r.fields['URL da Imagem']?.[0]?.url) || 'https://i.imgur.com/AD3MbBi.png',
                    off: r.fields['Inspirações (Off)']||[], RPGPoints: r.fields.RPGPoints||0, LastActive: r.fields.LastActive||null
                };
                artistsMapById.set(a.id, a.name); return a;
            });

            const formatReleases = (records, isAlbum) => {
                if (!records) return [];
                return records.map(r => {
                    const f=r.fields; const id=r.id;
                    const tracks = Array.from(musicasMap.values()).filter(s => s.albumId===id).sort((a,b)=>(a.trackNumber||0)-(b.trackNumber||0));
                    const dur = tracks.reduce((t, tr) => t+(tr.durationSeconds||0), 0);
                    const totalAlbumStreams = tracks.reduce((t, tr) => t + (tr.totalStreams || 0), 0);
                    const artId = Array.isArray(f['Artista']) ? f['Artista'][0] : (f['Artista']||null);
                    const artName = artId ? artistsMapById.get(artId) : "?";
                    const imgF = isAlbum?'Capa do Álbum':'Capa';
                    const imgUrl = (f[imgF]?.[0]?.url)||'https://i.imgur.com/AD3MbBi.png';
                    return {
                        id: id, title: f['Nome do Álbum']||f['Nome do Single/EP']||'?',
                        artist: artName, artistId: artId, metascore: f['Metascore']||0, imageUrl: imgUrl,
                        releaseDate: f['Data de Lançamento']||'?', tracks: tracks, totalDurationSeconds: dur,
                        weeklyStreams: f['Stream do album'] || 0, totalStreams: totalAlbumStreams
                    };
                });
            };

            const formattedAlbums = formatReleases(albumsData.records, true);
            const formattedSingles = formatReleases(singlesData.records, false);
            const formattedPlayers = (playersData?.records || []).map(r => ({ id: r.id, name: r.fields.Nome, artists: r.fields.Artistas || [] }));
            // --- Fim do Processamento ---

            console.log("DEBUG loadAllData: Data processing finished."); // DEBUG
            return {
                allArtists: artistsList, albums: formattedAlbums, singles: formattedSingles,
                players: formattedPlayers, musicas: Array.from(musicasMap.values())
            };

        } catch (error) {
            // Este catch agora recebe o erro detalhado de fetchAllAirtablePages
            console.error("DEBUG loadAllData: CRITICAL error during Promise.all or data processing:", error.message); // DEBUG
            // Mostra erro na tela para o usuário
            document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Carregamento</h1><p>Falha ao buscar dados: ${error.message}. Verifique o console para detalhes técnicos (Status, Response).</p></div>`;
            return null; // Indica falha
        }
    }

    const initializeData = (data) => {
        console.log("DEBUG: Running initializeData..."); // DEBUG
        try {
            try { // Carrega dados de charts anteriores
                const prevMusic = localStorage.getItem(PREVIOUS_MUSIC_CHART_KEY); previousMusicChartData = prevMusic ? JSON.parse(prevMusic) : {};
                const prevAlbum = localStorage.getItem(PREVIOUS_ALBUM_CHART_KEY); previousAlbumChartData = prevAlbum ? JSON.parse(prevAlbum) : {};
                const prevRpg = localStorage.getItem(PREVIOUS_RPG_CHART_KEY); previousRpgChartData = prevRpg ? JSON.parse(prevRpg) : {};
                console.log("DEBUG initializeData: Previous chart data loaded."); // DEBUG
            } catch (e) { console.error("DEBUG initializeData: Error loading previous chart data:", e); previousMusicChartData = {}; previousAlbumChartData = {}; previousRpgChartData = {}; }

            const artistsMapById = new Map();
            db.artists = (data.allArtists || []).map(artist => {
                const artistEntry = { ...artist, img: artist.imageUrl || 'https://i.imgur.com/AD3MbBi.png', albums: [], singles: [] };
                artistsMapById.set(artist.id, artist.name); return artistEntry;
            });

            const releaseDateMap = new Map();
            const allReleasesForDateMap = [...(data.albums || []), ...(data.singles || [])];
            allReleasesForDateMap.forEach(item => { releaseDateMap.set(item.id, item.releaseDate); });

            db.songs = (data.musicas || []).map(song => ({
                ...song, streams: song.streams || 0, totalStreams: song.totalStreams || 0,
                cover: 'https://i.imgur.com/AD3MbBi.png', artist: artistsMapById.get((song.artistIds || [])[0]) || '?',
                parentReleaseDate: releaseDateMap.get(song.albumId) || null
            }));

            db.albums = []; db.singles = [];
            const allReleases = [...(data.albums || []), ...(data.singles || [])];
            const thirtyMinSec = 30 * 60;

            allReleases.forEach(item => {
                (item.tracks || []).forEach(tInfo => {
                    const s = db.songs.find(sDb => sDb.id === tInfo.id);
                    if (s) { s.cover = item.imageUrl; } else { console.warn(`DEBUG initializeData: Song ${tInfo.id} not found.`); }
                });
                const artistEntry = db.artists.find(a => a.id === item.artistId);
                if ((item.totalDurationSeconds || 0) >= thirtyMinSec) {
                    db.albums.push(item); if (artistEntry) { artistEntry.albums.push(item); }
                } else {
                    db.singles.push(item); if (artistEntry) { artistEntry.singles.push(item); }
                }
                if (!artistEntry && item.artist !== "?") { console.warn(`DEBUG initializeData: Artist ${item.artist} (ID: ${item.artistId}) not found for release ${item.title}.`); }
            });

            db.players = data.players || [];

            console.log(`DEBUG initializeData: DB Init - A${db.artists.length}, B${db.albums.length}, S${db.singles.length}, M${db.songs.length}, P${db.players.length}`); // DEBUG
            return true;
        } catch (error) {
            console.error("DEBUG initializeData: CRITICAL error:", error); // DEBUG
            alert("Erro GRAVE ao inicializar dados internos. Verifique o console.");
            return false;
        }
    };

    const saveChartDataToLocalStorage = (chartType) => { /* ...código inalterado... */ };
    async function refreshAllData() { /* ...código inalterado... */ }
    const switchView = (viewId, targetSectionId=null) => { /* ...código inalterado... */ };
    const switchTab = (event, forceTabId=null) => { /* ...código inalterado... */ };
    const handleBack = () => { /* ...código inalterado... */ };
    const renderArtistsGrid = (containerId, artists) => { /* ...código inalterado... */ };
    function formatArtistString(artistIds, collabType) { /* ...código inalterado... */ }
    function getCoverUrl(albumId) { /* ...código inalterado... */ }
    const renderChart = (type) => { /* ...código inalterado... */ };
    const openArtistDetail = (artistName) => { /* ...código inalterado... */ };
    const openAlbumDetail = (albumId) => { /* ...código inalterado... */ };
    const openDiscographyDetail = (type) => { /* ...código inalterado... */ };
    const handleSearch = () => { /* ...código inalterado... */ };
    const setupCountdown = (timerId, chartType) => { /* ...código inalterado... */ };
    function startAlbumCountdown(targetDateISO, containerId) { /* ...código inalterado... */ }
    const CHART_TOP_N = 20; const STREAMS_PER_POINT = 10000; const calculateSimulatedStreams = (points, lastActiveISO) => { /* ...código inalterado... */ }; const computeChartData = (artistsArray) => { /* ...código inalterado... */ }; function renderRPGChart() { /* ...código inalterado... */ }
    function populateExistingTrackSelect(artistId) { /* ...código inalterado... */ }
    function handleExistingTrackToggle() { /* ...código inalterado... */ }
    function initializeStudio() { /* ...código inalterado... */ }
    function populateArtistSelector(playerId) { /* ...código inalterado... */ }
    function loginPlayer(playerId) { /* ...código inalterado... */ }
    function logoutPlayer() { /* ...código inalterado... */ }
    function populateArtistSelectForFeat(targetSelectElement) { /* ...código inalterado... */ }
    function openFeatModal(buttonElement) { /* ...código inalterado... */ }
    function closeFeatModal() { /* ...código inalterado... */ }
    function confirmFeat() { /* ...código inalterado... */ }
    function toggleInlineFeatAdder() { /* ...código inalterado... */ }
    function confirmInlineFeat() { /* ...código inalterado... */ }
    function cancelInlineFeat() { /* ...código inalterado... */ }
    function openAlbumTrackModal(itemToEdit=null) { /* ...código inalterado... */ }
    function closeAlbumTrackModal() { /* ...código inalterado... */ }
    function saveAlbumTrack() { /* ...código inalterado... */ }
    function updateTrackNumbers() { /* ...código inalterado... */ }
    async function createAirtableRecord(tableName, fields) { /* ...código inalterado... */ }
    async function updateAirtableRecord(tableName, recordId, fields) { /* ...código inalterado... */ }
    function parseDurationToSeconds(durationStr) { /* ...código inalterado... */ }
    async function handleSingleSubmit(event) { /* ...código inalterado... */ }
    async function processSingleSubmission(trackType) { /* ...código inalterado... */ }
    async function processExistingSingleSubmission(existingTrackId) { /* ...código inalterado... */ }
    function initAlbumForm() { /* ...código inalterado... */ }
    async function batchCreateAirtableRecords(tableName, records) { /* ...código inalterado... */ }
    async function handleAlbumSubmit(event) { /* ...código inalterado... */ }
    function initializeBodyClickListener() { /* ...código inalterado... */ }

    // --- 5. INICIALIZAÇÃO GERAL ---
    async function main() {
        console.log("DEBUG: Entering main function..."); // DEBUG
        if (!initializeDOMElements()) {
             console.error("DEBUG: initializeDOMElements failed. Exiting main."); // DEBUG
             return;
        }
        console.log("DEBUG: initializeDOMElements successful."); // DEBUG

        document.body.classList.add('loading');
        console.log("DEBUG: Starting data load..."); // DEBUG
        const data = await loadAllData();
        console.log("DEBUG: Data load finished.", data ? "Data received." : "Data load FAILED."); // DEBUG

        if (data && data.allArtists) { // Verifica se dados essenciais carregaram
            console.log("DEBUG: Data seems valid, initializing data structure..."); // DEBUG
            if (!initializeData(data)) { // Sai se a inicialização interna falhar
                console.error("DEBUG: initializeData failed. Exiting main."); // DEBUG
                document.body.classList.remove('loading'); return;
            }
            console.log("DEBUG: initializeData successful."); // DEBUG

            try {
                console.log("DEBUG: Entering UI setup block (try)..."); // DEBUG
                initializeStudio();
                console.log("DEBUG: initializeStudio finished."); // DEBUG

                if (newSingleForm) { newSingleForm.addEventListener('submit', handleSingleSubmit); console.log("DEBUG: Attached listener to newSingleForm."); } // DEBUG
                else { console.warn("DEBUG: newSingleForm not found for listener."); } // DEBUG
                if (newAlbumForm) { newAlbumForm.addEventListener('submit', handleAlbumSubmit); console.log("DEBUG: Attached listener to newAlbumForm."); } // DEBUG
                else { console.warn("DEBUG: newAlbumForm not found for listener."); } // DEBUG

                if (confirmTrackTypeBtn) { confirmTrackTypeBtn.addEventListener('click', () => { processSingleSubmission(trackTypeSelect.value); }); console.log("DEBUG: Attached listener to confirmTrackTypeBtn."); } // DEBUG
                else { console.warn("DEBUG: confirmTrackTypeBtn not found for listener."); } // DEBUG
                if (cancelTrackTypeBtn) { cancelTrackTypeBtn.addEventListener('click', () => {
                     trackTypeModal.classList.add('hidden');
                     const btn = document.getElementById('submitNewSingle');
                     if(btn) { btn.disabled = false; btn.textContent = 'Lançar Single';}
                 }); console.log("DEBUG: Attached listener to cancelTrackTypeBtn."); } // DEBUG
                else { console.warn("DEBUG: cancelTrackTypeBtn not found for listener."); } // DEBUG

                console.log("DEBUG: Rendering initial components..."); // DEBUG
                renderRPGChart();
                renderChart('music');
                renderChart('album');
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));
                console.log("DEBUG: Initial components rendered."); // DEBUG

                console.log("DEBUG: Setting up countdowns..."); // DEBUG
                setupCountdown('musicCountdownTimer', 'music');
                setupCountdown('albumCountdownTimer', 'album');
                console.log("DEBUG: Countdowns set up."); // DEBUG

                console.log("DEBUG: Attaching global listeners..."); // DEBUG
                initializeBodyClickListener();
                document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', handleBack));
                console.log("DEBUG: Global listeners attached."); // DEBUG

                console.log("DEBUG: Attaching tab listeners..."); // DEBUG
                const allNavs = [...document.querySelectorAll('.nav-tab'), ...document.querySelectorAll('.bottom-nav-item')];
                if(allNavs.length > 0){
                    allNavs.forEach(nav => { nav.removeEventListener('click', switchTab); nav.addEventListener('click', switchTab); });
                    console.log(`DEBUG: Attached listeners to ${allNavs.length} nav items.`); // DEBUG
                } else {
                    console.warn("DEBUG: No nav items found to attach listeners."); // DEBUG
                }


                console.log("DEBUG: Switching to initial tab..."); // DEBUG
                switchTab(null, 'homeSection');
                console.log("DEBUG: Application startup sequence finished successfully."); // DEBUG

            } catch (uiError) {
                console.error("DEBUG: Error during UI setup block (catch):", uiError); // DEBUG
                document.body.innerHTML = '<div style="color: white; padding: 20px;"><h1>Erro Interface</h1><p>Ocorreu um erro ao configurar a interface. Ver console.</p></div>';
            }
        } else {
            // Se loadAllData retornou null ou data.allArtists estava vazio
            if (!data) { // Se loadAllData falhou completamente (já mostrou erro na tela)
                 console.error("DEBUG: Initialization failed because loadAllData returned null.");
            } else { // Se loadAllData funcionou mas não retornou artistas
                 document.body.innerHTML = '<div style="color: white; padding: 20px;"><h1>Erro Crítico</h1><p>Não foi possível carregar os dados essenciais (Artistas). Verifique a base de dados.</p></div>';
                 console.error("DEBUG: Initialization failed: Data loaded but no artists found.");
            }
        }
        document.body.classList.remove('loading');
        console.log("DEBUG: Exiting main function."); // DEBUG
    }

    main(); // Inicia a aplicação

}); // Fim DOMContentLoaded
