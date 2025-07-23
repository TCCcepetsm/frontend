document.addEventListener('DOMContentLoaded', function () {
    // Verificação unificada de autenticação
    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    // 1. Se não estiver autenticado
    if (!token) {
        window.location.href = '/views/login.html';
        return;
    }

    // 2. Verifica se é profissional (admin)
    const isProfessional = (
        (Array.isArray(userInfo.roles) && userInfo.roles.includes('ROLE_PROFISSIONAL')) ||
        userInfo.tipo === 'PJ' ||
        (userInfo.cnpj && userInfo.cnpj.trim() !== '')
    );

    // 3. Se for profissional, redireciona para admin
    if (isProfessional) {
        window.location.href = '/views/inicialAdmin.html';
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

    // 5. Efeitos interativos (exemplo para cards)
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

    // 6. Função global de navegação
    window.navigateTo = function (page) {
        window.location.href = page;
    };
});