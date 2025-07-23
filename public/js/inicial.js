document.addEventListener('DOMContentLoaded', function () {
    // 1. Verificar autenticação - com tratamento seguro de JSON
    const token = localStorage.getItem('authToken') || localStorage.getItem('jwtToken');
    let userData = {};

    try {
        const userDataString = localStorage.getItem('userProfile') ||
            localStorage.getItem('userData') ||
            '{}';
        userData = JSON.parse(userDataString);
    } catch (e) {
        console.error('Erro ao parsear dados do usuário:', e);
        // Limpa dados inválidos e redireciona
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
        return;
    }

    // Redirecionamento se não autenticado
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Verificação de profissional com fallback seguro
    const isProfessional = (
        (Array.isArray(userData.roles) && userData.roles.includes('ROLE_PROFISSIONAL')) ||
        ['CNPJ', 'PROFISSIONAL'].includes(userData.tipo) ||
        (userData.cnpj && userData.cnpj.trim() !== '')
    );

    if (isProfessional) {
        window.location.href = '../views/inicialAdmin.html';
        return;
    }

    // 3. Configuração segura do botão de logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            // Limpeza completa de todos os possíveis tokens
            ['authToken', 'jwtToken', 'userProfile', 'userData', 'userInfo'].forEach(item => {
                localStorage.removeItem(item);
            });
            window.location.href = 'login.html';
        });
    }

    // 4. Efeitos interativos apenas para usuários comuns
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

    // 5. Função global de navegação
    window.navigateTo = function (page) {
        window.location.href = page;
    };
});