
/**
 * server.js - Versão V24.03
 * Motor ZapFlow Pro - API do WhatsApp, Campanhas e Insights de IA.
 */

const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js'); 
const qrcode = require('qrcode');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

// --- 1. CONFIGURAÇÕES ---
const PORT = process.env.PORT || 8080;
const SESSION_CLIENT_ID = "zapflow_session";

// Inicialização da IA (Gemini 3 Flash conforme diretrizes)
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatbotRules = []; 
let aiConfig = {
    isAiEnabled: true,
    systemPrompt: 'Você é o consultor oficial da ZapFlow Pro. Responda de forma estratégica e concisa.',
};

// --- 2. CONFIGURAÇÃO EXPRESS ---
const app = express(); 
app.use(express.json({ limit: '100mb' }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] })); 

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

// --- 3. MOTOR WHATSAPP ---
const client = new Client({
    authStrategy: new LocalAuth({ clientId: SESSION_CLIENT_ID }), 
    puppeteer: {
        headless: true,
        executablePath: process.env.CHROME_PATH || null,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    },
});

// --- 4. ROTAS DE IA ---

app.post('/api/ai/insights', async (req, res) => {
    const { contactCount, activeContacts, riskContacts, campaignStats, filterPeriod } = req.body;
    
    if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
        return res.status(500).json({ success: false, error: "API_KEY do Gemini não configurada no servidor." });
    }

    try {
        const prompt = `Gere um relatório executivo para o CRM ZapFlow:
        Contatos: ${contactCount} (${activeContacts} ativos, ${riskContacts} em risco).
        Campanhas: ${campaignStats.totalSent} envios, ${campaignStats.viewedRate}% visualização.
        Período: ${filterPeriod}.
        Forneça análise de saúde e 3 recomendações.`;

        const response = await genAI.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "Você é um analista de BI especializado em CRM e WhatsApp.",
                temperature: 0.7
            }
        });

        res.json({ success: true, insights: response.text });
    } catch (error) {
        console.error("Erro Insights Gemini:", error.message);
        res.status(500).json({ success: false, error: "Erro ao processar insights na IA: " + error.message });
    }
});

// --- 5. ROTAS DE WHATSAPP & CRM ---

app.get('/api/chats', async (req, res) => {
    if (!client.info) return res.status(400).json({ error: 'WhatsApp não conectado.' });
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

app.get('/api/messages/:chatId', async (req, res) => {
    try {
        const chat = await client.getChatById(req.params.chatId);
        const messages = await chat.fetchMessages({ limit: 50 });
        res.json(messages.map(m => ({
            id: m.id.id,
            text: m.body,
            fromMe: m.fromMe,
            time: new Date(m.timestamp * 1000).toLocaleTimeString()
        })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/send-message', async (req, res) => {
    const { number, message } = req.body;
    try {
        await client.sendMessage(number.includes('@') ? number : `${number}@c.us`, message);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/campaign/start', async (req, res) => {
    const { campaignId, audience, message, smartDelayMs } = req.body;
    res.json({ success: true, message: "Disparo iniciado em segundo plano." });
    
    // Lógica simplificada de disparo em background
    let sentCount = 0;
    for (const contact of audience) {
        try {
            await new Promise(r => setTimeout(r, smartDelayMs || 5000));
            await client.sendMessage(`${contact.number}@c.us`, message.replace('{{nome}}', contact.name));
            sentCount++;
            io.emit('campaign_update', { campaignId, sent: sentCount, total: audience.length, status: 'Running' });
        } catch (e) { console.error(`Falha ao enviar para ${contact.number}`); }
    }
    io.emit('campaign_update', { campaignId, sent: sentCount, total: audience.length, status: 'Concluído' });
});

// --- 6. CONFIGURAÇÕES DO CHATBOT ---

app.post('/api/chatbot/rules', (req, res) => {
    chatbotRules = req.body.rules || [];
    res.json({ success: true });
});

app.post('/api/chatbot/config', (req, res) => {
    if (req.body.systemPrompt) aiConfig.systemPrompt = req.body.systemPrompt;
    if (req.body.isAiEnabled !== undefined) aiConfig.isAiEnabled = req.body.isAiEnabled;
    res.json({ success: true });
});

app.post('/api/session/clear', async (req, res) => {
    try {
        await client.logout();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- 7. EVENTOS SOCKET.IO ---

client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
        if (!err) io.emit('qr_code', url);
        io.emit('status', 'QR_READY');
    });
});

client.on('ready', async () => {
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

client.initialize().catch(e => console.error("Falha ao iniciar WhatsApp:", e.message));

server.listen(PORT, () => {
    console.log(`🚀 Motor ZapFlow Pro rodando na porta ${PORT}`);
    console.log(`🔑 Chave Gemini: ${process.env.API_KEY ? 'Configurada' : 'NÃO CONFIGURADA'}`);
});
