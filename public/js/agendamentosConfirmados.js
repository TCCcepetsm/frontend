// Simulação de dados vindos do banco de dados
document.addEventListener('DOMContentLoaded', function () {
    // Em uma aplicação real, você faria uma requisição AJAX para obter esses dados
    // Aqui estamos simulando os dados
    const agendamento = {
        nome: "João Silva",
        email: "joao.silva@exemplo.com",
        telefone: "(11) 98765-4321",
        plano: "Intermediário",
        data: "2023-12-15",
        horario: "14:30",
        endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
        status: "Confirmado"
    };

    // Preenchendo os dados na página
    document.getElementById('info-nome').textContent = agendamento.nome;
    document.getElementById('info-email').textContent = agendamento.email;
    document.getElementById('info-telefone').textContent = agendamento.telefone;
    document.getElementById('info-plano').textContent = agendamento.plano;
    document.getElementById('info-data').textContent = formatarData(agendamento.data);
    document.getElementById('info-horario').textContent = agendamento.horario;
    document.getElementById('info-endereco').textContent = agendamento.endereco;
    document.getElementById('info-status').textContent = agendamento.status;

    // Adiciona classe de acordo com o status
    document.getElementById('info-status').className = 'info-value status-' + agendamento.status.toLowerCase();
});

function formatarData(data) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(data).toLocaleDateString('pt-BR', options);
}   