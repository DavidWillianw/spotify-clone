/* ===================================================
// LÓGICA DELUXE (scriptt.js)
// Este script controla a interface de importação "Deluxe".
// Ele depende que script.js exponha as funções:
// - window.db
// - window.populateTracklistEditor
// - window.albumArtistSelect
// - window.albumTracklistEditor
// - window.albumTitle
====================================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Módulo Deluxe (scriptt.js) carregado.");

    // --- 1. Elementos do DOM (Novos e do script.js) ---
    const toggleDeluxe = document.getElementById('toggleDeluxe');
    const selectOriginalAlbumModal = document.getElementById('selectOriginalAlbumModal');
    const originalAlbumSelect = document.getElementById('originalAlbumSelect');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    const cancelImportBtn = document.getElementById('cancelImportBtn');
    
    // Elementos que esperamos que o script.js principal exponha
    const getGlobal = (varName) => window[varName];

    // --- 2. Verificação de Elementos ---
    if (!toggleDeluxe || !selectOriginalAlbumModal || !originalAlbumSelect || !confirmImportBtn || !cancelImportBtn) {
        console.error("Lógica Deluxe: Elementos essenciais do modal de importação não encontrados no HTML. O script Deluxe será desativado.");
        return;
    }

    // --- 3. Funções da Lógica Deluxe ---

    /**
     * Abre o modal para selecionar um álbum base para a edição Deluxe.
     * Filtra os álbuns do artista selecionado no formulário "Novo Álbum".
     */
    function openImportDeluxeModal() {
        // Pega as variáveis globais expostas pelo script.js
        const db = getGlobal('db');
        const albumArtistSelect = getGlobal('albumArtistSelect');

        if (!db || !albumArtistSelect) {
            alert("Erro: A base de dados principal (db) ou o seletor de artista não foi carregado. Tente atualizar a página.");
            console.error("scriptt.js: Não foi possível encontrar window.db ou window.albumArtistSelect.");
            if (toggleDeluxe) toggleDeluxe.checked = false;
            return;
        }

        const artistId = albumArtistSelect.value;
        if (!artistId) {
            alert("Por favor, selecione o Artista Principal primeiro.");
            if (toggleDeluxe) toggleDeluxe.checked = false;
            return;
        }

        // Filtra apenas ÁLBUNS (tipo 'album') do artista selecionado
        const artistAlbums = db.albums.filter(a => a.artistId === artistId);

        if (artistAlbums.length === 0) {
            alert("Nenhum álbum anterior encontrado para este artista. Você não pode lançar uma edição Deluxe.");
            if (toggleDeluxe) toggleDeluxe.checked = false;
            return;
        }

        // Popula o select com os álbuns encontrados
        originalAlbumSelect.innerHTML = artistAlbums
            .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)) // Mais recentes primeiro
            .map(album => `<option value="${album.id}">${album.title}</option>`)
            .join('');
        
        // Mostra o modal
        selectOriginalAlbumModal.classList.remove('hidden');
    }

    /**
     * Pega as faixas do álbum selecionado no modal Deluxe
     * e as popula no editor de tracklist do NOVO álbum.
     */
    function handleImportDeluxeTracks() {
        const albumIdToImport = originalAlbumSelect.value;

        // Pega as funções e variáveis globais do script.js
        const db = getGlobal('db');
        const populateTracklistEditor = getGlobal('populateTracklistEditor');
        const albumTracklistEditor = getGlobal('albumTracklistEditor');
        const albumTitle = getGlobal('albumTitle'); // Input de texto do título

        if (!db || !populateTracklistEditor || !albumTracklistEditor || !albumTitle) {
            alert("Erro fatal: Funções essenciais do script.js não foram encontradas. A importação falhou.");
            console.error("scriptt.js: Não foi possível encontrar globais (db, populateTracklistEditor, etc.)");
            return;
        }

        if (!albumIdToImport) {
            console.error("ID do álbum para importar não encontrado.");
            return;
        }

        const album = db.albums.find(a => a.id === albumIdToImport);
        if (!album) {
            alert("Erro: Álbum base não encontrado no banco de dados.");
            return;
        }

        console.log(`Importando ${album.tracks.length} faixas de "${album.title}"...`);

        // 1. Chama a função GLOBAL do script.js para popular o editor de tracklist
        populateTracklistEditor(albumTracklistEditor, album.tracks);

        // 2. Define o título do novo álbum para "Título Antigo (Deluxe)"
        albumTitle.value = `${album.title} (Deluxe)`;

        // 3. Fecha o modal
        selectOriginalAlbumModal.classList.add('hidden');
    }

    // --- 4. Adicionar Listeners ---

    // Listener principal no checkbox "Deluxe"
    toggleDeluxe.addEventListener('change', () => {
        if (toggleDeluxe.checked) {
            openImportDeluxeModal();
        }
        // Se desmarcado, não fazemos nada, o usuário pode querer limpar manualmente
    });

    // Listeners nos botões do novo modal
    confirmImportBtn.addEventListener('click', () => {
        handleImportDeluxeTracks();
    });
    
    cancelImportBtn.addEventListener('click', () => {
        selectOriginalAlbumModal.classList.add('hidden');
        if (toggleDeluxe) toggleDeluxe.checked = false; // Desmarca o checkbox
    });

    // Listener para desmarcar o "Deluxe" se o artista mudar
    // Precisamos de um listener separado aqui porque o albumArtistSelect é do script.js
    const albumArtistSelect = document.getElementById('albumArtistSelect');
    if (albumArtistSelect) {
        albumArtistSelect.addEventListener('change', () => {
            if (toggleDeluxe.checked) {
                console.log("Artista mudou, resetando checkbox Deluxe.");
                toggleDeluxe.checked = false;
                // Opcional: Limpar o editor de tracklist também
                const populateTracklistEditor = getGlobal('populateTracklistEditor');
                const albumTracklistEditor = getGlobal('albumTracklistEditor');
                if(populateTracklistEditor && albumTracklistEditor) {
                    populateTracklistEditor(albumTracklistEditor, []);
                }
            }
        });
    }

});
