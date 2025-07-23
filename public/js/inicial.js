document.addEventListener('DOMContentLoaded', function() {
    // 1. Verificar autenticação
    const token = localStorage.getItem('jwtToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    if (!token) {
        window.location.href = 'login.html'; // Redireciona se não logado
        return;
    }

    // 2. Se for profissional, redireciona para admin
    if (userData.roles?.includes('ROLE_PROFISSIONAL')) {
        window.location.href = '../views/inicialAdmin.html';
        return;
    }

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
    
    // 3. Efeitos interativos (apenas para usuários comuns)
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        });
    });

    // Função global de navegação
    window.navigateTo = function(page) {
        window.location.href = page;
    };
});

