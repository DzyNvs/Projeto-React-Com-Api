
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importe suas duas telas
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';

// Crie o navegador
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* O StatusBar pode ficar aqui dentro */}
      <StatusBar style="auto" /> 
      
      <Stack.Navigator initialRouteName="Welcome">
        {}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }} 
        />
        {}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Busca por CEP' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}