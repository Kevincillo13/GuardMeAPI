const { MongoClient, ObjectId } = require('mongodb');
const url = 'mongodb+srv://guardme:Guardme.123@guardme.xizczhv.mongodb.net/';
const client = new MongoClient(url);

const dbName = 'Guardme';

async function con() {
    try {
        console.log("Inicia la función");
        await client.connect();
        console.log("Conectado a la base de datos");
        const database = client.db(dbName);
        const users = database.collection('Users');
        const user = await users.findOne({});
        if (user) {
            console.log(user._id);
        } else {
            console.log("No se encontró ningún usuario");
        }
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

function objectID(id) {
    return new ObjectId(id);
}

async function query(type, collection, mainObject, secondObject, thirdObject) {
    let res;
    try {
        await client.connect();
        console.log("Conexión lograda");
        const database = client.db(dbName);
        switch (type) {
            case "insert":
                console.log("Insert:");
                res = await database.collection(collection).insertOne(mainObject);
                break;
            case "deleteOne":
                console.log("Delete One:");
                res = await database.collection(collection).deleteOne(mainObject);
                break;
            case "update":
                console.log("Update:");
                res = await database.collection(collection).updateOne(mainObject, secondObject, thirdObject);
                break;   
            case "find":
                console.log("Find:");
                res = await database.collection(collection).find(mainObject).project(secondObject).toArray();
                break;
            case "aggregation":
                console.log("Aggregate:");
                res = await database.collection(collection).aggregate(mainObject).toArray();
                break;
            default:
                throw new Error('Tipo de consulta no soportado');
        }
    } catch (error) {
        console.error('Error en la consulta:', error);
    } finally {
        await client.close();
    }
    console.log(res);  // Imprime el resultado de la consulta
    return res;
}


con().catch(console.error);

module.exports = { query, objectID };
