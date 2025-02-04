const sqlite3 = require('sqlite3').verbose();

// Отримання всіх транспортних засобів
const getAllVehicles = (req, res) => {
    const db = new sqlite3.Database('./vehicles.db');
    
    db.all('SELECT * FROM vehicles', [], (err, rows) => {
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

// Додавання нового транспортного засобу
const addVehicle = (req, res) => {
    let body = '';
    const db = new sqlite3.Database('./vehicles.db');

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { license_plate, model, year } = JSON.parse(body);

        if (!license_plate || !model || !year) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'All fields are required' }));
            db.close();
            return;
        }

        db.run(
            'INSERT INTO vehicles (license_plate, model, year) VALUES (?, ?, ?)',
            [license_plate, model, year],
            function(err) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                    db.close();
                    return;
                }
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Vehicle added', id: this.lastID }));
                db.close();
            }
        );
    });
};

// Оновлення інформації про транспортний засіб
const updateVehicle = (req, res, vehicleId) => {
    let body = '';
    const db = new sqlite3.Database('./vehicles.db');

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { model, year } = JSON.parse(body);

        db.run(
            'UPDATE vehicles SET model = ?, year = ? WHERE id = ?',
            [model, year, vehicleId],
            function(err) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                    db.close();
                    return;
                }

                if (this.changes === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Vehicle not found' }));
                    db.close();
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Vehicle updated' }));
                db.close();
            }
        );
    });
};

// Видалення транспортного засобу
const deleteVehicle = (req, res, vehicleId) => {
    const db = new sqlite3.Database('./vehicles.db');

    db.run('DELETE FROM vehicles WHERE id = ?', [vehicleId], function(err) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            db.close();
            return;
        }

        if (this.changes === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Vehicle not found' }));
            db.close();
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Vehicle deleted' }));
        db.close();
    });

    
};

// Отримання транспортного засобу за ID
const getVehicleById = (req, res, vehicleId) => {
    const db = new sqlite3.Database('./vehicles.db');

    db.get('SELECT * FROM vehicles WHERE id = ?', [vehicleId], (err, row) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            db.close();
            return;
        }

        if (!row) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Vehicle not found' }));
            db.close();
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(row));
        db.close();
    });
};

module.exports = { getAllVehicles, getVehicleById, addVehicle, updateVehicle, deleteVehicle };
