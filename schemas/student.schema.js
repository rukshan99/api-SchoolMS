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

}

module.exports = Student;
