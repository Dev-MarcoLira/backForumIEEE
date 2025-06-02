const { v4: uuidv4 } = require('uuid'); // Garanta que 'uuid' está instalado (npm install uuid)

module.exports = () => uuidv4(); // Exporta uma função que chama uuidv4
