const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const { body } = require('express-validator');

const ClassControllers = require('../controller/class.controller');

const Class = require('../schemas/class.schema');

const router = express.Router();

// GET @ /settings/class/:classId
router.get('/class/:classId', ClassControllers.getGetSingleClass);

// GET @ /settings/classes
router.get('/classes', ClassControllers.getGetClasses);


// POST @ /settings/classes
router.post(
	'/classes',
	[ 
		body('name', 'Class name must be consisting of one capital character and one number for better experience')
			.trim()
			.isUppercase()
			.isLength({ min: 2, max: 10 })
			.custom(async (value, { req }) => {
				try {
					const foundClass = await Class.getClassWithCondition({ name: value });
					if (foundClass) {
						return Promise.reject('This name is taken by some class, insert an alternative.');
					}
					return true;
				} catch (error) {
					error.statusCode = 500;
					throw error;
				}
			})
			.not()
			.isNumeric(),
            body('code', 'Code must contain chars only').trim().isString(),
            body('description', 'Description must contain chars only').trim().isString()
          
	],
	ClassControllers.postAddClass
);

// PATCH @ /settings/class/addStudent
router.patch('/class/addStudent', ClassControllers.patchAddStudentToClass);

// GET @ /settings/classes/search/:text
router.get('/classes/search/:text', ClassControllers.getSearchForClasses);


// DELETE @ /settings/class/delete/:classId
router.delete('/class/delete/:classId', ClassControllers.deleteRemoveClass);

// PATCH @ /settings/class/removeStudent
router.patch('/class/removeStudent', ClassControllers.patchremoveStudentFromClass); 

router.get('/students-by-class', ClassControllers.getStudentsByClass);

// GET @ /settings/class/edit/className
router.patch(
	'/class/edit',
	[
		body('name', 'Class name must be consisting of one capital character and one number for better experience')
			.trim()
			.isUppercase()
			.isLength({ min: 2, max: 10 })
			.not()
			.isNumeric(),
			body('code', 'Code must contain chars only').trim().isString(),
            body('description', 'Description must contain chars only').trim().isString()

	],
	ClassControllers.patchEditClass
);

module.exports = router;
