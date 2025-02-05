const sqlite3 = require('sqlite3').verbose();
const DB_PATH = './db/vehicles.db';
const CONTENT_TYPE_JSON = { 'Content-Type': 'application/json' };

// Функція для виконання SQL-запитів (Promise-based)
const executeQuery = async (query, params = []) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        db.get(query, params, (err, row) => {
            db.close();
            err ? reject(err) : resolve(row);
        });
    });
};

// Middleware для перевірки ролі користувача
const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers['authorization'];

            if (!authHeader) {
                res.writeHead(401, CONTENT_TYPE_JSON);
                return res.end(JSON.stringify({ message: 'Authorization header missing' }));
            }

            const username = authHeader.trim();
            const user = await executeQuery(`SELECT role FROM users WHERE username = ?`, [username]);

            if (!user) {
                res.writeHead(403, CONTENT_TYPE_JSON);
                return res.end(JSON.stringify({ message: 'User not found' }));
            }

            if (!allowedRoles.includes(user.role)) {
                res.writeHead(403, CONTENT_TYPE_JSON);
                return res.end(JSON.stringify({ message: 'Access denied' }));
            }

            req.user = { username, role: user.role }; // Збереження інформації про користувача
            next();
        } catch (err) {
            console.error('Database error:', err.message);
            res.writeHead(500, CONTENT_TYPE_JSON);
            res.end(JSON.stringify({ error: err.message }));
        }
    };
};

module.exports = { checkRole };
