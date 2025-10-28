document.addEventListener('DOMContentLoaded', async () => {

    // --- VARIÁVEIS GLOBAIS ---
    let db = { artists: [], albums: [], singles: [], songs: [], players: [] };
    let currentPlayer = null;
    let albumTracklistSortable = null;
    let activeArtist = null;
    let currentFeatTarget = null;
    let viewHistory = [];
    let editingTrackItem = null;
    let previousMusicChartData = {};
    let previousAlbumChartData = {};
    let previousRpgChartData = {};
    let albumCountdownInterval = null;
    let existingTrackModalContext = 'album'; // 'album' or 'single'

    // --- VARIÁVEIS DO PLAYER ---
    let audioElement = null;
    let musicPlayerView = null;
    let playerCloseBtn = null;
    let playerAlbumTitle = null;
    let playerCoverArt = null;
    let playerSongTitle = null;
    let playerArtistName = null;
    let playerSeekBar = null;
    let playerCurrentTime = null;
    let playerTotalTime = null;
    let playerShuffleBtn = null;
    let playerPrevBtn = null;
    let playerPlayPauseBtn = null;
    let playerNextBtn = null;
    let playerRepeatBtn = null;
    let currentSong = null;
    let currentQueue = [];
    let currentQueueIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let repeatMode = 'none';

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
        editingTrackExistingId, // NOVO
        inlineFeatAdder, inlineFeatArtistSelect, inlineFeatTypeSelect,
        confirmInlineFeatBtn, cancelInlineFeatBtn, addInlineFeatBtn,
        editReleaseSection, editReleaseListContainer, editReleaseList, editReleaseForm,
        editReleaseId, editReleaseType, editReleaseTableName, editArtistNameDisplay,
        editReleaseTitle, editReleaseCoverUrl, editReleaseDate, cancelEditBtn, saveEditBtn,
        deleteConfirmModal, deleteReleaseName, deleteRecordId, deleteTableName,
        deleteTrackIds, cancelDeleteBtn, confirmDeleteBtn,
        // NOVOS ELEMENTOS
        toggleExistingSingle, newTrackInfoGroup, existingTrackGroup,
        existingTrackSelect, existingSingleTrackId, singleFeatSection,
        openExistingTrackModalBtn, existingTrackModal, existingTrackSearch,
        existingTrackResults, cancelExistingTrackBtn, editArtistFilterSelect;


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
             editingTrackExistingId = document.getElementById('editingTrackExistingId');
             inlineFeatAdder = document.getElementById('inlineFeatAdder');
             inlineFeatArtistSelect = document.getElementById('inlineFeatArtistSelect');
             inlineFeatTypeSelect = document.getElementById('inlineFeatTypeSelect');
             confirmInlineFeatBtn = document.getElementById('confirmInlineFeatBtn');
             cancelInlineFeatBtn = document.getElementById('cancelInlineFeatBtn');
             addInlineFeatBtn = albumTrackModal?.querySelector('.add-inline-feat-btn');
             audioElement = document.getElementById('audioElement');
             musicPlayerView = document.getElementById('musicPlayer');
             playerCloseBtn = document.querySelector('.player-close-btn');
             playerAlbumTitle = document.getElementById('playerAlbumTitle');
             playerCoverArt = document.getElementById('playerCoverArt');
             playerSongTitle = document.getElementById('playerSongTitle');
             playerArtistName = document.getElementById('playerArtistName');
             playerSeekBar = document.getElementById('playerSeekBar');
             playerCurrentTime = document.getElementById('playerCurrentTime');
             playerTotalTime = document.getElementById('playerTotalTime');
             playerShuffleBtn = document.getElementById('playerShuffleBtn');
             playerPrevBtn = document.getElementById('playerPrevBtn');
             playerPlayPauseBtn = document.getElementById('playerPlayPauseBtn');
             playerNextBtn = document.getElementById('playerNextBtn');
             playerRepeatBtn = document.getElementById('playerRepeatBtn');
             editReleaseSection = document.getElementById('editReleaseSection');
             editReleaseListContainer = document.getElementById('editReleaseListContainer');
             editReleaseList = document.getElementById('editReleaseList');
             editReleaseForm = document.getElementById('editReleaseForm');
             editReleaseId = document.getElementById('editReleaseId');
             editReleaseType = document.getElementById('editReleaseType');
             editReleaseTableName = document.getElementById('editReleaseTableName');
             editArtistNameDisplay = document.getElementById('editArtistNameDisplay');
             editReleaseTitle = document.getElementById('editReleaseTitle');
             editReleaseCoverUrl = document.getElementById('editReleaseCoverUrl');
             editReleaseDate = document.getElementById('editReleaseDate');
             cancelEditBtn = document.getElementById('cancelEditBtn');
             saveEditBtn = document.getElementById('saveEditBtn');
             deleteConfirmModal = document.getElementById('deleteConfirmModal');
             deleteReleaseName = document.getElementById('deleteReleaseName');
             deleteRecordId = document.getElementById('deleteRecordId');
             deleteTableName = document.getElementById('deleteTableName');
             deleteTrackIds = document.getElementById('deleteTrackIds');
             cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
             confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

            // --- INICIALIZAÇÃO DOS NOVOS ELEMENTOS ---
            toggleExistingSingle = document.getElementById('toggleExistingSingle');
            newTrackInfoGroup = document.getElementById('newTrackInfoGroup');
            existingTrackGroup = document.getElementById('existingTrackGroup');
            existingTrackSelect = document.getElementById('existingTrackSelect');
            existingSingleTrackId = document.getElementById('existingSingleTrackId');
            singleFeatSection = document.getElementById('singleFeatSection');
            openExistingTrackModalBtn = document.getElementById('openExistingTrackModalBtn');
            existingTrackModal = document.getElementById('existingTrackModal');
            existingTrackSearch = document.getElementById('existingTrackSearch');
            existingTrackResults = document.getElementById('existingTrackResults');
            cancelExistingTrackBtn = document.getElementById('cancelExistingTrackBtn');
            editArtistFilterSelect = document.getElementById('editArtistFilterSelect');

            const playerElements = [audioElement, musicPlayerView, playerCloseBtn, playerPlayPauseBtn, playerSeekBar, playerNextBtn, playerPrevBtn];
            if (playerElements.some(el => !el)) {
                 console.error("ERRO CRÍTICO: Elementos essenciais do PLAYER não foram encontrados!");
                 return false;
            }

            const essentialElements = [
                 studioView, loginPrompt, newSingleForm, newAlbumForm, featModal,
                 singleReleaseDateInput, albumReleaseDateInput, trackTypeModal,
                 albumTrackModal, openAddTrackModalBtn, inlineFeatAdder, inlineFeatArtistSelect,
                 confirmInlineFeatBtn, addInlineFeatBtn,
                 editReleaseSection, editReleaseListContainer, editReleaseList, editReleaseForm,
                 cancelEditBtn, saveEditBtn,
                 deleteConfirmModal, cancelDeleteBtn, confirmDeleteBtn,
                 // Novos essenciais
                 toggleExistingSingle, newTrackInfoGroup, existingTrackGroup, existingTrackSelect,
                 openExistingTrackModalBtn, existingTrackModal, existingTrackSearch, existingTrackResults, cancelExistingTrackBtn,editArtistFilterSelect
            ];
            if (!allViews || allViews.length === 0 || essentialElements.some(el => !el)) {
                // Adiciona IDs aos logs para facilitar a depuração
                const missingElementsDetails = essentialElements
                     .map((el, i) => (el ? null : { index: i, id: essentialElements[i]?.id || 'ID não encontrado' }))
                     .filter(Boolean);
                console.error("ERRO CRÍTICO: Elementos essenciais do HTML não foram encontrados!", { missing: missingElementsDetails });

                document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Interface</h1><p>Elementos não encontrados. Ver console.</p></div>';
                return false;
            }


           // *** MODIFICADO PARA DATETIME-LOCAL ***
           // Formata para datetime-local (YYYY-MM-DDTHH:MM)
           const now = new Date();
           now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Ajusta para o fuso horário local
           now.setSeconds(0); // Zera segundos
           now.setMilliseconds(0); // Zera milissegundos
           const localISOTime = now.toISOString().slice(0, 16); // Pega "YYYY-MM-DDTHH:MM"

           if(singleReleaseDateInput) singleReleaseDateInput.value = localISOTime;
           if(albumReleaseDateInput) albumReleaseDateInput.value = localISOTime;

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
                 fetchAllAirtablePages(playersURL, fetchOptions)
            ]);

            if (!playersData) console.error("Falha ao carregar dados dos Jogadores.");
            if (!artistsData || !albumsData || !musicasData || !singlesData) throw new Error('Falha ao carregar dados essenciais.');

            const musicasMap = new Map();
            (musicasData.records || []).forEach(r => {
                const artistIds = Array.isArray(r.fields['Artista']) ? r.fields['Artista'] : [r.fields['Artista']].filter(Boolean);
                const albumLinks = r.fields['Álbuns'] || [];
                const singleLinks = r.fields['Singles e EPs'] || [];
                const pId = (albumLinks[0]) || (singleLinks[0]) || null;

                musicasMap.set(r.id, {
                    id: r.id,
                    title: r.fields['Nome da Faixa']||'?',
                    duration: r.fields['Duração']?new Date(r.fields['Duração']*1000).toISOString().substr(14,5):"0:00",
                    trackNumber: r.fields['Nº da Faixa']||0,
                    durationSeconds: r.fields['Duração']||0,
                    artistIds: artistIds,
                    collabType: r.fields['Tipo de Colaboração'],
                    albumId: pId,
                    albumIds: albumLinks,
                    singleIds: singleLinks,
                    streams: r.fields.Streams||0,
                    totalStreams: r.fields['Streams Totais']||0,
                    trackType: r.fields['Tipo de Faixa'] || 'Album Track'
                });
            });

            const artistsMapById = new Map();
            const artistsList = (artistsData.records || []).map(r => {
                const a = {
                    id: r.id,
                    name: r.fields.Name||'?',
                    imageUrl: (r.fields['URL da Imagem']?.[0]?.url) || 'https://i.imgur.com/AD3MbBi.png',
                    off: r.fields['Inspirações (Off)']||[],
                    RPGPoints: r.fields.RPGPoints||0,
                    LastActive: r.fields.LastActive||null
                };
                artistsMapById.set(a.id, a.name);
                return a;
            });

            const formatReleases = (records, isAlbum) => {
                if (!records) return [];
                return records.map(r => {
                    const f=r.fields; const id=r.id;
                    const tracks = Array.from(musicasMap.values())
                         .filter(s => (isAlbum ? s.albumIds.includes(id) : s.singleIds.includes(id)))
                         .sort((a,b)=>(a.trackNumber||0)-(b.trackNumber||0));

                    const dur = tracks.reduce((t, tr) => t+(tr.durationSeconds||0), 0);
                    const totalAlbumStreams = tracks.reduce((t, tr) => t + (tr.totalStreams || 0), 0);

                    const artId = Array.isArray(f['Artista']) ? f['Artista'][0] : (f['Artista']||null);
                    const artName = artId ? artistsMapById.get(artId) : "?";
                    const imgF = isAlbum?'Capa do Álbum':'Capa';
                    const imgUrl = (f[imgF]?.[0]?.url)||'https://i.imgur.com/AD3MbBi.png';

                    // IMPORTANTE: Assume que 'Data de Lançamento' é um campo DATETIME no Airtable
                    // e retorna uma string ISO 8601 UTC (ex: "2025-10-28T18:00:00.000Z")
                    const releaseDateISO = f['Data de Lançamento'] || null;

                    return {
                        id: id,
                        title: f['Nome do Álbum']||f['Nome do Single/EP']||'?',
                        artist: artName,
                        artistId: artId,
                        metascore: f['Metascore']||0,
                        imageUrl: imgUrl,
                        releaseDate: releaseDateISO, // Armazena a string ISO 8601 completa
                        tracks: tracks,
                        trackIds: tracks.map(t => t.id),
                        totalDurationSeconds: dur,
                        weeklyStreams: f['Stream do album'] || 0,
                        totalStreams: totalAlbumStreams,
                        type: isAlbum ? 'album' : 'single',
                        tableName: isAlbum ? 'Álbuns' : 'Singles e EPs'
                    };
                });
            };

            const formattedAlbums = formatReleases(albumsData.records, true);
            const formattedSingles = formatReleases(singlesData.records, false);

            const formattedPlayers = (playersData?.records||[]).map(r => ({
                id: r.id,
                name: r.fields.Nome,
                password: r.fields.Senha,
                artists: r.fields.Artistas||[]
            }));

            console.log("Dados carregados.");
            return {
                allArtists: artistsList,
                albums: formattedAlbums,
                singles: formattedSingles,
                players: formattedPlayers,
                musicas: Array.from(musicasMap.values())
            };
        } catch (error) {
            console.error("Falha GERAL loadAllData:", error);
            return null;
        }
    }

    // initializeData
    const initializeData = (data) => {
        try {
            try {
                const prevMusic = localStorage.getItem(PREVIOUS_MUSIC_CHART_KEY);
                previousMusicChartData = prevMusic ? JSON.parse(prevMusic) : {};
                const prevAlbum = localStorage.getItem(PREVIOUS_ALBUM_CHART_KEY);
                previousAlbumChartData = prevAlbum ? JSON.parse(prevAlbum) : {};
                const prevRpg = localStorage.getItem(PREVIOUS_RPG_CHART_KEY);
                previousRpgChartData = prevRpg ? JSON.parse(prevRpg) : {};
                console.log("Previous chart data loaded.");
            } catch (e) {
                console.error("Error loading previous chart data:", e);
                previousMusicChartData = {}; previousAlbumChartData = {}; previousRpgChartData = {};
            }


            const artistsMapById = new Map();
            db.artists = (data.allArtists || []).map(artist => {
                const artistEntry = {
                    ...artist,
                    img: artist.imageUrl || 'https://i.imgur.com/AD3MbBi.png',
                    albums: [],
                    singles: []
                };
                artistsMapById.set(artist.id, artist.name);
                return artistEntry;
            });

            const releaseDateMap = new Map();
            const allReleasesForDateMap = [...(data.albums || []), ...(data.singles || [])];
            allReleasesForDateMap.forEach(item => {
                releaseDateMap.set(item.id, item.releaseDate); // Armazena a string ISO completa
            });

             // Processa as músicas (MODIFICADO para encontrar a data mais antiga)
             db.songs = (data.musicas || []).map(song => {

                // Lógica para encontrar a data de lançamento mais antiga
                const allLinkedIds = [...(song.albumIds || []), ...(song.singleIds || [])];
                let earliestDate = null;

                if (allLinkedIds.length > 0) {
                    const allDates = allLinkedIds
                        .map(id => releaseDateMap.get(id))
                        .filter(Boolean)
                        .map(dateStr => new Date(dateStr));

                    if (allDates.length > 0) {
                        const validDates = allDates.filter(d => !isNaN(d.getTime()));
                        if (validDates.length > 0) {
                            earliestDate = new Date(Math.min.apply(null, validDates));
                        }
                    }
                }
                // Salva como string ISO 8601 completa
                const earliestDateString = earliestDate ? earliestDate.toISOString() : null;

                return {
                    ...song,
                    streams: song.streams || 0,
                    totalStreams: song.totalStreams || 0,
                    cover: 'https://i.imgur.com/AD3MbBi.png',
                    artist: artistsMapById.get((song.artistIds || [])[0]) || '?',
                    parentReleaseDate: earliestDateString // Armazena a data MAIS ANTIGA (ISO String)
                };
            });


            db.albums = [];
            db.singles = [];

            // Processa os lançamentos
            const allReleases = [...(data.albums || []), ...(data.singles || [])];

            allReleases.forEach(item => {
                // Atualiza a capa das músicas associadas
                (item.trackIds || []).forEach(trackId => {
                    const s = db.songs.find(sDb => sDb.id === trackId);
                    if (s && s.albumId === item.id && s.cover === 'https://i.imgur.com/AD3MbBi.png') {
                        s.cover = item.imageUrl;
                    } else if (s && !s.albumId) {
                        if (s.cover === 'https://i.imgur.com/AD3MbBi.png') s.cover = item.imageUrl;
                        s.albumId = item.id;
                        // parentReleaseDate já foi definido como o mais antigo
                    }
                    // Garante que parentReleaseDate exista (redundante com a lógica acima, mas seguro)
                    if (s && !s.parentReleaseDate && releaseDateMap.has(s.albumId)) {
                        s.parentReleaseDate = releaseDateMap.get(s.albumId);
                    }
                });

                // Adiciona o lançamento ao artista correto
                const artistEntry = db.artists.find(a => a.id === item.artistId);
                if (item.type === 'album') {
                    db.albums.push(item);
                    if (artistEntry) { artistEntry.albums.push(item); }
                } else {
                    db.singles.push(item);
                    if (artistEntry) { artistEntry.singles.push(item); }
                }
                if (!artistEntry && item.artist !== "?") {
                    console.warn(`Artist ${item.artist} (${item.artistId}) for release ${item.id} not found.`);
                }
            });

            db.players = data.players || [];

            console.log(`DB Init: A${db.artists.length}, B${db.albums.length}, S${db.singles.length}, M${db.songs.length}, P${db.players.length}`);
            return true;
        } catch (error) {
            console.error("CRITICAL initializeData:", error);
            alert("Erro GRAVE init data.");
            return false;
        }
    };

    // saveChartDataToLocalStorage
    const saveChartDataToLocalStorage = (chartType) => {
        let currentChartData; let storageKey; let dataList;
        console.log(`Saving previous chart data for: ${chartType}`);

        if (chartType === 'music') {
            storageKey = PREVIOUS_MUSIC_CHART_KEY;
            dataList = [...db.songs].sort((a,b)=>(b.streams||0)-(a.streams||0)).slice(0,50);
            currentChartData = dataList.reduce((acc,item,index)=>{ acc[item.id]=index+1; return acc; },{});
            previousMusicChartData=currentChartData;

        } else if (chartType === 'album') {
            storageKey = PREVIOUS_ALBUM_CHART_KEY;
             dataList = [...db.albums, ...db.singles]
                 .filter(item => (item.weeklyStreams || 0) > 0)
                 .sort((a, b) => (b.weeklyStreams || 0) - (a.weeklyStreams || 0))
                 .slice(0, 50);
            currentChartData = dataList.reduce((acc,item,index)=>{ acc[item.id]=index+1; return acc; },{});
            previousAlbumChartData=currentChartData;

        } else if (chartType === 'rpg') {
            storageKey = PREVIOUS_RPG_CHART_KEY;
            dataList = computeChartData(db.artists);
            currentChartData = dataList.reduce((acc,item,index)=>{ acc[item.id]=index+1; return acc; },{});
            previousRpgChartData=currentChartData;

        } else {
            console.error("Invalid chartType:", chartType);
            return;
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(currentChartData));
            console.log(`${chartType} chart saved.`);
        } catch (e) {
            console.error(`Error saving ${chartType} chart:`, e);
        }
    };

    // refreshAllData
    async function refreshAllData() {
        console.log("Atualizando dados...");
        document.body.classList.add('loading');
        const data = await loadAllData();
        if (data && data.allArtists) {
            if (initializeData(data)) {
                console.log("Dados atualizados.");
                renderRPGChart();
                renderArtistsGrid('homeGrid', [...(db.artists||[])].sort(()=>0.5-Math.random()).slice(0,10));
                renderChart('music');
                renderChart('album');
                if (currentPlayer) {
                    populateArtistSelector(currentPlayer.id);
                    if (document.querySelector('.studio-tab-btn[data-form="edit"]')?.classList.contains('active')) {
                        populateEditableReleases();
                         editReleaseForm?.classList.add('hidden');
                         editReleaseListContainer?.classList.remove('hidden');
                    }
                     // Repopula o select de faixas existentes se estiver visível
                     if (toggleExistingSingle?.checked) {
                         populatePlayerTracks('existingTrackSelect');
                     }
                }
                if (activeArtist && !document.getElementById('artistDetail')?.classList.contains('hidden')) {
                    const refreshed = db.artists.find(a=>a.id===activeArtist.id);
                    if(refreshed){ openArtistDetail(refreshed.name); } else { handleBack(); }
                }
                try {
                     attachNavigationListeners();
                } catch (listenerError) {
                     console.error("Erro ao reatribuir listeners de navegação:", listenerError);
                }
                document.body.classList.remove('loading');
                return true;
            }
        }
        console.error("Falha ao atualizar.");
        alert("Não foi possível atualizar.");
        document.body.classList.remove('loading');
        return false;
    }


    // --- 2. NAVEGAÇÃO E UI ---

    // switchView
    const switchView = (viewId, targetSectionId = null) => {
        console.log(`Switching view: ${viewId}`);
        const currentView = document.querySelector('.page-view:not(.hidden)');
        if (currentView && currentView.id === 'albumDetail' && viewId !== 'albumDetail' && albumCountdownInterval) {
            console.log("Clearing album countdown interval.");
            clearInterval(albumCountdownInterval);
            albumCountdownInterval = null;
        }
        allViews.forEach(v => v.classList.add('hidden'));
        const target = document.getElementById(viewId);
        if (target) {
            target.classList.remove('hidden');
            window.scrollTo(0,0);
            if (viewId !== 'mainView' && viewId !== 'studioView') {
                if (viewHistory.length === 0 || viewHistory[viewHistory.length - 1] !== viewId) {
                    viewHistory.push(viewId);
                }
            } else if (viewId === 'mainView') {
                 viewHistory = [];
            }
             console.log("View history:", viewHistory);
        } else {
            console.error(`View ${viewId} not found.`);
        }
    };

    // activateMainViewSection
    function activateMainViewSection(sectionId) {
        document.querySelectorAll('#mainView .content-section').forEach(s => s.classList.remove('active'));
        const targetSection = document.getElementById(sectionId);
        if (targetSection && document.getElementById('mainView').contains(targetSection)) {
            targetSection.classList.add('active');
        } else {
            console.warn(`Section with ID ${sectionId} not found inside mainView.`);
            document.getElementById('homeSection')?.classList.add('active');
            return 'homeSection';
        }
        return sectionId;
    }

    // switchTab
    const switchTab = (event, forceTabId = null) => {
        let tabId;
        console.log("switchTab triggered. Event:", event, "forceTabId:", forceTabId);

        if (forceTabId) {
             tabId = forceTabId;
        } else if (event) {
             event.preventDefault();
             const clickedButton = event.target.closest('[data-tab]');
             if (!clickedButton) {
                 console.log("switchTab exiting: Click target or parent does not have data-tab");
                 return;
             }
             tabId = clickedButton.dataset.tab;
        } else {
            console.log("switchTab exiting: No event or forceTabId");
            return;
        }
        console.log("Target Tab ID:", tabId);

        if (tabId === 'studioSection') {
            console.log("Switching view TO studioView");
            switchView('studioView');
            const activeStudioTabButton = document.querySelector('.studio-tab-btn.active');
            if (activeStudioTabButton?.dataset.form === 'edit') {
                populateEditableReleases();
                 editReleaseListContainer?.classList.remove('hidden');
                 editReleaseForm?.classList.add('hidden');
            }
        } else {
            const isMainViewHidden = document.getElementById('mainView')?.classList.contains('hidden');
            if (isMainViewHidden) {
                console.log("Switching view TO mainView");
                switchView('mainView');
            } else {
                console.log("mainView is already visible.");
            }
            console.log("Activating section inside mainView:", tabId);
            tabId = activateMainViewSection(tabId);
        }

        console.log("Updating navigation button active states for tab:", tabId);
        document.querySelectorAll('.nav-tab, .bottom-nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`.nav-tab[data-tab="${tabId}"], .bottom-nav-item[data-tab="${tabId}"]`).forEach(b => b.classList.add('active'));
    };

    // handleBack
    const handleBack = () => {
        const currentView = document.querySelector('.page-view:not(.hidden)');
         if (currentView && currentView.id === 'albumDetail' && albumCountdownInterval) {
            console.log("Clearing album countdown interval on back.");
            clearInterval(albumCountdownInterval);
            albumCountdownInterval = null;
         }
        viewHistory.pop();
        const prevId = viewHistory.pop() || 'mainView';
        console.log("Going back to view:", prevId);
        switchView(prevId);
    };

    // renderArtistsGrid, formatArtistString, getCoverUrl
    const renderArtistsGrid = (containerId, artists) => { const c = document.getElementById(containerId); if(!c){console.error(`Grid ${containerId} not found.`); return;} if(!artists||artists.length===0){c.innerHTML='<p class="empty-state">Nenhum artista.</p>'; return;} c.innerHTML = artists.map(a => `<div class="artist-card" data-artist-name="${a.name}"><img src="${a.img||a.imageUrl||'https://i.imgur.com/AD3MbBi.png'}" alt="${a.name}" class="artist-card-img"><p class="artist-card-name">${a.name}</p><span class="artist-card-type">Artista</span></div>`).join(''); };
    function formatArtistString(artistIds, collabType) { if (!artistIds || artistIds.length === 0) return "?"; const names = artistIds.map(id => { const a = db.artists.find(art => art.id === id); return a ? a.name : "?"; }); const main = names[0]; if (names.length === 1) return main; const others = names.slice(1).join(', '); if (collabType === 'Dueto/Grupo') { return `${main} & ${others}`; } else { return main; } }
    function getCoverUrl(albumId) { if (!albumId) return 'https://i.imgur.com/AD3MbBi.png'; const r = [...db.albums, ...db.singles].find(a => a.id === albumId); return (r ? r.imageUrl : 'https://i.imgur.com/AD3MbBi.png'); }

  // renderChart
    const renderChart = (type) => {
        let containerId, dataList, previousData;
        const now = new Date(); // Pega a data/hora atual

        if (type === 'music') {
            containerId = 'musicChartsList';
            dataList = [...db.songs]
                 .filter(song => (song.streams || 0) > 0 && song.parentReleaseDate && new Date(song.parentReleaseDate) <= now)
                 .sort((a, b) => (b.streams || 0) - (a.streams || 0))
                 .slice(0, 50);
            previousData = previousMusicChartData;
        } else { // type === 'album'
            containerId = 'albumChartsList';
             dataList = [...db.albums, ...db.singles]
                 // Filtra por streams E se já foi lançado
                 .filter(item => (item.weeklyStreams || 0) > 0 && item.releaseDate && new Date(item.releaseDate) <= now)
                 .sort((a, b) => (b.weeklyStreams || 0) - (a.weeklyStreams || 0))
                 .slice(0, 50);
            previousData = previousAlbumChartData;
        }

        const container = document.getElementById(containerId);
        if (!container) { console.error(`Chart ${containerId} not found.`); return; }
        if (!dataList || dataList.length === 0) { container.innerHTML = `<p class="empty-state">Nenhum item no chart.</p>`; return; }

         container.innerHTML = dataList.map((item, index) => {
            const currentRank = index + 1;
            const previousRank = previousData[item.id];
            let iconClass = 'fa-minus';
            let trendClass = 'trend-stable';
            if (previousRank === undefined) { trendClass = 'trend-new'; }
            else if (currentRank < previousRank) { iconClass = 'fa-caret-up'; trendClass = 'trend-up'; }
           else if (currentRank > previousRank) { iconClass = 'fa-caret-down'; trendClass = 'trend-down'; }
            const indicatorHtml = `<span class="chart-rank-indicator ${trendClass}"><i class="fas ${iconClass}"></i></span>`;
            if (type === 'music') {
                const artistName = formatArtistString(item.artistIds, item.collabType);
                return `<div class="chart-item" data-song-id="${item.id}">${indicatorHtml}<span class="chart-rank">${currentRank}</span><img src="${item.cover || getCoverUrl(item.albumId)}" alt="${item.title}" class="chart-item-img"><div class="chart-item-info"><span class="chart-item-title">${item.title}</span><span class="chart-item-artist">${artistName}</span></div><span class="chart-item-duration">${(item.streams || 0).toLocaleString('pt-BR')}</span></div>`;
            } else { // type === 'album'
                return `<div class="chart-item" data-album-id="${item.id}">${indicatorHtml}<span class="chart-rank">${currentRank}</span><img src="${item.imageUrl}" alt="${item.title}" class="chart-item-img"><div class="chart-item-info"><span class="chart-item-title">${item.title}</span><span class="chart-item-artist">${item.artist}</span></div><span class="chart-item-score">${(item.weeklyStreams || 0).toLocaleString('pt-BR')}</span></div>`;
            }
        }).join('');
    };

    // openArtistDetail (CORREÇÃO DE ORDENAÇÃO)
    const openArtistDetail = (artistName) => {
        const artist = db.artists.find(a => a.name === artistName);
        if (!artist) { console.error(`Artista "${artistName}" não encontrado.`); handleBack(); return; }

        activeArtist = artist;
        document.getElementById('detailBg').style.backgroundImage = `url(${artist.img})`;
        document.getElementById('detailName').textContent = artist.name;

        const now = new Date();

        const popularSongs = [...db.songs]
            .filter(s => s.artistIds && s.artistIds.includes(artist.id) && (s.totalStreams || 0) > 0 && s.parentReleaseDate && new Date(s.parentReleaseDate) <= now)
            .sort( (a, b) => (b.totalStreams || 0) - (a.totalStreams || 0))
            .slice(0, 5);

        const popularContainer = document.getElementById('popularSongsList');
        if (popularSongs.length > 0) {
            popularContainer.innerHTML = popularSongs.map( (song, index) =>
                 `<div class="song-row" data-song-id="${song.id}"><span>${index + 1}</span><div class="song-row-info"><img src="${song.cover || getCoverUrl(song.albumId)}" alt="${song.title}" class="song-row-cover"><span class="song-row-title">${song.title}</span></div><span class="song-streams">${(song.totalStreams || 0).toLocaleString('pt-BR')}</span></div>`
            ).join('');
        } else {
            popularContainer.innerHTML = '<p class="empty-state-small">Nenhuma música popular lançada.</p>';
        }

        const albumsContainer = document.getElementById('albumsList');
        // *** INÍCIO DA CORREÇÃO DE ORDENAÇÃO ***
        const nowSort = new Date();
        const customSort = (a, b) => {
            const dateA = new Date(a.releaseDate);
            const dateB = new Date(b.releaseDate);
            const isAFuture = dateA > nowSort;
            const isBFuture = dateB > nowSort;

            if (isAFuture && isBFuture) {
                return dateA - dateB; // Future dates ascending (closest first)
            } else if (isAFuture) {
                return -1; // Future always comes before past
            } else if (isBFuture) {
                return 1; // Past always comes after future
            } else {
                return dateB - dateA; // Past dates descending (most recent first)
            }
        };

        const sortedAlbums = (artist.albums || []).sort(customSort);
        albumsContainer.innerHTML = sortedAlbums.map(album => `<div class="scroll-item" data-album-id="${album.id}"><img src="${album.imageUrl}" alt="${album.title}"><p>${album.title}</p><span>${new Date(album.releaseDate).getFullYear()}</span></div>`).join('') || '<p class="empty-state-small">Nenhum álbum.</p>';

        const singlesContainer = document.getElementById('singlesList');
        const sortedSingles = (artist.singles || []).sort(customSort);
        // *** FIM DA CORREÇÃO DE ORDENAÇÃO ***
        singlesContainer.innerHTML = sortedSingles.map(single => `<div class="scroll-item" data-album-id="${single.id}"><img src="${single.imageUrl}" alt="${single.title}"><p>${single.title}</p><span>${new Date(single.releaseDate).getFullYear()}</span></div>`).join('') || '<p class="empty-state-small">Nenhum single.</p>';

        const recommended = [...db.artists].filter(a => a.id !== artist.id).sort( () => 0.5 - Math.random()).slice(0, 5);
        renderArtistsGrid('recommendedGrid', recommended);
        switchView('artistDetail');
    };

    // openAlbumDetail (CORREÇÃO PRE-RELEASE)
    const openAlbumDetail = (albumId) => {
        const album = [...db.albums, ...db.singles].find(a => a.id === albumId);
        if (!album) { console.error(`Álbum/Single ID "${albumId}" não encontrado.`); return; }
        if (albumCountdownInterval) {
            clearInterval(albumCountdownInterval);
            albumCountdownInterval = null;
            console.log("Cleared previous album countdown interval.");
        }
        const countdownContainer = document.getElementById('albumCountdownContainer');
        const normalInfoContainer = document.getElementById('albumNormalInfoContainer');
        const tracklistContainer = document.getElementById('albumTracklist');
        document.getElementById('albumDetailBg').style.backgroundImage = `url(${album.imageUrl})`;
        document.getElementById('albumDetailCover').src = album.imageUrl;
        document.getElementById('albumDetailTitle').textContent = album.title;
        const releaseDate = new Date(album.releaseDate); // Usa a data ISO completa
        const now = new Date();
        const isPreRelease = releaseDate > now; // Comparação time-sensitive
        const artistObj = db.artists.find(a => a.id === album.artistId);

        if (isPreRelease) {
            normalInfoContainer?.classList.add('hidden');
            countdownContainer?.classList.remove('hidden');
            const releaseDateStr = releaseDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            document.getElementById('albumCountdownReleaseDate').textContent = releaseDateStr;
            startAlbumCountdown(album.releaseDate, 'albumCountdownTimer');
            tracklistContainer.innerHTML = (album.tracks || []).map(track => {
                const fullSong = db.songs.find(s => s.id === track.id);

                 // --- INÍCIO DA MODIFICAÇÃO (CORREÇÃO PRE-RELEASE) ---
                 let isAvailable = false;
                 const preReleaseTypes = ['Title Track', 'Pre-release Single'];

                 if (fullSong) {
                     const hasReleased = fullSong.parentReleaseDate && new Date(fullSong.parentReleaseDate) <= now;
                     const isPreReleaseType = preReleaseTypes.includes(fullSong.trackType);
                     isAvailable = hasReleased || isPreReleaseType;
                 }
                 // --- FIM DA MODIFICAÇÃO ---

                const artistName = formatArtistString(track.artistIds, track.collabType);
                const trackNumDisplay = track.trackNumber ? track.trackNumber : '?';
                if (isAvailable) {
                    return `<div class="track-row available" data-song-id="${track.id}">
                             <span class="track-number"><i class="fas fa-play"></i></span>
                             <div class="track-info">
                                 <span class="track-title">${track.title}</span>
                                 <span class="track-artist-feat">${artistName}</span>
                             </div>
                             <span class="track-duration">${track.duration}</span>
                         </div>`;
                } else {
                    return `<div class="track-row unavailable">
                             <span class="track-number">${trackNumDisplay}</span>
                             <div class="track-info">
                                 <span class="track-title">${track.title}</span>
                                 <span class="track-artist-feat">${artistName}</span>
                             </div>
                             <span class="track-duration"><i class="fas fa-lock"></i></span>
                         </div>`;
                }
            }).join('');
        } else {
            normalInfoContainer?.classList.remove('hidden');
            countdownContainer?.classList.add('hidden');
            const releaseYear = releaseDate.getFullYear();
            const totalAlbumStreamsFormatted = (album.totalStreams || 0).toLocaleString('pt-BR');
            document.getElementById('albumDetailInfo').innerHTML = `Por <strong class="artist-link" data-artist-name="${artistObj ? artistObj.name : ''}">${album.artist}</strong> • ${releaseYear} • ${totalAlbumStreamsFormatted} streams totais`;
            tracklistContainer.innerHTML = (album.tracks || []).map(song => {
                const artistName = formatArtistString(song.artistIds, song.collabType);
                const streams = (song.totalStreams || 0);
                const trackNumDisplay = song.trackNumber ? song.trackNumber : '?';
                return `<div class="track-row" data-song-id="${song.id}">
                         <span class="track-number">${trackNumDisplay}</span>
                         <div class="track-info">
                             <span class="track-title">${song.title}</span>
                             <span class="track-artist-feat">${artistName}</span>
                         </div>
                         <span class="track-duration">${streams.toLocaleString('pt-BR')}</span>
                     </div>`;
            }).join('');
        }
        switchView('albumDetail');
    };

    // openDiscographyDetail (CORREÇÃO DE ORDENAÇÃO)
    const openDiscographyDetail = (type) => {
        if (!activeArtist) { console.error("Nenhum artista ativo."); handleBack(); return; }
        // *** INÍCIO DA CORREÇÃO DE ORDENAÇÃO ***
        const nowSort = new Date();
        const customSort = (a, b) => {
            const dateA = new Date(a.releaseDate);
            const dateB = new Date(b.releaseDate);
            const isAFuture = dateA > nowSort;
            const isBFuture = dateB > nowSort;

            if (isAFuture && isBFuture) {
                return dateA - dateB; // Future dates ascending
            } else if (isAFuture) {
                return -1; // Future before past
            } else if (isBFuture) {
                return 1; // Past after future
            } else {
                return dateB - dateA; // Past dates descending
            }
        };

        const data = (type==='albums')
            ? (activeArtist.albums || []).sort(customSort)
            : (activeArtist.singles||[]).sort(customSort);
        // *** FIM DA CORREÇÃO DE ORDENAÇÃO ***
        const title = (type==='albums')?`Álbuns de ${activeArtist.name}`:`Singles & EPs de ${activeArtist.name}`;
        document.getElementById('discographyTypeTitle').textContent = title;
        const grid = document.getElementById('discographyGrid');
        grid.innerHTML = data.map(item => `<div class="scroll-item" data-album-id="${item.id}"><img src="${item.imageUrl}" alt="${item.title}"><p>${item.title}</p><span>${new Date(item.releaseDate).getFullYear()}</span></div>`).join('') || '<p class="empty-state">Nenhum lançamento.</p>';
        switchView('discographyDetail');
    };

    // handleSearch, setupCountdown, startAlbumCountdown
    const handleSearch = () => { const query = searchInput.value.toLowerCase().trim(); if (!query) { switchTab(null, 'homeSection'); return; } const resultsContainer = document.getElementById('searchResults'); const noResultsEl = document.getElementById('noResults'); const filteredArtists = db.artists.filter(a => a.name.toLowerCase().includes(query)); const filteredAlbums = [...db.albums, ...db.singles].filter(a => a.title.toLowerCase().includes(query)); let html = ''; let count = 0; if (filteredArtists.length > 0) { html += '<h3 class="section-title">Artistas</h3>'; html += filteredArtists.map(a => { count++; return `<div class="artist-card" data-artist-name="${a.name}"><img src="${a.img}" alt="${a.name}" class="artist-card-img"><p class="artist-card-name">${a.name}</p><span class="artist-card-type">Artista</span></div>`; }).join(''); } if (filteredAlbums.length > 0) { html += '<h3 class="section-title">Álbuns & Singles</h3>'; html += filteredAlbums.map(al => { count++; return `<div class="artist-card" data-album-id="${al.id}"><img src="${al.imageUrl}" alt="${al.title}" class="artist-card-img"><p class="artist-card-name">${al.title}</p><span class="artist-card-type">${al.artist}</span></div>`; }).join(''); } resultsContainer.innerHTML = html; if (count > 0) { noResultsEl.classList.add('hidden'); resultsContainer.classList.remove('hidden'); } else { noResultsEl.classList.remove('hidden'); resultsContainer.classList.add('hidden'); } switchTab(null, 'searchSection'); };
    const setupCountdown = (timerId, chartType) => { const timerElement = document.getElementById(timerId); if (!timerElement) return; const calculateTargetDate = () => { const now = new Date(); const target = new Date(now); let daysToMonday = (1 + 7 - now.getDay()) % 7; if (daysToMonday === 0 && now.getHours() >= 0) { daysToMonday = 7; } target.setDate(now.getDate() + daysToMonday); target.setHours(0, 0, 0, 0); return target; }; let targetDate = calculateTargetDate(); const updateTimerDisplay = (distance) => { const days = Math.floor(distance / 864e5); const hours = Math.floor((distance % 864e5) / 36e5); const minutes = Math.floor((distance % 36e5) / 6e4); const seconds = Math.floor((distance % 6e4) / 1e3); const f = (n) => (n < 10 ? '0' + n : n); timerElement.textContent = distance < 0 ? `00d 00h 00m 00s` : `${f(days)}d ${f(hours)}h ${f(minutes)}m ${f(seconds)}s`; }; const intervalId = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        if (distance < 0) {
            console.log(`Timer ${timerId} finished. Saving ${chartType} chart.`);
            saveChartDataToLocalStorage(chartType);
            targetDate = calculateTargetDate();
            if (chartType === 'music') renderChart('music');
            else if (chartType === 'album') renderChart('album');
            else if (chartType === 'rpg') renderRPGChart();
            updateTimerDisplay(targetDate.getTime() - new Date().getTime());
            return;
        }
        updateTimerDisplay(distance);
       }, 1000);
       updateTimerDisplay(targetDate.getTime() - new Date().getTime());
    };
    function startAlbumCountdown(targetDateISO, containerId) {
        if (albumCountdownInterval) {
            clearInterval(albumCountdownInterval);
            console.log("Cleared previous album countdown interval before starting new one.");
        }
        const container = document.getElementById(containerId);
        if (!container) { console.error(`Countdown container ${containerId} not found.`); return; }
        const targetTime = new Date(targetDateISO).getTime();
        const updateTimer = () => {
            const now = new Date().getTime(); const distance = targetTime - now;
            if (distance < 0) {
                 container.innerHTML = '<p>Lançado!</p>';
                 if (albumCountdownInterval) {
                     clearInterval(albumCountdownInterval);
                     albumCountdownInterval = null;
                 }
                 // ATUALIZAÇÃO: Recarrega a página do álbum
                 const albumIdElement = document.querySelector('#albumDetail [data-album-id]'); // Tenta encontrar um ID
                 const currentAlbum = [...db.albums, ...db.singles].find(a => a.releaseDate === targetDateISO);
                 const albumId = currentAlbum ? currentAlbum.id : null;

                 if(albumId && document.getElementById('albumDetail')?.classList.contains('hidden') === false) { // Verifica se ainda estamos na página
                     console.log("Countdown finished, refreshing album detail view...");
                     openAlbumDetail(albumId);
                 } else {
                     console.log("Countdown finished, but couldn't auto-refresh view.");
                 }
                 return;
            }
            const d = Math.floor(distance / 864e5); const h = Math.floor((distance % 864e5) / 36e5); const m = Math.floor((distance % 36e5) / 6e4); const s = Math.floor((distance % 6e4) / 1e3);
            container.innerHTML = `<div class="countdown-item"><span>${d}</span><label>Dias</label></div><div class="countdown-item"><span>${h}</span><label>Horas</label></div><div class="countdown-item"><span>${m}</span><label>Minutos</label></div><div class="countdown-item"><span>${s}</span><label>Segundos</label></div>`;
        };
        updateTimer();
        albumCountdownInterval = setInterval(updateTimer, 1000);
        console.log("Started new album countdown interval:", albumCountdownInterval);
    }


    // --- 3. SISTEMA DE RPG ---
    const CHART_TOP_N = 20; const STREAMS_PER_POINT = 10000;
    const calculateSimulatedStreams = (points, lastActiveISO) => { if (!lastActiveISO) return 0; const now = new Date(); const last = new Date(lastActiveISO); const diffH = Math.abs(now - last) / 36e5; const streamDay = (points||0)*STREAMS_PER_POINT; const streamH = streamDay/24; return Math.floor(streamH*diffH); };
    const computeChartData = (artistsArray) => { return artistsArray.map(a => ({ id: a.id, name: a.name, img: a.img, streams: calculateSimulatedStreams(a.RPGPoints, a.LastActive), points: a.RPGPoints||0 })).sort((a,b) => b.streams - a.streams).slice(0, CHART_TOP_N); };
    function renderRPGChart() { const chartData = computeChartData(db.artists); const container = document.getElementById('artistsGrid'); const previousData = previousRpgChartData; if (!container) { console.error("Container 'artistsGrid' não encontrado."); return; } if (chartData.length === 0) { container.innerHTML = '<p class="empty-state">Nenhum artista no chart RPG.</p>'; return; } container.innerHTML = chartData.map((artist, index) => { const currentRank = index + 1; const previousRank = previousData[artist.id]; let iconClass = 'fa-minus'; let trendClass = 'trend-stable'; if (previousRank === undefined) { trendClass = 'trend-new'; } else if (currentRank < previousRank) { iconClass = 'fa-caret-up'; trendClass = 'trend-up'; } else if (currentRank > previousRank) { iconClass = 'fa-caret-down'; trendClass = 'trend-down'; } return `<div class="artist-card" data-artist-name="${artist.name}"><span class="rpg-rank">#${currentRank}</span><span class="chart-rank-indicator rpg-indicator ${trendClass}"><i class="fas ${iconClass}"></i></span><img src="${artist.img}" alt="${artist.name}" class="artist-card-img"><p class="artist-card-name">${artist.name}</p><span class="artist-card-type">${(artist.streams || 0).toLocaleString('pt-BR')} streams</span></div>`; }).join(''); }


    // --- 4. SISTEMA DO ESTÚDIO ---

    // initializeStudio
    function initializeStudio() {
        console.log("Running initializeStudio...");

        loginButton?.addEventListener('click', () => {
            const username = document.getElementById('usernameInput')?.value;
            const password = document.getElementById('passwordInput')?.value;
            loginPlayer(username, password);
        });

        logoutButton?.addEventListener('click', logoutPlayer);

        studioTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                studioTabs.forEach(t => t.classList.remove('active'));
                studioForms.forEach(f => f.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const formTarget = e.currentTarget.dataset.form;

                let targetFormId;
                if (formTarget === 'single') {
                    targetFormId = 'newSingleForm';
                } else if (formTarget === 'album') {
                    targetFormId = 'newAlbumForm';
                    initAlbumForm(); // Garante que a tracklist esteja limpa/sortable
                } else if (formTarget === 'edit') {
                    targetFormId = 'editReleaseSection';
                    populateEditableReleases();
                     editReleaseListContainer?.classList.remove('hidden');
                     editReleaseForm?.classList.add('hidden');
                }

                const targetFormElement = document.getElementById(targetFormId);
                if (targetFormElement) {
                    targetFormElement.classList.add('active');
                } else {
                    console.error(`Formulário ou seção com ID ${targetFormId} não encontrado.`);
                }
            });
        });

        // --- Listeners de Feat ---
        confirmFeatBtn?.addEventListener('click', confirmFeat);
        cancelFeatBtn?.addEventListener('click', closeFeatModal);
        newSingleForm?.addEventListener('click', (e) => {
            const addFeatButton = e.target.closest('.add-feat-btn[data-target="singleFeatList"]');
            if (addFeatButton) {
                openFeatModal(addFeatButton);
            }
        });

        // --- Listeners do Modal de Faixa de Álbum ---
        openAddTrackModalBtn?.addEventListener('click', () => openAlbumTrackModal());
        saveAlbumTrackBtn?.addEventListener('click', saveAlbumTrack);
        cancelAlbumTrackBtn?.addEventListener('click', closeAlbumTrackModal);
        addInlineFeatBtn?.addEventListener('click', toggleInlineFeatAdder);
        confirmInlineFeatBtn?.addEventListener('click', confirmInlineFeat);
        cancelInlineFeatBtn?.addEventListener('click', cancelInlineFeat);
        albumTracklistEditor?.addEventListener('click', (e) => {
            const editButton = e.target.closest('.edit-track-btn');
            const removeButton = e.target.closest('.remove-track-btn');
            if (editButton) { const item = editButton.closest('.track-list-item-display'); if (item) { openAlbumTrackModal(item); } }
            else if (removeButton) { const item = removeButton.closest('.track-list-item-display'); if (item) { item.remove(); updateTrackNumbers(); } }
        });

        // --- Listeners de Edição/Exclusão ---
        editReleaseList?.addEventListener('click', (e) => {
             const editButton = e.target.closest('.edit-release-btn');
             const deleteButton = e.target.closest('.delete-release-btn');
             if (editButton) {
                 const releaseId = editButton.dataset.releaseId;
                 const releaseType = editButton.dataset.releaseType;
                 openEditForm(releaseId, releaseType);
             } else if (deleteButton) {
                 const releaseId = deleteButton.dataset.releaseId;
                 const releaseType = deleteButton.dataset.releaseType;
                 const tableName = deleteButton.dataset.releaseTable;
                 const releaseTitle = deleteButton.closest('.edit-release-item')?.querySelector('.edit-release-title')?.textContent || 'este lançamento';
                 const release = (releaseType === 'album' ? db.albums : db.singles).find(r => r.id === releaseId);
                 const trackIdsToDelete = release?.trackIds || [];
                 openDeleteConfirmModal(releaseId, tableName, releaseTitle, trackIdsToDelete);
             }
         });
         editReleaseForm?.addEventListener('submit', handleUpdateRelease);
         cancelEditBtn?.addEventListener('click', () => {
             editReleaseForm?.classList.add('hidden');
             editReleaseListContainer?.classList.remove('hidden');
         });
         cancelDeleteBtn?.addEventListener('click', closeDeleteConfirmModal);
         confirmDeleteBtn?.addEventListener('click', handleDeleteRelease);

        // Listener para o filtro de artista na aba de edição
        editArtistFilterSelect?.addEventListener('change', populateEditableReleases);


        // --- Listener para o SUBMIT do formulário de Single ---
        newSingleForm?.addEventListener('submit', handleSingleSubmit); // <-- Prevents page reload
        // Listener para o formulário de Álbum
        newAlbumForm?.addEventListener('submit', handleAlbumSubmit);


        // --- Listeners para o Modal de Tipo de Faixa (Single) ---
        confirmTrackTypeBtn?.addEventListener('click', () => {
            const selectedType = trackTypeSelect.value;
            if (selectedType) {
                processSingleSubmission(selectedType); // <-- Continues submission
            } else {
                alert("Por favor, selecione um tipo de faixa.");
            }
        });
        cancelTrackTypeBtn?.addEventListener('click', () => {
            trackTypeModal?.classList.add('hidden');
            const btn = document.getElementById('submitNewSingle');
            if(btn) {
                btn.disabled = false;
                btn.textContent = 'Lançar Single';
            }
        });

        // --- Listener para filtro dinâmico de artista (Single) ---
        singleArtistSelect?.addEventListener('change', () => {
            if (toggleExistingSingle?.checked) {
                populatePlayerTracks('existingTrackSelect');
            }
        });

        // --- Listeners Adicionais (Modais, Toggle) ---
        toggleExistingSingle?.addEventListener('change', () => toggleSingleFormMode(false));
        openExistingTrackModalBtn?.addEventListener('click', () => openExistingTrackModal('album'));
        existingTrackSearch?.addEventListener('input', populateExistingTrackSearch);
        cancelExistingTrackBtn?.addEventListener('click', closeExistingTrackModal);
        existingTrackResults?.addEventListener('click', handleExistingTrackSelect);


        initAlbumForm(); // Initialize SortableJS for album tracklist
        console.log("initializeStudio finished.");
    }

    // loginPlayer
    function loginPlayer(username, password) {
        if (!username || !password) {
            alert("Por favor, insira nome de usuário e senha.");
            return;
        }
        const foundPlayer = db.players.find(p => p.name.toLowerCase() === username.toLowerCase());

        if (foundPlayer && foundPlayer.password === password) {
            currentPlayer = foundPlayer;
            document.getElementById('playerName').textContent = currentPlayer.name;
            loginPrompt?.classList.add('hidden');
            loggedInInfo?.classList.remove('hidden');
            studioLaunchWrapper?.classList.remove('hidden');
            populateArtistSelector(currentPlayer.id);
            if (document.querySelector('.studio-tab-btn[data-form="edit"]')?.classList.contains('active')) {
                 populateEditableReleases();
            }
            // Popula o select de faixas existentes do single (com o primeiro artista, se houver)
            populatePlayerTracks('existingTrackSelect');
        } else {
            alert("Usuário ou senha inválidos.");
            const passwordInput = document.getElementById('passwordInput');
            if (passwordInput) passwordInput.value = '';
        }
    }

    // logoutPlayer
    function logoutPlayer() {
        currentPlayer=null;
        const playerNameEl = document.getElementById('playerName');
        if(playerNameEl) playerNameEl.textContent='';
        loginPrompt?.classList.remove('hidden');
        loggedInInfo?.classList.add('hidden');
        studioLaunchWrapper?.classList.add('hidden');
        const usernameInput = document.getElementById('usernameInput');
        const passwordInput = document.getElementById('passwordInput');
        if(usernameInput) usernameInput.value = '';
        if(passwordInput) passwordInput.value = '';
        if(editReleaseList) editReleaseList.innerHTML = '<p class="empty-state-small">Faça login para ver seus lançamentos.</p>';
        if (editArtistFilterSelect) editArtistFilterSelect.innerHTML = ''; // Limpa filtro
         editReleaseForm?.classList.add('hidden');
         editReleaseListContainer?.classList.remove('hidden');
         // Reseta o form de single
         if(toggleExistingSingle) toggleExistingSingle.checked = false;
         toggleSingleFormMode(true);
    }

    // populateArtistSelector
    function populateArtistSelector(playerId) {
        const p=db.players.find(pl=>pl.id===playerId);
        if(!p)return;
        const ids=p.artists||[];
        const opts=ids.map(id=>{const a=db.artists.find(ar=>ar.id===id); return a?`<option value="${a.id}">${a.name}</option>`:'';}).join('');

        if(singleArtistSelect) singleArtistSelect.innerHTML=`<option value="">Selecione...</option>${opts}`;
        if(albumArtistSelect) albumArtistSelect.innerHTML=`<option value="">Selecione...</option>${opts}`;
        if(editArtistFilterSelect) {
            editArtistFilterSelect.innerHTML=`<option value="all">Todos os Artistas</option>${opts}`;
        }
    }

    // Funções de Feat
    function populateArtistSelectForFeat(targetSelectElement) { let currentMainId=null; let selectEl=targetSelectElement; if(document.getElementById('newSingleForm')?.classList.contains('active')){currentMainId=singleArtistSelect?.value; selectEl=featArtistSelect;} else if(document.getElementById('newAlbumForm')?.classList.contains('active')){currentMainId=albumArtistSelect?.value; selectEl=inlineFeatArtistSelect;} else {selectEl=featArtistSelect;} if(!selectEl){console.error("Select feats não encontrado!"); return;} selectEl.innerHTML = db.artists.filter(a=>a.id!==currentMainId).sort((a,b)=>a.name.localeCompare(b.name)).map(a=>`<option value="${a.id}">${a.name}</option>`).join(''); if(selectEl.innerHTML===''){selectEl.innerHTML='<option value="">Nenhum outro</option>';} }
    function openFeatModal(buttonElement) { const targetId=buttonElement.dataset.target; currentFeatTarget=document.getElementById(targetId); if(!currentFeatTarget){console.error("Alvo feat não encontrado:", targetId); return;} populateArtistSelectForFeat(featArtistSelect); featModal?.classList.remove('hidden'); }
    function closeFeatModal() { featModal?.classList.add('hidden'); currentFeatTarget=null; }
    function confirmFeat() { const artistId=featArtistSelect?.value; const artistName=featArtistSelect?.options[featArtistSelect.selectedIndex].text; const featType=featTypeSelect?.value; if(!artistId||!currentFeatTarget){console.error("Confirm feat sem ID ou alvo."); return;} const tag=document.createElement('span'); tag.className='feat-tag'; tag.textContent=`${featType} ${artistName}`; tag.dataset.artistId=artistId; tag.dataset.featType=featType; tag.dataset.artistName=artistName; tag.addEventListener('click',()=>tag.remove()); currentFeatTarget.appendChild(tag); closeFeatModal(); }
    function toggleInlineFeatAdder() { if(!inlineFeatAdder)return; const hidden=inlineFeatAdder.classList.contains('hidden'); if(hidden){populateArtistSelectForFeat(inlineFeatArtistSelect); inlineFeatAdder.classList.remove('hidden'); if(addInlineFeatBtn)addInlineFeatBtn.innerHTML='<i class="fas fa-times"></i> Cancelar Feat';} else {inlineFeatAdder.classList.add('hidden'); if(addInlineFeatBtn)addInlineFeatBtn.innerHTML='<i class="fas fa-plus"></i> Adicionar Feat';} }
    function confirmInlineFeat() { const artistId=inlineFeatArtistSelect?.value; const artistName=inlineFeatArtistSelect?.options[inlineFeatArtistSelect.selectedIndex].text; const featType=inlineFeatTypeSelect?.value; if(!artistId||!albumTrackFeatList){console.error("Confirm inline feat sem ID ou alvo."); return;} const tag=document.createElement('span'); tag.className='feat-tag'; tag.textContent=`${featType} ${artistName}`; tag.dataset.artistId=artistId; tag.dataset.featType=featType; tag.dataset.artistName=artistName; tag.addEventListener('click',()=>tag.remove()); albumTrackFeatList.appendChild(tag); inlineFeatAdder?.classList.add('hidden'); if(addInlineFeatBtn)addInlineFeatBtn.innerHTML='<i class="fas fa-plus"></i> Adicionar Feat'; }
    function cancelInlineFeat() { inlineFeatAdder?.classList.add('hidden'); if(addInlineFeatBtn)addInlineFeatBtn.innerHTML='<i class="fas fa-plus"></i> Adicionar Feat'; }

    // openAlbumTrackModal
    function openAlbumTrackModal(itemToEdit=null) {
        if (!albumTrackModal) return;
        albumTrackNameInput.value='';
        albumTrackDurationInput.value='';
        albumTrackTypeSelect.value='B-side';
        albumTrackFeatList.innerHTML='';
        editingTrackItemId.value='';
        editingTrackExistingId.value = '';
        editingTrackItem=null;
        inlineFeatAdder?.classList.add('hidden');
        if(addInlineFeatBtn)addInlineFeatBtn.innerHTML='<i class="fas fa-plus"></i> Adicionar Feat';
        albumTrackNameInput.disabled = false;
        albumTrackDurationInput.disabled = false;
        if(addInlineFeatBtn) addInlineFeatBtn.classList.remove('hidden');
        const featSectionElement = albumTrackFeatList?.closest('.feat-section');
        if (featSectionElement) featSectionElement.classList.remove('hidden');

        if(itemToEdit){
            editingTrackItemId.value=itemToEdit.id||itemToEdit.dataset.itemId;
            editingTrackItem=itemToEdit;
            albumTrackNameInput.value=itemToEdit.dataset.trackName||'';
            albumTrackDurationInput.value=itemToEdit.dataset.durationStr||'';
            albumTrackTypeSelect.value=itemToEdit.dataset.trackType||'B-side';
            const feats=JSON.parse(itemToEdit.dataset.feats||'[]');
            feats.forEach(f=>{const tag=document.createElement('span'); tag.className='feat-tag'; tag.textContent=`${f.type} ${f.name}`; tag.dataset.artistId=f.id; tag.dataset.featType=f.type; tag.dataset.artistName=f.name; tag.addEventListener('click',()=>tag.remove()); albumTrackFeatList.appendChild(tag);});

            if (itemToEdit.dataset.existingSongId) {
                albumTrackModalTitle.textContent = 'Editar Faixa (Existente)';
                editingTrackExistingId.value = itemToEdit.dataset.existingSongId;
                albumTrackNameInput.disabled = true;
                albumTrackDurationInput.disabled = true;
                 if (featSectionElement) featSectionElement.classList.add('hidden');
            } else {
                albumTrackModalTitle.textContent = 'Editar Faixa (Nova)';
            }
        } else {
            albumTrackModalTitle.textContent = 'Adicionar Faixa (Nova)';
            editingTrackItemId.value=`temp_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
        }
        albumTrackModal.classList.remove('hidden');
    }

    // closeAlbumTrackModal
    function closeAlbumTrackModal() { albumTrackModal?.classList.add('hidden'); editingTrackItem=null; editingTrackItemId.value=''; inlineFeatAdder?.classList.add('hidden'); if(addInlineFeatBtn)addInlineFeatBtn.innerHTML='<i class="fas fa-plus"></i> Adicionar Feat'; }

    // saveAlbumTrack
    function saveAlbumTrack() {
        if(!albumTracklistEditor) return;
        const existingId = editingTrackExistingId.value;
        const name=albumTrackNameInput.value.trim();
        const durStr=albumTrackDurationInput.value.trim();
        const type=albumTrackTypeSelect.value;
        const durSec=parseDurationToSeconds(durStr);
        const itemId=editingTrackItemId.value;
        if(!name||!durStr||durSec===0){alert("Nome e Duração (MM:SS) válidos.");return;}
        const featTags=albumTrackFeatList?.querySelectorAll('.feat-tag');
        const featsData=Array.from(featTags || []).map(t=>({id:t.dataset.artistId, type:t.dataset.featType, name:t.dataset.artistName}));
        let target=editingTrackItem||albumTracklistEditor.querySelector(`[data-item-id="${itemId}"]`);

        if(target){ // Editando
            target.dataset.trackName=name;
            target.dataset.durationStr=durStr;
            target.dataset.trackType=type;
            if (!existingId) {
                target.dataset.feats=JSON.stringify(featsData);
            }
            target.querySelector('.track-title-display').textContent=name;
             if (existingId) {
                const titleSpan = target.querySelector('.track-title-display');
                if (titleSpan && !titleSpan.querySelector('i.fa-link')) {
                   titleSpan.innerHTML = `<i class="fas fa-link" style="font-size: 10px; margin-right: 5px;" title="Faixa Existente"></i>${name}`;
                   titleSpan.style.color = 'var(--spotify-green)';
                }
             }
            target.querySelector('.track-details-display .duration').textContent=`Duração: ${durStr}`;
            target.querySelector('.track-details-display .type').textContent=`Tipo: ${type}`;
            const featDisp=target.querySelector('.feat-list-display');
            if(featDisp && !existingId){
                featDisp.innerHTML=featsData.map(f=>`<span class="feat-tag-display">${f.type} ${f.name}</span>`).join('');
            }
        } else { // Adicionando NOVO
            const newItem=document.createElement('div');
            newItem.className='track-list-item-display';
            newItem.dataset.itemId=itemId;
            newItem.dataset.trackName=name;
            newItem.dataset.durationStr=durStr;
            newItem.dataset.trackType=type;
            newItem.dataset.feats=JSON.stringify(featsData);
            // Layout com botões à esquerda (como em addExistingTrackToAlbum)
            newItem.innerHTML=`
                 <span class="track-number-display"></span>
                 <i class="fas fa-bars drag-handle"></i>
                 <div class="track-actions">
                     <button type="button" class="small-btn edit-track-btn"><i class="fas fa-pencil-alt"></i></button>
                     <button type="button" class="small-btn remove-track-btn"><i class="fas fa-times"></i></button>
                 </div>
                 <div class="track-info-display">
                     <span class="track-title-display">${name}</span>
                     <div class="track-details-display">
                         <span class="duration">Duração: ${durStr}</span>
                         <span class="type">Tipo: ${type}</span>
                     </div>
                     <div class="feat-list feat-list-display" style="margin-top:5px;">
                         ${featsData.map(f=>`<span class="feat-tag-display">${f.type} ${f.name}</span>`).join('')}
                     </div>
                 </div>`;
            const empty=albumTracklistEditor.querySelector('.empty-state-small');
            if(empty)empty.remove();
            albumTracklistEditor.appendChild(newItem);
        }
        updateTrackNumbers();
        closeAlbumTrackModal();
    }

    // updateTrackNumbers
    function updateTrackNumbers() { if (!albumTracklistEditor) return; const tracks=albumTracklistEditor.querySelectorAll('.track-list-item-display'); if(tracks.length===0&&!albumTracklistEditor.querySelector('.empty-state-small')){if(!albumTracklistEditor.querySelector('.empty-state-small')){albumTracklistEditor.innerHTML='<p class="empty-state-small">Nenhuma faixa.</p>';}} else if(tracks.length>0){const empty=albumTracklistEditor.querySelector('.empty-state-small'); if(empty){empty.remove();}} tracks.forEach((t, i)=>{let num=t.querySelector('.track-number-display'); if(!num){num=document.createElement('span'); num.className='track-number-display'; t.insertBefore(num, t.querySelector('.drag-handle'));} num.textContent=`${i+1}.`; num.style.fontWeight='700'; num.style.color='var(--text-secondary)'; num.style.width='25px'; num.style.textAlign='right'; num.style.marginRight='5px';}); }


    // --- FUNÇÕES DA API AIRTABLE ---
    async function createAirtableRecord(tableName, fields) { const url=`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`; try{const r=await fetch(url,{method:'POST',headers:{'Authorization':`Bearer ${AIRTABLE_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({fields:fields})}); if(!r.ok){const e=await r.json(); console.error(`Erro Airtable CREATE ${tableName}:`,JSON.stringify(e,null,2)); throw new Error(`Airtable CREATE error: ${r.status}`);} return await r.json();} catch(e){console.error(`Falha req CREATE ${tableName}:`,e); return null;} }
    async function batchCreateAirtableRecords(tableName, records) { const url=`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`; const chunks=[]; for(let i=0; i<records.length; i+=10){chunks.push(records.slice(i, i+10));} const results=[]; for(const chunk of chunks){console.log(`Enviando lote CREATE ${tableName}:`, chunk.length); try{const res=await fetch(url,{method:'POST',headers:{'Authorization':`Bearer ${AIRTABLE_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({"records":chunk.map(fields=>({fields}))})}); if(!res.ok){const e=await res.json(); console.error(`Erro lote CREATE ${tableName}:`,JSON.stringify(e,null,2)); throw new Error(`Airtable batch CREATE error: ${res.status}`);} const data=await res.json(); results.push(...data.records);} catch(e){console.error(`Falha req batch CREATE ${tableName}:`,e); return null;}} return results; }
    async function updateAirtableRecord(tableName, recordId, fields) { const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}/${recordId}`; try { const response = await fetch(url, { method: 'PATCH', headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: fields }) }); if (!response.ok) { const errorData = await response.json(); console.error(`Erro Airtable UPDATE ${tableName} (ID: ${recordId}):`, JSON.stringify(errorData, null, 2)); throw new Error(`Airtable UPDATE error: ${response.status}`); } return await response.json(); } catch (error) { console.error(`Falha na requisição UPDATE ${tableName} (ID: ${recordId}):`, error); return null; } }
    async function batchUpdateAirtableRecords(tableName, records) { if (!records || records.length === 0) return []; const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`; const chunks = []; for (let i = 0; i < records.length; i += 10) { chunks.push(records.slice(i, i + 10)); } const results = []; for (const chunk of chunks) { console.log(`Enviando lote UPDATE ${tableName}:`, chunk.length); try { const res = await fetch(url, { method: 'PATCH', headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ "records": chunk }) }); if (!res.ok) { const e = await res.json(); console.error(`Erro lote UPDATE ${tableName}:`, JSON.stringify(e, null, 2)); throw new Error(`Airtable batch UPDATE error: ${res.status}`); } const data = await res.json(); results.push(...data.records); } catch (e) { console.error(`Falha req batch UPDATE ${tableName}:`, e); return null; } } return results; }
    async function deleteAirtableRecord(tableName, recordId) { const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}/${recordId}`; try { const response = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }); if (!response.ok) { try { const errorData = await response.json(); console.error(`Erro Airtable DELETE ${tableName} (ID: ${recordId}):`, JSON.stringify(errorData, null, 2)); if (errorData?.error?.type === 'NOT_FOUND') { console.warn(`Registro ${recordId} em ${tableName} não encontrado, considerando como sucesso.`); return { deleted: true }; } } catch (parseError) { console.error(`Erro Airtable DELETE ${tableName} (ID: ${recordId}), Status: ${response.status}`); } throw new Error(`Airtable DELETE error: ${response.status}`); } if (response.status !== 204 && response.headers.get("content-length") !== "0") { return await response.json(); } else { return { deleted: true }; } } catch (error) { console.error(`Falha na requisição DELETE ${tableName} (ID: ${recordId}):`, error); return null; } }
    async function batchDeleteAirtableRecords(tableName, recordIds) { if (!recordIds || recordIds.length === 0) { return { success: true, results: [] }; } const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`; const chunks = []; for (let i = 0; i < recordIds.length; i += 10) { chunks.push(recordIds.slice(i, i + 10)); } const results = []; let allSucceeded = true; for (const chunk of chunks) { const params = chunk.map(id => `records[]=${encodeURIComponent(id)}`).join('&'); console.log(`Enviando lote DELETE ${tableName}: IDs ${chunk.join(', ')}`); try { const response = await fetch(`${url}?${params}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }); if (!response.ok) { allSucceeded = false; try { const errorData = await response.json(); console.error(`Erro lote DELETE ${tableName} (IDs: ${chunk.join(', ')}):`, JSON.stringify(errorData, null, 2)); } catch (parseError) { console.error(`Erro lote DELETE ${tableName} (IDs: ${chunk.join(', ')}), Status: ${response.status}`); } } else { if (response.status !== 204 && response.headers.get("content-length") !== "0") { const data = await response.json(); results.push(...(data.records || [])); } else { chunk.forEach(id => results.push({ id: id, deleted: true })); } } } catch (error) { allSucceeded = false; console.error(`Falha req batch DELETE ${tableName} (IDs: ${chunk.join(', ')}):`, error); } } return { success: allSucceeded, results: results }; }

    // parseDurationToSeconds
    function parseDurationToSeconds(durationStr) { if(!durationStr)return 0; const p=durationStr.split(':'); if(p.length!==2)return 0; const m=parseInt(p[0],10); const s=parseInt(p[1],10); if(isNaN(m)||isNaN(s)||s<0||s>59||m<0){return 0;} return (m*60)+s; }


    // --- NOVAS FUNÇÕES DE UI (Estúdio) ---

    // populatePlayerTracks
    function populatePlayerTracks(selectElementId) {
        const selectEl = document.getElementById(selectElementId);
        if (!selectEl) return;
        const selectedArtistId = singleArtistSelect.value;
        if (!currentPlayer) {
            selectEl.innerHTML = '<option value="">Faça login primeiro</option>';
            return;
        }
        if (!selectedArtistId) {
            selectEl.innerHTML = '<option value="">Selecione um Artista primeiro</option>';
            return;
        }
        const artistSongs = db.songs
            .filter(s => s.artistIds.includes(selectedArtistId))
            .sort((a, b) => (b.totalStreams || 0) - (a.totalStreams || 0));

        if (artistSongs.length === 0) {
            selectEl.innerHTML = '<option value="">Nenhuma faixa encontrada para este artista</option>';
            return;
        }

        selectEl.innerHTML = '<option value="">Selecione uma faixa...</option>';
        selectEl.innerHTML += artistSongs.map(song => {
            const firstAlbumId = song.albumIds?.[0];
            const firstSingleId = song.singleIds?.[0];
            let releaseName = '(Avulsa)';
            if (firstAlbumId) {
                const release = db.albums.find(r => r.id === firstAlbumId);
                if (release) releaseName = `(${release.title})`;
            } else if (firstSingleId) {
                const release = db.singles.find(r => r.id === firstSingleId);
                 if (release) releaseName = `(${release.title})`;
            }
            return `<option value="${song.id}">${song.title} ${releaseName}</option>`;
        }).join('');
    }


    // toggleSingleFormMode
    function toggleSingleFormMode(isResetting = false) {
        if (!toggleExistingSingle || !newTrackInfoGroup || !existingTrackGroup || !singleFeatSection) return;
        const isExisting = isResetting ? false : toggleExistingSingle.checked;
        if (isExisting) {
            newTrackInfoGroup.classList.add('hidden');
            existingTrackGroup.classList.remove('hidden');
            singleFeatSection.classList.add('hidden');
            document.getElementById('trackName')?.removeAttribute('required');
            document.getElementById('trackDuration')?.removeAttribute('required');
            existingTrackSelect?.setAttribute('required', 'required');
            if (existingTrackSelect.options.length <= 1 || existingTrackSelect.options[0].value === "") {
                 populatePlayerTracks('existingTrackSelect');
            }
        } else {
            newTrackInfoGroup.classList.remove('hidden');
            existingTrackGroup.classList.add('hidden');
            singleFeatSection.classList.remove('hidden');
            document.getElementById('trackName')?.setAttribute('required', 'required');
            document.getElementById('trackDuration')?.setAttribute('required', 'required');
            existingTrackSelect?.removeAttribute('required');
        }
        if (isResetting) {
            toggleExistingSingle.checked = false;
            existingTrackSelect.value = '';
            existingSingleTrackId.value = '';
        }
    }

    // openExistingTrackModal
    function openExistingTrackModal(context) {
        if (!currentPlayer) {
            alert("Faça login para adicionar faixas.");
            return;
        }
        existingTrackModalContext = context;
        existingTrackSearch.value = '';
        populateExistingTrackSearch();
        existingTrackModal?.classList.remove('hidden');
    }


    // closeExistingTrackModal
    function closeExistingTrackModal() {
        existingTrackModal?.classList.add('hidden');
    }

    // populateExistingTrackSearch
    function populateExistingTrackSearch() {
        if (!currentPlayer) {
            if (existingTrackResults) existingTrackResults.innerHTML = '<p class="empty-state-small">Faça login.</p>';
            return;
        }
        const selectedArtistId = albumArtistSelect.value;
        if (!selectedArtistId) {
             if (existingTrackResults) existingTrackResults.innerHTML = '<p class="empty-state-small">Selecione um Artista no formulário do álbum primeiro.</p>';
             return;
        }
        const query = existingTrackSearch.value.toLowerCase().trim();
        const filteredSongs = db.songs
            .filter(s => {
                const isArtistSong = s.artistIds.includes(selectedArtistId);
                const matchesQuery = s.title.toLowerCase().includes(query);
                return isArtistSong && matchesQuery;
            })
            .sort((a, b) => (b.totalStreams || 0) - (a.totalStreams || 0));

        if (!existingTrackResults) return;

        if (filteredSongs.length === 0) {
            existingTrackResults.innerHTML = '<p class="empty-state-small">Nenhuma faixa encontrada para este artista.</p>';
            return;
        }

        existingTrackResults.innerHTML = filteredSongs.map(song => `
             <div class="existing-track-item" data-song-id="${song.id}">
                 <img src="${song.cover || getCoverUrl(song.albumId)}" alt="${song.title}">
                 <div class="existing-track-item-info">
                     <span class="existing-track-item-title">${song.title}</span>
                     <span class="existing-track-item-artist">${song.artist}</span>
                 </div>
             </div>
        `).join('');
    }

    // handleExistingTrackSelect
    function handleExistingTrackSelect(event) {
        const selectedItem = event.target.closest('.existing-track-item');
        if (!selectedItem) return;
        const songId = selectedItem.dataset.songId;
        if (!songId) return;
        if (existingTrackModalContext === 'album') {
            addExistingTrackToAlbum(songId);
        }
    }

    // addExistingTrackToAlbum
    function addExistingTrackToAlbum(songId) {
        const song = db.songs.find(s => s.id === songId);
        if (!song) {
            alert("Erro: Música não encontrada no banco de dados local.");
            return;
        }
        if (albumTracklistEditor.querySelector(`[data-existing-song-id="${song.id}"]`)) {
            alert("Esta música já foi adicionada à tracklist.");
            return;
        }
        const featsData = (song.artistIds || [])
            .slice(1)
            .map(artistId => {
                const artist = db.artists.find(a => a.id === artistId);
                return {
                    id: artistId,
                    type: song.collabType || 'Feat.',
                    name: artist ? artist.name : '?'
                };
            });
        const newItem = document.createElement('div');
        newItem.className = 'track-list-item-display';
        newItem.dataset.itemId = `existing_${song.id}`;
        newItem.dataset.existingSongId = song.id;
        newItem.dataset.trackName = song.title;
        newItem.dataset.durationStr = song.duration;
        newItem.dataset.trackType = song.trackType;
        newItem.dataset.feats = JSON.stringify(featsData);
        const titleDisplay = `<span class="track-title-display" style="color: var(--spotify-green);"><i class="fas fa-link" style="font-size: 10px; margin-right: 5px;" title="Faixa Existente"></i>${song.title}</span>`;
        // Layout com botões à esquerda
        newItem.innerHTML = `
             <span class="track-number-display"></span>
             <i class="fas fa-bars drag-handle"></i>
             <div class="track-actions">
                 <button type="button" class="small-btn edit-track-btn" title="Editar tipo de faixa (Ex: B-side -> Title Track)"><i class="fas fa-pencil-alt"></i></button>
                 <button type="button" class="small-btn remove-track-btn"><i class="fas fa-times"></i></button>
             </div>
             <div class="track-info-display">
                 ${titleDisplay}
                 <div class="track-details-display">
                     <span class="duration">Duração: ${song.duration}</span>
                     <span class="type">Tipo: ${song.trackType}</span>
                 </div>
                 <div class="feat-list feat-list-display" style="margin-top:5px;">
                     ${featsData.map(f => `<span class="feat-tag-display">${f.type} ${f.name}</span>`).join('')}
                 </div>
             </div>
        `;
        const empty = albumTracklistEditor.querySelector('.empty-state-small');
        if (empty) empty.remove();
        albumTracklistEditor.appendChild(newItem);
        updateTrackNumbers();
        closeExistingTrackModal();
    }


    // --- FUNÇÕES DE SUBMISSÃO ---

    // handleSingleSubmit (CORRIGIDO - Syntax Error)
    async function handleSingleSubmit(event) {
        event.preventDefault(); // Moved to the top!
        const btn = document.getElementById('submitNewSingle');
        if (!btn) return;

        const isExisting = toggleExistingSingle.checked;
        const artistId = singleArtistSelect.value;
        const title = document.getElementById('singleTitle').value;
        const cover = document.getElementById('singleCoverUrl').value;
        const dateLocal = singleReleaseDateInput.value; // Get value first

        // *** CORREÇÃO DO ERRO DE SINTAXE E VALIDAÇÃO ***
        if (!artistId || !title || !cover || !dateLocal) { // Validate dateLocal here
            alert("Preencha todos os campos do single (Artista, Nome, Capa, Data/Hora).");
            return;
        }
        // *** FIM DA CORREÇÃO ***

        if (isExisting) {
            const existingSongId = existingTrackSelect.value;
            if (!existingSongId) {
                alert("Selecione uma faixa existente para promover.");
                return;
            }
            existingSingleTrackId.value = existingSongId;
        } else {
            const track = document.getElementById('trackName').value;
            const dur = document.getElementById('trackDuration').value;
            if (!track || !dur || parseDurationToSeconds(dur) === 0) {
                alert("Preencha o nome e a duração (MM:SS) da nova faixa.");
                return;
            }
            existingSingleTrackId.value = '';
        }

        btn.disabled = true;
        btn.textContent = 'Aguardando...';
        trackTypeModal?.classList.remove('hidden');
    }

    // processSingleSubmission (CORRIGIDO - Date/Time)
    async function processSingleSubmission(trackType) {
        const btn = document.getElementById('submitNewSingle');
        trackTypeModal?.classList.add('hidden');
        if(btn) btn.textContent = 'Enviando...';

        try {
            const artistId = singleArtistSelect.value;
            const title = document.getElementById('singleTitle').value;
            const cover = document.getElementById('singleCoverUrl').value;
            const dateLocal = singleReleaseDateInput.value; // Pega 'YYYY-MM-DDTHH:MM'
            const existingSongId = existingSingleTrackId.value;

            if (!dateLocal) throw new Error("Data de lançamento inválida.");
            const dateISO = new Date(dateLocal).toISOString(); // Converte para ISO

            // 1. Criar o registro do Single/EP
            const singleRes = await createAirtableRecord('Singles e EPs', {
                "Nome do Single/EP": title,
                "Artista": [artistId],
                "Capa": [{"url": cover}],
                "Data de Lançamento": dateISO // Envia ISO
            });

            if (!singleRes || !singleRes.id) {
                throw new Error("Falha ao criar o registro do Single/EP.");
            }
            const singleId = singleRes.id;

            // 2. Criar OU Atualizar a Música
            if (existingSongId) {
                // ATUALIZAR FAIXA EXISTENTE
                console.log(`Atualizando faixa existente: ${existingSongId} com novo single ${singleId}`);
                const song = db.songs.find(s => s.id === existingSongId);
                const existingSingleIds = song?.singleIds || [];
                const musicRes = await updateAirtableRecord('Músicas', existingSongId, {
                    "Singles e EPs": [...new Set([...existingSingleIds, singleId])],
                    "Tipo de Faixa": trackType
                });
                if (!musicRes || !musicRes.id) {
                    throw new Error("Falha ao ATUALIZAR a música existente.");
                }
            } else {
                // CRIAR FAIXA NOVA
                console.log(`Criando faixa nova para o single ${singleId}`);
                let musicFields = {};
                const featTags = document.querySelectorAll('#singleFeatList .feat-tag');
                let fArtists = [artistId];
                let collab = null;
                let fTrackName = document.getElementById('trackName').value;
                let featNames = [];
                if (featTags.length > 0) {
                    const fIds = [];
                    collab = featTags[0].dataset.featType;
                    featTags.forEach(t => { fIds.push(t.dataset.artistId); featNames.push(t.dataset.artistName); });
                    fArtists = [artistId, ...fIds];
                    if (collab === "Feat.") {
                        fTrackName = `${fTrackName} (feat. ${featNames.join(', ')})`;
                    }
                }
                const durStr = document.getElementById('trackDuration').value;
                const durSec = parseDurationToSeconds(durStr);
                musicFields = {
                    "Nome da Faixa": fTrackName, "Artista": fArtists, "Duração": durSec,
                    "Nº da Faixa": 1, "Singles e EPs": [singleId], "Tipo de Faixa": trackType,
                };
                if (collab) { musicFields["Tipo de Colaboração"] = collab; }
                const musicRes = await createAirtableRecord('Músicas', musicFields);
                if (!musicRes || !musicRes.id) {
                    console.error("Single criado, mas falha ao criar registro da Música.");
                    throw new Error("Falha ao criar a música.");
                }
            }

            // 3. Sucesso e Limpeza
            alert("Single lançado com sucesso!");
            newSingleForm?.reset();
            // Reseta para o datetime-local atual
            if(singleReleaseDateInput) {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                now.setSeconds(0); now.setMilliseconds(0);
                singleReleaseDateInput.value = now.toISOString().slice(0, 16);
            }
            const singleFeatListEl = document.getElementById('singleFeatList');
            if(singleFeatListEl) singleFeatListEl.innerHTML = '';
            toggleSingleFormMode(true);
            await refreshAllData();

        } catch (e) {
            alert("Erro ao lançar o single. Verifique o console.");
            console.error("Erro em processSingleSubmission:", e);
        } finally {
            if(btn) {
                btn.disabled = false;
                btn.textContent = 'Lançar Single';
            }
            existingSingleTrackId.value = '';
        }
    }

    // initAlbumForm
    function initAlbumForm() { if(albumTracklistEditor) albumTracklistEditor.innerHTML='<p class="empty-state-small">Nenhuma faixa.</p>'; updateTrackNumbers(); if(albumTracklistEditor&&typeof Sortable!=='undefined'){if(albumTracklistSortable){albumTracklistSortable.destroy();} albumTracklistSortable=Sortable.create(albumTracklistEditor,{animation:150, handle:'.drag-handle', onEnd:updateTrackNumbers});} else if(typeof Sortable==='undefined'){console.warn("SortableJS não carregado.");} }


    // handleAlbumSubmit (CORRIGIDO - Date/Time)
    async function handleAlbumSubmit(event) {
        event.preventDefault();
        const btn=document.getElementById('submitNewAlbum');
        if(!btn) return;
        btn.disabled=true;
        btn.textContent='Enviando...';

        try {
            const artistId=albumArtistSelect.value;
            const title=document.getElementById('albumTitle').value;
            const cover=document.getElementById('albumCoverUrl').value;
            const dateLocal=albumReleaseDateInput.value; // Pega 'YYYY-MM-DDTHH:MM'

            if(!artistId||!title||!cover||!dateLocal){alert("Preencha todos os campos do Álbum / EP (Artista, Nome, Capa, Data/Hora)."); throw new Error("Campos Álbum faltando.");}

            const dateISO = new Date(dateLocal).toISOString(); // Converte para ISO

            const items=albumTracklistEditor?.querySelectorAll('.track-list-item-display');
            if(!items || items.length===0){alert("Adicione pelo menos uma faixa ao Álbum/EP."); throw new Error("Nenhuma faixa.");}

            let totalDur=0;
            const musicRecsToCreate = [];
            const musicRecsToUpdate = [];

            for(let i=0; i<items.length; i++){
                const item=items[i];
                const existingSongId = item.dataset.existingSongId;
                const name=item.dataset.trackName;
                const durStr=item.dataset.durationStr;
                const type=item.dataset.trackType;
                const feats=JSON.parse(item.dataset.feats||'[]');
                const durSec=parseDurationToSeconds(durStr);
                if(!name||!durStr||durSec===0){alert(`Dados inválidos na Faixa ${i+1}. Verifique nome e duração.`); throw new Error(`Dados inválidos ${i+1}.`);}
                totalDur+=durSec;

                if (existingSongId) {
                    musicRecsToUpdate.push({
                        id: existingSongId,
                        fields: { "Nº da Faixa": i + 1, "Tipo de Faixa": type }
                    });
                } else {
                    let fName=name;
                    let fArts=[artistId];
                    let collab=null;
                    if(feats.length>0){
                        collab=feats[0].type;
                        const fIds=feats.map(f=>f.id);
                        const fNames=feats.map(f=>f.name);
                        fArts=[artistId,...fIds];
                        if(collab==="Feat."){ fName=`${name} (feat. ${fNames.join(', ')})`; }
                    }
                    const rec={"Nome da Faixa":fName, "Artista":fArts, "Duração":durSec, "Nº da Faixa":i+1, "Tipo de Faixa":type};
                    if(collab){rec["Tipo de Colaboração"]=collab;}
                    musicRecsToCreate.push(rec);
                }
            }

            const isAlbum=totalDur>=(30*60);
            const tName=isAlbum?'Álbuns':'Singles e EPs';
            const nFld=isAlbum?'Nome do Álbum':'Nome do Single/EP';
            const cFld=isAlbum?'Capa do Álbum':'Capa';

            const relRes=await createAirtableRecord(tName,{
                [nFld]:title, "Artista":[artistId], [cFld]:[{"url":cover}],
                "Data de Lançamento":dateISO // Usa ISO
            });
            if(!relRes||!relRes.id){throw new Error("Falha ao criar o registro do Álbum/EP.");}

            const relId=relRes.id;
            const linkFld=isAlbum?'Álbuns':'Singles e EPs';
            musicRecsToCreate.forEach(rec=>{rec[linkFld]=[relId];});
            musicRecsToUpdate.forEach(rec => {
                const song = db.songs.find(s => s.id === rec.id);
                const existingLinks = (isAlbum ? song?.albumIds : song?.singleIds) || [];
                rec.fields[linkFld] = [...new Set([...existingLinks, relId])];
            });

            let createdResult = null;
            let updatedResult = null;
            let allSucceeded = true;
            if (musicRecsToCreate.length > 0) {
                createdResult = await batchCreateAirtableRecords('Músicas', musicRecsToCreate);
                if (!createdResult || createdResult.length !== musicRecsToCreate.length) {
                    allSucceeded = false; console.error("Falha ao criar algumas músicas novas.");
                }
            }
            if (musicRecsToUpdate.length > 0) {
                updatedResult = await batchUpdateAirtableRecords('Músicas', musicRecsToUpdate);
                 if (!updatedResult || updatedResult.length !== musicRecsToUpdate.length) {
                    allSucceeded = false; console.error("Falha ao atualizar algumas músicas existentes.");
                 }
            }

            if(!allSucceeded){
                alert("Álbum/EP lançado, mas ocorreu um erro ao criar ou atualizar uma ou mais faixas. Verifique o console.");
            } else {
                alert("Álbum/EP lançado com sucesso!");
            }

            newAlbumForm?.reset();
            // Reseta para o datetime-local atual
            if(albumReleaseDateInput) {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                now.setSeconds(0); now.setMilliseconds(0);
                albumReleaseDateInput.value = now.toISOString().slice(0, 16);
            }
            initAlbumForm();
            await refreshAllData();

        } catch(e){
            alert("Erro ao lançar o álbum/EP. Verifique o console.");
            console.error("Erro handleAlbumSubmit:", e);
        } finally {
            btn.disabled=false;
            btn.textContent='Lançar Álbum / EP';
        }
    } // Fim do handleAlbumSubmit


    // --- FUNÇÕES DE EDIÇÃO/EXCLUSÃO ---

    // populateEditableReleases (HTML LIMPO)
    function populateEditableReleases() {
        if (!currentPlayer || !editReleaseList) {
            if (editReleaseList) editReleaseList.innerHTML = '<p class="empty-state-small">Faça login para ver seus lançamentos.</p>';
            return;
        }
        const selectedArtistId = editArtistFilterSelect.value;
        const playerArtistIds = currentPlayer.artists || [];
        let releasesToFilter = [...db.albums, ...db.singles];
        if (selectedArtistId && selectedArtistId !== 'all') {
            releasesToFilter = releasesToFilter.filter(release => release.artistId === selectedArtistId);
        } else {
            releasesToFilter = releasesToFilter.filter(release => playerArtistIds.includes(release.artistId));
        }
        const editableReleases = releasesToFilter.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)); // Mantém a ordem simples aqui (mais recente primeiro)

        if (editableReleases.length === 0) {
            editReleaseList.innerHTML = '<p class="empty-state-small">Nenhum lançamento encontrado para este filtro.</p>';
            return;
        }
        // HTML LIMPO
        editReleaseList.innerHTML = editableReleases.map(release => `
<div class="edit-release-item">
<img src="${release.imageUrl}" alt="${release.title}" class="edit-release-cover">
<div class="edit-release-info">
<span class="edit-release-title">${release.title}</span>
<span class="edit-release-artist">${release.artist} - ${new Date(release.releaseDate).getFullYear()}</span>
</div>
<div class="action-buttons">
<button type="button" class="small-btn edit-release-btn"
data-release-id="${release.id}"
data-release-type="${release.type}"
data-release-table="${release.tableName}">
<i class="fas fa-pencil-alt"></i> Editar
</button>
<button type="button" class="small-btn delete-release-btn"
data-release-id="${release.id}"
data-release-type="${release.type}"
data-release-table="${release.tableName}"
data-release-title="${release.title}">
<i class="fas fa-trash-alt"></i> Apagar
</button>
</div>
</div>`).join('');
    }

    // openEditForm (CORRIGIDO - Date/Time)
    function openEditForm(releaseId, releaseType) {
        const release = (releaseType === 'album' ? db.albums : db.singles).find(r => r.id === releaseId);
        if (!release || !editReleaseForm) {
            alert("Erro: Lançamento não encontrado.");
            return;
        }
        editReleaseId.value = release.id;
        editReleaseType.value = release.type;
        editReleaseTableName.value = release.tableName;
        editArtistNameDisplay.textContent = release.artist;
        editReleaseTitle.value = release.title;
        editReleaseCoverUrl.value = release.imageUrl;
        // Converte ISO para YYYY-MM-DD para o input type="date"
        if (release.releaseDate) {
           try {
              // Extrai apenas a parte da data YYYY-MM-DD
              editReleaseDate.value = release.releaseDate.split('T')[0];
           } catch(e) {
              console.error("Erro ao formatar data para edição:", e);
              editReleaseDate.value = ''; // Define como vazio se houver erro
           }
        } else {
            editReleaseDate.value = ''; // Define como vazio se não houver data
        }
        editReleaseListContainer?.classList.add('hidden');
        editReleaseForm.classList.remove('hidden');
    }

    // handleUpdateRelease (CORRIGIDO - Date/Time)
    async function handleUpdateRelease(event) {
        event.preventDefault();
        if (!saveEditBtn) return;
        const recordId = editReleaseId.value;
        const tableName = editReleaseTableName.value;
        const type = editReleaseType.value;
        const updatedTitle = editReleaseTitle.value.trim();
        const updatedCoverUrl = editReleaseCoverUrl.value.trim();
        const updatedReleaseDateValue = editReleaseDate.value; // Pega YYYY-MM-DD

        if (!recordId || !tableName || !updatedTitle || !updatedCoverUrl || !updatedReleaseDateValue) {
            alert("Erro: Dados inválidos ou faltando para a edição.");
            return;
        }

        // Converte YYYY-MM-DD para ISO 8601 (assume meia-noite UTC)
        // Se precisar de hora específica, use datetime-local no form de edição também
        const updatedReleaseDateISO = new Date(updatedReleaseDateValue + 'T00:00:00Z').toISOString();

        saveEditBtn.disabled = true;
        saveEditBtn.textContent = 'Salvando...';
        const titleFieldName = (tableName === 'Álbuns') ? 'Nome do Álbum' : 'Nome do Single/EP';
        const coverFieldName = (tableName === 'Álbuns') ? 'Capa do Álbum' : 'Capa';
        const fieldsToUpdate = {
            [titleFieldName]: updatedTitle,
            [coverFieldName]: [{ "url": updatedCoverUrl }],
            "Data de Lançamento": updatedReleaseDateISO // Envia ISO
        };
        try {
            const result = await updateAirtableRecord(tableName, recordId, fieldsToUpdate);
            if (result && result.id) {
                alert("Lançamento atualizado com sucesso!");
                editReleaseForm.classList.add('hidden');
                editReleaseListContainer?.classList.remove('hidden');
                await refreshAllData();
            } else {
                throw new Error("Falha ao atualizar o registro no Airtable.");
            }
        } catch (error) {
            alert("Erro ao salvar alterações. Verifique o console.");
            console.error("Erro em handleUpdateRelease:", error);
        } finally {
            saveEditBtn.disabled = false;
            saveEditBtn.textContent = 'Salvar Alterações';
        }
    }

    // openDeleteConfirmModal, closeDeleteConfirmModal, handleDeleteRelease
    function openDeleteConfirmModal(recordId, tableName, releaseTitle, trackIds) { if (!deleteConfirmModal) return; deleteRecordId.value = recordId; deleteTableName.value = tableName; deleteReleaseName.textContent = releaseTitle; deleteTrackIds.value = JSON.stringify(trackIds || []); deleteConfirmModal.classList.remove('hidden'); }
    function closeDeleteConfirmModal() { if (!deleteConfirmModal) return; deleteConfirmModal.classList.add('hidden'); deleteRecordId.value = ''; deleteTableName.value = ''; deleteReleaseName.textContent = ''; deleteTrackIds.value = ''; }
    async function handleDeleteRelease() {
        if (!confirmDeleteBtn) return;
        const recordId = deleteRecordId.value;
        const tableName = deleteTableName.value;
        const trackIdsString = deleteTrackIds.value;
        let trackIds = [];
        try { trackIds = JSON.parse(trackIdsString || '[]'); } catch(e) { console.error("Erro ao parsear IDs das músicas para deletar:", e); trackIds = []; }
        if (!recordId || !tableName) { alert("Erro: Informações inválidas para exclusão."); closeDeleteConfirmModal(); return; }
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Apagando...';
        try {
            let tracksProcessedSuccessfully = true;
             if (trackIds.length > 0) {
                 console.log(`Verificando ${trackIds.length} músicas associadas...`);
                 const updates = [];
                 const deletes = [];
                 for (const trackId of trackIds) {
                     const song = db.songs.find(s => s.id === trackId);
                     if (!song) continue;
                     const albumLinksCount = (song.albumIds || []).length;
                     const singleLinksCount = (song.singleIds || []).length;
                     if (albumLinksCount + singleLinksCount > 1) {
                         console.log(`Desvinculando música ${trackId} do lançamento ${recordId}`);
                         const isAlbum = tableName === 'Álbuns';
                         const linkField = isAlbum ? 'Álbuns' : 'Singles e EPs';
                         const existingLinks = (isAlbum ? song.albumIds : song.singleIds) || [];
                         const updatedLinks = existingLinks.filter(linkId => linkId !== recordId);
                         updates.push({ id: trackId, fields: { [linkField]: updatedLinks } });
                     } else {
                         console.log(`Marcando música ${trackId} para exclusão.`);
                         deletes.push(trackId);
                     }
                 }
                 if (updates.length > 0) {
                     console.log(`Desvinculando ${updates.length} músicas...`);
                     const updateResult = await batchUpdateAirtableRecords('Músicas', updates);
                     if (!updateResult || updateResult.length !== updates.length) {
                         tracksProcessedSuccessfully = false; console.error("Falha ao desvincular uma ou mais músicas."); alert("Atenção: Falha ao desvincular uma ou mais músicas associadas.");
                     } else { console.log("Músicas desvinculadas com sucesso."); }
                 }
                 if (deletes.length > 0) {
                     console.log(`Excluindo ${deletes.length} músicas...`);
                     const deleteResult = await batchDeleteAirtableRecords('Músicas', deletes);
                     if (!deleteResult || !deleteResult.success) {
                         tracksProcessedSuccessfully = false; console.error("Falha ao excluir uma ou mais músicas."); alert("Atenção: Falha ao excluir uma ou mais músicas associadas, mas tentaremos apagar o lançamento principal.");
                     } else { console.log("Músicas excluídas com sucesso."); }
                 }
            }
            console.log(`Tentando apagar o lançamento principal ${recordId} da tabela ${tableName}...`);
            const releaseDeleteResult = await deleteAirtableRecord(tableName, recordId);
            if (releaseDeleteResult && releaseDeleteResult.deleted) {
                alert("Lançamento apagado com sucesso!");
                closeDeleteConfirmModal();
                await refreshAllData();
            } else {
                 if (!tracksProcessedSuccessfully) { throw new Error("Falha ao apagar o lançamento principal e erro ao processar músicas associadas."); }
                 else { throw new Error("Falha ao apagar o registro principal do lançamento, mas as músicas foram desvinculadas/excluídas."); }
            }
        } catch (error) {
            alert(`Erro ao apagar o lançamento: ${error.message}. Verifique o console.`);
            console.error("Erro em handleDeleteRelease:", error);
            closeDeleteConfirmModal();
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Sim, Apagar';
        }
    }

    // --- 5. LÓGICA DO PLAYER DE MÚSICA ---
    function openPlayer(songId, clickedElement) { const song = db.songs.find(s => s.id === songId); if (!song) { console.error(`Música com ID ${songId} não encontrada.`); return; } const parentList = clickedElement.closest('.popular-songs-list, .tracklist-container, .chart-list'); if (parentList) { const songElements = parentList.querySelectorAll('[data-song-id]'); currentQueue = Array.from(songElements).map(el => db.songs.find(s => s.id === el.dataset.songId)).filter(Boolean); } else { currentQueue = [song]; } currentQueueIndex = currentQueue.findIndex(s => s.id === songId); if (currentQueueIndex === -1) { currentQueue = [song]; currentQueueIndex = 0; } currentSong = song; loadSong(song); musicPlayerView?.classList.remove('hidden'); document.body.classList.add('player-open'); }
    function closePlayer() { musicPlayerView?.classList.add('hidden'); document.body.classList.remove('player-open'); if (isPlaying) { togglePlay(); } }
    function loadSong(song) { currentSong = song; if(playerSongTitle) playerSongTitle.textContent = song.title; if(playerArtistName) playerArtistName.textContent = formatArtistString(song.artistIds, song.collabType); const parentRelease = [...db.albums, ...db.singles].find(r => r.id === song.albumId); if (parentRelease) { if(playerCoverArt) playerCoverArt.src = parentRelease.imageUrl; if(playerAlbumTitle) playerAlbumTitle.textContent = parentRelease.title; } else { if(playerCoverArt) playerCoverArt.src = 'https://i.imgur.com/AD3MbBi.png'; if(playerAlbumTitle) playerAlbumTitle.textContent = 'Single'; } const durationSec = song.durationSeconds || 180; if(playerSeekBar) { playerSeekBar.value = 0; playerSeekBar.max = durationSec; } if(playerCurrentTime) playerCurrentTime.textContent = "0:00"; if(playerTotalTime) playerTotalTime.textContent = formatTime(durationSec); if (isPlaying) { playAudio(); } else { pauseAudio(); } }
    function playAudio() { isPlaying = true; if(playerPlayPauseBtn) playerPlayPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; }
    function pauseAudio() { isPlaying = false; if(playerPlayPauseBtn) playerPlayPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; }
    function togglePlay() { if (isPlaying) { pauseAudio(); } else { playAudio(); } }
    function playNext() { if (!currentQueue || currentQueue.length === 0) return; if (isShuffle) { currentQueueIndex = Math.floor(Math.random() * currentQueue.length); } else { currentQueueIndex++; } if (currentQueueIndex >= currentQueue.length) { if (repeatMode === 'all') { currentQueueIndex = 0; } else { currentQueueIndex = currentQueue.length - 1; loadSong(currentQueue[currentQueueIndex]); pauseAudio(); playerSeekBar.value = playerSeekBar.max; if(playerCurrentTime) playerCurrentTime.textContent = formatTime(playerSeekBar.max); return; } } if (currentQueue[currentQueueIndex]) loadSong(currentQueue[currentQueueIndex]); }
    function playPrevious() { if (playerSeekBar && parseFloat(playerSeekBar.value) > 3) { playerSeekBar.value = 0; if(playerCurrentTime) playerCurrentTime.textContent = formatTime(0); if (isPlaying) playAudio(); return; } if (!currentQueue || currentQueue.length === 0) return; if (isShuffle) { currentQueueIndex = Math.floor(Math.random() * currentQueue.length); } else { currentQueueIndex--; } if (currentQueueIndex < 0) { if (repeatMode === 'all') { currentQueueIndex = currentQueue.length - 1; } else { currentQueueIndex = 0; } } if (currentQueue[currentQueueIndex]) loadSong(currentQueue[currentQueueIndex]); }
    function toggleShuffle() { isShuffle = !isShuffle; playerShuffleBtn?.classList.toggle('active', isShuffle); console.log("Shuffle:", isShuffle); }
    function toggleRepeat() { const icon = playerRepeatBtn?.querySelector('i'); if(!icon) return; if (repeatMode === 'none') { repeatMode = 'all'; playerRepeatBtn?.classList.add('active'); icon.className = 'fas fa-repeat'; } else if (repeatMode === 'all') { repeatMode = 'one'; playerRepeatBtn?.classList.add('active'); icon.className = 'fas fa-repeat-1'; } else { repeatMode = 'none'; playerRepeatBtn?.classList.remove('active'); icon.className = 'fas fa-repeat'; } console.log("Repeat Mode:", repeatMode); }
    function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; }
    function initializePlayerListeners() { playerCloseBtn?.addEventListener('click', closePlayer); playerPlayPauseBtn?.addEventListener('click', togglePlay); playerNextBtn?.addEventListener('click', playNext); playerPrevBtn?.addEventListener('click', playPrevious); playerShuffleBtn?.addEventListener('click', toggleShuffle); playerRepeatBtn?.addEventListener('click', toggleRepeat); playerSeekBar?.addEventListener('input', () => { if(playerCurrentTime) playerCurrentTime.textContent = formatTime(playerSeekBar.value); }); setInterval(() => { if (isPlaying && playerSeekBar && currentSong) { let currentValue = parseFloat(playerSeekBar.value); const maxValue = parseFloat(playerSeekBar.max); if (currentValue < maxValue) { currentValue += 1; playerSeekBar.value = currentValue; if(playerCurrentTime) playerCurrentTime.textContent = formatTime(currentValue); } else { if (repeatMode === 'one') { playerSeekBar.value = 0; if(playerCurrentTime) playerCurrentTime.textContent = formatTime(0); playAudio(); } else { playNext(); } } } }, 1000); }


    // --- 6. INICIALIZAÇÃO GERAL ---
    function initializeBodyClickListener() { document.body.addEventListener('click', (e) => { const artistCard = e.target.closest('.artist-card[data-artist-name]'); const albumCard = e.target.closest('[data-album-id]'); const songCard = e.target.closest('.song-row[data-song-id], .track-row[data-song-id], .chart-item[data-song-id]'); const artistLink = e.target.closest('.artist-link[data-artist-name]'); const discogLink = e.target.closest('.see-all-btn[data-type]'); if (discogLink) { openDiscographyDetail(discogLink.dataset.type); return; } if (albumCard && !albumCard.closest('.edit-release-item')) { openAlbumDetail(albumCard.dataset.albumId); return; } if (artistCard) { openArtistDetail(artistCard.dataset.artistName); return; } if (artistLink) { openArtistDetail(artistLink.dataset.artistName); return; } if (songCard) { if (!songCard.classList.contains('unavailable')) { console.log("Abrindo player para música ID:", songCard.dataset.songId); openPlayer(songCard.dataset.songId, songCard); } else { console.log("Música indisponível."); } return; } }); searchInput?.addEventListener('input', handleSearch); searchInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { handleSearch(); } }); }
    function attachNavigationListeners() { try { const allNavs = [...document.querySelectorAll('.nav-tab'), ...document.querySelectorAll('.bottom-nav-item')]; console.log(`Attaching listeners to ${allNavs.length} nav buttons.`); allNavs.forEach(nav => { nav.removeEventListener('click', switchTab); nav.addEventListener('click', switchTab); }); document.querySelectorAll('.back-btn').forEach(btn => { btn.removeEventListener('click', handleBack); btn.addEventListener('click', handleBack); }); } catch (listenerError) { console.error("Erro ao atribuir listeners de navegação:", listenerError); } }
    async function main() {
        console.log("Iniciando Aplicação...");
        if (!initializeDOMElements()) return;
        document.body.classList.add('loading');
        const data = await loadAllData();
        if (data && data.allArtists) {
            console.log("Dados brutos carregados. Processando...");
            if (initializeData(data)) {
                console.log("Dados processados. Renderizando UI inicial...");
                renderRPGChart();
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));
                renderChart('music');
                renderChart('album');
                setupCountdown('musicChartTimer', 'music');
                // setupCountdown('albumChartTimer', 'album'); // Comentado
                setupCountdown('rpgChartTimer', 'rpg');
                initializeStudio();
                initializePlayerListeners();
                initializeBodyClickListener();
                attachNavigationListeners();
                switchTab(null, 'homeSection');
                activateMainViewSection('homeSection');
                document.body.classList.remove('loading');
                console.log("Aplicação pronta.");
            } else {
                console.error("Falha ao inicializar dados processados (initializeData).");
                document.body.classList.remove('loading');
                document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Crítico</h1><p>Falha ao processar dados. Ver console.</p></div>';
            }
        } else {
            console.error("Falha ao carregar dados brutos (loadAllData).");
            document.body.classList.remove('loading');
            document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Crítico</h1><p>Não foi possível carregar os dados. Ver console.</p></div>';
        }
    }
    main();
});
