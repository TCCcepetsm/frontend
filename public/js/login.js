document.addEventListener('DOMContentLoaded', function () {
    // Verificar se o formulário existe
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        console.error('Formulário de login não encontrado!');
        return;
    }

    // Verificar se os campos existem antes de adicionar o event listener
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('senha');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (!emailInput || !passwordInput || !submitBtn) {
        console.error('Elementos do formulário não encontrados!');
        return;
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Obter valores dos inputs
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validação básica
        if (!email || !password) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        try {
            // Feedback visual
            submitBtn.disabled = true;
            submitBtn.textContent = 'Entrando...';

            // Requisição de login
            const response = await fetch('https://psychological-cecilla-peres-7395ec38.koyeb.app/api/auth/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    senha: password
                }),
                credentials: 'include', // Isso requer CORS configurado no backend
                mode: 'cors' // Garante o modo CORS
            });

            // Verificar resposta
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Credenciais inválidas');
            }

            // Processar resposta
            const { jwtToken, userData } = await response.json();

            // Armazenar tokens
            localStorage.setItem('jwtToken', jwtToken);
            localStorage.setItem('userData', JSON.stringify(userData));

            // Redirecionar
            const redirectUrl = userData.roles?.includes('ROLE_PROFISSIONAL')
                ? '../views/inicialAdmin.html'
                : '../views/inicial.html';

            window.location.href = redirectUrl;

        } catch (error) {
            console.error('Erro no login:', error);
            alert(error.message || 'Erro ao realizar login. Tente novamente.');
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar';
        }
    });
    console.log('Elementos encontrados:', {
        form: document.getElementById('loginForm'),
        email: document.getElementById('email'),
        senha: document.getElementById('senha')
    });
});