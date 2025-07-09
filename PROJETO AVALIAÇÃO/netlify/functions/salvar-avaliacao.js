const fetch = require('node-fetch');

exports.handler = async (event) => {
  // SUA URL DO GOOGLE APPS SCRIPT
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwZcijMiCy3628E5EvR2zQS1oS79jzLxg_atnRzwAGlO2zvCzmqxQJsYEc0fU011M0DzA/exec";
  
  try {
    const data = JSON.parse(event.body);
    
    // Validação dos dados
    if (!data.instrutorId || !data.didatica || !data.paciencia || !data.pontualidade) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Por favor, avalie todos os critérios" })
      };
    }

    // Envia para o Google Sheets
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar para o Google Sheets');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Erro interno no servidor",
        details: error.message 
      })
    };
  }
};