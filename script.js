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
                 errorDiv.innerHTML = '<h1>Erro de Interface</h1><p>Elementos essenciais não encontrados. Verifique IDs no console.</p>';
                 document.body.prepend(errorDiv);
                 return false;
            }

            const today = new Date().toISOString().split('T')[0];
            if(singleReleaseDateInput) singleReleaseDateInput.value = today;
            if(albumReleaseDateInput) albumReleaseDateInput.value = today;

            console.log("DOM elements initialized.");
            return true;
        } catch (error) {
            console.error("Erro durante initializeDOMElements:", error);
            document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Fatal DOM</h1><p>${error.message}</p></div>`;
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
                    // console.log(`  -> Fetched ${data.records.length} records... Total: ${allRecords.length}`); // Reduce logging noise
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
                    id: record.id, title: fields['Nome da Faixa'] || 'Faixa Sem Título',
                    duration: fields['Duração'] ? new Date(fields['Duração'] * 1000).toISOString().substr(14, 5) : "00:00",
                    trackNumber: fields['Nº da Faixa'] || 0, durationSeconds: fields['Duração'] || 0,
                    artistIds: artistIds, collabType: fields['Tipo de Colaboração'], albumId: parentReleaseId
                    // Removido streams/isMainTrack desta versão
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
                        tracks: tracks, totalDurationSeconds: totalDurationSeconds, isAlbum: isAlbumTable
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
            document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Crítico Dados</h1><p>${error.message}</p></div>`;
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
                streams: Math.floor(Math.random() * 25000000) + 50000, // Streams aleatórios
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
                    else console.warn(`Song ID ${trackInfo.id} do release "${item.title}" não encontrado.`);
                });
                const artistEntry = db.artists.find(a => a.id === item.artistId);
                if (item.isAlbum && (item.totalDurationSeconds || 0) >= thirtyMinutesInSeconds) {
                    db.albums.push(item);
                    if (artistEntry) artistEntry.albums.push(item);
                } else {
                    db.singles.push(item);
                    if (artistEntry) artistEntry.singles.push(item);
                }
                if (!artistEntry && item.artist !== "Artista Desconhecido") console.warn(`Artista "${item.artist}" (ID: ${item.artistId}) do release "${item.title}" não encontrado.`);
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


    async function refreshAllData() {
        console.log("Atualizando todos os dados...");
        document.body.classList.add('loading');
        const data = await loadAllData();
        document.body.classList.remove('loading');
        if (data?.allArtists) {
            if (initializeData(data)) {
                console.log("Dados atualizados e UI renderizada.");
                renderRPGChart(); // Renderiza artistas na artistsGrid (ou fallback)
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));
                renderChart('music'); renderChart('album');
                if (currentPlayer) populateArtistSelector(currentPlayer.id);
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

        console.log(`Switching tab to: ${tabId}`); // Log para depuração

        // Ativa os botões de navegação correspondentes
        document.querySelectorAll('.nav-tab, .bottom-nav-item').forEach(button => button.classList.remove('active'));
        document.querySelectorAll(`.nav-tab[data-tab="${tabId}"], .bottom-nav-item[data-tab="${tabId}"]`).forEach(button => button.classList.add('active'));

        // Se for a aba do estúdio, apenas muda a view principal para studioView
        if (tabId === 'studioSection') {
            switchView('studioView');
            return; // Sai da função aqui
        }

        // Se for QUALQUER OUTRA aba (Início, Top Músicas, etc.)
        // Garante que a mainView esteja visível ANTES de mexer nas seções internas
        if (document.getElementById('mainView').classList.contains('hidden')) {
             switchView('mainView'); // Mostra a mainView (esconde a studioView)
        }

        // Esconde todas as seções de conteúdo DENTRO da mainView
        document.querySelectorAll('#mainView .content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostra a seção de conteúdo correta DENTRO da mainView
        const targetSection = document.getElementById(tabId);
        if (targetSection) {
            console.log(`Activating content section: ${tabId}`); // Log
            targetSection.classList.add('active');
        } else {
             console.warn(`Seção de conteúdo com ID "${tabId}" não encontrada. Ativando homeSection.`);
             // Fallback para homeSection se a seção não for encontrada
             document.getElementById('homeSection')?.classList.add('active');
             // Corrige botões de navegação para home se houve fallback
             document.querySelectorAll('.nav-tab, .bottom-nav-item').forEach(button => button.classList.remove('active'));
             document.querySelectorAll(`.nav-tab[data-tab="homeSection"], .bottom-nav-item[data-tab="homeSection"]`).forEach(button => button.classList.add('active'));
        }
    };


    const handleBack = () => { viewHistory.pop(); const previousViewId = viewHistory.pop() || 'mainView'; switchView(previousViewId); };
    const renderArtistsGrid = (containerId, artists) => { /* ... (sem mudanças) ... */ };
    function formatArtistString(artistIds, collabType) { /* ... (sem mudanças) ... */ }
    function getCoverUrl(albumId) { /* ... (sem mudanças) ... */ }
    const renderChart = (type) => { /* ... (sem mudanças - usa streams aleatórios) ... */ };
    const openArtistDetail = (artistName) => { /* ... (sem mudanças - usa streams aleatórios) ... */ };
    const openAlbumDetail = (albumId) => { /* ... (sem mudanças - sem indicador de faixa principal) ... */ };
    const openDiscographyDetail = (type) => { /* ... (sem mudanças) ... */ };
    const handleSearch = () => { /* ... (sem mudanças) ... */ };
    const setupCountdown = (timerId, callback) => { /* ... (sem mudanças) ... */ };

    // --- 3. SISTEMA DE RPG ---
    const CHART_TOP_N = 20; const STREAMS_PER_POINT = 10000;

    /**
     * CORRIGIDO: Adiciona validação para datas inválidas e NaN.
     */
    const calculateSimulatedStreams = (points, lastActiveISO) => {
        if (!lastActiveISO) return 0;
        const now = new Date();
        const lastActive = new Date(lastActiveISO);

        // Verifica se a data é válida
        if (isNaN(lastActive.getTime())) {
            console.warn(`Data LastActive inválida para artista: ${lastActiveISO}`);
            return 0;
        }

        const diffHours = Math.abs(now - lastActive) / 3600000;
        // Verifica se diffHours é um número
        if (isNaN(diffHours)) {
             console.warn(`Cálculo de diffHours resultou em NaN. Now: ${now}, LastActive: ${lastActive}`);
             return 0;
        }

        const streamsPerDay = (points || 0) * STREAMS_PER_POINT;
        const streamsPerHour = streamsPerDay / 24;
        const calculatedStreams = streamsPerHour * diffHours;

         // Verifica se o resultado final é um número
        return isNaN(calculatedStreams) ? 0 : Math.floor(calculatedStreams);
    };

    /**
     * CORRIGIDO: Garante que sempre retorna um array e trata streams NaN no sort.
     */
    const computeChartData = (artistsArray) => {
        // Garante que artistsArray é um array
        if (!Array.isArray(artistsArray)) {
            console.error("computeChartData recebeu algo que não é um array:", artistsArray);
            return []; // Retorna array vazio em caso de erro
        }

        try { // Adiciona try/catch interno para mapeamento
            const mappedData = artistsArray.map(artist => {
                // Adiciona fallback para artist caso seja inválido
                if (!artist || typeof artist !== 'object') return null;

                const simulatedStreams = calculateSimulatedStreams(artist.RPGPoints, artist.LastActive);
                return {
                    id: artist.id,
                    name: artist.name || 'Nome Indisponível', // Fallback para nome
                    img: artist.img || artist.imageUrl || 'https://i.imgur.com/AD3MbBi.png', // Fallback para img
                    streams: isNaN(simulatedStreams) ? 0 : simulatedStreams, // Trata NaN
                    points: artist.RPGPoints || 0
                };
            }).filter(Boolean); // Remove entradas nulas se houver artistas inválidos

             // Ordena tratando NaN como 0
            return mappedData.sort((a, b) => (b.streams || 0) - (a.streams || 0))
                       .slice(0, CHART_TOP_N);

        } catch (mapError) {
             console.error("Erro dentro do .map em computeChartData:", mapError);
             return []; // Retorna array vazio se o map falhar
        }
    };


    /**
     * CORRIGIDO: Adiciona fallback e log mais claro.
     */
    function renderRPGChart() {
        const container = document.getElementById('artistsGrid');
        if (!container) { console.error("Container 'artistsGrid' não encontrado."); return; }

        try {
            console.log("Calculando RPG Chart com db.artists:", db.artists); // Log antes de chamar
            const chartData = computeChartData(db.artists);
            console.log("RPG Chart Data (resultado):", chartData); // Log do resultado

            // Verifica se chartData é um array ANTES de acessar length
            if (!Array.isArray(chartData) || chartData.length === 0) {
                 console.warn("Nenhum dado para o chart de RPG ou erro no cálculo. Exibindo todos os artistas.");
                 renderArtistsGrid('artistsGrid', db.artists || []); // Fallback
                 return;
            }

            // Se chartData é um array válido e tem itens, renderiza o chart
            container.innerHTML = chartData.map((artist, index) => `
                <div class="artist-card" data-artist-name="${artist.name}">
                    <span class="rpg-rank">#${index + 1}</span>
                    <img src="${artist.img}" alt="${artist.name}" class="artist-card-img">
                    <p class="artist-card-name">${artist.name}</p>
                    <span class="artist-card-type">${(artist.streams || 0).toLocaleString('pt-BR')} streams</span>
                </div>
            `).join('');

        } catch(error) { // Pega erros inesperados durante o processo
             console.error("Erro ao calcular ou renderizar RPG Chart:", error);
             container.innerHTML = '<p class="empty-state error-state">Erro ao carregar chart. Exibindo lista padrão.</p>';
             renderArtistsGrid('artistsGrid', db.artists || []); // Fallback mais robusto
        }
    }


    // --- 4. SISTEMA DO ESTÚDIO ---
    // (Funções do estúdio - sem streams/faixa principal nesta versão)
     function populateArtistSelector(playerId) { /* ... */ }
     function loginPlayer(playerId) { /* ... */ }
     function logoutPlayer() { /* ... */ }
     function populateFeatModalArtistSelect() { /* ... */ }
     function openFeatModal(buttonElement) { /* ... */ }
     function closeFeatModal() { /* ... */ }
     function confirmFeat() { /* ... */ }
     function initializeStudio() { /* ... */ }
     async function createAirtableRecord(tableName, fields) { /* ... */ }
     function parseDurationToSeconds(durationStr) { /* ... */ }
     async function handleSingleSubmit(event) { /* ... */ } // Usa versão anterior sem streams
     function initAlbumForm() { /* ... */ }
     function addNewTrackInput() { /* ... */ } // Usa versão anterior sem radio button
     function updateTrackNumbers() { /* ... */ }
     async function batchCreateAirtableRecords(tableName, records) { /* ... */ }
     async function handleAlbumSubmit(event) { /* ... */ } // Usa versão anterior sem streams/faixa principal


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
        const data = await loadAllData();
        document.body.classList.remove('loading');

        if (data?.allArtists) {
            if (!initializeData(data)) return;
            try {
                initializeStudio();
                if (newSingleForm) newSingleForm.addEventListener('submit', handleSingleSubmit);
                if (newAlbumForm) newAlbumForm.addEventListener('submit', handleAlbumSubmit);

                // Chama renderRPGChart DEPOIS de adicionar listeners e inicializar studio
                renderRPGChart(); // Renderiza artistas (ou fallback)

                const allNavs = [...document.querySelectorAll('.nav-tab'), ...document.querySelectorAll('.bottom-nav-item')];
                allNavs.forEach(nav => { nav.removeEventListener('click', switchTab); nav.addEventListener('click', switchTab); });
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));
                renderChart('music'); renderChart('album');
                setupCountdown('musicCountdownTimer', () => renderChart('music'));
                setupCountdown('albumCountdownTimer', () => renderChart('album'));
                initializeBodyClickListener();
                document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', handleBack));

                // Garante que a aba inicial seja exibida corretamente
                switchTab(null, 'homeSection');

                console.log("Aplicação Iniciada e Configurada.");
            } catch (uiError) {
                 console.error("Erro fatal durante a inicialização da UI:", uiError);
                 document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Fatal na UI</h1><p>${uiError.message}</p></div>`;
            }
        } else {
             if (!document.body.innerHTML.includes('Erro Crítico')) { // Evita duplicar msg
                document.body.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h1>Erro Crítico</h1><p>Não foi possível carregar os dados essenciais.</p></div>';
            }
             console.error("Initialization failed: loadAllData did not return valid data.");
        }
    }

    // Executa main e captura erros não esperados
    main().catch(err => {
         console.error("Erro não capturado na execução principal:", err);
         document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Erro Inesperado</h1><p>${err.message}</p></div>`;
         document.body.classList.remove('loading'); // Garante remover loading em caso de erro fatal
    });

});
