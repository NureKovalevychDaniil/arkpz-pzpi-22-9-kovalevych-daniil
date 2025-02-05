const sqlite3 = require('sqlite3').verbose();

const connectDB = () => {
    return new sqlite3.Database('./db/vehicles.db', (err) => {
        if (err) {
            console.error('Database connection error:', err.message);
        } else {
            console.log('Connected to SQLite database.');
        }
    });
};

module.exports = connectDB;