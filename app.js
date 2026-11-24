const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const pool = require("./db");

// Middleware для парсинга JSON
app.use(express.json());

// ==========================================
// БАЗОВЫЕ МАРШРУТЫ
// ==========================================

app.get("/", (req, res) => {
    res.send("Express работает!");
});

app.get("/api/info", (req, res) => {
    res.json({
        application: "Web Technologies",
        technology: "Node.js + Express",
        database: "PostgreSQL"
    });
});

app.post("/api/test", (req, res) => {
    res.json({
        message: "Данные получены",
        data: req.body
    });
});

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS current_time");
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка подключения к базе данных" });
    }
});

// ==========================================
// CRUD ДЛЯ КНИГ (БЛОК 4, 5)
// ==========================================

// 1. Поиск книг (ДОЛЖЕН БЫТЬ ПЕРЕД :id!)
app.get("/api/books/search", async (req, res) => {
    try {
        const name = req.query.name || "";
        const result = await pool.query(
            `SELECT * FROM "Books" 
             WHERE "Title" ILIKE $1 
             ORDER BY "Id"`,
            [`%${name}%`]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка поиска" });
    }
});

// 2. Получить все книги
app.get("/api/books", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT "Id", "Title", "Author", "Year", "IsAvailable" 
             FROM "Books" 
             ORDER BY "Id"`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка получения книг" });
    }
});

// 3. Получить книгу по ID (ПОСЛЕ search)
app.get("/api/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const result = await pool.query(
            `SELECT * FROM "Books" WHERE "Id" = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Книга не найдена" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка получения книги" });
    }
});

// 4. Создать книгу (с валидацией)
app.post("/api/books", async (req, res) => {
    try {
        const { title, author, year, isAvailable } = req.body;

        if (!title || !author || year === undefined) {
            return res.status(400).json({ error: "Некорректные данные книги" });
        }

        const result = await pool.query(
            `INSERT INTO "Books" ("Title", "Author", "Year", "IsAvailable") 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [title, author, year, isAvailable]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка создания книги" });
    }
});

// 5. Изменить книгу
app.put("/api/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, author, year, isAvailable } = req.body;

        const result = await pool.query(
            `UPDATE "Books" 
             SET "Title" = $1, "Author" = $2, "Year" = $3, "IsAvailable" = $4 
             WHERE "Id" = $5 
             RETURNING *`,
            [title, author, year, isAvailable, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Книга не найдена" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка изменения книги" });
    }
});

// 6. Удалить книгу
app.delete("/api/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const result = await pool.query(
            `DELETE FROM "Books" WHERE "Id" = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Книга не найдена" });
        }
        res.json({ message: "Книга удалена", book: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка удаления книги" });
    }
});

// ==========================================
// ОБРАБОТЧИК 404 (ДОЛЖЕН БЫТЬ В КОНЦЕ)
// ==========================================
app.use((req, res) => {
    res.status(404).json({ error: "Маршрут не найден" });
});

// Запуск сервера
app.listen(port, "0.0.0.0", () => {
    console.log(`Server started on port ${port}`);
});