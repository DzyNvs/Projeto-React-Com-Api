// Importa a biblioteca axios, que nos ajuda a fazer chamadas a APIs de forma simples.
import axios from 'axios';

// =====================================================================================
// Sua chave da WeatherAPI já foi inserida abaixo.
const WEATHER_API_KEY = '09c856e09f5c4258bec00458250710';
// =====================================================================================


// --- CONFIGURAÇÃO DAS INSTÂNCIAS DO AXIOS ---

// Criamos uma instância do axios específica para a API ViaCEP.
// A 'baseURL' define o início de todos os endereços que vamos chamar para esta API.
const viaCepApi = axios.create({
  baseURL: 'https://viacep.com.br/ws',
});

// Criamos outra instância do axios, desta vez para a API de Clima (WeatherAPI).
const weatherApi = axios.create({
  baseURL: 'https://api.weatherapi.com/v1',
});


// --- EXPORTAÇÃO DAS FUNÇÕES DE CHAMADA ---

/**
 * Função para buscar um endereço a partir de um CEP.
 * Ela é 'exportada' para que outros arquivos do nosso projeto possam usá-la.
 * @param {string} cep O CEP a ser consultado (deve conter apenas números).
 * @returns {Promise} Retorna a promessa da chamada da API.
 */
export const getAddressByCep = (cep) => {
  // Faz uma chamada GET para, por exemplo, 'https://viacep.com.br/ws/01001000/json/'
  return viaCepApi.get(`/${cep}/json/`);
};

/**
 * Função para buscar o clima atual para uma determinada cidade.
 * Também é 'exportada' para ser usada em outras partes do app.
 * @param {string} cityName O nome da cidade para a consulta do clima.
 * @returns {Promise} Retorna a promessa da chamada da API.
 */
export const getCurrentWeather = (cityName) => {
  // Monta a string de parâmetros que a WeatherAPI precisa:
  // key: nossa chave de acesso
  // q: a query, que no caso é o nome da cidade
  // aqi=no: para não incluir dados sobre qualidade do ar
  // lang=pt: para receber a resposta em português
  const params = `?key=${WEATHER_API_KEY}&q=${cityName}&aqi=no&lang=pt`;
  
  // Faz uma chamada GET para, por exemplo, 'https://api.weatherapi.com/v1/current.json?key=...&q=Sao Paulo...'
  return weatherApi.get(`/current.json${params}`);
};