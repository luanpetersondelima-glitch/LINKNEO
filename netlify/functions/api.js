// Netlify Function — proxy para API Paystore
// Evita bloqueio de CORS chamando a API do lado do servidor

const PAYSTORE_BASE = 'https://backendphoebus.paystore.com.br/ecommerce/v1';

// ⚠️ Cole seu Bearer Token aqui
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoxLCJhdWQiOiJFQ09NTUVSQ0UiLCJyb2xlIjoiUk9MRV9BUElfTUVSQ0hBTlQiLCJwbm0iOiJMUEwgU0VSVklDT1MiLCJzaWQiOiIwOTQwMjEiLCJzdWIiOiJkOWRkYjdlYS1kZTFiLTQ0MTMtYjA3MS04MjlkMmRiMjBiYTQiLCJwc3QiOnRydWUsImlhdCI6MTc4MjI0MTAyOSwibmJmIjoxNzgyMTgzNjAwLCJleHAiOjE4MTQyMzc5OTl9.tHuCkWsFSpsvUoqcMLRc85e4IFnb4LvmOFGBpZAc-XE';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Responde ao preflight do browser
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Monta o path da Paystore a partir do query string ?path=/payment-link
  const qs     = event.queryStringParameters || {};
  const path   = qs.path || '/payment-link';
  const url    = PAYSTORE_BASE + path;

  // Repassa query params extras (ex: link_id=xxx)
  const extraParams = Object.entries(qs)
    .filter(([k]) => k !== 'path')
    .map(([k,v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  const finalUrl = extraParams ? `${url}?${extraParams}` : url;

  try {
    const resp = await fetch(finalUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + BEARER_TOKEN,
      },
      body: ['POST','PUT'].includes(event.httpMethod) ? event.body : undefined,
    });

    const text = await resp.text();
    return {
      statusCode: resp.status,
      headers,
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
