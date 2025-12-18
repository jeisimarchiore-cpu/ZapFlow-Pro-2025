/**
 * server.js - Versão V24.02 HÍBRIDA
 * Lógica do Servidor Node.js para API do WhatsApp-Web.js, Campanhas e Chatbot Híbrido (Regras + IA).
 */

const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js'); 
const qrcode = require('qrcode');
const cors = require('cors');
const fs = require('fs/promises'); 
const path = require('path'); 
const multer = require('multer');

// --- 1. CONFIGURAÇÕES GLOBAIS E CHATBOT IN-MEMORY ---
const VERSION = "V24.02"; 
const PORT = process.env.PORT || 8080; // Alterado para 8080 para alinhar com Docker e Frontend
const SESSION_CLIENT_ID = "zapflow_session";
const PROJECT_ID = 'controle-de-igrejas'; 

// CHAVE DA API GEMINI
const GEMINI_API_KEY = process.env.API_KEY || "AIzaSyD-XTDN1yH5gAazsEEFCFUENwcfFZEVtT4"; 

// Armazenamento IN-MEMORY para o Chatbot Híbrido
let chatbotRules = []; // [{ trigger, response, active, exactMatch }]
let aiConfig = {
    isAiEnabled: true,
    systemPrompt: 'Você é um assistente de vendas e suporte ao cliente educado e profissional para a ZapFlow Pro. Sua tarefa é responder perguntas sobre o produto, preços e agendamento de demonstrações. Responda de forma clara, concisa e sempre em Português.',
};

// --- 2. FUNÇÃO AUXILIAR CRÍTICA: PADRONIZAÇÃO DE NÚMERO ---
const cleanPhoneNumber = (rawNumber) => {
    if (!rawNumber) return null;
    let clean = rawNumber.toString().replace(/\D/g, ''); 
    if (clean.startsWith('0')) clean = clean.substring(1);
    if (clean.length === 10 || clean.length === 11) clean = '55' + clean; 
    if (clean.length >= 12 && clean.length <= 13) return clean;
    return null; 
};

// --- 3. CONFIGURAÇÃO NODE/EXPRESS/SOCKET.IO ---
const app = express(); 
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(cors()); 

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

const campaignMessageMap = {};

// --- 4. CONFIGURAÇÃO WHATSAPP-WEB.JS ---
const client = new Client({
    authStrategy: new LocalAuth({ clientId: SESSION_CLIENT_ID }), 
    authTimeoutMs: 120000, 
    puppeteer: {
        headless: true, 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-web-security', 
            '--disable-dev-shm-usage', 
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote', 
            '--disable-gpu',
            '--disable-site-isolation-trials',
            '--disable-extensions',
            '--disable-software-rasterizer'
        ]
    },
});

let lastQrCode = ''; 

// --- 5. FUNÇÕES AUXILIARES GERAIS ---
const getSessionInfo = async () => {
    if (!client.info) return null;
    try {
        const widSerialized = client.info.wid._serialized;
        const picUrl = await client.getProfilePicUrl(widSerialized).catch(() => null); 
        return {
            name: client.info.pushname || client.info.wid.user,
            number: client.info.wid.user,
            platform: client.info.platform,
            profilePicUrl: picUrl || 'https://placehold.co/150'
        };
    } catch (e) {
        console.error("Erro ao pegar perfil:", e);
        return null;
    }
};

const applyNameReplacement = (msgTemplate, contactName) => {
    return msgTemplate.replace(/{{nome}}/gi, contactName);
};

// FUNÇÃO PRINCIPAL DO CHATBOT HÍBRIDO
const handleIncomingMessage = async (msg) => {
    const userMessage = msg.body.toLowerCase().trim();
    let responseText = null;

    // 1. TENTAR REGRA FIXA
    const matchingRule = chatbotRules.find(rule => {
        if (!rule.active) return false;
        const trigger = rule.trigger.toLowerCase().trim();
        return rule.exactMatch ? userMessage === trigger : userMessage.includes(trigger);
    });

    if (matchingRule) {
        const contact = await msg.getContact();
        responseText = applyNameReplacement(matchingRule.response, contact.pushname || 'Cliente');
    } 
    // 2. TENTAR IA (FALLBACK)
    else if (aiConfig.isAiEnabled && GEMINI_API_KEY) {
        try {
            const { GoogleGenAI } = require("@google/genai"); 
            const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [{ role: "user", parts: [{ text: userMessage }] }],
                config: {
                    systemInstruction: aiConfig.systemPrompt,
                    maxOutputTokens: 500
                }
            });
            responseText = response.text.trim();
        } catch (e) {
            console.error("[CHATBOT AI] Erro:", e);
            responseText = "Desculpe, ocorreu um erro na IA.";
        }
    }
    
    if (responseText) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await client.sendMessage(msg.from, responseText);
    }
};

