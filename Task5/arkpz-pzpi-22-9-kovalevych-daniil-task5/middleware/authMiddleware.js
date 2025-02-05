const sqlite3 = require('sqlite3').verbose();

// Перевірка ролі користувача
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Authorization header missing' }));
            return;
        }

        const username = authHeader;

        const db = new sqlite3.Database('./db/vehicles.db');

        db.get(`SELECT role FROM users WHERE username = ?`, [username], (err, user) => {
            if (err) {
                console.error('Database error:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                return;
            }

            if (!user) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User not found' }));
                return;
            }

            if (!allowedRoles.includes(user.role)) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Access denied' }));
                return;
            }
            next();
        });

        db.close();
    };
};

module.exports = { checkRole };
