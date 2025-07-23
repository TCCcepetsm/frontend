// public/js/agendamentoDetalhes.js
document.addEventListener("DOMContentLoaded", async () => {
    // Check authentication and get token
    // Assumes window.checkAuthentication() and window.getAuthToken() are available from auth.js
    if (typeof window.checkAuthentication === 'function' && !window.checkAuthentication()) {
        return; // checkAuthentication will handle redirection if not authenticated
    }
    const token = (typeof window.getAuthToken === 'function') ? window.getAuthToken() : null;

    if (!token) {
        alert("Erro de autenticação. Por favor, faça login novamente.");
        // Optional: Redirect to login if token is missing
        // window.location.href = 'login.html';
        return;
    }

    // Get booking ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const agendamentoId = urlParams.get('id');

    const infoNome = document.getElementById('info-nome');
    const infoEmail = document.getElementById('info-email');
    const infoTelefone = document.getElementById('info-telefone');
    const infoPlano = document.getElementById('info-plano');
    const infoEndereco = document.getElementById('info-endereco');
    const infoData = document.getElementById('info-data');
    const infoHorario = document.getElementById('info-horario');
    const infoStatus = document.getElementById('info-status');
    const btnConfirmar = document.getElementById('btn-confirmar');
    const btnRecusar = document.getElementById('btn-recusar');

    if (!agendamentoId) {
        alert("ID do agendamento não informado.");
        // Redirect back to the list if no ID is provided
        window.location.href = 'agendamentoAdmin.html';
        return;
    }

    // Function to load booking details
    async function loadAgendamentoDetails() {
        // Clear previous content and show loading
        infoNome.textContent = 'Carregando...';
        infoEmail.textContent = 'Carregando...';
        infoTelefone.textContent = 'Carregando...';
        infoPlano.textContent = 'Carregando...';
        infoEndereco.textContent = 'Carregando...';
        infoData.textContent = 'Carregando...';
        infoHorario.textContent = 'Carregando...';
        infoStatus.textContent = 'Carregando...';

        // Disable buttons during loading
        btnConfirmar.disabled = true;
        btnRecusar.disabled = true;

        try {
            const response = await fetch(`https://psychological-cecilla-peres-7395ec38.koyeb.app/api/agendamentos2/$%7BagendamentoId%7D%5C%60%60`, { // Adjusted endpoint as per previous discussions
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Include JWT token
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    alert("Sessão expirada ou não autorizado. Por favor, faça login novamente.");
                    if (typeof window.logout === 'function') window.logout(); // Use your logout function
                    else window.location.href = 'login.html'; // Fallback
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ao buscar agendamento: ${response.statusText}`);
            }

            const data = await response.json();

            infoNome.textContent = data.nome || 'N/A'; // Assuming 'nome' field, adjust if it's 'nomeCliente'
            infoEmail.textContent = data.email || 'N/A';
            infoTelefone.textContent = data.telefone || 'N/A';
            infoPlano.textContent = data.plano || 'N/A';
            infoEndereco.textContent = data.local || 'N/A'; // Assuming 'local' for address, adjust if it's 'endereco'
            infoData.textContent = data.data || 'N/A';
            infoHorario.textContent = data.horario || 'N/A';
            infoStatus.textContent = data.status || 'N/A';

            // Add status class for styling
            infoStatus.className = 'info-value status-' + (data.status ? data.status.toLowerCase() : 'pendente');

            // Enable/disable buttons based on status
            if (data.status === 'PENDENTE') {
                btnConfirmar.disabled = false;
                btnRecusar.disabled = false;
                btnConfirmar.style.display = 'block'; // Show if pending
                btnRecusar.style.display = 'block';   // Show if pending
            } else {
                btnConfirmar.disabled = true;
                btnRecusar.disabled = true;
                btnConfirmar.style.display = 'none'; // Hide if not pending
                btnRecusar.style.display = 'none';   // Hide if not pending
            }

        } catch (error) {
            console.error("Erro ao carregar os dados do agendamento:", error);
            alert(`Erro ao carregar os dados do agendamento: ${error.message}`);
            // Fallback to display N/A and disable buttons on error
            infoNome.textContent = 'N/A';
            infoEmail.textContent = 'N/A';
            infoTelefone.textContent = 'N/A';
            infoPlano.textContent = 'N/A';
            infoEndereco.textContent = 'N/A';
            infoData.textContent = 'N/A';
            infoHorario.textContent = 'N/A';
            infoStatus.textContent = 'Erro ao carregar';
            btnConfirmar.disabled = true;
            btnRecusar.disabled = true;
            btnConfirmar.style.display = 'none'; // Hide if error
            btnRecusar.style.display = 'none';   // Hide if error
        }
    }

    // Call the function to load details on page load
    loadAgendamentoDetails();

    // Function to update status
    async function updateStatus(status) {
        // Disable buttons to prevent double clicks
        btnConfirmar.disabled = true;
        btnRecusar.disabled = true;

        try {
            // ⭐ CORREÇÃO AQUI: Use as strings literais 'confirmar' ou 'recusar' na URL. ⭐
            // O valor 'status' passado para esta função (CONFIRMADO ou RECUSADO) ainda é útil
            // para a lógica interna e para a mensagem de alerta, mas a URL deve ser exata.
            let apiUrlSegment;
            if (status === 'CONFIRMADO') {
                apiUrlSegment = 'confirmar'; // Corresponde a @PutMapping("/confirmar/{id}")
            } else if (status === 'RECUSADO') {
                apiUrlSegment = 'recusar';   // Corresponde a @PutMapping("/recusar/{id}")
            } else {
                throw new Error('Status inválido para atualização.');
            }

            const response = await fetch(`https://psychological-cecilla-peres-7395ec38.koyeb.app/api/agendamentos2/$%7BapiUrlSegment%7D/$%7BagendamentoId%7D%5C%60%60`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erro na resposta da API para ${apiUrlSegment}: ${response.status} ${response.statusText}`, errorText);

                if (response.status === 401 || response.status === 403) {
                    alert("Sessão expirada ou não autorizado. Por favor, faça login novamente.");
                    if (typeof window.logout === 'function') window.logout();
                    else window.location.href = 'login.html';
                } else {
                    try {
                        const errorData = JSON.parse(errorText);
                        throw new Error(errorData.message || `Erro ao atualizar status: ${response.statusText}`);
                    } catch (e) {
                        throw new Error(`Erro inesperado ao atualizar status: ${errorText.substring(0, 100)}... (Verifique o console para mais detalhes)`);
                    }
                }
            }

            // Se a resposta for OK, então tentamos parsear o JSON
            const data = await response.json();
            alert(`Agendamento ${status.toLowerCase()} com sucesso!`);
            // Update the status displayed on the page
            infoStatus.textContent = status;
            infoStatus.className = 'info-value status-' + status.toLowerCase();

            // After successful update, ideally redirect back to the list
            window.location.href = 'agendamentoAdmin.html';

        } catch (error) {
            console.error("Erro ao atualizar o status:", error);
            alert(`Erro ao atualizar o status: ${error.message}`);
            loadAgendamentoDetails();
        }
    }

    // Button event listeners (estes já estão corretos, passando CONFIRMADO/RECUSADO para a função)
    btnConfirmar.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja CONFIRMAR este agendamento?')) {
            updateStatus('CONFIRMADO'); // Passa o ENUM string para a função updateStatus
        }
    });

    btnRecusar.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja RECUSAR este agendamento?')) {
            updateStatus('RECUSADO'); // Passa o ENUM string para a função updateStatus
        }
    });
});