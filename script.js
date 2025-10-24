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

    // --- ELEMENTOS DO DOM ---
    let allViews, searchInput, studioView, loginPrompt, loggedInInfo, playerSelect,
        loginButton, logoutButton, studioLaunchWrapper, studioTabs, studioForms,
        newSingleForm, singleArtistSelect, singleReleaseDateInput, singleFeatList,
        newAlbumForm, albumArtistSelect, albumReleaseDateInput,
        albumTracklistEditor, featModal, featArtistSelect,
        featTypeSelect, confirmFeatBtn, cancelFeatBtn,
        trackTypeModal, trackTypeSelect, confirmTrackTypeBtn, cancelTrackTypeBtn,
        albumTrackModal, albumTrackModalTitle, openAddTrackModalBtn,
        albumTrackNameInput, albumTrackDurationInput, albumTrackTypeSelect,
        albumTrackFeatList, saveAlbumTrackBtn, cancelAlbumTrackBtn, editingTrackItemId,
        inlineFeatAdder, inlineFeatArtistSelect, inlineFeatTypeSelect,
        confirmInlineFeatBtn, cancelInlineFeatBtn, addInlineFeatBtn;

    const AIRTABLE_BASE_ID = 'appG5NOoblUmtSMVI';
    const AIRTABLE_API_KEY = 'pat5T28kjmJ4t6TQG.69bf34509e687fff6a3f76bd52e64518d6c92be8b1ee0a53bcc9f50fedcb5c70';
    const PREVIOUS_MUSIC_CHART_KEY = 'spotifyRpg_previousMusicChart';
    const PREVIOUS_ALBUM_CHART_KEY = 'spotifyRpg_previousAlbumChart';
    const PREVIOUS_RPG_CHART_KEY = 'spotifyRpg_previousRpgChart';

    // --- INICIALIZAÇÃO DOS ELEMENTOS DO DOM ---
    function initializeDOMElements() {
        console.log("Inicializando elementos do DOM...");
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
            addInlineFeatBtn = albumTrackModal ? albumTrackModal.querySelector('.add-inline-feat-btn') : null;

            const essentialElements = [studioView, loginPrompt, playerSelect, newSingleForm, newAlbumForm, featModal, singleReleaseDateInput, albumReleaseDateInput, trackTypeModal, albumTrackModal, openAddTrackModalBtn, inlineFeatAdder, inlineFeatArtistSelect, confirmInlineFeatBtn, addInlineFeatBtn];
            if (!allViews || allViews.length === 0 || essentialElements.some(el => !el)) {
                console.error("ERRO: Elementos essenciais não encontrados!");
                document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Interface</h1><p>Elementos não encontrados.</p></div>';
                return false;
            }

            const today = new Date().toISOString().split('T')[0];
            singleReleaseDateInput.value = today;
            albumReleaseDateInput.value = today;

            console.log("Elementos do DOM inicializados.");
            return true;
        } catch(error) {
            console.error("Erro ao inicializar DOM:", error);
            document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Erro Interface</h1><p>Erro ao buscar elementos.</p></div>';
            return false;
        }
    }

    // --- CARREGAMENTO DE DADOS DO AIRTABLE ---
    async function fetchAllAirtablePages(baseUrl, fetchOptions) {
        let allRecords = [];
        let offset = null;
        do {
            const sep = baseUrl.includes('?') ? '&' : '?';
            const url = offset ? `${baseUrl}${sep}offset=${offset}` : baseUrl;
            const res = await fetch(url, fetchOptions);
            if (!res.ok) {
                const txt = await res.text();
                console.error(`Falha ${url}: ${res.status} - ${txt}`);
                throw new Error(`Fetch fail ${baseUrl}`);
            }
            const data = await res.json();
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

            if (!artistsData || !albumsData || !musicasData || !singlesData || !playersData) {
                throw new Error('Falha ao carregar dados.');
            }

            const musicasMap = new Map();
            (musicasData.records || []).forEach(r => {
                const artistIds = Array.isArray(r.fields['Artista']) ? r.fields['Artista'] : [r.fields['Artista']].filter(Boolean);
                const pId = (r.fields['Álbuns']?.[0]) || (r.fields['Singles e EPs']?.[0]) || null;
                musicasMap.set(r.id, {
                    id: r.id,
                    title: r.fields['Nome da Faixa'] || '?',
                    duration: r.fields['Duração'] ? new Date(r.fields['Duração'] * 1000).toISOString().substr(14, 5) : "0:00",
                    trackNumber: r.fields['Nº da Faixa'] || 0,
                    durationSeconds: r.fields['Duração'] || 0,
                    artistIds: artistIds,
                    collabType: r.fields['Tipo de Colaboração'],
                    albumId: pId,
                    streams: r.fields.Streams || 0,
                    trackType: r.fields['Tipo de Faixa'] || 'Album Track'
                });
            });

            const artistsMapById = new Map();
            const artistsList = (artistsData.records || []).map(r => {
                const a = {
                    id: r.id,
                    name: r.fields.Name || '?',
                    imageUrl: (r.fields['URL da Imagem']?.[0]?.url) || 'https://i.imgur.com/AD3MbBi.png',
                    off: r.fields['Inspirações (Off)'] || [],
                    RPGPoints: r.fields.RPGPoints || 0,
                    LastActive: r.fields.LastActive || null
                };
                artistsMapById.set(a.id, a.name);
                return a;
            });

            const formatReleases = (records, isAlbum) => {
                if (!records) return [];
                return records.map(r => {
                    const f = r.fields;
                    const id = r.id;
                    const tracks = Array.from(musicasMap.values())
                        .filter(s => s.albumId === id)
                        .sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
                    const dur = tracks.reduce((t, tr) => t + (tr.durationSeconds || 0), 0);
                    const artId = Array.isArray(f['Artista']) ? f['Artista'][0] : (f['Artista'] || null);
                    const artName = artId ? artistsMapById.get(artId) : "?";
                    const imgF = isAlbum ? 'Capa do Álbum' : 'Capa';
                    const imgUrl = (f[imgF]?.[0]?.url) || 'https://i.imgur.com/AD3MbBi.png';
                    return {
                        id: id,
                        title: f['Nome do Álbum'] || f['Nome do Single/EP'] || '?',
                        artist: artName,
                        artistId: artId,
                        metascore: f['Metascore'] || 0,
                        imageUrl: imgUrl,
                        releaseDate: f['Data de Lançamento'] || '?',
                        tracks: tracks,
                        totalDurationSeconds: dur
                    };
                });
            };

            const formattedAlbums = formatReleases(albumsData.records, true);
            const formattedSingles = formatReleases(singlesData.records, false);
            const formattedPlayers = (playersData.records || []).map(r => ({
                id: r.id,
                name: r.fields.Nome,
                artists: r.fields.Artistas || []
            }));

            console.log("Dados carregados com sucesso.");
            return {
                allArtists: artistsList,
                albums: formattedAlbums,
                singles: formattedSingles,
                players: formattedPlayers,
                musicas: Array.from(musicasMap.values())
            };
        } catch (error) {
            console.error("Falha ao carregar dados:", error);
            return null;
        }
    }

    const initializeData = (data) => {
        try {
            try {
                const prevMusic = localStorage.getItem(PREVIOUS_MUSIC_CHART_KEY);
                previousMusicChartData = prevMusic ? JSON.parse(prevMusic) : {};
                const prevAlbum = localStorage.getItem(PREVIOUS_ALBUM_CHART_KEY);
                previousAlbumChartData = prevAlbum ? JSON.parse(prevAlbum) : {};
                const prevRpg = localStorage.getItem(PREVIOUS_RPG_CHART_KEY);
                previousRpgChartData = prevRpg ? JSON.parse(prevRpg) : {};
            } catch (e) {
                console.error("Erro ao carregar dados anteriores:", e);
                previousMusicChartData = {};
                previousAlbumChartData = {};
                previousRpgChartData = {};
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

            db.songs = (data.musicas || []).map(song => ({
                ...song,
                streams: song.streams || 0,
                cover: 'https://i.imgur.com/AD3MbBi.png',
                artist: artistsMapById.get((song.artistIds || [])[0]) || '?'
            }));

            db.albums = [];
            db.singles = [];
            const allReleases = [...(data.albums || []), ...(data.singles || [])];
            const thirtyMinSec = 30 * 60;

            allReleases.forEach(item => {
                (item.tracks || []).forEach(tInfo => {
                    const s = db.songs.find(sDb => sDb.id === tInfo.id);
                    if (s) {
                        s.cover = item.imageUrl;
                    }
                });

                const artistEntry = db.artists.find(a => a.id === item.artistId);
                if ((item.totalDurationSeconds || 0) >= thirtyMinSec) {
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
            });

            db.players = data.players || [];
            console.log(`DB inicializado: ${db.artists.length} artistas, ${db.albums.length} álbuns, ${db.singles.length} singles, ${db.songs.length} músicas, ${db.players.length} jogadores`);
            return true;
        } catch (error) {
            console.error("Erro crítico ao inicializar dados:", error);
            alert("Erro ao inicializar dados.");
            return false;
        }
    };

    const saveChartDataToLocalStorage = (chartType) => {
        let currentChartData;
        let storageKey;
        let dataList;

        if (chartType === 'music') {
            storageKey = PREVIOUS_MUSIC_CHART_KEY;
            dataList = [...db.songs].sort((a, b) => (b.streams || 0) - (a.streams || 0)).slice(0, 50);
            currentChartData = dataList.reduce((acc, item, index) => {
                acc[item.id] = index + 1;
                return acc;
            }, {});
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
            dataList = computeChartData(db.artists);
            currentChartData = dataList.reduce((acc, item, index) => {
                acc[item.id] = index + 1;
                return acc;
            }, {});
            previousRpgChartData = currentChartData;
        } else {
            console.error("Tipo de chart inválido:", chartType);
            return;
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(currentChartData));
            console.log(`Chart ${chartType} salvo.`);
        } catch (e) {
            console.error(`Erro ao salvar chart ${chartType}:`, e);
        }
    };

    async function refreshAllData() {
        console.log("Atualizando dados...");
        const data = await loadAllData();
        if (data && data.allArtists) {
            if (initializeData(data)) {
                console.log("Dados atualizados.");
                renderRPGChart();
                renderArtistsGrid('homeGrid', [...(db.artists || [])].sort(() => 0.5 - Math.random()).slice(0, 10));
                renderChart('music');
                renderChart('album');
                if (currentPlayer) {
                    populateArtistSelector(currentPlayer.id);
                }
                if (activeArtist && !document.getElementById('artistDetail').classList.contains('hidden')) {
                    const refreshed = db.artists.find(a => a.id === activeArtist.id);
                    if (refreshed) {
                        openArtistDetail(refreshed.name);
                    } else {
                        handleBack();
                    }
                }
                return true;
            }
        }
        console.error("Falha ao atualizar.");
        alert("Não foi possível atualizar.");
        return false;
    }

    // --- NAVEGAÇÃO E UI ---
    const switchView = (viewId, targetSectionId = null) => {
        allViews.forEach(v => v.classList.add('hidden'));
        const target = document.getElementById(viewId);
        if (target) {
            target.classList.remove('hidden');
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
            document.querySelectorAll('.nav-tab, .bottom-nav-item').forEach(b => b.classList.remove('active'));
            document.querySelectorAll(`.nav-tab[data-tab="${tabId}"], .bottom-nav-item[data-tab="${tabId}"]`).forEach(b => b.classList.add('active'));
            return;
        }

        if (!document.getElementById('mainView').classList.contains('active')) {
            switchView('mainView');
        }

        document.querySelectorAll('#mainView .content-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-tab, .bottom-nav-item').forEach(b => b.classList.remove('active'));
        const target = document.getElementById(tabId);
        if (target) {
            target.classList.add('active');
        }
        document.querySelectorAll(`.nav-tab[data-tab="${tabId}"], .bottom-nav-item[data-tab="${tabId}"]`).forEach(b => b.classList.add('active'));
    };

    const handleBack = () => {
        viewHistory.pop();
        const prevId = viewHistory.pop() || 'mainView';
        switchView(prevId);
    };

    const renderArtistsGrid = (containerId, artists) => {
        const c = document.getElementById(containerId);
        if (!c) {
            console.error(`Grid ${containerId} não encontrado.`);
            return;
        }
        if (!artists || artists.length === 0) {
            c.innerHTML = '<p class="empty-state">Nenhum artista.</p>';
            return;
        }
        c.innerHTML = artists.map(a => `<div class="artist-card" data-artist-name="${a.name}"><img src="${a.img || a.imageUrl || 'https://i.imgur.com/AD3MbBi.png'}" alt="${a.name}" class="artist-card-img"><p class="artist-card-name">${a.name}</p><span class="artist-card-type">Artista</span></div>`).join('');
    };

    function formatArtistString(artistIds, collabType) {
        if (!artistIds || artistIds.length === 0) return "?";
        const names = artistIds.map(id => {
            const a = db.artists.find(art => art.id === id);
            return a ? a.name : "?";
        });
        const main = names[0];
        if (names.length === 1) return main;
        const others = names.slice(1).join(', ');
        if (collabType === 'Dueto/Grupo') {
            return `${main} & ${others}`;
        } else {
            return main;
        }
    }

    function getCoverUrl(albumId) {
        if (!albumId) return 'https://i.imgur.com/AD3MbBi.png';
        const r = [...db.albums, ...db.singles].find(a => a.id === albumId);
        return (r ? r.imageUrl : 'https://i.imgur.com/AD3MbBi.png');
    }

    const renderChart = (type) => {
        let containerId, dataList, previousData;
        if (type === 'music') {
            containerId = 'musicChartsList';
            dataList = [...db.songs].sort((a, b) => (b.streams || 0) - (a.streams || 0)).slice(0, 50);
            previousData = previousMusicChartData;
        } else {
            containerId = 'albumChartsList';
            dataList = [...db.albums].sort((a, b) => (b.metascore || 0) - (a.metascore || 0)).slice(0, 50);
            previousData = previousAlbumChartData;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Chart ${containerId} não encontrado.`);
            return;
        }

        if (!dataList || dataList.length === 0) {
            container.innerHTML = `<p class="empty-state">Nenhum item.</p>`;
            return;
        }

        container.innerHTML = dataList.map((item, index) => {
            const currentRank = index + 1;
            const previousRank = previousData[item.id];
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

            const indicatorHtml = `<span class="chart-rank-indicator ${trendClass}"><i class="fas ${iconClass}"></i></span>`;

            if (type === 'music') {
                const artistName = formatArtistString(item.artistIds, item.collabType);
                return `<div class="chart-item" data-song-id="${item.id}">${indicatorHtml}<span class="chart-rank">${currentRank}</span><img src="${item.cover || getCoverUrl(item.albumId)}" alt="${item.title}" class="chart-item-img"><div class="chart-item-info"><span class="chart-item-title">${item.title}</span><span class="chart-item-artist">${artistName}</span></div><span class="chart-item-duration">${(item.streams || 0).toLocaleString('pt-BR')}</span></div>`;
            } else {
                return `<div class="chart-item" data-album-id="${item.id}">${indicatorHtml}<span class="chart-rank">${currentRank}</span><img src="${item.imageUrl}" alt="${item.title}" class="chart-item-img"><div class="chart-item-info"><span class="chart-item-title">${item.title}</span><span class="chart-item-artist">${item.artist}</span></div><span class="chart-item-score">${item.metascore}</span></div>`;
            }
        }).join('');
    };

    const openArtistDetail = (artistName) => {
        const artist = db.artists.find(a => a.name === artistName);
        if (!artist) {
            console.error(`Artista "${artistName}" não encontrado.`);
            handleBack();
            return;
        }
        activeArtist = artist;
        document.getElementById('detailBg').style.backgroundImage = `url(${artist.img})`;
        document.getElementById('detailName').textContent = artist.name;

        const popularSongs = [...db.songs].filter(s => s.artistIds && s.artistIds.includes(artist.id)).sort((a, b) => (b.streams || 0) - (a.streams || 0)).slice(0, 5);
        const popularContainer = document.getElementById('popularSongsList');
        if (popularSongs.length > 0) {
            popularContainer.innerHTML = popularSongs.map((song, index) => `<div class="song-row" data-song-id="${song.id}"><span>${index + 1}</span><div class="song-row-info"><img src="${song.cover || getCoverUrl(song.albumId)}" alt="${song.title}" class="song-row-cover"><span class="song-row-title">${song.title}</span></div><span class="song-streams">${(song.streams || 0).toLocaleString('pt-BR')}</span></div>`).join('');
        } else {
            popularContainer.innerHTML = '<p class="empty-state-small">Nenhuma música popular.</p>';
        }

        const albumsContainer = document.getElementById('albumsList');
        const sortedAlbums = (artist.albums || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        albumsContainer.innerHTML = sortedAlbums.map(album => `<div class="scroll-item" data-album-id="${album.id}"><img src="${album.imageUrl}" alt="${album.title}"><p>${album.title}</p><span>${new Date(album.releaseDate).getFullYear()}</span></div>`).join('') || '<p class="empty-state-small">Nenhum álbum.</p>';

        const singlesContainer = document.getElementById('singlesList');
        const sortedSingles = (artist.singles || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        singlesContainer.innerHTML = sortedSingles.map(single => `<div class="scroll-item" data-album-id="${single.id}"><img src="${single.imageUrl}" alt="${single.title}"><p>${single.title}</p><span>${new Date(single.releaseDate).getFullYear()}</span></div>`).join('') || '<p class="empty-state-small">Nenhum single.</p>';

        const recommended = [...db.artists].filter(a => a.id !== artist.id).sort(() => 0.5 - Math.random()).slice(0, 5);
        renderArtistsGrid('recommendedGrid', recommended);
        switchView('artistDetail');
    };

    const openAlbumDetail = (albumId) => {
        const album = [...db.albums, ...db.singles].find(a => a.id === albumId);
        if (!album) {
            console.error(`Álbum/Single ID "${albumId}" não encontrado.`);
            return;
        }
        document.getElementById('albumDetailBg').style.backgroundImage = `url(${album.imageUrl})`;
        document.getElementById('albumDetailCover').src = album.imageUrl;
        document.getElementById('albumDetailTitle').textContent = album.title;

        const releaseDate = new Date(album.releaseDate).getFullYear();
        const artistObj = db.artists.find(a => a.id === album.artistId);
        document.getElementById('albumDetailInfo').innerHTML = `Por <strong class="artist-link" data-artist-name="${artistObj ? artistObj.name : ''}">${album.artist}</strong> • ${releaseDate}`;

        const tracklistContainer = document.getElementById('albumTracklist');
        tracklistContainer.innerHTML = (album.tracks || []).map(song => {
            const artistName = formatArtistString(song.artistIds, song.collabType);
            return `<div class="track-row" data-song-id="${song.id}"><span class="track-number">${song.trackNumber}</span><div class="track-info"><span class="track-title">${song.title}</span><span class="track-artist-feat">${artistName}</span></div><span class="track-duration">${(song.streams || 0).toLocaleString('pt-BR')}</span></div>`;
        }).join('');
        switchView('albumDetail');
    };

    const openDiscographyDetail = (type) => {
        if (!activeArtist) {
            console.error("Nenhum artista ativo.");
            handleBack();
            return;
        }
        const data = (type === 'albums') ? (activeArtist.albums || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)) : (activeArtist.singles || []).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        const title = (type === 'albums') ? `Álbuns de ${activeArtist.name}` : `Singles & EPs de ${activeArtist.name}`;
        document.getElementById('discographyTypeTitle').textContent = title;

        const grid = document.getElementById('discographyGrid');
        grid.innerHTML = data.map(item => `<div class="scroll-item" data-album-id="${item.id}"><img src="${item.imageUrl}" alt="${item.title}"><p>${item.title}</p><span>${new Date(item.releaseDate).getFullYear()}</span></div>`).join('') || '<p class="empty-state">Nenhum lançamento.</p>';
        switchView('discographyDetail');
    };

    const handleSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            switchTab(null, 'homeSection');
            return;
        }

        const resultsContainer = document.getElementById('searchResults');
        const noResultsEl = document.getElementById('noResults');
        const filteredArtists = db.artists.filter(a => a.name.toLowerCase().includes(query));
        const filteredAlbums = [...db.albums, ...db.singles].filter(a => a.title.toLowerCase().includes(query));

        let html = '';
        let count = 0;

        if (filteredArtists.length > 0) {
            html += '<h3 class="section-title">Artistas</h3>';
            html += filteredArtists.map(a => {
                count++;
                return `<div class="artist-card" data-artist-name="${a.name}"><img src="${a.img}" alt="${a.name}" class="artist-card-img"><p class="artist-card-name">${a.name}</p><span class="artist-card-type">Artista</span></div>`;
            }).join('');
        }

        if (filteredAlbums.length > 0) {
            html += '<h3 class="section-title">Álbuns & Singles</h3>';
            html += filteredAlbums.map(al => {
                count++;
                return `<div class="artist-card" data-album-id="${al.id}"><img src="${al.imageUrl}" alt="${al.title}" class="artist-card-img"><p class="artist-card-name">${al.title}</p><span class="artist-card-type">${al.artist}</span></div>`;
            }).join('');
        }

        resultsContainer.innerHTML = html;
        if (count > 0) {
            noResultsEl.classList.add('hidden');
            resultsContainer.classList.remove('hidden');
        } else {
            noResultsEl.classList.remove('hidden');
            resultsContainer.classList.add('hidden');
        }
        switchTab(null, 'searchSection');
    };

    const setupCountdown = (timerId, chartType) => {
        const timerElement = document.getElementById(timerId);
        if (!timerElement) return;

        const calculateTargetDate = () => {
            const now = new Date();
            const target = new Date(now);
            let daysToMonday = (1 + 7 - now.getDay()) % 7;
            if (daysToMonday === 0 && now.getHours() >= 0) {
                daysToMonday = 7;
            }
            target.setDate(now.getDate() + daysToMonday);
            target.setHours(0, 0, 0, 0);
            return target;
        };

        let targetDate = calculateTargetDate();

        const updateTimerDisplay = (distance) => {
            const days = Math.floor(distance / 864e5);
            const hours = Math.floor((distance % 864e5) / 36e5);
            const minutes = Math.floor((distance % 36e5) / 6e4);
            const seconds = Math.floor((distance % 6e4) / 1e3);
            const f = (n) => (n < 10 ? '0' + n : n);
            timerElement.textContent = distance < 0 ? `00d 00h 00m 00s` : `${f(days)}d ${f(hours)}h ${f(minutes)}m ${f(seconds)}s`;
        };

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;
            if (distance < 0) {
                saveChartDataToLocalStorage(chartType);
                targetDate = calculateTargetDate();
                if (chartType === 'music') renderChart('music');
                else if (chartType === 'album') renderChart('album');
                else if (chartType === 'rpg') renderRPGChart();
                updateTimerDisplay(targetDate.getTime() - new Date().getTime());
                return;
            }
            updateTimerDisplay(distance);
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    };

    // --- SISTEMA DE RPG ---
    const CHART_TOP_N = 20;
    const STREAMS_PER_POINT = 10000;

    const calculateSimulatedStreams = (points, lastActiveISO) => {
        if (!lastActiveISO) return 0;
        const now = new Date();
        const last = new Date(lastActiveISO);
        const diffH = Math.abs(now - last) / 36e5;
        const streamDay = (points || 0) * STREAMS_PER_POINT;
        const streamH = streamDay / 24;
        return Math.floor(streamH * diffH);
    };

    const computeChartData = (artistsArray) => {
        return artistsArray.map(a => ({
            id: a.id,
            name: a.name,
            img: a.img,
            streams: calculateSimulatedStreams(a.RPGPoints, a.LastActive),
            points: a.RPGPoints || 0
        })).sort((a, b) => b.streams - a.streams).slice(0, CHART_TOP_N);
    };

    function renderRPGChart() {
        const chartData = computeChartData(db.artists);
        const container = document.getElementById('artistsGrid');
        const previousData = previousRpgChartData;

        if (!container) {
            console.error("Container 'artistsGrid' não encontrado.");
            return;
        }

        if (chartData.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum artista no chart RPG.</p>';
            return;
        }

        container.innerHTML = chartData.map((artist, index) => {
            const currentRank = index + 1;
            const previousRank = previousData[artist.id];
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

            return `<div class="artist-card" data-artist-name="${artist.name}"><span class="rpg-rank">#${currentRank}</span><span class="chart-rank-indicator rpg-indicator ${trendClass}"><i class="fas ${iconClass}"></i></span><img src="${artist.img}" alt="${artist.name}" class="artist-card-img"><p class="artist-card-name">${artist.name}</p><span class="artist-card-type">${(artist.streams || 0).toLocaleString('pt-BR')} streams</span></div>`;
        }).join('');
    }

    // --- SISTEMA DO ESTÚDIO ---
    function populateArtistSelector(playerId) {
        const p = db.players.find(pl => pl.id === playerId);
        if (!p) return;
        const ids = p.artists || [];
        const opts = ids.map(id => {
            const a = db.artists.find(ar => ar.id === id);
            return a ? `<option value="${a.id}">${a.name}</option>` : '';
        }).join('');
        singleArtistSelect.innerHTML = `<option value="">Selecione...</option>${opts}`;
        albumArtistSelect.innerHTML = `<option value="">Selecione...</option>${opts}`;
    }

    function loginPlayer(playerId) {
        if (!playerId) {
            alert("Selecione um jogador.");
            return;
        }
        currentPlayer = db.players.find(p => p.id === playerId);
        if (currentPlayer) {
            document.getElementById('playerName').textContent = currentPlayer.name;
            loginPrompt.classList.add('hidden');
            loggedInInfo.classList.remove('hidden');
            studioLaunchWrapper.classList.remove('hidden');
            populateArtistSelector(currentPlayer.id);
        }
    }

    function logoutPlayer() {
        currentPlayer = null;
        document.getElementById('playerName').textContent = '';
        loginPrompt.classList.remove('hidden');
        loggedInInfo.classList.add('hidden');
        studioLaunchWrapper.classList.add('hidden');
    }

    function populateArtistSelectForFeat(targetSelectElement) {
        let currentMainId = null;
        let selectEl = targetSelectElement;

        if (document.getElementById('newSingleForm').classList.contains('active')) {
            currentMainId = singleArtistSelect.value;
            selectEl = featArtistSelect;
        } else if (document.getElementById('newAlbumForm').classList.contains('active')) {
            currentMainId = albumArtistSelect.value;
            selectEl = inlineFeatArtistSelect;
        } else {
            selectEl = featArtistSelect;
        }

        if (!selectEl) {
            console.error("Select de feats não encontrado!");
            return;
        }

        selectEl.innerHTML = db.artists
            .filter(a => a.id !== currentMainId)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(a => `<option value="${a.id}">${a.name}</option>`)
            .join('');

        if (selectEl.innerHTML === '') {
            selectEl.innerHTML = '<option value="">Nenhum outro artista</option>';
        }
    }

    function openFeatModal(buttonElement) {
        const targetId = buttonElement.dataset.target;
        currentFeatTarget = document.getElementById(targetId);
        if (!currentFeatTarget) {
            console.error("Alvo feat não encontrado:", targetId);
            return;
        }
        populateArtistSelectForFeat(featArtistSelect);
        featModal.classList.remove('hidden');
    }

    function closeFeatModal() {
        featModal.classList.add('hidden');
        currentFeatTarget = null;
    }

    function confirmFeat() {
        const artistId = featArtistSelect.value;
        const artistName = featArtistSelect.options[featArtistSelect.selectedIndex].text;
        const featType = featTypeSelect.value;

        if (!artistId || !currentFeatTarget) {
            console.error("Confirmar feat sem ID ou alvo.");
            return;
        }

        const tag = document.createElement('span');
        tag.className = 'feat-tag';
        tag.textContent = `${featType} ${artistName}`;
        tag.dataset.artistId = artistId;
        tag.dataset.featType = featType;
        tag.dataset.artistName = artistName;
        tag.addEventListener('click', () => tag.remove());

        currentFeatTarget.appendChild(tag);
        closeFeatModal();
    }

    function toggleInlineFeatAdder() {
        if (!inlineFeatAdder) return;
        const hidden = inlineFeatAdder.classList.contains('hidden');
        if (hidden) {
            populateArtistSelectForFeat(inlineFeatArtistSelect);
            inlineFeatAdder.classList.remove('hidden');
            if (addInlineFeatBtn) addInlineFeatBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar Feat';
        } else {
            inlineFeatAdder.classList.add('hidden');
            if (addInlineFeatBtn) addInlineFeatBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Feat';
        }
    }

    function confirmInlineFeat() {
        const artistId = inlineFeatArtistSelect.value;
        const artistName = inlineFeatArtistSelect.options[inlineFeatArtistSelect.selectedIndex].text;
        const featType = inlineFeatTypeSelect.value;

        if (!artistId || !albumTrackFeatList) {
            console.error("Confirmar inline feat sem ID ou alvo.");
            return;
        }

        const tag = document.createElement('span');
        tag.className = 'feat-tag';
        tag.textContent = `${featType} ${artistName}`;
        tag.dataset.artistId = artistId;
        tag.dataset.featType = featType;
        tag.dataset.artistName = artistName;
        tag.addEventListener('click', () => tag.remove());

        albumTrackFeatList.appendChild(tag);
        inlineFeatAdder.classList.add('hidden');
        if (addInlineFeatBtn) addInlineFeatBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Feat';
    }

    function cancelInlineFeat() {
        inlineFeatAdder.classList.add('hidden');
        if (addInlineFeatBtn) addInlineFeatBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Feat';
    }

    function openAlbumTrackModal(itemToEdit = null) {
        albumTrackNameInput.value = '';
        albumTrackDurationInput.value = '';
        albumTrackTypeSelect.value = 'Album Track';
        albumTrackFeatList.innerHTML = '';
        editingTrackItemId.value = '';
        editingTrackItem = null;
        inlineFeatAdder.classList.add('hidden');
        if (addInlineFeatBtn) addInlineFeatBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Feat';

        if (itemToEdit) {
            albumTrackModalTitle.textContent = 'Editar Faixa';
            editingTrackItemId.value = itemToEdit.id || itemToEdit.dataset.itemId;
            editingTrackItem = itemToEdit;
            albumTrackNameInput.value = itemToEdit.dataset.trackName || '';
            albumTrackDurationInput.value = itemToEdit.dataset.durationStr || '';
            albumTrackTypeSelect.value = itemToEdit.dataset.trackType || 'Album Track';

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
        } else {
            albumTrackModalTitle.textContent = 'Adicionar Faixa';
            editingTrackItemId.value = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        }

        albumTrackModal.classList.remove('hidden');
    }

    function closeAlbumTrackModal() {
        albumTrackModal.classList.add('hidden');
        editingTrackItem = null;
        editingTrackItemId.value = '';
        inlineFeatAdder.classList.add('hidden');
        if (addInlineFeatBtn) addInlineFeatBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Feat';
    }

    function saveAlbumTrack() {
        const name = albumTrackName
