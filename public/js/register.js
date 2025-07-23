document.addEventListener('DOMContentLoaded', function () {
    // Verifica se o usuário já está logado
    if (localStorage.getItem('authToken')) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const redirectUrl = userInfo?.roles?.includes('ROLE_ADMIN')
            ? '/views/inicialAdmin.html'
            : '/views/inicial.html';
        window.location.href = redirectUrl;
        return;
    }

    // Configura máscaras para os campos
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

// Função principal de registro
async function handleRegister() {
    const submitBtn = document.getElementById('registerBtn');

    try {
        if (submitBtn) submitBtn.disabled = true;
        toggleLoading(true);

        const formData = getFormData();
        console.log("Dados do formulário:", formData); // Log para depuração

        const errors = validateForm(formData);
        if (errors.length > 0) {
            showError(errors.join('<br>'));
            return;
        }

        const response = await fetch('https://psychological-cecilla-peres-7395ec38.koyeb.app/api/usuario/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Detalhes do erro da API:", errorData);
            throw new Error(errorData.message || errorData.error || 'Erro no registro');
        }

        const result = await response.json();
        showSuccess('Registro realizado com sucesso!');

        setTimeout(() => {
            window.location.href = '/views/login.html';
        }, 2000);

    } catch (error) {
        console.error('Erro completo:', error);
        showError(error.message || 'Erro ao realizar o registro');
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