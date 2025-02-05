const sqlite3 = require('sqlite3').verbose();

// Константи для конфігурації
const DB_PATH = './db/vehicles.db';
const CONTENT_TYPE_JSON = { 'Content-Type': 'application/json' };

// Універсальна функція для роботи з БД
const executeQuery = (query, params, res, processResult) => {
    const db = new sqlite3.Database(DB_PATH);
    
    db.all(query, params, (err, rows) => {
        if (err) {
            handleError(res, 'Error executing query:', err);
            return;
        }
        processResult(rows);
    });

    db.close();
};

// Обробка помилок
const handleError = (res, message, err) => {
    console.error(message, err.message);
    res.writeHead(500, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({ error: err.message }));
};

// 1. Підрахунок кількості транспортних засобів
const getVehicleCount = (req, res) => {
    const query = `SELECT COUNT(*) AS totalVehicles FROM vehicles`;
    executeQuery(query, [], res, (rows) => {
        res.writeHead(200, CONTENT_TYPE_JSON);
        res.end(JSON.stringify({ totalVehicles: rows[0].totalVehicles }));
    });
};

// 2. Середні значення сенсорних показників (oil_level, engine_temp)
const getAverageSensorData = (req, res) => {
    const query = `
        SELECT sensor_type, AVG(value) AS average_value 
        FROM sensor_data
        WHERE sensor_type IN ('oil_level', 'engine_temp')
        GROUP BY sensor_type
    `;
    executeQuery(query, [], res, (rows) => {
        const sensorData = {};
        rows.forEach(row => {
            sensorData[row.sensor_type] = parseFloat(row.average_value).toFixed(2);
        });

        res.writeHead(200, CONTENT_TYPE_JSON);
        res.end(JSON.stringify(sensorData));
    });
};

// 3. Статистика технічного обслуговування (pending/completed)
const getMaintenanceStats = (req, res) => {
    const query = `
        SELECT 
            COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_maintenance,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_maintenance
        FROM maintenance_schedules
    `;
    executeQuery(query, [], res, (rows) => {
        const result = rows[0];
        res.writeHead(200, CONTENT_TYPE_JSON);
        res.end(JSON.stringify({
            pendingMaintenance: result.pending_maintenance,
            completedMaintenance: result.completed_maintenance
        }));
    });
};

module.exports = { getVehicleCount, getAverageSensorData, getMaintenanceStats };
