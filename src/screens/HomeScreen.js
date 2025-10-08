// src/screens/HomeScreen.js

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
  Keyboard,
} from 'react-native';
import { getAddressByCep, getCurrentWeather } from '../services/api';

export default function HomeScreen() {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    // Esconde o teclado
    Keyboard.dismiss();

    // Validação simples do CEP
    if (cep.length !== 8) {
      setError('Por favor, digite um CEP válido com 8 dígitos.');
      return;
    }

    setLoading(true);
    setError('');
    setAddress(null);
    setWeather(null);

    try {
      // 1. Busca o endereço pelo CEP
      const addressResponse = await getAddressByCep(cep);

      if (addressResponse.data.erro) {
        throw new Error('CEP não encontrado. Verifique o número digitado.');
      }

      const foundAddress = addressResponse.data;
      setAddress(foundAddress);

      // 2. Busca o clima para a cidade encontrada
      const cityName = foundAddress.localidade;
      const weatherResponse = await getCurrentWeather(cityName);
      setWeather(weatherResponse.data);
    } catch (err) {
      setError(err.message || 'Não foi possível buscar os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Busca de Endereço e Clima</Text>
        <Text style={styles.subtitle}>Digite um CEP para começar</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite o CEP (só números)"
            value={cep}
            onChangeText={setCep}
            keyboardType="numeric"
            maxLength={8}
          />
          <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={loading}>
            <Text style={styles.buttonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#007BFF" style={styles.feedbackArea} />}
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        {address && (
          <View style={[styles.card, styles.addressCard]}>
            <Text style={styles.cardTitle}>Endereço Encontrado</Text>
            <Text style={styles.cardText}><Text style={styles.bold}>Logradouro:</Text> {address.logradouro || 'N/A'}</Text>
            <Text style={styles.cardText}><Text style={styles.bold}>Bairro:</Text> {address.bairro || 'N/A'}</Text>
            <Text style={styles.cardText}><Text style={styles.bold}>Cidade:</Text> {address.localidade}</Text>
            <Text style={styles.cardText}><Text style={styles.bold}>Estado:</Text> {address.uf}</Text>
            <Text style={styles.cardText}><Text style={styles.bold}>IBGE:</Text> {address.ibge}</Text>
          </View>
        )}

        {weather && (
          <View style={[styles.card, styles.weatherCard]}>
            <Text style={styles.cardTitle}>Clima em {weather.location.name}</Text>
            <View style={styles.weatherInfo}>
              <Image 
                source={{ uri: `https:${weather.current.condition.icon}` }} 
                style={styles.weatherIcon}
              />
              <View>
                <Text style={styles.weatherTemp}>{weather.current.temp_c}°C</Text>
                <Text style={styles.weatherCondition}>{weather.current.condition.text}</Text>
              </View>
            </View>
             <Text style={styles.cardText}><Text style={styles.bold}>Sensação Térmica:</Text> {weather.current.feelslike_c}°C</Text>
             <Text style={styles.cardText}><Text style={styles.bold}>Umidade:</Text> {weather.current.humidity}%</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#102A43',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#627D98',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D9E2EC',
  },
  button: {
    marginLeft: 10,
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackArea: {
    marginTop: 20,
  },
  errorText: {
    marginTop: 20,
    color: '#D9534F',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressCard: {
    borderColor: '#007BFF',
    borderLeftWidth: 5,
  },
  weatherCard: {
    borderColor: '#F0AD4E',
    borderLeftWidth: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#102A43',
  },
  cardText: {
    fontSize: 16,
    color: '#334E68',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weatherIcon: {
    width: 64,
    height: 64,
    marginRight: 15,
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#102A43',
  },
  weatherCondition: {
    fontSize: 16,
    color: '#627D98',
  },
});