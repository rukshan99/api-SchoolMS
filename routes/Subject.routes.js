const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const { body } = require('express-validator');

const SubjectControllers = require('../controller/Subject.controller');

const Subject = require('../schemas/Subject.schema');

const router = express.Router();


router.post(
	'/subjects',
	[ body('name', 'Subject must not be empty and only in characters').trim().notEmpty().isAlpha(),
      body('code', 'Subject must not be empty').trim().notEmpty(),
      body('description', 'Subject must not be empty').trim().notEmpty() ],
	SubjectControllers.postAddSubject
);
router.get('/subject/:subjectId', SubjectControllers.getSingleSubject);
router.get('/subjects/search/:text', SubjectControllers.getSearchForSubjects);
router.get('/subjects', SubjectControllers.getGetSubjects);


router.patch(
	'/subjects/edit',
	[
			body('name', 'Name must not be null, only in characters').trim().notEmpty().isAlpha(),
			body('code', 'Code must contain chars only').trim().isString(),
            body('description', 'Description must contain chars only').trim().isString()	
	],
	SubjectControllers.patchEditSubject
);


router.delete('/subjects/delete/:subjectId', SubjectControllers.deleteRemoveSubject);

router.get('/teachers-by-subject', SubjectControllers.getTeachersBySubject);


module.exports = router;