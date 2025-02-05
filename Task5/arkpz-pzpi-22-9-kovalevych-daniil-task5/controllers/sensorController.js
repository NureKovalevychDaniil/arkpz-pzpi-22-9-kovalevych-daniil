const connectDB = require('../db/database');

const CONTENT_TYPE_JSON = { 'Content-Type': 'application/json' };

// Функція для виконання SQL-запитів
const executeQuery = async (query, params = []) => {
    return new Promise((resolve, reject) => {
        const db = connectDB();
        db.all(query, params, (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Обробка помилок
const handleError = (res, message, err) => {
    console.error(message, err.message);
    res.writeHead(500, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({ error: err.message }));
};

// Отримання даних сенсорів за ID автомобіля
const getSensorDataByVehicle = async (req, res, vehicleId) => {
    try {
        const query = 'SELECT * FROM sensor_data WHERE vehicle_id = ?';
        const rows = await executeQuery(query, [vehicleId]);

        if (rows.length === 0) {
            res.writeHead(404, CONTENT_TYPE_JSON);
            res.end(JSON.stringify({ message: 'Sensor data not found' }));
            return;
        }

        res.writeHead(200, CONTENT_TYPE_JSON);
        res.end(JSON.stringify(rows));
    } catch (err) {
        handleError(res, 'Error fetching sensor data:', err);
    }
};

module.exports = { getSensorDataByVehicle };
