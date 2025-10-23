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
        newSingleForm, singleArtistSelect, singleReleaseDateInput, // Mantém data input
        newAlbumForm, albumArtistSelect, albumReleaseDateInput, // Mantém data input
        addTrackButton, albumTracklistEditor, featModal, featArtistSelect,
        featTypeSelect, confirmFeatBtn, cancelFeatBtn;

    const AIRTABLE_BASE_ID = 'appG5NOoblUmtSMVI';
    const AIRTABLE_API_KEY = 'pat5T28kjmJ4t6TQG.69bf34509e687fff6a3f76bd52e64518d6c92be8b1ee0a53bcc9f50fedcb5c70';

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
            singleReleaseDateInput = document.getElementById('singleReleaseDate'); // Mantido
            newAlbumForm = document.getElementById('newAlbumForm');
            albumArtistSelect = document.getElementById('albumArtistSelect');
            albumReleaseDateInput = document.getElementById('albumReleaseDate'); // Mantido
            addTrackButton = document.getElementById('addTrackButton');
            albumTracklistEditor = document.getElementById('albumTracklistEditor');
            featModal = document.getElementById('featModal');
            featArtistSelect = document.getElementById('featArtistSelect');
            featTypeSelect = document.getElementById('featTypeSelect');
            confirmFeatBtn = document.getElementById('confirmFeatBtn');
            cancelFeatBtn = document.getElementById('cancelFeatBtn');

            const essentialElements = [
                allViews, searchInput, studioView, loginPrompt, loggedInInfo, playerSelect,
                loginButton, logoutButton, studioLaunchWrapper, studioTabs, studioForms,
                newSingleForm, singleArtistSelect, singleReleaseDateInput, newAlbumForm,
                albumArtistSelect, albumReleaseDateInput, addTrackButton, albumTracklistEditor,
                featModal, featArtistSelect, featTypeSelect, confirmFeatBtn, cancelFeatBtn
            ];

            if (essentialElements.some(el => !el) || (allViews && allViews.length === 0)) {
                 console.error("ERRO CRÍTICO: Elementos essenciais do HTML não foram encontrados!");
                 const errorDiv = document.createElement('div');
                 errorDiv.style.color = 'red'; errorDiv.style.padding = '20px'; errorDiv.style.textAlign = 'center';
                 errorDiv.innerHTML = '<h1>Erro de Interface</h1><p>Elementos essenciais da página não foram encontrados. Verifique o HTML e os IDs no console.</p>';
                 document.body.prepend(errorDiv);
                 return false;
            }

            const today = new Date().toISOString().split('T')[0];
            // Define a data apenas se os elementos existirem (verificação extra)
            if(singleReleaseDateInput) singleReleaseDateInput.value = today;
            if(albumReleaseDateInput) albumReleaseDateInput.value = today;


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
        console.log(`Fetching all pages for: ${baseUrl.split('?')[0]}...`);

        do {
            const separator = baseUrl.includes('?') ? '&' : '?';
            const fetchUrl = offset ? `${baseUrl}${separator}offset=${offset}` : baseUrl;

            try {
                const response = await fetch(fetchUrl, fetchOptions);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Falha ao carregar ${fetchUrl}: ${response.status} - ${errorText}`);
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
                 throw fetchError;
            }

        } while (offset);

        console.log(`Finished fetching for ${baseUrl.split('?')[0]}. Total records: ${allRecords.length}`);
        return { records: allRecords };
    }


    async function loadAllData() {
        const albumLinkFieldNameInMusicas = 'Álbuns'; // <<< VERIFIQUE ESTE NOME!
        const singleLinkFieldNameInMusicas = 'Singles e EPs'; // <<< VERIFIQUE ESTE NOME!

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
                 throw new Error('Falha crítica ao carregar um ou mais conjuntos de dados do Airtable.');
            }

            // --- RECONSTRUÇÃO ---
            const musicasMap = new Map();
            (musicasData.records || []).forEach(record => {
                const fields = record.fields;
                const artistIdsFromServer = fields['Artista'] || [];
                const artistIds = Array.isArray(artistIdsFromServer) ? artistIdsFromServer : [artistIdsFromServer];
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
                    // Sem streams e faixa principal nesta versão
                });
            });


            const artistsMapById = new Map();
            const artistsList = (artistsData.records || []).map(record => {
                const fields = record.fields;
                const artist = {
                    id: record.id, name: fields.Name || 'Nome Indisponível',
                    imageUrl: (fields['URL da Imagem'] && fields['URL da Imagem'][0]?.url) || 'https://i.imgur.com/AD3MbBi.png',
                    off: fields['Inspirações (Off)'] || [], RPGPoints: fields.RPGPoints || 0,
                    LastActive: fields['LastActive'] || null // <<< VERIFIQUE LastActive
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
                        isAlbum: isAlbumTable
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
            document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Crítico ao Carregar Dados</h1><p>${error.message}</p><p>Verifique o console e a conexão/API Key do Airtable.</p></div>`;
            return null;
        }
    }

    const initializeData = (data) => {
        try {
            const artistsMapById = new Map();
            db.artists = (data.allArtists || []).map(artist => {
                const artistEntry = { ...artist, img: artist.imageUrl || 'https://i.imgur.com/AD3MbBi.png', albums: [], singles: [] };
                artistsMapById.set(artist.id, artist.name);
                return artistEntry;
            });

            db.songs = (data.musicas || []).map(song => ({
                ...song,
                // Sem streams nesta versão, mas mantendo a estrutura
                streams: Math.floor(Math.random() * 25000000) + 50000, // Mantem streams aleatórios para charts
                cover: 'https://i.imgur.com/AD3MbBi.png',
                artist: artistsMapById.get((song.artistIds || [])[0]) || 'Artista Desc.'
            }));


            db.albums = []; db.singles = [];
            const allReleases = [...(data.albums || []), ...(data.singles || [])];
            const thirtyMinutesInSeconds = 30 * 60;

            allReleases.forEach(item => {
                (item.tracks || []).forEach(trackInfo => {
                    const songInDb = db.songs.find(s => s.id === trackInfo.id);
                    if (songInDb) songInDb.cover = item.imageUrl;
                    else console.warn(`Song ID ${trackInfo.id} do release "${item.title}" não encontrado em db.songs.`);
                });

                const artistEntry = db.artists.find(a => a.id === item.artistId);
                // Classifica como álbum se veio da tabela Álbuns E tem duração >= 30min
                if (item.isAlbum && (item.totalDurationSeconds || 0) >= thirtyMinutesInSeconds) {
                    db.albums.push(item);
                    if (artistEntry) artistEntry.albums.push(item);
                } else { // Caso contrário (Single/EP ou álbum curto)
                    db.singles.push(item);
                    if (artistEntry) artistEntry.singles.push(item);
                }

                if (!artistEntry && item.artist !== "Artista Desconhecido") {
                     console.warn(`Artista "${item.artist}" (ID: ${item.artistId}) do release "${item.title}" não encontrado.`);
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
        document.body.classList.remove('loading');

        if (data?.allArtists) {
            if (initializeData(data)) {
                console.log("Dados atualizados e UI renderizada.");
                renderRPGChart(); // Renderiza artistas na artistsGrid
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));
                renderChart('music'); renderChart('album');
                if (currentPlayer) populateArtistSelector(currentPlayer.id);
                if (activeArtist && !document.getElementById('artistDetail').classList.contains('hidden')) {
                    console.log(`Atualizando detalhes para ${activeArtist.name} após refresh...`);
                    openArtistDetail(activeArtist.name);
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
        allViews.forEach(view => { view.classList.add('hidden'); });
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden'); window.scrollTo(0, 0);
            if (viewId === 'mainView' && targetSectionId) switchTab(null, targetSectionId);
            if (viewId !== 'mainView' && viewId !== 'studioView') {
                 if (viewHistory.length === 0 || viewHistory[viewHistory.length - 1] !== viewId) viewHistory.push(viewId);
            } else if (viewId === 'mainView') viewHistory = [];
        } else console.error(`View com ID "${viewId}" não encontrada.`);
    };

    /**
     * CORRIGIDO: Simplificado para sempre voltar à mainView se não for studio.
     */
    const switchTab = (event, forceTabId = null) => {
        let tabId;
        if (forceTabId) tabId = forceTabId;
        else if (event) { event.preventDefault(); tabId = event.currentTarget.dataset.tab; }
        else return;

        // Ativa os botões de navegação correspondentes (topo e rodapé)
        document.querySelectorAll('.nav-tab, .bottom-nav-item').forEach(button => button.classList.remove('active'));
        document.querySelectorAll(`.nav-tab[data-tab="${tabId}"], .bottom-nav-item[data-tab="${tabId}"]`).forEach(button => button.classList.add('active'));

        // Se for a aba do estúdio, apenas muda a view principal para studioView
        if (tabId === 'studioSection') {
            switchView('studioView');
            return;
        }

        // Se for QUALQUER OUTRA aba, garante que a mainView está visível
        if (!document.getElementById('mainView').classList.contains('hidden')) {
            // Se já está na mainView, não precisa chamar switchView de novo
        } else {
             switchView('mainView'); // Garante que a mainView apareça
        }


        // Esconde todas as seções de conteúdo DENTRO da mainView
        document.querySelectorAll('#mainView .content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostra a seção de conteúdo correta DENTRO da mainView
        const targetSection = document.getElementById(tabId);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
             console.warn(`Seção de conteúdo com ID "${tabId}" não encontrada dentro da mainView.`);
             // Opcional: Mostrar a homeSection como fallback
             document.getElementById('homeSection')?.classList.add('active');
             document.querySelectorAll(`.nav-tab[data-tab="homeSection"], .bottom-nav-item[data-tab="homeSection"]`).forEach(button => button.classList.add('active'));

        }
    };


    const handleBack = () => { /* ... (sem mudanças) ... */ };
    const renderArtistsGrid = (containerId, artists) => { /* ... (sem mudanças) ... */ };
    function formatArtistString(artistIds, collabType) { /* ... (sem mudanças) ... */ }
    function getCoverUrl(albumId) { /* ... (sem mudanças) ... */ }
    const renderChart = (type) => { /* ... (sem mudanças) ... */ };
    const openArtistDetail = (artistName) => { /* ... (sem mudanças - usa streams aleatórios) ... */ };
    const openAlbumDetail = (albumId) => { /* ... (sem mudanças - sem indicador de faixa principal) ... */ };
    const openDiscographyDetail = (type) => { /* ... (sem mudanças) ... */ };
    const handleSearch = () => { /* ... (sem mudanças) ... */ };
    const setupCountdown = (timerId, callback) => { /* ... (sem mudanças) ... */ };

    // --- 3. SISTEMA DE RPG ---
    const CHART_TOP_N = 20; const STREAMS_PER_POINT = 10000;
    const calculateSimulatedStreams = (points, lastActiveISO) => { /* ... (sem mudanças) ... */ };
    const computeChartData = (artistsArray) => { /* ... (sem mudanças) ... */ };

    /**
     * CORRIGIDO: Adiciona fallback para renderArtistsGrid se chartData for vazio.
     */
    function renderRPGChart() {
        const container = document.getElementById('artistsGrid');
        if (!container) { console.error("Container 'artistsGrid' não encontrado."); return; }

        try { // Adiciona try/catch para cálculo
            const chartData = computeChartData(db.artists);
            console.log("RPG Chart Data:", chartData); // Log para depuração

            if (chartData.length === 0) {
                 console.warn("Nenhum dado para o chart de RPG. Exibindo todos os artistas.");
                 // FALLBACK: Mostra todos os artistas se o chart estiver vazio
                 renderArtistsGrid('artistsGrid', db.artists || []);
                 return;
            }

            container.innerHTML = chartData.map((artist, index) => `
                <div class="artist-card" data-artist-name="${artist.name}">
                    <span class="rpg-rank">#${index + 1}</span>
                    <img src="${artist.img}" alt="${artist.name}" class="artist-card-img">
                    <p class="artist-card-name">${artist.name}</p>
                    <span class="artist-card-type">${(artist.streams || 0).toLocaleString('pt-BR')} streams</span>
                </div>
            `).join('');

        } catch(error) {
             console.error("Erro ao calcular ou renderizar RPG Chart:", error);
             // FALLBACK em caso de erro no cálculo
             container.innerHTML = '<p class="empty-state error-state">Erro ao carregar chart. Exibindo lista padrão.</p>'; // Mensagem de erro
             renderArtistsGrid('artistsGrid', db.artists || []); // Mostra todos
        }
    }


    // --- 4. SISTEMA DO ESTÚDIO ---
    // (Funções populateArtistSelector, loginPlayer, logoutPlayer, populateFeatModalArtistSelect,
    // openFeatModal, closeFeatModal, confirmFeat, initializeStudio, createAirtableRecord,
    // parseDurationToSeconds, handleSingleSubmit, initAlbumForm, addNewTrackInput,
    // updateTrackNumbers, batchCreateAirtableRecords, handleAlbumSubmit - sem mudanças lógicas relevantes para os bugs atuais,
    // mas usando a versão anterior sem Streams/Faixa Principal)

     function populateArtistSelector(playerId) {
        const player = db.players.find(p => p.id === playerId); if (!player) return;
        const artistIds = player.artists || [];
        const artistOptions = artistIds.map(id => { const artist = db.artists.find(a => a.id === id); return artist ? `<option value="${artist.id}">${artist.name}</option>` : ''; }).join('');
        singleArtistSelect.innerHTML = `<option value="">Selecione...</option>${artistOptions}`;
        albumArtistSelect.innerHTML = `<option value="">Selecione...</option>${artistOptions}`;
    }
    function loginPlayer(playerId) {
        if (!playerId) { alert("Selecione um jogador."); return; }
        currentPlayer = db.players.find(p => p.id === playerId);
        if (currentPlayer) {
            document.getElementById('playerName').textContent = currentPlayer.name;
            loginPrompt.classList.add('hidden'); loggedInInfo.classList.remove('hidden');
            studioLaunchWrapper.classList.remove('hidden'); populateArtistSelector(currentPlayer.id);
        }
    }
    function logoutPlayer() {
        currentPlayer = null; document.getElementById('playerName').textContent = '';
        loginPrompt.classList.remove('hidden'); loggedInInfo.classList.add('hidden');
        studioLaunchWrapper.classList.add('hidden');
    }
     function populateFeatModalArtistSelect() {
        let currentMainArtistId = document.getElementById('newSingleForm').classList.contains('active') ? singleArtistSelect.value : albumArtistSelect.value;
        featArtistSelect.innerHTML = db.artists.filter(a => a.id !== currentMainArtistId).sort((a,b) => a.name.localeCompare(b.name)).map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    }
     function openFeatModal(buttonElement) {
        const targetType = buttonElement.dataset.target;
        currentFeatTarget = (targetType === 'single') ? document.getElementById('singleFeatList') : document.getElementById(targetType);
        if (!currentFeatTarget) { console.error("Alvo do feat não encontrado:", targetType); return; }
        populateFeatModalArtistSelect(); featModal.classList.remove('hidden');
    }
     function closeFeatModal() { featModal.classList.add('hidden'); currentFeatTarget = null; }
     function confirmFeat() {
        const artistId = featArtistSelect.value, artistName = featArtistSelect.options[featArtistSelect.selectedIndex].text, featType = featTypeSelect.value;
        if (!artistId || !currentFeatTarget) return;
        const featTag = document.createElement('span'); featTag.className = 'feat-tag'; featTag.textContent = `${featType} ${artistName}`;
        featTag.dataset.artistId = artistId; featTag.dataset.featType = featType; featTag.dataset.artistName = artistName;
        featTag.addEventListener('click', () => featTag.remove());
        if (currentFeatTarget.id === 'singleFeatList') currentFeatTarget.appendChild(featTag);
        else { const trackListItem = currentFeatTarget.closest('.track-list-item'); if (trackListItem) trackListItem.querySelector('.feat-list-album').appendChild(featTag); else console.error("track-list-item pai não encontrado."); }
        closeFeatModal();
    }
     function initializeStudio() {
        if (!playerSelect) return; playerSelect.innerHTML = '<option value="">Selecione...</option>' + db.players.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        loginButton.addEventListener('click', () => loginPlayer(playerSelect.value)); logoutButton.addEventListener('click', logoutPlayer);
        studioTabs.forEach(tab => { tab.addEventListener('click', (e) => { studioTabs.forEach(t => t.classList.remove('active')); studioForms.forEach(f => f.classList.remove('active')); e.currentTarget.classList.add('active'); const formId = e.currentTarget.dataset.form; document.getElementById(formId === 'single' ? 'newSingleForm' : 'newAlbumForm').classList.add('active'); }); });
        confirmFeatBtn.addEventListener('click', confirmFeat); cancelFeatBtn.addEventListener('click', closeFeatModal);
        studioLaunchWrapper.addEventListener('click', (e) => { if (e.target.closest('.add-feat-btn')) openFeatModal(e.target.closest('.add-feat-btn')); });
        addTrackButton.addEventListener('click', addNewTrackInput); initAlbumForm();
    }
     async function createAirtableRecord(tableName, fields) {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: fields }) });
            if (!response.ok) { const errorData = await response.json(); console.error(`Erro ao criar registro em ${tableName}:`, JSON.stringify(errorData, null, 2)); throw new Error(`Airtable error: ${response.status}`); }
            return await response.json();
        } catch (error) { console.error("Falha na requisição para createAirtableRecord:", error); return null; }
    }
     function parseDurationToSeconds(durationStr) { if (!durationStr) return 0; const parts = durationStr.split(':'); if (parts.length !== 2) return 0; const minutes = parseInt(parts[0], 10) || 0; const seconds = parseInt(parts[1], 10) || 0; return (minutes * 60) + seconds; }
     async function handleSingleSubmit(event) {
        event.preventDefault(); const submitBtn = document.getElementById('submitNewSingle'); submitBtn.disabled = true; submitBtn.textContent = 'Enviando...';
        try {
            const artistId = singleArtistSelect.value, singleTitle = document.getElementById('singleTitle').value, coverUrl = document.getElementById('singleCoverUrl').value, releaseDate = singleReleaseDateInput.value, trackName = document.getElementById('trackName').value, trackDurationStr = document.getElementById('trackDuration').value, trackDurationSec = parseDurationToSeconds(trackDurationStr);
            if (!artistId || !singleTitle || !coverUrl || !releaseDate || !trackName || !trackDurationStr) throw new Error("Campos obrigatórios faltando.");
            const singleRecordResponse = await createAirtableRecord('Singles e EPs', { "Nome do Single/EP": singleTitle, "Artista": [artistId], "Capa": [{ "url": coverUrl }], "Data de Lançamento": releaseDate });
            if (!singleRecordResponse?.id) throw new Error("Falha ao criar Single/EP."); const singleRecordId = singleRecordResponse.id;
            const featTags = document.querySelectorAll('#singleFeatList .feat-tag'); let finalTrackName = trackName, finalArtistIds = [artistId], collabType = null;
            if (featTags.length > 0) { const featArtistIds = [], featArtistNames = []; collabType = featTags[0].dataset.featType; featTags.forEach(tag => { featArtistIds.push(tag.dataset.artistId); featArtistNames.push(tag.dataset.artistName); }); if (collabType === "Feat.") { finalTrackName = `${trackName} (feat. ${featArtistNames.join(', ')})`; finalArtistIds = [artistId]; } else if (collabType === "Dueto/Grupo") { finalTrackName = trackName; finalArtistIds = [artistId, ...featArtistIds]; } }
            const musicRecordFields = { "Nome da Faixa": finalTrackName, "Artista": finalArtistIds, "Duração": trackDurationSec, "Nº da Faixa": 1, "Singles e EPs": [singleRecordId] }; if (collabType) musicRecordFields["Tipo de Colaboração"] = collabType;
            console.log('--- DEBUG: Enviando para Músicas (Single) ---', JSON.stringify(musicRecordFields, null, 2));
            const musicRecordResponse = await createAirtableRecord('Músicas', musicRecordFields); if (!musicRecordResponse?.id) throw new Error("Falha ao criar música.");
            alert("Single lançado!"); newSingleForm.reset(); singleReleaseDateInput.value = new Date().toISOString().split('T')[0]; document.getElementById('singleFeatList').innerHTML = ''; await refreshAllData();
        } catch (error) { alert("Erro ao lançar single."); console.error("Erro handleSingleSubmit:", error); } finally { submitBtn.disabled = false; submitBtn.textContent = 'Lançar Single'; }
    }
     function initAlbumForm() {
        addNewTrackInput(); if (albumTracklistEditor && typeof Sortable !== 'undefined') { albumTracklistSortable = Sortable.create(albumTracklistEditor, { animation: 150, handle: '.drag-handle', onEnd: updateTrackNumbers }); } else if (typeof Sortable === 'undefined') { console.warn("SortableJS não carregado."); }
    }
     function addNewTrackInput() {
        const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`; const trackCount = albumTracklistEditor.children.length + 1;
        const newTrackEl = document.createElement('div'); newTrackEl.className = 'track-list-item';
        newTrackEl.innerHTML = `
            <div class="track-main-row">
                <i class="fas fa-bars drag-handle"></i>
                {/* Sem radio button nesta versão */}
                <span class="track-number">${trackCount}.</span>
                <div class="track-inputs">
                    <input type="text" class="track-name-input" placeholder="Nome da Faixa" required>
                    <input type="text" class="track-duration-input" placeholder="MM:SS" pattern="\\d{1,2}:\\d{2}" required>
                </div>
                <button type="button" class="small-btn add-feat-btn" data-target="${trackId}"><i class="fas fa-plus"></i> Feat</button>
                <button type="button" class="small-btn remove-track-btn delete-track-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="feat-section"><div class="feat-list feat-list-album"></div></div>
            <div id="${trackId}" class="feat-target-hidden"></div>`;
        newTrackEl.querySelector('.remove-track-btn').addEventListener('click', () => { newTrackEl.remove(); updateTrackNumbers(); });
        albumTracklistEditor.appendChild(newTrackEl);
    }
     function updateTrackNumbers() {
        const tracks = albumTracklistEditor.querySelectorAll('.track-list-item');
        tracks.forEach((track, index) => { track.querySelector('.track-number').textContent = `${index + 1}.`; });
    }
     async function batchCreateAirtableRecords(tableName, records) {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`; const chunks = [];
        for (let i = 0; i < records.length; i += 10) chunks.push(records.slice(i, i + 10));
        const results = [];
        for (const chunk of chunks) { console.log(`Enviando lote para ${tableName}:`, JSON.stringify(chunk.map(fields => ({ fields })), null, 2)); try { const response = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ "records": chunk.map(fields => ({ fields })) }) }); if (!response.ok) { const errorData = await response.json(); console.error(`Erro lote ${tableName}:`, JSON.stringify(errorData, null, 2)); throw new Error(`Airtable batch error: ${response.status}`); } const data = await response.json(); results.push(...data.records); } catch (error) { console.error("Falha batchCreateAirtableRecords:", error); return null; } } return results;
    }
     async function handleAlbumSubmit(event) {
        event.preventDefault(); const submitBtn = document.getElementById('submitNewAlbum'); submitBtn.disabled = true; submitBtn.textContent = 'Enviando...';
        try {
            const artistId = albumArtistSelect.value, albumTitle = document.getElementById('albumTitle').value, coverUrl = document.getElementById('albumCoverUrl').value, releaseDate = albumReleaseDateInput.value;
            if (!artistId || !albumTitle || !coverUrl || !releaseDate) throw new Error("Campos obrigatórios faltando.");
            const trackElements = albumTracklistEditor.querySelectorAll('.track-list-item'); let totalDurationSec = 0; const musicRecordsToCreate = [];
            for (let index = 0; index < trackElements.length; index++) { const trackEl = trackElements[index]; const trackNameInput = trackEl.querySelector('.track-name-input'), durationStrInput = trackEl.querySelector('.track-duration-input'); if (!trackNameInput || !durationStrInput) continue; const trackName = trackNameInput.value, durationStr = durationStrInput.value; if (!trackName || !durationStr) throw new Error(`Campos faixa ${index + 1} faltando.`); const durationSec = parseDurationToSeconds(durationStr); totalDurationSec += durationSec; const featTags = trackEl.querySelectorAll('.feat-tag'); let finalTrackName = trackName, finalArtistIds = [artistId], collabType = null; if (featTags.length > 0) { const featArtistIds = [], featArtistNames = []; collabType = featTags[0].dataset.featType; featTags.forEach(tag => { featArtistIds.push(tag.dataset.artistId); featArtistNames.push(tag.dataset.artistName); }); if (collabType === "Feat.") { finalTrackName = `${trackName} (feat. ${featArtistNames.join(', ')})`; finalArtistIds = [artistId]; } else if (collabType === "Dueto/Grupo") { finalTrackName = trackName; finalArtistIds = [artistId, ...featArtistIds]; } } const musicRecord = { "Nome da Faixa": finalTrackName, "Artista": finalArtistIds, "Duração": durationSec, "Nº da Faixa": index + 1 /* Sem Streams/Faixa Principal */ }; if (collabType) musicRecord["Tipo de Colaboração"] = collabType; musicRecordsToCreate.push(musicRecord); }
            if (musicRecordsToCreate.length === 0) throw new Error("Nenhuma faixa válida.");
            const isAlbum = totalDurationSec >= (30 * 60); const tableName = isAlbum ? 'Álbuns' : 'Singles e EPs', nameField = isAlbum ? 'Nome do Álbum' : 'Nome do Single/EP', coverField = isAlbum ? 'Capa do Álbum' : 'Capa';
            const releaseRecordResponse = await createAirtableRecord(tableName, { [nameField]: albumTitle, "Artista": [artistId], [coverField]: [{ "url": coverUrl }], "Data de Lançamento": releaseDate }); if (!releaseRecordResponse?.id) throw new Error("Falha criar álbum/EP."); const releaseRecordId = releaseRecordResponse.id;
            const albumLinkFieldNameInMusicas = 'Álbuns'; const singleLinkFieldNameInMusicas = 'Singles e EPs'; const correctLinkField = isAlbum ? albumLinkFieldNameInMusicas : singleLinkFieldNameInMusicas;
            musicRecordsToCreate.forEach(record => { record[correctLinkField] = [releaseRecordId]; });
            const createdSongs = await batchCreateAirtableRecords('Músicas', musicRecordsToCreate); if (!createdSongs || createdSongs.length !== musicRecordsToCreate.length) { console.error("Álbum/EP criado, mas falha criar músicas."); throw new Error("Falha criar faixas."); }
            alert("Álbum/EP lançado!"); newAlbumForm.reset(); albumReleaseDateInput.value = new Date().toISOString().split('T')[0]; albumTracklistEditor.innerHTML = ''; initAlbumForm(); await refreshAllData();
        } catch (error) { alert("Erro ao lançar álbum/EP."); console.error("Erro handleAlbumSubmit:", error); } finally { submitBtn.disabled = false; submitBtn.textContent = 'Lançar Álbum / EP'; }
    }



    // --- 5. INICIALIZAÇÃO GERAL ---

    function initializeBodyClickListener() { /* ... (sem mudanças) ... */ }

    async function main() {
        console.log("Iniciando Aplicação...");
        if (!initializeDOMElements()) return;
        document.body.classList.add('loading');
        const data = await loadAllData();
        document.body.classList.remove('loading');

        if (data?.allArtists) {
            if (!initializeData(data)) return;
            try {
                initializeStudio();
                if (newSingleForm) newSingleForm.addEventListener('submit', handleSingleSubmit);
                if (newAlbumForm) newAlbumForm.addEventListener('submit', handleAlbumSubmit);
                renderRPGChart(); // Renderiza artistas (ou fallback)
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
            } catch (uiError) {
                 console.error("Erro fatal durante a inicialização da UI:", uiError);
                 document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Fatal na UI</h1><p>${uiError.message}</p><p>Verifique o console.</p></div>`;
            }
        } else {
             if (!document.body.innerHTML.includes('Erro Crítico')) {
                document.body.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h1>Erro Crítico</h1><p>Não foi possível carregar os dados essenciais.</p></div>';
            }
             console.error("Initialization failed due to critical data loading error (data object is null or missing allArtists).");
        }
    }

    // Executa main e captura erros não esperados
    main().catch(err => {
         console.error("Erro não capturado na execução principal:", err);
         document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Inesperado</h1><p>${err.message}</p><p>Verifique o console.</p></div>`;
    });

});
