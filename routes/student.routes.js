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
			try {
				const student = await Student.getStudentWithCondition({ email: value });
				if (student) {
					return Promise.reject('This email is taken by some student');
				}
				// const teacher = await Teacher.getTeacherWithCondition({ email: value });
				// if (teacher) {
				// 	return Promise.reject('This Email is taken by some teacher');
				// }
				return true;
			} catch (error) {
				error.statusCode = 500;
				throw error;
			}
		})
	],
	StudentControllers.addStudent
);

router.get('/students', StudentControllers.getAllStudents);

router.get('/student/:id', StudentControllers.getStudent);

router.get('/students/search/:text', StudentControllers.getSearchForStudents);

router.get('/students-by-age', StudentControllers.getStudentsByAge);

router.patch(
	'/student/edit',
	[
		body('firstName', 'FirstName must contain chars only').trim().isString(),
		body('lastName', 'LastName must contain chars only').trim().isString(),
		body('gender', 'Gender must be contain chars only'),
		body('email', 'Email must be a valid email').trim().isEmail()
	],
	StudentControllers.patchEditStudent
);

router.delete('/student/delete/:id', StudentControllers.deleteDeleteStudent);

module.exports = router;