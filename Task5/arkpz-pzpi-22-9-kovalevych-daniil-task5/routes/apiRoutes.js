const {
    getAllVehicles, getVehicleById, addVehicle, updateVehicle, deleteVehicle
} = require('../controllers/vehicleController');
const { getSensorDataByVehicle } = require('../controllers/sensorController');
const { addUser, getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { checkMaintenanceNeeds, completeMaintenance } = require('../controllers/maintenanceController');
const { getVehicleCount, getAverageSensorData, getMaintenanceStats } = require('../controllers/analyticsController');
const { checkRole } = require('../middleware/authMiddleware'); // Імпорт перевірки ролей

const routes = {
    'GET': {
        '/vehicles': { handler: getAllVehicles, roles: ['admin', 'manager', 'user'] },
        '/vehicles/:id': { handler: getVehicleById, roles: ['admin', 'manager', 'user'] },
        '/sensors/:id': { handler: getSensorDataByVehicle, roles: ['admin', 'manager', 'user'] },
        '/admin/users': { handler: getAllUsers, roles: ['admin'] },
        '/admin/maintenance/check/:id': { handler: checkMaintenanceNeeds, roles: ['admin', 'manager'] },
        '/admin/analytics/vehicles': { handler: getVehicleCount, roles: ['admin', 'manager'] },
        '/admin/analytics/sensors': { handler: getAverageSensorData, roles: ['admin', 'manager'] },
        '/admin/analytics/maintenance': { handler: getMaintenanceStats, roles: ['admin', 'manager'] }
    },
    'POST': {
        '/vehicles': { handler: addVehicle, roles: ['admin', 'manager'] },
        '/admin/users': { handler: addUser, roles: ['admin'] }
    },
    'PUT': {
        '/vehicles/:id': { handler: updateVehicle, roles: ['admin', 'manager'] },
        '/admin/users/:id': { handler: updateUser, roles: ['admin'] },
        '/admin/maintenance/complete/:id': { handler: completeMaintenance, roles: ['admin', 'manager'] }
    },
    'DELETE': {
        '/vehicles/:id': { handler: deleteVehicle, roles: ['admin'] },
        '/admin/users/:id': { handler: deleteUser, roles: ['admin'] }
    }
};

// Функція для обробки маршруту та виклику відповідного контролера
const handleRequest = (req, res) => {
    const normalizedUrl = req.url.replace(/\/$/, ''); // Видаляємо кінцевий "/"
    const method = req.method;
    
    console.log(`Incoming request: ${method} ${normalizedUrl}`);

    const urlParts = normalizedUrl.split('/');
    const basePath = `/${urlParts.slice(1, -1).join('/')}`; // Формуємо базовий шлях без ID
    const entityId = urlParts[urlParts.length - 1]; // ID об'єкта, якщо є

    console.log(`Parsed Base Path: ${basePath}, Extracted ID: ${entityId}`);

    for (const [route, { handler, roles }] of Object.entries(routes[method] || {})) {
        const routeParts = route.split('/');
        const requestParts = normalizedUrl.split('/');

        if (routeParts.length === requestParts.length) {
            const isMatch = routeParts.every((part, i) => part === requestParts[i] || part.startsWith(':'));

            if (isMatch) {
                const finalEntityId = routeParts.includes(':id') ? entityId : undefined;
                console.log(`Matched Route: ${route}, Final Entity ID: ${finalEntityId}`);

                return checkRole(roles)(req, res, () => handler(req, res, finalEntityId));
            }
        }
    }

    console.log(`Route not found: ${method} ${normalizedUrl}`);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
};

module.exports = handleRequest;
