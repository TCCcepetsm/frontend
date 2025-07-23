document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // 1. Dados do formulário
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Preencha todos os campos!');
        return;
    }

    try {
        // 2. Requisição de login
        const response = await fetch('https://psychological-cecilla-peres-7395ec38.koyeb.app/api/auth/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha: password }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro no login');
        }

        // 3. Processar resposta
        const { jwtToken, userData } = await response.json();
        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('userData', JSON.stringify(userData));

        // 4. Redirecionar com base na role
        if (userData.roles?.includes('ROLE_PROFISSIONAL')) {
            window.location.href = '../views/inicialAdmin.html'; // Caminho para admin
        } else {
            window.location.href = '../views/inicial.html'; // Caminho para usuário comum
        }

    } catch (error) {
        console.error('Erro no login:', error);
        alert(error.message || 'Falha ao logar');
        localStorage.clear();
    }
});