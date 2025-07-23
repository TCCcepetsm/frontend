document.addEventListener('DOMContentLoaded', function() {
    // 1. Verificar autenticação e perfil
    const token = localStorage.getItem('jwtToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    if (!token) {
        window.location.href = '../views/login.html';
        return;
    }

    // 2. Se NÃO for profissional, redireciona para página comum
    if (!userData.roles?.includes('ROLE_PROFISSIONAL')) {
        window.location.href = '../views/inicial.html';
        return;
    }

    // 3. Efeitos interativos (apenas para admin)
    const adminCards = document.querySelectorAll('.admin-card');
    adminCards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => card.style.transform = 'scale(1)', 200);
        });
    });

        // 3. Configurar botão de logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            // Limpa todos os dados de autenticação
            localStorage.removeItem('authToken');
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('userData');

            // Redireciona para login
            window.location.href = 'login.html';
        });
    }

    // Função global de navegação
    window.navigateTo = function(page) {
        window.location.href = page;
    };
});