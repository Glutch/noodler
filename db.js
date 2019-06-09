import Datastore from 'react-native-local-mongodb'
const db = new Datastore({ filename: 'Recipes', autoload: true })

// db.remove({}, { multi: true }) // remove all recipes on the device (for testing)

export default db