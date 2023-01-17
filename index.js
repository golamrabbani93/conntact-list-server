const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();
const bcrypt = require('bcryptjs');
app.use(cors());
app.use(express.json());
require('dotenv').config();

const {MongoClient, ServerApiVersion} = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qh4qhby.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

async function run() {
	const userCollection = client.db('Contact-List').collection('User');

	app.post('/signup', async (req, res) => {
		const {name, email, password} = req.body;
		const encryptedPassword = await bcrypt.hash(password, 10);
		try {
			const oldUser = await userCollection.findOne({email});
			if (oldUser) {
				return res.send({error: 'User Already Exits'});
			}
			const userInfo = {
				name,
				email,
				password: encryptedPassword,
			};
			const result = await userCollection.insertOne(userInfo);
			res.send(result);
		} catch (error) {
			res.send({status: 'error'});
		}
	});
}
run().catch((err) => console.log(err));
app.get('/', (req, res) => {
	res.send('Contact-List server is runing');
});

app.listen(port, () => {
	console.log(`Contact-List server is running on ${port}`);
});
