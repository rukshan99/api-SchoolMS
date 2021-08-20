const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');

const Teacher = require('../schemas/teacher.schema');
const Subject = require('../schemas/Subject.schema');

exports.postAddTeacher = async (req, res, next) => {
	const { firstName, lastName, age, email, salary, gender, subjectId } = req.body;

	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const errorMessage = errors.array()[0].msg;
			const error = new Error(errorMessage);
			error.statusCode = 422;
			throw error;
		}

		// check if the subject exists
		const foundSubject = await Subject.getSubject(subjectId);

		if (!foundSubject) {
			const error = new Error('no subject with that id exist');
			error.statusCode = 404;
			throw error;
		}

		const teacher = new Teacher(
			firstName,
			lastName,
			email,
			+age,
			gender,
			+salary,
			new ObjectId(subjectId),
			new Date()
		);

		const { insertedId } = await teacher.addTeacher();

		// add the teacher id to the teachers array in that subject
		await Subject.updateSubjectWithConfigs(
			{ _id: new ObjectId(subjectId) },
			{ $addToSet: { teachers: insertedId } }
		);

		res.status(201).json({ message: 'Teacher added successfully', teacherId: insertedId.toString() });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getGetTeachers = async (req, res, next) => {
	try {
		const teachers = await Teacher.getTeachers();
		res.status(200).json({ teachers: teachers });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getSearchForTeachers = async (req, res, next) => {
	const searchText = req.params.text;
	try {
		const teachers = await Teacher.searchForTeacher(searchText);
		res.status(200).json({ teachers: teachers });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};