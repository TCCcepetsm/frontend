document.addEventListener('DOMContentLoaded', function () {
    const agendamentosList = document.getElementById('agendamentosList');
    const novoAgendamentoBtn = document.getElementById('novoAgendamentoBtn');
    const API_BASE_URL = "https://psychological-cecilla-peres-7395ec38.koyeb.app/api";
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    novoAgendamentoBtn.addEventListener('click', redirectToNewAgendamento);
    loadAgendamentos();

    async function loadAgendamentos() {
        try {
            showLoading();

            const response = await fetch(`${API_BASE_URL}/agendamentos2/meus-agendamentos`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const agendamentos = await response.json();
            agendamentosList.innerHTML = '';

            if (!agendamentos?.length) {
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
        agendamentos.forEach(agendamento => {
            const card = document.createElement('div');
            card.className = 'agendamento-card';
            card.innerHTML = `
                <div class="agendamento-header">
                    <h3>${agendamento.solicitante}</h3>
                    <span>${formatDate(agendamento.data)} às ${agendamento.hora}</span>
                </div>
                <div class="agendamento-details">
                    <div class="detail-row">
                        <span>Plano:</span>
                        <span>${agendamento.plano}</span>
                    </div>
                    <div class="detail-row">
                        <span>Contato:</span>
                        <span>${agendamento.telefone}</span>
                    </div>
                    <div class="detail-row">
                        <span>E-mail:</span>
                        <span>${agendamento.email}</span>
                    </div>
                    ${agendamento.observacoes ? `
                    <div class="detail-row">
                        <span>Observações:</span>
                        <span>${agendamento.observacoes}</span>
                    </div>` : ''}
                </div>
                <div class="agendamento-actions">
                    <button class="danger-button" data-id="${agendamento.id}">Cancelar</button>
                </div>
            `;

            card.querySelector('button').addEventListener('click', () => {
                cancelAgendamento(agendamento.id);
            });

            agendamentosList.appendChild(card);
        });
    }

    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch (e) {
            console.error("Data inválida:", dateString);
            return "Data inválida";
        }
    }

    async function cancelAgendamento(id) {
        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/agendamentos2/${id}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
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
