const app = require('./app')
const {PORT} = require('./config')

app.listen(PORT, () => {
    console.log('Server listenign on port', PORT)
})