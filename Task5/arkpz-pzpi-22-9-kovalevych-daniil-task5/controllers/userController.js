const sqlite3 = require('sqlite3').verbose();

// Додавання нового користувача
const addUser = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { username, password, role } = JSON.parse(body);
        if (!username || !password || !role) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'All fields are required' }));
            return;
        }

        const db = new sqlite3.Database('./db/vehicles.db');
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
            [username, password, role], 
            function(err) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                    db.close();
                    return;
                }
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User added', id: this.lastID }));
                db.close();
            }
        );
    });
};

// Отримання всіх користувачів
const getAllUsers = (req, res) => {
    const db = new sqlite3.Database('./db/vehicles.db');
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            db.close();
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rows));
        db.close();
    });
};

// Видалення користувача за ID
const deleteUser = (req, res, userId) => {
    const db = new sqlite3.Database('./db/vehicles.db');
    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            db.close();
            return;
        }
        if (this.changes === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User not found' }));
            db.close();
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User deleted' }));
        db.close();
    });
};

// Оновлення інформації про користувача
const updateUser = (req, res, userId) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { username, password, role } = JSON.parse(body);

        if (!username && !password && !role) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'At least one field is required to update' }));
            return;
        }

        const db = new sqlite3.Database('./db/vehicles.db');

        // Формуємо динамічний SQL-запит залежно від введених полів
        const updates = [];
        const values = [];

        if (username) {
            updates.push('username = ?');
            values.push(username);
        }
        if (password) {
            updates.push('password = ?');
            values.push(password);
        }
        if (role) {
            updates.push('role = ?');
            values.push(role);
        }

        values.push(userId); // додаємо userId для WHERE

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

        db.run(query, values, function(err) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                db.close();
                return;
            }

            if (this.changes === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User not found' }));
                db.close();
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User updated successfully' }));
            db.close();
        });
    });
};

module.exports = { addUser, getAllUsers, deleteUser, updateUser };
