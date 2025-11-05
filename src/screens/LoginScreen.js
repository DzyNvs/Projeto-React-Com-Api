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
import emailjs from '@emailjs/browser'; // 1. Importar o EmailJS
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importar o login do Firebase
import { auth } from '../config/firebase'; // Importar o auth (verifique seu caminho)

// 2. ⬇️⬇️ COLOQUE SUAS CHAVES DO EMAILJS AQUI ⬇️⬇️
// (Obtidas no painel do EmailJS)
const EMAILJS_PUBLIC_KEY = '_4GugrccKCI1bIh5S';
const EMAILJS_SERVICE_ID = 'service_d5fzrq4';
const EMAILJS_TEMPLATE_ID = 'template_rcdy4on';
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
  const [password, setPassword] = useState(''); // Precisamos da senha real
  const [otpCode, setOtpCode] = useState('');
  const [telaAtiva, setTelaAtiva] = useState('login'); // 'login' ou 'otp'
  const [codigoGerado, setCodigoGerado] = useState(''); // Onde guardamos o OTP
  const [loading, setLoading] = useState(false);

  // Inicializa o EmailJS (só precisa rodar uma vez)
  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  // --- Funções de Lógica ---

  const gerarOTP = () => {
    // Gera um número aleatório de 6 dígitos
    const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGerado(novoCodigo); // Salva no estado para verificação posterior
    console.log("CÓDIGO OTP GERADO (para testes): " + novoCodigo);
    return novoCodigo;
  };

  const handleEnviarCodigo = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha seu e-mail e senha.');
      return;
    }
    setLoading(true);

    // 1. Gerar o código
    const codigo = gerarOTP();

    // 2. Preparar os parâmetros para o template do EmailJS
    // A 'key' (ex: 'codigo_otp') TEM QUE SER a mesma que você
    // definiu no seu template no site do EmailJS (ex: {{codigo_otp}})
    const templateParams = {
      email_para: email, // Um parâmetro para o e-mail do usuário
      codigo_otp: codigo,  // A variável do código
    };

    try {
      // 3. Enviar o e-mail DE VERDADE
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      
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

    // 1. Lógica principal: Comparar o que o usuário digitou com o código gerado
    if (otpCode === codigoGerado) {
      // 2. O CÓDIGO ESTÁ CORRETO!
      // Agora, fazemos o login DE VERDADE no Firebase com o e-mail e senha
      // que o usuário já digitou na primeira tela.
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // SUCESSO! O App.js (onAuthStateChanged) vai detectar
        // este login e navegar para a WelcomeScreen.
      } catch (e) {
        // O OTP estava certo, mas a senha do Firebase estava errada
        Alert.alert('Erro de Login', 'E-mail ou senha incorretos. Por favor, tente novamente.');
        setTelaAtiva('login'); // Volta para a tela de login
      }
      
    } else {
      // 3. O CÓDIGO ESTÁ INCORRETO
      Alert.alert('Erro', 'Código OTP inválido. Tente novamente.');
      setOtpCode(''); // Limpa o campo para nova tentativa
    }
    
    setLoading(false);
  };

  // --- Renderização das Telas ---

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