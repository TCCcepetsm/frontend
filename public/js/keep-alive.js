const fetch = require('node-fetch');
const cron = require('node-cron');

// Executa a cada 10 minutos
cron.schedule('*/10 * * * *', async () => {
    try {
        await fetch('https://psychological-cecilla-peres-7395ec38.koyeb.app//actuator/health');
        console.log('Keep-alive executado:', new Date().toISOString());
    } catch (error) {
        console.error('Erro no keep-alive:', error);
    }
});

console.log('Serviço keep-alive iniciado...');