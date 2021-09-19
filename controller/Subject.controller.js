const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');

const Subject = require('../schemas/Subject.schema');
const Teacher = require('../schemas/teacher.schema');

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

exports.patchEditSubject = async (req, res, next) => {
	const { subjectId, name, description, code } = req.body;

	const updatedSubject = { name: name, code: code, description: description};

	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const errorMessage = errors.array()[0].msg;
			const error = new Error(errorMessage);
			error.statusCode = 403;
			throw error;
		}
		const foundSubject = await Subject.getSubject(subjectId);

		if (!foundSubject) {
			const error = new Error('Subject with given id not found');
			error.statusCode = 404;
			throw error;
		}

		const editResult = await Subject.editSubject(subjectId, updatedSubject);

		res.status(200).json({ message: 'Subject updated successfully', newName: name });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.deleteRemoveSubject = async (req, res, next) => {
	const { subjectId } = req.params;

	try {
		const foundSubject = await Subject.getSubject(subjectId);

		if (!foundSubject) {
			const error = new Error('Subject with given id is not found');
			error.statusCode = 404;
			throw error;
		}

		if (foundSubject.teachers.length > 0) {
			const teachersIds = foundSubject.teachers.map(teacherId => new ObjectId(teacherId));

			await Teacher.updateTeachersWithConfigs({ _id: { $in: teachersIds } }, { $set: { subjectId: null } });
		}
		await Subject.removeSubject(subjectId);

		res.status(200).json({ message: 'subject removed successfully', subjectId: subjectId });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getTeachersBySubject = async (req, res, next) => {
	try {
		const teachersBySubject = await Subject.getTeachersBySubject();
		res.status(200).json({ teachersBySubject });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};