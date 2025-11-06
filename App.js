import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase'; // Verifique se este caminho está correto

// Importe TODAS as suas telas
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
// 1. Importar a nova tela de OTP
import OtpScreen from './src/screens/OtpScreen';

const Stack = createNativeStackNavigator();

// Pilha de navegação para quando o usuário NÃO está logado
function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }} // Esconde o cabeçalho
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      {/* 2. Adicionar a tela de OTP à pilha de autenticação */}
      <Stack.Screen name="Otp" component={OtpScreen} />
    </Stack.Navigator>
  );
}

// Pilha de navegação para quando o usuário ESTÁ logado
function MainStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Busca por CEP' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null); // Estado para guardar o usuário
  const [initializing, setInitializing] = useState(true); // Estado de loading

  useEffect(() => {
    // onAuthStateChanged é um "ouvinte" que verifica
    // se o usuário logou, deslogou ou se a sessão foi restaurada
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Define o usuário (pode ser null se deslogado)
      if (initializing) {
        setInitializing(false); // Para de carregar
      }
    });

    // Limpa o ouvinte ao desmontar o componente
    return unsubscribe;
  }, []);

  // Mostra um loading enquanto o Firebase verifica a sessão
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077B6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {/* Renderiza a pilha de Autenticação (AuthStack) se o usuário for null
        Renderiza a pilha Principal (MainStack) se o usuário existir
      */}
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4E8D1', // Cor de areia
  },
});