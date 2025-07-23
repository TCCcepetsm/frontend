(function () {
    // PADRONIZE A CHAVE DO TOKEN AQUI
    const TOKEN_KEY = 'authToken'; // <<-- CORREÇÃO IMPORTANTE

    function getAuthToken() {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch (e) {
            console.error("Error accessing localStorage", e);
            return null;
        }
    }

    function setAuthToken(token) {
        try {
            localStorage.setItem(TOKEN_KEY, token);
        } catch (e) {
            console.error("Error setting token", e);
        }
    }

    function removeAuthToken() {
        try {
            localStorage.removeItem(TOKEN_KEY);
            // Limpe também as informações do usuário para consistência
            localStorage.removeItem('userInfo');
        } catch (e) {
            console.error("Error removing token", e);
        }
    }

    function checkAuthentication() {
        const token = getAuthToken();
        if (!token) {
            console.warn("Não autenticado: Token JWT ausente. Redirecionando para login.");
            // Use um caminho absoluto para evitar erros de navegação
            window.location.href = '/views/login.html';
            return false;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                console.warn("Token expirado. Redirecionando para login.");
                removeAuthToken();
                window.location.href = '/views/login.html';
                return false;
            }
            return true;
        } catch (e) {
            console.error("Token inválido:", e);
            removeAuthToken();
            window.location.href = '/views/login.html';
            return false;
        }
    }

    function logout() {
        removeAuthToken();
        console.log("Logout realizado. Redirecionando para login.");
        window.location.href = '/views/login.html';
    }

    // Exponha as funções globalmente
    window.auth = {
        getToken: getAuthToken,
        setToken: setAuthToken,
        removeToken: removeAuthToken,
        checkAuth: checkAuthentication,
        logout: logout
    };

    // Para compatibilidade com scripts antigos que podem chamar diretamente
    window.getAuthToken = getAuthToken;
    window.checkAuthentication = checkAuthentication;
    window.logout = logout;
})();