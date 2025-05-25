// Importação das dependências necessárias
const express = require('express');      // Framework web para Node.js
const mysql = require('mysql2');         // Driver MySQL para Node.js
const bcrypt = require('bcrypt');        // Biblioteca para criptografia de senhas
const bodyParser = require('body-parser'); // Middleware para parsing do body das requisições
const cors = require('cors');            // Middleware para permitir requisições cross-origin
const path = require('path');            // Módulo para trabalhar com caminhos de arquivos

// Inicialização da aplicação Express
const app = express();
const PORT = 3000;

// Configuração dos middlewares
app.use(cors());                           // Permite requisições de diferentes origens
app.use(bodyParser.json());                // Parse de requisições JSON
app.use(bodyParser.urlencoded({ extended: true })); // Parse de formulários HTML
app.use(express.static('public'));         // Servir arquivos estáticos da pasta public

// Configuração da conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',        // Endereço do servidor MySQL (local)
    user: 'root',            // Usuário do MySQL
    password: 'Jb@46431194',            // Senha do MySQL (deixe vazio se não tiver senha)
    database: 'petshop_caopeao'  // Nome do banco de dados
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err);
        return;
    }
    console.log('✅ Conectado ao banco de dados MySQL');
});

// ROTA: Página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ROTA: Cadastro de usuário
app.post('/api/cadastro', async (req, res) => {
    try {
        // Extrair dados do corpo da requisição
        const { nome, email, senha, telefone } = req.body;
        
        // Validação básica dos dados
        if (!nome || !email || !senha) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nome, email e senha são obrigatórios' 
            });
        }
        
        // Verificar se o email já existe no banco
        const verificarEmail = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(verificarEmail, [email], async (err, results) => {
            if (err) {
                console.error('Erro na consulta:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro interno do servidor' 
                });
            }
            
            // Se o email já existe, retornar erro
            if (results.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email já cadastrado' 
                });
            }
            
            // Criptografar a senha usando bcrypt
            // O número 10 representa o "salt rounds" (nível de segurança)
            const senhaHash = await bcrypt.hash(senha, 10);
            
            // Inserir novo usuário no banco de dados
            const inserirUsuario = 'INSERT INTO usuarios (nome, email, senha, telefone) VALUES (?, ?, ?, ?)';
            db.query(inserirUsuario, [nome, email, senhaHash, telefone], (err, result) => {
                if (err) {
                    console.error('Erro ao inserir usuário:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erro ao cadastrar usuário' 
                    });
                }
                
                // Cadastro realizado com sucesso
                res.json({ 
                    success: true, 
                    message: 'Usuário cadastrado com sucesso!',
                    userId: result.insertId 
                });
            });
        });
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// ROTA: Login de usuário
app.post('/api/login', (req, res) => {
    try {
        // Extrair email e senha do corpo da requisição
        const { email, senha } = req.body;
        
        // Validação básica
        if (!email || !senha) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email e senha são obrigatórios' 
            });
        }
        
        // Buscar usuário no banco de dados pelo email
        const buscarUsuario = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(buscarUsuario, [email], async (err, results) => {
            if (err) {
                console.error('Erro na consulta:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro interno do servidor' 
                });
            }
            
            // Verificar se o usuário existe
            if (results.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Email ou senha incorretos' 
                });
            }
            
            const usuario = results[0];
            
            // Comparar a senha fornecida com a senha criptografada no banco
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            
            if (!senhaValida) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Email ou senha incorretos' 
                });
            }
            
            // Login realizado com sucesso
            // Não retornamos a senha na resposta por segurança
            res.json({ 
                success: true, 
                message: 'Login realizado com sucesso!',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    telefone: usuario.telefone
                }
            });
        });
        
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`🐕 Servidor do Cãopeão rodando em http://localhost:${PORT}`);
});