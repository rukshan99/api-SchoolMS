const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');

const Student = require('../schemas/student.schema');
const Class = require('../schemas/class.schema');

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
		const updateFoundStudents = [];
		const blocker = foundStudents.map(async (student) => {
			let clz = [];
			if(student.classId) {
				clz[0] = await Class.getClass(student.classId);
				delete clz[0].students;
			}
			delete student.classId;
			student = {...student, class: clz};
			updateFoundStudents.push(student);
		})
		Promise.all(blocker).then(() => {
			res.status(200).json({ students: updateFoundStudents });
		  });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getStudentsByAge = async (req, res, next) => {
	try {
		const studentsByAge = await Student.getStudentsByAge();
		res.status(200).json({ studentsByAge });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
}

exports.patchEditStudent = async (req, res, next) => {
	const { firstName, lastName, age, gender, email, studentId } = req.body;

	const updatedStudent = { firstName: firstName, lastName: lastName, age: +age, gender: gender, email: email };
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const errorMessage = errors.array()[0].msg;
			const error = new Error(errorMessage);
			error.statusCode = 422;
			throw error;
		}

		const student = await Student.getStudent(studentId);

		if (!student) {
			const error = new Error('Student with that id does not exist');
			error.statusCode = 404;
			throw error;
		}

		// find all other students that has the given email(the sender is not included)
		const foundStudents = await Student.getStudentsWithCondition({
			$and: [ { email: email }, { _id: { $not: { $eq: new ObjectId(studentId) } } } ]
		});
		// it will return array, so check if it has some values
		if (foundStudents.length > 0) {
			const error = new Error('This Email is taken, please choose another one');
			error.statusCode = 422;
			throw error;
		}

		const updatingResult = await Student.updateStudent(studentId, updatedStudent);

		res.status(200).json({ message: 'Student Updated successfully', updateStudentId: studentId.toString() });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.deleteDeleteStudent = async (req, res, next) => {
	const studentId = req.params.id;

	try {
		// check if the stdudent exist
		const student = await Student.getStudent(studentId);
		if (!student) {
			const error = new Error('Student with a given id does not exist');
			error.statusCode = 404;
			throw error;
		}

		// when we delete a student, we need to check if this student was in a class, if true, we will take the classId, the studentId, go to remove the studentId from the class.students array
		const studentClassId = student.classId;
		// the student has a classId (not null)
		if (studentClassId) {
			await Class.editClassWithCondition(
				{ _id: new ObjectId(studentClassId) },
				{ $pull: { students: new ObjectId(studentId) } }
			);
		}

		const deletingResult = await Student.deleteStudent(studentId);

		res.status(200).json({ message: 'Student removed successfully', studentId: studentId });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};