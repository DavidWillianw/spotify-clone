document.addEventListener('DOMContentLoaded', async () => {

    // --- VARIÁVEIS GLOBAIS ---
    let db = { artists: [], albums: [], singles: [], songs: [], players: [] };
    let currentPlayer = null;
    let albumTracklistSortable = null;
    let activeArtist = null;
    let currentFeatTarget = null; // Guarda o elemento (div) ONDE adicionar o feat tag
    let viewHistory = [];
    let editingTrackItem = null; // Guarda o item da lista que está sendo editado no modal de faixa do álbum
    
    // NOVO: Para guardar dados dos charts anteriores
    let previousMusicChartData = {};
    let previousAlbumChartData = {};
    let previousRpgChartData = {};


    // --- ELEMENTOS DO DOM ---
    let allViews, searchInput, studioView, loginPrompt, loggedInInfo, playerSelect,
        loginButton, logoutButton, studioLaunchWrapper, studioTabs, studioForms,
        newSingleForm, singleArtistSelect, singleReleaseDateInput, singleFeatList, // Adicionado singleFeatList
        newAlbumForm, albumArtistSelect, albumReleaseDateInput,
        albumTracklistEditor,
        // Modal Feat (Original - para Single)
        featModal, featArtistSelect, featTypeSelect, confirmFeatBtn, cancelFeatBtn,
        // Modal Tipo Faixa (Single)
        trackTypeModal, trackTypeSelect, confirmTrackTypeBtn, cancelTrackTypeBtn,
        // Modal Faixa Álbum
        albumTrackModal, albumTrackModalTitle, openAddTrackModalBtn,
        albumTrackNameInput, albumTrackDurationInput, albumTrackTypeSelect,
        albumTrackFeatList, saveAlbumTrackBtn, cancelAlbumTrackBtn, editingTrackItemId,
        // NOVO: Elementos do Adicionador Inline de Feat
        inlineFeatAdder, inlineFeatArtistSelect, inlineFeatTypeSelect,
        confirmInlineFeatBtn, cancelInlineFeatBtn, addInlineFeatBtn;


    const AIRTABLE_BASE_ID = 'appG5NOoblUmtSMVI';
    const AIRTABLE_API_KEY = 'pat5T28kjmJ4t6TQG.69bf34509e687fff6a3f76bd52e64518d6c92be8b1ee0a53bcc9f50fedcb5c70';

    // NOVO: Chaves para localStorage (Indicadores de Chart)
    const PREVIOUS_MUSIC_CHART_KEY = 'spotifyRpg_previousMusicChart';
    const PREVIOUS_ALBUM_CHART_KEY = 'spotifyRpg_previousAlbumChart';
    const PREVIOUS_RPG_CHART_KEY = 'spotifyRpg_previousRpgChart';

    // --- FUNÇÃO PARA INICIALIZAR ELEMENTOS DO DOM ---
    function initializeDOMElements() {
        console.log("Initializing DOM elements...");
        try { // Adiciona try-catch para facilitar debug de elementos não encontrados
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
            singleFeatList = document.getElementById('singleFeatList'); // Pega a lista de feat do single
            newAlbumForm = document.getElementById('newAlbumForm');
            albumArtistSelect = document.getElementById('albumArtistSelect');
            albumReleaseDateInput = document.getElementById('albumReleaseDate');
            albumTracklistEditor = document.getElementById('albumTracklistEditor');

            // Modal Feat (Original)
            featModal = document.getElementById('featModal');
            featArtistSelect = document.getElementById('featArtistSelect');
            featTypeSelect = document.getElementById('featTypeSelect');
            confirmFeatBtn = document.getElementById('confirmFeatBtn');
            cancelFeatBtn = document.getElementById('cancelFeatBtn');

            // Modal Tipo Faixa (Single)
            trackTypeModal = document.getElementById('trackTypeModal');
            trackTypeSelect = document.getElementById('trackTypeSelect');
            confirmTrackTypeBtn = document.getElementById('confirmTrackTypeBtn');
            cancelTrackTypeBtn = document.getElementById('cancelTrackTypeBtn');

            // Modal Faixa Álbum
            albumTrackModal = document.getElementById('albumTrackModal');
            albumTrackModalTitle = document.getElementById('albumTrackModalTitle');
            openAddTrackModalBtn = document.getElementById('openAddTrackModalBtn');
            albumTrackNameInput = document.getElementById('albumTrackNameInput');
            albumTrackDurationInput = document.getElementById('albumTrackDurationInput');
            albumTrackTypeSelect = document.getElementById('albumTrackTypeSelect');
            albumTrackFeatList = document.getElementById('albumTrackFeatList'); // Lista de feats DENTRO do modal
            saveAlbumTrackBtn = document.getElementById('saveAlbumTrackBtn');
            cancelAlbumTrackBtn = document.getElementById('cancelAlbumTrackBtn');
            editingTrackItemId = document.getElementById('editingTrackItemId');

            // Elementos do Adicionador Inline de Feat (Dentro do Modal Faixa Álbum)
            inlineFeatAdder = document.getElementById('inlineFeatAdder');
            inlineFeatArtistSelect = document.getElementById('inlineFeatArtistSelect');
            inlineFeatTypeSelect = document.getElementById('inlineFeatTypeSelect');
            confirmInlineFeatBtn = document.getElementById('confirmInlineFeatBtn');
            cancelInlineFeatBtn = document.getElementById('cancelInlineFeatBtn');
            // O botão para ABRIR o inline adder (dentro do modal)
            // Busca segura: só busca se albumTrackModal existir
            addInlineFeatBtn = albumTrackModal ? albumTrackModal.querySelector('.add-inline-feat-btn') : null;


            // Verificação de elementos essenciais atualizada
            const essentialElements = {
                'studioView': studioView, 'loginPrompt': loginPrompt, 'playerSelect': playerSelect,
                'newSingleForm': newSingleForm, 'newAlbumForm': newAlbumForm, 'featModal': featModal,
                'singleReleaseDateInput': singleReleaseDateInput, 'albumReleaseDateInput': albumReleaseDateInput,
                'trackTypeModal': trackTypeModal, 'albumTrackModal': albumTrackModal,
                'openAddTrackModalBtn': openAddTrackModalBtn, 'inlineFeatAdder': inlineFeatAdder,
                'inlineFeatArtistSelect': inlineFeatArtistSelect, 'confirmInlineFeatBtn': confirmInlineFeatBtn,
                'addInlineFeatBtn': addInlineFeatBtn
            };
            
            const missing = Object.keys(essentialElements).filter(key => !essentialElements[key]);

            if (!allViews || allViews.length === 0 || missing.length > 0) {
                const missingAll = !allViews || allViews.length === 0 ? ['allViews'] : [];
                const allMissingElements = [...missingAll, ...missing];
                 console.error("ERRO CRÍTICO: Elementos essenciais do HTML não foram encontrados!", { missing: allMissingElements });
                document.body.innerHTML = `<div style="color: red; padding: 20px; text-align: center;"><h1>Erro de Interface</h1><p>Elementos essenciais da página não foram encontrados: <strong>${allMissingElements.join(', ')}</strong>. Verifique o HTML e os IDs.</p></div>`;
                return false;
            }

            const today = new Date().toISOString().split('T')[0];
            singleReleaseDateInput.value = today;
            albumReleaseDateInput.value = today;

            console.log("DOM elements initialized.");
            return true;
        } catch(error) {
             console.error("Erro ao inicializar elementos do DOM:", error);
            document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Fatal na UI</h1><p>Houve um erro ao carregar os elementos: ${error.message}</p><p>Verifique o console.</p></div>`;
             return false;
        }
    }


    // --- 1. CARREGAMENTO DE DADOS --- 

    async function fetchAllAirtablePages(baseUrl, fetchOptions) {
        let allRecords = [];
        let offset = null;
        do {
            const separator = baseUrl.includes('?') ? '&' : '?';
            const fetchUrl = offset ? `${baseUrl}${separator}offset=${offset}` : baseUrl;
            const response = await fetch(fetchUrl, fetchOptions);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Falha ao carregar ${fetchUrl}: ${response.status} - ${errorText}`);
                throw new Error(`Airtable fetch failed for ${baseUrl}`);
            }
            const data = await response.json();
            if (data.records) { allRecords.push(...data.records); }
            offset = data.offset;
        } while (offset);
        return { records: allRecords };
    }


    async function loadAllData() {
        const artistsURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Artists?filterByFormula=%7BArtista%20Principal%7D%3D1`;
        const albumsURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Álbuns')}`;
        const musicasURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Músicas')}`;
        const singlesURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Singles e EPs')}`;
        const playersURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Jogadores`;
        const fetchOptions = { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } };

        console.log("Iniciando carregamento de dados (com paginação)...");
        try {
            const [artistsData, albumsData, musicasData, singlesData, playersData] = await Promise.all([
                fetchAllAirtablePages(artistsURL, fetchOptions),
                fetchAllAirtablePages(albumsURL, fetchOptions),
                fetchAllAirtablePages(musicasURL, fetchOptions),
                fetchAllAirtablePages(singlesURL, fetchOptions),
                fetchAllAirtablePages(playersURL, fetchOptions)
            ]);

            if (!artistsData || !albumsData || !musicasData || !singlesData || !playersData) {
                 throw new Error('Falha ao carregar dados Airtable (paginação).');
            }

            const musicasMap = new Map();
            (musicasData.records || []).forEach(record => {
                const artistIdsFromServer = record.fields['Artista'] || [];
                const artistIds = Array.isArray(artistIdsFromServer) ? artistIdsFromServer : [artistIdsFromServer];
                const parentReleaseId = (record.fields['Álbuns'] && record.fields['Álbuns'][0]) || (record.fields['Singles e EPs'] && record.fields['Singles e EPs'][0]) || null;

                musicasMap.set(record.id, {
                    id: record.id, title: record.fields['Nome da Faixa'] || 'Faixa Sem Título',
                    duration: record.fields['Duração'] ? new Date(record.fields['Duração'] * 1000).toISOString().substr(14, 5) : "00:00",
                    trackNumber: record.fields['Nº da Faixa'] || 0, durationSeconds: record.fields['Duração'] || 0,
                    artistIds: artistIds, collabType: record.fields['Tipo de Colaboração'], albumId: parentReleaseId,
                    streams: record.fields.Streams || 0,
                    trackType: record.fields['Tipo de Faixa'] || 'Album Track'
                });
            });

            const artistsMapById = new Map();
            const artistsList = (artistsData.records || []).map(record => {
                const artist = {
                    id: record.id, name: record.fields.Name || 'Nome Indisponível',
                    imageUrl: (record.fields['URL da Imagem'] && record.fields['URL da Imagem'][0]?.url) || 'https://i.imgur.com/AD3MbBi.png',
                    off: record.fields['Inspirações (Off)'] || [], RPGPoints: record.fields.RPGPoints || 0, LastActive: record.fields.LastActive || null
                };
                artistsMapById.set(artist.id, artist.name);
                return artist;
            });

            const formatReleases = (records, isAlbumTable) => {
                if (!records) return [];
                return records.map(record => {
                    const fields = record.fields;
                    const recordId = record.id;
                    const tracks = Array.from(musicasMap.values()).filter(song => song.albumId === recordId)
                        .sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
                    const totalDurationSeconds = tracks.reduce((total, track) => total + (track.durationSeconds || 0), 0);
                    const mainArtistIdFromServer = fields['Artista'] || [];
                    const mainArtistId = Array.isArray(mainArtistIdFromServer) ? mainArtistIdFromServer[0] : (mainArtistIdFromServer || null);
                    const mainArtistName = mainArtistId ? artistsMapById.get(mainArtistId) : "Artista Desconhecido";
                    const imageUrlField = isAlbumTable ? 'Capa do Álbum' : 'Capa';
                    const imageUrl = (fields[imageUrlField] && fields[imageUrlField][0]?.url) || 'https://i.imgur.com/AD3MbBi.png';
                    const title = fields['Nome do Álbum'] || fields['Nome do Single/EP'] || 'Título Indisponível';

                    return {
                        id: record.id, title: title, artist: mainArtistName, artistId: mainArtistId,
                        metascore: fields['Metascore'] || 0, imageUrl: imageUrl, releaseDate: fields['Data de Lançamento'] || '2024-01-01',
                        tracks: tracks,
                        totalDurationSeconds: totalDurationSeconds
                    };
                });
            };

            const formattedAlbums = formatReleases(albumsData.records, true);
            const formattedSingles = formatReleases(singlesData.records, false);
            const formattedPlayers = (playersData.records || []).map(record => ({
                id: record.id, name: record.fields.Nome, artists: record.fields.Artistas || []
            }));

            console.log("Dados carregados com sucesso.");
            return {
                allArtists: artistsList, albums: formattedAlbums, singles: formattedSingles,
                players: formattedPlayers, musicas: Array.from(musicasMap.values())
            };
        } catch (error) {
            console.error("Falha GERAL ao carregar dados:", error);
            return null;
        }
    }

    // ATUALIZADO: Carrega os charts anteriores do localStorage
    const initializeData = (data) => {
        try {
            // Tenta carregar os dados dos charts anteriores
            try {
                const prevMusic = localStorage.getItem(PREVIOUS_MUSIC_CHART_KEY);
                previousMusicChartData = prevMusic ? JSON.parse(prevMusic) : {};
                const prevAlbum = localStorage.getItem(PREVIOUS_ALBUM_CHART_KEY);
                previousAlbumChartData = prevAlbum ? JSON.parse(prevAlbum) : {};
                const prevRpg = localStorage.getItem(PREVIOUS_RPG_CHART_KEY);
                previousRpgChartData = prevRpg ? JSON.parse(prevRpg) : {};
                console.log("Dados de chart anteriores carregados do localStorage.");
            } catch (e) {
                console.error("Erro ao carregar dados de chart do localStorage:", e);
                previousMusicChartData = {}; previousAlbumChartData = {}; previousRpgChartData = {};
            }

            const artistsMapById = new Map();
            db.artists = (data.allArtists || []).map(artist => {
                const artistEntry = { ...artist, img: artist.imageUrl || 'https://i.imgur.com/AD3MbBi.png', albums: [], singles: [] };
                artistsMapById.set(artist.id, artist.name);
                return artistEntry;
            });

            db.songs = (data.musicas || []).map(song => ({
                ...song, streams: song.streams || 0, cover: 'https://i.imgur.com/AD3MbBi.png',
                artist: artistsMapById.get((song.artistIds || [])[0]) || 'Artista Desc.'
            }));

            db.albums = []; db.singles = [];
            const allReleases = [...(data.albums || []), ...(data.singles || [])];
            const thirtyMinutesInSeconds = 30 * 60;

            allReleases.forEach(item => {
                (item.tracks || []).forEach(trackInfo => {
                    const songInDb = db.songs.find(s => s.id === trackInfo.id);
                    if (songInDb) { songInDb.cover = item.imageUrl; }
                     else { console.warn(`Song ID ${trackInfo.id} (faixa "${trackInfo.title}") listada no lançamento "${item.title}" não encontrada.`); }
                });
                const artistEntry = db.artists.find(a => a.id === item.artistId);
                if ((item.totalDurationSeconds || 0) >= thirtyMinutesInSeconds) {
                    db.albums.push(item); if (artistEntry) { artistEntry.albums.push(item); }
                } else {
                    db.singles.push(item); if (artistEntry) { artistEntry.singles.push(item); }
                }
                if (!artistEntry && item.artist !== "Artista Desconhecido") { console.warn(`Artista "${item.artist}" (ID: ${item.artistId}) do lançamento "${item.title}" não encontrado.`); }
            });
            db.players = data.players || [];
            console.log(`DB Inicializado: Artists: ${db.artists.length}, Albums: ${db.albums.length}, Singles: ${db.singles.length}, Songs: ${db.songs.length}, Players: ${db.players.length}`);
            return true;
        } catch (error) {
            console.error("Erro CRÍTICO durante initializeData:", error);
            alert("Erro MUITO GRAVE ao inicializar dados.");
            return false;
        }
    };

    // NOVA FUNÇÃO: Salva os dados do chart atual no localStorage
    const saveChartDataToLocalStorage = (chartType) => {
        let currentChartData = {};
        let storageKey = '';
        let dataList = [];
        console.log(`Salvando dados do chart (tipo: ${chartType}) no localStorage...`);
    
        if (chartType === 'music') {
            storageKey = PREVIOUS_MUSIC_CHART_KEY;
            dataList = [...db.songs].sort((a, b) => (b.streams || 0) - (a.streams || 0)).slice(0, 50);
            // Mapeia: { 'songId': 1, 'songId2': 2, ... }
            currentChartData = dataList.reduce((acc, item, index) => {
                acc[item.id] = index + 1; // Salva a Posição (rank 1, 2, 3...)
                return acc;
            }, {});
            // Atualiza a variável global para o próximo render
            previousMusicChartData = currentChartData;
    
        } else if (chartType === 'album') {
            storageKey = PREVIOUS_ALBUM_CHART_KEY;
            dataList = [...db.albums].sort((a, b) => (b.metascore || 0) - (a.metascore || 0)).slice(0, 50);
            currentChartData = dataList.reduce((acc, item, index) => {
                acc[item.id] = index + 1;
                return acc;
            }, {});
            previousAlbumChartData = currentChartData;
    
        } else if (chartType === 'rpg') {
            storageKey = PREVIOUS_RPG_CHART_KEY;
            // Usa a mesma lógica de cálculo do renderRPGChart
            dataList = computeChartData(db.artists); // computeChartData já ordena e fatia
            currentChartData = dataList.reduce((acc, item, index) => {
                acc[item.id] = index + 1;
                return acc;
            }, {});
            previousRpgChartData = currentChartData;
    
        } else {
            console.error("Tipo de chart inválido para salvar:", chartType);
            return;
        }
    
        try {
            localStorage.setItem(storageKey, JSON.stringify(currentChartData));
            console.log(`Chart ${chartType} salvo com sucesso.`);
        } catch (e) {
            console.error(`Erro ao salvar chart ${chartType} no localStorage:`, e);
        }
    };


    async function refreshAllData() {
        console.log("Atualizando todos os dados...");
        const data = await loadAllData();
        if (data && data.allArtists) {
        // Ao atualizar, não recarregamos os dados do chart do localStorage,
        // pois queremos manter a comparação com o início da sessão.
        // Apenas reinicializamos o DB
            if (initializeData(data)) { 
                console.log("Dados atualizados e UI renderizada.");
                renderRPGChart();
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));
                renderChart('music');
                renderChart('album');
                if (currentPlayer) { populateArtistSelector(currentPlayer.id); }
                if (activeArtist && !document.getElementById('artistDetail').classList.contains('hidden')) {
                    const refreshedArtist = db.artists.find(a => a.id === activeArtist.id);
                    if (refreshedArtist) { openArtistDetail(refreshedArtist.name); } else { handleBack(); }
                }
                return true;
            }
        }
        console.error("Falha ao atualizar os dados.");
        alert("Não foi possível atualizar os dados do servidor.");
        return false;
    }

    // --- 2. NAVEGAÇÃO E UI ---

    const switchView = (viewId, targetSectionId = null) => {
        console.log(`Switching view to: ${viewId}`);
        allViews.forEach(view => {
            view.classList.add('hidden');
        });

        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            window.scrollTo(0, 0);

            if (viewId === 'mainView' && targetSectionId) {
                switchTab(null, targetSectionId);
            }

            if (viewId !== 'mainView' && viewId !== 'studioView') {
                 if (viewHistory.length === 0 || viewHistory[viewHistory.length - 1] !== viewId) {
                     viewHistory.push(viewId);
                 }
            } else if (viewId === 'mainView') {
                viewHistory = [];
            }

        } else {
            console.error(`View com ID "${viewId}" não encontrada.`);
        }
     };
    const switchTab = (event, forceTabId = null) => {
        let tabId;

        if (forceTabId) {
            tabId = forceTabId;
        } else if (event) {
            event.preventDefault();
            tabId = event.currentTarget.dataset.tab;
        } else {
            return;
        }

        if (tabId === 'studioSection') {
            switchView('studioView');
            document.querySelectorAll('.nav-tab, .bottom-nav-item').forEach(button => {
                button.classList.remove('active');
            });
            document.querySelectorAll(`.nav-tab[data-tab="${tabId}"], .bottom-nav-item[data-tab="${tabId}"]`).forEach(button => {
                button.classList.add('active');
            });
            return;
        }

        if (!document.getElementById('mainView').classList.contains('active')) {
             if (viewHistory.length > 0 || !document.getElementById('mainView').classList.contains('active')) {
                 switchView('mainView');
             }
        }

        document.querySelectorAll('#mainView .content-section').forEach(section => {
            section.classList.remove('active');
        });

        document.querySelectorAll('.nav-tab, .bottom-nav-item').forEach(button => {
            button.classList.remove('active');
        });

        const targetSection = document.getElementById(tabId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        document.querySelectorAll(`.nav-tab[data-tab="${tabId}"], .bottom-nav-item[data-tab="${tabId}"]`).forEach(button => {
            button.classList.add('active');
        });
     };
    const handleBack = () => {
        viewHistory.pop();
        const previousViewId = viewHistory.pop() || 'mainView';
        switchView(previousViewId);
     };
    const renderArtistsGrid = (containerId, artists) => {
        const container = document.getElementById(containerId);
        if (!container) { console.error(`Container de grid "${containerId}" não encontrado.`); return; }
        if (!artists || artists.length === 0) { container.innerHTML = '<p class="empty-state">Nenhum artista encontrado.</p>'; return; }
        container.innerHTML = artists.map(artist => `
            <div class="artist-card" data-artist-name="${artist.name}">
                <img src="${artist.img || artist.imageUrl || 'https://i.imgur.com/AD3MbBi.png'}" alt="${artist.name}" class="artist-card-img">
                <p class="artist-card-name">${artist.name}</p>
                <span class="artist-card-type">Artista</span>
            </div>
        `).join('');
     };
    function formatArtistString(artistIds, collabType) {
        if (!artistIds || artistIds.length === 0) return "Artista Desconhecido";
        const artistNames = artistIds.map(id => {
            const artist = db.artists.find(a => a.id === id);
            return artist ? artist.name : "Artista Desc.";
        });
        const mainArtist = artistNames[0];
        if (artistNames.length === 1) return mainArtist;
        const otherArtists = artistNames.slice(1).join(', ');
        if (collabType === 'Dueto/Grupo') { return `${mainArtist} & ${otherArtists}`; }
        else { return mainArtist; } // Se for feat, já está no nome da música
     }
    function getCoverUrl(albumId) {
        if (!albumId) return 'https://i.imgur.com/AD3MbBi.png';
        const release = [...db.albums, ...db.singles].find(a => a.id === albumId);
        return (release ? release.imageUrl : 'https://i.imgur.com/AD3MbBi.png');
     }
    
    // ATUALIZADO: Adiciona lógica de indicadores de chart
    const renderChart = (type) => {
        let containerId, dataList, previousData;
        if (type === 'music') {
            containerId = 'musicChartsList';
            dataList = [...db.songs].sort((a, b) => (b.streams || 0) - (a.streams || 0)).slice(0, 50);
            previousData = previousMusicChartData; // Pega dados da semana passada
        } else {
            containerId = 'albumChartsList';
            dataList = [...db.albums].sort((a, b) => (b.metascore || 0) - (a.metascore || 0)).slice(0, 50);
            previousData = previousAlbumChartData; // Pega dados da semana passada
        }
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!dataList || dataList.length === 0) { container.innerHTML = `<p class="empty-state">Nenhum item no chart.</p>`; return; }
        
        container.innerHTML = dataList.map((item, index) => {
            // --- LÓGICA DE TREND ---
            const currentRank = index + 1;
            const previousRank = previousData[item.id]; // Pega o rank anterior
            
            let iconClass = 'fa-minus';
            let trendClass = 'trend-stable';
            
            if (previousRank === undefined) {
                trendClass = 'trend-new'; // É novo no chart
            } else if (currentRank < previousRank) {
                iconClass = 'fa-caret-up';
                trendClass = 'trend-up';
            } else if (currentRank > previousRank) {
                iconClass = 'fa-caret-down';
                trendClass = 'trend-down';
            }
            // Se for igual, já está 'fa-minus' e 'trend-stable'
            
            const indicatorHtml = `<span class="chart-rank-indicator ${trendClass}"><i class="fas ${iconClass}"></i></span>`;
            // --- FIM LÓGICA ---

            if (type === 'music') {
                const artistName = formatArtistString(item.artistIds, item.collabType);
                return `
                    <div class="chart-item" data-song-id="${item.id}">
                        ${indicatorHtml}
                        <span class="chart-rank">${currentRank}</span>
                        <img src="${item.cover || getCoverUrl(item.albumId)}" alt="${item.title}" class="chart-item-img">
                        <div class="chart-item-info"> <span class="chart-item-title">${item.title}</span> <span class="chart-item-artist">${artistName}</span> </div>
                        <span class="chart-item-duration">${(item.streams || 0).toLocaleString('pt-BR')}</span>
                    </div>`;
            } else {
                return `
                    <div class="chart-item" data-album-id="${item.id}">
                        ${indicatorHtml}
                        <span class="chart-rank">${currentRank}</span>
                        <img src="${item.imageUrl}" alt="${item.title}" class="chart-item-img">
                        <div class="chart-item-info"> <span class="chart-item-title">${item.title}</span> <span class="chart-item-artist">${item.artist}</span> </div>
                        <span class="chart-item-score">${item.metascore}</span>
                    </div>`;
            }
        }).join('');
     };
    const openArtistDetail = (artistName) => {
        const artist = db.artists.find(a => a.name === artistName);
        if (!artist) { console.error(`Artista "${artistName}" não encontrado.`); handleBack(); return; }
        activeArtist = artist;
        document.getElementById('detailBg').style.backgroundImage = `url(${artist.img})`;
        document.getElementById('detailName').textContent = artist.name;
        const popularSongs = [...db.songs].filter(s => s.artistIds && s.artistIds.includes(artist.id)).sort((a, b) => (b.streams || 0) - (a.streams || 0)).slice(0, 5);
        const popularContainer = document.getElementById('popularSongsList');
        if (popularSongs.length > 0) {
            popularContainer.innerHTML = popularSongs.map((song, index) => `
                <div class="song-row" data-song-id="${song.id}">
                    <span>${index + 1}</span>
                    <div class="song-row-info"> <img src="${song.cover || getCoverUrl(song.albumId)}" alt="${song.title}" class="song-row-cover"> <span class="song-row-title">${song.title}</span> </div>
                    <span class="song-streams">${(song.streams || 0).toLocaleString('pt-BR')}</span>
                </div>`).join('');
        } else { popularContainer.innerHTML = '<p class="empty-state-small">Nenhuma música popular.</p>'; }
        const albumsContainer = document.getElementById('albumsList');
        const sortedAlbums = (artist.albums || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        albumsContainer.innerHTML = sortedAlbums.map(album => `<div class="scroll-item" data-album-id="${album.id}"> <img src="${album.imageUrl}" alt="${album.title}"> <p>${album.title}</p> <span>${new Date(album.releaseDate).getFullYear()}</span> </div>`).join('') || '<p class="empty-state-small">Nenhum álbum.</p>';
        const singlesContainer = document.getElementById('singlesList');
        const sortedSingles = (artist.singles || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        singlesContainer.innerHTML = sortedSingles.map(single => `<div class="scroll-item" data-album-id="${single.id}"> <img src="${single.imageUrl}" alt="${single.title}"> <p>${single.title}</p> <span>${new Date(single.releaseDate).getFullYear()}</span> </div>`).join('') || '<p class="empty-state-small">Nenhum single.</p>';
        const recommended = [...db.artists].filter(a => a.id !== artist.id).sort(() => 0.5 - Math.random()).slice(0, 5);
        renderArtistsGrid('recommendedGrid', recommended);
        switchView('artistDetail');
     };
    const openAlbumDetail = (albumId) => {
        const album = [...db.albums, ...db.singles].find(a => a.id === albumId);
        if (!album) { console.error(`Álbum/Single ID "${albumId}" não encontrado.`); return; }
        document.getElementById('albumDetailBg').style.backgroundImage = `url(${album.imageUrl})`;
        document.getElementById('albumDetailCover').src = album.imageUrl;
        document.getElementById('albumDetailTitle').textContent = album.title;
        const releaseDate = new Date(album.releaseDate).getFullYear();
        const artistObj = db.artists.find(a => a.id === album.artistId);
        document.getElementById('albumDetailInfo').innerHTML = `Por <strong class="artist-link" data-artist-name="${artistObj ? artistObj.name : ''}">${album.artist}</strong> • ${releaseDate}`;
        const tracklistContainer = document.getElementById('albumTracklist');
        tracklistContainer.innerHTML = (album.tracks || []).map(song => {
            const artistName = formatArtistString(song.artistIds, song.collabType);
            return `
                <div class="track-row" data-song-id="${song.id}">
                    <span class="track-number">${song.trackNumber}</span>
                    <div class="track-info"> <span class="track-title">${song.title}</span> <span class="track-artist-feat">${artistName}</span> </div>
                    <span class="track-duration">${(song.streams || 0).toLocaleString('pt-BR')}</span>
                </div>`;
        }).join('');
        switchView('albumDetail');
     };
    const openDiscographyDetail = (type) => {
        if (!activeArtist) { console.error("Nenhum artista ativo para mostrar discografia."); handleBack(); return; }
        const data = (type === 'albums') ? (activeArtist.albums || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)) : (activeArtist.singles || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        const title = (type === 'albums') ? `Álbuns de ${activeArtist.name}` : `Singles & EPs de ${activeArtist.name}`;
        document.getElementById('discographyTypeTitle').textContent = title;
        const grid = document.getElementById('discographyGrid');
        grid.innerHTML = data.map(item => `<div class="scroll-item" data-album-id="${item.id}"> <img src="${item.imageUrl}" alt="${item.title}"> <p>${item.title}</p> <span>${new Date(item.releaseDate).getFullYear()}</span> </div>`).join('') || '<p class="empty-state">Nenhum lançamento encontrado.</p>';
        switchView('discographyDetail');
     };
    const handleSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) { switchTab(null, 'homeSection'); return; }
        const resultsContainer = document.getElementById('searchResults');
        const noResultsEl = document.getElementById('noResults');
        const filteredArtists = db.artists.filter(a => a.name.toLowerCase().includes(query));
        const filteredAlbums = [...db.albums, ...db.singles].filter(a => a.title.toLowerCase().includes(query));
        let html = ''; let count = 0;
        if (filteredArtists.length > 0) {
            html += '<h3 class="section-title">Artistas</h3>';
            html += filteredArtists.map(artist => { count++; return `<div class="artist-card" data-artist-name="${artist.name}"> <img src="${artist.img}" alt="${artist.name}" class="artist-card-img"> <p class="artist-card-name">${artist.name}</p> <span class="artist-card-type">Artista</span> </div>`; }).join('');
        }
        if (filteredAlbums.length > 0) {
            html += '<h3 class="section-title">Álbuns & Singles</h3>';
            html += filteredAlbums.map(album => { count++; return `<div class="artist-card" data-album-id="${album.id}"> <img src="${album.imageUrl}" alt="${album.title}" class="artist-card-img"> <p class="artist-card-name">${album.title}</p> <span class="artist-card-type">${album.artist}</span> </div>`; }).join('');
        }
        resultsContainer.innerHTML = html;
        if (count > 0) { noResultsEl.classList.add('hidden'); resultsContainer.classList.remove('hidden'); }
        else { noResultsEl.classList.remove('hidden'); resultsContainer.classList.add('hidden'); }
        switchTab(null, 'searchSection');
     };
    const setupCountdown = (timerId, callback) => {
        const timerElement = document.getElementById(timerId); if (!timerElement) return;
        const calculateTargetDate = () => { const now = new Date(); const target = new Date(now); let daysToMonday = (1 + 7 - now.getDay()) % 7; if (daysToMonday === 0 && now.getHours() >= 0) { daysToMonday = 7; } target.setDate(now.getDate() + daysToMonday); target.setHours(0, 0, 0, 0); return target; };
        let targetDate = calculateTargetDate();
        const updateTimer = () => { const now = new Date().getTime(); const distance = targetDate.getTime() - now; if (distance < 0) { targetDate = calculateTargetDate(); if (callback) callback(); return; } const days = Math.floor(distance / (1000 * 60 * 60 * 24)); const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)); const seconds = Math.floor((distance % (1000 * 60)) / 1000); const f = (n) => (n < 10 ? '0' + n : n); timerElement.textContent = `${f(days)}d ${f(hours)}h ${f(minutes)}m ${f(seconds)}s`; };
        updateTimer(); setInterval(updateTimer, 1000);
     };

    // --- 3. SISTEMA DE RPG --- 
    const CHART_TOP_N = 20; const STREAMS_PER_POINT = 10000;
    const calculateSimulatedStreams = (points, lastActiveISO) => {
        if (!lastActiveISO) return 0; const now = new Date(); const lastActive = new Date(lastActiveISO); const diffHours = Math.abs(now - lastActive) / 3600000; const streamsPerDay = (points || 0) * STREAMS_PER_POINT; const streamsPerHour = streamsPerDay / 24; return Math.floor(streamsPerHour * diffHours);
     };
    const computeChartData = (artistsArray) => {
        return artistsArray.map(artist => { const simulatedStreams = calculateSimulatedStreams(artist.RPGPoints, artist.LastActive); return { id: artist.id, name: artist.name, img: artist.img, streams: simulatedStreams, points: artist.RPGPoints || 0 }; }).sort((a, b) => b.streams - a.streams).slice(0, CHART_TOP_N);
     };
    
    // ATUALIZADO: Adiciona lógica de indicadores de chart
    function renderRPGChart() { 
        const chartData = computeChartData(db.artists); 
        const container = document.getElementById('artistsGrid'); 
        const previousData = previousRpgChartData; // Pega dados da semana passada

        if (!container) { console.error("Container 'artistsGrid' não encontrado."); return; } 
        if (chartData.length === 0) { container.innerHTML = '<p class="empty-state">Nenhum artista no chart de RPG.</p>'; return; } 
        
        container.innerHTML = chartData.map((artist, index) => {
            // --- LÓGICA DE TREND ---
            const currentRank = index + 1;
            const previousRank = previousData[artist.id]; // Pega o rank anterior
            
            let iconClass = 'fa-minus';
            let trendClass = 'trend-stable';
            
            if (previousRank === undefined) {
                trendClass = 'trend-new';
            } else if (currentRank < previousRank) {
                iconClass = 'fa-caret-up';
                trendClass = 'trend-up';
            } else if (currentRank > previousRank) {
                iconClass = 'fa-caret-down';
                trendClass = 'trend-down';
            }
            
            const indicatorHtml = `<span class="chart-rank-indicator rpg-indicator ${trendClass}"><i class="fas ${iconClass}"></i></span>`;
            // --- FIM LÓGICA ---

            return `<div class="artist-card" data-artist-name="${artist.name}">
                        <span class="rpg-rank">#${currentRank}</span>
                        ${indicatorHtml}
                        <img src="${artist.img}" alt="${artist.name}" class="artist-card-img">
                        <p class="artist-card-name">${artist.name}</p>
                        <span class="artist-card-type">${(artist.streams || 0).toLocaleString('pt-BR')} streams</span>
                    </div>`;
        }).join('');
    }

    // --- 4. SISTEMA DO ESTÚDIO ---

    function populateArtistSelector(playerId) {
        const player = db.players.find(p => p.id === playerId); if (!player) return; const artistIds = player.artists || []; const artistOptions = artistIds.map(id => { const artist = db.artists.find(a => a.id === id); return artist ? `<option value="${artist.id}">${artist.name}</option>` : ''; }).join(''); singleArtistSelect.innerHTML = `<option value="">Selecione...</option>${artistOptions}`; albumArtistSelect.innerHTML = `<option value="">Selecione...</option>${artistOptions}`;
     }
    function loginPlayer(playerId) {
        if (!playerId) { alert("Selecione um jogador."); return; } currentPlayer = db.players.find(p => p.id === playerId); if (currentPlayer) { document.getElementById('playerName').textContent = currentPlayer.name; loginPrompt.classList.add('hidden'); loggedInInfo.classList.remove('hidden'); studioLaunchWrapper.classList.remove('hidden'); populateArtistSelector(currentPlayer.id); }
     }
    function logoutPlayer() {
        currentPlayer = null; document.getElementById('playerName').textContent = ''; loginPrompt.classList.remove('hidden'); loggedInInfo.classList.add('hidden'); studioLaunchWrapper.classList.add('hidden');
     }

    // ATUALIZADO: Renomeado e adaptado para pegar o artista principal correto
    function populateArtistSelectForFeat(targetSelectElement) {
        let currentMainArtistId = null;
        let selectElement = targetSelectElement; // O elemento select a ser populado

        if (document.getElementById('newSingleForm').classList.contains('active')) {
             // Se for o formulário de single, usa o modal original
             currentMainArtistId = singleArtistSelect.value;
             selectElement = featArtistSelect; // Popula o select do modal original
        } else if (document.getElementById('newAlbumForm').classList.contains('active')) {
             // Se for o formulário de álbum (ou o modal de faixa do álbum), usa o inline
             currentMainArtistId = albumArtistSelect.value;
             selectElement = inlineFeatArtistSelect; // Popula o select inline
        } else {
             console.warn("Não foi possível determinar o artista principal para filtrar o select de feats.");
             // Pode ser que esteja fora dos formulários principais, usa o select padrão do featModal
             selectElement = featArtistSelect;
        }

        if (!selectElement) {
             console.error("Elemento Select para feats não encontrado!");
             return; // Sai se o elemento select não for encontrado
        }

        selectElement.innerHTML = db.artists
            .filter(a => a.id !== currentMainArtistId)
            .sort((a,b) => a.name.localeCompare(b.name))
            .map(a => `<option value="${a.id}">${a.name}</option>`)
            .join('');

        // Adiciona uma opção padrão se vazio
        if (selectElement.innerHTML === '') {
            selectElement.innerHTML = '<option value="">Nenhum outro artista disponível</option>';
        }
    }


    // ATUALIZADO: Abre o modal de Feat (AGORA SÓ PARA SINGLE)
    function openFeatModal(buttonElement) {
        const targetId = buttonElement.dataset.target; // Ex: 'singleFeatList'
        currentFeatTarget = document.getElementById(targetId);

        if (!currentFeatTarget) {
            console.error("Não foi possível encontrar o alvo do feat (openFeatModal). Target ID:", targetId);
            return;
        }
        // Popula o select DENTRO do featModal original
        populateArtistSelectForFeat(featArtistSelect);
        featModal.classList.remove('hidden');
    }

    // Fecha o modal de Feat (original)
    function closeFeatModal() {
        featModal.classList.add('hidden');
        currentFeatTarget = null;
    }

    // Confirma Feat do modal original (para Single)
    function confirmFeat() {
        const artistId = featArtistSelect.value;
        const artistName = featArtistSelect.options[featArtistSelect.selectedIndex].text;
        const featType = featTypeSelect.value;

        if (!artistId || !currentFeatTarget) {
             console.error("Tentativa de confirmar feat (modal) sem artista ou alvo.");
             return;
        }

        const featTag = document.createElement('span');
        featTag.className = 'feat-tag';
        featTag.textContent = `${featType} ${artistName}`;
        featTag.dataset.artistId = artistId;
        featTag.dataset.featType = featType;
        featTag.dataset.artistName = artistName;
        featTag.addEventListener('click', () => featTag.remove());

        currentFeatTarget.appendChild(featTag); // Adiciona à lista do Single

        closeFeatModal();
    }

    // --- Funções do Adicionador Inline de Feat ---

    // NOVO: Mostra/Esconde o adicionador inline no modal de faixa do álbum
    function toggleInlineFeatAdder() {
        if (!inlineFeatAdder) return;

        const isHidden = inlineFeatAdder.classList.contains('hidden');
        if (isHidden) {
            // Vai mostrar: Popula o select antes
            populateArtistSelectForFeat(inlineFeatArtistSelect);
            inlineFeatAdder.classList.remove('hidden');
            if(addInlineFeatBtn) addInlineFeatBtn.textContent = 'Cancelar Feat'; // Muda texto do botão
        } else {
            // Vai esconder
            inlineFeatAdder.classList.add('hidden');
             if(addInlineFeatBtn) addInlineFeatBtn.textContent = 'Adicionar Feat'; // Restaura texto
        }
    }

    // NOVO: Confirma o feat adicionado inline
    function confirmInlineFeat() {
        const artistId = inlineFeatArtistSelect.value;
        const artistName = inlineFeatArtistSelect.options[inlineFeatArtistSelect.selectedIndex].text;
        const featType = inlineFeatTypeSelect.value;

        if (!artistId || !albumTrackFeatList) {
             console.error("Tentativa de confirmar feat inline sem artista ou lista alvo.");
             return;
        }

        const featTag = document.createElement('span');
        featTag.className = 'feat-tag';
        featTag.textContent = `${featType} ${artistName}`;
        featTag.dataset.artistId = artistId;
        featTag.dataset.featType = featType;
        featTag.dataset.artistName = artistName;
        featTag.addEventListener('click', () => featTag.remove());

        albumTrackFeatList.appendChild(featTag); // Adiciona na lista DENTRO do modal de faixa

        // Esconde o adicionador após confirmar
        inlineFeatAdder.classList.add('hidden');
        if(addInlineFeatBtn) addInlineFeatBtn.textContent = 'Adicionar Feat'; // Restaura texto
    }

    // NOVO: Cancela o adicionador inline
    function cancelInlineFeat() {
        inlineFeatAdder.classList.add('hidden');
         if(addInlineFeatBtn) addInlineFeatBtn.textContent = 'Adicionar Feat'; // Restaura texto
    }


    // --- Funções do Modal de Faixa do Álbum ---

    function openAlbumTrackModal(itemToEdit = null) {
        albumTrackNameInput.value = '';
        albumTrackDurationInput.value = '';
        albumTrackTypeSelect.value = 'Album Track';
        albumTrackFeatList.innerHTML = '';
        editingTrackItemId.value = '';
        editingTrackItem = null;
        inlineFeatAdder.classList.add('hidden'); // Garante que o adder inline comece escondido
        if(addInlineFeatBtn) addInlineFeatBtn.textContent = 'Adicionar Feat'; // Garante texto do botão

        if (itemToEdit) {
            albumTrackModalTitle.textContent = 'Editar Faixa';
            editingTrackItemId.value = itemToEdit.id || itemToEdit.dataset.itemId;
            editingTrackItem = itemToEdit;
            albumTrackNameInput.value = itemToEdit.dataset.trackName || '';
            albumTrackDurationInput.value = itemToEdit.dataset.durationStr || '';
            albumTrackTypeSelect.value = itemToEdit.dataset.trackType || 'Album Track';
            const feats = JSON.parse(itemToEdit.dataset.feats || '[]');
            feats.forEach(feat => {
                const featTag = document.createElement('span');
                featTag.className = 'feat-tag';
                featTag.textContent = `${feat.type} ${feat.name}`;
                featTag.dataset.artistId = feat.id;
                featTag.dataset.featType = feat.type;
                featTag.dataset.artistName = feat.name;
                featTag.addEventListener('click', () => featTag.remove());
                albumTrackFeatList.appendChild(featTag);
            });
        } else {
            albumTrackModalTitle.textContent = 'Adicionar Nova Faixa';
            editingTrackItemId.value = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        }
        albumTrackModal.classList.remove('hidden');
    }

    function closeAlbumTrackModal() {
        albumTrackModal.classList.add('hidden');
        editingTrackItem = null;
        editingTrackItemId.value = '';
        inlineFeatAdder.classList.add('hidden'); // Esconde o adder ao fechar
        if(addInlineFeatBtn) addInlineFeatBtn.textContent = 'Adicionar Feat';
    }

    function saveAlbumTrack() {
        const trackName = albumTrackNameInput.value.trim();
        const durationStr = albumTrackDurationInput.value.trim();
        const trackType = albumTrackTypeSelect.value;
        const durationSec = parseDurationToSeconds(durationStr);
        const currentItemId = editingTrackItemId.value;

        if (!trackName || !durationStr || durationSec === 0) {
            alert("Preencha Nome e Duração válida (MM:SS).");
            return;
        }

        const featTags = albumTrackFeatList.querySelectorAll('.feat-tag');
        const featsData = Array.from(featTags).map(tag => ({
            id: tag.dataset.artistId,
            type: tag.dataset.featType,
            name: tag.dataset.artistName
        }));

        let targetItem = editingTrackItem || albumTracklistEditor.querySelector(`[data-item-id="${currentItemId}"]`);

        if (targetItem) {
            // ATUALIZAR
            targetItem.dataset.trackName = trackName;
            targetItem.dataset.durationStr = durationStr;
            targetItem.dataset.trackType = trackType;
            targetItem.dataset.feats = JSON.stringify(featsData);

            targetItem.querySelector('.track-title-display').textContent = trackName;
            targetItem.querySelector('.track-details-display .duration').textContent = `Duração: ${durationStr}`;
            targetItem.querySelector('.track-details-display .type').textContent = `Tipo: ${trackType}`;
            const featDisplay = targetItem.querySelector('.feat-list-display');
            if(featDisplay) {
                 featDisplay.innerHTML = featsData.map(f => `<span class="feat-tag-display">${f.type} ${f.name}</span>`).join('');
            }
        } else {
            // ADICIONAR NOVO
            const newItem = document.createElement('div');
            newItem.className = 'track-list-item-display';
            newItem.dataset.itemId = currentItemId;
            newItem.dataset.trackName = trackName;
            newItem.dataset.durationStr = durationStr;
            newItem.dataset.trackType = trackType;
            newItem.dataset.feats = JSON.stringify(featsData);

            newItem.innerHTML = `
                <span class="track-number-display"></span> <i class="fas fa-bars drag-handle"></i>
                <div class="track-info-display">
                    <span class="track-title-display">${trackName}</span>
                    <div class="track-details-display">
                        <span class="duration">Duração: ${durationStr}</span>
                        <span class="type">Tipo: ${trackType}</span>
                    </div>
                    <div class="feat-list feat-list-display" style="margin-top: 5px;">
                       ${featsData.map(f => `<span class="feat-tag-display">${f.type} ${f.name}</span>`).join('')}
                    </div>
                </div>
                <div class="track-actions">
                    <button type="button" class="small-btn edit-track-btn"><i class="fas fa-pencil-alt"></i></button>
                    <button type="button" class="small-btn remove-track-btn"><i class="fas fa-times"></i></button>
                </div>
            `;
            // Remove a mensagem de "nenhuma faixa" antes de adicionar a primeira
            const emptyState = albumTracklistEditor.querySelector('.empty-state-small');
            if (emptyState) emptyState.remove();

            albumTracklistEditor.appendChild(newItem);
        }

        updateTrackNumbers();
        closeAlbumTrackModal();
    }


    function updateTrackNumbers() {
        const tracks = albumTracklistEditor.querySelectorAll('.track-list-item-display');

        if (tracks.length === 0 && !albumTracklistEditor.querySelector('.empty-state-small')) {
             albumTracklistEditor.innerHTML = '<p class="empty-state-small">Nenhuma faixa adicionada ainda.</p>';
        } else if (tracks.length > 0) {
             const emptyState = albumTracklistEditor.querySelector('.empty-state-small');
             if (emptyState) { emptyState.remove(); }
        }

        tracks.forEach((track, index) => {
            let numSpan = track.querySelector('.track-number-display');
            if(!numSpan) { // Adiciona se não existir
                numSpan = document.createElement('span');
                numSpan.className = 'track-number-display';
                 track.insertBefore(numSpan, track.querySelector('.drag-handle')); // Antes do drag handle
            }
             numSpan.textContent = `${index + 1}.`;
             // Aplica estilos consistentemente
             numSpan.style.fontWeight = '700';
             numSpan.style.color = 'var(--text-secondary)';
             numSpan.style.width = '25px';
             numSpan.style.textAlign = 'right';
             numSpan.style.marginRight = '5px'; // Espaço antes do drag handle
        });
    }


    // --- Funções de Inicialização e Submissão ---

    function initializeStudio() {
        if (!playerSelect) return;
        playerSelect.innerHTML = '<option value="">Selecione...</option>' +
            db.players.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        loginButton.addEventListener('click', () => loginPlayer(playerSelect.value));
        logoutButton.addEventListener('click', logoutPlayer);

        studioTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                studioTabs.forEach(t => t.classList.remove('active'));
                studioForms.forEach(f => f.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const formId = e.currentTarget.dataset.form;
                document.getElementById(formId === 'single' ? 'newSingleForm' : 'newAlbumForm').classList.add('active');
            });
        });

        // Listener para o modal de Feat ORIGINAL (usado pelo Single)
        if(confirmFeatBtn) confirmFeatBtn.addEventListener('click', confirmFeat);
        if(cancelFeatBtn) cancelFeatBtn.addEventListener('click', closeFeatModal);

        // Listener DELEGADO para botões "Adicionar Feat" do formulário de SINGLE
        if (newSingleForm) {
            newSingleForm.addEventListener('click', (e) => {
                const addFeatButton = e.target.closest('.add-feat-btn[data-target="singleFeatList"]');
                if (addFeatButton) {
                    openFeatModal(addFeatButton); // Abre o modal original
                }
            });
        }


        // Listener para o botão "Adicionar Faixa" (abre o modal de faixa do álbum)
        if (openAddTrackModalBtn) {
            openAddTrackModalBtn.addEventListener('click', () => openAlbumTrackModal());
        }

        // Listeners do modal de faixa do álbum
        if (saveAlbumTrackBtn) saveAlbumTrackBtn.addEventListener('click', saveAlbumTrack);
        if (cancelAlbumTrackBtn) cancelAlbumTrackBtn.addEventListener('click', closeAlbumTrackModal);

        // Listener para o botão "Adicionar Feat" DENTRO do modal de faixa do álbum (mostra/esconde o inline)
        if (addInlineFeatBtn) {
            addInlineFeatBtn.addEventListener('click', toggleInlineFeatAdder);
        }
        // Listeners para os botões do ADICIONADOR INLINE
        if (confirmInlineFeatBtn) confirmInlineFeatBtn.addEventListener('click', confirmInlineFeat);
        if (cancelInlineFeatBtn) cancelInlineFeatBtn.addEventListener('click', cancelInlineFeat);


        // Listener DELEGADO para botões Editar/Remover na lista de faixas do álbum
        if (albumTracklistEditor) {
            albumTracklistEditor.addEventListener('click', (e) => {
                const editButton = e.target.closest('.edit-track-btn');
                const removeButton = e.target.closest('.remove-track-btn');

                if (editButton) {
                    const item = editButton.closest('.track-list-item-display');
                    if (item) { openAlbumTrackModal(item); }
                } else if (removeButton) {
                    const item = removeButton.closest('.track-list-item-display');
                    if (item) { item.remove(); updateTrackNumbers(); }
                }
            });
        }


        initAlbumForm(); // Inicializa o Sortable e limpa a lista
    }

    async function createAirtableRecord(tableName, fields) {
         const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`; try { const response = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: fields }) }); if (!response.ok) { const errorData = await response.json(); console.error(`Erro ao criar registro em ${tableName}:`, JSON.stringify(errorData, null, 2)); throw new Error(`Airtable error: ${response.status}`); } return await response.json(); } catch (error) { console.error("Falha na requisição para createAirtableRecord:", error); return null; }
     }
    function parseDurationToSeconds(durationStr) {
         if (!durationStr) return 0; const parts = durationStr.split(':'); if (parts.length !== 2) return 0; const minutes = parseInt(parts[0], 10); const seconds = parseInt(parts[1], 10); if (isNaN(minutes) || isNaN(seconds) || seconds < 0 || seconds > 59 || minutes < 0) { return 0; } return (minutes * 60) + seconds;
     }
    async function handleSingleSubmit(event) {
         event.preventDefault(); const submitBtn = document.getElementById('submitNewSingle'); const artistId = singleArtistSelect.value; const singleTitle = document.getElementById('singleTitle').value; const coverUrl = document.getElementById('singleCoverUrl').value; const releaseDate = singleReleaseDateInput.value; const trackName = document.getElementById('trackName').value; const trackDurationStr = document.getElementById('trackDuration').value; if (!artistId || !singleTitle || !coverUrl || !releaseDate || !trackName || !trackDurationStr || parseDurationToSeconds(trackDurationStr) === 0) { alert("Preencha todos os campos do single, incluindo duração válida (MM:SS)."); return; } submitBtn.disabled = true; submitBtn.textContent = 'Aguardando...'; trackTypeModal.classList.remove('hidden');
     }
    async function processSingleSubmission(trackType) {
         const submitBtn = document.getElementById('submitNewSingle'); trackTypeModal.classList.add('hidden'); submitBtn.textContent = 'Enviando...'; try { const artistId = singleArtistSelect.value; const singleTitle = document.getElementById('singleTitle').value; const coverUrl = document.getElementById('singleCoverUrl').value; const releaseDate = singleReleaseDateInput.value; const trackName = document.getElementById('trackName').value; const trackDurationStr = document.getElementById('trackDuration').value; const trackDurationSec = parseDurationToSeconds(trackDurationStr); const singleRecordResponse = await createAirtableRecord('Singles e EPs', { "Nome do Single/EP": singleTitle, "Artista": [artistId], "Capa": [{ "url": coverUrl }], "Data de Lançamento": releaseDate }); if (!singleRecordResponse || !singleRecordResponse.id) { throw new Error("Falha ao criar o registro do Single/EP."); } const singleRecordId = singleRecordResponse.id; const featTags = document.querySelectorAll('#singleFeatList .feat-tag'); let finalTrackName = trackName; let finalArtistIds = [artistId]; let collabType = null; if (featTags.length > 0) { const featArtistIds = []; const featArtistNames = []; collabType = featTags[0].dataset.featType; featTags.forEach(tag => { featArtistIds.push(tag.dataset.artistId); featArtistNames.push(tag.dataset.artistName); }); if (collabType === "Feat.") { finalTrackName = `${trackName} (feat. ${featArtistNames.join(', ')})`; finalArtistIds = [artistId]; } else if (collabType === "Dueto/Grupo") { finalTrackName = trackName; finalArtistIds = [artistId, ...featArtistIds]; } } const musicRecordFields = { "Nome da Faixa": finalTrackName, "Artista": finalArtistIds, "Duração": trackDurationSec, "Nº da Faixa": 1, "Singles e EPs": [singleRecordId], "Tipo de Faixa": trackType }; if (collabType) { musicRecordFields["Tipo de Colaboração"] = collabType; } console.log('--- DEBUG: Enviando para Músicas (Single) ---', musicRecordFields); const musicRecordResponse = await createAirtableRecord('Músicas', musicRecordFields); if (!musicRecordResponse || !musicRecordResponse.id) { console.error("Single/EP criado, mas falha ao criar a música vinculada."); throw new Error("Falha ao criar o registro da música."); } alert("Single lançado com sucesso!"); newSingleForm.reset(); singleReleaseDateInput.value = new Date().toISOString().split('T')[0]; document.getElementById('singleFeatList').innerHTML = ''; await refreshAllData(); } catch (error) { alert("Erro ao lançar o single. Verifique o console."); console.error("Erro em processSingleSubmission:", error); } finally { submitBtn.disabled = false; submitBtn.textContent = 'Lançar Single'; }
     }
    function initAlbumForm() {
         albumTracklistEditor.innerHTML = ''; updateTrackNumbers(); if (albumTracklistEditor && typeof Sortable !== 'undefined') { if(albumTracklistSortable) { albumTracklistSortable.destroy(); } albumTracklistSortable = Sortable.create(albumTracklistEditor, { animation: 150, handle: '.drag-handle', onEnd: updateTrackNumbers }); } else if (typeof Sortable === 'undefined') { console.warn("SortableJS não carregado."); }
     }
    
    async function batchCreateAirtableRecords(tableName, records) {
         const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`; const chunks = []; for (let i = 0; i < records.length; i += 10) { chunks.push(records.slice(i, i + 10)); } const results = []; for (const chunk of chunks) { console.log(`Enviando lote para ${tableName}:`, chunk); try { const response = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ "records": chunk.map(fields => ({ fields })) }) }); if (!response.ok) { const errorData = await response.json(); console.error(`Erro ao criar lote em ${tableName}:`, JSON.stringify(errorData, null, 2)); throw new Error(`Airtable batch error: ${response.status}`); } const data = await response.json(); results.push(...data.records); } catch (error) { console.error("Falha na requisição para batchCreateAirtableRecords:", error); return null; } } return results;
     }
    async function handleAlbumSubmit(event) {
         event.preventDefault(); const submitBtn = document.getElementById('submitNewAlbum'); submitBtn.disabled = true; submitBtn.textContent = 'Enviando...'; try { const artistId = albumArtistSelect.value; const albumTitle = document.getElementById('albumTitle').value; const coverUrl = document.getElementById('albumCoverUrl').value; const releaseDate = albumReleaseDateInput.value; if (!artistId || !albumTitle || !coverUrl || !releaseDate) { alert("Preencha Artista, Título, URL da Capa e Data."); throw new Error("Campos obrigatórios do álbum faltando."); } const trackItems = albumTracklistEditor.querySelectorAll('.track-list-item-display'); if (trackItems.length === 0) { alert("O álbum/EP precisa ter pelo menos uma faixa."); throw new Error("Nenhuma faixa adicionada."); } let totalDurationSec = 0; const musicRecordsToCreate = []; for (let index = 0; index < trackItems.length; index++) { const item = trackItems[index]; const trackName = item.dataset.trackName; const durationStr = item.dataset.durationStr; const trackType = item.dataset.trackType; const featsData = JSON.parse(item.dataset.feats || '[]'); const durationSec = parseDurationToSeconds(durationStr); if (!trackName || !durationStr || durationSec === 0) { alert(`Dados inválidos na Faixa ${index + 1}. Edite-a.`); throw new Error(`Dados inválidos na faixa ${index + 1}.`); } totalDurationSec += durationSec; let finalTrackName = trackName; let finalArtistIds = [artistId]; let collabType = null; if (featsData.length > 0) { collabType = featsData[0].type; const featArtistIds = featsData.map(f => f.id); const featArtistNames = featsData.map(f => f.name); if (collabType === "Feat.") { finalTrackName = `${trackName} (feat. ${featArtistNames.join(', ')})`; finalArtistIds = [artistId]; } else if (collabType === "Dueto/Grupo") { finalTrackName = trackName; finalArtistIds = [artistId, ...featArtistIds]; } } const musicRecord = { "Nome da Faixa": finalTrackName, "Artista": finalArtistIds, "Duração": durationSec, "Nº da Faixa": index + 1, "Tipo de Faixa": trackType }; if (collabType) { musicRecord["Tipo de Colaboração"] = collabType; } musicRecordsToCreate.push(musicRecord); } const isAlbum = totalDurationSec >= (30 * 60); const tableName = isAlbum ? 'Álbuns' : 'Singles e EPs'; const nameField = isAlbum ? 'Nome do Álbum' : 'Nome do Single/EP'; const coverField = isAlbum ? 'Capa do Álbum' : 'Capa'; const releaseRecordResponse = await createAirtableRecord(tableName, { [nameField]: albumTitle, "Artista": [artistId], [coverField]: [{ "url": coverUrl }], "Data de Lançamento": releaseDate }); if (!releaseRecordResponse || !releaseRecordResponse.id) { throw new Error("Falha ao criar o registro do álbum/EP."); } const releaseRecordId = releaseRecordResponse.id; const albumLinkFieldNameInMusicas = 'Álbuns'; const singleLinkFieldNameInMusicas = 'Singles e EPs'; const correctLinkField = isAlbum ? albumLinkFieldNameInMusicas : singleLinkFieldNameInMusicas; musicRecordsToCreate.forEach(record => { record[correctLinkField] = [releaseRecordId]; }); const createdSongs = await batchCreateAirtableRecords('Músicas', musicRecordsToCreate); if (!createdSongs || createdSongs.length !== musicRecordsToCreate.length) { console.error("Álbum/EP criado, mas falha ao criar as músicas vinculadas."); throw new Error("Falha ao criar as faixas no Airtable."); } alert("Álbum/EP lançado com sucesso!"); newAlbumForm.reset(); albumReleaseDateInput.value = new Date().toISOString().split('T')[0]; initAlbumForm(); await refreshAllData(); } catch (error) { alert("Erro ao lançar o álbum/EP. Verifique o console."); console.error("Erro em handleAlbumSubmit:", error); } finally { submitBtn.disabled = false; submitBtn.textContent = 'Lançar Álbum / EP'; }
     }


    // --- 5. INICIALIZAÇÃO GERAL ---

    function initializeBodyClickListener() {
        document.body.addEventListener('click', (e) => { const artistCard = e.target.closest('.artist-card[data-artist-name]'); const albumCard = e.target.closest('[data-album-id]'); const songCard = e.target.closest('.song-row[data-song-id], .track-row[data-song-id], .chart-item[data-song-id]'); const artistLink = e.target.closest('.artist-link[data-artist-name]'); const discogLink = e.target.closest('.see-all-btn[data-type]'); if (discogLink) { openDiscographyDetail(discogLink.dataset.type); return; } if (albumCard) { openAlbumDetail(albumCard.dataset.albumId); return; } if (artistCard) { openArtistDetail(artistCard.dataset.artistName); return; } if (artistLink) { openArtistDetail(artistLink.dataset.artistName); return; } if (songCard) { console.log("Clicou na música ID:", songCard.dataset.songId); } }); searchInput.addEventListener('input', handleSearch); searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { handleSearch(); } });
     }

    async function main() {
        console.log("Iniciando Aplicação...");
        if (!initializeDOMElements()) return;

        document.body.classList.add('loading');
        const data = await loadAllData();

        if (data && data.allArtists) {
            // Inicializa o DB e carrega os charts da semana passada
            if (!initializeData(data)) return; 

            try {
                initializeStudio(); // Configura listeners, incluindo os dos novos modais e inline

                if (newSingleForm) newSingleForm.addEventListener('submit', handleSingleSubmit);
                if (newAlbumForm) newAlbumForm.addEventListener('submit', handleAlbumSubmit);

                // Listeners Modal Tipo Faixa (Single)
                if (confirmTrackTypeBtn) { confirmTrackTypeBtn.addEventListener('click', () => { processSingleSubmission(trackTypeSelect.value); }); }
                if (cancelTrackTypeBtn) { cancelTrackTypeBtn.addEventListener('click', () => { trackTypeModal.classList.add('hidden'); const btn = document.getElementById('submitNewSingle'); btn.disabled = false; btn.textContent = 'Lançar Single'; }); }

                // Renderiza os charts comparando com os dados carregados
                renderRPGChart(); 
                renderChart('music'); 
                renderChart('album');

                const allNavs = [...document.querySelectorAll('.nav-tab'), ...document.querySelectorAll('.bottom-nav-item')];
                allNavs.forEach(nav => { nav.removeEventListener('click', switchTab); nav.addEventListener('click', switchTab); });
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));
                
                // ATUALIZADO: Callbacks corretos para salvar e re-renderizar
                setupCountdown('musicCountdownTimer', () => {
                    console.log("Timer 'music' disparou. Salvando charts de Música e RPG...");
                    saveChartDataToLocalStorage('music');
                    saveChartDataToLocalStorage('rpg'); // Salva o RPG junto com as músicas
                    renderChart('music');
                    renderRPGChart(); // Re-renderiza o RPG
                });
                setupCountdown('albumCountdownTimer', () => {
                    console.log("Timer 'album' disparou. Salvando chart de Álbum...");
                    saveChartDataToLocalStorage('album');
                    renderChart('album');
                });

                initializeBodyClickListener();
                document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', handleBack));
                switchTab(null, 'homeSection');
                console.log("Aplicação Iniciada e Configurada.");

            } catch (uiError) {
                console.error("Erro fatal durante a inicialização da UI:", uiError);
                document.body.innerHTML = '<div style="color: white; padding: 20px;"><h1>Erro de Interface</h1><p>Verifique o console.</p></div>';
            }
        } else {
            document.body.innerHTML = '<div style="color: white; padding: 20px;"><h1>Erro Crítico</h1><p>Não foi possível carregar dados do Airtable.</p></div>';
            console.error("Initialization failed: Data loading error.");
        }
        document.body.classList.remove('loading');
    }

    main();

}); // Fim do DOMContentLoaded
