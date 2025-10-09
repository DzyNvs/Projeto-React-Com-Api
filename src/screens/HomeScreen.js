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
  ImageBackground, 
} from 'react-native';
import { getAddressByCep, getCurrentWeather } from '../services/api';


const backgroundImage = { uri: 'https://i.pinimg.com/736x/11/a3/08/11a3081122e44027ec0730a68f4c163f.jpg' };

export default function HomeScreen() {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (cep.length !== 8) {
      setError('Por favor, digite um CEP válido com 8 dígitos.');
      return;
    }
    setLoading(true);
    setError('');
    setAddress(null);
    setWeather(null);
    try {
      const addressResponse = await getAddressByCep(cep);
      if (addressResponse.data.erro) {
        throw new Error('CEP não encontrado. Verifique o número digitado.');
      }
      const foundAddress = addressResponse.data;
      setAddress(foundAddress);
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
      {/* 3. Use o ImageBackground para envolver todo o conteúdo */}
      <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.backgroundImage}>
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

          {loading && <ActivityIndicator size="large" color="#FFFFFF" style={styles.feedbackArea} />}
          
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
      </ImageBackground>
    </SafeAreaView>
  );
}

// 4. Estilos atualizados
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1, 
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'transparent', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)', 
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)', 
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '95%',
    maxWidth: 400,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
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
    color: '#FFF',
    backgroundColor: 'rgba(217, 83, 79, 0.7)',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
    width: '90%',
    maxWidth: 400,
    fontWeight: 'bold',
  },
  card: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    borderRadius: 8,
    padding: 20,
    width: '95%',
    maxWidth: 400,
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