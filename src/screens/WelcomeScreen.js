import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { signOut } from 'firebase/auth'; 
import { auth } from '../config/firebase'; // Verifique se este caminho está correto

export default function WelcomeScreen({ navigation }) {
  const goToHomeScreen = () => {
    navigation.navigate('Home');
  };

  // Esta é a função de logout simples e correta
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // O App.js (com onAuthStateChanged) vai detectar o signOut
      // e o LoginScreen.js (com useFocusEffect) vai limpar a tela.
    } catch (error) {
      console.error("Erro ao sair: ", error);
    }
  };

  const cloudsBackground = {
    uri: 'https://i.pinimg.com/736x/e2/29/94/e2299480579cedc702576002d063f029.jpg',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={cloudsBackground}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <Text style={styles.title}>WeatherPos</Text>
          <Text style={styles.subtitle}>
            Encontre informações de endereço e clima a partir de um CEP.
          </Text>
          <TouchableOpacity style={styles.button} onPress={goToHomeScreen}>
            <Text style={styles.buttonText}>Começar</Text>
          </TouchableOpacity>

          {/* Botão de Logout */}
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#276eb1ff',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: '#627D98',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilo para o botão de logout
  logoutButton: {
    marginTop: 15,
    backgroundColor: '#D9534F', // Um vermelho para "Sair"
  },
});