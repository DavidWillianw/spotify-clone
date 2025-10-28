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
    let repeatMode = 'none'; // 'none', 'all', 'one'

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
        editingTrackExistingId,
        inlineFeatAdder, inlineFeatArtistSelect, inlineFeatTypeSelect,
        confirmInlineFeatBtn, cancelInlineFeatBtn, addInlineFeatBtn,
        editReleaseSection, editReleaseListContainer, editReleaseList, editReleaseForm,
        editReleaseId, editReleaseType, editReleaseTableName, editArtistNameDisplay,
        editReleaseTitle, editReleaseCoverUrl, editReleaseDate, cancelEditBtn, saveEditBtn,
        deleteConfirmModal, deleteReleaseName, deleteRecordId, deleteTableName,
        deleteTrackIds, cancelDeleteBtn, confirmDeleteBtn,
        toggleExistingSingle, newTrackInfoGroup, existingTrackGroup,
        existingTrackSelect, existingSingleTrackId, singleFeatSection,
        openExistingTrackModalBtn, existingTrackModal, existingTrackSearch,
        existingTrackResults, cancelExistingTrackBtn, editArtistFilterSelect;


    const AIRTABLE_BASE_ID = 'appG5NOoblUmtSMVI';
    const AIRTABLE_API_KEY = 'pat5T28kjmJ4t6TQG.69bf34509e687fff6a3f76bd52e64518d6c92be8b1ee0a53bcc9f50fedcb5c70'; // Use sua chave real aqui

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
             playerSelect = document.getElementById('playerSelect'); // Note: This ID doesn't seem to be used later
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
             addInlineFeatBtn = albumTrackModal?.querySelector('.add-inline-feat-btn'); // Needs albumTrackModal to exist
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
                // Optionally provide more details which element is missing
                return false;
            }

            const essentialElements = [
                studioView, loginPrompt, newSingleForm, newAlbumForm, featModal,
                singleReleaseDateInput, albumReleaseDateInput, trackTypeModal,
                albumTrackModal, openAddTrackModalBtn, inlineFeatAdder, inlineFeatArtistSelect,
                confirmInlineFeatBtn, cancelInlineFeatBtn, addInlineFeatBtn,
                editReleaseSection, editReleaseListContainer, editReleaseList, editReleaseForm,
                cancelEditBtn, saveEditBtn,
                deleteConfirmModal, cancelDeleteBtn, confirmDeleteBtn,
                toggleExistingSingle, newTrackInfoGroup, existingTrackGroup, existingTrackSelect,
                openExistingTrackModalBtn, existingTrackModal, existingTrackSearch, existingTrackResults, cancelExistingTrackBtn, editArtistFilterSelect
            ];

            if (!allViews || allViews.length === 0 || essentialElements.some(el => !el)) {
                 const missingIds = essentialElements
                    .map((el, index) => {
                        // Attempt to find the ID from a predefined list or attribute
                        const expectedId = [ // Correlate index with expected ID (maintain this list)
                            'studioView', 'loginPrompt', 'newSingleForm', 'newAlbumForm', 'featModal',
                            'singleReleaseDate', 'albumReleaseDate', 'trackTypeModal',
                            'albumTrackModal', 'openAddTrackModalBtn', 'inlineFeatAdder', 'inlineFeatArtistSelect',
                            'confirmInlineFeatBtn', 'cancelInlineFeatBtn', /*addInlineFeatBtn has no ID*/ 'addInlineFeatBtn_placeholder',
                            'editReleaseSection', 'editReleaseListContainer', 'editReleaseList', 'editReleaseForm',
                            'cancelEditBtn', 'saveEditBtn',
                            'deleteConfirmModal', 'cancelDeleteBtn', 'confirmDeleteBtn',
                            'toggleExistingSingle', 'newTrackInfoGroup', 'existingTrackGroup', 'existingTrackSelect',
                            'openExistingTrackModalBtn', 'existingTrackModal', 'existingTrackSearch', 'existingTrackResults', 'cancelExistingTrackBtn', 'editArtistFilterSelect'
                        ][index];
                        return el ? null : expectedId || `Unknown Element at index ${index}`;
                    })
                    .filter(Boolean); // Remove nulls (found elements)

                console.error("ERRO CRÍTICO: Elementos essenciais do HTML não foram encontrados!", { missingIds });
                document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Interface</h1><p>Elementos essenciais não encontrados. Ver console.</p></div>';
                return false;
            }


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
            document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Interface</h1><p>Erro fatal ao buscar elementos da página. Verifique o console.</p></div>';
            return false;
        }
    }

    // --- 1. CARREGAMENTO DE DADOS ---
    async function fetchAllAirtablePages(baseUrl, fetchOptions) {
        let allRecords = [];
        let offset = null;
        do {
            const separator = baseUrl.includes('?') ? '&' : '?';
            const url = offset ? `${baseUrl}${separator}offset=${offset}` : baseUrl;
            const response = await fetch(url, fetchOptions);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Falha ao buscar ${url}: ${response.status} - ${errorText}`);
                throw new Error(`Falha na requisição para ${baseUrl}. Status: ${response.status}`);
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
        const albumsURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Álbuns')}`;
        const musicasURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Músicas')}`;
        const singlesURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Singles e EPs')}`;
        const playersURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Jogadores`;

        const fetchOptions = { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } };
        console.log("Carregando dados do Airtable...");
        try {
            const [artistsData, albumsData, musicasData, singlesData, playersData] = await Promise.all([
                fetchAllAirtablePages(artistsURL, fetchOptions),
                fetchAllAirtablePages(albumsURL, fetchOptions),
                fetchAllAirtablePages(musicasURL, fetchOptions),
                fetchAllAirtablePages(singlesURL, fetchOptions),
                fetchAllAirtablePages(playersURL, fetchOptions)
            ]);

            if (!playersData) console.warn("Falha ao carregar dados dos Jogadores. Continuando sem eles."); // Warn instead of error
            if (!artistsData || !albumsData || !musicasData || !singlesData) throw new Error('Falha ao carregar dados essenciais (Artistas, Álbuns, Músicas, Singles).');

            const musicasMap = new Map();
            (musicasData.records || []).forEach(record => {
                const fields = record.fields;
                const artistIds = Array.isArray(fields['Artista']) ? fields['Artista'] : [fields['Artista']].filter(Boolean);
                const albumLinks = fields['Álbuns'] || [];
                const singleLinks = fields['Singles e EPs'] || [];
                // Prioritize album link for parent ID, then single link
                const parentReleaseId = (albumLinks.length > 0 ? albumLinks[0] : (singleLinks.length > 0 ? singleLinks[0] : null));

                musicasMap.set(record.id, {
                    id: record.id,
                    title: fields['Nome da Faixa'] || 'Faixa Desconhecida',
                    duration: fields['Duração'] ? new Date(fields['Duração'] * 1000).toISOString().substr(14, 5) : "0:00",
                    trackNumber: fields['Nº da Faixa'] || 0,
                    durationSeconds: fields['Duração'] || 0,
                    artistIds: artistIds,
                    collabType: fields['Tipo de Colaboração'],
                    albumId: parentReleaseId, // ID do release principal (para capa, etc.)
                    albumIds: albumLinks, // Todos os álbuns vinculados
                    singleIds: singleLinks, // Todos os singles vinculados
                    streams: fields.Streams || 0,
                    totalStreams: fields['Streams Totais'] || 0,
                    trackType: fields['Tipo de Faixa'] || 'B-side' // Default to B-side if missing
                });
            });

            const artistsMapById = new Map();
            const artistsList = (artistsData.records || []).map(record => {
                const fields = record.fields;
                const artist = {
                    id: record.id,
                    name: fields.Name || 'Artista Desconhecido',
                    imageUrl: (fields['URL da Imagem']?.[0]?.url) || 'https://i.imgur.com/AD3MbBi.png', // Default image
                    off: fields['Inspirações (Off)'] || [],
                    RPGPoints: fields.RPGPoints || 0,
                    LastActive: fields.LastActive || null
                };
                artistsMapById.set(artist.id, artist.name);
                return artist;
            });

            const formatReleases = (records, isAlbum) => {
                if (!records) return [];
                return records.map(record => {
                    const fields = record.fields;
                    const id = record.id;
                    // Find associated tracks from the map
                    const tracks = Array.from(musicasMap.values())
                        .filter(song => (isAlbum ? song.albumIds.includes(id) : song.singleIds.includes(id)))
                        .sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0)); // Sort by track number

                    const totalDuration = tracks.reduce((sum, track) => sum + (track.durationSeconds || 0), 0);
                    const totalAlbumStreams = tracks.reduce((sum, track) => sum + (track.totalStreams || 0), 0);

                    const artistId = Array.isArray(fields['Artista']) ? fields['Artista'][0] : (fields['Artista'] || null);
                    const artistName = artistId ? artistsMapById.get(artistId) : "Artista Desconhecido";
                    const imageFieldName = isAlbum ? 'Capa do Álbum' : 'Capa';
                    const imageUrl = (fields[imageFieldName]?.[0]?.url) || 'https://i.imgur.com/AD3MbBi.png'; // Default image

                    // Airtable DATETIME fields return ISO 8601 UTC strings
                    const releaseDateISO = fields['Data de Lançamento'] || null;

                    return {
                        id: id,
                        title: fields['Nome do Álbum'] || fields['Nome do Single/EP'] || 'Título Desconhecido',
                        artist: artistName,
                        artistId: artistId,
                        metascore: fields['Metascore'] || 0,
                        imageUrl: imageUrl,
                        releaseDate: releaseDateISO, // Store the full ISO 8601 string
                        tracks: tracks,
                        trackIds: tracks.map(t => t.id),
                        totalDurationSeconds: totalDuration,
                        weeklyStreams: fields['Stream do album'] || 0, // Ensure field name matches Airtable
                        totalStreams: totalAlbumStreams,
                        type: isAlbum ? 'album' : 'single',
                        tableName: isAlbum ? 'Álbuns' : 'Singles e EPs'
                    };
                });
            };

            const formattedAlbums = formatReleases(albumsData.records, true);
            const formattedSingles = formatReleases(singlesData.records, false);

            const formattedPlayers = (playersData?.records || []).map(record => ({
                id: record.id,
                name: record.fields.Nome,
                password: record.fields.Senha, // Be mindful of storing/transmitting passwords
                artists: record.fields.Artistas || []
            }));

            console.log("Dados do Airtable carregados e formatados.");
            return {
                allArtists: artistsList,
                albums: formattedAlbums,
                singles: formattedSingles,
                players: formattedPlayers,
                musicas: Array.from(musicasMap.values()) // Convert map values back to array
            };
        } catch (error) {
            console.error("Falha GERAL ao carregar dados do Airtable:", error);
            // Optionally display a user-friendly error message on the page
            document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Crítico</h1><p>Não foi possível carregar os dados. Tente recarregar a página ou contate o suporte.</p></div>';
            return null; // Indicate failure
        }
    }


    // initializeData
    const initializeData = (data) => {
        try {
            // Load previous chart data from localStorage
            try {
                const prevMusic = localStorage.getItem(PREVIOUS_MUSIC_CHART_KEY);
                previousMusicChartData = prevMusic ? JSON.parse(prevMusic) : {};
                const prevAlbum = localStorage.getItem(PREVIOUS_ALBUM_CHART_KEY);
                previousAlbumChartData = prevAlbum ? JSON.parse(prevAlbum) : {};
                const prevRpg = localStorage.getItem(PREVIOUS_RPG_CHART_KEY);
                previousRpgChartData = prevRpg ? JSON.parse(prevRpg) : {};
                console.log("Dados de chart anteriores carregados do localStorage.");
            } catch (e) {
                console.warn("Erro ao carregar dados de chart anteriores do localStorage:", e);
                // Reset to empty objects if parsing fails
                previousMusicChartData = {}; previousAlbumChartData = {}; previousRpgChartData = {};
            }

            // Map artists by ID for quick lookup
            const artistsMapById = new Map();
            db.artists = (data.allArtists || []).map(artist => {
                const artistEntry = {
                    ...artist,
                    img: artist.imageUrl || 'https://i.imgur.com/AD3MbBi.png', // Ensure default image
                    albums: [], // Initialize empty arrays for releases
                    singles: []
                };
                artistsMapById.set(artist.id, artist.name);
                return artistEntry;
            });

            // Create a map of release IDs to their release dates (full ISO string)
            const releaseDateMap = new Map();
            const allReleasesForDateMap = [...(data.albums || []), ...(data.singles || [])];
            allReleasesForDateMap.forEach(item => {
                if (item.id && item.releaseDate) {
                    releaseDateMap.set(item.id, item.releaseDate);
                }
            });

            // Process songs to find the earliest release date among linked releases
            db.songs = (data.musicas || []).map(song => {
                const allLinkedIds = [...(song.albumIds || []), ...(song.singleIds || [])];
                let earliestDate = null;

                if (allLinkedIds.length > 0) {
                    const allDates = allLinkedIds
                        .map(id => releaseDateMap.get(id)) // Get ISO strings from the map
                        .filter(Boolean) // Filter out null/undefined dates
                        .map(dateStr => new Date(dateStr)); // Convert ISO strings to Date objects

                    if (allDates.length > 0) {
                        // Filter out invalid dates that might result from bad data
                        const validDates = allDates.filter(d => !isNaN(d.getTime()));
                        if (validDates.length > 0) {
                            // Find the minimum (earliest) date
                            earliestDate = new Date(Math.min.apply(null, validDates));
                        }
                    }
                }
                // Store the earliest date as a full ISO 8601 string, or null if none found
                const earliestDateString = earliestDate ? earliestDate.toISOString() : null;

                return {
                    ...song,
                    streams: song.streams || 0,
                    totalStreams: song.totalStreams || 0,
                    cover: 'https://i.imgur.com/AD3MbBi.png', // Default cover, will be updated later
                    artist: artistsMapById.get((song.artistIds || [])[0]) || 'Artista Desconhecido', // Primary artist name
                    parentReleaseDate: earliestDateString // Store the EARLIEST release date (ISO String or null)
                };
            });

            // Initialize albums and singles arrays
            db.albums = [];
            db.singles = [];

            // Process all releases (albums and singles)
            const allReleases = [...(data.albums || []), ...(data.singles || [])];
            allReleases.forEach(item => {
                // Update covers and potentially albumId/parentReleaseDate for associated songs
                (item.trackIds || []).forEach(trackId => {
                    const songInDb = db.songs.find(sDb => sDb.id === trackId);
                    if (songInDb) {
                        // If the song's primary albumId matches this item and cover is default, update cover
                        if (songInDb.albumId === item.id && songInDb.cover === 'https://i.imgur.com/AD3MbBi.png') {
                            songInDb.cover = item.imageUrl;
                        }
                        // If song has no albumId yet, assign this item's ID and cover (if default)
                        else if (!songInDb.albumId) {
                            if (songInDb.cover === 'https://i.imgur.com/AD3MbBi.png') {
                                songInDb.cover = item.imageUrl;
                            }
                            songInDb.albumId = item.id;
                            // Note: parentReleaseDate was already set to the earliest date found
                        }
                        // Fallback: If song still has no parentReleaseDate, try to set it from this release
                        if (!songInDb.parentReleaseDate && item.releaseDate) {
                             console.warn(`Song ${songInDb.id} lacked parentReleaseDate, setting from ${item.id}`);
                            songInDb.parentReleaseDate = item.releaseDate;
                        }
                    }
                });

                // Add the release to the correct array (db.albums or db.singles)
                // and associate it with the primary artist
                const artistEntry = db.artists.find(a => a.id === item.artistId);
                if (item.type === 'album') {
                    db.albums.push(item);
                    if (artistEntry) { artistEntry.albums.push(item); }
                } else {
                    db.singles.push(item);
                    if (artistEntry) { artistEntry.singles.push(item); }
                }
                // Log warning if artist wasn't found in the main artist list
                if (!artistEntry && item.artist !== "Artista Desconhecido") {
                    console.warn(`Artista ${item.artist} (ID: ${item.artistId}) para o lançamento ${item.title} (ID: ${item.id}) não encontrado na lista principal de artistas.`);
                }
            });

            // Assign players data
            db.players = data.players || [];

            console.log(`DB Initialized: Artists: ${db.artists.length}, Albums: ${db.albums.length}, Singles: ${db.singles.length}, Songs: ${db.songs.length}, Players: ${db.players.length}`);
            return true; // Indicate successful initialization
        } catch (error) {
            console.error("ERRO CRÍTICO durante initializeData:", error);
            alert("Erro grave ao processar os dados carregados. A aplicação pode não funcionar corretamente.");
            return false; // Indicate failure
        }
    };


    // saveChartDataToLocalStorage
    const saveChartDataToLocalStorage = (chartType) => {
        let currentChartData, storageKey, dataList;
        console.log(`Salvando dados do chart anterior para: ${chartType}`);

        const now = new Date(); // Get current time for filtering released items

        if (chartType === 'music') {
            storageKey = PREVIOUS_MUSIC_CHART_KEY;
            // Filter songs with streams > 0 AND released before or at the current time
             dataList = [...db.songs]
                .filter(song => (song.streams || 0) > 0 && song.parentReleaseDate && new Date(song.parentReleaseDate) <= now)
                .sort((a, b) => (b.streams || 0) - (a.streams || 0))
                .slice(0, 50);
            currentChartData = dataList.reduce((acc, item, index) => { acc[item.id] = index + 1; return acc; }, {});
            previousMusicChartData = currentChartData; // Update in-memory cache

        } else if (chartType === 'album') {
            storageKey = PREVIOUS_ALBUM_CHART_KEY;
            // Filter releases with weekly streams > 0 AND released before or at the current time
             dataList = [...db.albums, ...db.singles]
                .filter(item => (item.weeklyStreams || 0) > 0 && item.releaseDate && new Date(item.releaseDate) <= now)
                .sort((a, b) => (b.weeklyStreams || 0) - (a.weeklyStreams || 0))
                .slice(0, 50);
            currentChartData = dataList.reduce((acc, item, index) => { acc[item.id] = index + 1; return acc; }, {});
            previousAlbumChartData = currentChartData; // Update in-memory cache

        } else if (chartType === 'rpg') {
            storageKey = PREVIOUS_RPG_CHART_KEY;
            dataList = computeChartData(db.artists); // computeChartData handles its own logic
            currentChartData = dataList.reduce((acc, item, index) => { acc[item.id] = index + 1; return acc; }, {});
            previousRpgChartData = currentChartData; // Update in-memory cache

        } else {
            console.error("Tipo de chart inválido para salvar:", chartType);
            return;
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(currentChartData));
            console.log(`Chart ${chartType} salvo no localStorage.`);
        } catch (e) {
            console.error(`Erro ao salvar chart ${chartType} no localStorage:`, e);
            // Consider implications: if localStorage is full or restricted
        }
    };

    // refreshAllData
    async function refreshAllData() {
        console.log("Atualizando todos os dados...");
        document.body.classList.add('loading'); // Show loading indicator
        const data = await loadAllData();

        if (data && data.allArtists) { // Check if essential data was loaded
            if (initializeData(data)) { // Process the loaded data
                console.log("Dados atualizados e processados localmente.");

                // Re-render components that depend on the data
                renderRPGChart();
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10)); // Re-render home grid with random artists
                renderChart('music');
                renderChart('album');

                // Update studio elements if player is logged in
                if (currentPlayer) {
                    populateArtistSelector(currentPlayer.id); // Repopulate artist dropdowns

                    // If the 'Edit' tab is active, refresh the list of editable releases
                    if (document.querySelector('.studio-tab-btn[data-form="edit"]')?.classList.contains('active')) {
                        populateEditableReleases();
                         editReleaseForm?.classList.add('hidden'); // Ensure edit form is hidden initially
                         editReleaseListContainer?.classList.remove('hidden'); // Show the list
                    }
                    // Repopulate the 'existing track' dropdown for singles if it's currently visible
                    if (toggleExistingSingle?.checked) {
                        populatePlayerTracks('existingTrackSelect');
                    }
                }

                // If currently viewing an artist detail page, refresh it
                const artistDetailView = document.getElementById('artistDetail');
                if (activeArtist && artistDetailView && !artistDetailView.classList.contains('hidden')) {
                    const refreshedArtistData = db.artists.find(a => a.id === activeArtist.id);
                    if (refreshedArtistData) {
                        openArtistDetail(refreshedArtistData.name); // Re-open with updated data
                    } else {
                        console.warn("Artista ativo não encontrado após atualização, voltando.");
                        handleBack(); // Go back if the artist somehow disappeared
                    }
                }
                 // If currently viewing an album detail page, refresh it (important for countdowns ending)
                 const albumDetailView = document.getElementById('albumDetail');
                 const currentAlbumId = albumDetailView?.querySelector('[data-album-id]')?.dataset.albumId; // Attempt to find current album ID if view open
                 if (currentAlbumId && !albumDetailView.classList.contains('hidden')) {
                      const refreshedAlbumData = [...db.albums, ...db.singles].find(a => a.id === currentAlbumId);
                      if (refreshedAlbumData) {
                           openAlbumDetail(refreshedAlbumData.id); // Re-open with updated data
                      } else {
                           console.warn("Álbum/Single ativo não encontrado após atualização, voltando.");
                           handleBack();
                      }
                 }


                // Re-attach essential navigation listeners (important if elements were re-rendered)
                try {
                    attachNavigationListeners();
                } catch (listenerError) {
                    console.error("Erro ao reatribuir listeners de navegação após atualização:", listenerError);
                }

                document.body.classList.remove('loading'); // Hide loading indicator
                console.log("Atualização concluída.");
                return true; // Indicate success
            } else {
                 console.error("Falha ao inicializar dados após atualização.");
                 alert("Erro ao processar dados atualizados.");
                 document.body.classList.remove('loading');
                 return false;
            }
        } else {
            console.error("Falha ao carregar dados brutos durante a atualização.");
            alert("Não foi possível buscar as atualizações mais recentes.");
            document.body.classList.remove('loading'); // Hide loading indicator
            return false; // Indicate failure
        }
    }


    // --- 2. NAVEGAÇÃO E UI ---

    // switchView
    const switchView = (viewId) => {
        console.log(`Mudando para view: ${viewId}`);
        const currentView = document.querySelector('.page-view:not(.hidden)');

        // Clear album countdown interval if navigating away from album detail
        if (currentView && currentView.id === 'albumDetail' && viewId !== 'albumDetail' && albumCountdownInterval) {
            console.log("Limpando intervalo de contagem regressiva do álbum.");
            clearInterval(albumCountdownInterval);
            albumCountdownInterval = null;
        }

        // Hide all views
        allViews.forEach(v => v.classList.add('hidden'));

        // Show the target view
        const target = document.getElementById(viewId);
        if (target) {
            target.classList.remove('hidden');
            window.scrollTo(0, 0); // Scroll to top

            // Manage navigation history (push non-main views, clear on main view)
            if (viewId !== 'mainView' && viewId !== 'studioView') { // Don't push studio view to history for simplicity
                // Avoid pushing duplicates if already the last item
                if (viewHistory.length === 0 || viewHistory[viewHistory.length - 1] !== viewId) {
                    viewHistory.push(viewId);
                }
            } else if (viewId === 'mainView') {
                viewHistory = []; // Reset history when returning to main view
            }
            console.log("Histórico de views:", viewHistory);
        } else {
            console.error(`View com ID "${viewId}" não encontrada. Voltando para mainView.`);
             // Fallback to mainView if target doesn't exist
             document.getElementById('mainView')?.classList.remove('hidden');
             viewHistory = [];
        }
    };


    // activateMainViewSection
    function activateMainViewSection(sectionId) {
        // Deactivate all sections within mainView first
        document.querySelectorAll('#mainView .content-section').forEach(s => s.classList.remove('active'));

        const targetSection = document.getElementById(sectionId);
        // Ensure the target section exists and is within mainView
        if (targetSection && document.getElementById('mainView')?.contains(targetSection)) {
            targetSection.classList.add('active');
            console.log(`Seção ativada em mainView: ${sectionId}`);
        } else {
            console.warn(`Seção com ID "${sectionId}" não encontrada dentro de mainView. Ativando homeSection como fallback.`);
            document.getElementById('homeSection')?.classList.add('active'); // Fallback to home
            return 'homeSection'; // Return the actual activated section ID
        }
        return sectionId; // Return the requested section ID if successful
    }

    // switchTab
    const switchTab = (event, forceTabId = null) => {
        let targetTabId;

        if (forceTabId) {
            targetTabId = forceTabId;
            console.log(`Forçando troca para tab: ${targetTabId}`);
        } else if (event) {
            event.preventDefault(); // Prevent default link behavior if it's an anchor
            const clickedButton = event.target.closest('[data-tab]'); // Find the button/link with data-tab
            if (!clickedButton) {
                console.log("switchTab: Elemento clicado não possui 'data-tab'.");
                return; // Exit if the click wasn't on a tab element
            }
            targetTabId = clickedButton.dataset.tab;
            console.log(`Trocando para tab via clique: ${targetTabId}`);
        } else {
            console.log("switchTab: Chamado sem evento ou forceTabId.");
            return; // Exit if called improperly
        }

        // --- View Switching Logic ---
        if (targetTabId === 'studioSection') {
            console.log("Mudando para a view do Estúdio.");
            switchView('studioView');
            // If navigating TO studio and the 'edit' tab should be active, prepare the edit list
            const activeStudioTabButton = document.querySelector('.studio-tab-btn.active');
             // Refresh edit list if the edit tab *is currently* the active one inside studio
             if (activeStudioTabButton?.dataset.form === 'edit') {
                 populateEditableReleases();
                 editReleaseListContainer?.classList.remove('hidden');
                 editReleaseForm?.classList.add('hidden');
             } else {
                // If switching TO studio but a different tab is active (e.g., Single), ensure forms are correctly shown/hidden
                const currentlyActiveForm = document.querySelector('.studio-form-content.active');
                 if (!currentlyActiveForm) { // If no form is active, default to single
                     document.getElementById('newSingleForm')?.classList.add('active');
                     document.querySelector('.studio-tab-btn[data-form="single"]')?.classList.add('active');
                 }
             }

        } else {
            // If currently not on mainView, switch back to it first
            const mainViewElement = document.getElementById('mainView');
            if (mainViewElement?.classList.contains('hidden')) {
                console.log("Mudando para a view Principal.");
                switchView('mainView');
            }
            // Activate the correct section *within* mainView
            console.log(`Ativando seção dentro da view Principal: ${targetTabId}`);
            targetTabId = activateMainViewSection(targetTabId); // Activate and get the final section ID (could be fallback)
        }

        // --- Update Active State for Navigation Buttons ---
        console.log(`Atualizando estado ativo para botões de navegação [data-tab="${targetTabId}"]`);
        // Deactivate all top tabs and bottom nav items
        document.querySelectorAll('.nav-tab, .bottom-nav-item').forEach(button => button.classList.remove('active'));
        // Activate the ones matching the targetTabId
        document.querySelectorAll(`.nav-tab[data-tab="${targetTabId}"], .bottom-nav-item[data-tab="${targetTabId}"]`).forEach(button => button.classList.add('active'));
    };

    // handleBack
    const handleBack = () => {
        const currentViewElement = document.querySelector('.page-view:not(.hidden)');
        console.log("Botão Voltar pressionado.");

        // Clear album countdown if leaving album detail view
        if (currentViewElement && currentViewElement.id === 'albumDetail' && albumCountdownInterval) {
            console.log("Limpando contagem regressiva do álbum ao voltar.");
            clearInterval(albumCountdownInterval);
            albumCountdownInterval = null;
        }

        // Pop the current view from history
        viewHistory.pop();
        // Get the previous view ID, defaulting to mainView if history is empty
        const previousViewId = viewHistory.pop() || 'mainView'; // Pop again to get the actual previous one
        console.log("Voltando para a view:", previousViewId);
        switchView(previousViewId); // Switch to the previous view
    };


    // renderArtistsGrid
    const renderArtistsGrid = (containerId, artists) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Contêiner de grid com ID "${containerId}" não encontrado.`);
            return;
        }
        if (!artists || artists.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum artista para exibir.</p>';
            return;
        }
        container.innerHTML = artists.map(artist => `
            <div class="artist-card" data-artist-name="${artist.name}">
                <img src="${artist.img || artist.imageUrl || 'https://i.imgur.com/AD3MbBi.png'}" alt="${artist.name}" class="artist-card-img">
                <p class="artist-card-name">${artist.name}</p>
                <span class="artist-card-type">Artista</span>
            </div>
        `).join('');
    };

    // formatArtistString (Handles collaborations)
    function formatArtistString(artistIds, collabType) {
        if (!artistIds || artistIds.length === 0) return "Artista Desconhecido";

        const artistNames = artistIds.map(id => {
            const artist = db.artists.find(art => art.id === id);
            return artist ? artist.name : "Artista Desconhecido";
        });

        const mainArtist = artistNames[0];
        if (artistNames.length === 1) {
            return mainArtist; // Only one artist
        }

        const otherArtists = artistNames.slice(1).join(', ');
        // Format based on collaboration type
        if (collabType === 'Dueto/Grupo') {
            return `${mainArtist} & ${otherArtists}`;
        } else { // Default or 'Feat.'
            return mainArtist; // Typically only main artist shown unless specified otherwise
             // If you want to show Feat.: return `${mainArtist} (feat. ${otherArtists})`;
        }
    }


    // getCoverUrl (Finds cover from linked album/single)
    function getCoverUrl(parentReleaseId) {
        if (!parentReleaseId) return 'https://i.imgur.com/AD3MbBi.png'; // Default if no parent ID
        // Search both albums and singles
        const release = [...db.albums, ...db.singles].find(r => r.id === parentReleaseId);
        return release ? release.imageUrl : 'https://i.imgur.com/AD3MbBi.png'; // Return found URL or default
    }


    // renderChart
    const renderChart = (type) => {
        let containerId, dataList, previousData;
        const now = new Date(); // Get current time to filter only released items

        if (type === 'music') {
            containerId = 'musicChartsList';
            // Filter songs: must have streams, a parent release date, and be released
            dataList = [...db.songs]
                .filter(song => (song.streams || 0) > 0 && song.parentReleaseDate && new Date(song.parentReleaseDate) <= now)
                .sort((a, b) => (b.streams || 0) - (a.streams || 0)) // Sort by weekly streams (desc)
                .slice(0, 50); // Get top 50
            previousData = previousMusicChartData;
        } else if (type === 'album') {
            containerId = 'albumChartsList';
            // Filter releases (albums/singles): must have weekly streams, a release date, and be released
             dataList = [...db.albums, ...db.singles]
                .filter(item => (item.weeklyStreams || 0) > 0 && item.releaseDate && new Date(item.releaseDate) <= now)
                .sort((a, b) => (b.weeklyStreams || 0) - (a.weeklyStreams || 0)) // Sort by weekly streams (desc)
                .slice(0, 50); // Get top 50
            previousData = previousAlbumChartData;
        } else {
             console.error(`Tipo de chart inválido para renderizar: ${type}`);
             return;
        }


        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Contêiner de chart com ID "${containerId}" não encontrado.`);
            return;
        }

        if (!dataList || dataList.length === 0) {
            container.innerHTML = `<p class="empty-state">Nenhum item no chart no momento.</p>`;
            return;
        }

        // Generate HTML for each chart item
        container.innerHTML = dataList.map((item, index) => {
            const currentRank = index + 1;
            const previousRank = previousData[item.id]; // Get previous rank from stored data
            let iconClass = 'fa-minus'; // Default: stable
            let trendClass = 'trend-stable';

            if (previousRank === undefined) { // New entry
                trendClass = 'trend-new';
                // iconClass remains 'fa-minus' or you could use a specific 'new' icon if desired
            } else if (currentRank < previousRank) { // Moved up
                iconClass = 'fa-caret-up';
                trendClass = 'trend-up';
            } else if (currentRank > previousRank) { // Moved down
                iconClass = 'fa-caret-down';
                trendClass = 'trend-down';
            }
            // Stable entries keep the default 'fa-minus' and 'trend-stable'

            const indicatorHtml = `<span class="chart-rank-indicator ${trendClass}"><i class="fas ${iconClass}"></i></span>`;

            if (type === 'music') {
                const artistName = formatArtistString(item.artistIds, item.collabType);
                // Use song cover, fallback to parent release cover if necessary
                const cover = item.cover !== 'https://i.imgur.com/AD3MbBi.png' ? item.cover : getCoverUrl(item.albumId);
                return `
                    <div class="chart-item" data-song-id="${item.id}">
                        ${indicatorHtml}
                        <span class="chart-rank">${currentRank}</span>
                        <img src="${cover}" alt="${item.title}" class="chart-item-img">
                        <div class="chart-item-info">
                            <span class="chart-item-title">${item.title}</span>
                            <span class="chart-item-artist">${artistName}</span>
                        </div>
                        <span class="chart-item-duration">${(item.streams || 0).toLocaleString('pt-BR')}</span>
                    </div>`;
            } else { // type === 'album'
                return `
                    <div class="chart-item" data-album-id="${item.id}">
                         ${indicatorHtml}
                        <span class="chart-rank">${currentRank}</span>
                        <img src="${item.imageUrl}" alt="${item.title}" class="chart-item-img">
                        <div class="chart-item-info">
                            <span class="chart-item-title">${item.title}</span>
                            <span class="chart-item-artist">${item.artist}</span>
                        </div>
                        <span class="chart-item-score">${(item.weeklyStreams || 0).toLocaleString('pt-BR')}</span>
                    </div>`;
            }
        }).join('');
    };

    // openArtistDetail (Includes Corrected Sorting Logic)
    const openArtistDetail = (artistName) => {
        const artist = db.artists.find(a => a.name === artistName);
        if (!artist) {
            console.error(`Artista "${artistName}" não encontrado.`);
            handleBack(); // Go back if artist data is missing
            return;
        }

        activeArtist = artist; // Set the currently viewed artist globally

        // Update header background and artist name
        document.getElementById('detailBg').style.backgroundImage = `url(${artist.img})`;
        document.getElementById('detailName').textContent = artist.name;

        const now = new Date(); // For filtering released songs

        // Find top 5 popular *released* songs by total streams
        const popularSongs = [...db.songs]
            .filter(s =>
                s.artistIds && // Ensure artistIds array exists
                s.artistIds.includes(artist.id) && // Song belongs to the artist
                (s.totalStreams || 0) > 0 && // Song has streams
                s.parentReleaseDate && new Date(s.parentReleaseDate) <= now // Song has been released
            )
            .sort((a, b) => (b.totalStreams || 0) - (a.totalStreams || 0)) // Sort descending by total streams
            .slice(0, 5); // Take top 5

        // Render popular songs list
        const popularContainer = document.getElementById('popularSongsList');
        if (popularSongs.length > 0) {
            popularContainer.innerHTML = popularSongs.map((song, index) => `
                <div class="song-row" data-song-id="${song.id}">
                    <span>${index + 1}</span>
                    <div class="song-row-info">
                        <img src="${song.cover || getCoverUrl(song.albumId)}" alt="${song.title}" class="song-row-cover">
                        <span class="song-row-title">${song.title}</span>
                    </div>
                    <span class="song-streams">${(song.totalStreams || 0).toLocaleString('pt-BR')}</span>
                </div>
            `).join('');
        } else {
            popularContainer.innerHTML = '<p class="empty-state-small">Nenhuma música popular lançada encontrada.</p>';
        }

        // --- Custom Sorting for Releases ---
        const nowSort = new Date(); // Capture current time for sorting comparison
        const customSort = (a, b) => {
            const dateA = new Date(a.releaseDate);
            const dateB = new Date(b.releaseDate);
            const isAFuture = dateA > nowSort;
            const isBFuture = dateB > nowSort;

            if (isAFuture && isBFuture) {
                // Both future: Sort ascending (closest future release first)
                return dateA - dateB;
            } else if (isAFuture) {
                // Only A is future: A comes first
                return -1;
            } else if (isBFuture) {
                // Only B is future: B comes first (so A comes after)
                return 1;
            } else {
                // Both past: Sort descending (most recent past release first)
                return dateB - dateA;
            }
        };
         // Explanation of order: Future (Asc) | Past (Desc) => Future | Recent | Old

        // Render Albums list (sorted)
        const albumsContainer = document.getElementById('albumsList');
        const sortedAlbums = (artist.albums || []).sort(customSort); // Apply custom sort
        albumsContainer.innerHTML = sortedAlbums.map(album => `
            <div class="scroll-item" data-album-id="${album.id}">
                <img src="${album.imageUrl}" alt="${album.title}">
                <p>${album.title}</p>
                <span>${new Date(album.releaseDate).getFullYear()}</span>
            </div>
        `).join('') || '<p class="empty-state-small">Nenhum álbum encontrado.</p>';

        // Render Singles & EPs list (sorted)
        const singlesContainer = document.getElementById('singlesList');
        const sortedSingles = (artist.singles || []).sort(customSort); // Apply custom sort
        singlesContainer.innerHTML = sortedSingles.map(single => `
            <div class="scroll-item" data-album-id="${single.id}">
                <img src="${single.imageUrl}" alt="${single.title}">
                <p>${single.title}</p>
                <span>${new Date(single.releaseDate).getFullYear()}</span>
            </div>
        `).join('') || '<p class="empty-state-small">Nenhum single ou EP encontrado.</p>';

        // Render Recommended Artists (random selection excluding current artist)
        const recommended = [...db.artists]
            .filter(a => a.id !== artist.id) // Exclude current artist
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 5); // Take 5
        renderArtistsGrid('recommendedGrid', recommended);

        switchView('artistDetail'); // Show the artist detail page
    };


    // openAlbumDetail (Handles Pre-Release Countdown and Track Availability)
    const openAlbumDetail = (albumId) => {
        const album = [...db.albums, ...db.singles].find(a => a.id === albumId);
        if (!album) {
            console.error(`Álbum/Single com ID "${albumId}" não encontrado.`);
            handleBack(); // Go back if data is missing
            return;
        }

        // Clear any existing countdown interval before starting a new one
        if (albumCountdownInterval) {
            clearInterval(albumCountdownInterval);
            albumCountdownInterval = null;
            console.log("Intervalo de contagem regressiva anterior limpo.");
        }

        const countdownContainer = document.getElementById('albumCountdownContainer');
        const normalInfoContainer = document.getElementById('albumNormalInfoContainer');
        const tracklistContainer = document.getElementById('albumTracklist');

        // Update header background, cover image, and title
        document.getElementById('albumDetailBg').style.backgroundImage = `url(${album.imageUrl})`;
        document.getElementById('albumDetailCover').src = album.imageUrl;
        document.getElementById('albumDetailTitle').textContent = album.title;

        const releaseDate = new Date(album.releaseDate); // Parse the full ISO release date string
        const now = new Date(); // Get current time
        const isPreRelease = releaseDate > now; // Check if release date is in the future

        const artistObj = db.artists.find(a => a.id === album.artistId); // Find artist data

        if (isPreRelease) {
            // --- Pre-Release State ---
            normalInfoContainer?.classList.add('hidden'); // Hide normal info (streams, play button)
            countdownContainer?.classList.remove('hidden'); // Show countdown timer section

            // Format release date for display
            const releaseDateStr = releaseDate.toLocaleString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            document.getElementById('albumCountdownReleaseDate').textContent = releaseDateStr;

            startAlbumCountdown(album.releaseDate, 'albumCountdownTimer'); // Start the visual countdown

            // Render tracklist for pre-release (checking availability)
            tracklistContainer.innerHTML = (album.tracks || []).map(track => {
                const fullSong = db.songs.find(s => s.id === track.id); // Get full song data if available
                let isAvailable = false;
                // Define track types that are available before full album release
                const preReleaseAvailableTypes = ['Title Track', 'Pre-release Single'];

                if (fullSong) {
                    // Check if song's *own* release date has passed OR if it's a designated pre-release type
                    const hasSongReleased = fullSong.parentReleaseDate && new Date(fullSong.parentReleaseDate) <= now;
                    const isDesignatedPreRelease = preReleaseAvailableTypes.includes(fullSong.trackType);
                    isAvailable = hasSongReleased || isDesignatedPreRelease;
                }

                const artistName = formatArtistString(track.artistIds, track.collabType);
                const trackNumDisplay = track.trackNumber ? track.trackNumber : '?';

                if (isAvailable) {
                    // Render playable track row
                    return `
                        <div class="track-row available" data-song-id="${track.id}">
                            <span class="track-number"><i class="fas fa-play"></i></span>
                            <div class="track-info">
                                <span class="track-title">${track.title}</span>
                                <span class="track-artist-feat">${artistName}</span>
                            </div>
                            <span class="track-duration">${track.duration}</span>
                        </div>`;
                } else {
                    // Render locked/unavailable track row
                    return `
                        <div class="track-row unavailable">
                            <span class="track-number">${trackNumDisplay}</span>
                            <div class="track-info">
                                <span class="track-title">${track.title}</span>
                                <span class="track-artist-feat">${artistName}</span>
                            </div>
                            <span class="track-duration"><i class="fas fa-lock"></i></span>
                        </div>`;
                }
            }).join('') || '<p class="empty-state-small">Tracklist ainda não revelada.</p>'; // Fallback message

        } else {
            // --- Released State ---
            normalInfoContainer?.classList.remove('hidden'); // Show normal info
            countdownContainer?.classList.add('hidden'); // Hide countdown timer

            const releaseYear = releaseDate.getFullYear();
            const totalAlbumStreamsFormatted = (album.totalStreams || 0).toLocaleString('pt-BR');
            // Display release info (Artist link, year, total streams)
            document.getElementById('albumDetailInfo').innerHTML =
                `Por <strong class="artist-link" data-artist-name="${artistObj ? artistObj.name : ''}">${album.artist}</strong> • ${releaseYear} • ${totalAlbumStreamsFormatted} streams totais`;

            // Render tracklist for released album (all tracks playable, show individual streams)
            tracklistContainer.innerHTML = (album.tracks || []).map(song => {
                const artistName = formatArtistString(song.artistIds, song.collabType);
                const streams = (song.totalStreams || 0); // Use total streams for individual tracks
                const trackNumDisplay = song.trackNumber ? song.trackNumber : '?';
                return `
                    <div class="track-row" data-song-id="${song.id}">
                        <span class="track-number">${trackNumDisplay}</span>
                        <div class="track-info">
                            <span class="track-title">${song.title}</span>
                            <span class="track-artist-feat">${artistName}</span>
                        </div>
                        <span class="track-duration">${streams.toLocaleString('pt-BR')}</span>
                    </div>`;
            }).join('') || '<p class="empty-state-small">Nenhuma faixa encontrada para este lançamento.</p>'; // Fallback message
        }
        switchView('albumDetail'); // Show the album detail page
    };


    // openDiscographyDetail (Includes Corrected Sorting Logic)
    const openDiscographyDetail = (type) => {
        if (!activeArtist) {
            console.error("Nenhum artista ativo para exibir discografia.");
            handleBack();
            return;
        }

        // --- Custom Sorting Logic (same as in openArtistDetail) ---
        const nowSort = new Date();
        const customSort = (a, b) => {
            const dateA = new Date(a.releaseDate);
            const dateB = new Date(b.releaseDate);
            const isAFuture = dateA > nowSort;
            const isBFuture = dateB > nowSort;

            if (isAFuture && isBFuture) { return dateA - dateB; } // Future Asc
            else if (isAFuture) { return -1; } // Future before Past
            else if (isBFuture) { return 1; } // Past after Future
            else { return dateB - dateA; } // Past Desc
        };
        // Resulting order: Future | Recent | Old

        // Get the correct data (albums or singles) and sort it
        const data = (type === 'albums')
            ? (activeArtist.albums || []).sort(customSort)
            : (activeArtist.singles || []).sort(customSort);

        // Set the title based on type
        const title = (type === 'albums') ? `Álbuns de ${activeArtist.name}` : `Singles & EPs de ${activeArtist.name}`;
        document.getElementById('discographyTypeTitle').textContent = title;

        // Render the grid of releases
        const grid = document.getElementById('discographyGrid');
        grid.innerHTML = data.map(item => `
            <div class="scroll-item" data-album-id="${item.id}">
                <img src="${item.imageUrl}" alt="${item.title}">
                <p>${item.title}</p>
                <span>${new Date(item.releaseDate).getFullYear()}</span>
            </div>
        `).join('') || '<p class="empty-state">Nenhum lançamento encontrado.</p>'; // Fallback message

        switchView('discographyDetail'); // Show the discography page
    };

    // handleSearch
    const handleSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        // If query is empty, switch back to home section
        if (!query) {
            switchTab(null, 'homeSection'); // Use switchTab to handle view and section activation
            return;
        }

        const resultsContainer = document.getElementById('searchResults');
        const noResultsElement = document.getElementById('noResults');
        if (!resultsContainer || !noResultsElement) {
             console.error("Elementos de resultados da busca não encontrados.");
             return;
        }


        // Filter artists and releases (albums/singles) based on the query
        const filteredArtists = db.artists.filter(a => a.name.toLowerCase().includes(query));
        const filteredAlbums = [...db.albums, ...db.singles].filter(a => a.title.toLowerCase().includes(query));

        let html = '';
        let resultCount = 0;

        // Add artists results
        if (filteredArtists.length > 0) {
            html += '<h3 class="section-title">Artistas</h3>';
            html += filteredArtists.map(a => {
                resultCount++;
                return `
                    <div class="artist-card" data-artist-name="${a.name}">
                        <img src="${a.img}" alt="${a.name}" class="artist-card-img">
                        <p class="artist-card-name">${a.name}</p>
                        <span class="artist-card-type">Artista</span>
                    </div>`;
            }).join('');
        }

        // Add albums/singles results
        if (filteredAlbums.length > 0) {
            html += '<h3 class="section-title">Álbuns & Singles</h3>';
            html += filteredAlbums.map(al => {
                resultCount++;
                return `
                    <div class="artist-card" data-album-id="${al.id}">
                        <img src="${al.imageUrl}" alt="${al.title}" class="artist-card-img">
                        <p class="artist-card-name">${al.title}</p>
                        <span class="artist-card-type">${al.artist}</span>
                    </div>`;
            }).join('');
        }

        // Display results or "no results" message
        resultsContainer.innerHTML = html;
        if (resultCount > 0) {
            noResultsElement.classList.add('hidden');
            resultsContainer.classList.remove('hidden');
        } else {
            noResultsElement.classList.remove('hidden');
            resultsContainer.classList.add('hidden');
        }

        // Ensure the search section is visible in the main view
        switchTab(null, 'searchSection'); // Use switchTab to handle view and section activation
    };

    // setupCountdown (For weekly charts)
    const setupCountdown = (timerId, chartType) => {
        const timerElement = document.getElementById(timerId);
        if (!timerElement) {
             console.warn(`Elemento de timer com ID "${timerId}" não encontrado.`);
             return;
        }


        const calculateTargetDate = () => {
            const now = new Date();
            const target = new Date(now);
            // Calculate days until next Monday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
            let daysUntilMonday = (1 - now.getDay() + 7) % 7;
            // If it's currently Monday *after* midnight UTC (start of the day), target next Monday
            if (daysUntilMonday === 0 && (now.getUTCHours() > 0 || now.getUTCMinutes() > 0 || now.getUTCSeconds() > 0)) {
                 daysUntilMonday = 7;
            } else if (daysUntilMonday === 0 && now.getUTCHours() === 0 && now.getUTCMinutes() === 0 && now.getUTCSeconds() === 0) {
                 // If it's exactly Monday 00:00:00 UTC, the target is now (or very shortly after)
                 // Keep daysUntilMonday = 0, the check later will handle refresh
                 // Alternatively, if you want the countdown to *always* show time until *next* week:
                 // daysUntilMonday = 7;
            }


            target.setUTCDate(now.getUTCDate() + daysUntilMonday); // Use UTC dates
            target.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
            return target;
        };

        let targetDate = calculateTargetDate(); // Initial target date

        const updateTimerDisplay = (distance) => {
            if (distance < 0) {
                timerElement.textContent = `Atualizando...`; // Or "00d 00h 00m 00s"
                return;
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            const format = (num) => (num < 10 ? '0' + num : num); // Add leading zero
            timerElement.textContent = `${format(days)}d ${format(hours)}h ${format(minutes)}m ${format(seconds)}s`;
        };

        const intervalId = setInterval(() => {
            const now = new Date().getTime(); // Current time in ms
            const distance = targetDate.getTime() - now; // Difference in ms

            if (distance < 0) {
                console.log(`Timer ${timerId} (Chart: ${chartType}) atingiu zero. Salvando dados anteriores e recalculando.`);
                saveChartDataToLocalStorage(chartType); // Save the *current* state as the *previous* state for next week
                targetDate = calculateTargetDate(); // Calculate the *next* Monday midnight UTC

                // Re-render the specific chart immediately after reset
                if (chartType === 'music') renderChart('music');
                else if (chartType === 'album') renderChart('album');
                else if (chartType === 'rpg') renderRPGChart();

                 // Update display immediately for the new countdown period
                 updateTimerDisplay(targetDate.getTime() - new Date().getTime());
                return; // Skip the regular update for this tick
            }

            updateTimerDisplay(distance); // Update the timer display
        }, 1000); // Update every second

        // Initial display update
        updateTimerDisplay(targetDate.getTime() - new Date().getTime());
    };


    // startAlbumCountdown (For individual album releases)
    function startAlbumCountdown(targetDateISO, containerId) {
        // Clear any existing interval for this specific countdown type
        if (albumCountdownInterval) {
            clearInterval(albumCountdownInterval);
            console.log("Intervalo de contagem regressiva do álbum anterior limpo antes de iniciar novo.");
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Contêiner de contagem regressiva com ID "${containerId}" não encontrado.`);
            return;
        }

        const targetTime = new Date(targetDateISO).getTime(); // Target time in milliseconds

        const updateTimer = () => {
            const now = new Date().getTime(); // Current time in milliseconds
            const distance = targetTime - now; // Time remaining in milliseconds

            if (distance < 0) {
                // Time's up!
                container.innerHTML = '<p style="color: var(--spotify-green); font-weight: bold;">Lançado!</p>'; // Indicate release
                if (albumCountdownInterval) {
                    clearInterval(albumCountdownInterval); // Stop the interval
                    albumCountdownInterval = null;
                }

                // --- Auto-refresh Logic ---
                // Find the album/single associated with this countdown
                const currentAlbum = [...db.albums, ...db.singles].find(a => a.releaseDate === targetDateISO);
                const albumId = currentAlbum ? currentAlbum.id : null;

                // Check if we are still on the album detail page for this specific album
                const albumDetailView = document.getElementById('albumDetail');
                const isStillOnPage = albumId && albumDetailView && !albumDetailView.classList.contains('hidden');
                 // You might need a more robust way to check if *this* album is the one being viewed,
                 // e.g., by checking a data attribute on the albumDetail view itself.
                 // For now, checking if *any* album detail is open and matches the ID.

                if (isStillOnPage) {
                    console.log("Contagem regressiva do álbum finalizada, atualizando a view...");
                    // Option 1: Call refreshAllData() - Simpler, but reloads everything
                    // refreshAllData();
                    // Option 2: Call openAlbumDetail() directly - More efficient
                     openAlbumDetail(albumId);
                } else {
                    console.log("Contagem regressiva do álbum finalizada, mas a view não pôde ser atualizada automaticamente (usuário navegou para outra tela?).");
                }
                return; // Stop further updates
            }

            // Calculate days, hours, minutes, seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            const format = (num) => (num < 10 ? '0' + num : num); // Add leading zero

            // Update the container's HTML with the countdown values
            container.innerHTML = `
                <div class="countdown-item"><span>${format(days)}</span><label>Dias</label></div>
                <div class="countdown-item"><span>${format(hours)}</span><label>Horas</label></div>
                <div class="countdown-item"><span>${format(minutes)}</span><label>Minutos</label></div>
                <div class="countdown-item"><span>${format(seconds)}</span><label>Segundos</label></div>
            `;
        };

        updateTimer(); // Initial call to display immediately
        albumCountdownInterval = setInterval(updateTimer, 1000); // Set interval to update every second
        console.log("Novo intervalo de contagem regressiva do álbum iniciado:", albumCountdownInterval);
    }


    // --- 3. SISTEMA DE RPG ---
    const CHART_TOP_N = 20; // Number of artists in the RPG chart
    const STREAMS_PER_POINT = 10000; // How many simulated streams per RPG point per day

    // calculateSimulatedStreams
    const calculateSimulatedStreams = (points, lastActiveISO) => {
        if (!lastActiveISO || !points || points <= 0) return 0; // No points or no activity date = 0 streams

        const now = new Date();
        const lastActiveDate = new Date(lastActiveISO);

        // Ensure lastActiveDate is valid
        if (isNaN(lastActiveDate.getTime())) {
             console.warn(`Data 'LastActive' inválida encontrada: ${lastActiveISO}`);
             return 0;
        }


        // Calculate difference in hours
        const diffMilliseconds = Math.max(0, now - lastActiveDate); // Ensure difference is not negative
        const diffHours = diffMilliseconds / (1000 * 60 * 60);

        const streamsPerDay = points * STREAMS_PER_POINT;
        const streamsPerHour = streamsPerDay / 24;

        return Math.floor(streamsPerHour * diffHours); // Calculate total simulated streams
    };

    // computeChartData (Generates data for the RPG chart)
    const computeChartData = (artistsArray) => {
        if (!artistsArray) return [];
        return artistsArray
            .map(artist => ({
                id: artist.id,
                name: artist.name,
                img: artist.img, // Assumes img property is already set
                streams: calculateSimulatedStreams(artist.RPGPoints, artist.LastActive),
                points: artist.RPGPoints || 0
            }))
            .sort((a, b) => (b.streams || 0) - (a.streams || 0)) // Sort by simulated streams (desc)
            .slice(0, CHART_TOP_N); // Take top N artists
    };

    // renderRPGChart
    function renderRPGChart() {
        const chartData = computeChartData(db.artists); // Compute the sorted chart data
        const container = document.getElementById('artistsGrid'); // Target container in the 'Artists' section
        const previousData = previousRpgChartData; // Get previous ranking data

        if (!container) {
            console.error("Contêiner 'artistsGrid' para o chart RPG não encontrado.");
            return;
        }

        if (chartData.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum artista no chart RPG no momento.</p>';
            return;
        }

        // Generate HTML for each artist card in the RPG chart
        container.innerHTML = chartData.map((artist, index) => {
            const currentRank = index + 1;
            const previousRank = previousData[artist.id]; // Find previous rank
            let iconClass = 'fa-minus'; // Default: stable
            let trendClass = 'trend-stable';

            if (previousRank === undefined) { // New entry
                trendClass = 'trend-new';
            } else if (currentRank < previousRank) { // Moved up
                iconClass = 'fa-caret-up';
                trendClass = 'trend-up';
            } else if (currentRank > previousRank) { // Moved down
                iconClass = 'fa-caret-down';
                trendClass = 'trend-down';
            }
            // Stable entries keep defaults

            return `
                <div class="artist-card" data-artist-name="${artist.name}">
                    <span class="rpg-rank">#${currentRank}</span>
                    <span class="chart-rank-indicator rpg-indicator ${trendClass}">
                        <i class="fas ${iconClass}"></i>
                    </span>
                    <img src="${artist.img}" alt="${artist.name}" class="artist-card-img">
                    <p class="artist-card-name">${artist.name}</p>
                    <span class="artist-card-type">${(artist.streams || 0).toLocaleString('pt-BR')} streams</span>
                </div>`;
        }).join('');
    }



    // --- 4. SISTEMA DO ESTÚDIO ---

    // initializeStudio (Sets up listeners for studio forms and modals)
    function initializeStudio() {
        console.log("Inicializando listeners do Estúdio...");

        // Login/Logout Buttons
        loginButton?.addEventListener('click', () => {
            const username = document.getElementById('usernameInput')?.value;
            const password = document.getElementById('passwordInput')?.value;
            loginPlayer(username, password);
        });
        logoutButton?.addEventListener('click', logoutPlayer);

        // Studio Tab Buttons (Single, Album, Edit)
        studioTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const clickedTab = e.currentTarget;
                const formTarget = clickedTab.dataset.form; // 'single', 'album', or 'edit'

                // Deactivate all tabs and forms first
                studioTabs.forEach(t => t.classList.remove('active'));
                studioForms.forEach(f => f.classList.remove('active'));

                // Activate the clicked tab
                clickedTab.classList.add('active');

                // Activate the corresponding form/section
                let targetElementId;
                if (formTarget === 'single') {
                    targetElementId = 'newSingleForm';
                } else if (formTarget === 'album') {
                    targetElementId = 'newAlbumForm';
                    initAlbumForm(); // Reset/initialize album form state (e.g., tracklist)
                } else if (formTarget === 'edit') {
                    targetElementId = 'editReleaseSection';
                    populateEditableReleases(); // Load releases for the logged-in player
                     editReleaseListContainer?.classList.remove('hidden'); // Show list view
                     editReleaseForm?.classList.add('hidden'); // Hide edit form view
                }

                const targetElement = document.getElementById(targetElementId);
                if (targetElement) {
                    targetElement.classList.add('active');
                } else {
                    console.error(`Elemento alvo do estúdio com ID "${targetElementId}" não encontrado.`);
                }
            });
        });

        // Feat Modal Buttons (in Single form and Album Track modal)
        confirmFeatBtn?.addEventListener('click', confirmFeat);
        cancelFeatBtn?.addEventListener('click', closeFeatModal);
        // Listener for the "Add Feat" button specifically in the Single form
        newSingleForm?.addEventListener('click', (e) => {
            // Use event delegation to catch clicks on dynamically added buttons if needed
            const addFeatButton = e.target.closest('.add-feat-btn[data-target="singleFeatList"]');
            if (addFeatButton) {
                openFeatModal(addFeatButton);
            }
        });

        // Album Track Modal Buttons and Actions
        openAddTrackModalBtn?.addEventListener('click', () => openAlbumTrackModal()); // Opens modal for NEW track
        saveAlbumTrackBtn?.addEventListener('click', saveAlbumTrack);
        cancelAlbumTrackBtn?.addEventListener('click', closeAlbumTrackModal);

        // Inline Feat Adder within Album Track Modal
        addInlineFeatBtn?.addEventListener('click', toggleInlineFeatAdder); // Toggles the inline feat form
        confirmInlineFeatBtn?.addEventListener('click', confirmInlineFeat); // Adds feat from inline form
        cancelInlineFeatBtn?.addEventListener('click', cancelInlineFeat); // Cancels inline feat add

        // Edit/Remove buttons within the Album Tracklist Editor (using event delegation)
        albumTracklistEditor?.addEventListener('click', (e) => {
            const editButton = e.target.closest('.edit-track-btn');
            const removeButton = e.target.closest('.remove-track-btn');
            const trackItem = e.target.closest('.track-list-item-display');

            if (editButton && trackItem) {
                openAlbumTrackModal(trackItem); // Opens modal to EDIT the clicked track
            } else if (removeButton && trackItem) {
                trackItem.remove(); // Remove the track item from the DOM
                updateTrackNumbers(); // Renumber remaining tracks
            }
        });

        // Edit/Delete Release Buttons (in the Edit tab list, using event delegation)
        editReleaseList?.addEventListener('click', (e) => {
             const editButton = e.target.closest('.edit-release-btn');
             const deleteButton = e.target.closest('.delete-release-btn');

             if (editButton) {
                 const releaseId = editButton.dataset.releaseId;
                 const releaseType = editButton.dataset.releaseType;
                 openEditForm(releaseId, releaseType); // Open the edit form for this release
             } else if (deleteButton) {
                 const releaseId = deleteButton.dataset.releaseId;
                 const releaseType = deleteButton.dataset.releaseType;
                 const tableName = deleteButton.dataset.releaseTable;
                 // Get title safely for the confirmation modal
                 const releaseTitle = deleteButton.closest('.edit-release-item')?.querySelector('.edit-release-title')?.textContent || 'este lançamento';
                 // Find the release in local DB to get associated track IDs
                 const release = (releaseType === 'album' ? db.albums : db.singles).find(r => r.id === releaseId);
                 const trackIdsToDelete = release?.trackIds || []; // Get track IDs to potentially delete/unlink
                 openDeleteConfirmModal(releaseId, tableName, releaseTitle, trackIdsToDelete); // Show confirmation
             }
         });
        // Edit Release Form Actions
         editReleaseForm?.addEventListener('submit', handleUpdateRelease); // Handle saving changes
         cancelEditBtn?.addEventListener('click', () => { // Handle cancelling edit
             editReleaseForm?.classList.add('hidden');
             editReleaseListContainer?.classList.remove('hidden'); // Go back to the list
         });
        // Delete Confirmation Modal Actions
         cancelDeleteBtn?.addEventListener('click', closeDeleteConfirmModal);
         confirmDeleteBtn?.addEventListener('click', handleDeleteRelease);

        // Listener for the artist filter dropdown in the Edit tab
        editArtistFilterSelect?.addEventListener('change', populateEditableReleases); // Refresh list on filter change

        // Form Submission Handlers (prevent default and call async functions)
        newSingleForm?.addEventListener('submit', handleSingleSubmit);
        newAlbumForm?.addEventListener('submit', handleAlbumSubmit);

        // Track Type Modal (for Single submission)
        confirmTrackTypeBtn?.addEventListener('click', () => {
            const selectedType = trackTypeSelect.value;
            if (selectedType) {
                processSingleSubmission(selectedType); // Proceed with submission
            } else {
                alert("Por favor, selecione um tipo de faixa.");
            }
        });
        cancelTrackTypeBtn?.addEventListener('click', () => {
            trackTypeModal?.classList.add('hidden'); // Hide modal
            // Re-enable the submit button if necessary
            const btn = document.getElementById('submitNewSingle');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Lançar Single';
            }
        });

         // Update existing track dropdown when main artist changes in Single form
         singleArtistSelect?.addEventListener('change', () => {
             if (toggleExistingSingle?.checked) { // Only update if 'use existing' is checked
                 populatePlayerTracks('existingTrackSelect');
             }
         });

        // Toggle between New Track / Existing Track in Single form
        toggleExistingSingle?.addEventListener('change', () => toggleSingleFormMode(false)); // Pass false, not resetting

        // Open/Close and Interaction for "Add Existing Track" Modal (for Album form)
        openExistingTrackModalBtn?.addEventListener('click', () => openExistingTrackModal('album'));
        existingTrackSearch?.addEventListener('input', populateExistingTrackSearch); // Filter results on input
        cancelExistingTrackBtn?.addEventListener('click', closeExistingTrackModal);
        existingTrackResults?.addEventListener('click', handleExistingTrackSelect); // Handle clicking a result

        // Initialize SortableJS for the album tracklist editor
        initAlbumForm();

        console.log("Listeners do Estúdio inicializados.");
    }


    // loginPlayer
    function loginPlayer(username, password) {
        if (!username || !password) {
            alert("Por favor, insira nome de usuário e senha.");
            return;
        }
        // Find player by case-insensitive username match
        const foundPlayer = db.players.find(p => p.name.toLowerCase() === username.toLowerCase());

        // Simple password check (consider hashing in a real application)
        if (foundPlayer && foundPlayer.password === password) {
            currentPlayer = foundPlayer; // Set the current player globally
            console.log(`Jogador ${currentPlayer.name} logado com sucesso.`);

            // Update UI to reflect login state
            document.getElementById('playerName').textContent = currentPlayer.name;
            loginPrompt?.classList.add('hidden'); // Hide login fields
            loggedInInfo?.classList.remove('hidden'); // Show logged-in info
            studioLaunchWrapper?.classList.remove('hidden'); // Show studio controls (tabs, forms)

            // Populate artist selectors with the player's artists
            populateArtistSelector(currentPlayer.id);

            // If the 'Edit' tab is currently active, populate its list
            if (document.querySelector('.studio-tab-btn[data-form="edit"]')?.classList.contains('active')) {
                populateEditableReleases();
            }

            // Populate the 'existing track' dropdown for the Single form initially
            // (Uses the first artist in the dropdown by default if available)
            populatePlayerTracks('existingTrackSelect');

        } else {
            alert("Usuário ou senha inválidos.");
            // Clear password field on failed login attempt
            const passwordInput = document.getElementById('passwordInput');
            if (passwordInput) passwordInput.value = '';
        }
    }

    // logoutPlayer
    function logoutPlayer() {
        console.log(`Jogador ${currentPlayer?.name} deslogado.`);
        currentPlayer = null; // Clear the current player

        // Update UI to reflect logout state
        const playerNameElement = document.getElementById('playerName');
        if (playerNameElement) playerNameElement.textContent = ''; // Clear display name
        loginPrompt?.classList.remove('hidden'); // Show login fields
        loggedInInfo?.classList.add('hidden'); // Hide logged-in info
        studioLaunchWrapper?.classList.add('hidden'); // Hide studio controls

        // Clear input fields
        const usernameInput = document.getElementById('usernameInput');
        const passwordInput = document.getElementById('passwordInput');
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';

        // Clear potentially sensitive/player-specific lists
        if (editReleaseList) editReleaseList.innerHTML = '<p class="empty-state-small">Faça login para ver seus lançamentos.</p>';
        if (editArtistFilterSelect) editArtistFilterSelect.innerHTML = '<option value="all">Todos os Artistas</option>'; // Reset filter
         if (singleArtistSelect) singleArtistSelect.innerHTML = '<option value="">Selecione...</option>';
         if (albumArtistSelect) albumArtistSelect.innerHTML = '<option value="">Selecione...</option>';
         if (existingTrackSelect) existingTrackSelect.innerHTML = '<option value="">Selecione um Artista...</option>';


        // Reset edit form state
         editReleaseForm?.classList.add('hidden');
         editReleaseListContainer?.classList.remove('hidden');

        // Reset single form state (uncheck 'existing', show new track info)
         if(toggleExistingSingle) toggleExistingSingle.checked = false;
         toggleSingleFormMode(true); // Reset to default (new track)

         // Optionally switch back to the first studio tab (e.g., 'single')
         studioTabs.forEach(t => t.classList.remove('active'));
         studioForms.forEach(f => f.classList.remove('active'));
         document.querySelector('.studio-tab-btn[data-form="single"]')?.classList.add('active');
         document.getElementById('newSingleForm')?.classList.add('active');


    }


    // populateArtistSelector (Fills dropdowns with player's artists)
    function populateArtistSelector(playerId) {
        const player = db.players.find(p => p.id === playerId);
        if (!player) {
             console.warn(`Jogador com ID ${playerId} não encontrado para popular seletores.`);
             return;
        }

        const playerArtistIds = player.artists || [];
        // Map artist IDs to HTML option elements, filtering out artists not found in db.artists
        const optionsHtml = playerArtistIds.map(id => {
            const artist = db.artists.find(a => a.id === id);
            return artist ? `<option value="${artist.id}">${artist.name}</option>` : ''; // Return empty string if artist not found
        }).join('');

        // Populate the dropdowns in Single, Album, and Edit forms
        if (singleArtistSelect) {
            singleArtistSelect.innerHTML = `<option value="">Selecione...</option>${optionsHtml}`;
        }
        if (albumArtistSelect) {
            albumArtistSelect.innerHTML = `<option value="">Selecione...</option>${optionsHtml}`;
        }
        if (editArtistFilterSelect) {
            // Add "All Artists" option for the filter
            editArtistFilterSelect.innerHTML = `<option value="all">Todos os Artistas</option>${optionsHtml}`;
        }
    }


    // --- Funções de Feat ---

    // populateArtistSelectForFeat (Populates feat dropdown, excluding the main artist)
    function populateArtistSelectForFeat(targetSelectElement) {
        let currentMainArtistId = null;
        let selectElement = targetSelectElement; // Use the provided element by default

        // Determine the main artist based on which form is active
        if (document.getElementById('newSingleForm')?.classList.contains('active')) {
            currentMainArtistId = singleArtistSelect?.value;
             // Ensure we use the main feat modal's select if called from single form
             selectElement = featArtistSelect;
        } else if (document.getElementById('newAlbumForm')?.classList.contains('active')) {
            currentMainArtistId = albumArtistSelect?.value;
            // Ensure we use the inline feat modal's select if called from album form
            selectElement = inlineFeatArtistSelect;
        } else {
             // Fallback or if called from somewhere else, maybe use the main feat modal
             selectElement = featArtistSelect;
        }


        if (!selectElement) {
            console.error("Elemento select para artistas de feat não encontrado!");
            return;
        }

        // Filter all artists to exclude the current main artist and sort alphabetically
        const featOptions = db.artists
            .filter(artist => artist.id !== currentMainArtistId)
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
            .map(artist => `<option value="${artist.id}">${artist.name}</option>`)
            .join('');

        // Populate the select element
        selectElement.innerHTML = featOptions || '<option value="">Nenhum outro artista disponível</option>'; // Provide fallback
    }

    // openFeatModal (Opens the main feat modal)
    function openFeatModal(buttonElement) {
        const targetListId = buttonElement.dataset.target; // ID of the list where tags should be added (e.g., 'singleFeatList')
        currentFeatTarget = document.getElementById(targetListId); // Set the global target

        if (!currentFeatTarget) {
            console.error(`Elemento alvo para Feat (ID: ${targetListId}) não encontrado.`);
            return;
        }
        if (!featModal) {
             console.error("Modal de Feat principal não encontrado.");
             return;
        }

        populateArtistSelectForFeat(featArtistSelect); // Populate the dropdown in the modal
        featModal.classList.remove('hidden'); // Show the modal
    }

    // closeFeatModal (Closes the main feat modal)
    function closeFeatModal() {
        featModal?.classList.add('hidden');
        currentFeatTarget = null; // Clear the target
         // Reset modal fields if needed
         if(featArtistSelect) featArtistSelect.innerHTML = '';
         if(featTypeSelect) featTypeSelect.value = 'Feat.';
    }

    // confirmFeat (Adds feat tag from the main modal)
    function confirmFeat() {
        const artistId = featArtistSelect?.value;
        const selectedIndex = featArtistSelect?.selectedIndex;
        const artistName = (selectedIndex !== undefined && selectedIndex !== -1)
                            ? featArtistSelect.options[selectedIndex].text
                            : 'Desconhecido';
        const featType = featTypeSelect?.value;

        if (!artistId || !currentFeatTarget) {
            console.error("Confirmação de Feat falhou: ID do artista ou elemento alvo faltando.");
             alert("Erro ao adicionar feat. Selecione um artista.");
            return;
        }

        // Create the tag element
        const tag = document.createElement('span');
        tag.className = 'feat-tag';
        tag.textContent = `${featType} ${artistName}`; // Display text (e.g., "Feat. Artista B")
        // Store data attributes
        tag.dataset.artistId = artistId;
        tag.dataset.featType = featType;
        tag.dataset.artistName = artistName; // Store name for potential later use
        // Add click listener to remove the tag
        tag.addEventListener('click', () => tag.remove());

        currentFeatTarget.appendChild(tag); // Add the tag to the target list (e.g., singleFeatList)
        closeFeatModal(); // Close the modal
    }

    // toggleInlineFeatAdder (Shows/hides the feat adder within the album track modal)
    function toggleInlineFeatAdder() {
        if (!inlineFeatAdder || !addInlineFeatBtn) return;

        const isHidden = inlineFeatAdder.classList.contains('hidden');
        if (isHidden) {
            populateArtistSelectForFeat(inlineFeatArtistSelect); // Populate dropdown when showing
            inlineFeatAdder.classList.remove('hidden');
            addInlineFeatBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar Feat'; // Change button text/icon
        } else {
            inlineFeatAdder.classList.add('hidden');
            addInlineFeatBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Feat'; // Revert button text/icon
             // Optionally reset inline feat fields when hiding
             if(inlineFeatArtistSelect) inlineFeatArtistSelect.innerHTML = '';
             if(inlineFeatTypeSelect) inlineFeatTypeSelect.value = 'Feat.';
        }
    }

    // confirmInlineFeat (Adds feat tag from the inline adder in the album track modal)
    function confirmInlineFeat() {
        const artistId = inlineFeatArtistSelect?.value;
         const selectedIndex = inlineFeatArtistSelect?.selectedIndex;
         const artistName = (selectedIndex !== undefined && selectedIndex !== -1)
                             ? inlineFeatArtistSelect.options[selectedIndex].text
                             : 'Desconhecido';
        const featType = inlineFeatTypeSelect?.value;
        const targetList = albumTrackFeatList; // Target is always the list in the album track modal

        if (!artistId || !targetList) {
            console.error("Confirmação de Feat inline falhou: ID do artista ou lista alvo faltando.");
            alert("Erro ao adicionar feat inline. Selecione um artista.");
            return;
        }

        // Create the tag element (similar to confirmFeat)
        const tag = document.createElement('span');
        tag.className = 'feat-tag';
        tag.textContent = `${featType} ${artistName}`;
        tag.dataset.artistId = artistId;
        tag.dataset.featType = featType;
        tag.dataset.artistName = artistName;
        tag.addEventListener('click', () => tag.remove());

        targetList.appendChild(tag); // Add tag to the list in the modal
        toggleInlineFeatAdder(); // Hide the inline adder after adding
    }

    // cancelInlineFeat (Hides the inline feat adder)
    function cancelInlineFeat() {
         if(!inlineFeatAdder || !addInlineFeatBtn) return;
        inlineFeatAdder.classList.add('hidden');
        addInlineFeatBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Feat';
         // Optionally reset fields
         if(inlineFeatArtistSelect) inlineFeatArtistSelect.innerHTML = '';
         if(inlineFeatTypeSelect) inlineFeatTypeSelect.value = 'Feat.';
    }


    // openAlbumTrackModal (Opens modal to add or edit an album track)
    function openAlbumTrackModal(itemToEdit = null) {
        if (!albumTrackModal || !albumTrackNameInput || !albumTrackDurationInput || !albumTrackTypeSelect || !albumTrackFeatList || !editingTrackItemId || !editingTrackExistingId) {
             console.error("Elementos do modal de faixa do álbum não encontrados.");
             return;
        }


        // Reset common fields
        albumTrackNameInput.value = '';
        albumTrackDurationInput.value = '';
        albumTrackTypeSelect.value = 'B-side'; // Default type
        albumTrackFeatList.innerHTML = ''; // Clear feat tags
        editingTrackItemId.value = ''; // Clear hidden ID field for item being edited
        editingTrackExistingId.value = ''; // Clear hidden ID for existing song link
        editingTrackItem = null; // Clear reference to the DOM element being edited

        // Reset inline feat adder state
        inlineFeatAdder?.classList.add('hidden');
        if (addInlineFeatBtn) addInlineFeatBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Feat';

        // Ensure fields are enabled by default (for new tracks)
        albumTrackNameInput.disabled = false;
        albumTrackDurationInput.disabled = false;
         // Show feat section elements by default
         const featSectionElement = albumTrackFeatList.closest('.feat-section');
         if (featSectionElement) featSectionElement.classList.remove('hidden');


        if (itemToEdit) {
            // --- Editing Existing Item ---
            editingTrackItem = itemToEdit; // Store reference to the list item element
            // Use dataset or a unique ID if available
            editingTrackItemId.value = itemToEdit.dataset.itemId || `temp_edit_${Date.now()}`; // Fallback ID if needed

            // Populate fields from dataset attributes
            albumTrackNameInput.value = itemToEdit.dataset.trackName || '';
            albumTrackDurationInput.value = itemToEdit.dataset.durationStr || '';
            albumTrackTypeSelect.value = itemToEdit.dataset.trackType || 'B-side'; // Default if not set

            // Populate feat tags if they exist (and it's not an existing linked song)
            const existingSongId = itemToEdit.dataset.existingSongId;
            if (!existingSongId) {
                try {
                    const feats = JSON.parse(itemToEdit.dataset.feats || '[]');
                    feats.forEach(f => {
                        const tag = document.createElement('span');
                        tag.className = 'feat-tag';
                        tag.textContent = `${f.type} ${f.name}`;
                        tag.dataset.artistId = f.id;
                        tag.dataset.featType = f.type;
                        tag.dataset.artistName = f.name;
                        tag.addEventListener('click', () => tag.remove());
                        albumTrackFeatList.appendChild(tag);
                    });
                } catch (e) {
                    console.error("Erro ao parsear feats do dataset:", e);
                }
                 if (featSectionElement) featSectionElement.classList.remove('hidden'); // Ensure feat section visible
            } else {
                 // If editing an item linked to an existing song:
                 albumTrackModalTitle.textContent = 'Editar Faixa (Existente)';
                 editingTrackExistingId.value = existingSongId; // Store the linked song ID
                 // Disable fields that shouldn't be changed for linked songs
                 albumTrackNameInput.disabled = true;
                 albumTrackDurationInput.disabled = true;
                 // Hide feat section as feats are tied to the original song record
                 if (featSectionElement) featSectionElement.classList.add('hidden');
            }

            // Set modal title based on whether it's a new or existing linked track being edited
             if (!existingSongId) {
                 albumTrackModalTitle.textContent = 'Editar Faixa (Nova)';
             }


        } else {
            // --- Adding New Item ---
            albumTrackModalTitle.textContent = 'Adicionar Faixa (Nova)';
            // Generate a temporary unique ID for the new item until saved
            editingTrackItemId.value = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
             if (featSectionElement) featSectionElement.classList.remove('hidden'); // Ensure feat section visible for new
        }

        albumTrackModal.classList.remove('hidden'); // Show the modal
    }


    // closeAlbumTrackModal
    function closeAlbumTrackModal() {
        albumTrackModal?.classList.add('hidden');
        // Clear references and potentially reset fields further if needed
        editingTrackItem = null;
        if(editingTrackItemId) editingTrackItemId.value = '';
         if(editingTrackExistingId) editingTrackExistingId.value = '';
        // Reset inline feat adder
        inlineFeatAdder?.classList.add('hidden');
        if (addInlineFeatBtn) addInlineFeatBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Feat';
    }

    // saveAlbumTrack (Saves data from modal back to the tracklist item or creates a new one)
    function saveAlbumTrack() {
        if (!albumTracklistEditor || !albumTrackNameInput || !albumTrackDurationInput || !albumTrackTypeSelect || !albumTrackFeatList || !editingTrackItemId || !editingTrackExistingId) {
             console.error("Elementos necessários para salvar faixa do álbum não encontrados.");
             return;
        }

        const existingSongId = editingTrackExistingId.value; // ID if linked to an existing song
        const name = albumTrackNameInput.value.trim();
        const durationStr = albumTrackDurationInput.value.trim();
        const type = albumTrackTypeSelect.value;
        const durationSec = parseDurationToSeconds(durationStr);
        const itemId = editingTrackItemId.value; // Temp ID or ID of item being edited

        // Basic validation
        if (!name || !durationStr || durationSec === 0) {
            alert("Nome da faixa e duração (formato MM:SS) são obrigatórios.");
            return;
        }

        // Collect feat data (only relevant if it's NOT an existing linked song)
        let featsData = [];
        if (!existingSongId) {
             const featTags = albumTrackFeatList.querySelectorAll('.feat-tag');
             featsData = Array.from(featTags).map(tag => ({
                 id: tag.dataset.artistId,
                 type: tag.dataset.featType,
                 name: tag.dataset.artistName
             }));
        }


        // Find the target DOM element (either the one being edited or null if new)
        let targetElement = editingTrackItem || albumTracklistEditor.querySelector(`[data-item-id="${itemId}"]`);

        if (targetElement) {
            // --- Editing Existing Item in List ---
            console.log(`Editando item ${itemId}. É existente? ${!!existingSongId}`);
            targetElement.dataset.trackName = name; // Update name (even if disabled, for consistency)
            targetElement.dataset.durationStr = durationStr; // Update duration (even if disabled)
            targetElement.dataset.trackType = type; // Update type (this CAN be edited for existing)

            // Update displayed text
            const titleSpan = targetElement.querySelector('.track-title-display');
             if(titleSpan) titleSpan.textContent = name; // Update display name


            // Re-apply visual cues if it's a linked existing song
            if (existingSongId && titleSpan) {
                 // Ensure the link icon and styling are present
                 if (!titleSpan.querySelector('i.fa-link')) {
                      titleSpan.innerHTML = `<i class="fas fa-link" style="font-size: 10px; margin-right: 5px;" title="Faixa Existente"></i>${name}`;
                 }
                 titleSpan.style.color = 'var(--spotify-green)';
            } else if (titleSpan) {
                 // Ensure styling is normal for non-linked tracks
                 titleSpan.style.color = ''; // Reset color
                 // Remove icon if it exists (shouldn't, but safety check)
                 const icon = titleSpan.querySelector('i.fa-link');
                 if(icon) icon.remove();
            }


            // Update displayed details
             const detailsDiv = targetElement.querySelector('.track-details-display');
             if (detailsDiv) {
                  const durationSpan = detailsDiv.querySelector('.duration');
                  const typeSpan = detailsDiv.querySelector('.type');
                  if(durationSpan) durationSpan.textContent = `Duração: ${durationStr}`;
                  if(typeSpan) typeSpan.textContent = `Tipo: ${type}`;
             }


            // Update displayed feats ONLY if it's not an existing linked song
            const featDisplay = targetElement.querySelector('.feat-list-display');
            if (featDisplay && !existingSongId) {
                targetElement.dataset.feats = JSON.stringify(featsData); // Store updated feats
                featDisplay.innerHTML = featsData.map(f => `<span class="feat-tag-display">${f.type} ${f.name}</span>`).join('');
            } else if (featDisplay && existingSongId) {
                 // Feats shouldn't be edited here, but ensure the display matches the original song if possible
                 // This part might require fetching original song data if feats aren't stored initially
                 // For now, clear it or leave as is if feats were hidden
                 // featDisplay.innerHTML = ''; // Or fetch and display original feats
            }


        } else {
            // --- Adding New Item to List ---
            console.log(`Adicionando novo item ${itemId}`);
            const newItem = document.createElement('div');
            newItem.className = 'track-list-item-display';
            newItem.dataset.itemId = itemId; // Use the temporary ID
            newItem.dataset.trackName = name;
            newItem.dataset.durationStr = durationStr;
            newItem.dataset.trackType = type;
            newItem.dataset.feats = JSON.stringify(featsData); // Store feats for new track
             // NO existingSongId dataset for new tracks

            // Create inner HTML structure for the new list item
            newItem.innerHTML = `
                <span class="track-number-display"></span>
                <i class="fas fa-bars drag-handle"></i>
                <div class="track-actions">
                    <button type="button" class="small-btn edit-track-btn"><i class="fas fa-pencil-alt"></i></button>
                    <button type="button" class="small-btn remove-track-btn"><i class="fas fa-times"></i></button>
                </div>
                <div class="track-info-display">
                    <span class="track-title-display">${name}</span>
                    <div class="track-details-display">
                        <span class="duration">Duração: ${durationStr}</span>
                        <span class="type">Tipo: ${type}</span>
                    </div>
                    <div class="feat-list feat-list-display" style="margin-top:5px;">
                        ${featsData.map(f => `<span class="feat-tag-display">${f.type} ${f.name}</span>`).join('')}
                    </div>
                </div>`;

            // Remove the "empty state" message if it exists
            const emptyState = albumTracklistEditor.querySelector('.empty-state-small');
            if (emptyState) emptyState.remove();

            albumTracklistEditor.appendChild(newItem); // Add the new item to the list
        }

        updateTrackNumbers(); // Renumber all tracks in the list
        closeAlbumTrackModal(); // Close the modal
    }


    // updateTrackNumbers (Renumbers tracks in the album editor list)
    function updateTrackNumbers() {
        if (!albumTracklistEditor) return;
        const trackItems = albumTracklistEditor.querySelectorAll('.track-list-item-display');

        // Handle empty state
        if (trackItems.length === 0) {
            // Add empty state message only if it doesn't already exist
            if (!albumTracklistEditor.querySelector('.empty-state-small')) {
                albumTracklistEditor.innerHTML = '<p class="empty-state-small">Nenhuma faixa adicionada.</p>';
            }
        } else {
            // Remove empty state message if tracks exist
            const emptyState = albumTracklistEditor.querySelector('.empty-state-small');
            if (emptyState) {
                emptyState.remove();
            }
        }

        // Renumber existing tracks
        trackItems.forEach((item, index) => {
            let numberSpan = item.querySelector('.track-number-display');
            // If the number span doesn't exist (e.g., for newly added items), create it
            if (!numberSpan) {
                 console.warn("Criando span de número de faixa ausente para o item:", item.dataset.itemId);
                numberSpan = document.createElement('span');
                numberSpan.className = 'track-number-display';
                // Insert it before the drag handle
                 const dragHandle = item.querySelector('.drag-handle');
                 if (dragHandle) {
                     item.insertBefore(numberSpan, dragHandle);
                 } else {
                     item.prepend(numberSpan); // Fallback: add to the beginning
                 }
            }
            // Update the number text
            numberSpan.textContent = `${index + 1}.`;
            // Apply consistent styling (optional, can be done via CSS)
            numberSpan.style.fontWeight = '700';
            numberSpan.style.color = 'var(--text-secondary)';
            numberSpan.style.width = '25px'; // Adjust as needed
            numberSpan.style.textAlign = 'right';
            numberSpan.style.marginRight = '5px';
        });
    }


    // --- FUNÇÕES DA API AIRTABLE ---

    // createAirtableRecord
    async function createAirtableRecord(tableName, fields) {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
        console.log(`CREATE ${tableName}:`, fields); // Log before sending
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fields: fields })
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Erro Airtable CREATE ${tableName} [${response.status}]:`, JSON.stringify(errorData, null, 2));
                throw new Error(`Erro ${response.status} ao criar registro em ${tableName}: ${errorData?.error?.message || response.statusText}`);
            }
            return await response.json(); // Return the created record data
        } catch (error) {
            console.error(`Falha na requisição CREATE para ${tableName}:`, error);
            // Consider re-throwing or returning a specific error object
            return null; // Indicate failure
        }
    }

    // batchCreateAirtableRecords (Creates up to 10 records at a time)
    async function batchCreateAirtableRecords(tableName, recordsFields) {
        if (!recordsFields || recordsFields.length === 0) return []; // Nothing to create

        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
        const MAX_RECORDS_PER_REQUEST = 10;
        const createdRecords = [];

        // Split records into chunks of 10
        for (let i = 0; i < recordsFields.length; i += MAX_RECORDS_PER_REQUEST) {
            const chunk = recordsFields.slice(i, i + MAX_RECORDS_PER_REQUEST);
            const payload = {
                records: chunk.map(fields => ({ fields })) // Format for batch API
            };
            console.log(`Enviando lote CREATE para ${tableName} (Tamanho: ${chunk.length})`);

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Erro no lote CREATE para ${tableName} [${response.status}]:`, JSON.stringify(errorData, null, 2));
                    // Optionally, decide whether to stop or continue with other chunks
                    throw new Error(`Erro ${response.status} no lote CREATE para ${tableName}`); // Stop on first batch error
                }
                const data = await response.json();
                if (data.records) {
                    createdRecords.push(...data.records);
                }
            } catch (error) {
                console.error(`Falha na requisição do lote CREATE para ${tableName}:`, error);
                // Depending on requirements, you might return null, throw, or return partial results
                return null; // Indicate that the batch operation failed
            }
        }
        console.log(`Lote CREATE para ${tableName} concluído. ${createdRecords.length} registros criados.`);
        return createdRecords; // Return all successfully created records
    }

    // updateAirtableRecord
    async function updateAirtableRecord(tableName, recordId, fields) {
        if (!recordId) {
             console.error(`UPDATE ${tableName}: ID do registro não fornecido.`);
             return null;
        }
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}/${recordId}`;
         console.log(`UPDATE ${tableName} ID ${recordId}:`, fields);
        try {
            const response = await fetch(url, {
                method: 'PATCH', // Use PATCH for partial updates
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fields: fields })
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Erro Airtable UPDATE ${tableName} (ID: ${recordId}) [${response.status}]:`, JSON.stringify(errorData, null, 2));
                throw new Error(`Erro ${response.status} ao atualizar registro ${recordId} em ${tableName}: ${errorData?.error?.message || response.statusText}`);
            }
            return await response.json(); // Return the updated record data
        } catch (error) {
            console.error(`Falha na requisição UPDATE para ${tableName} (ID: ${recordId}):`, error);
            return null; // Indicate failure
        }
    }

    // batchUpdateAirtableRecords (Updates up to 10 records at a time)
    async function batchUpdateAirtableRecords(tableName, recordsToUpdate) {
        // Expects recordsToUpdate as an array of objects: [{ id: "rec...", fields: {...} }, ...]
        if (!recordsToUpdate || recordsToUpdate.length === 0) return [];

        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
        const MAX_RECORDS_PER_REQUEST = 10;
        const updatedRecords = [];

        for (let i = 0; i < recordsToUpdate.length; i += MAX_RECORDS_PER_REQUEST) {
            const chunk = recordsToUpdate.slice(i, i + MAX_RECORDS_PER_REQUEST);
            const payload = {
                records: chunk // Format is already correct [{id, fields}, ...]
            };
            console.log(`Enviando lote UPDATE para ${tableName} (Tamanho: ${chunk.length})`);

            try {
                const response = await fetch(url, {
                    method: 'PATCH', // Use PATCH for batch updates
                    headers: {
                        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Erro no lote UPDATE para ${tableName} [${response.status}]:`, JSON.stringify(errorData, null, 2));
                    throw new Error(`Erro ${response.status} no lote UPDATE para ${tableName}`); // Stop on first batch error
                }
                const data = await response.json();
                if (data.records) {
                    updatedRecords.push(...data.records);
                }
            } catch (error) {
                console.error(`Falha na requisição do lote UPDATE para ${tableName}:`, error);
                return null; // Indicate failure
            }
        }
        console.log(`Lote UPDATE para ${tableName} concluído. ${updatedRecords.length} registros atualizados.`);
        return updatedRecords; // Return all successfully updated records
    }


    // deleteAirtableRecord
    async function deleteAirtableRecord(tableName, recordId) {
         if (!recordId) {
             console.error(`DELETE ${tableName}: ID do registro não fornecido.`);
             return null;
        }
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}/${recordId}`;
        console.log(`DELETE ${tableName} ID ${recordId}`);
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`
                }
            });
            if (!response.ok) {
                 // Handle specific case: Not Found (404) might be acceptable if trying to delete already deleted record
                 if (response.status === 404) {
                      console.warn(`Registro ${recordId} em ${tableName} não encontrado para exclusão (já pode ter sido excluído). Considerando sucesso.`);
                      return { deleted: true, id: recordId }; // Simulate success response structure
                 }
                // For other errors, try parsing the body
                try {
                    const errorData = await response.json();
                    console.error(`Erro Airtable DELETE ${tableName} (ID: ${recordId}) [${response.status}]:`, JSON.stringify(errorData, null, 2));
                    throw new Error(`Erro ${response.status} ao excluir registro ${recordId} em ${tableName}: ${errorData?.error?.message || response.statusText}`);
                } catch (parseError) {
                     // If response body isn't JSON or empty
                     console.error(`Erro Airtable DELETE ${tableName} (ID: ${recordId}), Status: ${response.status}, ${response.statusText}`);
                     throw new Error(`Erro ${response.status} ao excluir registro ${recordId} em ${tableName}`);
                }

            }
            // Check if response has content (Airtable DELETE usually returns 200 OK with content)
             // or sometimes 204 No Content
             if (response.status === 204 || response.headers.get("content-length") === "0") {
                 console.log(`Registro ${recordId} em ${tableName} excluído com sucesso (Status: ${response.status}).`);
                 return { deleted: true, id: recordId }; // Return standard success structure
             } else {
                 return await response.json(); // Return the { deleted: true, id: '...' } object from Airtable
             }
        } catch (error) {
            console.error(`Falha na requisição DELETE para ${tableName} (ID: ${recordId}):`, error);
            return null; // Indicate failure
        }
    }


    // batchDeleteAirtableRecords (Deletes up to 10 records at a time)
    async function batchDeleteAirtableRecords(tableName, recordIds) {
        if (!recordIds || recordIds.length === 0) {
            console.log(`Nenhum registro para excluir em lote de ${tableName}.`);
            return { success: true, results: [] }; // Nothing to do, success
        }

        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
        const MAX_RECORDS_PER_REQUEST = 10;
        const deletedResults = [];
        let allBatchesSucceeded = true;

        for (let i = 0; i < recordIds.length; i += MAX_RECORDS_PER_REQUEST) {
            const chunk = recordIds.slice(i, i + MAX_RECORDS_PER_REQUEST);
            // Format IDs as query parameters: records[]=rec1&records[]=rec2...
            const params = chunk.map(id => `records[]=${encodeURIComponent(id)}`).join('&');
            const batchUrl = `${url}?${params}`;

            console.log(`Enviando lote DELETE para ${tableName} (IDs: ${chunk.join(', ')})`);

            try {
                const response = await fetch(batchUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
                    }
                });
                if (!response.ok) {
                     // Even if one record in the batch fails (e.g., Not Found), Airtable might return 200 OK
                     // with specific errors inside the response body for that record.
                     // However, if the entire request fails (e.g., 400, 401, 403, 500), it's a batch failure.
                    allBatchesSucceeded = false;
                    try {
                        const errorData = await response.json();
                        console.error(`Erro no lote DELETE para ${tableName} (IDs: ${chunk.join(', ')}) [${response.status}]:`, JSON.stringify(errorData, null, 2));
                         // Add failed IDs to results with deleted: false? Or just log?
                         chunk.forEach(id => deletedResults.push({ id: id, deleted: false, error: errorData }));
                    } catch (parseError) {
                        console.error(`Erro no lote DELETE para ${tableName} (IDs: ${chunk.join(', ')}), Status: ${response.status}, ${response.statusText}`);
                         chunk.forEach(id => deletedResults.push({ id: id, deleted: false, error: `Status ${response.status}` }));
                    }
                    // Decide if you want to stop on the first batch error or continue
                    // break; // Uncomment to stop on first batch failure
                } else {
                     // Check for content; Airtable batch delete returns 200 OK with results
                     if (response.status === 204 || response.headers.get("content-length") === "0") {
                          // Unlikely for batch delete, but handle just in case
                          console.warn(`Lote DELETE para ${tableName} retornou ${response.status} inesperado.`);
                          chunk.forEach(id => deletedResults.push({ id: id, deleted: true })); // Assume success if 204
                     } else {
                         const data = await response.json();
                         // The response contains { records: [{ id: "...", deleted: true }, ...] }
                         if (data.records) {
                              deletedResults.push(...data.records);
                         } else {
                              // Handle unexpected successful response format
                              console.warn("Formato inesperado na resposta do lote DELETE:", data);
                              chunk.forEach(id => deletedResults.push({ id: id, deleted: true })); // Assume success
                         }
                     }
                }
            } catch (error) {
                allBatchesSucceeded = false;
                console.error(`Falha na requisição do lote DELETE para ${tableName} (IDs: ${chunk.join(', ')}):`, error);
                 chunk.forEach(id => deletedResults.push({ id: id, deleted: false, error: error.message }));
                // break; // Uncomment to stop on first batch failure
            }
        }
        console.log(`Lote DELETE para ${tableName} concluído. Sucesso geral: ${allBatchesSucceeded}`);
        // Check if all individual results indicate success if needed
         const overallSuccess = allBatchesSucceeded && deletedResults.every(r => r.deleted);
         return { success: overallSuccess, results: deletedResults };
    }


    // parseDurationToSeconds
    function parseDurationToSeconds(durationStr) {
        if (!durationStr || typeof durationStr !== 'string') return 0;
        const parts = durationStr.split(':');
        if (parts.length !== 2) return 0; // Expect MM:SS format

        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);

        // Validate parsed numbers
        if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds > 59) {
            return 0; // Invalid format or values
        }

        return (minutes * 60) + seconds;
    }


    // --- NOVAS FUNÇÕES DE UI (Estúdio) ---

    // populatePlayerTracks (Fills the 'existing track' dropdown for the Single form)
    function populatePlayerTracks(selectElementId) {
        const selectElement = document.getElementById(selectElementId);
        if (!selectElement) {
            console.error(`Elemento select com ID "${selectElementId}" não encontrado.`);
            return;
        }

        const selectedArtistId = singleArtistSelect?.value; // Get artist from the Single form's dropdown

        // Check prerequisites
        if (!currentPlayer) {
            selectElement.innerHTML = '<option value="">Faça login primeiro</option>';
            selectElement.disabled = true;
            return;
        }
        if (!selectedArtistId) {
            selectElement.innerHTML = '<option value="">Selecione um Artista primeiro</option>';
            selectElement.disabled = true;
            return;
        }

        // Filter songs belonging to the selected artist
        const artistSongs = db.songs
            .filter(song => song.artistIds && song.artistIds.includes(selectedArtistId))
            .sort((a, b) => (b.totalStreams || 0) - (a.totalStreams || 0)); // Sort by popularity

        // Populate dropdown
        if (artistSongs.length === 0) {
            selectElement.innerHTML = '<option value="">Nenhuma faixa encontrada para este artista</option>';
            selectElement.disabled = true;
        } else {
            selectElement.innerHTML = '<option value="">Selecione uma faixa existente...</option>';
            selectElement.innerHTML += artistSongs.map(song => {
                // Try to find a primary release name for context
                const primaryReleaseId = song.albumId; // Uses the pre-calculated primary ID
                let releaseName = '(Avulsa)'; // Default
                if (primaryReleaseId) {
                    const release = [...db.albums, ...db.singles].find(r => r.id === primaryReleaseId);
                    if (release) releaseName = `(${release.title})`;
                }
                return `<option value="${song.id}">${song.title} ${releaseName}</option>`;
            }).join('');
            selectElement.disabled = false; // Enable dropdown
        }
    }


    // toggleSingleFormMode (Switches Single form between creating new track vs using existing)
    function toggleSingleFormMode(isResetting = false) {
        if (!toggleExistingSingle || !newTrackInfoGroup || !existingTrackGroup || !singleFeatSection || !existingTrackSelect) {
             console.error("Elementos necessários para alternar modo do formulário de single não encontrados.");
             return;
        }


        const useExisting = isResetting ? false : toggleExistingSingle.checked;

        if (useExisting) {
            // --- Mode: Use Existing Track ---
            newTrackInfoGroup.classList.add('hidden'); // Hide new track fields
            existingTrackGroup.classList.remove('hidden'); // Show existing track dropdown
            singleFeatSection.classList.add('hidden'); // Hide feat section (feats belong to original track)

            // Adjust 'required' attributes
            document.getElementById('trackName')?.removeAttribute('required');
            document.getElementById('trackDuration')?.removeAttribute('required');
            existingTrackSelect.setAttribute('required', 'required');

            // Populate the dropdown if it's empty or needs refreshing
            // (Check if options exist beyond the default placeholder)
             if (existingTrackSelect.options.length <= 1 || existingTrackSelect.options[0]?.value === "") {
                 populatePlayerTracks('existingTrackSelect');
             }

        } else {
            // --- Mode: Create New Track ---
            newTrackInfoGroup.classList.remove('hidden'); // Show new track fields
            existingTrackGroup.classList.add('hidden'); // Hide existing track dropdown
            singleFeatSection.classList.remove('hidden'); // Show feat section

            // Adjust 'required' attributes
            document.getElementById('trackName')?.setAttribute('required', 'required');
            document.getElementById('trackDuration')?.setAttribute('required', 'required');
            existingTrackSelect.removeAttribute('required');
        }

        // If resetting the form (e.g., after logout or submission), clear related fields
        if (isResetting) {
            toggleExistingSingle.checked = false; // Ensure checkbox is unchecked
            existingTrackSelect.value = ''; // Clear selected existing track
             if(existingSingleTrackId) existingSingleTrackId.value = ''; // Clear hidden field for ID
             // Also clear new track fields if resetting
             const trackNameInput = document.getElementById('trackName');
             const trackDurationInput = document.getElementById('trackDuration');
             if (trackNameInput) trackNameInput.value = '';
             if (trackDurationInput) trackDurationInput.value = '';
             // Clear feat list
             const featList = document.getElementById('singleFeatList');
             if (featList) featList.innerHTML = '';


        }
    }


    // openExistingTrackModal (Opens modal to select an existing track for an ALBUM)
    function openExistingTrackModal(context) { // context is 'album' or potentially 'single' later
        if (!currentPlayer) {
            alert("Faça login para adicionar faixas existentes.");
            return;
        }
         // Ensure an artist is selected in the *album* form before opening
         const albumArtistId = albumArtistSelect?.value;
         if (context === 'album' && !albumArtistId) {
              alert("Por favor, selecione primeiro o Artista Principal do álbum/EP.");
              return;
         }


        existingTrackModalContext = context; // Store context (e.g., 'album')
        if(existingTrackSearch) existingTrackSearch.value = ''; // Clear search field
        populateExistingTrackSearch(); // Populate initial results (all tracks for the selected artist)
        existingTrackModal?.classList.remove('hidden'); // Show the modal
    }


    // closeExistingTrackModal
    function closeExistingTrackModal() {
        existingTrackModal?.classList.add('hidden');
        // Optionally clear search and results when closing
         if(existingTrackSearch) existingTrackSearch.value = '';
         if(existingTrackResults) existingTrackResults.innerHTML = '<p class="empty-state-small">Busque por uma faixa.</p>';
    }

    // populateExistingTrackSearch (Filters tracks in the "Add Existing Track" modal)
    function populateExistingTrackSearch() {
        if (!existingTrackResults) return; // Exit if results container doesn't exist

        if (!currentPlayer) {
            existingTrackResults.innerHTML = '<p class="empty-state-small">Faça login para buscar.</p>';
            return;
        }

        // Get the selected artist from the *ALBUM* form's dropdown
        const selectedArtistId = albumArtistSelect?.value;
        if (!selectedArtistId) {
            existingTrackResults.innerHTML = '<p class="empty-state-small">Selecione um Artista no formulário do álbum/EP primeiro.</p>';
            return;
        }

        const query = existingTrackSearch?.value.toLowerCase().trim() || ''; // Get search query

        // Filter songs: must belong to the selected artist AND match the query (if any)
        const filteredSongs = db.songs
            .filter(song => {
                const isArtistSong = song.artistIds && song.artistIds.includes(selectedArtistId);
                const matchesQuery = query === '' || song.title.toLowerCase().includes(query); // Match if query empty or title includes query
                return isArtistSong && matchesQuery;
            })
            .sort((a, b) => (b.totalStreams || 0) - (a.totalStreams || 0)); // Sort by popularity

        // Display results or empty state message
        if (filteredSongs.length === 0) {
            existingTrackResults.innerHTML = query ?
                '<p class="empty-state-small">Nenhuma faixa encontrada para esta busca.</p>' :
                '<p class="empty-state-small">Nenhuma faixa encontrada para este artista.</p>';
        } else {
            existingTrackResults.innerHTML = filteredSongs.map(song => `
                <div class="existing-track-item" data-song-id="${song.id}" title="Adicionar '${song.title}'">
                    <img src="${song.cover || getCoverUrl(song.albumId)}" alt="${song.title}">
                    <div class="existing-track-item-info">
                        <span class="existing-track-item-title">${song.title}</span>
                        <span class="existing-track-item-artist">${song.artist}</span>
                    </div>
                     <i class="fas fa-plus add-icon"></i>
                </div>
            `).join('');
        }
    }


    // handleExistingTrackSelect (Adds the selected track to the ALBUM tracklist)
    function handleExistingTrackSelect(event) {
        const selectedItem = event.target.closest('.existing-track-item');
        if (!selectedItem) return; // Exit if click wasn't on an item

        const songId = selectedItem.dataset.songId;
        if (!songId) return; // Exit if item has no song ID

        // Check context (currently only 'album' is implemented here)
        if (existingTrackModalContext === 'album') {
            addExistingTrackToAlbum(songId); // Add the selected song to the album editor
        } else {
            console.warn(`Contexto não suportado para seleção de faixa existente: ${existingTrackModalContext}`);
        }
    }

    // addExistingTrackToAlbum (Creates a new list item in the album editor linked to an existing song)
    function addExistingTrackToAlbum(songId) {
        const song = db.songs.find(s => s.id === songId);
        if (!song) {
            alert("Erro: Música selecionada não encontrada nos dados locais.");
            console.error(`Tentativa de adicionar faixa existente com ID ${songId} falhou.`);
            return;
        }
        if (!albumTracklistEditor) {
             console.error("Editor de tracklist do álbum não encontrado.");
             return;
        }


        // Check if this song ID is already in the list
        if (albumTracklistEditor.querySelector(`[data-existing-song-id="${song.id}"]`)) {
            alert("Esta música já foi adicionada à tracklist.");
            return; // Don't add duplicates
        }

        // Prepare feat data based on the *original* song's artists (excluding primary)
        const featsData = (song.artistIds || [])
            .slice(1) // Get all artist IDs except the first one
            .map(artistId => {
                const artist = db.artists.find(a => a.id === artistId);
                return {
                    id: artistId,
                    type: song.collabType || 'Feat.', // Use original collab type or default
                    name: artist ? artist.name : '?'
                };
            });

        // Create the new list item element
        const newItem = document.createElement('div');
        newItem.className = 'track-list-item-display';
        // Use a unique itemId combining 'existing_' and songId
        newItem.dataset.itemId = `existing_${song.id}`;
        // Store crucial data linking this item to the original song
        newItem.dataset.existingSongId = song.id;
        newItem.dataset.trackName = song.title; // Use original name
        newItem.dataset.durationStr = song.duration; // Use original duration
        newItem.dataset.trackType = song.trackType; // Use original type (can be edited later)
        newItem.dataset.feats = JSON.stringify(featsData); // Store original feats (not editable here)

        // Visual cue for linked tracks
        const titleDisplay = `<span class="track-title-display" style="color: var(--spotify-green);">
                                <i class="fas fa-link" style="font-size: 10px; margin-right: 5px;" title="Faixa Existente"></i>${song.title}
                              </span>`;

        // Set inner HTML for the list item
        newItem.innerHTML = `
            <span class="track-number-display"></span>
            <i class="fas fa-bars drag-handle"></i>
            <div class="track-actions">
                <button type="button" class="small-btn edit-track-btn" title="Editar tipo de faixa (Ex: B-side -> Title Track)">
                    <i class="fas fa-pencil-alt"></i>
                </button>
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

        // Remove empty state message if present
        const emptyState = albumTracklistEditor.querySelector('.empty-state-small');
        if (emptyState) emptyState.remove();

        // Add the new item and renumber
        albumTracklistEditor.appendChild(newItem);
        updateTrackNumbers();
        closeExistingTrackModal(); // Close the selection modal
    }


    // --- FUNÇÕES DE SUBMISSÃO ---

     // handleSingleSubmit (Starts the single submission process, shows track type modal)
     async function handleSingleSubmit(event) {
         event.preventDefault(); // Prevent default form submission (page reload)
         const submitButton = document.getElementById('submitNewSingle');
         if (!submitButton) return;

         // --- Validation ---
         const isExisting = toggleExistingSingle?.checked;
         const artistId = singleArtistSelect?.value;
         const title = document.getElementById('singleTitle')?.value;
         const coverUrl = document.getElementById('singleCoverUrl')?.value;
         const releaseDateTimeLocal = singleReleaseDateInput?.value;

         if (!artistId || !title || !coverUrl || !releaseDateTimeLocal) {
             alert("Preencha todos os campos do single (Artista, Nome, Capa, Data/Hora).");
             return;
         }

         // Validate track info based on mode (new vs existing)
         if (isExisting) {
             const existingSongId = existingTrackSelect?.value;
             if (!existingSongId) {
                 alert("Selecione uma faixa existente para promover como single.");
                 return;
             }
              // Store the selected existing song ID in the hidden input
              if(existingSingleTrackId) existingSingleTrackId.value = existingSongId;

         } else {
             const trackName = document.getElementById('trackName')?.value;
             const trackDuration = document.getElementById('trackDuration')?.value;
             if (!trackName || !trackDuration || parseDurationToSeconds(trackDuration) === 0) {
                 alert("Preencha o nome e a duração (MM:SS) válidos para a nova faixa.");
                 return;
             }
              // Clear the existing song ID hidden input if creating new
               if(existingSingleTrackId) existingSingleTrackId.value = '';
         }

         // Disable button and show loading state
         submitButton.disabled = true;
         submitButton.textContent = 'Aguardando Tipo...';

         // Show the track type selection modal
         trackTypeModal?.classList.remove('hidden');
     }

     // processSingleSubmission (Continues submission after track type is selected)
     async function processSingleSubmission(trackType) {
         const submitButton = document.getElementById('submitNewSingle');
         trackTypeModal?.classList.add('hidden'); // Hide the type modal
         if (submitButton) submitButton.textContent = 'Enviando...'; // Update button text

         try {
             // Retrieve all necessary data from the form
             const artistId = singleArtistSelect.value; // Already validated
             const title = document.getElementById('singleTitle').value; // Already validated
             const coverUrl = document.getElementById('singleCoverUrl').value; // Already validated
             const releaseDateTimeLocal = singleReleaseDateInput.value; // Already validated (YYYY-MM-DDTHH:MM)
             const existingSongId = existingSingleTrackId.value; // Get ID from hidden input (or empty string)

             // Convert local datetime string to full ISO 8601 UTC string for Airtable
             const releaseDateISO = new Date(releaseDateTimeLocal).toISOString();
             if (isNaN(new Date(releaseDateISO).getTime())) { // Double-check conversion
                  throw new Error("Data/Hora de lançamento inválida após conversão.");
             }


             // --- Step 1: Create the Single/EP Record in Airtable ---
             const singleRecordFields = {
                 "Nome do Single/EP": title,
                 "Artista": [artistId],
                 "Capa": [{ "url": coverUrl }],
                 "Data de Lançamento": releaseDateISO // Send the full ISO string
             };
             const singleResponse = await createAirtableRecord('Singles e EPs', singleRecordFields);

             if (!singleResponse || !singleResponse.id) {
                 throw new Error("Falha ao criar o registro do Single/EP no Airtable.");
             }
             const newSingleId = singleResponse.id;
             console.log(`Registro Single/EP criado com ID: ${newSingleId}`);

             // --- Step 2: Create or Update the Music Record ---
             let musicRecordId = null;
             if (existingSongId) {
                 // --- Update Existing Music Record ---
                 console.log(`Atualizando faixa existente ID: ${existingSongId} para vincular ao novo single ${newSingleId}`);
                 const songData = db.songs.find(s => s.id === existingSongId); // Get current links
                 const existingSingleLinks = songData?.singleIds || [];
                 // Add the new single ID to the existing links (using Set to avoid duplicates)
                 const updatedSingleLinks = [...new Set([...existingSingleLinks, newSingleId])];

                 const musicUpdateFields = {
                     "Singles e EPs": updatedSingleLinks, // Link to the new single
                     "Tipo de Faixa": trackType // Update track type if needed
                 };
                 const musicUpdateResponse = await updateAirtableRecord('Músicas', existingSongId, musicUpdateFields);
                 if (!musicUpdateResponse || !musicUpdateResponse.id) {
                      // Attempt to delete the just-created single if music update fails? (Rollback logic)
                      console.error(`Falha ao ATUALIZAR a música ${existingSongId} para vincular ao single ${newSingleId}.`);
                      await deleteAirtableRecord('Singles e EPs', newSingleId); // Attempt rollback
                      throw new Error("Falha ao atualizar a música existente. O single foi removido.");
                 }
                  musicRecordId = musicUpdateResponse.id;
                 console.log(`Música ${musicRecordId} atualizada com sucesso.`);

             } else {
                 // --- Create New Music Record ---
                 console.log(`Criando nova faixa para o single ${newSingleId}`);
                 const trackName = document.getElementById('trackName').value; // Already validated
                 const trackDurationStr = document.getElementById('trackDuration').value; // Already validated
                 const trackDurationSec = parseDurationToSeconds(trackDurationStr);

                 const featTags = document.querySelectorAll('#singleFeatList .feat-tag');
                 let finalArtistIds = [artistId]; // Start with main artist
                 let collaborationType = null;
                 let finalTrackName = trackName;
                 let featNames = [];

                 if (featTags.length > 0) {
                     collaborationType = featTags[0].dataset.featType; // Get type from first tag
                     featTags.forEach(tag => {
                         finalArtistIds.push(tag.dataset.artistId); // Add feat artist ID
                         featNames.push(tag.dataset.artistName); // Collect names for display text
                     });
                     // Append (feat. ...) to track name if it's a 'Feat.' type
                     if (collaborationType === "Feat.") {
                         finalTrackName = `${trackName} (feat. ${featNames.join(', ')})`;
                     }
                 }

                 const musicCreateFields = {
                     "Nome da Faixa": finalTrackName,
                     "Artista": finalArtistIds,
                     "Duração": trackDurationSec,
                     "Nº da Faixa": 1, // Singles usually have track number 1
                     "Singles e EPs": [newSingleId], // Link to the created single
                     "Tipo de Faixa": trackType,
                      ...(collaborationType && { "Tipo de Colaboração": collaborationType }) // Add collab type if exists
                 };

                 const musicCreateResponse = await createAirtableRecord('Músicas', musicCreateFields);
                 if (!musicCreateResponse || !musicCreateResponse.id) {
                      // Attempt rollback
                      console.error(`Falha ao CRIAR a música para o single ${newSingleId}.`);
                      await deleteAirtableRecord('Singles e EPs', newSingleId); // Attempt rollback
                     throw new Error("Falha ao criar a nova música. O single foi removido.");
                 }
                  musicRecordId = musicCreateResponse.id;
                 console.log(`Nova música ${musicRecordId} criada com sucesso.`);
             }

             // --- Step 3: Success and Cleanup ---
             alert("Single lançado com sucesso!");
             newSingleForm?.reset(); // Reset form fields

             // Reset release date to current datetime-local
             if (singleReleaseDateInput) {
                 const now = new Date();
                 now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                 now.setSeconds(0); now.setMilliseconds(0);
                 singleReleaseDateInput.value = now.toISOString().slice(0, 16);
             }
             // Clear feat list specifically
             const featList = document.getElementById('singleFeatList');
             if(featList) featList.innerHTML = '';
             // Reset the form mode toggle
             toggleSingleFormMode(true); // Reset to 'new track' mode

             await refreshAllData(); // Refresh all data to show the new release

         } catch (error) {
             alert(`Erro ao lançar o single: ${error.message}. Verifique o console.`);
             console.error("Erro detalhado em processSingleSubmission:", error);
         } finally {
             // Re-enable the submit button regardless of success or failure
             if (submitButton) {
                 submitButton.disabled = false;
                 submitButton.textContent = 'Lançar Single';
             }
              // Clear the hidden existing song ID field
              if(existingSingleTrackId) existingSingleTrackId.value = '';
         }
     }

     // initAlbumForm (Resets and initializes the album form, including SortableJS)
     function initAlbumForm() {
         // Clear the tracklist editor display
         if (albumTracklistEditor) {
             albumTracklistEditor.innerHTML = '<p class="empty-state-small">Nenhuma faixa adicionada.</p>';
         }
         updateTrackNumbers(); // Ensure numbering is correct (or shows empty state)

         // Initialize or re-initialize SortableJS for drag-and-drop
         if (albumTracklistEditor && typeof Sortable !== 'undefined') {
             // Destroy previous instance if it exists to avoid conflicts
             if (albumTracklistSortable) {
                 albumTracklistSortable.destroy();
             }
             // Create new Sortable instance
             albumTracklistSortable = Sortable.create(albumTracklistEditor, {
                 animation: 150, // Animation duration
                 handle: '.drag-handle', // Class of the element used for dragging
                 onEnd: updateTrackNumbers // Update track numbers after dragging stops
             });
         } else if (typeof Sortable === 'undefined') {
             console.warn("Biblioteca SortableJS não carregada. Funcionalidade de arrastar e soltar tracklist desativada.");
              // Optionally disable drag handles or show a message
         }
          // Reset other album form fields if needed (e.g., title, cover URL)
          // document.getElementById('albumTitle').value = '';
          // document.getElementById('albumCoverUrl').value = '';
          // Resetting date is handled in initializeDOMElements and after successful submit
     }

    // handleAlbumSubmit (Handles submission of the new album/EP form)
    async function handleAlbumSubmit(event) {
        event.preventDefault(); // Prevent page reload
        const submitButton = document.getElementById('submitNewAlbum');
        if (!submitButton) return;

        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        try {
            // --- Collect and Validate Album/EP Info ---
            const artistId = albumArtistSelect?.value;
            const title = document.getElementById('albumTitle')?.value;
            const coverUrl = document.getElementById('albumCoverUrl')?.value;
            const releaseDateTimeLocal = albumReleaseDateInput?.value; // YYYY-MM-DDTHH:MM

            if (!artistId || !title || !coverUrl || !releaseDateTimeLocal) {
                throw new Error("Preencha todos os campos do Álbum/EP (Artista, Nome, Capa, Data/Hora).");
            }

            // Convert local datetime to ISO 8601 UTC string
            const releaseDateISO = new Date(releaseDateTimeLocal).toISOString();
             if (isNaN(new Date(releaseDateISO).getTime())) {
                 throw new Error("Data/Hora de lançamento inválida.");
             }


            // --- Collect and Validate Tracklist Info ---
            const trackItems = albumTracklistEditor?.querySelectorAll('.track-list-item-display');
            if (!trackItems || trackItems.length === 0) { // Check if *any* tracks exist
                throw new Error("Adicione pelo menos uma faixa ao Álbum/EP.");
            }

            let totalDurationSeconds = 0;
            const musicRecordsToCreate = []; // Array for new music records to be batch created
            const musicRecordsToUpdate = []; // Array for existing music records to be batch updated (linking)

            // Process each track item in the editor list
            for (let i = 0; i < trackItems.length; i++) {
                const item = trackItems[i];
                const existingSongId = item.dataset.existingSongId; // ID if linked
                const name = item.dataset.trackName;
                const durationStr = item.dataset.durationStr;
                const type = item.dataset.trackType;
                 // Parse feats only if it's NOT an existing song (feats shouldn't be edited here)
                 let feats = [];
                 if (!existingSongId) {
                      try {
                           feats = JSON.parse(item.dataset.feats || '[]');
                      } catch (e) {
                           console.warn(`Erro ao parsear feats para a faixa ${i + 1}:`, e);
                           // Continue without feats for this track if parsing fails
                      }
                 }

                const durationSec = parseDurationToSeconds(durationStr);

                // Validate individual track data
                if (!name || !durationStr || durationSec === 0) {
                    throw new Error(`Dados inválidos na Faixa ${i + 1}. Verifique nome e duração (MM:SS).`);
                }
                totalDurationSeconds += durationSec;

                // Prepare data for Airtable based on whether it's a new or existing track
                if (existingSongId) {
                    // --- Prepare Update for Existing Track ---
                    // We only need to set the Track Number and potentially update the Type
                    // The linking happens after the Album/EP record is created
                    musicRecordsToUpdate.push({
                        id: existingSongId,
                        fields: {
                            "Nº da Faixa": i + 1, // Set track number based on order in list
                            "Tipo de Faixa": type // Update type (e.g., from B-side to Title Track)
                        }
                        // Link field (Álbuns or Singles e EPs) will be added later
                    });
                } else {
                    // --- Prepare Create for New Track ---
                    let finalTrackName = name;
                    let finalArtistIds = [artistId]; // Start with main album artist
                    let collaborationType = null;

                    if (feats.length > 0) {
                        collaborationType = feats[0].type; // Get type from first feat
                        const featIds = feats.map(f => f.id);
                        const featNames = feats.map(f => f.name);
                        finalArtistIds = [artistId, ...featIds]; // Combine main and feat artists
                        // Adjust track name for display if it's a "Feat."
                        if (collaborationType === "Feat.") {
                            finalTrackName = `${name} (feat. ${featNames.join(', ')})`;
                        }
                    }

                    const newRecordFields = {
                        "Nome da Faixa": finalTrackName,
                        "Artista": finalArtistIds,
                        "Duração": durationSec,
                        "Nº da Faixa": i + 1, // Set track number
                        "Tipo de Faixa": type,
                         ...(collaborationType && { "Tipo de Colaboração": collaborationType }) // Add collab type if present
                        // Link field (Álbuns or Singles e EPs) will be added later
                    };
                    musicRecordsToCreate.push(newRecordFields);
                }
            } // End of tracklist loop

            // --- Determine if it's an Album or EP based on duration ---
            // Simple rule: >= 30 minutes = Album, otherwise EP (treated as Single type in Airtable)
             // ADJUST THIS THRESHOLD IF NEEDED
             const IS_ALBUM_THRESHOLD_SECONDS = 30 * 60; // 30 minutes
             const isAlbum = totalDurationSeconds >= IS_ALBUM_THRESHOLD_SECONDS;

             const targetTableName = isAlbum ? 'Álbuns' : 'Singles e EPs';
             const nameFieldName = isAlbum ? 'Nome do Álbum' : 'Nome do Single/EP';
             const coverFieldName = isAlbum ? 'Capa do Álbum' : 'Capa';
             const linkFieldName = isAlbum ? 'Álbuns' : 'Singles e EPs'; // Field name in 'Músicas' table


            // --- Step 1: Create the Album/EP Record ---
            console.log(`Criando registro em ${targetTableName}...`);
            const releaseRecordFields = {
                [nameFieldName]: title,
                "Artista": [artistId],
                [coverFieldName]: [{ "url": coverUrl }],
                "Data de Lançamento": releaseDateISO
            };
            const releaseResponse = await createAirtableRecord(targetTableName, releaseRecordFields);

            if (!releaseResponse || !releaseResponse.id) {
                throw new Error(`Falha ao criar o registro ${isAlbum ? 'do Álbum' : 'do EP'} no Airtable.`);
            }
            const newReleaseId = releaseResponse.id;
            console.log(`${isAlbum ? 'Álbum' : 'EP'} criado com ID: ${newReleaseId}`);

            // --- Step 2: Add Links to Music Records ---
            // Add the newReleaseId to the records prepared earlier
            musicRecordsToCreate.forEach(record => { record[linkFieldName] = [newReleaseId]; });
            musicRecordsToUpdate.forEach(record => {
                // Find original song data to correctly merge links if it was already linked elsewhere
                const originalSong = db.songs.find(s => s.id === record.id);
                 const existingLinks = (isAlbum ? originalSong?.albumIds : originalSong?.singleIds) || [];
                 // Add new link, ensuring no duplicates
                 record.fields[linkFieldName] = [...new Set([...existingLinks, newReleaseId])];
            });

            // --- Step 3: Batch Create/Update Music Records ---
            let createdMusicResult = null;
            let updatedMusicResult = null;
            let allMusicOpsSucceeded = true;

            if (musicRecordsToCreate.length > 0) {
                console.log(`Criando ${musicRecordsToCreate.length} novas músicas...`);
                createdMusicResult = await batchCreateAirtableRecords('Músicas', musicRecordsToCreate);
                if (!createdMusicResult || createdMusicResult.length !== musicRecordsToCreate.length) {
                    allMusicOpsSucceeded = false;
                    console.error("Falha ao criar uma ou mais músicas novas no lote.");
                     // Consider more complex rollback: delete created musics and the release?
                }
            }
            if (musicRecordsToUpdate.length > 0) {
                console.log(`Atualizando ${musicRecordsToUpdate.length} músicas existentes...`);
                updatedMusicResult = await batchUpdateAirtableRecords('Músicas', musicRecordsToUpdate);
                if (!updatedMusicResult || updatedMusicResult.length !== musicRecordsToUpdate.length) {
                    allMusicOpsSucceeded = false;
                    console.error("Falha ao atualizar uma ou mais músicas existentes no lote.");
                     // Consider rollback
                }
            }

            // --- Step 4: Final Feedback and Cleanup ---
            if (!allMusicOpsSucceeded) {
                // Partial success or failure
                alert(`${isAlbum ? 'Álbum' : 'EP'} lançado, mas ocorreu um erro ao criar/atualizar uma ou mais faixas. Verifique o console.`);
                 // The release record itself was created, but tracks might be missing/unlinked
            } else {
                // Full success
                alert(`${isAlbum ? 'Álbum' : 'EP'} lançado com sucesso!`);
            }

            newAlbumForm?.reset(); // Reset form fields
            // Reset release date to current datetime-local
            if (albumReleaseDateInput) {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                now.setSeconds(0); now.setMilliseconds(0);
                albumReleaseDateInput.value = now.toISOString().slice(0, 16);
            }
            initAlbumForm(); // Re-initialize the form (clears tracklist, resets Sortable)
            await refreshAllData(); // Refresh all data to show the new release

        } catch (error) {
            alert(`Erro ao lançar ${isAlbum ? 'o Álbum' : 'o EP'}: ${error.message}. Verifique o console.`);
            console.error(`Erro detalhado em handleAlbumSubmit:`, error);
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = `Lançar ${isAlbum ? 'Álbum' : 'EP'}`;
        }
    }


    // --- FUNÇÕES DE EDIÇÃO/EXCLUSÃO ---

    // populateEditableReleases (Fills the list in the 'Edit Release' tab)
    function populateEditableReleases() {
        if (!editReleaseList) return; // Exit if list element not found

        if (!currentPlayer) {
            editReleaseList.innerHTML = '<p class="empty-state-small">Faça login para ver seus lançamentos.</p>';
            return;
        }

        const selectedArtistId = editArtistFilterSelect?.value; // Get value from filter dropdown
        const playerArtistIds = currentPlayer.artists || []; // Get IDs of artists managed by the player

        let releasesToDisplay;

        // Filter releases: either by selected artist or all player's artists
        if (selectedArtistId && selectedArtistId !== 'all') {
            // Filter by the specific artist selected in the dropdown
            releasesToDisplay = [...db.albums, ...db.singles]
                .filter(release => release.artistId === selectedArtistId);
        } else {
            // Show all releases from artists associated with the player
            releasesToDisplay = [...db.albums, ...db.singles]
                .filter(release => playerArtistIds.includes(release.artistId));
        }

        // Sort the filtered releases by date (most recent first)
        const sortedReleases = releasesToDisplay.sort((a, b) => {
             // Handle potentially null dates gracefully during sort
             const dateA = a.releaseDate ? new Date(a.releaseDate) : new Date(0); // Treat null as very old
             const dateB = b.releaseDate ? new Date(b.releaseDate) : new Date(0);
             return dateB - dateA; // Descending order
        });


        // Render the list
        if (sortedReleases.length === 0) {
            editReleaseList.innerHTML = '<p class="empty-state-small">Nenhum lançamento encontrado para este filtro.</p>';
        } else {
            editReleaseList.innerHTML = sortedReleases.map(release => `
                <div class="edit-release-item">
                    <img src="${release.imageUrl}" alt="${release.title}" class="edit-release-cover">
                    <div class="edit-release-info">
                        <span class="edit-release-title">${release.title}</span>
                         <span class="edit-release-artist">
                              ${release.artist} - ${release.releaseDate ? new Date(release.releaseDate).getFullYear() : 'Sem Data'}
                              <span class="release-type-badge ${release.type}">${release.type === 'album' ? 'Álbum' : 'Single/EP'}</span>
                         </span>

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
                </div>
            `).join('');
        }
    }


    // openEditForm (Populates the edit form with data from the selected release)
    function openEditForm(releaseId, releaseType) {
        const release = (releaseType === 'album' ? db.albums : db.singles).find(r => r.id === releaseId);

        if (!release || !editReleaseForm || !editReleaseId || !editReleaseType || !editReleaseTableName || !editArtistNameDisplay || !editReleaseTitle || !editReleaseCoverUrl || !editReleaseDate) {
            alert("Erro: Lançamento não encontrado ou elementos do formulário de edição faltando.");
             console.error("Falha ao abrir formulário de edição. Release:", release, "Form elements found?", !!editReleaseForm);
            return;
        }

        // Populate hidden fields
        editReleaseId.value = release.id;
        editReleaseType.value = release.type;
        editReleaseTableName.value = release.tableName;

        // Populate visible fields
        editArtistNameDisplay.textContent = release.artist; // Display artist name (non-editable here)
        editReleaseTitle.value = release.title;
        editReleaseCoverUrl.value = release.imageUrl;

        // Populate datetime-local input correctly
        if (release.releaseDate) {
            try {
                const releaseDateObj = new Date(release.releaseDate);
                // Adjust for local timezone offset before slicing
                releaseDateObj.setMinutes(releaseDateObj.getMinutes() - releaseDateObj.getTimezoneOffset());
                // Get the 'YYYY-MM-DDTHH:MM' part
                editReleaseDate.value = releaseDateObj.toISOString().slice(0, 16);
            } catch (e) {
                console.error("Erro ao formatar data/hora para edição:", e, "Data original:", release.releaseDate);
                editReleaseDate.value = ''; // Clear if formatting fails
            }
        } else {
            editReleaseDate.value = ''; // Clear if no original date
        }

        // Switch visibility from list to form
        editReleaseListContainer?.classList.add('hidden');
        editReleaseForm.classList.remove('hidden');
    }


    // handleUpdateRelease (Saves changes from the edit form to Airtable)
    async function handleUpdateRelease(event) {
        event.preventDefault(); // Prevent default form submission
        if (!saveEditBtn || !editReleaseId || !editReleaseTableName || !editReleaseTitle || !editReleaseCoverUrl || !editReleaseDate) {
            console.error("Elementos do formulário de edição faltando ao tentar salvar.");
            return;
        }

        const recordId = editReleaseId.value;
        const tableName = editReleaseTableName.value;
        // const type = editReleaseType.value; // Type is not usually changed
        const updatedTitle = editReleaseTitle.value.trim();
        const updatedCoverUrl = editReleaseCoverUrl.value.trim();
        const updatedReleaseDateTimeLocal = editReleaseDate.value; // YYYY-MM-DDTHH:MM

        // Basic validation
        if (!recordId || !tableName || !updatedTitle || !updatedCoverUrl || !updatedReleaseDateTimeLocal) {
            alert("Erro: Dados inválidos ou faltando para a edição. Verifique todos os campos.");
            return;
        }

        // Convert local datetime back to ISO 8601 UTC string
        let updatedReleaseDateISO;
        try {
             updatedReleaseDateISO = new Date(updatedReleaseDateTimeLocal).toISOString();
             if (isNaN(new Date(updatedReleaseDateISO).getTime())) { // Validate conversion
                  throw new Error("Data/Hora inválida.");
             }
        } catch (e) {
             alert("Erro: Data/Hora de lançamento inválida.");
             console.error("Erro ao converter data/hora local para ISO:", e, "Valor local:", updatedReleaseDateTimeLocal);
             return;
        }


        // Disable button and show loading state
        saveEditBtn.disabled = true;
        saveEditBtn.textContent = 'Salvando...';

        // Determine correct field names based on table
        const titleFieldName = (tableName === 'Álbuns') ? 'Nome do Álbum' : 'Nome do Single/EP';
        const coverFieldName = (tableName === 'Álbuns') ? 'Capa do Álbum' : 'Capa';

        // Prepare fields object for Airtable PATCH request
        const fieldsToUpdate = {
            [titleFieldName]: updatedTitle,
            [coverFieldName]: [{ "url": updatedCoverUrl }], // Airtable attachment format
            "Data de Lançamento": updatedReleaseDateISO // Send full ISO string
        };

        try {
            // Call the Airtable update function
            const result = await updateAirtableRecord(tableName, recordId, fieldsToUpdate);
            if (result && result.id) {
                alert("Lançamento atualizado com sucesso!");
                // Hide form, show list again
                editReleaseForm.classList.add('hidden');
                editReleaseListContainer?.classList.remove('hidden');
                await refreshAllData(); // Refresh data to reflect changes
            } else {
                // updateAirtableRecord handles its own errors, but add a fallback
                throw new Error("Falha ao atualizar o registro no Airtable. Resposta inesperada.");
            }
        } catch (error) {
            alert(`Erro ao salvar alterações: ${error.message}. Verifique o console.`);
            console.error("Erro detalhado em handleUpdateRelease:", error);
        } finally {
            // Re-enable button
            saveEditBtn.disabled = false;
            saveEditBtn.textContent = 'Salvar Alterações';
        }
    }


    // openDeleteConfirmModal
    function openDeleteConfirmModal(recordId, tableName, releaseTitle, trackIds) {
        if (!deleteConfirmModal || !deleteRecordId || !deleteTableName || !deleteReleaseName || !deleteTrackIds) {
             console.error("Elementos do modal de confirmação de exclusão não encontrados.");
             return;
        }

        // Populate hidden fields with data needed for deletion
        deleteRecordId.value = recordId;
        deleteTableName.value = tableName;
        deleteReleaseName.textContent = releaseTitle; // Display name for confirmation
        // Store track IDs as a JSON string
        deleteTrackIds.value = JSON.stringify(trackIds || []);

        deleteConfirmModal.classList.remove('hidden'); // Show the modal
    }

    // closeDeleteConfirmModal
    function closeDeleteConfirmModal() {
        if (!deleteConfirmModal || !deleteRecordId || !deleteTableName || !deleteReleaseName || !deleteTrackIds) return;
        deleteConfirmModal.classList.add('hidden'); // Hide the modal
        // Clear fields
        deleteRecordId.value = '';
        deleteTableName.value = '';
        deleteReleaseName.textContent = '';
        deleteTrackIds.value = '';
    }

    // handleDeleteRelease (Handles the actual deletion after confirmation)
    async function handleDeleteRelease() {
        if (!confirmDeleteBtn || !deleteRecordId || !deleteTableName || !deleteTrackIds) {
             console.error("Botão de confirmação ou campos ocultos não encontrados para exclusão.");
             return;
        }


        const recordId = deleteRecordId.value;
        const tableName = deleteTableName.value;
        const trackIdsString = deleteTrackIds.value;
        let associatedTrackIds = [];

        try {
            associatedTrackIds = JSON.parse(trackIdsString || '[]'); // Parse track IDs safely
        } catch (e) {
            console.error("Erro ao parsear IDs das músicas para exclusão:", e);
            // Decide how to proceed: stop deletion or continue without track processing?
             alert("Erro interno ao processar faixas associadas. A exclusão pode falhar ou ser incompleta.");
            // return; // Option: Stop here
        }

        if (!recordId || !tableName) {
            alert("Erro: Informações inválidas para exclusão (ID ou Tabela faltando).");
            closeDeleteConfirmModal();
            return;
        }

        // Disable button, show loading state
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Apagando...';

        try {
            let tracksProcessedSuccessfully = true; // Flag to track track operations

            // --- Step 1: Process Associated Tracks (Unlink or Delete) ---
            if (associatedTrackIds.length > 0) {
                console.log(`Processando ${associatedTrackIds.length} músicas associadas...`);
                const updates = []; // Tracks to be unlinked
                const deletes = []; // Tracks to be deleted

                for (const trackId of associatedTrackIds) {
                    const song = db.songs.find(s => s.id === trackId);
                    if (!song) {
                         console.warn(`Música associada com ID ${trackId} não encontrada nos dados locais. Pulando.`);
                         continue; // Skip if song data isn't available
                    }

                    // Count how many albums AND singles this song is linked to
                    const albumLinksCount = (song.albumIds || []).length;
                    const singleLinksCount = (song.singleIds || []).length;
                    const totalLinks = albumLinksCount + singleLinksCount;

                    // If linked to more than just the release being deleted, only unlink
                    if (totalLinks > 1) {
                        console.log(`Desvinculando música ${trackId} do lançamento ${recordId} em ${tableName}`);
                        const isAlbumTable = tableName === 'Álbuns';
                        const linkField = isAlbumTable ? 'Álbuns' : 'Singles e EPs';
                        const currentLinks = (isAlbumTable ? song.albumIds : song.singleIds) || [];
                        // Create new array excluding the ID of the release being deleted
                        const updatedLinks = currentLinks.filter(linkId => linkId !== recordId);
                        // Add to batch update payload
                        updates.push({ id: trackId, fields: { [linkField]: updatedLinks } });
                    } else {
                        // If only linked to this release, mark for deletion
                        console.log(`Marcando música ${trackId} para exclusão (único vínculo).`);
                        deletes.push(trackId);
                    }
                } // End loop through track IDs

                // Perform batch updates (unlinking)
                if (updates.length > 0) {
                    console.log(`Desvinculando ${updates.length} músicas...`);
                    const updateResult = await batchUpdateAirtableRecords('Músicas', updates);
                    if (!updateResult || updateResult.length !== updates.length) {
                        tracksProcessedSuccessfully = false;
                        console.error("Falha ao desvincular uma ou mais músicas no lote.");
                        alert("Atenção: Falha ao desvincular uma ou mais músicas associadas. A exclusão do lançamento principal continuará.");
                         // Continue despite error
                    } else {
                        console.log("Músicas desvinculadas com sucesso.");
                    }
                }

                // Perform batch deletes
                if (deletes.length > 0) {
                    console.log(`Excluindo ${deletes.length} músicas...`);
                    const deleteResult = await batchDeleteAirtableRecords('Músicas', deletes);
                    // batchDeleteAirtableRecords returns { success: boolean, results: [...] }
                    if (!deleteResult || !deleteResult.success) {
                        tracksProcessedSuccessfully = false;
                        console.error("Falha ao excluir uma ou mais músicas no lote. Resposta:", deleteResult);
                         alert("Atenção: Falha ao excluir uma ou mais músicas associadas. A exclusão do lançamento principal continuará, mas pode deixar músicas órfãs.");
                         // Continue despite error
                    } else {
                        console.log("Músicas marcadas para exclusão processadas com sucesso.");
                    }
                }
            } // End if associatedTrackIds.length > 0

            // --- Step 2: Delete the Main Release Record ---
            console.log(`Excluindo o lançamento principal ${recordId} da tabela ${tableName}...`);
            const releaseDeleteResult = await deleteAirtableRecord(tableName, recordId);

            // Check if the main deletion was successful
            if (releaseDeleteResult && releaseDeleteResult.deleted) {
                alert("Lançamento apagado com sucesso!");
                closeDeleteConfirmModal();
                await refreshAllData(); // Refresh data to reflect deletion
            } else {
                 // Deletion failed
                 if (!tracksProcessedSuccessfully) {
                      // Both tracks and main release failed
                      throw new Error("Falha ao apagar o lançamento principal E erro ao processar músicas associadas.");
                 } else {
                      // Tracks processed OK, but main release failed
                      throw new Error("Falha ao apagar o registro principal do lançamento. As músicas associadas podem ter sido desvinculadas/excluídas.");
                 }
            }

        } catch (error) {
            alert(`Erro ao apagar o lançamento: ${error.message}. Verifique o console.`);
            console.error("Erro detalhado em handleDeleteRelease:", error);
            // Don't close modal on error? Or close it?
             closeDeleteConfirmModal(); // Close modal even on error for now
        } finally {
            // Re-enable button
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Sim, Apagar';
        }
    }


    // --- 5. LÓGICA DO PLAYER DE MÚSICA ---

     // openPlayer (Finds song, sets queue, loads song, shows player)
     function openPlayer(songId, clickedElement) {
         const song = db.songs.find(s => s.id === songId);
         if (!song) {
             console.error(`Música com ID ${songId} não encontrada para tocar.`);
             // Optionally show a user message
             return;
         }

         console.log("Abrindo player para:", song.title);

         // --- Determine the Playback Queue ---
         // Find the closest parent container that defines a list of songs
         const parentListContainer = clickedElement?.closest('.popular-songs-list, .tracklist-container, .chart-list');

         if (parentListContainer) {
              // If found, create queue from all playable songs within that container
              const songElements = parentListContainer.querySelectorAll('.song-row[data-song-id], .track-row[data-song-id].available, .chart-item[data-song-id]'); // Select only playable/available items
              // Map element IDs back to song objects from db.songs, filtering out any not found
              currentQueue = Array.from(songElements)
                                  .map(el => db.songs.find(s => s.id === el.dataset.songId))
                                  .filter(Boolean); // Filter out undefined/null if a song wasn't found
              console.log(`Fila criada a partir do container: ${currentQueue.length} músicas.`);
         } else {
             // If no parent list found, queue just the single clicked song
             currentQueue = [song];
             console.log("Fila criada com apenas a música selecionada.");
         }

         // Find the index of the clicked song within the created queue
         currentQueueIndex = currentQueue.findIndex(s => s.id === songId);

         // Safety check: if song wasn't found in the generated queue (shouldn't happen often)
         if (currentQueueIndex === -1) {
              console.warn("Música clicada não encontrada na fila gerada. Tocando apenas ela.");
             currentQueue = [song];
             currentQueueIndex = 0;
         }

         // Load the song into the player UI and state
         loadSong(song);

         // Show the player view and add body class
         musicPlayerView?.classList.remove('hidden');
         document.body.classList.add('player-open'); // For potential global styling when player is open
         // Assuming you want to auto-play when opening:
         playAudio();
     }


     // closePlayer
     function closePlayer() {
         musicPlayerView?.classList.add('hidden'); // Hide the player view
         document.body.classList.remove('player-open'); // Remove body class

         // Pause audio when closing the player interface
         if (isPlaying) {
             // We don't call togglePlay() as that would change the icon state incorrectly
             pauseAudio();
             console.log("Player fechado, áudio pausado.");
         } else {
              console.log("Player fechado.");
         }
         // Note: We don't clear the current song or queue here,
         // so reopening the player might resume where it left off, depending on desired behavior.
     }

     // loadSong (Updates player UI and state with the selected song)
     function loadSong(song) {
         if (!song) {
              console.error("Tentativa de carregar música inválida (null ou undefined).");
              return;
         }
         console.log("Carregando música:", song.title);
         currentSong = song; // Update the global current song reference

         // Update Player UI Elements
         if (playerSongTitle) playerSongTitle.textContent = song.title;
         if (playerArtistName) playerArtistName.textContent = formatArtistString(song.artistIds, song.collabType);

         // Find the parent release (album or single) for cover art and title
         const parentRelease = [...db.albums, ...db.singles].find(r => r.id === song.albumId); // Use pre-calculated albumId
         if (parentRelease) {
             if (playerCoverArt) playerCoverArt.src = parentRelease.imageUrl;
             if (playerAlbumTitle) playerAlbumTitle.textContent = parentRelease.title;
         } else {
             // Fallback if no parent release found (e.g., orphaned track?)
             if (playerCoverArt) playerCoverArt.src = 'https://i.imgur.com/AD3MbBi.png'; // Default cover
             if (playerAlbumTitle) playerAlbumTitle.textContent = 'Single Avulso'; // Or 'Unknown Album'
         }

         // --- Simulation Setup ---
         // Since there's no actual audio, we simulate based on durationSeconds
         const durationSeconds = song.durationSeconds || 180; // Default to 3 minutes if duration missing

         if (playerSeekBar) {
             playerSeekBar.value = 0; // Reset seek bar to beginning
             playerSeekBar.max = durationSeconds; // Set max value to song duration
         }
         if (playerCurrentTime) playerCurrentTime.textContent = formatTime(0); // Display 0:00
         if (playerTotalTime) playerTotalTime.textContent = formatTime(durationSeconds); // Display total duration

         // Update play/pause button state based on current isPlaying flag
         // (important if loading happens while player was already playing)
         if (isPlaying) {
              if(playerPlayPauseBtn) playerPlayPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
              // If you were actually playing audio, you'd start the new track here:
              // audioElement.src = song.audioUrl; audioElement.play();
         } else {
              if(playerPlayPauseBtn) playerPlayPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
              // If you were actually playing audio, you might load but not play:
              // audioElement.src = song.audioUrl; audioElement.pause(); audioElement.currentTime = 0;
         }
          // Reset seek bar visually (already done by setting value, but reinforces)
          if (playerCurrentTime) playerCurrentTime.textContent = formatTime(0);
     }


     // --- Playback Control Functions (Simulated) ---

     // playAudio (Sets state to playing, updates button)
     function playAudio() {
         if (!currentSong) return; // Can't play if no song is loaded
         isPlaying = true;
         if (playerPlayPauseBtn) playerPlayPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
         console.log("Simulando Play:", currentSong.title);
         // Real implementation: audioElement.play();
     }

     // pauseAudio (Sets state to paused, updates button)
     function pauseAudio() {
         isPlaying = false;
         if (playerPlayPauseBtn) playerPlayPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
         console.log("Simulando Pause:", currentSong?.title);
          // Real implementation: audioElement.pause();
     }

     // togglePlay (Switches between play and pause)
     function togglePlay() {
         if (isPlaying) {
             pauseAudio();
         } else {
             playAudio();
         }
     }

     // playNext (Loads and potentially plays the next song in the queue)
     function playNext() {
         if (!currentQueue || currentQueue.length === 0 || !currentSong) {
             console.log("PlayNext: Fila vazia ou nenhuma música atual.");
             return; // No queue or no current song to advance from
         }
          console.log("PlayNext: Iniciando...");


         if (repeatMode === 'one') {
              // If repeat one is on, just restart the current song
              console.log("PlayNext: Modo Repeat One, reiniciando música atual.");
              if (playerSeekBar) playerSeekBar.value = 0;
              if (playerCurrentTime) playerCurrentTime.textContent = formatTime(0);
              playAudio(); // Ensure it starts playing again
              return;
         }


         if (isShuffle) {
             // Shuffle: Pick a random index different from the current one (if possible)
             let randomIndex = currentQueueIndex;
              if (currentQueue.length > 1) {
                   do {
                       randomIndex = Math.floor(Math.random() * currentQueue.length);
                   } while (randomIndex === currentQueueIndex);
              }
             currentQueueIndex = randomIndex;
             console.log(`PlayNext: Modo Shuffle, pulando para índice aleatório ${currentQueueIndex}`);
         } else {
             // Normal: Increment index
             currentQueueIndex++;
             console.log(`PlayNext: Modo Normal, incrementando índice para ${currentQueueIndex}`);
         }

         // Check if index is out of bounds
         if (currentQueueIndex >= currentQueue.length) {
             if (repeatMode === 'all') {
                 // Repeat All: Wrap around to the beginning
                 console.log("PlayNext: Fim da fila, modo Repeat All, voltando para o início.");
                 currentQueueIndex = 0;
             } else {
                 // No Repeat: Stop at the end of the queue
                 console.log("PlayNext: Fim da fila, sem modo de repetição.");
                 // Load the last song but pause it and set seek bar to end
                 currentQueueIndex = currentQueue.length - 1; // Stay on last index
                 const lastSong = currentQueue[currentQueueIndex];
                 if(lastSong) loadSong(lastSong); // Load UI for last song
                  pauseAudio(); // Set state to paused
                 // Set seek bar to end visually
                 if(playerSeekBar) playerSeekBar.value = playerSeekBar.max;
                 if(playerCurrentTime) playerCurrentTime.textContent = formatTime(playerSeekBar.max || 0);
                 return; // Stop execution here
             }
         }

         // Load the song at the new index
         const nextSong = currentQueue[currentQueueIndex];
         if (nextSong) {
              loadSong(nextSong);
              // Keep playing if it was already playing, otherwise stay paused
              if (isPlaying) {
                   playAudio(); // Explicitly call play if state should be playing
              } else {
                  pauseAudio(); // Explicitly call pause if state should be paused
              }

         } else {
              console.error(`PlayNext: Música não encontrada no índice ${currentQueueIndex}`);
               // Handle error: Maybe stop playback?
               pauseAudio();
         }
     }

     // playPrevious (Loads and potentially plays the previous song or restarts current)
     function playPrevious() {
          if (!currentQueue || currentQueue.length === 0 || !currentSong) {
               console.log("PlayPrevious: Fila vazia ou nenhuma música atual.");
               return; // No queue or no current song
          }
         console.log("PlayPrevious: Iniciando...");

         // If current song has played for more than 3 seconds, restart it
         const currentTime = playerSeekBar ? parseFloat(playerSeekBar.value) : 0;
         if (currentTime > 3) {
             console.log("PlayPrevious: Reiniciando música atual (tocada por > 3s).");
             if (playerSeekBar) playerSeekBar.value = 0;
             if (playerCurrentTime) playerCurrentTime.textContent = formatTime(0);
              // Keep current playing state (if playing, continue playing; if paused, stay paused)
              if(isPlaying) playAudio();
             return;
         }

         // If less than 3 seconds played, go to the previous track

         if (isShuffle) {
             // Shuffle: Pick a random index (can be the same as current, effectively restarting)
              let randomIndex = currentQueueIndex;
               if (currentQueue.length > 1) {
                    do {
                        randomIndex = Math.floor(Math.random() * currentQueue.length);
                    } while (randomIndex === currentQueueIndex); // Less strict than playNext maybe? Or same logic?
               }
              currentQueueIndex = randomIndex;
              console.log(`PlayPrevious: Modo Shuffle, pulando para índice aleatório ${currentQueueIndex}`);

         } else {
             // Normal: Decrement index
             currentQueueIndex--;
             console.log(`PlayPrevious: Modo Normal, decrementando índice para ${currentQueueIndex}`);
         }

         // Check if index is out of bounds (beginning of list)
         if (currentQueueIndex < 0) {
             if (repeatMode === 'all') {
                 // Repeat All: Wrap around to the end
                 console.log("PlayPrevious: Início da fila, modo Repeat All, pulando para o fim.");
                 currentQueueIndex = currentQueue.length - 1;
             } else {
                 // No Repeat: Stay at the beginning, restart first song
                 console.log("PlayPrevious: Início da fila, sem modo de repetição, reiniciando primeira música.");
                 currentQueueIndex = 0;
                  if (playerSeekBar) playerSeekBar.value = 0; // Reset seek bar
                  if (playerCurrentTime) playerCurrentTime.textContent = formatTime(0);
                   // Keep current playing state
                  const firstSong = currentQueue[currentQueueIndex];
                  if (firstSong) {
                       loadSong(firstSong); // Reload first song UI
                       if(isPlaying) playAudio(); else pauseAudio(); // Maintain play state
                  }
                  return; // Stop execution
             }
         }

         // Load the song at the new index
         const prevSong = currentQueue[currentQueueIndex];
         if (prevSong) {
              loadSong(prevSong);
              // Maintain play state
              if (isPlaying) {
                   playAudio();
              } else {
                   pauseAudio();
              }
         } else {
              console.error(`PlayPrevious: Música não encontrada no índice ${currentQueueIndex}`);
               pauseAudio(); // Stop playback on error
         }
     }


     // toggleShuffle
     function toggleShuffle() {
         isShuffle = !isShuffle; // Toggle state
         playerShuffleBtn?.classList.toggle('active', isShuffle); // Update button visual state
         console.log("Shuffle:", isShuffle ? "Ativado" : "Desativado");
     }

     // toggleRepeat
     function toggleRepeat() {
         const repeatIcon = playerRepeatBtn?.querySelector('i');
         if (!repeatIcon) return;

         if (repeatMode === 'none') {
             repeatMode = 'all'; // -> Repeat All
             playerRepeatBtn?.classList.add('active');
             repeatIcon.className = 'fas fa-repeat'; // Standard repeat icon
             console.log("Repeat Mode: All");
         } else if (repeatMode === 'all') {
             repeatMode = 'one'; // -> Repeat One
             playerRepeatBtn?.classList.add('active'); // Keep active class
             repeatIcon.className = 'fas fa-repeat-1'; // Repeat one icon
             console.log("Repeat Mode: One");
         } else { // repeatMode === 'one'
             repeatMode = 'none'; // -> No Repeat
             playerRepeatBtn?.classList.remove('active');
             repeatIcon.className = 'fas fa-repeat'; // Back to standard icon
             console.log("Repeat Mode: None");
         }
     }

    // formatTime (Converts seconds to MM:SS format)
    function formatTime(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds < 0) return "0:00";
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Add leading zero for seconds if needed
    }


     // --- Simulation Timer ---
     let simulationInterval = null; // Store interval ID

     function startSimulationTimer() {
         stopSimulationTimer(); // Clear existing interval if any
         simulationInterval = setInterval(() => {
             if (isPlaying && playerSeekBar && currentSong) {
                 let currentValue = parseFloat(playerSeekBar.value);
                 const maxValue = parseFloat(playerSeekBar.max);

                 if (currentValue < maxValue) {
                     currentValue += 1; // Increment by 1 second
                     playerSeekBar.value = currentValue;
                     if (playerCurrentTime) playerCurrentTime.textContent = formatTime(currentValue);
                 } else {
                     // Song finished
                     console.log(`Simulação: ${currentSong.title} terminou.`);
                     // Logic for when song ends (repeat one or play next)
                     if (repeatMode === 'one') {
                          console.log("Simulação: Repeat One ativado, reiniciando.");
                         playerSeekBar.value = 0;
                         if (playerCurrentTime) playerCurrentTime.textContent = formatTime(0);
                          playAudio(); // Keep playing state
                     } else {
                          console.log("Simulação: Chamando playNext().");
                         playNext(); // Handles repeat all / stop logic
                     }
                 }
             }
         }, 1000); // Run every 1 second
     }

     function stopSimulationTimer() {
         if (simulationInterval) {
             clearInterval(simulationInterval);
             simulationInterval = null;
         }
     }

     // initializePlayerListeners (Sets up event listeners for player controls)
     function initializePlayerListeners() {
         playerCloseBtn?.addEventListener('click', closePlayer);
         playerPlayPauseBtn?.addEventListener('click', togglePlay);
         playerNextBtn?.addEventListener('click', playNext);
         playerPrevBtn?.addEventListener('click', playPrevious);
         playerShuffleBtn?.addEventListener('click', toggleShuffle);
         playerRepeatBtn?.addEventListener('click', toggleRepeat);

         // Listener for manual seeking by user
         playerSeekBar?.addEventListener('input', () => {
             // Update the current time display immediately when user drags the slider
             if (playerCurrentTime && playerSeekBar) {
                 playerCurrentTime.textContent = formatTime(playerSeekBar.value);
             }
             // Real implementation might pause audio during seek: audioElement.pause();
         });
          // Optional: Handle 'change' event if you want to resume playback after seek ends
          playerSeekBar?.addEventListener('change', () => {
               // Real implementation:
               // audioElement.currentTime = playerSeekBar.value;
               // if (shouldResumePlayingAfterSeek) audioElement.play();
               console.log(`Simulação: Usuário ajustou para ${formatTime(playerSeekBar.value)}`);
               // If paused due to seeking, potentially resume play based on isPlaying state
               if (isPlaying) {
                    playAudio(); // Ensure player state matches button/simulation
               }

          });


         // Start the simulation timer
         startSimulationTimer();

         console.log("Listeners do Player inicializados.");
     }



    // --- 6. INICIALIZAÇÃO GERAL ---

    // initializeBodyClickListener (Uses event delegation for dynamic content)
    function initializeBodyClickListener() {
        document.body.addEventListener('click', (event) => {
            // --- Artist Navigation ---
            const artistCard = event.target.closest('.artist-card[data-artist-name]');
            const artistLink = event.target.closest('.artist-link[data-artist-name]');
            if (artistCard) {
                openArtistDetail(artistCard.dataset.artistName);
                return; // Stop further checks
            }
            if (artistLink) {
                 event.preventDefault(); // Prevent default if it's an anchor link
                openArtistDetail(artistLink.dataset.artistName);
                return;
            }

            // --- Album/Single Navigation ---
            // Check for data-album-id but ensure it's NOT inside an edit list item
            const albumCard = event.target.closest('[data-album-id]');
            if (albumCard && !event.target.closest('.edit-release-item')) { // Exclude clicks within edit list
                openAlbumDetail(albumCard.dataset.albumId);
                return;
            }

            // --- Song Playback ---
            const songRow = event.target.closest('.song-row[data-song-id], .track-row[data-song-id], .chart-item[data-song-id]');
            if (songRow) {
                // Check if the clicked row is playable (has 'available' class or is not 'unavailable')
                if (!songRow.classList.contains('unavailable')) {
                    console.log("Click detectado em música tocável, ID:", songRow.dataset.songId);
                    openPlayer(songRow.dataset.songId, songRow); // Pass the element for queue context
                } else {
                    console.log("Click em música indisponível (pré-lançamento bloqueado).");
                    // Optionally show a small message/tooltip "Disponível em DD/MM"
                }
                return;
            }

            // --- Discography Navigation ---
            const discographyLink = event.target.closest('.see-all-btn[data-type]');
            if (discographyLink) {
                openDiscographyDetail(discographyLink.dataset.type); // 'albums' or 'singles'
                return;
            }

             // --- Add other delegated listeners here if needed ---

        });

        // Search Input Listeners
        searchInput?.addEventListener('input', handleSearch); // Search as user types
        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSearch(); // Trigger search on Enter key
            }
        });

         console.log("Listener global de cliques no body inicializado.");
    }


    // attachNavigationListeners (Adds listeners to top tabs and bottom nav)
    function attachNavigationListeners() {
        try {
            const navigationElements = [
                ...document.querySelectorAll('.nav-tab'), // Top tabs
                ...document.querySelectorAll('.bottom-nav-item') // Bottom navigation
            ];
            console.log(`Atribuindo listeners para ${navigationElements.length} botões de navegação.`);

            navigationElements.forEach(navElement => {
                // Remove existing listener before adding to prevent duplicates
                navElement.removeEventListener('click', switchTab);
                navElement.addEventListener('click', switchTab);
            });

            // Back Buttons (might be multiple if you add more views)
            document.querySelectorAll('.back-btn').forEach(backButton => {
                backButton.removeEventListener('click', handleBack);
                backButton.addEventListener('click', handleBack);
            });
             console.log("Listeners de navegação atribuídos.");
        } catch (error) {
            console.error("Erro Crítico ao atribuir listeners de navegação:", error);
            // Application might not be navigable if this fails
        }
    }


    // --- Main Application Initialization ---
    async function main() {
        console.log("Iniciando Aplicação Spotify RPG...");
        // 1. Initialize DOM element references and perform crucial checks
        if (!initializeDOMElements()) {
             console.error("Falha na inicialização dos elementos DOM. Aplicação interrompida.");
             // Error message already shown by initializeDOMElements
             return;
        }

        // 2. Show loading state and fetch initial data
        document.body.classList.add('loading');
        console.log("Carregando dados iniciais...");
        const initialData = await loadAllData();

        // 3. Process data and render UI if successful
        if (initialData && initialData.allArtists) { // Check for essential data
            console.log("Dados brutos carregados. Processando e inicializando banco de dados local...");
            if (initializeData(initialData)) { // Process and structure the data
                console.log("Dados processados. Renderizando UI inicial...");

                // Render initial content
                renderRPGChart();
                 renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10)); // Show random artists on home
                renderChart('music');
                renderChart('album');

                // Setup weekly chart countdown timers
                setupCountdown('musicChartTimer', 'music');
                // setupCountdown('albumChartTimer', 'album'); // Currently commented out in HTML
                setupCountdown('rpgChartTimer', 'rpg');

                // Initialize interactive components
                initializeStudio(); // Setup forms, modals, listeners for studio section
                initializePlayerListeners(); // Setup player controls and simulation
                initializeBodyClickListener(); // Setup global click handling for navigation/playback
                attachNavigationListeners(); // Setup top/bottom nav and back buttons

                // Set initial view and section
                switchTab(null, 'homeSection'); // Activate home section in main view
                // activateMainViewSection('homeSection'); // Called by switchTab

                document.body.classList.remove('loading'); // Hide loading indicator
                console.log("Aplicação Spotify RPG pronta.");

            } else {
                console.error("Falha ao inicializar/processar os dados carregados (initializeData).");
                document.body.classList.remove('loading');
                // Display error (already handled by initializeData potentially, but fallback)
                document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Crítico</h1><p>Falha ao processar dados. Ver console.</p></div>';
            }
        } else {
            console.error("Falha ao carregar dados brutos iniciais (loadAllData). Aplicação não pode continuar.");
            document.body.classList.remove('loading');
             // Error message already shown by loadAllData or fetch errors
             // Ensure some message is visible if loadAllData returned null without displaying its own error
             if (!document.querySelector('body > div[style*="color: red"]')) {
                   document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Crítico</h1><p>Não foi possível carregar os dados iniciais. Ver console.</p></div>';
             }

        }
    }

    // --- Start the Application ---
    main();

}); // End DOMContentLoaded
