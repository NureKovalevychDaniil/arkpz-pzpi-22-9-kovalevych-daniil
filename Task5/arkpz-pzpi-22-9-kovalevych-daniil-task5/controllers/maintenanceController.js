const sqlite3 = require('sqlite3').verbose();

const DB_PATH = './db/vehicles.db';
const CONTENT_TYPE_JSON = { 'Content-Type': 'application/json' };

const thresholds = {
    oil_level: 20,
    engine_temp: 100
};

// Функція для виконання SQL-запитів (Promise-based)
const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
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

// Обробка помилок у відповіді
const handleError = (res, message, err) => {
    console.error(message, err.message);
    res.writeHead(500, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({ error: err.message }));
};

// Перевірка потреби в технічному обслуговуванні
const checkMaintenanceNeeds = async (req, res, vehicleId) => {
    try {
        const query = `
            SELECT sd.* 
            FROM sensor_data sd
            INNER JOIN (
                SELECT sensor_type, MAX(timestamp) AS max_timestamp
                FROM sensor_data
                WHERE vehicle_id = ?
                GROUP BY sensor_type
            ) latest 
            ON sd.sensor_type = latest.sensor_type AND sd.timestamp = latest.max_timestamp
            WHERE sd.vehicle_id = ?
        `;

        const sensors = await executeQuery(query, [vehicleId, vehicleId]);

        console.log('Fetched sensor data:', sensors);

        const maintenanceTasks = [];

        for (const sensor of sensors) {
            const { vehicle_id, sensor_type, value } = sensor;
            let maintenanceNeeded = false;
            let description = '';

            console.log(`Checking sensor: ${sensor_type}, Value: ${value}`);

            if (sensor_type === 'oil_level' && value < thresholds.oil_level) {
                maintenanceNeeded = true;
                description = 'Low oil level detected';
            } else if (sensor_type === 'engine_temp' && value > thresholds.engine_temp) {
                maintenanceNeeded = true;
                description = 'High engine temperature detected';
            }

            if (maintenanceNeeded) {
                const maintenanceCheckQuery = `
                    SELECT 1 FROM maintenance_schedules 
                    WHERE vehicle_id = ? 
                    AND TRIM(LOWER(description)) = TRIM(LOWER(?)) 
                    AND status = 'pending'
                `;
                const existingMaintenance = await executeQuery(maintenanceCheckQuery, [vehicle_id, description]);

                if (!existingMaintenance.length) {
                    const insertQuery = `
                        INSERT INTO maintenance_schedules (vehicle_id, maintenance_date, description, status)
                        VALUES (?, DATE('now', 'localtime'), ?, 'pending')
                    `;
                    await executeQuery(insertQuery, [vehicle_id, description]);
                    console.log(`Maintenance task added: ${description}`);
                    maintenanceTasks.push({ vehicle_id, description });
                } else {
                    console.log(`Maintenance already scheduled for: ${description}`);
                }
            }
        }

        res.writeHead(200, CONTENT_TYPE_JSON);
        res.end(JSON.stringify(maintenanceTasks.length > 0
            ? { message: 'Maintenance scheduled', tasks: maintenanceTasks }
            : { message: 'No maintenance needed' }
        ));
    } catch (err) {
        handleError(res, 'Error processing maintenance check:', err);
    }
};

// Завершення технічного обслуговування
const completeMaintenance = async (req, res, maintenanceId) => {
    try {
        const updateQuery = `
            UPDATE maintenance_schedules
            SET status = 'completed'
            WHERE id = ?
        `;
        const result = await executeQuery(updateQuery, [maintenanceId]);

        res.writeHead(result.changes === 0 ? 404 : 200, CONTENT_TYPE_JSON);
        res.end(JSON.stringify({
            message: result.changes === 0
                ? 'Maintenance task not found'
                : 'Maintenance completed successfully'
        }));
    } catch (err) {
        handleError(res, 'Error updating maintenance:', err);
    }
};

module.exports = { checkMaintenanceNeeds, completeMaintenance };
