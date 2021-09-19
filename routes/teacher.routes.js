const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const { body } = require('express-validator');

const TeacherControllers = require('../controller/teacher.controller');

const Teacher = require('../schemas/teacher.schema');
const Student = require('../schemas/student.schema');

const router = express.Router();

router.post(
	'/teachers',
	[
		body('firstName', 'FirstName must contain chars only').trim().isString().notEmpty(),
		body('lastName', 'LastName must contain chars only').trim().isString().notEmpty(),
		body('gender', 'Gender must be contain chars only').trim().isAlpha().notEmpty(),
		body('age', 'Insert age').trim().notEmpty(),
		body('salary', 'Insert salary').trim().notEmpty(),

		body('email').isEmail().withMessage('Email must be a valid email').custom(async (value, { req }) => {
			try {
				const foundTeacher = await Teacher.getTeacherWithCondition({ email: value });
				if (foundTeacher) {
					return Promise.reject('This email is taken by some teacher');
				}
				const foundStudent = await Student.getStudentWithCondition({ email: value });

				if (foundStudent) {
					return Promise.reject('This email is taken by some student');
				}

				return true;
			} catch (error) {
				if (!error.statusCode) error.statusCode = 500;
				throw error;
			}
		})
	],
	TeacherControllers.postAddTeacher
);


router.get('/teachers', TeacherControllers.getGetTeachers);

router.get('/teachers/search/:text', TeacherControllers.getSearchForTeachers);

router.get('/teachers/:teacherId', TeacherControllers.getSingleTeacher);

router.patch(
	'/teacher/edit',
	[
		body('firstName', 'FirstName must contain chars only').trim().isString().notEmpty(),
		body('lastName', 'LastName must contain chars only').trim().isString().notEmpty(),
		body('gender', 'Gender must be contain chars only').trim().isAlpha().notEmpty(),
		body('age', 'Insert age').trim().notEmpty(),
		body('salary', 'Insert salary').trim().notEmpty(),
		body('email').isEmail().withMessage('Email must be a valid email').custom(async value => {
			try {
				const foundStudent = await Student.getStudentWithCondition({ email: value });
				if (foundStudent) {
					return Promise.reject('This email is taken by some student');
				}

				return true;
			} catch (error) {
				if (!error.statusCode) error.statusCode = 500;
				throw error;
			}
		})
	],
		TeacherControllers.patchEditTeacher	
);

router.delete('/teachers/delete/:teacherId', TeacherControllers.deleteDeleteTeacher);

router.get('/teachers-by-salary', TeacherControllers.getTeachersBySalary);

module.exports = router;