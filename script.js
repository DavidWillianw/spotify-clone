document.addEventListener('DOMContentLoaded', async () => {

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
        // Renomeados
        trackNameInput, trackDurationInput;


    const AIRTABLE_BASE_ID = 'appG5NOoblUmtSMVI';
    const AIRTABLE_API_KEY = 'pat5T28kjmJ4t6TQG.69bf34509e687fff6a3f76bd52e64518d6c92be8b1ee0a53bcc9f50fedcb5c70';

    const PREVIOUS_MUSIC_CHART_KEY = 'spotifyRpg_previousMusicChart';
    const PREVIOUS_ALBUM_CHART_KEY = 'spotifyRpg_previousAlbumChart';
    const PREVIOUS_RPG_CHART_KEY = 'spotifyRpg_previousRpgChart';

    // --- FUNÇÃO PARA INICIALIZAR ELEMENTOS DO DOM ---
    function initializeDOMElements() {
        console.log("Initializing DOM elements...");
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
            addInlineFeatBtn = albumTrackModal.querySelector('.add-inline-feat-btn');

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
                confirmInlineFeatBtn, cancelInlineFeatBtn, addInlineFeatBtn,
                // Novos
                trackNameInput, trackDurationInput, launchExistingTrackCheck, newTrackInfoGroup, existingTrackGroup, existingTrackSelect
            ];

            // Verifica se todos os elementos essenciais foram encontrados
            if (essentialElements.some(el => !el) || allViews.length === 0) {
                 // Log detalhado dos elementos ausentes
                 const missing = essentialElements.map((el, index) => el ? null : `Element index ${index}`).filter(Boolean);
                 console.error("ERRO CRÍTICO: Elementos essenciais do HTML não foram encontrados!", { missing });
                 document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Interface</h1><p>Elementos essenciais não encontrados. Ver console.</p></div>';
                 return false;
            }

            const today = new Date().toISOString().split('T')[0];
            singleReleaseDateInput.value = today;
            albumReleaseDateInput.value = today;

            console.log("DOM elements initialized.");
            return true;
        } catch(error) {
             console.error("Erro ao inicializar elementos do DOM:", error);
             document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Interface</h1><p>Erro ao buscar elementos. Ver console.</p></div>';
             return false;
        }
    }


    // --- 1. CARREGAMENTO DE DADOS ---
    async function fetchAllAirtablePages(baseUrl, fetchOptions) {
        let allRecords = []; let offset = null;
        do { const sep = baseUrl.includes('?')?'&':'?'; const url = offset?`${baseUrl}${sep}offset=${offset}`:baseUrl; const res = await fetch(url, fetchOptions); if (!res.ok) { const txt = await res.text(); console.error(`Falha ${url}: ${res.status}-${txt}`); throw new Error(`Fetch fail ${baseUrl}`); } const data = await res.json(); if (data.records) { allRecords.push(...data.records); } offset = data.offset; } while (offset); return { records: allRecords };
    }

    async function loadAllData() {
        const artistsURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Artists?filterByFormula=%7BArtista%20Principal%7D%3D1`;
        const albumsURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Álbuns')}`;
        const musicasURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Músicas')}`;
        const singlesURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Singles e EPs')}`;
        const playersURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Jogadores`;

        const fetchOptions = { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } };
        console.log("Carregando dados...");
        try {
            const [artistsData, albumsData, musicasData, singlesData, playersData] = await Promise.all([
                fetchAllAirtablePages(artistsURL, fetchOptions),
                fetchAllAirtablePages(albumsURL, fetchOptions),
                fetchAllAirtablePages(musicasURL, fetchOptions),
                fetchAllAirtablePages(singlesURL, fetchOptions),
                fetchAllAirtablePages(playersURL, fetchOptions) // Tenta carregar jogadores
            ]);

            // Verifica falha em dados essenciais
             if (!artistsData || !albumsData || !musicasData || !singlesData) {
                 throw new Error('Falha ao carregar dados essenciais (artistas, álbuns, músicas ou singles).');
             }
             // Verifica falha em jogadores, mas não impede o resto
             if (!playersData) {
                 console.error("Falha ao carregar dados dos Jogadores. Verifique o nome da tabela e/ou permissões da API Key. O Estúdio pode não funcionar corretamente.");
             }

            const musicasMap = new Map();
            (musicasData.records || []).forEach(r => {
                const artistIds = Array.isArray(r.fields['Artista']) ? r.fields['Artista'] : [r.fields['Artista']].filter(Boolean);
                const pId = (r.fields['Álbuns']?.[0]) || (r.fields['Singles e EPs']?.[0]) || null;
                musicasMap.set(r.id, {
                    id: r.id,
                    title: r.fields['Nome da Faixa']||'?',
                    duration: r.fields['Duração']?new Date(r.fields['Duração']*1000).toISOString().substr(14,5):"0:00",
                    trackNumber: r.fields['Nº da Faixa']||0,
                    durationSeconds: r.fields['Duração']||0,
                    artistIds: artistIds,
                    collabType: r.fields['Tipo de Colaboração'],
                    albumId: pId, // ID do Pai (Álbum ou Single/EP)
                    streams: r.fields.Streams||0, // Semanal
                    totalStreams: r.fields['Streams Totais']||0, // Total
                    trackType: r.fields['Tipo de Faixa'] || 'Album Track'
                });
            });

            const artistsMapById = new Map();
            const artistsList = (artistsData.records || []).map(r => {
                const a = {
                    id: r.id, name: r.fields.Name||'?',
                    imageUrl: (r.fields['URL da Imagem']?.[0]?.url) || 'https://i.imgur.com/AD3MbBi.png',
                    off: r.fields['Inspirações (Off)']||[],
                    RPGPoints: r.fields.RPGPoints||0, LastActive: r.fields.LastActive||null
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
                        artist: artName, artistId: artId,
                        metascore: f['Metascore']||0, imageUrl: imgUrl,
                        releaseDate: f['Data de Lançamento']||'?', tracks: tracks,
                        totalDurationSeconds: dur,
                        weeklyStreams: f['Stream do album'] || 0, // Semanal do Album/Single
                        totalStreams: totalAlbumStreams // Total calculado das faixas
                    };
                });
            };

            const formattedAlbums = formatReleases(albumsData.records, true);
            const formattedSingles = formatReleases(singlesData.records, false);
            // Usa playersData se carregou, senão array vazio
            const formattedPlayers = (playersData?.records||[]).map(r => ({ id: r.id, name: r.fields.Nome, artists: r.fields.Artistas||[] }));

            console.log("Dados carregados.");
            return {
                allArtists: artistsList, albums: formattedAlbums, singles: formattedSingles,
                players: formattedPlayers, musicas: Array.from(musicasMap.values())
            };
        } catch (error) {
            console.error("Falha GERAL loadAllData:", error);
            // Retorna null para indicar falha, a função main tratará isso
            return null;
        }
    }

    const initializeData = (data) => {
        try {
            try { // Carrega dados de charts anteriores
                const prevMusic = localStorage.getItem(PREVIOUS_MUSIC_CHART_KEY); previousMusicChartData = prevMusic ? JSON.parse(prevMusic) : {};
                const prevAlbum = localStorage.getItem(PREVIOUS_ALBUM_CHART_KEY); previousAlbumChartData = prevAlbum ? JSON.parse(prevAlbum) : {};
                const prevRpg = localStorage.getItem(PREVIOUS_RPG_CHART_KEY); previousRpgChartData = prevRpg ? JSON.parse(prevRpg) : {};
                console.log("Previous chart data loaded.");
            } catch (e) { console.error("Error loading previous chart data:", e); previousMusicChartData = {}; previousAlbumChartData = {}; previousRpgChartData = {}; }

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
                parentReleaseDate: releaseDateMap.get(song.albumId) || null // Adiciona data de lançamento do pai
            }));

            db.albums = []; db.singles = [];
            const allReleases = [...(data.albums || []), ...(data.singles || [])];
            const thirtyMinSec = 30 * 60;

            allReleases.forEach(item => {
                (item.tracks || []).forEach(tInfo => {
                    const s = db.songs.find(sDb => sDb.id === tInfo.id);
                    if (s) { s.cover = item.imageUrl; } else { console.warn(`Song ${tInfo.id} not found.`); }
                });
                const artistEntry = db.artists.find(a => a.id === item.artistId);
                if ((item.totalDurationSeconds || 0) >= thirtyMinSec) {
                    db.albums.push(item); if (artistEntry) { artistEntry.albums.push(item); }
                } else {
                    db.singles.push(item); if (artistEntry) { artistEntry.singles.push(item); }
                }
                if (!artistEntry && item.artist !== "?") { console.warn(`Artist ${item.artist} not found.`); }
            });

            db.players = data.players || []; // Usa players carregados ou array vazio

            console.log(`DB Init: A${db.artists.length}, B${db.albums.length}, S${db.singles.length}, M${db.songs.length}, P${db.players.length}`);
            return true; // Sucesso
        } catch (error) {
            console.error("CRITICAL initializeData:", error);
            alert("Erro GRAVE ao inicializar dados internos. Verifique o console.");
            return false; // Falha
        }
    };

    const saveChartDataToLocalStorage = (chartType) => {
        let currentChartData; let storageKey; let dataList;
        console.log(`Saving previous chart data for: ${chartType}`);
        if (chartType === 'music') {
            storageKey = PREVIOUS_MUSIC_CHART_KEY; dataList = [...db.songs].sort((a,b)=>(b.streams||0)-(a.streams||0)).slice(0,50);
            currentChartData = dataList.reduce((acc,item,index)=>{ acc[item.id]=index+1; return acc; },{}); previousMusicChartData=currentChartData;
        } else if (chartType === 'album') {
            storageKey = PREVIOUS_ALBUM_CHART_KEY; dataList = [...db.albums].sort((a,b)=>(b.weeklyStreams||0)-(a.weeklyStreams||0)).slice(0,50);
            currentChartData = dataList.reduce((acc,item,index)=>{ acc[item.id]=index+1; return acc; },{}); previousAlbumChartData=currentChartData;
        } else if (chartType === 'rpg') {
            storageKey = PREVIOUS_RPG_CHART_KEY; dataList = computeChartData(db.artists);
            currentChartData = dataList.reduce((acc,item,index)=>{ acc[item.id]=index+1; return acc; },{}); previousRpgChartData=currentChartData;
        } else { console.error("Invalid chartType:", chartType); return; }
        try { localStorage.setItem(storageKey, JSON.stringify(currentChartData)); console.log(`${chartType} chart saved.`); } catch (e) { console.error(`Error saving ${chartType} chart:`, e); }
    };

    async function refreshAllData() {
        console.log("Atualizando dados...");
        const data = await loadAllData(); // Recarrega do Airtable
        if (data && data.allArtists) {
            if (initializeData(data)) { // Reorganiza os dados internos
                console.log("Dados atualizados e interface renderizada.");
                // Re-renderiza componentes principais
                renderRPGChart();
                renderChart('music');
                renderChart('album');
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10)); // Atualiza Home

                // Atualiza Estúdio se logado
                if (currentPlayer) { populateArtistSelector(currentPlayer.id); }

                // Atualiza view de detalhe se estiver aberta
                const currentView = document.querySelector('.page-view:not(.hidden)');
                if (currentView) {
                    if (currentView.id === 'artistDetail' && activeArtist) {
                        const refreshedArtist = db.artists.find(a => a.id === activeArtist.id);
                        if(refreshedArtist) openArtistDetail(refreshedArtist.name); else handleBack();
                    } else if (currentView.id === 'albumDetail') {
                         const albumId = currentView.dataset.currentAlbumId; // Precisamos guardar o ID do álbum atual na div
                         if(albumId) {
                            const refreshedAlbum = [...db.albums, ...db.singles].find(a => a.id === albumId);
                            if(refreshedAlbum) openAlbumDetail(albumId); else handleBack();
                         } else { handleBack();}
                    }
                    // Adicionar lógica para outras views se necessário
                }
                return true;
            }
        }
        console.error("Falha ao atualizar os dados.");
        alert("Não foi possível atualizar os dados do servidor.");
        return false;
    }


    // --- 2. NAVEGAÇÃO E UI ---
    // ... (switchView, switchTab, handleBack - sem mudanças)...
    const switchView = (viewId, targetSectionId = null) => {
        if (albumCountdownInterval) { clearInterval(albumCountdownInterval); albumCountdownInterval = null; }
        console.log(`Switching view: ${viewId}`);
        allViews.forEach(v => v.classList.add('hidden'));
        const target = document.getElementById(viewId);
        if (target) {
            target.classList.remove('hidden');
            window.scrollTo(0,0);
            // Guarda o ID do álbum na div ao abrir o detalhe
            if (viewId === 'albumDetail') {
                // Assumindo que o ID está sendo passado de alguma forma, ex: dataset
                // A função openAlbumDetail agora precisa setar 'target.dataset.currentAlbumId = albumId;'
            } else {
                 delete target.dataset.currentAlbumId; // Limpa se não for detalhe do album
            }

            if (viewId==='mainView'&&targetSectionId) { switchTab(null, targetSectionId); }
            if (viewId!=='mainView'&&viewId!=='studioView') { if (viewHistory.length===0||viewHistory[viewHistory.length-1]!==viewId) { viewHistory.push(viewId); } }
            else if (viewId==='mainView') { viewHistory=[]; }
        } else { console.error(`View ${viewId} not found.`); }
    };
    const switchTab = (event, forceTabId = null) => { let tabId; if (forceTabId) { tabId = forceTabId; } else if (event) { event.preventDefault(); tabId = event.currentTarget.dataset.tab; } else { return; } if (tabId === 'studioSection') { switchView('studioView'); document.querySelectorAll('.nav-tab, .bottom-nav-item').forEach(b => b.classList.remove('active')); document.querySelectorAll(`.nav-tab[data-tab="${tabId}"], .bottom-nav-item[data-tab="${tabId}"]`).forEach(b => b.classList.add('active')); return; } if (!document.getElementById('mainView').classList.contains('hidden')) { /* Se mainView está visível, apenas troca a aba interna */ } else if (viewHistory.length > 0 || document.getElementById('mainView').classList.contains('hidden')) { switchView('mainView'); /* Se estava em outra view, volta pra main */ } document.querySelectorAll('#mainView .content-section').forEach(s => s.classList.remove('active')); document.querySelectorAll('.nav-tab, .bottom-nav-item').forEach(b => b.classList.remove('active')); const targetSection = document.getElementById(tabId); if (targetSection && targetSection.closest('#mainView')) { targetSection.classList.add('active'); } document.querySelectorAll(`.nav-tab[data-tab="${tabId}"], .bottom-nav-item[data-tab="${tabId}"]`).forEach(b => b.classList.add('active')); };
    const handleBack = () => { if (albumCountdownInterval) { clearInterval(albumCountdownInterval); albumCountdownInterval = null; } viewHistory.pop(); const prevId = viewHistory.pop() || 'mainView'; switchView(prevId); };

    const renderArtistsGrid = (containerId, artists) => { const c = document.getElementById(containerId); if(!c){console.error(`Grid ${containerId} not found.`); return;} if(!artists||artists.length===0){c.innerHTML='<p class="empty-state">Nenhum artista.</p>'; return;} c.innerHTML = artists.map(a => `<div class="artist-card" data-artist-name="${a.name}"><img src="${a.img||a.imageUrl||'https://i.imgur.com/AD3MbBi.png'}" alt="${a.name}" class="artist-card-img"><p class="artist-card-name">${a.name}</p><span class="artist-card-type">Artista</span></div>`).join(''); };
    function formatArtistString(artistIds, collabType) { if (!artistIds || artistIds.length === 0) return "?"; const names = artistIds.map(id => { const a = db.artists.find(art => art.id === id); return a ? a.name : "?"; }); const main = names[0]; if (names.length === 1) return main; const others = names.slice(1).join(', '); if (collabType === 'Dueto/Grupo') { return `${main} & ${others}`; } else { return main; } } // Assumindo que só o principal é listado se for feat.
    function getCoverUrl(albumId) { if (!albumId) return 'https://i.imgur.com/AD3MbBi.png'; const r = [...db.albums, ...db.singles].find(a => a.id === albumId); return (r ? r.imageUrl : 'https://i.imgur.com/AD3MbBi.png'); }

    const renderChart = (type) => { // Exibe streams semanais
        let containerId, dataList, previousData;
        if (type === 'music') {
            containerId = 'musicChartsList'; dataList = [...db.songs].sort((a, b) => (b.streams || 0) - (a.streams || 0)).slice(0, 50); previousData = previousMusicChartData;
        } else {
            containerId = 'albumChartsList'; dataList = [...db.albums].sort((a, b) => (b.weeklyStreams || 0) - (a.weeklyStreams || 0)).slice(0, 50); previousData = previousAlbumChartData;
        }
        const container = document.getElementById(containerId); if (!container) { console.error(`Chart ${containerId} not found.`); return; } if (!dataList || dataList.length === 0) { container.innerHTML = `<p class="empty-state">Nenhum item.</p>`; return; }
        container.innerHTML = dataList.map((item, index) => { /* ... lógica de rank e indicador ... */ const currentRank = index + 1; const previousRank = previousData[item.id]; let iconClass = 'fa-minus'; let trendClass = 'trend-stable'; if (previousRank === undefined) { trendClass = 'trend-new'; } else if (currentRank < previousRank) { iconClass = 'fa-caret-up'; trendClass = 'trend-up'; } else if (currentRank > previousRank) { iconClass = 'fa-caret-down'; trendClass = 'trend-down'; } const indicatorHtml = `<span class="chart-rank-indicator ${trendClass}"><i class="fas ${iconClass}"></i></span>`; if (type === 'music') { const artistName = formatArtistString(item.artistIds, item.collabType); return `<div class="chart-item" data-song-id="${item.id}">${indicatorHtml}<span class="chart-rank">${currentRank}</span><img src="${item.cover || getCoverUrl(item.albumId)}" alt="${item.title}" class="chart-item-img"><div class="chart-item-info"><span class="chart-item-title">${item.title}</span><span class="chart-item-artist">${artistName}</span></div><span class="chart-item-duration">${(item.streams || 0).toLocaleString('pt-BR')}</span></div>`; } else { return `<div class="chart-item" data-album-id="${item.id}">${indicatorHtml}<span class="chart-rank">${currentRank}</span><img src="${item.imageUrl}" alt="${item.title}" class="chart-item-img"><div class="chart-item-info"><span class="chart-item-title">${item.title}</span><span class="chart-item-artist">${item.artist}</span></div><span class="chart-item-score">${(item.weeklyStreams || 0).toLocaleString('pt-BR')}</span></div>`; } }).join('');
    };

    // --- ATUALIZADO: Filtra populares por data ---
    const openArtistDetail = (artistName) => {
        const artist = db.artists.find(a => a.name === artistName);
        if (!artist) { console.error(`Artista "${artistName}" não encontrado.`); handleBack(); return; }
        activeArtist = artist;
        document.getElementById('detailBg').style.backgroundImage = `url(${artist.img || artist.imageUrl})`; // Usa img ou imageUrl
        document.getElementById('detailName').textContent = artist.name;

        const now = new Date();
        const popularSongs = [...db.songs]
            .filter(s =>
                s.artistIds && s.artistIds.includes(artist.id) &&
                s.parentReleaseDate && new Date(s.parentReleaseDate) <= now // Filtra lançadas
            )
            .sort( (a, b) => (b.totalStreams || 0) - (a.totalStreams || 0)) // Ordena por Total
            .slice(0, 5);

        const popularContainer = document.getElementById('popularSongsList');
        if (popularSongs.length > 0) {
            popularContainer.innerHTML = popularSongs.map( (song, index) =>
                `<div class="song-row" data-song-id="${song.id}"><span>${index + 1}</span><div class="song-row-info"><img src="${song.cover || getCoverUrl(song.albumId)}" alt="${song.title}" class="song-row-cover"><span class="song-row-title">${song.title}</span></div><span class="song-streams">${(song.totalStreams || 0).toLocaleString('pt-BR')}</span></div>` // Exibe Total
            ).join('');
        } else { popularContainer.innerHTML = '<p class="empty-state-small">Nenhuma música popular (já lançada).</p>'; }

        // Resto (Álbuns, Singles, Recomendados) sem mudanças
        const albumsContainer = document.getElementById('albumsList'); const sortedAlbums = (artist.albums || []).sort( (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)); albumsContainer.innerHTML = sortedAlbums.map(album => `<div class="scroll-item" data-album-id="${album.id}"><img src="${album.imageUrl}" alt="${album.title}"><p>${album.title}</p><span>${new Date(album.releaseDate).getFullYear()}</span></div>`).join('') || '<p class="empty-state-small">Nenhum álbum.</p>';
        const singlesContainer = document.getElementById('singlesList'); const sortedSingles = (artist.singles || []).sort( (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)); singlesContainer.innerHTML = sortedSingles.map(single => `<div class="scroll-item" data-album-id="${single.id}"><img src="${single.imageUrl}" alt="${single.title}"><p>${single.title}</p><span>${new Date(single.releaseDate).getFullYear()}</span></div>`).join('') || '<p class="empty-state-small">Nenhum single.</p>';
        const recommended = [...db.artists].filter(a => a.id !== artist.id).sort( () => 0.5 - Math.random()).slice(0, 5); renderArtistsGrid('recommendedGrid', recommended);
        switchView('artistDetail');
    };

     // --- ATUALIZADO: Função openAlbumDetail mais robusta ---
     const openAlbumDetail = (albumId) => {
        const album = [...db.albums, ...db.singles].find(a => a.id === albumId);
        const targetElement = document.getElementById('albumDetail'); // Pega a div da view

        if (!album || !targetElement) {
             console.error(`Álbum/Single ID "${albumId}" não encontrado ou elemento #albumDetail ausente.`);
             handleBack(); // Volta se não achar o álbum ou a view
             return;
        }

        // Guarda o ID atual na div para refreshAllData
        targetElement.dataset.currentAlbumId = albumId;

        if (albumCountdownInterval) { clearInterval(albumCountdownInterval); albumCountdownInterval = null; }

        const countdownContainer = document.getElementById('albumCountdownContainer');
        const normalInfoContainer = document.getElementById('albumNormalInfoContainer');
        const tracklistContainer = document.getElementById('albumTracklist');
        const bgElement = document.getElementById('albumDetailBg');
        const coverElement = document.getElementById('albumDetailCover');
        const titleElement = document.getElementById('albumDetailTitle');
        const infoElement = document.getElementById('albumDetailInfo');
        const countdownDateElement = document.getElementById('albumCountdownReleaseDate');

        // --- Reset básico ---
        if(bgElement) bgElement.style.backgroundImage = '';
        if(coverElement) coverElement.src = 'https://i.imgur.com/AD3MbBi.png';
        if(titleElement) titleElement.textContent = album.title || 'Título Indisponível';
        if(infoElement) infoElement.textContent = '';
        if(tracklistContainer) tracklistContainer.innerHTML = '<p>Carregando faixas...</p>';
        if(countdownContainer) countdownContainer.classList.add('hidden');
        if(normalInfoContainer) normalInfoContainer.classList.add('hidden');

        // --- Detalhes Universais ---
        if(bgElement && album.imageUrl) bgElement.style.backgroundImage = `url(${album.imageUrl})`;
        if(coverElement && album.imageUrl) coverElement.src = album.imageUrl;

        // --- Lógica Pré/Pós Lançamento ---
        const releaseDate = album.releaseDate ? new Date(album.releaseDate) : null;
        const now = new Date();
        const isPreRelease = releaseDate && releaseDate > now;
        const artistObj = db.artists.find(a => a.id === album.artistId);
        const artistNameFallback = album.artist || (artistObj ? artistObj.name : 'Artista Desconhecido');

        if (isPreRelease) {
            // *** PRÉ-LANÇAMENTO ***
            if(normalInfoContainer) normalInfoContainer.classList.add('hidden');
            if(countdownContainer) countdownContainer.classList.remove('hidden');

            const releaseDateStr = releaseDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
            if(countdownDateElement) countdownDateElement.textContent = releaseDateStr;
            startAlbumCountdown(album.releaseDate, 'albumCountdownTimer');

            if(tracklistContainer) {
              if (!album.tracks || album.tracks.length === 0) {
                  tracklistContainer.innerHTML = '<p class="empty-state-small">Tracklist indisponível.</p>';
              } else {
                  tracklistContainer.innerHTML = album.tracks.map(track => {
                      const fullSong = db.songs.find(s => s.id === track.id);
                      let isAvailable = false;
                      if (fullSong && fullSong.parentReleaseDate) {
                          const parentDate = new Date(fullSong.parentReleaseDate);
                          if (!isNaN(parentDate.getTime())) { isAvailable = parentDate <= now; }
                      }
                      const displayTitle = track.title || 'Faixa Indisponível';
                      const displayArtist = formatArtistString(track.artistIds, track.collabType) || artistNameFallback;
                      const displayDuration = track.duration || '--:--';
                      const displayTrackNumber = track.trackNumber || '?';

                      if (isAvailable) {
                          return `<div class="track-row available" data-song-id="${track.id}">
                                      <span class="track-number"><i class="fas fa-play"></i></span>
                                      <div class="track-info">
                                          <span class="track-title">${displayTitle}</span>
                                          <span class="track-artist-feat">${displayArtist}</span>
                                      </div>
                                      <span class="track-duration">${displayDuration}</span>
                                  </div>`;
                      } else {
                          return `<div class="track-row unavailable">
                                      <span class="track-number">${displayTrackNumber}</span>
                                      <div class="track-info">
                                          <span class="track-title">${displayTitle}</span>
                                          <span class="track-artist-feat">${displayArtist}</span>
                                      </div>
                                      <span class="track-duration"><i class="fas fa-lock"></i></span>
                                  </div>`;
                      }
                  }).join('');
              }
            }

        } else {
            // *** LANÇAMENTO NORMAL ***
            if(countdownContainer) countdownContainer.classList.add('hidden');
            if(normalInfoContainer) normalInfoContainer.classList.remove('hidden');

            const releaseYear = releaseDate ? releaseDate.getFullYear() : '----';
            const totalAlbumStreams = album.totalStreams || 0;
            const totalAlbumStreamsFormatted = totalAlbumStreams.toLocaleString('pt-BR');
            if(infoElement) infoElement.innerHTML = `Por <strong class="artist-link" data-artist-name="${artistNameFallback}">${artistNameFallback}</strong> • ${releaseYear} • ${totalAlbumStreamsFormatted} streams totais`;

            if(tracklistContainer) {
              if (!album.tracks || album.tracks.length === 0) {
                  tracklistContainer.innerHTML = '<p class="empty-state-small">Nenhuma faixa encontrada.</p>';
              } else {
                  tracklistContainer.innerHTML = album.tracks.map(song => {
                      const artistName = formatArtistString(song.artistIds, song.collabType) || artistNameFallback;
                      const streams = (song.totalStreams || 0); // Usa totalStreams da faixa
                      const displayTitle = song.title || 'Faixa Indisponível';
                      const displayTrackNumber = song.trackNumber || '?';

                      return `<div class="track-row" data-song-id="${song.id}">
                                  <span class="track-number">${displayTrackNumber}</span>
                                  <div class="track-info">
                                      <span class="track-title">${displayTitle}</span>
                                      <span class="track-artist-feat">${artistName}</span>
                                  </div>
                                  <span class="track-duration">${streams.toLocaleString('pt-BR')}</span>
                              </div>`;
                  }).join('');
              }
            }
        }
        switchView('albumDetail');
    };

    const openDiscographyDetail = (type) => { if (!activeArtist) { console.error("Nenhum artista ativo."); handleBack(); return; } const data = (type==='albums')?(activeArtist.albums||[]).sort((a,b)=>new Date(b.releaseDate)-new Date(a.releaseDate)):(activeArtist.singles||[]).sort((a,b)=>new Date(b.releaseDate)-new Date(a.releaseDate)); const title = (type==='albums')?`Álbuns de ${activeArtist.name}`:`Singles & EPs de ${activeArtist.name}`; document.getElementById('discographyTypeTitle').textContent = title; const grid = document.getElementById('discographyGrid'); grid.innerHTML = data.map(item => `<div class="scroll-item" data-album-id="${item.id}"><img src="${item.imageUrl}" alt="${item.title}"><p>${item.title}</p><span>${new Date(item.releaseDate).getFullYear()}</span></div>`).join('') || '<p class="empty-state">Nenhum lançamento.</p>'; switchView('discographyDetail'); };
    const handleSearch = () => { const query = searchInput.value.toLowerCase().trim(); if (!query) { switchTab(null, 'homeSection'); return; } const resultsContainer = document.getElementById('searchResults'); const noResultsEl = document.getElementById('noResults'); const filteredArtists = db.artists.filter(a => a.name.toLowerCase().includes(query)); const filteredAlbums = [...db.albums, ...db.singles].filter(a => a.title.toLowerCase().includes(query)); let html = ''; let count = 0; if (filteredArtists.length > 0) { html += '<h3 class="section-title">Artistas</h3>'; html += filteredArtists.map(a => { count++; return `<div class="artist-card" data-artist-name="${a.name}"><img src="${a.img||a.imageUrl}" alt="${a.name}" class="artist-card-img"><p class="artist-card-name">${a.name}</p><span class="artist-card-type">Artista</span></div>`; }).join(''); } if (filteredAlbums.length > 0) { html += '<h3 class="section-title">Álbuns & Singles</h3>'; html += filteredAlbums.map(al => { count++; return `<div class="artist-card scroll-item" data-album-id="${al.id}"><img src="${al.imageUrl}" alt="${al.title}"><p>${al.title}</p><span>${al.artist}</span></div>`; }).join(''); } resultsContainer.innerHTML = html; if (count > 0) { noResultsEl.classList.add('hidden'); resultsContainer.classList.remove('hidden'); } else { noResultsEl.classList.remove('hidden'); resultsContainer.classList.add('hidden'); } switchTab(null, 'searchSection'); };

    const setupCountdown = (timerId, chartType) => { /* ...código inalterado... */ };
    function startAlbumCountdown(targetDateISO, containerId) { /* ...código inalterado... */ }

    // --- 3. SISTEMA DE RPG ---
    // ... (calculateSimulatedStreams, computeChartData, renderRPGChart - sem mudanças)...
    const CHART_TOP_N = 20; const STREAMS_PER_POINT = 10000; const calculateSimulatedStreams = (points, lastActiveISO) => { if (!lastActiveISO) return 0; const now = new Date(); const last = new Date(lastActiveISO); const diffH = Math.abs(now - last) / 36e5; const streamDay = (points||0)*STREAMS_PER_POINT; const streamH = streamDay/24; return Math.floor(streamH*diffH); }; const computeChartData = (artistsArray) => { return artistsArray.map(a => ({ id: a.id, name: a.name, img: a.img || a.imageUrl, streams: calculateSimulatedStreams(a.RPGPoints, a.LastActive), points: a.RPGPoints||0 })).sort((a,b) => b.streams - a.streams).slice(0, CHART_TOP_N); }; function renderRPGChart() { const chartData = computeChartData(db.artists); const container = document.getElementById('artistsGrid'); const previousData = previousRpgChartData; if (!container) { console.error("Container 'artistsGrid' não encontrado."); return; } if (chartData.length === 0) { container.innerHTML = '<p class="empty-state">Nenhum artista no chart RPG.</p>'; return; } container.innerHTML = chartData.map((artist, index) => { const currentRank = index + 1; const previousRank = previousData[artist.id]; let iconClass = 'fa-minus'; let trendClass = 'trend-stable'; if (previousRank === undefined) { trendClass = 'trend-new'; } else if (currentRank < previousRank) { iconClass = 'fa-caret-up'; trendClass = 'trend-up'; } else if (currentRank > previousRank) { iconClass = 'fa-caret-down'; trendClass = 'trend-down'; } return `<div class="artist-card" data-artist-name="${artist.name}"><span class="rpg-rank">#${currentRank}</span><span class="chart-rank-indicator rpg-indicator ${trendClass}"><i class="fas ${iconClass}"></i></span><img src="${artist.img}" alt="${artist.name}" class="artist-card-img"><p class="artist-card-name">${artist.name}</p><span class="artist-card-type">${(artist.streams || 0).toLocaleString('pt-BR')} streams</span></div>`; }).join(''); }


    // --- 4. SISTEMA DO ESTÚDIO ---
    console.log("Defining initializeStudio function...");

    // *** NOVA FUNÇÃO ***
    function populateExistingTrackSelect(artistId) { /* ...código da função... */
        if (!existingTrackSelect || !artistId) {
            if(existingTrackSelect) existingTrackSelect.innerHTML = '<option value="" disabled selected>Selecione o artista primeiro...</option>';
            return;
        }
        const artistAlbumTracks = db.songs.filter(s =>
            s.artistIds && s.artistIds.includes(artistId) &&
            s.trackType !== 'Single' && s.trackType !== 'B-side' // Pega 'Album Track' ou indefinidos
            // Poderia adicionar && !db.singles.some(single => single.faixaPrincipalId === s.id) // Para não listar faixas já lançadas como single?
        );
        existingTrackSelect.innerHTML = '<option value="" disabled selected>Selecione a faixa a lançar...</option>';
        if (artistAlbumTracks.length === 0) {
            existingTrackSelect.innerHTML += '<option value="" disabled>Nenhuma faixa de Álbum/EP encontrada para este artista</option>';
            return;
        }
        artistAlbumTracks.sort((a, b) => a.title.localeCompare(b.title)).forEach(track => {
            const option = document.createElement('option'); option.value = track.id; option.textContent = track.title; existingTrackSelect.appendChild(option);
        });
    }

    // *** NOVA FUNÇÃO ***
    function handleExistingTrackToggle() { /* ...código da função... */
        if (!launchExistingTrackCheck || !newTrackInfoGroup || !existingTrackGroup || !trackNameInput || !trackDurationInput || !existingTrackSelect) return;
        const isExisting = launchExistingTrackCheck.checked;
        if (isExisting) {
            newTrackInfoGroup.classList.add('hidden'); existingTrackGroup.classList.remove('hidden');
            trackNameInput.required = false; trackDurationInput.required = false;
            existingTrackSelect.required = true;
            populateExistingTrackSelect(singleArtistSelect.value);
        } else {
            newTrackInfoGroup.classList.remove('hidden'); existingTrackGroup.classList.add('hidden');
            trackNameInput.required = true; trackDurationInput.required = true;
            existingTrackSelect.required = false;
            existingTrackSelect.innerHTML = '<option value="">Selecione o artista primeiro...</option>';
        }
    }

    function initializeStudio() { /* ...código da função (com adição dos listeners)... */
        console.log("Running initializeStudio...");
        if (!playerSelect) { console.error("initializeStudio failed: playerSelect element not found."); return; }
        // Preenche select de jogadores... (código inalterado)
        if (db.players && db.players.length > 0) { playerSelect.innerHTML = '<option value="">Selecione...</option>' + db.players.map(p => `<option value="${p.id}">${p.name}</option>`).join(''); } else { playerSelect.innerHTML = '<option value="">Nenhum jogador encontrado</option>'; console.warn("Nenhum jogador carregado."); }

        loginButton.addEventListener('click', () => loginPlayer(playerSelect.value));
        logoutButton.addEventListener('click', logoutPlayer);
        studioTabs.forEach(tab => { tab.addEventListener('click', (e) => { studioTabs.forEach(t => t.classList.remove('active')); studioForms.forEach(f => f.classList.remove('active')); e.currentTarget.classList.add('active'); const formId = e.currentTarget.dataset.form; document.getElementById(formId === 'single' ? 'newSingleForm' : 'newAlbumForm').classList.add('active'); }); });
        confirmFeatBtn.addEventListener('click', confirmFeat); cancelFeatBtn.addEventListener('click', closeFeatModal);
        if (newSingleForm) { newSingleForm.addEventListener('click', (e) => { const addFeatButton = e.target.closest('.add-feat-btn[data-target="singleFeatList"]'); if (addFeatButton) { openFeatModal(addFeatButton); } }); }
        if (openAddTrackModalBtn) { openAddTrackModalBtn.addEventListener('click', () => openAlbumTrackModal()); }
        if (saveAlbumTrackBtn) saveAlbumTrackBtn.addEventListener('click', saveAlbumTrack); if (cancelAlbumTrackBtn) cancelAlbumTrackBtn.addEventListener('click', closeAlbumTrackModal);
        if (addInlineFeatBtn) { addInlineFeatBtn.addEventListener('click', toggleInlineFeatAdder); } else { console.error("addInlineFeatBtn not found!"); }
        if (confirmInlineFeatBtn) confirmInlineFeatBtn.addEventListener('click', confirmInlineFeat); if (cancelInlineFeatBtn) cancelInlineFeatBtn.addEventListener('click', cancelInlineFeat);
        if (albumTracklistEditor) { albumTracklistEditor.addEventListener('click', (e) => { const editButton = e.target.closest('.edit-track-btn'); const removeButton = e.target.closest('.remove-track-btn'); if (editButton) { const item = editButton.closest('.track-list-item-display'); if (item) { openAlbumTrackModal(item); } } else if (removeButton) { const item = removeButton.closest('.track-list-item-display'); if (item) { item.remove(); updateTrackNumbers(); } } }); }

        // *** ADIÇÃO DOS LISTENERS PARA SINGLE EXISTENTE ***
        if (launchExistingTrackCheck) { launchExistingTrackCheck.addEventListener('change', handleExistingTrackToggle); }
        if (singleArtistSelect) { singleArtistSelect.addEventListener('change', () => { if (launchExistingTrackCheck && launchExistingTrackCheck.checked) { populateExistingTrackSelect(singleArtistSelect.value); } }); }
        // *** FIM DA ADIÇÃO ***

        initAlbumForm();
        console.log("initializeStudio finished.");
    }

    // ... (populateArtistSelector, loginPlayer, logoutPlayer - sem mudanças)...
    function populateArtistSelector(playerId) { const p=db.players.find(pl=>pl.id===playerId); if(!p || !p.artists) return; const ids=p.artists; const opts=ids.map(id=>{const a=db.artists.find(ar=>ar.id===id); return a?`<option value="${a.id}">${a.name}</option>`:'';}).join(''); if(singleArtistSelect) singleArtistSelect.innerHTML=`<option value="">Selecione...</option>${opts}`; if(albumArtistSelect) albumArtistSelect.innerHTML=`<option value="">Selecione...</option>${opts}`; }
    function loginPlayer(playerId) { if(!playerId){alert("Selecione um jogador.");return;} currentPlayer=db.players.find(p=>p.id===playerId); if(currentPlayer){document.getElementById('playerName').textContent=currentPlayer.name; loginPrompt.classList.add('hidden'); loggedInInfo.classList.remove('hidden'); studioLaunchWrapper.classList.remove('hidden'); populateArtistSelector(currentPlayer.id);} else { logoutPlayer(); alert("Jogador não encontrado.");}}
    function logoutPlayer() { currentPlayer=null; document.getElementById('playerName').textContent=''; loginPrompt.classList.remove('hidden'); loggedInInfo.classList.add('hidden'); studioLaunchWrapper.classList.add('hidden'); if(singleArtistSelect) singleArtistSelect.innerHTML = '<option value="">Faça login...</option>'; if(albumArtistSelect) albumArtistSelect.innerHTML = '<option value="">Faça login...</option>';}

    // ... (populateArtistSelectForFeat, openFeatModal, closeFeatModal, confirmFeat - sem mudanças)...
    function populateArtistSelectForFeat(targetSelectElement) { let currentMainId=null; let selectEl=targetSelectElement; if(!newSingleForm.classList.contains('hidden')){currentMainId=singleArtistSelect.value; selectEl=featArtistSelect;} else if(!newAlbumForm.classList.contains('hidden')){currentMainId=albumArtistSelect.value; selectEl=inlineFeatArtistSelect;} else {selectEl=featArtistSelect;} if(!selectEl){console.error("Select de feat não encontrado!"); return;} selectEl.innerHTML = db.artists.filter(a=>a.id!==currentMainId).sort((a,b)=>a.name.localeCompare(b.name)).map(a=>`<option value="${a.id}">${a.name}</option>`).join(''); if(selectEl.innerHTML===''){selectEl.innerHTML='<option value="" disabled>Nenhum outro artista</option>';} }
    function openFeatModal(buttonElement) { const targetId=buttonElement.dataset.target; currentFeatTarget=document.getElementById(targetId); if(!currentFeatTarget){console.error("Alvo do feat não encontrado:", targetId); return;} populateArtistSelectForFeat(featArtistSelect); featModal.classList.remove('hidden'); }
    function closeFeatModal() { featModal.classList.add('hidden'); currentFeatTarget=null; }
    function confirmFeat() { const artistId=featArtistSelect.value; const artistName=featArtistSelect.options[featArtistSelect.selectedIndex].text; const featType=featTypeSelect.value; if(!artistId||!currentFeatTarget){console.error("Confirmação de feat sem ID de artista ou alvo."); return;} const tag=document.createElement('span'); tag.className='feat-tag'; tag.textContent=`${featType} ${artistName}`; tag.dataset.artistId=artistId; tag.dataset.featType=featType; tag.dataset.artistName=artistName; tag.addEventListener('click',()=>tag.remove()); currentFeatTarget.appendChild(tag); closeFeatModal(); }

    // ... (toggleInlineFeatAdder, confirmInlineFeat, cancelInlineFeat - sem mudanças)...
    function toggleInlineFeatAdder() { if(!inlineFeatAdder || !addInlineFeatBtn)return; const hidden=inlineFeatAdder.classList.contains('hidden'); if(hidden){populateArtistSelectForFeat(inlineFeatArtistSelect); inlineFeatAdder.classList.remove('hidden'); addInlineFeatBtn.innerHTML='<i class="fas fa-times"></i> Cancelar Feat';} else {inlineFeatAdder.classList.add('hidden'); addInlineFeatBtn.innerHTML='<i class="fas fa-plus"></i> Adicionar Feat';} }
    function confirmInlineFeat() { const artistId=inlineFeatArtistSelect.value; const artistName=inlineFeatArtistSelect.options[inlineFeatArtistSelect.selectedIndex].text; const featType=inlineFeatTypeSelect.value; if(!artistId||!albumTrackFeatList){console.error("Confirmação de feat inline sem ID ou alvo."); return;} const tag=document.createElement('span'); tag.className='feat-tag'; tag.textContent=`${featType} ${artistName}`; tag.dataset.artistId=artistId; tag.dataset.featType=featType; tag.dataset.artistName=artistName; tag.addEventListener('click',()=>tag.remove()); albumTrackFeatList.appendChild(tag); inlineFeatAdder.classList.add('hidden'); if(addInlineFeatBtn) addInlineFeatBtn.innerHTML='<i class="fas fa-plus"></i> Adicionar Feat'; }
    function cancelInlineFeat() { inlineFeatAdder.classList.add('hidden'); if(addInlineFeatBtn) addInlineFeatBtn.innerHTML='<i class="fas fa-plus"></i> Adicionar Feat'; }

    // ... (openAlbumTrackModal, closeAlbumTrackModal, saveAlbumTrack, updateTrackNumbers - sem mudanças)...
    function openAlbumTrackModal(itemToEdit=null) { albumTrackNameInput.value=''; albumTrackDurationInput.value=''; albumTrackTypeSelect.value='Album Track'; albumTrackFeatList.innerHTML=''; editingTrackItemId.value=''; editingTrackItem=null; inlineFeatAdder.classList.add('hidden'); if(addInlineFeatBtn)addInlineFeatBtn.innerHTML='<i class="fas fa-plus"></i> Adicionar Feat'; if(itemToEdit){albumTrackModalTitle.textContent='Editar Faixa'; editingTrackItemId.value=itemToEdit.id||itemToEdit.dataset.itemId; editingTrackItem=itemToEdit; albumTrackNameInput.value=itemToEdit.dataset.trackName||''; albumTrackDurationInput.value=itemToEdit.dataset.durationStr||''; albumTrackTypeSelect.value=itemToEdit.dataset.trackType||'Album Track'; const feats=JSON.parse(itemToEdit.dataset.feats||'[]'); feats.forEach(f=>{const tag=document.createElement('span'); tag.className='feat-tag'; tag.textContent=`${f.type} ${f.name}`; tag.dataset.artistId=f.id; tag.dataset.featType=f.type; tag.dataset.artistName=f.name; tag.addEventListener('click',()=>tag.remove()); albumTrackFeatList.appendChild(tag);}); } else {albumTrackModalTitle.textContent='Adicionar Faixa'; editingTrackItemId.value=`temp_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;} albumTrackModal.classList.remove('hidden'); }
    function closeAlbumTrackModal() { albumTrackModal.classList.add('hidden'); editingTrackItem=null; editingTrackItemId.value=''; inlineFeatAdder.classList.add('hidden'); if(addInlineFeatBtn)addInlineFeatBtn.innerHTML='<i class="fas fa-plus"></i> Adicionar Feat'; }
    function saveAlbumTrack() { const name=albumTrackNameInput.value.trim(); const durStr=albumTrackDurationInput.value.trim(); const type=albumTrackTypeSelect.value; const durSec=parseDurationToSeconds(durStr); const itemId=editingTrackItemId.value; if(!name||!durStr||durSec===0){alert("Nome e Duração (MM:SS) válidos são obrigatórios.");return;} const featTags=albumTrackFeatList.querySelectorAll('.feat-tag'); const featsData=Array.from(featTags).map(t=>({id:t.dataset.artistId, type:t.dataset.featType, name:t.dataset.artistName})); let target=editingTrackItem||albumTracklistEditor.querySelector(`[data-item-id="${itemId}"]`); if(target){target.dataset.trackName=name; target.dataset.durationStr=durStr; target.dataset.trackType=type; target.dataset.feats=JSON.stringify(featsData); target.querySelector('.track-title-display').textContent=name; target.querySelector('.track-details-display .duration').textContent=`Duração: ${durStr}`; target.querySelector('.track-details-display .type').textContent=`Tipo: ${type}`; const featDisp=target.querySelector('.feat-list-display'); if(featDisp){featDisp.innerHTML=featsData.map(f=>`<span class="feat-tag-display">${f.type} ${f.name}</span>`).join('');}} else {const newItem=document.createElement('div'); newItem.className='track-list-item-display'; newItem.dataset.itemId=itemId; newItem.dataset.trackName=name; newItem.dataset.durationStr=durStr; newItem.dataset.trackType=type; newItem.dataset.feats=JSON.stringify(featsData); newItem.innerHTML=`<span class="track-number-display"></span><i class="fas fa-bars drag-handle"></i><div class="track-info-display"><span class="track-title-display">${name}</span><div class="track-details-display"><span class="duration">Duração: ${durStr}</span><span class="type">Tipo: ${type}</span></div><div class="feat-list feat-list-display" style="margin-top:5px;">${featsData.map(f=>`<span class="feat-tag-display">${f.type} ${f.name}</span>`).join('')}</div></div><div class="track-actions"><button type="button" class="small-btn edit-track-btn"><i class="fas fa-pencil-alt"></i></button><button type="button" class="small-btn remove-track-btn"><i class="fas fa-times"></i></button></div>`; const empty=albumTracklistEditor.querySelector('.empty-state-small'); if(empty)empty.remove(); albumTracklistEditor.appendChild(newItem);} updateTrackNumbers(); closeAlbumTrackModal(); }
    function updateTrackNumbers() { const tracks=albumTracklistEditor.querySelectorAll('.track-list-item-display'); if(tracks.length===0&&!albumTracklistEditor.querySelector('.empty-state-small')){if(!albumTracklistEditor.querySelector('.empty-state-small')){albumTracklistEditor.innerHTML='<p class="empty-state-small">Nenhuma faixa adicionada.</p>';}} else if(tracks.length>0){const empty=albumTracklistEditor.querySelector('.empty-state-small'); if(empty){empty.remove();}} tracks.forEach((t, i)=>{let num=t.querySelector('.track-number-display'); if(!num){num=document.createElement('span'); num.className='track-number-display'; t.insertBefore(num, t.querySelector('.drag-handle'));} num.textContent=`${i+1}.`; num.style.fontWeight='700'; num.style.color='var(--text-secondary)'; num.style.width='25px'; num.style.textAlign='right'; num.style.marginRight='5px';}); }

    // Funções Airtable (create, update - útil ter update)
    async function createAirtableRecord(tableName, fields) { /* ...código inalterado... */ }
    async function updateAirtableRecord(tableName, recordId, fields) { // <<< NOVA FUNÇÃO UTILITÁRIA
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}/${recordId}`;
        try {
            const r = await fetch(url, { method: 'PATCH', headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: fields }) });
            if (!r.ok) { const e = await r.json(); console.error(`Erro Airtable PATCH ${tableName}/${recordId}:`, JSON.stringify(e, null, 2)); throw new Error(`Airtable PATCH error: ${r.status}`); }
            return await r.json();
        } catch (e) { console.error(`Falha req PATCH ${tableName}/${recordId}:`, e); return null; }
    }
    function parseDurationToSeconds(durationStr) { /* ...código inalterado... */ }

    // --- ATUALIZADO: handleSingleSubmit ---
    async function handleSingleSubmit(event) {
        event.preventDefault();
        const btn = document.getElementById('submitNewSingle');
        btn.disabled = true; btn.textContent = 'Validando...';

        const isExisting = launchExistingTrackCheck.checked;

        try {
            const artistId = singleArtistSelect.value;
            const title = document.getElementById('singleTitle').value; // Nome do Single
            const cover = document.getElementById('singleCoverUrl').value;
            const date = singleReleaseDateInput.value;

            if (!artistId || !title || !cover || !date) {
                 alert("Preencha Artista, Nome do Single, Capa e Data.");
                 throw new Error("Campos básicos do single faltando.");
            }

            if (isExisting) {
                // Lógica para lançar faixa existente
                const existingTrackId = existingTrackSelect.value;
                if (!existingTrackId) {
                    alert("Selecione a Faixa Existente a ser lançada.");
                    throw new Error("Faixa existente não selecionada.");
                }
                await processExistingSingleSubmission(existingTrackId); // Chama nova função

            } else {
                // Lógica original para criar nova faixa
                const track = trackNameInput.value;
                const dur = trackDurationInput.value;
                if (!track || !dur || parseDurationToSeconds(dur) === 0) {
                    alert("Preencha Nome e Duração (MM:SS válida) da Nova Faixa.");
                    throw new Error("Campos da nova faixa faltando ou inválidos.");
                }
                trackTypeModal.classList.remove('hidden'); // Abre modal para tipo de faixa NOVA
                // O botão será reabilitado no cancel/finally do processSingleSubmission
                 btn.textContent = 'Aguardando Tipo...'; // Atualiza texto enquanto modal está aberto
            }
        } catch (error) {
             console.error("Erro na validação do handleSingleSubmit:", error.message);
             btn.disabled = false; // Reabilita botão em caso de erro de validação
             btn.textContent = 'Lançar Single';
        }
    }

    // Processa criação de NOVO single COM NOVA faixa
    async function processSingleSubmission(trackType) {
        const btn = document.getElementById('submitNewSingle');
        trackTypeModal.classList.add('hidden');
        btn.textContent = 'Enviando...';
        btn.disabled = true; // Garante que está desabilitado

        try {
            const artistId = singleArtistSelect.value;
            const title = document.getElementById('singleTitle').value;
            const cover = document.getElementById('singleCoverUrl').value;
            const date = singleReleaseDateInput.value;
            const track = trackNameInput.value;
            const durStr = trackDurationInput.value;
            const durSec = parseDurationToSeconds(durStr);

            // 1. Cria o registro do Single/EP
            const singleRes = await createAirtableRecord('Singles e EPs', {
                "Nome do Single/EP": title,
                "Artista": [artistId],
                "Capa": [{ "url": cover }],
                "Data de Lançamento": date
            });
            if (!singleRes || !singleRes.id) throw new Error("Falha ao criar o registro do Single/EP.");
            const singleId = singleRes.id;

            // 2. Prepara dados da Nova Música
            const featTags = document.querySelectorAll('#singleFeatList .feat-tag');
            let fTrack = track; let fArtists = [artistId]; let collab = null;
            if (featTags.length > 0) {
                const fIds = []; const fNames = [];
                collab = featTags[0].dataset.featType;
                featTags.forEach(t => { fIds.push(t.dataset.artistId); fNames.push(t.dataset.artistName); });
                if (collab === "Feat.") { fTrack = `${track} (feat. ${fNames.join(', ')})`; fArtists = [artistId]; } // Feat não adiciona artista principal
                else if (collab === "Dueto/Grupo") { fTrack = track; fArtists = [artistId, ...fIds]; } // Dueto adiciona
            }
            const musicFields = {
                "Nome da Faixa": fTrack, "Artista": fArtists, "Duração": durSec,
                "Nº da Faixa": 1, "Singles e EPs": [singleId], // Linka ao Single criado
                "Tipo de Faixa": trackType // Usa o tipo selecionado
            };
            if (collab) { musicFields["Tipo de Colaboração"] = collab; }

            // 3. Cria o registro da Música
            const musicRes = await createAirtableRecord('Músicas', musicFields);
            if (!musicRes || !musicRes.id) {
                // Opcional: Tentar deletar o Single criado? (complexo)
                console.error("Single/EP criado, mas falha ao criar a música.");
                throw new Error("Falha ao criar a faixa musical.");
            }

            alert(`Single "${title}" com a nova faixa "${track}" lançado!`);
            newSingleForm.reset(); singleReleaseDateInput.value = new Date().toISOString().split('T')[0];
            document.getElementById('singleFeatList').innerHTML = '';
            launchExistingTrackCheck.checked = false; handleExistingTrackToggle();
            await refreshAllData();

        } catch (e) {
            alert(`Erro ao lançar novo single: ${e.message}`);
            console.error("Erro processSingleSubmission:", e);
        } finally {
            if(btn) { // Verifica se o botão ainda existe
               btn.disabled = false;
               btn.textContent = 'Lançar Single';
            }
        }
    }


    // Processa lançamento de single USANDO FAIXA EXISTENTE
    async function processExistingSingleSubmission(existingTrackId) {
        const btn = document.getElementById('submitNewSingle');
        btn.textContent = 'Enviando...';
        btn.disabled = true;

        try {
            const artistId = singleArtistSelect.value;
            const title = document.getElementById('singleTitle').value; // Nome do Single
            const cover = document.getElementById('singleCoverUrl').value;
            const date = singleReleaseDateInput.value;
            const existingTrack = db.songs.find(s => s.id === existingTrackId);

            if (!existingTrack) throw new Error("Faixa existente não encontrada no DB local.");

            // 1. Cria o NOVO registro de "Singles e EPs" linkando à faixa existente
            const singleFields = {
                "Nome do Single/EP": title,
                "Artista": [artistId], // Assume que o artista principal do single é o mesmo da faixa
                "Capa": [{ "url": cover }],
                "Data de Lançamento": date,
                "Faixa Principal": [existingTrackId] // Link para a música existente (CAMPO NOVO AIRTABLE)
            };
            const singleRes = await createAirtableRecord('Singles e EPs', singleFields);

            if (!singleRes || !singleRes.id) {
                throw new Error("Falha ao criar o registro do Single/EP no Airtable.");
            }
             const newSingleId = singleRes.id; // ID do novo single criado

            // 2. ATUALIZA a música existente para linkar TAMBÉM ao novo single E definir tipo
            // CUIDADO: Isso pode remover o link do álbum original se o campo for single-link.
            // É MELHOR ter um campo "Singles e EPs" na tabela Músicas que seja MULTI-LINK.
             const trackUpdateFields = {
                 "Singles e EPs": [...(existingTrack.singles || []), newSingleId], // Adiciona o novo single aos links existentes
                 "Tipo de Faixa": "Single" // Define ou atualiza o tipo
             };
             // SE o seu campo "Singles e EPs" for single-link, use APENAS:
             // const trackUpdateFields = { "Tipo de Faixa": "Single" }; // E talvez linkar o single na música não seja necessário

             // Removido update na faixa para simplificar e evitar problemas com multi-link
             // const trackUpdateRes = await updateAirtableRecord('Músicas', existingTrackId, trackUpdateFields);
             // if (!trackUpdateRes) {
             //    console.warn("Single criado, mas falha ao atualizar a faixa existente.");
             //    // Não lançar erro fatal, o single foi criado.
             // }

            alert(`Single "${title}" lançado, promovendo a faixa "${existingTrack.title}"!`);
            newSingleForm.reset(); singleReleaseDateInput.value = new Date().toISOString().split('T')[0];
            document.getElementById('singleFeatList').innerHTML='';
            launchExistingTrackCheck.checked = false; handleExistingTrackToggle();
            await refreshAllData();

        } catch (e) {
            alert(`Erro ao lançar single existente: ${e.message}`);
            console.error("Erro processExistingSingle:", e);
        } finally {
             if(btn) {
                btn.disabled = false;
                btn.textContent = 'Lançar Single';
            }
        }
    }

    // ... (initAlbumForm, batchCreateAirtableRecords, handleAlbumSubmit - sem mudanças)...
    function initAlbumForm() { albumTracklistEditor.innerHTML=''; updateTrackNumbers(); if(albumTracklistEditor&&typeof Sortable!=='undefined'){if(albumTracklistSortable){albumTracklistSortable.destroy();} albumTracklistSortable=Sortable.create(albumTracklistEditor,{animation:150, handle:'.drag-handle', onEnd:updateTrackNumbers});} else if(typeof Sortable==='undefined'){console.warn("SortableJS não carregado.");} }
    async function batchCreateAirtableRecords(tableName, records) { const url=`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`; const chunks=[]; for(let i=0; i<records.length; i+=10){chunks.push(records.slice(i, i+10));} const results=[]; for(const chunk of chunks){console.log(`Enviando lote ${tableName}:`, chunk); try{const res=await fetch(url,{method:'POST',headers:{'Authorization':`Bearer ${AIRTABLE_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({"records":chunk.map(fields=>({fields}))})}); if(!res.ok){const e=await res.json(); console.error(`Erro lote ${tableName}:`,JSON.stringify(e,null,2)); throw new Error(`Airtable batch error: ${res.status}`);} const data=await res.json(); results.push(...data.records);} catch(e){console.error(`Falha req batch ${tableName}:`,e); return null;}} return results; }
    async function handleAlbumSubmit(event) { event.preventDefault(); const btn=document.getElementById('submitNewAlbum'); btn.disabled=true; btn.textContent='Enviando...'; try{const artistId=albumArtistSelect.value; const title=document.getElementById('albumTitle').value; const cover=document.getElementById('albumCoverUrl').value; const date=albumReleaseDateInput.value; if(!artistId||!title||!cover||!date){alert("Preencha todos os dados do Álbum/EP."); throw new Error("Campos Álbum faltando.");} const items=albumTracklistEditor.querySelectorAll('.track-list-item-display'); if(items.length===0){alert("Adicione pelo menos uma faixa à tracklist."); throw new Error("Nenhuma faixa.");} let totalDur=0; const musicRecs=[]; for(let i=0; i<items.length; i++){const item=items[i]; const name=item.dataset.trackName; const durStr=item.dataset.durationStr; const type=item.dataset.trackType; const feats=JSON.parse(item.dataset.feats||'[]'); const durSec=parseDurationToSeconds(durStr); if(!name||!durStr||durSec===0){alert(`Dados inválidos na Faixa ${i+1}. Verifique nome e duração.`); throw new Error(`Dados inválidos na Faixa ${i+1}.`);} totalDur+=durSec; let fName=name; let fArts=[artistId]; let collab=null; if(feats.length>0){collab=feats[0].type; const fIds=feats.map(f=>f.id); const fNames=feats.map(f=>f.name); if(collab==="Feat."){fName=`${name} (feat. ${fNames.join(', ')})`; fArts=[artistId];} else if(collab==="Dueto/Grupo"){fName=name; fArts=[artistId,...fIds];}} const rec={"Nome da Faixa":fName, "Artista":fArts, "Duração":durSec, "Nº da Faixa":i+1, "Tipo de Faixa":type}; if(collab){rec["Tipo de Colaboração"]=collab;} musicRecs.push(rec);} const isAlbum=totalDur>=(30*60); const tName=isAlbum?'Álbuns':'Singles e EPs'; const nFld=isAlbum?'Nome do Álbum':'Nome do Single/EP'; const cFld=isAlbum?'Capa do Álbum':'Capa'; const relRes=await createAirtableRecord(tName,{[nFld]:title, "Artista":[artistId], [cFld]:[{"url":cover}], "Data de Lançamento":date}); if(!relRes||!relRes.id){throw new Error("Falha ao criar o registro do Álbum/EP.");} const relId=relRes.id; const linkFld=isAlbum?'Álbuns':'Singles e EPs'; musicRecs.forEach(rec=>{rec[linkFld]=[relId];}); const created=await batchCreateAirtableRecords('Músicas',musicRecs); if(!created||created.length!==musicRecs.length){console.error("Álbum/EP criado, mas falha ao criar as faixas."); throw new Error("Falha ao criar as faixas musicais.");} alert(`${isAlbum ? 'Álbum' : 'EP'} "${title}" lançado com ${musicRecs.length} faixas!`); newAlbumForm.reset(); albumReleaseDateInput.value=new Date().toISOString().split('T')[0]; initAlbumForm(); await refreshAllData();} catch(e){alert(`Erro ao lançar álbum/EP: ${e.message}`); console.error("Erro handleAlbumSubmit:", e);} finally{ if(btn) { btn.disabled=false; btn.textContent='Lançar Álbum / EP'; } } }


    // --- 5. INICIALIZAÇÃO GERAL ---
    function initializeBodyClickListener() { /* ...código inalterado... */ }

    async function main() {
        console.log("Iniciando Aplicação...");
        if (!initializeDOMElements()) return; // Sai se elementos essenciais não foram encontrados

        document.body.classList.add('loading');
        const data = await loadAllData();

        if (data && data.allArtists) { // Verifica se dados essenciais carregaram
            if (!initializeData(data)) { // Sai se a inicialização interna falhar
                document.body.classList.remove('loading'); return;
            }

            try {
                console.log("Calling initializeStudio function...");
                initializeStudio(); // Chama após initializeData

                // Adiciona listeners de submit APÓS initializeStudio ter pego os elementos
                if (newSingleForm) newSingleForm.addEventListener('submit', handleSingleSubmit);
                if (newAlbumForm) newAlbumForm.addEventListener('submit', handleAlbumSubmit);

                // Listeners Modal Tipo Faixa (Single NOVO)
                if (confirmTrackTypeBtn) { confirmTrackTypeBtn.addEventListener('click', () => { processSingleSubmission(trackTypeSelect.value); }); }
                if (cancelTrackTypeBtn) { cancelTrackTypeBtn.addEventListener('click', () => {
                    trackTypeModal.classList.add('hidden');
                    const btn = document.getElementById('submitNewSingle');
                    if(btn) { btn.disabled = false; btn.textContent = 'Lançar Single'; }
                }); }

                // Renderiza componentes iniciais
                renderRPGChart();
                renderChart('music');
                renderChart('album');
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));

                // Configura timers
                setupCountdown('musicCountdownTimer', 'music');
                setupCountdown('albumCountdownTimer', 'album');

                // Configura listeners globais
                initializeBodyClickListener();
                document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', handleBack));

                // Define a view inicial
                switchTab(null, 'homeSection');
                console.log("Aplicação Iniciada com Sucesso.");

            } catch (uiError) {
                console.error("Erro durante a inicialização da UI:", uiError);
                document.body.innerHTML = '<div style="color: white; padding: 20px;"><h1>Erro Interface</h1><p>Ocorreu um erro ao configurar a interface. Ver console.</p></div>';
            }
        } else {
            // Se loadAllData retornou null
            document.body.innerHTML = '<div style="color: white; padding: 20px;"><h1>Erro Crítico</h1><p>Não foi possível carregar os dados essenciais do Airtable. Verifique a conexão e as configurações da API.</p></div>';
            console.error("Initialization failed: Data load error.");
        }
        document.body.classList.remove('loading');
    }

    main(); // Inicia a aplicação

}); // Fim DOMContentLoaded
