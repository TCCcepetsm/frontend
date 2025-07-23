document.addEventListener('DOMContentLoaded', function () {
    const agendamentosList = document.getElementById('agendamentosList');
    const novoAgendamentoBtn = document.getElementById('novoAgendamentoBtn');
    const API_BASE_URL = "https://psychological-cecilla-peres-7395ec38.koyeb.app/api"; // Ajuste para sua URL backend
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        // Se não tiver token, redireciona para login
        window.location.href = "login.html";
        return;
    }

    novoAgendamentoBtn.addEventListener('click', redirectToNewAgendamento);

    loadAgendamentos();

    async function loadAgendamentos() {
        try {
            showLoading();

            // Endpoint para buscar agendamentos do usuário logado
            const response = await fetch(`${API_BASE_URL}/agendamentos2/meus-agendamentos`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar agendamentos');
            }

            const agendamentos = await response.json();

            if (!agendamentos || agendamentos.length === 0) {
                showEmptyMessage();
            } else {
                renderAgendamentos(agendamentos);
            }
        } catch (error) {
            console.error('Erro:', error);
            showErrorMessage();
        }
    }

    function renderAgendamentos(agendamentos) {
        agendamentosList.innerHTML = '';

        agendamentos.forEach(agendamento => {
            const agendamentoCard = createAgendamentoCard(agendamento);
            agendamentosList.appendChild(agendamentoCard);
        });
    }

    function createAgendamentoCard(agendamento) {
        const card = document.createElement('div');
        card.className = 'agendamento-card';

        const dataFormatada = formatDate(agendamento.data);

        card.innerHTML = `
            <div class="agendamento-header">
                <h3 class="agendamento-title">${agendamento.solicitante}</h3>
                <span class="agendamento-date">${dataFormatada} às ${agendamento.hora}</span>
            </div>
            <div class="agendamento-details">
                <div class="detail-row">
                    <span class="detail-label">Plano:</span>
                    <span class="detail-value">${agendamento.plano}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Contato:</span>
                    <span class="detail-value">${agendamento.telefone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">E-mail:</span>
                    <span class="detail-value">${agendamento.email}</span>
                </div>
                ${agendamento.observacoes ? `
                <div class="detail-row">
                    <span class="detail-label">Observações:</span>
                    <span class="detail-value">${agendamento.observacoes}</span>
                </div>
                ` : ''}
            </div>
            <div class="agendamento-actions">
                <button class="danger-button" data-id="${agendamento.id}">Cancelar</button>
            </div>
        `;

        card.querySelector('.danger-button').addEventListener('click', function () {
            cancelAgendamento(this.dataset.id);
        });

        return card;
    }

    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    async function cancelAgendamento(id) {
        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/agendamento/${id}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao cancelar agendamento');
            }

            alert('Agendamento cancelado com sucesso!');
            loadAgendamentos();
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cancelar agendamento. Por favor, tente novamente.');
        }
    }

    function redirectToNewAgendamento() {
        window.location.href = 'agendamento.html';
    }

    function showLoading() {
        agendamentosList.innerHTML = '<div class="loading-message">Carregando seus agendamentos...</div>';
    }

    function showEmptyMessage() {
        agendamentosList.innerHTML = '<div class="empty-message">Nenhum agendamento encontrado.</div>';
    }

    function showErrorMessage() {
        agendamentosList.innerHTML = '<div class="error-message">Erro ao carregar agendamentos. Por favor, tente novamente.</div>';
    }
});
