document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // 1. Dados do formulário (usando o ID correto 'senha')
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('senha').value;

            if (!email || !password) {
                alert('Preencha todos os campos!');
                return;
            }

            try {
                // Mostrar estado de carregamento
                const submitBtn = document.querySelector('#loginForm button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = 'Entrando...';
                }

                // 2. Requisição de login
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
                    credentials: 'include'
                });

                // Verificar se a resposta está vazia
                const responseText = await response.text();
                if (!responseText) {
                    throw new Error('Resposta vazia do servidor');
                }

                const result = JSON.parse(responseText);

                if (!response.ok) {
                    throw new Error(result.message || 'Erro no login');
                }

                // 3. Processar resposta
                const { jwtToken, userData } = result;
                localStorage.setItem('jwtToken', jwtToken);
                localStorage.setItem('userData', JSON.stringify(userData));

                // 4. Redirecionar com base na role
                if (userData.roles?.includes('ROLE_PROFISSIONAL')) {
                    window.location.href = '../views/inicialAdmin.html';
                } else {
                    window.location.href = '../views/inicial.html';
                }

            } catch (error) {
                console.error('Erro no login:', error);
                alert(error.message || 'Falha ao logar. Tente novamente.');
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userData');
            } finally {
                // Restaurar botão
                const submitBtn = document.querySelector('#loginForm button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Entrar';
                }
            }
        });
    }
});