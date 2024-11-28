const express = require('express');
const bodyParser = require('body-parser');
const betRoutes = require('./routes/betRoutes');
const loginRoutes = require('./routes/loginRoutes');

const app = express();
app.use(bodyParser.json());

app.use('/api/bets', betRoutes);
app.use('/', loginRoutes);

app.listen(3001, () => {
    console.log('Server running on port 3001');
});
