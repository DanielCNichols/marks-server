const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://dcnichols_2020:Psycho78@markit-mp99l.mongodb.net/test?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.connection.on('connected', () => {
  console.log('Database Connected');
});
