// Em inicialAdmin.js

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('authToken');
    const userInfoString = localStorage.getItem('userInfo');

    if (!token || !userInfoString) {
        // Se não houver token ou info, manda para o login
        window.location.href = '/views/login.html';
        return;
    }

    try {
        const userInfo = JSON.parse(userInfoString);

        // Verifica se o usuário tem a role de profissional
        const isProfessional = userInfo.roles && userInfo.roles.includes('ROLE_PROFISSIONAL');

        if (!isProfessional) {
            // Se NÃO for um profissional, ele não deveria estar aqui. Redireciona para a página comum.
            window.location.href = '/views/inicial.html';
            return;
        }

        // Se chegou até aqui, o usuário é profissional e está na página correta.
        // Continue com a lógica da página.
        setupLogoutButton();

    } catch (e) {
        console.error("Erro ao processar informações do usuário:", e);
        // Limpa dados corrompidos e redireciona para o login
        localStorage.clear();
        window.location.href = '/views/login.html';
    }
});

function setupLogoutButton() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            window.location.href = '/views/login.html';
        });
    }
}

// Função de navegação (se precisar)
window.navigateTo = function (page) {
    window.location.href = page;
};
