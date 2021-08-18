const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const { body } = require('express-validator');

const SubjectControllers = require('../controller/Subject.controller');

const Subject = require('../schemas/Subject.schema');

const router = express.Router();


// POST @ /settings/subjects
router.post(
	'/subjects',
	[ body('name', 'Subject must not be empty and only in characters').trim().notEmpty().isAlpha(),
      body('code', 'Subject must not be empty').trim().notEmpty(),
      body('description', 'Subject must not be empty').trim().notEmpty() ],
	SubjectControllers.postAddSubject
);

// GET @ /settings/subject/:subjectId
// router.get('/subject/:subjectId', SubjectControllers.getSingleSubject);

// // PATCH /settings/subjects/edit
// router.patch(
// 	'/subjects/edit',
// 	[
// 		body('newName', 'newName must not be null, only in characters')
// 			.trim()
// 			.notEmpty()
// 			.isAlpha()
// 			.custom(async value => {
// 				const foundSubject = await Subject.getSubjectWithCondition({ name: value });
// 				if (foundSubject) return Promise.reject('this name is already taken');
// 				return true;
// 			})
// 	],
// 	SubjectControllers.patchEditSubjectName
// );

// GET @ /settings/subjects
router.get('/subjects', SubjectControllers.getGetSubjects);

// // DELETE @ /settings/subjects/delete/:subjectId
// router.delete('/subjects/delete/:subjectId', SubjectControllers.deleteRemoveSubject);

// // GET @ /settings/subjects/search/:text
// router.get('/subjects/search/:text', SubjectControllers.getSearchForSubjects);

module.exports = router;