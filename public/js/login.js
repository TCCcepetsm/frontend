document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;

        if (!email || !senha) {
            alert('Preencha todos os campos!');
            return;
        }

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Autenticando...';

        try {
            const response = await fetch('https://psychological-cecilla-peres-7395ec38.koyeb.app/api/auth/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na autenticação');
            }

            // Processamento da resposta
            const token = data.token || data.jwtToken;
            const user = data.user || data.userData || {};

            // Verificação robusta se é CNPJ/Profissional
            const isCnpjProfessional = checkIfCnpjProfessional(user);
            console.log('É CNPJ/Profissional?', isCnpjProfessional, user);

            // Armazenamento seguro
            localStorage.setItem('authToken', token);
            localStorage.setItem('userProfile', JSON.stringify(user));

            // Redirecionamento correto
            window.location.href = isCnpjProfessional
                ? '../views/inicialAdmin.html'
                : '../views/inicial.html';

        } catch (error) {
            console.error('Erro no login:', error);
            alert(error.message || 'Falha no login. Tente novamente.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar';
        }
    });
});

// Função para identificar CNPJ/Profissional
function checkIfCnpjProfessional(user) {
    // Verifica pelo campo CNPJ (não vazio)
    if (user.cnpj && user.cnpj.trim() !== '') {
        return true;
    }

    // Verifica pelo tipo de conta
    if (user.tipo && ['CNPJ', 'PROFISSIONAL'].includes(user.tipo.toUpperCase())) {
        return true;
    }

    // Verifica pelas roles do usuário
    if (Array.isArray(user.roles)) {
        return user.roles.includes('ROLE_PROFISSIONAL') ||
            user.roles.includes('ROLE_ADMIN');
    }

    // Verifica por outros indicadores
    if (user.isProfessional || user.isAdmin) {
        return true;
    }

    return false;
}