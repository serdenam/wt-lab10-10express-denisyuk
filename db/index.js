const { Pool } = require("pg");

// Строка подключения (если есть переменная окружения DATABASE_URL, используется она)
// Если переменной нет, используется локальная база данных.
const connectionString = process.env.DATABASE_URL || 
    "postgresql://postgres:dashaden22@localhost:5432/wt_lab12"; 
// ВАЖНО: замени dashaden22 на свой пароль от PostgreSQL. 
// И проверь имя базы: wt_lab8 (для товаров) или wt_lab12 (для книг/пользователей).

const pool = new Pool({
    connectionString
});

module.exports = pool;