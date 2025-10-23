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
        try { // Adiciona try...catch para pegar erros aqui
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

            // Verifica elementos essenciais
            const essentialElements = [
                allViews, searchInput, studioView, loginPrompt, loggedInInfo, playerSelect,
                loginButton, logoutButton, studioLaunchWrapper, studioTabs, studioForms,
                newSingleForm, singleArtistSelect, singleReleaseDateInput, newAlbumForm,
                albumArtistSelect, albumReleaseDateInput, addTrackButton, albumTracklistEditor,
                featModal, featArtistSelect, featTypeSelect, confirmFeatBtn, cancelFeatBtn
            ];

            if (essentialElements.some(el => !el) || (allViews && allViews.length === 0)) {
                 console.error("ERRO CRÍTICO: Elementos essenciais do HTML não foram encontrados!");
                 // Tenta mostrar erro sem quebrar tudo
                 const errorDiv = document.createElement('div');
                 errorDiv.style.color = 'red';
                 errorDiv.style.padding = '20px';
                 errorDiv.style.textAlign = 'center';
                 errorDiv.innerHTML = '<h1>Erro de Interface</h1><p>Elementos essenciais da página não foram encontrados. Verifique o HTML e os IDs no console.</p>';
                 document.body.prepend(errorDiv); // Adiciona no início do body
                 return false;
            }

            const today = new Date().toISOString().split('T')[0];
            singleReleaseDateInput.value = today;
            albumReleaseDateInput.value = today;

            console.log("DOM elements initialized.");
            return true;
        } catch (error) {
            console.error("Erro durante initializeDOMElements:", error);
            document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Fatal na Inicialização do DOM</h1><p>${error.message}</p><p>Verifique o console.</p></div>`;
            return false;
        }
    }


    // --- 1. CARREGAMENTO DE DADOS ---

    async function fetchAllAirtablePages(baseUrl, fetchOptions) {
        let allRecords = [];
        let offset = null;
        console.log(`Fetching all pages for: ${baseUrl.split('?')[0]}...`); // Log a tabela

        do {
            const separator = baseUrl.includes('?') ? '&' : '?';
            const fetchUrl = offset ? `${baseUrl}${separator}offset=${offset}` : baseUrl;

            try { // Adiciona try...catch por chamada
                const response = await fetch(fetchUrl, fetchOptions);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Falha ao carregar ${fetchUrl}: ${response.status} - ${errorText}`);
                    // Decide se quer parar tudo ou tentar continuar (aqui paramos)
                    throw new Error(`Airtable fetch failed for ${baseUrl} (status ${response.status})`);
                }

                const data = await response.json();
                if (data.records) {
                    allRecords.push(...data.records);
                    console.log(`  -> Fetched ${data.records.length} records... Total: ${allRecords.length}`);
                }
                offset = data.offset;
            } catch (fetchError) {
                 console.error(`Erro na chamada fetch para ${fetchUrl}:`, fetchError);
                 throw fetchError; // Re-lança o erro para parar o Promise.all
            }

        } while (offset);

        console.log(`Finished fetching for ${baseUrl.split('?')[0]}. Total records: ${allRecords.length}`);
        return { records: allRecords };
    }


    async function loadAllData() {
        // ========================================================
        // === VERIFIQUE OS NOMES DESTES CAMPOS LINK NO AIRTABLE ===
        // ========================================================
        const albumLinkFieldNameInMusicas = 'Álbuns'; // <<< VERIFIQUE 'Álbuns' na tabela Músicas
        const singleLinkFieldNameInMusicas = 'Singles e EPs'; // <<< VERIFIQUE 'Singles e EPs' na tabela Músicas
        // ========================================================

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

            // Verificação básica se os dados retornaram
             if (!artistsData || !albumsData || !musicasData || !singlesData || !playersData) {
                 throw new Error('Falha crítica ao carregar um ou mais conjuntos de dados do Airtable.');
            }


            // --- RECONSTRUÇÃO ---
            const musicasMap = new Map();
            (musicasData.records || []).forEach(record => {
                const fields = record.fields;
                const artistIdsFromServer = fields['Artista'] || [];
                const artistIds = Array.isArray(artistIdsFromServer) ? artistIdsFromServer : [artistIdsFromServer];
                // Usa os nomes definidos no início da função
                const parentAlbumId = fields[albumLinkFieldNameInMusicas] ? fields[albumLinkFieldNameInMusicas][0] : null;
                const parentSingleId = fields[singleLinkFieldNameInMusicas] ? fields[singleLinkFieldNameInMusicas][0] : null;
                const parentReleaseId = parentAlbumId || parentSingleId || null;

                musicasMap.set(record.id, {
                    id: record.id,
                    title: fields['Nome da Faixa'] || 'Faixa Sem Título',
                    duration: fields['Duração'] ? new Date(fields['Duração'] * 1000).toISOString().substr(14, 5) : "00:00",
                    trackNumber: fields['Nº da Faixa'] || 0,
                    durationSeconds: fields['Duração'] || 0,
                    artistIds: artistIds,
                    collabType: fields['Tipo de Colaboração'],
                    albumId: parentReleaseId,
                    streams: fields['Streams'] || 0,
                    isMainTrack: fields['É Faixa Principal?'] || false
                });
            });


            const artistsMapById = new Map();
            const artistsList = (artistsData.records || []).map(record => {
                const fields = record.fields;
                const artist = {
                    id: record.id, name: fields.Name || 'Nome Indisponível',
                    imageUrl: (fields['URL da Imagem'] && fields['URL da Imagem'][0]?.url) || 'https://i.imgur.com/AD3MbBi.png',
                    off: fields['Inspirações (Off)'] || [], RPGPoints: fields.RPGPoints || 0,
                    // ==========================================
                    // === VERIFIQUE ESTE NOME NO AIRTABLE ===
                    // ==========================================
                    LastActive: fields['LastActive'] || null // <<< VERIFIQUE 'LastActive' na tabela Artistas
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
                    return {
                        id: record.id, title: fields['Nome do Álbum'] || fields['Nome do Single/EP'] || 'Título Indisponível', artist: mainArtistName, artistId: mainArtistId,
                        metascore: fields['Metascore'] || 0, imageUrl: imageUrl, releaseDate: fields['Data de Lançamento'] || '2024-01-01',
                        tracks: tracks,
                        totalDurationSeconds: totalDurationSeconds,
                        isAlbum: isAlbumTable // Adiciona flag para facilitar
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
            // Mostra erro na UI de forma mais clara
            document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Crítico ao Carregar Dados</h1><p>${error.message}</p><p>Verifique o console e a conexão/API Key do Airtable.</p></div>`;
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

            db.songs = data.musicas || []; // Já vêm processadas

            db.albums = [];
            db.singles = [];
            const allReleases = [...(data.albums || []), ...(data.singles || [])];
            const thirtyMinutesInSeconds = 30 * 60;

            allReleases.forEach(item => {
                // Atualiza a capa das músicas em db.songs
                (item.tracks || []).forEach(trackInfo => {
                    const songInDb = db.songs.find(s => s.id === trackInfo.id);
                    if (songInDb) {
                        songInDb.cover = item.imageUrl;
                    } // Warning já acontece em loadAllData
                });

                const artistEntry = db.artists.find(a => a.id === item.artistId);

                // Usa a flag 'isAlbum' adicionada em formatReleases
                if (item.isAlbum && (item.totalDurationSeconds || 0) >= thirtyMinutesInSeconds) { // Garante que é album E tem duração
                    db.albums.push(item);
                    if (artistEntry) {
                        artistEntry.albums.push(item);
                    }
                } else { // Singles ou álbuns curtos vão para singles
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
        document.body.classList.add('loading');
        const data = await loadAllData();
        document.body.classList.remove('loading'); // Remove o loading DEPOIS de carregar

        if (data?.allArtists) { // Optional chaining
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
                    openArtistDetail(activeArtist.name); // Reabre com dados frescos
                }

                return true;
            }
        }
        console.error("Falha ao atualizar os dados após refresh.");
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

        // Se não for a studio view e não estiver na main view, volta pra main view
        if (!document.getElementById('mainView').classList.contains('active')) {
             if (viewHistory.length > 0) { // Só volta se houver histórico (estava em detail)
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
        viewHistory.pop(); // Remove a view atual
        const previousViewId = viewHistory.pop() || 'mainView'; // Pega a anterior
        switchView(previousViewId); // Mostra a anterior (será re-adicionada ao histórico se não for main)
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
        activeArtist = artist; // Define o artista ativo AQUI
        document.getElementById('detailBg').style.backgroundImage = `url(${artist.img})`;
        document.getElementById('detailName').textContent = artist.name;

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
                    <span class="song-streams">${(song.streams || 0).toLocaleString('pt-BR')}</span>
                </div>`).join('');
        } else { popularContainer.innerHTML = '<p class="empty-state-small">Nenhuma música popular.</p>'; }

        const albumsContainer = document.getElementById('albumsList');
        // Filtra álbuns do DB global E ordena
        const artistAlbums = db.albums.filter(a => a.artistId === artist.id).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        albumsContainer.innerHTML = artistAlbums.map(album => `
            <div class="scroll-item" data-album-id="${album.id}">
                <img src="${album.imageUrl}" alt="${album.title}">
                <p>${album.title}</p>
                <span>${new Date(album.releaseDate).getFullYear()}</span>
            </div>`).join('') || '<p class="empty-state-small">Nenhum álbum.</p>';

        const singlesContainer = document.getElementById('singlesList');
         // Filtra singles do DB global E ordena
        const artistSingles = db.singles.filter(s => s.artistId === artist.id).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        singlesContainer.innerHTML = artistSingles.map(single => `
            <div class="scroll-item" data-album-id="${single.id}">
                <img src="${single.imageUrl}" alt="${single.title}">
                <p>${single.title}</p>
                <span>${new Date(single.releaseDate).getFullYear()}</span>
            </div>`).join('') || '<p class="empty-state-small">Nenhum single.</p>';


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
        document.getElementById('albumDetailInfo').innerHTML = `Por <strong class="artist-link" data-artist-name="${artistObj?.name || ''}">${album.artist}</strong> • ${releaseDate}`;

        const tracklistContainer = document.getElementById('albumTracklist');
        // Usa as faixas já linkadas ao objeto 'album' vindo do DB
        tracklistContainer.innerHTML = (album.tracks || [])
         .sort((a,b)=>(a.trackNumber || 0) - (b.trackNumber || 0)) // Garante ordem
         .map(song => {
            const artistName = formatArtistString(song.artistIds, song.collabType);
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
        // Busca lançamentos do DB global e ordena
         const data = (type === 'albums')
            ? db.albums.filter(a => a.artistId === activeArtist.id).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
            : db.singles.filter(s => s.artistId === activeArtist.id).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

        const title = (type === 'albums') ? `Álbuns de ${activeArtist.name}` : `Singles & EPs de ${activeArtist.name}`;
        document.getElementById('discographyTypeTitle').textContent = title;
        const grid = document.getElementById('discographyGrid');
        grid.innerHTML = data.map(item => `
            <div class="scroll-item" data-album-id="${item.id}">
                <img src="${item.imageUrl}" alt="${item.title}">
                <p>${item.title}</p>
                <span>${new Date(item.releaseDate).getFullYear()}</span>
            </div>
        `).join('') || '<p class="empty-state">Nenhum lançamento encontrado.</p>';
        switchView('discographyDetail');
    };

    const handleSearch = () => { /* ... (sem mudanças) ... */ };
    const setupCountdown = (timerId, callback) => { /* ... (sem mudanças) ... */ };
    const CHART_TOP_N = 20; const STREAMS_PER_POINT = 10000;
    const calculateSimulatedStreams = (points, lastActiveISO) => { /* ... (sem mudanças) ... */ };
    const computeChartData = (artistsArray) => { /* ... (sem mudanças) ... */ };
    function renderRPGChart() { /* ... (sem mudanças) ... */ }
    function populateArtistSelector(playerId) { /* ... (sem mudanças) ... */ }
    function loginPlayer(playerId) { /* ... (sem mudanças) ... */ }
    function logoutPlayer() { /* ... (sem mudanças) ... */ }
    function populateFeatModalArtistSelect() { /* ... (sem mudanças) ... */ }
    function openFeatModal(buttonElement) { /* ... (sem mudanças) ... */ }
    function closeFeatModal() { /* ... (sem mudanças) ... */ }
    function confirmFeat() { /* ... (sem mudanças) ... */ }
    function initializeStudio() { /* ... (sem mudanças) ... */ }
    async function createAirtableRecord(tableName, fields) { /* ... (sem mudanças - exceto logs) ... */ }
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
             if (featTags.length > 0) {
                const featArtistIds = []; const featArtistNames = []; collabType = featTags[0].dataset.featType;
                featTags.forEach(tag => { featArtistIds.push(tag.dataset.artistId); featArtistNames.push(tag.dataset.artistName); });
                if (collabType === "Feat.") { finalTrackName = `${trackName} (feat. ${featArtistNames.join(', ')})`; finalArtistIds = [artistId]; }
                else if (collabType === "Dueto/Grupo") { finalTrackName = trackName; finalArtistIds = [artistId, ...featArtistIds]; }
            }

            const musicRecordFields = {
                "Nome da Faixa": finalTrackName, "Artista": finalArtistIds,
                "Duração": trackDurationSec, "Nº da Faixa": 1,
                "Singles e EPs": [singleRecordId],
                "Streams": 0, // Adicionado Streams
                // "É Faixa Principal?" -> Não aplicável para singles
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
        } catch (error) {
            alert("Erro ao lançar o single. Verifique o console para mais detalhes.");
            console.error("Erro em handleSingleSubmit:", error);
        } finally {
             submitBtn.disabled = false;
            submitBtn.textContent = 'Lançar Single';
        }
    }


    function initAlbumForm() {
        addNewTrackInput();
        if (albumTracklistEditor && typeof Sortable !== 'undefined') {
             albumTracklistSortable = Sortable.create(albumTracklistEditor, { animation: 150, handle: '.drag-handle', onEnd: updateTrackNumbers });
        } else if (typeof Sortable === 'undefined') { console.warn("SortableJS não carregado."); }
    }

    // Modificado para incluir radio button
    function addNewTrackInput() {
        const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const trackCount = albumTracklistEditor.children.length + 1;
        const isFirstTrack = trackCount === 1;

        const newTrackEl = document.createElement('div');
        newTrackEl.className = 'track-list-item';
        // Adiciona wrapper .track-selection com input radio e label
        newTrackEl.innerHTML = `
            <div class="track-main-row">
                <i class="fas fa-bars drag-handle"></i>
                <div class="track-selection">
                    <span class="track-number">${trackCount}.</span>
                    <input type="radio" name="mainTrackRadio" id="main_${trackId}" value="${trackCount - 1}" ${isFirstTrack ? 'checked' : ''} class="main-track-radio">
                    <label for="main_${trackId}" class="main-track-label" title="Marcar como Faixa Principal">
                        <i class="fas fa-star"></i>
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
            if (wasChecked && albumTracklistEditor.children.length > 0) {
                 albumTracklistEditor.querySelector('.main-track-radio').checked = true; // Marca a nova primeira
            } else if (albumTracklistEditor.children.length === 0) {
                // Se removeu a última, talvez adicionar uma nova? Ou deixar vazio?
                // Vamos deixar vazio por enquanto. Se addTrackButton for clicado, a primeira será marcada.
            }
        });

        albumTracklistEditor.appendChild(newTrackEl);
    }


    function updateTrackNumbers() {
        const tracks = albumTracklistEditor.querySelectorAll('.track-list-item');
        tracks.forEach((track, index) => {
            track.querySelector('.track-number').textContent = `${index + 1}.`;
            track.querySelector('.main-track-radio').value = index; // Atualiza o VALOR do radio
             // Garante que o ID do label e radio sejam únicos se houver reordenação complexa (opcional mas seguro)
            const trackId = track.querySelector('.feat-target-hidden').id;
            const radio = track.querySelector('.main-track-radio');
            const label = track.querySelector('.main-track-label');
            radio.id = `main_${trackId}`;
            label.setAttribute('for', `main_${trackId}`);
        });
        // Garante que sempre haja UMA selecionada se houver faixas
         if (tracks.length > 0 && !albumTracklistEditor.querySelector('input[name="mainTrackRadio"]:checked')) {
             albumTracklistEditor.querySelector('input[name="mainTrackRadio"]').checked = true;
         }
    }

    async function batchCreateAirtableRecords(tableName, records) { /* ... (sem mudanças) ... */ }

    // Modificado para pegar a faixa principal e enviar campo booleano
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

            // Descobre qual radio button está selecionado
            const mainTrackRadio = albumTracklistEditor.querySelector('input[name="mainTrackRadio"]:checked');
            // Pega o índice (valor do radio), default para 0 se nenhum (embora updateTrackNumbers deva garantir um)
            const mainTrackIndex = mainTrackRadio ? parseInt(mainTrackRadio.value, 10) : 0;

            const trackElements = albumTracklistEditor.querySelectorAll('.track-list-item');
            let totalDurationSec = 0;
            const musicRecordsToCreate = [];

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
                  if (featTags.length > 0) {
                    const featArtistIds = []; const featArtistNames = []; collabType = featTags[0].dataset.featType;
                    featTags.forEach(tag => { featArtistIds.push(tag.dataset.artistId); featArtistNames.push(tag.dataset.artistName); });
                    if (collabType === "Feat.") { finalTrackName = `${trackName} (feat. ${featArtistNames.join(', ')})`; finalArtistIds = [artistId]; }
                    else if (collabType === "Dueto/Grupo") { finalTrackName = trackName; finalArtistIds = [artistId, ...featArtistIds]; }
                }

                const musicRecord = {
                    "Nome da Faixa": finalTrackName, "Artista": finalArtistIds,
                    "Duração": durationSec, "Nº da Faixa": index + 1,
                    "Streams": 0,
                    "É Faixa Principal?": (index === mainTrackIndex) // Define true/false
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

            // ==========================================
            // === VERIFIQUE ESTES NOMES NO AIRTABLE ===
            // ==========================================
            const albumLinkFieldNameInMusicas = 'Álbuns'; // <<< VERIFIQUE ESTE NOME!
            const singleLinkFieldNameInMusicas = 'Singles e EPs'; // <<< VERIFIQUE ESTE NOME!

            const correctLinkField = isAlbum ? albumLinkFieldNameInMusicas : singleLinkFieldNameInMusicas;
            musicRecordsToCreate.forEach(record => { record[correctLinkField] = [releaseRecordId]; });

            const createdSongs = await batchCreateAirtableRecords('Músicas', musicRecordsToCreate);
            if (!createdSongs || createdSongs.length !== musicRecordsToCreate.length) {
                 console.error("Álbum/EP criado, mas falha ao criar as músicas vinculadas.");
                 throw new Error("Falha ao criar as faixas no Airtable.");
            }

            alert("Álbum/EP lançado com sucesso!");
            newAlbumForm.reset();
            albumReleaseDateInput.value = new Date().toISOString().split('T')[0];
            albumTracklistEditor.innerHTML = ''; initAlbumForm();
            await refreshAllData();
        } catch (error) {
            alert("Erro ao lançar o álbum/EP. Verifique o console e os campos preenchidos.");
            console.error("Erro em handleAlbumSubmit:", error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Lançar Álbum / EP';
        }
    }


    // --- 5. INICIALIZAÇÃO GERAL ---

    function initializeBodyClickListener() {
        document.body.addEventListener('click', (e) => {
            const artistCard = e.target.closest('.artist-card[data-artist-name]');
            const albumCard = e.target.closest('[data-album-id]');
            const songCard = e.target.closest('.song-row[data-song-id], .track-row[data-song-id], .chart-item[data-song-id]');
            const artistLink = e.target.closest('.artist-link[data-artist-name]');
            const discogLink = e.target.closest('.see-all-btn[data-type]');

            if (discogLink) { openDiscographyDetail(discogLink.dataset.type); return; }
            if (albumCard) { openAlbumDetail(albumCard.dataset.albumId); return; }
            if (artistCard) { openArtistDetail(artistCard.dataset.artistName); return; }
            if (artistLink) { openArtistDetail(artistLink.dataset.artistName); return; }
            if (songCard) { console.log("Clicou na música ID:", songCard.dataset.songId); }
        });

        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });
    }

    async function main() {
        console.log("Iniciando Aplicação...");
        if (!initializeDOMElements()) return;
        document.body.classList.add('loading');
        const data = await loadAllData(); // Carrega os dados primeiro
        document.body.classList.remove('loading'); // Remove o loading DEPOIS

        if (data?.allArtists) { // Verifica se dados foram carregados
            if (!initializeData(data)) return; // Processa os dados
            try {
                initializeStudio(); // Configura ouvintes de eventos, etc.

                // Adiciona ouvintes de submit APÓS initializeStudio
                if (newSingleForm) newSingleForm.addEventListener('submit', handleSingleSubmit);
                if (newAlbumForm) newAlbumForm.addEventListener('submit', handleAlbumSubmit);

                renderRPGChart(); // Renderiza componentes iniciais
                const allNavs = [...document.querySelectorAll('.nav-tab'), ...document.querySelectorAll('.bottom-nav-item')];
                allNavs.forEach(nav => { nav.removeEventListener('click', switchTab); nav.addEventListener('click', switchTab); });
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));
                renderChart('music'); renderChart('album');
                setupCountdown('musicCountdownTimer', () => renderChart('music'));
                setupCountdown('albumCountdownTimer', () => renderChart('album'));
                initializeBodyClickListener();
                document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', handleBack));

                switchTab(null, 'homeSection'); // Mostra a view inicial

                console.log("Aplicação Iniciada e Configurada.");
            } catch (uiError) { // Captura erros na configuração da UI
                console.error("Erro fatal durante a inicialização da UI:", uiError);
                document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Fatal na UI</h1><p>${uiError.message}</p><p>Verifique o console.</p></div>`;
            }
        } else { // Erro no carregamento de dados já tratado em loadAllData
             // Opcional: Adicionar mensagem aqui se loadAllData não tiver mostrado
             if (!document.body.innerHTML.includes('Erro Crítico')) { // Evita duplicar msg
                document.body.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h1>Erro Crítico</h1><p>Não foi possível carregar os dados essenciais.</p></div>';
            }
        }
    }

    main().catch(err => { // Adiciona catch geral para erros não pegos
         console.error("Erro não capturado na execução principal:", err);
         document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Inesperado</h1><p>${err.message}</p><p>Verifique o console.</p></div>`;
    });

});
