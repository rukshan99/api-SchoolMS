const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

app.use((error, req, res, next) => {
	const errorMessage = error.message ? error.message : 'something went wrong';
	const errorStatusCode = error.statusCode;

	res.status(errorStatusCode).json({ error: errorMessage });
});

app.listen(port,() => {
    console.log(`server is listening on port ${port}`);
});