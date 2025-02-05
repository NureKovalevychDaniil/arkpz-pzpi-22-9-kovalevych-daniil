const { getAllVehicles, getVehicleById, addVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { getSensorDataByVehicle } = require('../controllers/sensorController');
const { addUser, getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { checkMaintenanceNeeds, completeMaintenance } = require('../controllers/maintenanceController');
const { getVehicleCount, getAverageSensorData, getMaintenanceStats } = require('../controllers/analyticsController');
const { checkRole } = require('../middleware/authMiddleware'); // Імпорт перевірки ролей

const routeHandler = (req, res) => {
    const normalizedUrl = req.url.replace(/\/$/, '');

    // Обробка маршрутів для транспортних засобів
    if (normalizedUrl === '/vehicles' && req.method === 'GET') {
        checkRole(['admin', 'manager', 'user'])(req, res, () => getAllVehicles(req, res));
        return;

    } else if (normalizedUrl.startsWith('/vehicles/') && req.method === 'GET') {
        const vehicleId = normalizedUrl.split('/')[2];
        checkRole(['admin', 'manager', 'user'])(req, res, () => getVehicleById(req, res, vehicleId));
        return;

    } else if (normalizedUrl === '/vehicles' && req.method === 'POST') {
        checkRole(['admin', 'manager'])(req, res, () => addVehicle(req, res));
        return;

    } else if (normalizedUrl.startsWith('/vehicles/') && req.method === 'PUT') {
        const vehicleId = normalizedUrl.split('/')[2];
        checkRole(['admin', 'manager'])(req, res, () => updateVehicle(req, res, vehicleId));
        return;

    } else if (normalizedUrl.startsWith('/vehicles/') && req.method === 'DELETE') {
        const vehicleId = normalizedUrl.split('/')[2];
        checkRole(['admin'])(req, res, () => deleteVehicle(req, res, vehicleId));
        return;

    // Обробка даних сенсорів
    } else if (normalizedUrl.startsWith('/sensors/') && req.method === 'GET') {
        const vehicleId = normalizedUrl.split('/')[2];
        checkRole(['admin', 'manager', 'user'])(req, res, () => getSensorDataByVehicle(req, res, vehicleId));
        return;

    // Управління користувачами
    } else if (normalizedUrl === '/admin/users' && req.method === 'POST') {
        checkRole(['admin'])(req, res, () => addUser(req, res));
        return;

    } else if (normalizedUrl === '/admin/users' && req.method === 'GET') {
        checkRole(['admin'])(req, res, () => getAllUsers(req, res));
        return;

    } else if (normalizedUrl.startsWith('/admin/users/') && req.method === 'PUT') {
        const userId = normalizedUrl.split('/')[3];
        checkRole(['admin'])(req, res, () => updateUser(req, res, userId));
        return;

    } else if (normalizedUrl.startsWith('/admin/users/') && req.method === 'DELETE') {
        const userId = normalizedUrl.split('/')[3];
        checkRole(['admin'])(req, res, () => deleteUser(req, res, userId));
        return;

    // Перевірка технічного обслуговування
    } else if (normalizedUrl.startsWith('/admin/maintenance/check') && req.method === 'GET') {
        const vehicleId = normalizedUrl.split('/')[4];
        checkRole(['admin', 'manager'])(req, res, () => checkMaintenanceNeeds(req, res, vehicleId));
        return;
    }

    // Завершення технічного обслуговування
    else if (normalizedUrl.startsWith('/admin/maintenance/complete/') && req.method === 'PUT') {
        const maintenanceId = normalizedUrl.split('/')[4];
        checkRole(['admin', 'manager'])(req, res, () => completeMaintenance(req, res, maintenanceId));
        return;
    }

    // Аналітика
    else if (normalizedUrl.startsWith('/admin/analytics') && req.method === 'GET') {
        checkRole(['admin', 'manager'])(req, res, () => {
            if (normalizedUrl === '/admin/analytics/vehicles') {
                getVehicleCount(req, res);
            } else if (normalizedUrl === '/admin/analytics/sensors') {
                getAverageSensorData(req, res);
            } else if (normalizedUrl === '/admin/analytics/maintenance') {
                getMaintenanceStats(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Analytics route not found' }));
            }
        });
        return;
    }

    // Відповідь, якщо маршрут не знайдено
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
};

module.exports = routeHandler;
