const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');

const Student = require('../schemas/student.schema');

exports.addStudent = async (req, res, next) => {
	const { firstName, lastName, age, gender, email } = req.body;

	const date = new Date();
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const errorMessage = errors.array()[0].msg;

			const error = new Error(errorMessage);
			error.statusCode = 422;
			throw error;
		}

		const student = new Student(firstName, lastName, +age, gender, email, null, date);

		const addingResult = await student.addStudent();
		const [ insertedStudent ] = addingResult.ops;

		res.status(201).json({ message: 'Student added successfully', studentId: insertedStudent._id.toString() });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};