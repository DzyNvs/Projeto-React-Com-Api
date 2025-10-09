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

// Novos componentes de layout
import { CustomButton } from '../components/Button/CustomButton';
import { TextInputField } from '../components/Input/TextInputField';
import { InfoCard } from '../components/Card/InfoCard';
import { Title, NormalText, LightText } from '../components/Typography';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

export default function HomeScreen() {
  // ESTADOS ORIGINAIS (MANTIDOS)
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // FUNÇÃO ORIGINAL (MANTIDA)
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

  // LAYOUT 
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={globalStyles.container}>
        
        {/* Cabeçalho */}
        <View style={[globalStyles.center, globalStyles.mb20]}>
          <Title>🌤️ Buscar CEP e Clima</Title>
          <LightText style={globalStyles.mt10}>
            Digite um CEP para encontrar endereço e clima
          </LightText>
        </View>

        {/* Área de Busca */}
        <View style={globalStyles.mb20}>
          <TextInputField
            placeholder="Digite o CEP (8 números)"
            value={cep}
            onChangeText={setCep}
            error={error}
          />
          
          <CustomButton
            title={loading ? "Buscando..." : "Buscar"}
            onPress={handleSearch}
            loading={loading}
            disabled={loading}
          />
        </View>

        {/* Loading */}
        {loading && (
          <View style={[globalStyles.center, globalStyles.mt20]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <LightText style={globalStyles.mt10}>Buscando informações...</LightText>
          </View>
        )}

        {/* Card de Endereço */}
        {address && (
          <InfoCard style={globalStyles.mb20}>
            <Title style={[globalStyles.mb10, { fontSize: 20 }]}>
              📍 Endereço Encontrado
            </Title>
            
            <NormalText style={globalStyles.mb10}>
              <LightText>Logradouro: </LightText>
              {address.logradouro || 'N/A'}
            </NormalText>
            
            <NormalText style={globalStyles.mb10}>
              <LightText>Bairro: </LightText>
              {address.bairro || 'N/A'}
            </NormalText>
            
            <NormalText style={globalStyles.mb10}>
              <LightText>Cidade: </LightText>
              {address.localidade}
            </NormalText>
            
            <NormalText style={globalStyles.mb10}>
              <LightText>Estado: </LightText>
              {address.uf}
            </NormalText>
            
            <NormalText>
              <LightText>IBGE: </LightText>
              {address.ibge}
            </NormalText>
          </InfoCard>
        )}

        {/* Card de Clima */}
        {weather && (
          <InfoCard>
            <Title style={[globalStyles.mb10, { fontSize: 20 }]}>
              🌤️ Clima em {weather.location.name}
            </Title>
            
            <View style={[globalStyles.row, globalStyles.mb10]}>
              <Image 
                source={{ uri: `https:${weather.current.condition.icon}` }} 
                style={{ width: 50, height: 50, marginRight: 15 }}
              />
              <View>
                <NormalText style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {weather.current.temp_c}°C
                </NormalText>
                <LightText>{weather.current.condition.text}</LightText>
              </View>
            </View>
            
            <View style={[globalStyles.row, globalStyles.spaceBetween]}>
              <View>
                <LightText>Sensação Térmica</LightText>
                <NormalText>{weather.current.feelslike_c}°C</NormalText>
              </View>
              
              <View>
                <LightText>Umidade</LightText>
                <NormalText>{weather.current.humidity}%</NormalText>
              </View>
            </View>
          </InfoCard>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}