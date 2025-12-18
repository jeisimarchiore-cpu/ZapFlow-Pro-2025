
/**
 * server.js - Versão V24.04 (Docker Optimized)
 * Motor ZapFlow Pro - API do WhatsApp, Campanhas e Insights de IA.
 */

const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js'); 
const qrcode = require('qrcode');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

// --- 1. CONFIGURAÇÕES ---
const PORT = process.env.PORT || 8080;
const SESSION_CLIENT_ID = "zapflow_session";

// Inicialização da IA (Gemini 3 Flash)
const apiKey = process.env.API_KEY || '';
const genAI = new GoogleGenAI({ apiKey: apiKey });

let chatbotRules = []; 
let aiConfig = {
    isAiEnabled: true,
    systemPrompt: 'Você é o consultor oficial da ZapFlow Pro. Responda de forma estratégica e concisa.',
};

// --- 2. CONFIGURAÇÃO EXPRESS ---
const app = express(); 
app.use(express.json({ limit: '100mb' }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] })); 

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

// --- 3. MOTOR WHATSAPP ---
// No Docker (Linux), o Chromium geralmente fica em /usr/bin/chromium
const client = new Client({
    authStrategy: new LocalAuth({ clientId: SESSION_CLIENT_ID }), 
    puppeteer: {
        headless: true,
        executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    },
});

// --- 4. ROTAS DE IA ---

app.post('/api/ai/insights', async (req, res) => {
    const { contactCount, activeContacts, riskContacts, campaignStats, filterPeriod } = req.body;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        return res.status(500).json({ success: false, error: "API_KEY não configurada no servidor (Variável de ambiente)." });
    }

    try {
        const prompt = `Analise os dados do CRM ZapFlow Pro:
        - Leads: ${contactCount} (${activeContacts} ativos, ${riskContacts} em risco).
        - Campanhas: ${campaignStats.totalSent} envios, ${campaignStats.viewedRate}% visualização.
        Período: ${filterPeriod}.
        Gere uma análise de saúde e 3 recomendações comerciais.`;

        const response = await genAI.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "Você é um analista sênior de BI focado em WhatsApp Marketing.",
                temperature: 0.7
            }
        });

        res.json({ success: true, insights: response.text });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- 5. ROTAS DE CONTROLE ---

app.get('/api/health', (req, res) => res.json({ status: 'online', whatsapp: client.info ? 'connected' : 'disconnected' }));

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

app.post('/api/send-message', async (req, res) => {
    const { number, message } = req.body;
    try {
        const chatId = number.includes('@') ? number : `${number}@c.us`;
        await client.sendMessage(chatId, message);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/session/clear', async (req, res) => {
    try {
        await client.logout();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- 6. EVENTOS ---

client.on('qr', (qr) => {
    console.log('✅ QR Code gerado');
    qrcode.toDataURL(qr, (err, url) => {
        if (!err) io.emit('qr_code', url);
        io.emit('status', 'QR_READY');
    });
});

client.on('ready', async () => {
    console.log('🚀 WhatsApp Conectado!');
    io.emit('status', 'CONNECTED');
    io.emit('connection_data', {
        name: client.info.pushname,
        number: client.info.wid.user,
        profilePicUrl: await client.getProfilePicUrl(client.info.wid._serialized).catch(() => null)
    });
});

client.on('message', async (msg) => {
    if (msg.isStatus || msg.isGroup) return;
    io.emit('new_message', { chatId: msg.from, body: msg.body });
});

client.initialize().catch(e => console.error("❌ Falha crítica no Puppeteer:", e.message));

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=========================================`);
    console.log(`🚀 ZAPFLOW PRO ENGINE ONLINE`);
    console.log(`📡 Porta: ${PORT}`);
    console.log(`🔑 Gemini API: ${apiKey ? 'CONFIGURADA' : 'AUSENTE'}`);
    console.log(`=========================================\n`);
});
