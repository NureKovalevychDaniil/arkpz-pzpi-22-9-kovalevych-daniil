const { getAllVehicles, getVehicleById, addVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { getSensorDataByVehicle } = require('../controllers/sensorController');

const routeHandler = (req, res) => {
    const normalizedUrl = req.url.replace(/\/$/, '');

    if (normalizedUrl === '/vehicles' && req.method === 'GET') {
        getAllVehicles(req, res);

    } else if (normalizedUrl.startsWith('/vehicles/') && req.method === 'GET') {
        const vehicleId = normalizedUrl.split('/')[2];
        getVehicleById(req, res, vehicleId);

    } else if (normalizedUrl === '/vehicles' && req.method === 'POST') {
        addVehicle(req, res);

    } else if (normalizedUrl.startsWith('/vehicles/') && req.method === 'PUT') {
        const vehicleId = normalizedUrl.split('/')[2];
        updateVehicle(req, res, vehicleId);

    } else if (normalizedUrl.startsWith('/vehicles/') && req.method === 'DELETE') {
        const vehicleId = normalizedUrl.split('/')[2];
        deleteVehicle(req, res, vehicleId);

    } else if (normalizedUrl.startsWith('/sensors/') && req.method === 'GET') {
        const vehicleId = normalizedUrl.split('/')[2];
        getSensorDataByVehicle(req, res, vehicleId);

    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
};

module.exports = routeHandler;
