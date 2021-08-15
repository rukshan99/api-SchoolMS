const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const { body } = require('express-validator');

const StudentControllers = require('../controller/student.controller');

const Student = require('../schemas/student.schema');

const router = express.Router();

router.post(
	'/students',
	[
		body('firstName', 'FirstName must contain chars only').trim().isString(),
		body('lastName', 'LastName must contain chars only').trim().isString(),
		body('gender', 'Gender must be contain chars only'),
		body('age', 'Insert age!').trim().notEmpty(),
		body('email', 'Email must be a valid email').trim().isEmail().custom(async (value, { req }) => {
		})
	],
	StudentControllers.addStudent
);

router.get('/students', StudentControllers.getAllStudents);

module.exports = router;