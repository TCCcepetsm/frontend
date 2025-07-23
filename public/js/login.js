document.addEventListener('DOMContentLoaded', function () {
    // Elementos do formulário
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('senha');
    const submitBtn = loginForm?.querySelector('button[type="submit"]');

    // Verificação de elementos
    if (!loginForm || !emailInput || !passwordInput || !submitBtn) {
        console.error('Elementos do formulário não encontrados:', {
            form: loginForm,
            email: emailInput,
            senha: passwordInput,
            botao: submitBtn
        });
        return;
    }

    // Manipulador de submit
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Valores dos inputs
        const credentials = {
            email: emailInput.value.trim(),
            senha: passwordInput.value
        };

        // Validação
        if (!credentials.email || !credentials.senha) {
            alert('Por favor, preencha todos os campos corretamente!');
            return;
        }

        try {
            // Estado de carregamento
            submitBtn.disabled = true;
            submitBtn.textContent = 'Autenticando...';

            // Requisição à API
            const response = await fetch('https://psychological-cecilla-peres-7395ec38.koyeb.app/api/auth/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(credentials),
                credentials: 'include',
                mode: 'cors'
            });

            // Tratamento da resposta
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(
                    responseData.message ||
                    responseData.error ||
                    `Erro ${response.status}: Falha na autenticação`
                );
            }

            // Processamento dos dados de autenticação
            const authData = {
                token: responseData.jwtToken || responseData.token,
                user: responseData.userData || responseData.user || {}
            };

            if (!authData.token) {
                throw new Error('Token de autenticação não recebido');
            }

            // Verificação robusta do tipo de usuário
            const user = authData.user;

            // Configuração padrão de roles se não existir
            user.roles = Array.isArray(user.roles) ? user.roles : [];

            // Verifica se é profissional por:
            // 1. Roles (ROLE_PROFISSIONAL)
            // 2. Tipo de conta (CNPJ ou PROFISSIONAL)
            // 3. Existência de CNPJ no cadastro
            const isProfessional = (
                user.roles.includes('ROLE_PROFISSIONAL') ||
                ['CNPJ', 'PROFISSIONAL'].includes(user.tipo) ||
                (user.cnpj && user.cnpj.trim() !== '')
            );

            // Debug: Mostra os dados do usuário no console
            console.log('Dados do usuário:', user);
            console.log('É profissional?', isProfessional);

            // Armazenamento seguro
            localStorage.setItem('authToken', authData.token);
            localStorage.setItem('userProfile', JSON.stringify(user));

            // Redirecionamento correto
            const redirectUrl = isProfessional
                ? '../views/inicialAdmin.html'
                : '../views/inicial.html';

            console.log('Redirecionando para:', redirectUrl);
            window.location.href = redirectUrl;

        } catch (error) {
            console.error('Falha na autenticação:', {
                error: error,
                message: error.message,
                stack: error.stack
            });

            alert(error.message || 'Não foi possível completar o login. Por favor, tente novamente.');
        } finally {
            // Reset do botão
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar';
        }
    });

    // Debug inicial
    console.debug('Formulário de login inicializado com sucesso');
});