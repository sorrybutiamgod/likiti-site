// api/send-message.js
const fetch = require('node-fetch');  // Подключаем node-fetch

exports.handler = async function(event, context) {
  const body = JSON.parse(event.body);  // Получаем данные из тела запроса
  const { name, phone, email, message } = body;

  const telegramText = `Новая заявка:\n\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nСообщение: ${message}`;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;  // Получаем токен из переменной окружения
  const chatId = process.env.TELEGRAM_CHAT_ID;  // Получаем chat_id из переменной окружения

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText
      })
    });

    const data = await response.json();

    if (data.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Заявка отправлена!' })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Ошибка отправки заявки.' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Ошибка при обработке заявки.' })
    };
  }
};
