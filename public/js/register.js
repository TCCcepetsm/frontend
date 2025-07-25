document.addEventListener('DOMContentLoaded', function () {
    console.log('Página de registro carregada');
    console.log('Token no localStorage:', localStorage.getItem('authToken'));

    // Verificação modificada - só redireciona se já estiver logado
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            console.log('UserInfo:', userInfo);

            const isProfessional = userInfo?.roles?.includes('ROLE_PROFISSIONAL') ||
                userInfo?.tipo === 'PJ' ||
                (userInfo?.cnpj && userInfo.cnpj.trim() !== '');

            if (isProfessional) {
                window.location.href = '/views/inicialAdmin.html';
            } else {
                window.location.href = '/views/inicial.html';
            }
            return;
        } catch (e) {
            console.error('Erro ao parsear userInfo:', e);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
        }
    }
    // Configura máscaras para os campos - MOVIDO PARA FORA DO BLOCO CONDICIONAL
    $('#cpf').mask('000.000.000-00');
    $('#cnpj').mask('00.000.000/0000-00');
    $('#phone').mask('(00) 00000-0000');

    // Alternar entre Pessoa Física e Jurídica
    document.querySelectorAll('.toggle-option').forEach(function (button) {
        button.addEventListener('click', function () {
            const logo = document.querySelector('.logo img');
            const isPJ = this.dataset.value === 'pj';

            document.querySelectorAll('.toggle-option').forEach(function (btn) {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            document.getElementById('userType').value = this.dataset.value;

            document.getElementById('cpfGroup').style.display = isPJ ? 'none' : 'block';
            document.getElementById('cnpjGroup').style.display = isPJ ? 'block' : 'none';
            document.getElementById('cpf').required = !isPJ;
            document.getElementById('cnpj').required = isPJ;

            document.body.classList.toggle('theme-orange', isPJ);
            logo.src = isPJ ? '../public/images/logoAdmin.png' : '../public/images/logo.png';
        });
    });

    // Configura o formulário de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        createFeedbackElements();

        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleRegister()
                .then(function () {
                    // Sucesso já tratado no handleRegister
                })
                .catch(function (error) {
                    console.error("Erro no registro:", error);
                });
        });
    }
});

// Função para criar elementos de feedback
function createFeedbackElements() {
    // Cria o spinner de carregamento se não existir
    if (!document.getElementById('loading-spinner')) {
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.style.cssText = 'display:none; margin-left:10px;';
        spinner.innerHTML = '⏳';

        const submitBtn = document.getElementById('registerBtn');
        if (submitBtn) {
            submitBtn.insertAdjacentElement('afterend', spinner);
        }
    }

    // Cria o container de mensagens se não existir
    if (!document.getElementById('feedback-messages')) {
        const messagesDiv = document.createElement('div');
        messagesDiv.id = 'feedback-messages';
        messagesDiv.style.cssText = 'margin: 15px 0; min-height: 50px;';

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.parentNode.insertBefore(messagesDiv, registerForm.nextSibling);
        }
    }
}

// Função principal de registro - MODIFICADA
async function handleRegister() {
    const submitBtn = document.getElementById('registerBtn');

    try {
        if (submitBtn) submitBtn.disabled = true;
        toggleLoading(true);

        const formData = getFormData();
        console.log("Dados do formulário para registro:", formData);

        const errors = validateForm(formData);
        if (errors.length > 0) {
            showError(errors.join(''));
            return; // Não continue se houver erros
        }

        const response = await fetch('https://psychological-cecilla-peres-7395ec38.koyeb.app/api/usuario/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json(); // Sempre parseie a resposta

        if (!response.ok) {
            // Se a resposta não for OK, use a mensagem de erro do backend
            const errorMessage = result.error || (typeof result === 'object' ? JSON.stringify(result) : "Erro no registro");
            throw new Error(errorMessage);
        }

        // --- SUCESSO NO REGISTRO ---
        // Agora 'result' é um AuthenticationResponse com token e roles
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userInfo', JSON.stringify({
            email: result.email,
            nome: result.nome,
            roles: result.roles, // As roles vêm diretamente da resposta!
            tipo: formData.tipo // Mantém o tipo para consistência
        }));

        showSuccess('Registro realizado com sucesso! Redirecionando...');

        // Redireciona com base nas roles recebidas
        const isProfessional = result.roles.includes('ROLE_PROFISSIONAL');
        const redirectUrl = isProfessional
            ? '/views/inicialAdmin.html'
            : '/views/inicial.html';

        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);

    } catch (error) {
        console.error('Erro completo no registro:', error);
        showError(error.message || 'Não foi possível realizar o registro.');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        toggleLoading(false);
    }
}


// Controla o spinner de carregamento
function toggleLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = show ? 'inline-block' : 'none';
    }
}

// Mostra mensagens de erro
function showError(message) {
    const feedbackDiv = document.getElementById('feedback-messages');
    if (feedbackDiv) {
        feedbackDiv.innerHTML = '<div class="error-message" style="color:red;">' + message + '</div>';
        feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Mostra mensagens de sucesso
function showSuccess(message) {
    const feedbackDiv = document.getElementById('feedback-messages');
    if (feedbackDiv) {
        feedbackDiv.innerHTML = '<div class="success-message" style="color:green;">' + message + '</div>';
    }
}

// Obtém os dados do formulário
function getFormData() {
    const userType = document.getElementById('userType').value;
    const isPJ = userType === 'pj';

    const data = {
        nome: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('phone').value.replace(/\D/g, ''),
        senha: document.getElementById('password').value,
        confirmarSenha: document.getElementById('confirmPassword').value,
        agreeTerms: document.getElementById('agreeTerms').checked,
        tipo: userType.toUpperCase()
    };

    if (isPJ) {
        data.cnpj = document.getElementById('cnpj').value.replace(/\D/g, '');
    } else {
        data.cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    }

    return data;
}

// Valida os dados do formulário
function validateForm(formData) {
    const errors = [];
    const { nome, email, cpf, cnpj, telefone, senha, confirmarSenha, agreeTerms, tipo } = formData;
    const isPJ = tipo === 'PJ';

    if (!nome || nome.length < 3) errors.push('Nome deve ter pelo menos 3 caracteres');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email inválido');
    if (!telefone || telefone.length < 11) errors.push('Telefone inválido');
    if (!senha || senha.length < 6) errors.push('Senha deve ter pelo menos 6 caracteres');
    if (senha !== confirmarSenha) errors.push('As senhas não coincidem');
    if (!agreeTerms) errors.push('Você deve aceitar os termos');

    if (isPJ) {
        if (!cnpj || !validarCNPJ(cnpj)) errors.push('CNPJ inválido');
    } else {
        if (!cpf || !validarCPF(cpf)) errors.push('CPF inválido');
    }

    return errors;
}

// Valida CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.length === 11;
}

// Valida CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    return cnpj.length === 14;
}

