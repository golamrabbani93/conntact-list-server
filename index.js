const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();
const bcrypt = require('bcryptjs');
app.use(cors());
app.use(express.json());
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qh4qhby.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

//*Make CRUD Function
async function run() {
	//*Total User Account List
	const userCollection = client.db('Contact-List').collection('User');
	//* Total Customer Account List
	const customerCollection = client.db('Contact-List').collection('Customer-List');

	// *Sign Up User And Save User To Database
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
	// *Sign In User From Database And generate JWT Token
	app.post('/signin', async (req, res) => {
		const {email, password} = req.body;

		const user = await userCollection.findOne({email});
		if (!user) {
			return res.json({error: 'User Not found'});
		}
		if (await bcrypt.compare(password, user.password)) {
			//* JWT Token For 1 Day
			const token = jwt.sign({email: user.email}, JWT_SECRET, {
				expiresIn: '1d',
			});
			//*Send Token For Sign User
			if (res.status(201)) {
				return res.json({status: 200, data: token});
			} else {
				return res.json({error: 'error'});
			}
		}
		res.json({status: 'error', error: 'InvAlid Password'});
	});
	//*verify JWT Token For sign in user
	app.post('/contactlist', async (req, res) => {
		const {token} = req.body;

		try {
			//*check JWT token
			const user = jwt.verify(token, JWT_SECRET, (err, res) => {
				if (err) {
					return 'forbidden access';
				}
				return res;
			});
			//* If Token Expired Send Forbidden Access
			if (user == 'forbidden access') {
				return res.send({status: 'error', data: 'forbidden access'});
			}
			//* If Token verified then send User Data
			const useremail = user.email;
			userCollection
				.findOne({email: useremail})
				.then((data) => {
					res.send({status: 200, data: data});
				})
				.catch((error) => {
					res.send({status: 'error', data: error});
				});
		} catch (error) {}
	});

	//*Get All Customer Contact list
	app.get('/customerlist', async (req, res) => {
		const userEmail = req.query.email;
		const query = {user_email: userEmail};
		const cursor = customerCollection.find(query);
		const result = await cursor.toArray();
		res.send(result);
	});
	//*Add new Customer Contact list
	app.post('/customerlist', async (req, res) => {
		const customerdata = req.body;
		const result = await customerCollection.insertOne(customerdata);
		res.send(result);
	});

	//*Update Customer contact list
	app.put('/customerlist/:id', async (req, res) => {
		const id = req.params.id;
		const data = req.body;
		const query = {_id: ObjectId(id)};
		const option = {upsert: true};
		const updateData = {
			$set: {
				name: data.name,
				Phone: data.Phone,
				email: data.email,
			},
		};
		const result = await customerCollection.updateOne(query, updateData, option);
		res.send(result);
	});

	//*delete customer data
	app.delete('/customerlist', async (req, res) => {
		const ids = req.body;
		const deleteItem = ids.map((id) => {
			const query = {_id: ObjectId(id)};
			const result = customerCollection.deleteOne(query);
			return result;
		});
		if (deleteItem.length === ids.length) {
			res.send({status: 200, message: 'Ok'});
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
