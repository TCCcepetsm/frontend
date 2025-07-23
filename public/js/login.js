// Em login.js

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
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Credenciais inválidas.');
            }

            // --- SUCESSO NO LOGIN ---
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userInfo', JSON.stringify({
                email: data.email,
                nome: data.nome,
                roles: data.roles // As roles vêm do backend
            }));

            // Redirecionamento baseado nas roles
            const isProfessional = data.roles && data.roles.includes('ROLE_PROFISSIONAL');

            console.log('Usuário autenticado. É profissional?', isProfessional);
            console.log('Roles recebidas:', data.roles);

            window.location.href = isProfessional
                ? '../views/inicialAdmin.html'
                : '../views/inicial.html';

        } catch (error) {
            console.error('Erro no login:', error);
            alert(error.message || 'Falha no login. Verifique seu e-mail e senha.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar';
        }
    });
});
