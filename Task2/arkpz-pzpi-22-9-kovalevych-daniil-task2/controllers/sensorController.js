const connectDB = require('../db/database');

const getSensorDataByVehicle = (req, res, vehicleId) => {
    const db = connectDB();
    db.all('SELECT * FROM sensor_data WHERE vehicle_id = ?', [vehicleId], (err, rows) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        } else if (rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Sensor data not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rows));
        }
    });
    db.close();
};

module.exports = { getSensorDataByVehicle };