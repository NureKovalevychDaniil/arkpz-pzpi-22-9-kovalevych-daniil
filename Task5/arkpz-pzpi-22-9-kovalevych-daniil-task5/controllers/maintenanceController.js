const sqlite3 = require('sqlite3').verbose();

const thresholds = {
    oil_level: 20,
    engine_temp: 100
};

// Перевірка потреби в технічному обслуговуванні
const checkMaintenanceNeeds = (req, res, vehicleId) => {
    const db = new sqlite3.Database('./db/vehicles.db');

    db.all(`
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
    `, [vehicleId, vehicleId], async (err, sensors) => {
        if (err) {
            console.error('DB Error:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            db.close();
            return;
        }

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
                console.log(`Maintenance needed: ${description}`);
            } else if (sensor_type === 'engine_temp' && value > thresholds.engine_temp) {
                maintenanceNeeded = true;
                description = 'High engine temperature detected';
                console.log(`Maintenance needed: ${description}`);
            }

            if (maintenanceNeeded) {
                await new Promise((resolve, reject) => {
                    db.get(`
                        SELECT 1 FROM maintenance_schedules 
                        WHERE vehicle_id = ? 
                        AND TRIM(LOWER(description)) = TRIM(LOWER(?)) 
                        AND status = 'pending'
                    `, [vehicle_id, description], (err, existingMaintenance) => {
                        if (err) {
                            console.error('Error checking maintenance:', err.message);
                            reject(err);
                            return;
                        }

                        if (!existingMaintenance) {
                            db.run(`
                                INSERT INTO maintenance_schedules (vehicle_id, maintenance_date, description, status)
                                VALUES (?, DATE('now', 'localtime'), ?, 'pending')
                            `, [vehicle_id, description], (err) => {
                                if (err) {
                                    console.error('Error inserting maintenance:', err.message);
                                    reject(err);
                                    return;
                                }
                                console.log(`Maintenance task added: ${description}`);
                                maintenanceTasks.push({ vehicle_id, description });
                                resolve();
                            });
                        } else {
                            console.log(`Maintenance already scheduled for: ${description}`);
                            resolve();
                        }
                    });
                });
            }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (maintenanceTasks.length > 0) {
            res.end(JSON.stringify({ message: 'Maintenance scheduled', tasks: maintenanceTasks }));
        } else {
            res.end(JSON.stringify({ message: 'No maintenance needed' }));
        }

        db.close();
    });
};

// Завершення технічного обслуговування
const completeMaintenance = (req, res, maintenanceId) => {
    const db = new sqlite3.Database('./db/vehicles.db');

    db.run(`
        UPDATE maintenance_schedules
        SET status = 'completed'
        WHERE id = ?
    `, [maintenanceId], function (err) {
        if (err) {
            console.error('Error updating maintenance:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            return;
        }

        if (this.changes === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Maintenance task not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Maintenance completed successfully' }));
        }
    });

    db.close();
};

module.exports = { checkMaintenanceNeeds, completeMaintenance };
