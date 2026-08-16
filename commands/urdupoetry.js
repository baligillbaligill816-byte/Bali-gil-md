const poems = [
    {
        text: 'خاموش رات میں بھی تیری یاد بولتی ہے\nدل کی ہر ایک دھڑکن تیرا نام کھولتی ہے',
        mood: 'یاد'
    },
    {
        text: 'ہم نے چراغِ دل کو ہوا سے بچا لیا\nتنہائیوں میں خود کو خود ہی سے ملا لیا',
        mood: 'حوصلہ'
    },
    {
        text: 'جو لوگ سفر میں ساتھ نبھاتے ہیں\nوہ فاصلے میں بھی بہت یاد آتے ہیں',
        mood: 'دوستی'
    },
    {
        text: 'بارش کی بوند بوند میں اک راز سا رہا\nدل آج پھر کسی کے لیے بے قرار سا رہا',
        mood: 'محبت'
    },
    {
        text: 'وقت نے سکھا دیا مسکرانے کا ہنر\nورنہ غم تو آج بھی دل کے قریب ہے',
        mood: 'زندگی'
    },
    {
        text: 'اندھیری راہوں میں امید بن کے چلتے ہیں\nہم اپنے خواب کی تعبیر بن کے چلتے ہیں',
        mood: 'امید'
    },
    {
        text: 'تیرے بغیر بھی دنیا تو چل رہی ہے مگر\nدل کی گلی میں آج بھی ویرانی ہے',
        mood: 'جدائی'
    },
    {
        text: 'لفظ کم تھے مگر احساس بے حساب رہا\nوہ شخص دور ہو کر بھی دل کے پاس رہا',
        mood: 'احساس'
    },
    {
        text: 'کسی کے کام آ جائے تو زندگی ہے یہی\nوگرنہ سانس لینا بھی کوئی کمال نہیں',
        mood: 'انسانیت'
    },
    {
        text: 'پرندے لوٹ بھی آئیں تو موسم نہیں لوٹتے\nگزرے ہوئے لمحے کبھی واپس نہیں آتے',
        mood: 'وقت'
    }
];

module.exports = async function urduPoetryCommand(sock, chatId, msg, q = '') {
    const requestedMood = String(q || '').trim().toLowerCase();
    const matching = requestedMood
        ? poems.filter((poem) => poem.mood.toLowerCase().includes(requestedMood))
        : poems;
    const pool = matching.length ? matching : poems;
    const poem = pool[Math.floor(Math.random() * pool.length)];

    await sock.sendMessage(chatId, {
        text: `🌙 *اردو شاعری*\n\n${poem.text}\n\n_موضوع: ${poem.mood}_\n\nمزید شاعری کے لیے .urdupoetry لکھیں۔`
    }, { quoted: msg });
};

module.exports.urdupoetry = module.exports;
