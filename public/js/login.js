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
                credentials: 'include',
                mode: 'cors'
            });

            console.log('Status da resposta:', response.status);
            const responseData = await response.json();
            console.log('Dados completos da resposta:', responseData);

            // Verificar resposta
            if (!response.ok) {
                throw new Error(responseData.message || `Erro ${response.status}: Credenciais inválidas`);
            }

            // Processar resposta com verificações robustas
            const jwtToken = responseData.jwtToken || responseData.token;
            const userData = responseData.userData || responseData.user || {};

            if (!jwtToken) {
                throw new Error('Token JWT não recebido na resposta');
            }

            // Definir roles padrão se não existirem
            if (!userData.roles) {
                console.warn('Roles não definidos no userData, usando padrão');
                userData.roles = ['ROLE_PACIENTE'];
            }

            // Armazenar tokens
            localStorage.setItem('jwtToken', jwtToken);
            localStorage.setItem('userData', JSON.stringify(userData));

            // Determinar URL de redirecionamento com fallback
            let redirectUrl = '../views/inicial.html';
            if (Array.isArray(userData.roles)) {
                redirectUrl = userData.roles.includes('ROLE_PROFISSIONAL')
                    ? '../views/inicialAdmin.html'
                    : '../views/inicial.html';
            }

            console.log('Redirecionando para:', redirectUrl);
            window.location.href = redirectUrl;

        } catch (error) {
            console.error('Erro detalhado no login:', error);
            alert(error.message || 'Erro ao realizar login. Por favor, verifique suas credenciais e tente novamente.');
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar';
        }
    });

    // Log de verificação dos elementos (opcional para debug)
    console.log('Elementos do formulário verificados:', {
        form: loginForm,
        email: emailInput,
        senha: passwordInput
    });
});