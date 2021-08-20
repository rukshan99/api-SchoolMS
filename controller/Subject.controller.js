const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');

const Subject = require('../schemas/Subject.schema');

exports.postAddSubject = async (req, res, next) => {
	const { name, code, description } = req.body;

	const subject = new Subject(name.toLowerCase(),code.toLowerCase(),description.toLowerCase(), []);
   

	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const errorMessage = errors.array()[0].msg;
			const error = new Error(errorMessage);
			error.statusCode = 422;
			throw error;
		}

		// check if a subject with the same name exist
		const foundSubject = await Subject.getSubjectWithCondition({ name: name });

		if (foundSubject) {
			const error = new Error('This subject already exists, choose a differet subject name');
			error.statusCode = 403; // forbidden
			throw error;
		}
		const { insertedId } = await subject.addSubject(subject);
		res.status(201).json({ message: 'Subject added successfully', subjectId: insertedId.toString() });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getGetSubjects = async (req, res, next) => {
	try {
		const subjects = await Subject.getSubjects();
		res.status(200).json({ subjects: subjects });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getSingleSubject = async (req, res, next) => {
	const { subjectId } = req.params;

	try {
		const subject = await Subject.getSingleSubjectAggregated(subjectId);

		if (!subject) {
			const error = new Error('Subject with given id does not exist');
			error.statusCode = 404;
			throw error;
		}

		res.status(200).json({ message: 'Subject found scuccessfully', subject: subject });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getSearchForSubjects = async (req, res, next) => {
	const searchText = req.params.text;
	try {
		const subjects = await Subject.GetSearchForSubjects(searchText);
		res.status(200).json({ subjects: subjects });
	} catch (error) {
		error.statusCode = 500;
		next(error);
	}
};