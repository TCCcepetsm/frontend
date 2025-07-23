document.addEventListener('DOMContentLoaded', function () {
    // Verificação unificada de autenticação
    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    // 1. Se não estiver autenticado
    if (!token) {
        window.location.href = '/views/login.html';
        return;
    }

    // 2. Verifica se NÃO é profissional
    const isProfessional = (
        (Array.isArray(userInfo.roles) && userInfo.roles.includes('ROLE_PROFISSIONAL')) ||
        userInfo.tipo === 'PJ' ||
        (userInfo.cnpj && userInfo.cnpj.trim() !== '')
    );

    // 3. Se não for profissional, redireciona para página normal
    if (!isProfessional) {
        window.location.href = '/views/inicial.html';
        return;
    }

    // 4. Configuração do botão de logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            ['authToken', 'userInfo'].forEach(item => {
                localStorage.removeItem(item);
            });
            window.location.href = '/views/login.html';
        });
    }

    // 5. Efeitos interativos específicos para admin
    const adminCards = document.querySelectorAll('.admin-card');
    adminCards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => card.style.transform = 'scale(1)', 200);
        });
    });

    // 6. Função global de navegação
    window.navigateTo = function (page) {
        window.location.href = page;
    };
});