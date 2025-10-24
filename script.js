async function main() {
    console.log("DEBUG: Entering main function...");
    if (!initializeDOMElements()) {
         console.error("DEBUG: initializeDOMElements failed. Exiting main.");
         return;
    }
    console.log("DEBUG: initializeDOMElements successful.");

    document.body.classList.add('loading');
    console.log("DEBUG: Starting data load...");
    const data = await loadAllData();
    console.log("DEBUG: Data load finished.", data ? "Data received." : "Data load FAILED.");

    if (data && data.allArtists) {
        console.log("DEBUG: Data seems valid, initializing data structure...");
        if (!initializeData(data)) {
            console.error("DEBUG: initializeData failed. Exiting main.");
            document.body.classList.remove('loading'); return;
        }
        console.log("DEBUG: initializeData successful.");

        // try { // << COMENTE O TRY INICIALMENTE
            // console.log("DEBUG: Entering UI setup block (try)...");
            // initializeStudio();
            // console.log("DEBUG: initializeStudio finished.");

            // if (newSingleForm) { newSingleForm.addEventListener('submit', handleSingleSubmit); /*...*/ }
            // if (newAlbumForm) { newAlbumForm.addEventListener('submit', handleAlbumSubmit); /*...*/ }
            // // ... COMENTE TODAS AS LINHAS DE SETUP DA UI ...

            // console.log("DEBUG: Switching to initial tab...");
            // switchTab(null, 'homeSection'); // << COMENTE A CHAMADA INICIAL
            // console.log("DEBUG: Application startup sequence finished successfully.");

        // } catch (uiError) { // << COMENTE O CATCH INICIALMENTE
        //     console.error("DEBUG: Error during UI setup block (catch):", uiError);
        //     // ...
        // }
    } else {
         // ... (código de erro de dados)
    }
    document.body.classList.remove('loading');
    console.log("DEBUG: Exiting main function (potentially incomplete due to commenting)."); // DEBUG
}
