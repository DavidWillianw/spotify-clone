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
            if (essentialElements.some(el => el === null || el === undefined || (el instanceof NodeList && el.length === 0)) || allViews.length === 0 ) {
                 const missing = essentialElements.map((el, index) => {
                     // Dando nomes para facilitar o debug
                     const names = ["allViews", "searchInput", "studioView", "loginPrompt", "loggedInInfo", "playerSelect", "loginButton", "logoutButton", "studioLaunchWrapper", "studioTabs", "studioForms", "newSingleForm", "singleArtistSelect", "singleReleaseDateInput", "singleFeatList", "newAlbumForm", "albumArtistSelect", "albumReleaseDateInput", "albumTracklistEditor", "featModal", "featArtistSelect", "featTypeSelect", "confirmFeatBtn", "cancelFeatBtn", "trackTypeModal", "trackTypeSelect", "confirmTrackTypeBtn", "cancelTrackTypeBtn", "albumTrackModal", "albumTrackModalTitle", "openAddTrackModalBtn", "albumTrackNameInput", "albumTrackDurationInput", "albumTrackTypeSelect", "albumTrackFeatList", "saveAlbumTrackBtn", "cancelAlbumTrackBtn", "editingTrackItemId", "inlineFeatAdder", "inlineFeatArtistSelect", "inlineFeatTypeSelect", "confirmInlineFeatBtn", "cancelInlineFeatBtn", "addInlineFeatBtn", "trackNameInput", "trackDurationInput", "launchExistingTrackCheck", "newTrackInfoGroup", "existingTrackGroup", "existingTrackSelect"];
                     let elValue = el;
                     if(el instanceof NodeList) elValue = el.length > 0 ? el : null; // Considera NodeList vazia como null para a checagem
                     return elValue ? null : `Element ${names[index] || 'index ' + index}`;
                 }).filter(Boolean);

                 console.error("ERRO CRÍTICO: Elementos essenciais do HTML não foram encontrados!", { missing });
                 document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Interface</h1><p>Elementos essenciais não encontrados: ' + missing.join(', ') + '. Ver console.</p></div>';
                 return false; // Falha na inicialização
            }

            const today = new Date().toISOString().split('T')[0];
            singleReleaseDateInput.value = today;
            albumReleaseDateInput.value = today;

            console.log("DEBUG: initializeDOMElements successful.");
            return true; // Sucesso
        } catch (error) {
             console.error("Erro CRÍTICO dentro de initializeDOMElements:", error);
             document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Interface</h1><p>Erro inesperado ao buscar elementos. Ver console.</p></div>';
             return false; // Falha
        }
    }


    // --- 1. CARREGAMENTO DE DADOS ---
    // ... (fetchAllAirtablePages, loadAllData, initializeData - sem mudanças, exceto logs internos) ...
     async function fetchAllAirtablePages(baseUrl, fetchOptions) { /* ...código inalterado... */ }
     async function loadAllData() { /* ...código inalterado... */ }
     const initializeData = (data) => { /* ...código inalterado... */ };

    // ... (saveChartDataToLocalStorage, refreshAllData - sem mudanças) ...
     const saveChartDataToLocalStorage = (chartType) => { /* ...código inalterado... */ };
     async function refreshAllData() { /* ...código inalterado... */ }

    // --- 2. NAVEGAÇÃO E UI ---
    // ... (switchView, switchTab, handleBack, renderArtistsGrid, formatArtistString, getCoverUrl, renderChart - sem mudanças) ...
     const switchView = (viewId, targetSectionId=null) => { /* ...código inalterado... */ };
     const switchTab = (event, forceTabId=null) => { /* ...código inalterado... */ };
     const handleBack = () => { /* ...código inalterado... */ };
     const renderArtistsGrid = (containerId, artists) => { /* ...código inalterado... */ };
     function formatArtistString(artistIds, collabType) { /* ...código inalterado... */ }
     function getCoverUrl(albumId) { /* ...código inalterado... */ }
     const renderChart = (type) => { /* ...código inalterado... */ };

    // ... (openArtistDetail, openAlbumDetail, openDiscographyDetail, handleSearch - sem mudanças) ...
     const openArtistDetail = (artistName) => { /* ...código inalterado... */ };
     const openAlbumDetail = (albumId) => { /* ...código inalterado... */ };
     const openDiscographyDetail = (type) => { /* ...código inalterado... */ };
     const handleSearch = () => { /* ...código inalterado... */ };

    // ... (setupCountdown, startAlbumCountdown - sem mudanças) ...
     const setupCountdown = (timerId, chartType) => { /* ...código inalterado... */ };
     function startAlbumCountdown(targetDateISO, containerId) { /* ...código inalterado... */ }

    // --- 3. SISTEMA DE RPG ---
    // ... (calculateSimulatedStreams, computeChartData, renderRPGChart - sem mudanças) ...
     const CHART_TOP_N = 20; const STREAMS_PER_POINT = 10000; const calculateSimulatedStreams = (points, lastActiveISO) => { /* ...código inalterado... */ }; const computeChartData = (artistsArray) => { /* ...código inalterado... */ }; function renderRPGChart() { /* ...código inalterado... */ }

    // --- 4. SISTEMA DO ESTÚDIO ---
    // ... (populateExistingTrackSelect, handleExistingTrackToggle - sem mudanças) ...
     function populateExistingTrackSelect(artistId) { /* ...código inalterado... */ }
     function handleExistingTrackToggle() { /* ...código inalterado... */ }

    // ... (initializeStudio - sem mudanças internas, apenas chamado depois) ...
     function initializeStudio() { /* ...código inalterado... */ }

    // ... (populateArtistSelector, loginPlayer, logoutPlayer - sem mudanças) ...
     function populateArtistSelector(playerId) { /* ...código inalterado... */ }
     function loginPlayer(playerId) { /* ...código inalterado... */ }
     function logoutPlayer() { /* ...código inalterado... */ }

    // ... (populateArtistSelectForFeat, openFeatModal, closeFeatModal, confirmFeat - sem mudanças) ...
     function populateArtistSelectForFeat(targetSelectElement) { /* ...código inalterado... */ }
     function openFeatModal(buttonElement) { /* ...código inalterado... */ }
     function closeFeatModal() { /* ...código inalterado... */ }
     function confirmFeat() { /* ...código inalterado... */ }

    // ... (toggleInlineFeatAdder, confirmInlineFeat, cancelInlineFeat - sem mudanças) ...
     function toggleInlineFeatAdder() { /* ...código inalterado... */ }
     function confirmInlineFeat() { /* ...código inalterado... */ }
     function cancelInlineFeat() { /* ...código inalterado... */ }

    // ... (openAlbumTrackModal, closeAlbumTrackModal, saveAlbumTrack, updateTrackNumbers - sem mudanças) ...
     function openAlbumTrackModal(itemToEdit=null) { /* ...código inalterado... */ }
     function closeAlbumTrackModal() { /* ...código inalterado... */ }
     function saveAlbumTrack() { /* ...código inalterado... */ }
     function updateTrackNumbers() { /* ...código inalterado... */ }

    // ... (createAirtableRecord, updateAirtableRecord, parseDurationToSeconds - sem mudanças) ...
     async function createAirtableRecord(tableName, fields) { /* ...código inalterado... */ }
     async function updateAirtableRecord(tableName, recordId, fields) { /* ...código inalterado... */ }
     function parseDurationToSeconds(durationStr) { /* ...código inalterado... */ }

    // ... (handleSingleSubmit, processSingleSubmission, processExistingSingleSubmission - sem mudanças) ...
     async function handleSingleSubmit(event) { /* ...código inalterado... */ }
     async function processSingleSubmission(trackType) { /* ...código inalterado... */ }
     async function processExistingSingleSubmission(existingTrackId) { /* ...código inalterado... */ }

    // ... (initAlbumForm, batchCreateAirtableRecords, handleAlbumSubmit - sem mudanças) ...
     function initAlbumForm() { /* ...código inalterado... */ }
     async function batchCreateAirtableRecords(tableName, records) { /* ...código inalterado... */ }
     async function handleAlbumSubmit(event) { /* ...código inalterado... */ }

    // --- 5. INICIALIZAÇÃO GERAL ---
    function initializeBodyClickListener() { /* ...código inalterado... */ }

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

        if (data && data.allArtists) {
            console.log("DEBUG: Data seems valid, initializing data structure..."); // DEBUG
            if (!initializeData(data)) {
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
                if (cancelTrackTypeBtn) { cancelTrackTypeBtn.addEventListener('click', () => { /* ... */ }); console.log("DEBUG: Attached listener to cancelTrackTypeBtn."); } // DEBUG
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
            document.body.innerHTML = '<div style="color: white; padding: 20px;"><h1>Erro Crítico</h1><p>Não foi possível carregar os dados essenciais do Airtable. Verifique a conexão e as configurações da API.</p></div>';
            console.error("DEBUG: Initialization failed: Data load error or invalid data."); // DEBUG
        }
        document.body.classList.remove('loading');
        console.log("DEBUG: Exiting main function."); // DEBUG
    }

    main(); // Inicia a aplicação

}); // Fim DOMContentLoaded
