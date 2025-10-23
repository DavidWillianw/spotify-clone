document.addEventListener('DOMContentLoaded', async () => {

    // --- VARIÁVEIS GLOBAIS ---
    let db = { artists: [], albums: [], singles: [], songs: [], players: [] };
    let currentPlayer = null;
    let albumTracklistSortable = null;
    let activeArtist = null;
    let currentFeatTarget = null;
    let viewHistory = [];

    // --- ELEMENTOS DO DOM ---
    let allViews, searchInput, studioView, loginPrompt, loggedInInfo, playerSelect,
        loginButton, logoutButton, studioLaunchWrapper, studioTabs, studioForms,
        newSingleForm, singleArtistSelect, singleReleaseDateInput,
        newAlbumForm, albumArtistSelect, albumReleaseDateInput,
        addTrackButton, albumTracklistEditor, featModal, featArtistSelect,
        featTypeSelect, confirmFeatBtn, cancelFeatBtn;

    const AIRTABLE_BASE_ID = 'appG5NOoblUmtSMVI';
    const AIRTABLE_API_KEY = 'pat5T28kjmJ4t6TQG.69bf34509e687fff6a3f76bd52e64518d6c92be8b1ee0a53bcc9f50fedcb5c70';

    // --- FUNÇÃO PARA INICIALIZAR ELEMENTOS DO DOM ---
    function initializeDOMElements() {
        console.log("Initializing DOM elements...");
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
        newAlbumForm = document.getElementById('newAlbumForm');
        albumArtistSelect = document.getElementById('albumArtistSelect');
        albumReleaseDateInput = document.getElementById('albumReleaseDate');
        addTrackButton = document.getElementById('addTrackButton');
        albumTracklistEditor = document.getElementById('albumTracklistEditor');
        featModal = document.getElementById('featModal');
        featArtistSelect = document.getElementById('featArtistSelect');
        featTypeSelect = document.getElementById('featTypeSelect');
        confirmFeatBtn = document.getElementById('confirmFeatBtn');
        cancelFeatBtn = document.getElementById('cancelFeatBtn');

        if (!studioView || !loginPrompt || !playerSelect || !newSingleForm || !newAlbumForm || !featModal || !allViews || allViews.length === 0 || !singleReleaseDateInput || !albumReleaseDateInput) {
            console.error("ERRO CRÍTICO: Elementos essenciais do HTML não foram encontrados! Verifique IDs: studioView, loginPrompt, playerSelect, newSingleForm, newAlbumForm, featModal, .page-view, singleReleaseDate, albumReleaseDate");
            document.body.innerHTML = '<div style="color: red; padding: 20px; text-align: center;"><h1>Erro de Interface</h1><p>Elementos essenciais da página não foram encontrados. Verifique o HTML e os IDs.</p></div>';
            return false;
        }

        const today = new Date().toISOString().split('T')[0];
        singleReleaseDateInput.value = today;
        albumReleaseDateInput.value = today;

        console.log("DOM elements initialized.");
        return true;
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
            if (data.records) {
                allRecords.push(...data.records);
            }
            offset = data.offset;

        } while (offset);

        return { records: allRecords };
    }


    async function loadAllData() {
        const artistsURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Artists?filterByFormula=%7BArtista%20Principal%7D%3D1`;
        const albumsURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Álbuns`;
        const musicasURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Músicas`;
        const singlesURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Singles%20e%20EPs`;
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

            // --- RECONSTRUÇÃO ---
            const musicasMap = new Map();
            (musicasData.records || []).forEach(record => {
                const artistIdsFromServer = record.fields['Artista'] || [];
                const artistIds = Array.isArray(artistIdsFromServer) ? artistIdsFromServer : [artistIdsFromServer];
                const parentAlbumId = record.fields['Álbuns'] ? record.fields['Álbuns'][0] : null;
                const parentSingleId = record.fields['Singles e EPs'] ? record.fields['Singles e EPs'][0] : null;
                const parentReleaseId = parentAlbumId || parentSingleId || null;

                musicasMap.set(record.id, {
                    id: record.id,
                    title: record.fields['Nome da Faixa'] || 'Faixa Sem Título',
                    duration: record.fields['Duração'] ? new Date(record.fields['Duração'] * 1000).toISOString().substr(14, 5) : "00:00",
                    trackNumber: record.fields['Nº da Faixa'] || 0,
                    durationSeconds: record.fields['Duração'] || 0,
                    artistIds: artistIds,
                    collabType: record.fields['Tipo de Colaboração'],
                    albumId: parentReleaseId,
                    // Carrega os novos campos
                    streams: record.fields['Streams'] || 0, // Assume 0 se não existir
                    isMainTrack: record.fields['É Faixa Principal?'] || false // Assume false se não existir/desmarcado
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
                    // Pega as músicas já processadas do musicasMap
                    const tracks = Array.from(musicasMap.values()).filter(song => song.albumId === recordId)
                        .sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
                    const totalDurationSeconds = tracks.reduce((total, track) => total + (track.durationSeconds || 0), 0);
                    const mainArtistIdFromServer = fields['Artista'] || [];
                    const mainArtistId = Array.isArray(mainArtistIdFromServer) ? mainArtistIdFromServer[0] : (mainArtistIdFromServer || null);
                    const mainArtistName = mainArtistId ? artistsMapById.get(mainArtistId) : "Artista Desconhecido";
                    const imageUrlField = isAlbumTable ? 'Capa do Álbum' : 'Capa';
                    const imageUrl = (fields[imageUrlField] && fields[imageUrlField][0]?.url) || 'https://i.imgur.com/AD3MbBi.png';
                    return {
                        id: record.id, title: fields['Nome do Álbum'] || fields['Nome do Single/EP'] || 'Título Indisponível', artist: mainArtistName, artistId: mainArtistId,
                        metascore: fields['Metascore'] || 0, imageUrl: imageUrl, releaseDate: fields['Data de Lançamento'] || '2024-01-01',
                        tracks: tracks, // Músicas já contêm streams e isMainTrack
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
                players: formattedPlayers, musicas: Array.from(musicasMap.values()) // Retorna as músicas processadas
            };
        } catch (error) {
            console.error("Falha GERAL ao carregar dados:", error);
            return null;
        }
    }

    const initializeData = (data) => {
        try {
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

            // As músicas já vêm processadas de loadAllData
            db.songs = data.musicas || [];

            db.albums = [];
            db.singles = [];
            const allReleases = [...(data.albums || []), ...(data.singles || [])];
            const thirtyMinutesInSeconds = 30 * 60;

            allReleases.forEach(item => {
                // Atualiza a capa das músicas DENTRO de db.songs
                (item.tracks || []).forEach(trackInfo => {
                    const songInDb = db.songs.find(s => s.id === trackInfo.id);
                    if (songInDb) {
                        songInDb.cover = item.imageUrl;
                    } else {
                        // O warning já acontece em loadAllData se a música não existir no map
                    }
                });

                const artistEntry = db.artists.find(a => a.id === item.artistId);

                if ((item.totalDurationSeconds || 0) >= thirtyMinutesInSeconds) {
                    db.albums.push(item);
                    if (artistEntry) {
                        artistEntry.albums.push(item);
                    }
                } else {
                    db.singles.push(item);
                    if (artistEntry) {
                        artistEntry.singles.push(item);
                    }
                }

                if (!artistEntry && item.artist !== "Artista Desconhecido") {
                     console.warn(`Artista "${item.artist}" (ID: ${item.artistId}) do lançamento "${item.title}" não encontrado em db.artists.`);
                }
            });

            db.players = data.players || [];

            console.log(`DB Inicializado: Artists: ${db.artists.length}, Albums: ${db.albums.length}, Singles: ${db.singles.length}, Songs: ${db.songs.length}, Players: ${db.players.length}`);
            return true;
        } catch (error) {
            console.error("Erro CRÍTICO durante initializeData:", error);
            alert("Erro MUITO GRAVE ao inicializar dados. Verifique o console.");
            return false;
        }
    };


    async function refreshAllData() {
        console.log("Atualizando todos os dados...");
        document.body.classList.add('loading'); // Adiciona loading visual
        const data = await loadAllData();
        if (data && data.allArtists) {
            if (initializeData(data)) {
                console.log("Dados atualizados e UI renderizada.");

                renderRPGChart();
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));
                renderChart('music');
                renderChart('album');

                if (currentPlayer) {
                    populateArtistSelector(currentPlayer.id);
                }

                if (activeArtist && !document.getElementById('artistDetail').classList.contains('hidden')) {
                    console.log(`Atualizando detalhes para ${activeArtist.name} após refresh...`);
                    openArtistDetail(activeArtist.name);
                }
                 document.body.classList.remove('loading'); // Remove loading
                return true;
            }
        }
        console.error("Falha ao atualizar os dados.");
        alert("Não foi possível atualizar os dados do servidor.");
        document.body.classList.remove('loading'); // Remove loading em caso de erro
        return false;
    }

    // --- 2. NAVEGAÇÃO E UI ---
    // (Funções switchView, switchTab, handleBack, renderArtistsGrid, formatArtistString, getCoverUrl, renderChart - sem mudanças)
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
        if (!container) return;
        if (!artists || artists.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum artista encontrado.</p>'; return;
        }
        container.innerHTML = artists.map(artist => `
            <div class="artist-card" data-artist-name="${artist.name}">
                <img src="${artist.img || artist.imageUrl || 'https://i.imgur.com/AD3MbBi.png'}" alt="${artist.name}" class="artist-card-img">
                <p class="artist-card-name">${artist.name}</p>
                <span class="artist-card-type">Artista</span>
            </div>`).join('');
    };

    function formatArtistString(artistIds, collabType) {
        if (!artistIds || artistIds.length === 0) return "Artista Desconhecido";
        const artistNames = artistIds.map(id => db.artists.find(a => a.id === id)?.name || "Artista Desc.");
        const mainArtist = artistNames[0];
        if (artistNames.length === 1) return mainArtist;
        const otherArtists = artistNames.slice(1).join(', ');
        return collabType === 'Dueto/Grupo' ? `${mainArtist} & ${otherArtists}` : mainArtist;
    }

    function getCoverUrl(albumId) {
        if (!albumId) return 'https://i.imgur.com/AD3MbBi.png';
        const release = [...db.albums, ...db.singles].find(a => a.id === albumId);
        return release?.imageUrl || 'https://i.imgur.com/AD3MbBi.png';
    }

    const renderChart = (type) => {
        let containerId, dataList;
        if (type === 'music') {
            containerId = 'musicChartsList';
            dataList = [...db.songs].sort((a, b) => (b.streams || 0) - (a.streams || 0)).slice(0, 50);
        } else {
            containerId = 'albumChartsList';
            dataList = [...db.albums].sort((a, b) => (b.metascore || 0) - (a.metascore || 0)).slice(0, 50);
        }
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!dataList || dataList.length === 0) {
            container.innerHTML = `<p class="empty-state">Nenhum item no chart.</p>`; return;
        }
        container.innerHTML = dataList.map((item, index) => {
            if (type === 'music') {
                const artistName = formatArtistString(item.artistIds, item.collabType);
                return `...`; // HTML do chart de música (sem mudanças)
            } else {
                return `...`; // HTML do chart de álbum (sem mudanças)
            }
        }).join('');
         // Recriando o HTML do Chart para clareza (NÃO mudou a lógica)
         container.innerHTML = dataList.map((item, index) => {
            if (type === 'music') {
                const artistName = formatArtistString(item.artistIds, item.collabType);
                // Adiciona data-streams ao item para debug ou futuras features
                return `
                    <div class="chart-item" data-song-id="${item.id}" data-streams="${item.streams || 0}">
                        <span class="chart-rank">${index + 1}</span>
                        <img src="${item.cover || getCoverUrl(item.albumId)}" alt="${item.title}" class="chart-item-img">
                        <div class="chart-item-info">
                            <span class="chart-item-title">${item.title}</span>
                            <span class="chart-item-artist">${artistName}</span>
                        </div>
                        <span class="chart-item-duration">${item.duration}</span>
                    </div>
                `;
            } else { // album
                return `
                    <div class="chart-item" data-album-id="${item.id}">
                        <span class="chart-rank">${index + 1}</span>
                        <img src="${item.imageUrl}" alt="${item.title}" class="chart-item-img">
                        <div class="chart-item-info">
                            <span class="chart-item-title">${item.title}</span>
                            <span class="chart-item-artist">${item.artist}</span>
                        </div>
                        <span class="chart-item-score">${item.metascore}</span>
                    </div>
                `;
            }
        }).join('');
    };

    const openArtistDetail = (artistName) => {
        const artist = db.artists.find(a => a.name === artistName);
        if (!artist) { console.error(`Artista "${artistName}" não encontrado.`); handleBack(); return; }
        activeArtist = artist;
        document.getElementById('detailBg').style.backgroundImage = `url(${artist.img})`;
        document.getElementById('detailName').textContent = artist.name;

        // Populares agora usa db.songs diretamente
        const popularSongs = db.songs
            .filter(s => s.artistIds && s.artistIds.includes(artist.id))
            .sort((a, b) => (b.streams || 0) - (a.streams || 0))
            .slice(0, 5);

        const popularContainer = document.getElementById('popularSongsList');
        if (popularSongs.length > 0) {
            popularContainer.innerHTML = popularSongs.map((song, index) => `
                <div class="song-row" data-song-id="${song.id}">
                    <span>${index + 1}</span>
                    <div class="song-row-info">
                        <img src="${song.cover || getCoverUrl(song.albumId)}" alt="${song.title}" class="song-row-cover">
                        <span class="song-row-title">${song.title}</span>
                    </div>
                    {/* Exibe streams formatados */}
                    <span class="song-streams">${(song.streams || 0).toLocaleString('pt-BR')}</span>
                </div>`).join('');
        } else { /* ... HTML estado vazio ... */ }

        const albumsContainer = document.getElementById('albumsList');
        const sortedAlbums = (artist.albums || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        albumsContainer.innerHTML = sortedAlbums.map(album => `...`).join('') || '<p class="empty-state-small">Nenhum álbum.</p>'; // HTML do carrossel (sem mudanças)

        const singlesContainer = document.getElementById('singlesList');
        const sortedSingles = (artist.singles || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        singlesContainer.innerHTML = sortedSingles.map(single => `...`).join('') || '<p class="empty-state-small">Nenhum single.</p>'; // HTML do carrossel (sem mudanças)

        const recommended = [...db.artists].filter(a => a.id !== artist.id).sort(() => 0.5 - Math.random()).slice(0, 5);
        renderArtistsGrid('recommendedGrid', recommended);
        switchView('artistDetail');
         // Recriando HTML dos carrosseis para clareza (NÃO mudou a lógica)
        albumsContainer.innerHTML = sortedAlbums.map(album => `
            <div class="scroll-item" data-album-id="${album.id}">
                <img src="${album.imageUrl}" alt="${album.title}">
                <p>${album.title}</p>
                <span>${new Date(album.releaseDate).getFullYear()}</span>
            </div>
        `).join('') || '<p class="empty-state-small">Nenhum álbum.</p>';

        singlesContainer.innerHTML = sortedSingles.map(single => `
            <div class="scroll-item" data-album-id="${single.id}">
                <img src="${single.imageUrl}" alt="${single.title}">
                <p>${single.title}</p>
                <span>${new Date(single.releaseDate).getFullYear()}</span>
            </div>
        `).join('') || '<p class="empty-state-small">Nenhum single.</p>';

    };


    const openAlbumDetail = (albumId) => {
        const album = [...db.albums, ...db.singles].find(a => a.id === albumId);
        if (!album) { console.error(`Álbum/Single ID "${albumId}" não encontrado.`); return; }
        document.getElementById('albumDetailBg').style.backgroundImage = `url(${album.imageUrl})`;
        document.getElementById('albumDetailCover').src = album.imageUrl;
        document.getElementById('albumDetailTitle').textContent = album.title;
        const releaseDate = new Date(album.releaseDate).getFullYear();
        const artistObj = db.artists.find(a => a.id === album.artistId);
        document.getElementById('albumDetailInfo').innerHTML = `Por <strong class="artist-link" data-artist-name="${artistObj?.name || ''}">${album.artist}</strong> • ${releaseDate}`;

        const tracklistContainer = document.getElementById('albumTracklist');
        // Usa as faixas do objeto 'album', que já contêm streams e isMainTrack
        tracklistContainer.innerHTML = (album.tracks || [])
         .sort((a,b)=>(a.trackNumber || 0) - (b.trackNumber || 0)) // Garante ordem
         .map(song => {
            const artistName = formatArtistString(song.artistIds, song.collabType);
            // Adiciona indicador visual para faixa principal
            const mainTrackIndicator = song.isMainTrack ? '<i class="fas fa-star main-track-indicator" title="Faixa Principal"></i>' : '';
            return `
                <div class="track-row ${song.isMainTrack ? 'main-track' : ''}" data-song-id="${song.id}">
                    <span class="track-number">${song.trackNumber}</span>
                    <div class="track-info">
                        <span class="track-title">${song.title} ${mainTrackIndicator}</span>
                        <span class="track-artist-feat">${artistName}</span>
                    </div>
                    <span class="track-duration">${song.duration}</span>
                </div>
            `;
        }).join('');

        switchView('albumDetail');
    };

    const openDiscographyDetail = (type) => {
        if (!activeArtist) { console.error("Nenhum artista ativo."); handleBack(); return; }
        const data = (type === 'albums')
            ? (activeArtist.albums || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
            : (activeArtist.singles || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        const title = (type === 'albums') ? `Álbuns de ${activeArtist.name}` : `Singles & EPs de ${activeArtist.name}`;
        document.getElementById('discographyTypeTitle').textContent = title;
        const grid = document.getElementById('discographyGrid');
        grid.innerHTML = data.map(item => `...`).join('') || '<p class="empty-state">Nenhum lançamento.</p>'; // HTML do grid (sem mudanças)
        switchView('discographyDetail');
         // Recriando HTML do Grid para clareza (NÃO mudou a lógica)
        grid.innerHTML = data.map(item => `
            <div class="scroll-item" data-album-id="${item.id}">
                <img src="${item.imageUrl}" alt="${item.title}">
                <p>${item.title}</p>
                <span>${new Date(item.releaseDate).getFullYear()}</span>
            </div>
        `).join('') || '<p class="empty-state">Nenhum lançamento encontrado.</p>';
    };

    const handleSearch = () => { /* ... (sem mudanças) ... */ };
    const setupCountdown = (timerId, callback) => { /* ... (sem mudanças) ... */ };

    // --- 3. SISTEMA DE RPG ---
    const CHART_TOP_N = 20;
    const STREAMS_PER_POINT = 10000;
    const calculateSimulatedStreams = (points, lastActiveISO) => { /* ... (sem mudanças) ... */ };
    const computeChartData = (artistsArray) => { /* ... (sem mudanças) ... */ };
    function renderRPGChart() { /* ... (sem mudanças) ... */ }

    // --- 4. SISTEMA DO ESTÚDIO ---
    function populateArtistSelector(playerId) { /* ... (sem mudanças) ... */ }
    function loginPlayer(playerId) { /* ... (sem mudanças) ... */ }
    function logoutPlayer() { /* ... (sem mudanças) ... */ }
    function populateFeatModalArtistSelect() { /* ... (sem mudanças) ... */ }
    function openFeatModal(buttonElement) { /* ... (sem mudanças) ... */ }
    function closeFeatModal() { /* ... (sem mudanças) ... */ }
    function confirmFeat() { /* ... (sem mudanças) ... */ }
    function initializeStudio() { /* ... (sem mudanças - exceto talvez data inicial?) ... */ }
    async function createAirtableRecord(tableName, fields) { /* ... (sem mudanças) ... */ }
    function parseDurationToSeconds(durationStr) { /* ... (sem mudanças) ... */ }


    async function handleSingleSubmit(event) {
        event.preventDefault();
        const submitBtn = document.getElementById('submitNewSingle');
        submitBtn.disabled = true; submitBtn.textContent = 'Enviando...';
        try {
            const artistId = singleArtistSelect.value;
            const singleTitle = document.getElementById('singleTitle').value;
            const coverUrl = document.getElementById('singleCoverUrl').value;
            const releaseDate = singleReleaseDateInput.value;
            const trackName = document.getElementById('trackName').value;
            const trackDurationStr = document.getElementById('trackDuration').value;
            const trackDurationSec = parseDurationToSeconds(trackDurationStr);

            if (!artistId || !singleTitle || !coverUrl || !releaseDate || !trackName || !trackDurationStr) {
                throw new Error("Campos obrigatórios do single faltando.");
            }

            const singleRecordResponse = await createAirtableRecord('Singles e EPs', {
                "Nome do Single/EP": singleTitle, "Artista": [artistId],
                "Capa": [{ "url": coverUrl }], "Data de Lançamento": releaseDate
            });
            if (!singleRecordResponse?.id) throw new Error("Falha ao criar o registro do Single/EP.");
            const singleRecordId = singleRecordResponse.id;

            const featTags = document.querySelectorAll('#singleFeatList .feat-tag');
            let finalTrackName = trackName, finalArtistIds = [artistId], collabType = null;
            if (featTags.length > 0) { /* ... lógica feat/dueto (sem mudanças) ... */ }
             if (featTags.length > 0) {
                const featArtistIds = []; const featArtistNames = [];
                collabType = featTags[0].dataset.featType;
                featTags.forEach(tag => { featArtistIds.push(tag.dataset.artistId); featArtistNames.push(tag.dataset.artistName); });
                if (collabType === "Feat.") { finalTrackName = `${trackName} (feat. ${featArtistNames.join(', ')})`; finalArtistIds = [artistId]; }
                else if (collabType === "Dueto/Grupo") { finalTrackName = trackName; finalArtistIds = [artistId, ...featArtistIds]; }
            }


            const musicRecordFields = {
                "Nome da Faixa": finalTrackName, "Artista": finalArtistIds,
                "Duração": trackDurationSec, "Nº da Faixa": 1,
                "Singles e EPs": [singleRecordId],
                "Streams": 0 // <-- ADICIONADO Streams: 0
                // É Faixa Principal? não é necessário para single
            };
            if (collabType) musicRecordFields["Tipo de Colaboração"] = collabType;

            console.log('--- DEBUG: Enviando para Músicas (Single) ---', JSON.stringify(musicRecordFields, null, 2));
            const musicRecordResponse = await createAirtableRecord('Músicas', musicRecordFields);
            if (!musicRecordResponse?.id) throw new Error("Falha ao criar o registro da música.");

            alert("Single lançado com sucesso!");
            newSingleForm.reset();
            singleReleaseDateInput.value = new Date().toISOString().split('T')[0];
            document.getElementById('singleFeatList').innerHTML = '';
            await refreshAllData();
        } catch (error) { /* ... (tratamento de erro sem mudanças) ... */ }
        finally { submitBtn.disabled = false; submitBtn.textContent = 'Lançar Single'; }
         } catch (error) {
            alert("Erro ao lançar o single. Verifique o console para mais detalhes.");
            console.error("Erro em handleSingleSubmit:", error);
        } finally {
             submitBtn.disabled = false;
            submitBtn.textContent = 'Lançar Single';
        }

    }


    function initAlbumForm() {
        addNewTrackInput(); // Adiciona a primeira faixa
        if (albumTracklistEditor && typeof Sortable !== 'undefined') { /* ... inicializa Sortable ... */ }
         if (albumTracklistEditor && typeof Sortable !== 'undefined') {
            albumTracklistSortable = Sortable.create(albumTracklistEditor, {
                animation: 150, handle: '.drag-handle', onEnd: updateTrackNumbers
            });
        } else if (typeof Sortable === 'undefined') {
            console.warn("SortableJS não carregado.");
        }
    }

    // Adiciona input radio para marcar faixa principal
    function addNewTrackInput() {
        const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const trackCount = albumTracklistEditor.children.length + 1;
        const isFirstTrack = trackCount === 1; // Verifica se é a primeira faixa

        const newTrackEl = document.createElement('div');
        newTrackEl.className = 'track-list-item';
        newTrackEl.innerHTML = `
            <div class="track-main-row">
                <i class="fas fa-bars drag-handle"></i>
                {/* Wrapper para número e radio */}
                <div class="track-selection">
                    <span class="track-number">${trackCount}.</span>
                    {/* Radio button para Faixa Principal */}
                    <input type="radio" name="mainTrackRadio" id="main_${trackId}" value="${trackCount - 1}" ${isFirstTrack ? 'checked' : ''} class="main-track-radio">
                    <label for="main_${trackId}" class="main-track-label" title="Marcar como Faixa Principal">
                        <i class="fas fa-star"></i> {/* Ícone de estrela */}
                    </label>
                </div>
                <div class="track-inputs">
                    <input type="text" class="track-name-input" placeholder="Nome da Faixa" required>
                    <input type="text" class="track-duration-input" placeholder="MM:SS" pattern="\\d{1,2}:\\d{2}" required>
                </div>
                <button type="button" class="small-btn add-feat-btn" data-target="${trackId}"><i class="fas fa-plus"></i> Feat</button>
                <button type="button" class="small-btn remove-track-btn delete-track-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="feat-section">
                <div class="feat-list feat-list-album"></div>
            </div>
            <div id="${trackId}" class="feat-target-hidden"></div>
        `;

        newTrackEl.querySelector('.remove-track-btn').addEventListener('click', () => {
            const wasChecked = newTrackEl.querySelector('.main-track-radio').checked;
            newTrackEl.remove();
            updateTrackNumbers();
            // Se a faixa removida era a principal, marca a nova primeira como principal
            if (wasChecked && albumTracklistEditor.children.length > 0) {
                 albumTracklistEditor.querySelector('.main-track-radio').checked = true;
            }
        });

        albumTracklistEditor.appendChild(newTrackEl);
    }


    function updateTrackNumbers() {
        const tracks = albumTracklistEditor.querySelectorAll('.track-list-item');
        tracks.forEach((track, index) => {
            track.querySelector('.track-number').textContent = `${index + 1}.`;
            // Atualiza o VALOR do radio button para o novo índice
            track.querySelector('.main-track-radio').value = index;
        });
    }

    async function batchCreateAirtableRecords(tableName, records) { /* ... (sem mudanças) ... */ }

    async function handleAlbumSubmit(event) {
        event.preventDefault();
        const submitBtn = document.getElementById('submitNewAlbum');
        submitBtn.disabled = true; submitBtn.textContent = 'Enviando...';
        try {
            const artistId = albumArtistSelect.value;
            const albumTitle = document.getElementById('albumTitle').value;
            const coverUrl = document.getElementById('albumCoverUrl').value;
            const releaseDate = albumReleaseDateInput.value;

            if (!artistId || !albumTitle || !coverUrl || !releaseDate) {
                 throw new Error("Campos obrigatórios do álbum faltando.");
            }

            // Descobre qual radio button está selecionado para ser a faixa principal
            const mainTrackRadio = albumTracklistEditor.querySelector('input[name="mainTrackRadio"]:checked');
            const mainTrackIndex = mainTrackRadio ? parseInt(mainTrackRadio.value, 10) : 0; // Pega o índice (valor do radio)

            const trackElements = albumTracklistEditor.querySelectorAll('.track-list-item');
            let totalDurationSec = 0;
            const musicRecordsToCreate = [];

            for (let index = 0; index < trackElements.length; index++) { /* ... validação de campos ... */ }
             for (let index = 0; index < trackElements.length; index++) {
                const trackEl = trackElements[index];
                const trackNameInput = trackEl.querySelector('.track-name-input');
                const durationStrInput = trackEl.querySelector('.track-duration-input');
                if (!trackNameInput || !durationStrInput) continue;
                const trackName = trackNameInput.value; const durationStr = durationStrInput.value;
                if (!trackName || !durationStr) throw new Error(`Campos da faixa ${index + 1} faltando.`);
                const durationSec = parseDurationToSeconds(durationStr); totalDurationSec += durationSec;

                const featTags = trackEl.querySelectorAll('.feat-tag');
                let finalTrackName = trackName, finalArtistIds = [artistId], collabType = null;
                 if (featTags.length > 0) { /* ... lógica feat/dueto (sem mudanças) ... */ }
                  if (featTags.length > 0) {
                    const featArtistIds = []; const featArtistNames = []; collabType = featTags[0].dataset.featType;
                    featTags.forEach(tag => { featArtistIds.push(tag.dataset.artistId); featArtistNames.push(tag.dataset.artistName); });
                    if (collabType === "Feat.") { finalTrackName = `${trackName} (feat. ${featArtistNames.join(', ')})`; finalArtistIds = [artistId]; }
                    else if (collabType === "Dueto/Grupo") { finalTrackName = trackName; finalArtistIds = [artistId, ...featArtistIds]; }
                }

                // Cria o registro da música
                const musicRecord = {
                    "Nome da Faixa": finalTrackName, "Artista": finalArtistIds,
                    "Duração": durationSec, "Nº da Faixa": index + 1,
                    "Streams": 0, // <-- ADICIONADO Streams: 0
                    "É Faixa Principal?": (index === mainTrackIndex) // <-- ADICIONADO Faixa Principal
                };
                if (collabType) musicRecord["Tipo de Colaboração"] = collabType;
                musicRecordsToCreate.push(musicRecord);
            }


            if (musicRecordsToCreate.length === 0) throw new Error("Nenhuma faixa válida.");

            const isAlbum = totalDurationSec >= (30 * 60);
            const tableName = isAlbum ? 'Álbuns' : 'Singles e EPs';
            const nameField = isAlbum ? 'Nome do Álbum' : 'Nome do Single/EP';
            const coverField = isAlbum ? 'Capa do Álbum' : 'Capa';

            const releaseRecordResponse = await createAirtableRecord(tableName, {
                [nameField]: albumTitle, "Artista": [artistId],
                [coverField]: [{ "url": coverUrl }], "Data de Lançamento": releaseDate
            });
            if (!releaseRecordResponse?.id) throw new Error("Falha ao criar registro do álbum/EP.");
            const releaseRecordId = releaseRecordResponse.id;

            const albumLinkFieldNameInMusicas = 'Álbuns'; // <<< VERIFIQUE NOME
            const singleLinkFieldNameInMusicas = 'Singles e EPs'; // <<< VERIFIQUE NOME
            const correctLinkField = isAlbum ? albumLinkFieldNameInMusicas : singleLinkFieldNameInMusicas;
            musicRecordsToCreate.forEach(record => { record[correctLinkField] = [releaseRecordId]; });

            const createdSongs = await batchCreateAirtableRecords('Músicas', musicRecordsToCreate);
            if (!createdSongs || createdSongs.length !== musicRecordsToCreate.length) {
                 throw new Error("Falha ao criar as faixas no Airtable.");
            }

            alert("Álbum/EP lançado com sucesso!");
            newAlbumForm.reset();
            albumReleaseDateInput.value = new Date().toISOString().split('T')[0];
            albumTracklistEditor.innerHTML = ''; initAlbumForm();
            await refreshAllData();
        } catch (error) { /* ... (tratamento de erro sem mudanças) ... */ }
        finally { submitBtn.disabled = false; submitBtn.textContent = 'Lançar Álbum / EP'; }
         } catch (error) {
            alert("Erro ao lançar o álbum/EP. Verifique o console e os campos preenchidos.");
            console.error("Erro em handleAlbumSubmit:", error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Lançar Álbum / EP';
        }

    }


    // --- 5. INICIALIZAÇÃO GERAL ---

    function initializeBodyClickListener() { /* ... (sem mudanças) ... */ }

    async function main() {
        console.log("Iniciando Aplicação...");
        if (!initializeDOMElements()) return;
        document.body.classList.add('loading');
        const data = await loadAllData();
        if (data?.allArtists) {
            if (!initializeData(data)) return;
            try {
                initializeStudio();
                if (newSingleForm) newSingleForm.addEventListener('submit', handleSingleSubmit);
                if (newAlbumForm) newAlbumForm.addEventListener('submit', handleAlbumSubmit);
                renderRPGChart();
                const allNavs = [...document.querySelectorAll('.nav-tab'), ...document.querySelectorAll('.bottom-nav-item')];
                allNavs.forEach(nav => { nav.removeEventListener('click', switchTab); nav.addEventListener('click', switchTab); });
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));
                renderChart('music'); renderChart('album');
                setupCountdown('musicCountdownTimer', () => renderChart('music'));
                setupCountdown('albumCountdownTimer', () => renderChart('album'));
                initializeBodyClickListener();
                document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', handleBack));
                switchTab(null, 'homeSection');
                console.log("Aplicação Iniciada e Configurada.");
            } catch (uiError) { /* ... (tratamento de erro sem mudanças) ... */ }
             catch (uiError) {
                console.error("Erro fatal durante a inicialização da UI:", uiError);
                document.body.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h1>Erro de Interface</h1><p>Ocorreu um erro ao configurar a interface. Verifique o console.</p></div>';
            }
        } else { /* ... (tratamento de erro de carregamento sem mudanças) ... */ }
         else {
            document.body.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h1>Erro Crítico</h1><p>Não foi possível carregar os dados essenciais do Airtable. Verifique sua conexão, a API Key e se as tabelas não estão vazias.</p></div>';
            console.error("Initialization failed due to critical data loading error.");
        }
        document.body.classList.remove('loading');
    }

    main();

});
