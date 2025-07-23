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

function checkIfCnpjProfessional(user) {
    // Verifica se tem ROLE_PROFISSIONAL (seu "admin")
    if (Array.isArray(user.roles) && user.roles.includes('ROLE_PROFISSIONAL')) {
        return true;
    }

    // Verifica outros critérios (CNPJ ou tipo PJ)
    return (
        (user.cnpj && user.cnpj.trim() !== '') ||
        (user.tipo && ['PJ', 'CNPJ', 'PROFISSIONAL'].includes(user.tipo.toUpperCase()))
    );
}