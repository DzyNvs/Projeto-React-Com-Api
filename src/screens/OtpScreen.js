import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert, // Usado para mostrar mensagens de erro
  ActivityIndicator, // Para o loading
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
// Importar o login final do Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase'; // Importar o auth (verifique seu caminho)

// Reutiliza o tema
const themeColors = {
  primary: '#0077B6', // Azul Oceano
  secondary: '#90E0EF', // Azul Céu
  text: '#0A2E36', // Texto (Azul Escuro)
  white: '#FFFFFF',
  error: '#B00020',
};

// Imagem de fundo (pode ser a mesma do login)
const otpBackground = { uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop' };


// O componente principal da tela
const OtpScreen = ({ route, navigation }) => {
  // 1. Receber os dados da tela de Login
  const { email, password, codigoGerado } = route.params;

  // Estados
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Para erros no "HTML"

  // --- Funções de Lógica ---
  const handleVerificarCodigo = async () => {
    if (otpCode.length !== 6) {
      setError('O código deve ter 6 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    // 2. Lógica principal: Comparar o que o usuário digitou com o código gerado
    if (otpCode === codigoGerado) {
      // 3. O CÓDIGO ESTÁ CORRETO!
      // Agora, fazemos o login DE VERDADE no Firebase com o e-mail e senha
      // que recebemos da tela anterior.
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // SUCESSO! O App.js (onAuthStateChanged) vai detectar
        // este login e navegar para a WelcomeScreen.
        // Não precisamos fazer mais nada aqui.
      } catch (e) {
        // Isso não deveria acontecer (pois já validamos as credenciais)
        // Mas é uma boa prática ter um fallback.
        setLoading(false);
        setError('Erro final ao logar. Tente novamente.');
        navigation.navigate('Login'); // Volta para o Login
      }
      
    } else {
      // 4. O CÓDIGO ESTÁ INCORRETO
      setLoading(false);
      setError('Código OTP inválido. Tente novamente.');
      setOtpCode(''); // Limpa o campo para nova tentativa
    }
    
    // setLoading(false) não é necessário aqui
    // ou o login é bem-sucedido (e a tela some)
    // ou dá erro (e já definimos acima)
  };

  // --- Renderização (JSX) ---
  return (
    <ImageBackground 
      source={otpBackground} 
      resizeMode="cover" 
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Verificação</Text>
          <Text style={styles.subtitle}>
            Digite o código de 6 dígitos enviado para: **{email}**
          </Text>

          {/* ÁREA DE ERRO NA TELA */}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TextInput
            style={styles.otpInput}
            placeholder="------"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            maxLength={6}
            value={otpCode}
            onChangeText={(text) => {
              setOtpCode(text);
              setError(''); // Limpa o erro ao digitar
            }}
            textAlign='center'
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerificarCodigo}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verificar e Entrar</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.registerLink}>Voltar para o Login</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

// --- Estilos (StyleSheet) ---
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // Escurece o fundo
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Efeito de "vidro"
    padding: 25,
    borderRadius: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: themeColors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInput: { // Estilo do professor (melhorado)
    width: '90%',
    alignSelf: 'center',
    height: 60,
    backgroundColor: themeColors.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: themeColors.primary,
    fontSize: 28,
    letterSpacing: 10, // Simula o espaçamento
    textAlign: 'center',
    marginBottom: 20,
    color: themeColors.text,
  },
  button: {
    height: 50,
    backgroundColor: themeColors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: themeColors.secondary,
  },
  buttonText: {
    color: themeColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: { // Usado para "Voltar"
    color: themeColors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  // O estilo de erro na tela
  errorText: {
    color: themeColors.error,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
});

export default OtpScreen;