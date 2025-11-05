import React, { useState, useEffect }
from 'react';
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
// NÃO HÁ IMPORTAÇÃO do EmailJS (corrigido!)
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase'; // Importar o auth (verifique seu caminho)

// ⬇️⬇️ COLOQUE SUAS CHAVES DO EMAILJS AQUI ⬇️⬇️
const EMAILJS_PUBLIC_KEY = 'SUA_PUBLIC_KEY_AQUI';
const EMAILJS_SERVICE_ID = 'SEU_SERVICE_ID_AQUI';
const EMAILJS_TEMPLATE_ID = 'SEU_TEMPLATE_ID_AQUI';
// ⬆️⬆️ COLOQUE SUAS CHAVES DO EMAILJS AQUI ⬆️⬆️


// Reutiliza o tema
const themeColors = {
  primary: '#0077B6', // Azul Oceano
  secondary: '#90E0EF', // Azul Céu
  text: '#0A2E36', // Texto (Azul Escuro)
  white: '#FFFFFF',
  error: '#B00020',
};

// Imagem de fundo
const loginBackground = { uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop' };


// O componente principal da tela
const LoginScreen = ({ navigation }) => {
  // Estados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [telaAtiva, setTelaAtiva] = useState('login'); // 'login' ou 'otp'
  const [codigoGerado, setCodigoGerado] = useState('');
  const [loading, setLoading] = useState(false);

  // Não precisamos mais do useEffect do emailjs.init()

  // --- Funções de Lógica ---

  const gerarOTP = () => {
    const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGerado(novoCodigo);
    console.log("CÓDIGO OTP GERADO (para testes): " + novoCodigo);
    return novoCodigo;
  };

  const handleEnviarCodigo = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha seu e-mail e senha.');
      return;
    }
    setLoading(true);

    const codigo = gerarOTP();

    // 1. Preparar os dados para a API do EmailJS
    const data = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        email_para: email,
        codigo_otp: codigo,
      }
    };

    try {
      // 2. Enviar o e-mail DE VERDADE usando fetch
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // 3. Verificar se a chamada de API foi bem-sucedida
      if (!response.ok) {
        throw new Error('A resposta da API EmailJS não foi OK.');
      }
      
      // 4. Mudar para a tela de verificação
      setTelaAtiva('otp');
      Alert.alert('Código Enviado', `Enviamos um código de 6 dígitos para ${email}.`);

    } catch (e) {
      console.error(e);
      Alert.alert('Erro ao Enviar', 'Não foi possível enviar o código. Verifique suas chaves do EmailJS e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Erro', 'O código deve ter 6 dígitos.');
      return;
    }

    setLoading(true);

    if (otpCode === codigoGerado) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // SUCESSO! O App.js (onAuthStateChanged) vai detectar
      } catch (e) {
        Alert.alert('Erro de Login', 'E-mail ou senha incorretos. Por favor, tente novamente.');
        setTelaAtiva('login');
      }
    } else {
      Alert.alert('Erro', 'Código OTP inválido. Tente novamente.');
      setOtpCode(''); // Limpa o campo
    }
    
    setLoading(false);
  };

  // --- Renderização das Telas (JSX) ---
  // (O JSX e os Estilos abaixo são os mesmos de antes,
  // apenas copiados aqui para o arquivo ficar completo)

  // Tela 1: Solicitar E-mail, Senha e Enviar OTP
  const renderLoginTela = () => (
    <View style={styles.card}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Informe seus dados para receber o código de acesso.</Text>

      <TextInput
        style={styles.input}
        placeholder="Seu e-mail"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Sua senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleEnviarCodigo}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Receber Código OTP</Text>}
      </TouchableOpacity>
      
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Não tem uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Registre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Tela 2: Inserir o Código OTP
  const renderOTPTela = () => (
    <View style={styles.card}>
      <Text style={styles.title}>Verificação</Text>
      <Text style={styles.subtitle}>
        Digite o código de 6 dígitos enviado para: **{email}**
      </Text>

      <TextInput
        style={styles.otpInput}
        placeholder="------"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        maxLength={6}
        value={otpCode}
        onChangeText={setOtpCode}
        textAlign='center'
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerificarCodigo}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verificar e Entrar</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setTelaAtiva('login')}>
        <Text style={styles.registerLink}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );

  // O componente renderiza a tela que estiver ativa
  return (
    <ImageBackground 
      source={loginBackground} 
      resizeMode="cover" 
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {telaAtiva === 'login' ? renderLoginTela() : renderOTPTela()}
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
  input: {
    height: 50,
    backgroundColor: themeColors.white,
    borderWidth: 1,
    borderColor: themeColors.secondary,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    color: themeColors.text,
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: themeColors.text,
    fontSize: 14,
  },
  registerLink: { // Usado para "Registre-se" e "Voltar"
    color: themeColors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LoginScreen;