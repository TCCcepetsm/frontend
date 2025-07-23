// public/js/auth.js
(function() {
    function getAuthToken() {
        return localStorage.getItem('jwtToken');
    }

    function setAuthToken(token) {
        localStorage.setItem('jwtToken', token);
    }

    function removeAuthToken() {
        localStorage.removeItem('jwtToken');
    }

    function checkAuthentication() {
        const token = getAuthToken();
        if (!token) {
            console.warn("Não autenticado: Token JWT ausente. Redirecionando para login.");
            window.location.href = 'login.html'; // Adjust your login page path
            return false;
        }
        // Optional: Add token validation logic here (e.g., check expiry)
        return true;
    }

    function logout() {
        removeAuthToken();
        console.log("Logout realizado. Redirecionando para login.");
        window.location.href = 'login.html'; // Adjust your login page path
    }

    // Expose these functions globally for other scripts
    window.getAuthToken = getAuthToken;
    window.setAuthToken = setAuthToken;
    window.removeAuthToken = removeAuthToken;
    window.checkAuthentication = checkAuthentication;
    window.logout = logout;
})();