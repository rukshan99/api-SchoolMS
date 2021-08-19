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
		const insertedStudent = addingResult.insertedId;

		res.status(201).json({ message: 'Student added successfully', studentId: insertedStudent.toString() });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getAllStudents = async (req, res, next) => {
	try {
		const students = await Student.getStudentsAggregated();
		res.status(200).json({ students: students });
	} catch (error) {
		error.statusCode = 500;
		next(error);
	}
};

exports.getStudent = async (req, res, next) => {
	const studentId = req.params.id;
	try {
		const student = await Student.getStudentAggregated(studentId);
		if (!student) {
			const error = new Error('Student with that id does not exist..');
			error.statusCode = 404;
			throw error;
		}

		res.status(200).json({ student: student });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getSearchForStudents = async (req, res, next) => {
	const searchText = req.params.text;

	try {
		const foundStudents = await Student.searchForStudents(searchText);
		res.status(200).json({ students: foundStudents });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};
