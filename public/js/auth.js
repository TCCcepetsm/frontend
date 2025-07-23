(function () {
    const TOKEN_KEY = 'myApp_jwtToken';

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
        } catch (e) {
            console.error("Error removing token", e);
        }
    }

    function checkAuthentication() {
        const token = getAuthToken();
        if (!token) {
            console.warn("Não autenticado: Token JWT ausente. Redirecionando para login.");
            window.location.href = '/login.html'; // Caminho absoluto
            return false;
        }

        // Validação básica do token (exemplo)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                console.warn("Token expirado");
                removeAuthToken();
                window.location.href = '/login.html';
                return false;
            }
            return true;
        } catch (e) {
            console.error("Invalid token", e);
            removeAuthToken();
            window.location.href = '/login.html';
            return false;
        }
    }

    function logout() {
        removeAuthToken();
        console.log("Logout realizado. Redirecionando para login.");
        window.location.href = '/login.html';
    }

    // Expose these functions
    window.auth = {
        getToken: getAuthToken,
        setToken: setAuthToken,
        removeToken: removeAuthToken,
        checkAuth: checkAuthentication,
        logout: logout
    };
})();