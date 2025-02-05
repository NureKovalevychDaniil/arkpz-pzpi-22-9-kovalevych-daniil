const sqlite3 = require('sqlite3').verbose();

// 1. Підрахунок кількості транспортних засобів
const getVehicleCount = (req, res) => {
    const db = new sqlite3.Database('./db/vehicles.db');

    db.get(`SELECT COUNT(*) AS totalVehicles FROM vehicles`, (err, row) => {
        if (err) {
            console.error('Error fetching vehicle count:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ totalVehicles: row.totalVehicles }));
    });

    db.close();
};

// 2. Середні значення сенсорних показників (oil_level, engine_temp)
const getAverageSensorData = (req, res) => {
    const db = new sqlite3.Database('./db/vehicles.db');

    db.all(`
        SELECT sensor_type, AVG(value) AS average_value 
        FROM sensor_data
        WHERE sensor_type IN ('oil_level', 'engine_temp')
        GROUP BY sensor_type
    `, (err, rows) => {
        if (err) {
            console.error('Error fetching sensor data:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            return;
        }

        const sensorData = {};
        rows.forEach(row => {
            sensorData[row.sensor_type] = row.average_value.toFixed(2);  // Округлення до 2 знаків
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(sensorData));
    });

    db.close();
};

// 3. Статистика технічного обслуговування (pending/completed)
const getMaintenanceStats = (req, res) => {
    const db = new sqlite3.Database('./db/vehicles.db');

    db.get(`
        SELECT 
            COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_maintenance,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_maintenance
        FROM maintenance_schedules
    `, (err, row) => {
        if (err) {
            console.error('Error fetching maintenance stats:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            pendingMaintenance: row.pending_maintenance,
            completedMaintenance: row.completed_maintenance
        }));
    });

    db.close();
};

module.exports = { getVehicleCount, getAverageSensorData, getMaintenanceStats };
