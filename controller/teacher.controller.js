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

exports.getSingleTeacher = async (req, res, next) => {
	const { teacherId } = req.params;

	try {
		const foundTeacher = await Teacher.getTeacherAggregated(teacherId);

		if (!foundTeacher) {
			const error = new Error('Teacher with given id is not found');
			error.statusCode = 404;
			throw error;
		}

		res.status(200).json({ message: 'Teacher found successfully', teacher: foundTeacher });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
	
};


exports.patchEditTeacher = async (req, res, next) => {
	const { _id, firstName, lastName, email, age, gender, salary, subjectId  } = req.body;
	const teacherId = _id;

	const updatedTeacher = {
		firstName: firstName,
		lastName: lastName,
		email: email,
		age: +age,
		gender: gender,
		salary: +salary,
		subjectId: new ObjectId(subjectId)
	};

	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const errorMessage = errors.array()[0].msg;
			const error = new Error(errorMessage);
			error.statusCode = 422;
			throw error;
		}

		
		const foundTeacher = await Teacher.getTeacher(teacherId);
		if (!foundTeacher) {
			const error = new Error('No teacher with that id was found');
			error.statusCode = 500;
			throw error;
		}

		
		const foundTeacherForEmailChecking = await Teacher.getTeacherWithCondition({
			$and: [ { email: email }, { _id: { $not: { $eq: new ObjectId(teacherId) } } } ]
		});

		if (foundTeacherForEmailChecking) {
			const error = new Error('This email is taken by some teacher');
			error.statusCode = 403;
			throw error;
		}

		
		const oldSubjectId = foundTeacher.subjectId;
		if (oldSubjectId) {
			if (oldSubjectId.toString() !== subjectId.toString() && oldSubjectId !== null) {
				
				await Subject.updateSubjectWithConfigs(
					{ _id: new ObjectId(oldSubjectId) },
					{ $pull: { teachers: new ObjectId(teacherId) } }
				);
				await Subject.updateSubjectWithConfigs(
					{ _id: new ObjectId(subjectId) },
					{ $addToSet: { teachers: new ObjectId(teacherId) } }
				);
			}
		}
		

		if (foundTeacher.subjectId === null) {
			await Subject.updateSubjectWithConfigs(
				{ _id: new ObjectId(subjectId) },
				{ $addToSet: { teachers: new ObjectId(teacherId) } }
			);
		}
		await Teacher.updateTeacherWithConfigs({ _id: ObjectId(teacherId) }, { $set: updatedTeacher });

		res.status(200).json({ message: 'Teacher updated successfully' });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.deleteDeleteTeacher = async (req, res, next) => {
	const { teacherId } = req.params;

	try {
		const foundTeacher = await Teacher.getTeacher(teacherId);

		if (!foundTeacher) {
			const error = new Error('Teacher with given id is not found');
			error.statusCode = 404;
			throw error;
		}
		
		if (foundTeacher.subjectId !== null) {
			const subjectId = foundTeacher.subjectId;

			await Subject.updateSubjectWithConfigs(
				{ _id: new ObjectId(subjectId) },
				{ $pull: { teachers: new ObjectId(teacherId) } }
			);
		}

		await Teacher.deleteTeacher(teacherId);
		res.status(200).json({ message: 'Teacher deleted successfully', teacherId: teacherId });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getTeachersBySalary = async (req, res, next) => {
	try {
		const teachersBySalary = await Teacher.getTeachersBySalary();
		res.status(200).json({ teachersBySalary });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
}