// --- 6. EVENTOS SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('Frontend conectado:', socket.id);
    socket.on('request_qr', () => {
        if (client.info) {
            socket.emit('status', 'CONNECTED');
            getSessionInfo().then(info => socket.emit('connection_data', info));
        } else if (lastQrCode) {
            socket.emit('qr_code', lastQrCode);
            socket.emit('status', 'QR_READY');
        } else {
            socket.emit('status', 'DISCONNECTED');
        }
    });
});

// --- 7. EVENTOS DO CLIENTE WHATSAPP ---
client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
        if (!err) {
            lastQrCode = url;
            io.emit('qr_code', url);
            io.emit('status', 'QR_READY');
        }
    });
});

client.on('ready', async () => {
    console.log('WhatsApp Autenticado e Pronto!');
    lastQrCode = '';
    const info = await getSessionInfo();
    io.emit('status', 'CONNECTED');
    io.emit('connection_data', info);
    io.emit('refetch_chats'); 
});

client.on('message', async (msg) => {
    if (msg.isStatus) return;
    if (!msg.fromMe && !msg.isGroup) await handleIncomingMessage(msg);
    io.emit('new_message', { chatId: msg.id.remote });
});

// --- 8. ROTAS DA API REST ---
app.post('/api/chatbot/rules', (req, res) => {
    const { rules } = req.body;
    chatbotRules = Array.isArray(rules) ? rules : [];
    res.json({ success: true });
});

app.post('/api/chatbot/config', (req, res) => {
    const { systemPrompt, isAiEnabled } = req.body;
    if (systemPrompt !== undefined) aiConfig.systemPrompt = systemPrompt;
    if (isAiEnabled !== undefined) aiConfig.isAiEnabled = !!isAiEnabled;
    res.json({ success: true });
});

app.get('/api/chats', async (req, res) => {
    if (!client.info) return res.status(400).json({ error: 'Offline' });
    try {
        const chats = await client.getChats();
        const results = chats.filter(c => !c.isGroup).slice(0, 50).map(chat => ({
            id: chat.id._serialized, 
            name: chat.name || chat.id.user, 
            number: chat.id.user,
            lastMsg: chat.lastMessage ? chat.lastMessage.body : '',
            unread: chat.unreadCount,
            timestamp: chat.timestamp || Math.floor(Date.now() / 1000) 
        }));
        res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/messages/:chatId', async (req, res) => {
    try {
        const chat = await client.getChatById(req.params.chatId);
        const messages = await chat.fetchMessages({ limit: 50 });
        res.json(messages.map(msg => ({
            id: msg.id._serialized,
            text: msg.body,
            fromMe: msg.fromMe,
            time: new Date(msg.timestamp * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
        })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/send-message', async (req, res) => {
    const { number, message } = req.body;
    try {
        const clean = cleanPhoneNumber(number);
        const chatId = clean ? (await client.getNumberId(clean))._serialized : number;
        const msg = await client.sendMessage(chatId, message);
        res.json({ success: true, messageId: msg.id._serialized });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/ai/insights', async (req, res) => {
    const { contactCount, activeContacts, riskContacts, campaignStats, filterPeriod } = req.body;
    try {
        const { GoogleGenAI } = require("@google/genai"); 
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const prompt = `Gere um relatório BI em Markdown para: Total ${contactCount}, Ativos ${activeContacts}, Risco ${riskContacts}. Período: ${filterPeriod}.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { systemInstruction: "Seja conciso e profissional em Português." }
        });
        res.json({ success: true, insights: response.text });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/session/clear', async (req, res) => {
    if (client.info) await client.logout();
    await client.destroy();
    res.json({ success: true });
});

client.initialize();
server.listen(PORT, () => console.log(`🚀 SERVIDOR RODANDO NA PORTA ${PORT}`));