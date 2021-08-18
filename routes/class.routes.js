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
            body('code', 'FirstName must contain chars only').trim().isString(),
            body('description', 'FirstName must contain chars only').trim().isString()
          
	],
	ClassControllers.postAddClass
);



module.exports = router;
