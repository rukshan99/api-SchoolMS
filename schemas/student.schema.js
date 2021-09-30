const db = require('../helpers/db').getDb;
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;
const collectionName = 'students';

class Student {
	constructor(firstName, lastName, age, gender, email, classId, joinedAt) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.age = age;
		this.gender = gender;
		this.email = email;
		this.classId = classId;
		this.joinedAt = joinedAt;
	}

	addStudent = () => {
		return db().collection(collectionName).insertOne(this);
	};

	static getStudents = () => {
		return db().collection(collectionName).find().toArray();
	};

	static getStudentsWithCondition = condition => {
		return db().collection(collectionName).find(condition).toArray();
	};

	static getStudentWithCondition = condition => {
		return db().collection(collectionName).findOne(condition);
	};

	static getStudent = studentId => {
		return db().collection(collectionName).findOne({ _id: new ObjectId(studentId) });
	};

	static searchForStudents = searchText => {
		const regex = new RegExp(searchText);

		return db()
			.collection(collectionName)
			.find({
				$or: [
					{
						firstName: { $regex: regex, $options: "i" }
					},
					{
						lastName: { $regex: regex, $options: "i" }
					},
					{
						email: { $regex: regex, $options: "i" }
					}
				]
			})
			.toArray();
	};

	// search for students as the above query but in a certain class
	static searchForStudentsInClass = (searchText, classId) => {
		return db()
			.collection(collectionName)
			.find({ $and: [ { $text: { $search: searchText } }, { classId: new ObjectId(classId) } ] })
			.project({ score: { $meta: 'textScore' } })
			.sort({ score: { $meta: 'textScore' } })
			.toArray();
	};

	static getStudentsAggregated = () => {
		return db()
			.collection(collectionName)
			.aggregate([
				{ $match: {} },
				{ $lookup: { from: 'classes', localField: 'classId', foreignField: '_id', as: 'class' } },
				{ $project: { classId: 0, 'class.students': 0, 'class.schedule': 0 } }
			])
			.toArray();
	};

	static getStudentAggregated = studentId => {
		return db()
			.collection(collectionName)
			.aggregate([
				{ $match: { _id: new ObjectId(studentId) } },
				{ $lookup: { from: 'classes', localField: 'classId', foreignField: '_id', as: 'class' } },
				{ $project: { 'realClass.students': 0, 'realClass._id': 0, 'realClass.schedule': 0 } }
			])
			.next();
	};

	static updateStudent = (studentId, updatedStudent) => {
		return db().collection(collectionName).updateOne({ _id: new ObjectId(studentId) }, { $set: updatedStudent });
	};

	static updateStudentWithConfigs = (studentId, configuration) => {
		return db().collection(collectionName).updateOne({ _id: new ObjectId(studentId) }, configuration);
	};

	static getStudentsByAge = () => {
		return db()
			.collection(collectionName)
			.aggregate([
				{ "$group": { _id: "$age", count: { $sum:1 } } }
			])
			.toArray();
	};

	static deleteStudent = studentId => {
		return db().collection(collectionName).deleteOne({ _id: new ObjectId(studentId) });
	};

	static updateStudentsWithConfigs = (filteringObj, updatingObj) => {
		return db().collection(collectionName).updateMany(filteringObj, updatingObj);
	}
}

module.exports = Student;
