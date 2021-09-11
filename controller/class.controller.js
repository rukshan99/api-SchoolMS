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

exports.getGetSingleClass = async (req, res, next) => {
	const classId = req.params.classId;

	try {
		const foundClass = await Class.getClassAggregated(classId);

		if (!foundClass) {
			const error = new Error('Class with given id does not exist.');
			error.statusCode = 404;
			throw error;
		}

		res.status(200).json({ class: foundClass });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.patchAddStudentToClass = async (req, res, next) => {
	const { classId, studentId } = req.body;

	try {
		// check first if the class and student exist because i need to build a robust app that prevents any bugs

		const foundClass = await Class.getClass(classId);

		if (!foundClass) {
			const error = new Error('No class with given id exists');
			error.statusCode = 404;
			throw error;
		}

		const student = await Student.getStudent(studentId);

		if (!student) {
			const error = new Error('No Student with given id exists');
			error.statusCode = 404;
			throw error;
		}
		// if you are trying to add a student who is already in a class
		if (student) {
			if (student.classId !== null) {
				const error = new Error('You are trying to add a student who is really exist');
				error.statusCode = 403;
				throw error;
			}
		}

		// add the student to the class students array
		const updatingClassResult = await Class.editClassWithCondition(
			{ _id: new ObjectId(classId) },
			{ $addToSet: { students: new ObjectId(studentId) } }
		);

		// add the classId to the student
		const updatingStudentResult = await Student.updateStudentWithConfigs(studentId, {
			$set: { classId: new ObjectId(classId) }
		});

		res.status(200).json({
			message: 'Student added successfully',
			classId: classId,
			studentId: studentId
		});
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getSearchForClasses = async (req, res, next) => {
	const searchText = req.params.text;

	try {
		const foundClasses = await Class.searchForClass(searchText);
		res.status(200).json({ classes: foundClasses });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.deleteRemoveClass = async (req, res, next) => {
	const classId = req.params.classId;

	try {
		const foundClass = await Class.getClass(classId);

		if (!foundClass) {
			const error = new Error('No class with given id was found.');
			error.statusCode = 404;
			throw error;
		}

		// if the class was found, before deleting the class, get all the studentsIds in that class, then go and set their classId to null

		if (foundClass) {
			// make an array of all the studentids that were in this class and make sure it objectId data type
			const studentIds = foundClass.students.map(stId => new ObjectId(stId));

			await Student.updateStudentsWithConfigs({ _id: { $in: studentIds } }, { $set: { classId: null } });
		}

		const removingResult = await Class.removeClass(classId);

		res.status(200).json({ message: 'Class removed successfully', RemovedclassId: classId });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}

	// Later, after removing the class i will go and check for all the students in this class and i will go to remove the classId from each class object.
};

exports.patchremoveStudentFromClass = async (req, res, next) => {
	const { classId, studentId } = req.body;

	try {
		// check first if the class and student exist because i need to build a robust app that prevents any bugs

		const foundClass = await Class.getClass(classId);

		if (!foundClass) {
			const error = new Error('No class with given id exists');
			error.statusCode = 404;
			throw error;
		}

		// check if this class has students
		if (foundClass) {
			if (foundClass.students.length < 1) {
				const error = new Error('You are trying to remove a student from a class that has no students!!');
				error.statusCode = 500;
				throw error;
			}
		}

		const student = await Student.getStudent(studentId);

		if (!student) {
			const error = new Error('No Student with given id exists');
			error.statusCode = 404;
			throw error;
		}

		// no errors, good

		// remove the student from the class students array
		const removingResult = await Class.editClassWithCondition(
			{ _id: new ObjectId(classId) },
			{ $pull: { students: new ObjectId(studentId) } }
		);

		// set the classId in that student to null
		const removingClassIdResult = await Student.updateStudentWithConfigs(studentId, { $set: { classId: null } });

		res.status(200).json({ message: 'Student removed successfully', classId: classId, studentId: studentId });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.getStudentsByClass = async (req, res, next) => {
	try {
		const studentsByClass = await Class.getStudentsByClass();
		res.status(200).json({ studentsByClass });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500;
		next(error);
	}
};

exports.patchEditClass = async (req, res, next) => {
	const { name, code,description,classId } = req.body;

	const updatedClass = { name: name, code: code, description: description};

	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const errorMessage = errors.array()[0].msg;
			const error = new Error(errorMessage);
			error.statusCode = 422;
			throw error;
		}

		const foundClass = await Class.getClass(classId);

		if (!foundClass) {
			const error = new Error('The class with this given id does not exist');
			error.statusCode = 404;
			throw error;
		}

		const editingResult = await Class.editClass(classId, updatedClass);

		res.status(200).json({ message: 'Class updated successfully', newName: name });
	} catch (error) {
		if (!error.statusCode) error.statusCode = 422;
		next(error);
	}
};

