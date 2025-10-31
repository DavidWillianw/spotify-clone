/* ===================================================
// LÓGICA DO CHECKBOX DELUXE (scriptt.js)
// Este script funciona de forma independente,
// apenas lendo o estado do DOM.
====================================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Módulo Deluxe (scriptt.js) carregado.");

    // --- 1. Elementos do DOM ---
    // Os elementos que este script precisa monitorar
    const toggleDeluxe = document.getElementById('toggleDeluxe');
    const editReleaseTitleInput = document.getElementById('editReleaseTitle');
    const editReleaseForm = document.getElementById('editReleaseForm'); // O formulário de edição

    // --- 2. Constantes ---
    // O texto que será adicionado/removido. Você pode mudar se quiser.
    const deluxeSuffix = " (Deluxe Edition)";
    // Regex para encontrar o sufixo (ex: " (Deluxe Edition)") no final do texto, ignorando maiúsculas
    const deluxeSuffixRegex = /\s\(Deluxe Edition\)$/i;

    // --- 3. Verificação ---
    // Se não encontrar os elementos, avisa no console e para.
    if (!toggleDeluxe || !editReleaseTitleInput || !editReleaseForm) {
        console.warn("Lógica Deluxe: Não foi possível encontrar #toggleDeluxe, #editReleaseTitle ou #editReleaseForm. O script 'Deluxe' não será executado.");
        return;
    }

    // --- 4. Lógica Principal ---

    /**
     * Lógica 1: O checkbox atualiza o Título
     * Quando o usuário MARCA o checkbox, adiciona o sufixo.
     * Quando DESMARCA, remove o sufixo.
     */
    toggleDeluxe.addEventListener('change', () => {
        const currentTitle = editReleaseTitleInput.value;
        const isChecked = toggleDeluxe.checked;

        if (isChecked) {
            // Marcado: Adiciona o sufixo se ainda não tiver
            if (!deluxeSuffixRegex.test(currentTitle)) {
                editReleaseTitleInput.value = currentTitle + deluxeSuffix;
            }
        } else {
            // Desmarcado: Remove o sufixo
            editReleaseTitleInput.value = currentTitle.replace(deluxeSuffixRegex, "");
        }
    });

    /**
     * Lógica 2: O Título (digitado) atualiza o Checkbox
     * Se o usuário digitar " (Deluxe Edition)" manualmente,
     * o checkbox deve marcar sozinho.
     */
    editReleaseTitleInput.addEventListener('input', () => {
        const currentTitle = editReleaseTitleInput.value;
        
        if (deluxeSuffixRegex.test(currentTitle)) {
            // Se o título agora tem o sufixo, marque o checkbox
            if (!toggleDeluxe.checked) {
                toggleDeluxe.checked = true;
            }
        } else {
            // Se o título não tem (ou foi apagado), desmarque o checkbox
            if (toggleDeluxe.checked) {
                toggleDeluxe.checked = false;
            }
        }
    });

    /**
     * Lógica 3: Sincronização automática quando o modal abre
     * O script.js original preenche o título quando o modal de edição abre.
     * Precisamos "ouvir" quando isso acontece para sincronizar o checkbox.
     * Usamos um MutationObserver para "assistir" o formulário de edição.
     */
    const formObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            // Observa apenas mudanças no atributo 'class'
            if (mutation.attributeName === 'class') {
                const isHidden = editReleaseForm.classList.contains('hidden');
                
                // Se a classe 'hidden' FOI REMOVIDA (ou seja, o form ficou visível)
                if (!isHidden) {
                    // O MODAL ACABOU DE ABRIR!
                    // Sincroniza o checkbox com o título que o script.js inseriu
                    const currentTitleOnOpen = editReleaseTitleInput.value;
                    if (deluxeSuffixRegex.test(currentTitleOnOpen)) {
                        toggleDeluxe.checked = true;
                    } else {
                        toggleDeluxe.checked = false;
                    }
                }
            }
        }
    });

    // Inicia o observador para "assistir" o <form id="editReleaseForm">
    formObserver.observe(editReleaseForm, { attributes: true });

});
