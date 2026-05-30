const { Groq } = require('@groq/groq-sdk');
const axios = require('axios');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const OWNER_USERNAME = process.env.OWNER_USERNAME || '@Your_Telegram_Username'; 
const BKASH_NUMBER = process.env.BKASH_NUMBER || '01XXXXXXXXX';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(200).send('Method Not Allowed');
    }

    try {
        const { message } = req.body;
        if (!message || !message.text) {
            return res.status(200).send('OK');
        }

        const chatId = message.chat.id;
        const userText = message.text.trim();

        if (userText.startsWith('/start')) {
            const welcomeMsg = `👋 *Bangladesh Income Hub (BDIH)*-এ আপনাকে स्वागतম!\n\n` +
                               `আমি একটি AI অ্যাসিস্ট্যান্ট। আমাদের premium *BDIH Final Version Indicator* বা ট্রেডিং সংক্রান্ত যেকোনো প্রশ্ন আমাকে করতে পারেন। আমি উত্তর দিয়ে দেবো।\n\n` +
                               `🛒 ইন্ডিকেটরটি কিনতে চাইলে নিচে ক্লিক করুন বা টাইপ করুন:\n/buy`;
            await sendTelegramMessage(chatId, welcomeMsg);
            return res.status(200).send('OK');
        }

        if (userText.startsWith('/buy')) {
            const buyMsg = `💳 *পেমেন্ট এবং অর্ডার প্রসেস:*\n\n` +
                           `🔥 *BDIH Final Version Indicator*\n` +
                           `💰 *Special Offer Price: 5000 BDT* (Regular Price: ~~10000 BDT~~)\n\n` +
                           `আমাদের bKash (Personal) নম্বর: \`${BKASH_NUMBER}\`\n\n` +
                           `⚠️ *টাকা পাঠানোর পর করণীয়:*\n` +
                           `টাকা পাঠানো সম্পন্ন হলে, পেমেন্টের *Screenshot* এবং আপনার *TradingView Email ও Password* সরাসরি আমাদের ওনারকে মেসেজ করে পাঠিয়ে দিন।\n\n` +
                           `📢 *ওনারের টেলিগ্রাম আইডি:* ${OWNER_USERNAME}\n\n` +
                           `আপনি ওনারকে ডিটেইলস পাঠিয়ে দেওয়ার পর, আগামী *24 ঘণ্টার মধ্যে* আপনার জন্য ইন্ডিকেটরটি রেডি করে দেওয়া হবে। ধন্যবাদ! ✨`;
            await sendTelegramMessage(chatId, buyMsg);
            return res.status(200).send('OK');
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { 
                    role: 'system', 
                    content: 'You are an expert financial trading assistant for "Bangladesh Income Hub (BDIH)". Your primary product is the "BDIH Final Version Indicator" for TradingView. ' +
                             'Key features of this indicator: 1. Non-Repaint (signals never change once given), 2. Non-MTG (Highly accurate), 3. Gives 250+ signals daily, 4. Clearly shows Entry, Take Profit (TP), and Stop Loss (SL) for every signal, 5. Works on any timeframe, 6. Extremely easy to use on TradingView. ' +
                             'Pricing info: Special Offer Price is 5000 BDT, while the regular price is 10000 BDT. ' +
                             'Rules for interacting: Always reply politely, naturally, and exclusively in Bengali language. Keep answers concise and professional. If a user asks about buying or the price, explain the details and kindly tell them to use the /buy command for instructions.' 
                },
                { role: 'user', content: userText }
            ],
            model: 'llama3-8b-8192',
        });

        const aiResponse = chatCompletion.choices[0].message.content;
        await sendTelegramMessage(chatId, aiResponse);

    } catch (error) {
        console.error('Error handling request:', error);
    }

    return res.status(200).send('OK');
};

async function sendTelegramMessage(chatId, text) {
    await axios.post(`${BASE_URL}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
    });
}
