const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');

const Class = require('../schemas/class.schema');
const Student = require('../schemas/student.schema');

exports.getGetClasses = async (req, res, next) => {
	try {
		const classes = await Class.getClasses();
		res.status(200).json({ classes: classes });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.postAddClass = async (req, res, next) => {
	const className = req.body.name;
    const code = req.body.code;
    const description = req.body.description;

	const newClass = new Class(className,code,description, []);

	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			errorMessage = errors.array()[0].msg;
			const error = new Error(errorMessage);
			error.statusCode = 422;
			throw error;
		}
		const addingResult = await newClass.addClass();

		res.status(201).json({ message: 'Class added successfully', classId: addingResult.insertedId });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

