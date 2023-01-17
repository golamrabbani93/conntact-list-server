const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
require('dotenv').config();

app.get('/', (req, res) => {
	res.send('Contact-List server is runing');
});

app.listen(port, () => {
	console.log(`Contact-List server is running on ${port}`);
});
