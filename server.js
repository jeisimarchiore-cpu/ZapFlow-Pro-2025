/**
 * server.js - Versão V24.08 (Docker Ultra-Stability)
 * Motor ZapFlow Pro - API do WhatsApp, Campanhas e Insights de IA.
 * Correção Final: Execution context was destroyed & Port Alignment.
 */

const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js'); 
const qrcode = require('qrcode');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

// --- 1. CONFIGURAÇÕES ---
// Alinhado com o seu log que indica porta 8000
const PORT = process.env.PORT || 8000;
const SESSION_CLIENT_ID = "zapflow_session";

// Inicialização da IA (Gemini 3 Flash)
const apiKey = process.env.API_KEY || '';
const genAI = (apiKey && apiKey !== 'undefined') ? new GoogleGenAI({ apiKey: apiKey }) : null;

// --- 2. CONFIGURAÇÃO EXPRESS ---
const app = express(); 
app.use(express.json({ limit: '100mb' }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] })); 

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

// --- 3. MOTOR WHATSAPP ---
// Configuração validada para evitar crash de navegação em containers
const client = new Client({
    authStrategy: new LocalAuth({ 
        clientId: SESSION_CLIENT_ID,
        dataPath: './.wwebjs_auth' 
    }), 
    webVersionCache: {
        type: 'remote',
        // Versão específica que impede o loop de atualização do WhatsApp Web no Puppeteer
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1018.0.html',
    },
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // Evita o erro "Execution context was destroyed"
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Crucial para estabilidade em Docker
            '--disable-gpu',
            '--disable-extensions',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--disable-web-security'
        ]
    }
});

// --- 4. ROTAS ---

app.get('/api/health', (req, res) => res.json({ status: 'online', whatsapp: client.info ? 'connected' : 'disconnected' }));

app.post('/api/send-message', async (req, res) => {
    const { number, message } = req.body;
    try {
        const chatId = number.includes('@') ? number : `${number}@c.us`;
        await client.sendMessage(chatId, message);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/chats', async (req, res) => {
    if (!client.info) return res.status(400).json({ error: 'WhatsApp offline' });
    try {
        const chats = await client.getChats();
        res.json(chats.slice(0, 50).map(c => ({
            id: c.id._serialized,
            name: c.name || c.id.user,
            unread: c.unreadCount,
            lastMsg: c.lastMessage ? c.lastMessage.body : ''
        })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/session/clear', async (req, res) => {
    try {
        await client.logout();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- 5. IA INSIGHTS ---

app.post('/api/ai/insights', async (req, res) => {
    if (!genAI) return res.status(500).json({ error: "API_KEY não configurada." });
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: "Gere um resumo estratégico de BI para este CRM." }] }]
        });
        res.json({ success: true, insights: response.text });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- 6. EVENTOS ---

client.on('loading_screen', (percent, message) => {
    console.log(`🚀 [MOTOR] Aguarde: ${percent}% - ${message}`);
    io.emit('loading_status', { percent, message });
});

client.on('qr', (qr) => {
    console.log('✅ [MOTOR] QR Code pronto para scan');
    qrcode.toDataURL(qr, (err, url) => {
        if (!err) io.emit('qr_code', url);
        io.emit('status', 'QR_READY');
    });
});

client.on('ready', async () => {
    console.log('✅ [MOTOR] ZAPFLOW PRO CONECTADO COM SUCESSO');
    io.emit('status', 'CONNECTED');
    try {
        const profilePic = await client.getProfilePicUrl(client.info.wid._serialized);
        io.emit('connection_data', {
            name: client.info.pushname,
            number: client.info.wid.user,
            profilePicUrl: profilePic
        });
    } catch (e) {
        io.emit('connection_data', { name: client.info.pushname, number: client.info.wid.user });
    }
});

client.on('message', async (msg) => {
    if (msg.isStatus || msg.isGroup) return;
    io.emit('new_message', { chatId: msg.from, body: msg.body });
});

client.on('disconnected', () => {
    console.log('⚠️ [MOTOR] WhatsApp desconectado. Reiniciando...');
    io.emit('status', 'DISCONNECTED');
    setTimeout(() => client.initialize(), 5000);
});

// Inicialização segura
const startEngine = () => {
    console.log(`\n🚀 INICIANDO ZAPFLOW V24.08 NA PORTA ${PORT}`);
    client.initialize().catch(err => {
        console.error("❌ Erro ao iniciar Puppeteer:", err.message);
        if (err.message.includes('context was destroyed')) {
            console.log("Recuperando de erro de contexto... Reiniciando em 5s.");
            setTimeout(startEngine, 5000);
        }
    });
};

startEngine();

server.listen(PORT, '0.0.0.0', () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 SERVIDOR ZAPFLOW HÍBRIDO RODANDO NA PORTA ${PORT}`);
    console.log(`--------------------------------------------------\n`);
});
