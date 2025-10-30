const fetch = require('node-fetch');  // Подключаем node-fetch

// Экспортируем асинхронную функцию
module.exports = async (req, res) => {
  // Проверяем, что метод запроса - POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' }); // Ошибка 405 для некорректных методов
  }

  // Получаем данные из тела запроса
  const { name, phone, email, message } = req.body;

  // Проверяем, что все обязательные поля присутствуют
  if (!name || !phone || !email || !message) {
    return res.status(400).json({ message: 'Все поля должны быть заполнены' }); // Ошибка 400 для неполных данных
  }

  // Формируем текст для отправки в Telegram
  const telegramText = `Новая заявка:\n\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nСообщение: ${message}`;

  // Получаем токен бота и chat_id из переменных окружения
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Проверяем, что переменные окружения настроены
  if (!botToken || !chatId) {
    return res.status(500).json({ message: 'Не настроены переменные окружения' }); // Ошибка 500 для неправильных настроек
  }

  try {
    // Отправляем запрос в Telegram API
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText
      })
    });

    const data = await response.json();

    // Проверяем, успешно ли отправлено сообщение
    if (data.ok) {
      return res.status(200).json({ message: 'Заявка отправлена!' }); // Успешный ответ
    }

    return res.status(500).json({ message: 'Ошибка отправки заявки.' }); // Ошибка при отправке сообщения в Telegram

  } catch (error) {
    // Обработка ошибок, если что-то пошло не так
    console.error('Ошибка при отправке сообщения:', error);
    return res.status(500).json({ message: 'Ошибка при обработке заявки.' }); // Ошибка 500
  }
};
