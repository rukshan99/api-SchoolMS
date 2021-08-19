const db = require('../helpers/db').getDb;
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;

const collectionName = 'teachers';

class Teacher {
	constructor(firstName, lastName, email, age, gender, salary, subjectId, joinedAt) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.age = age;
		this.gender = gender;
		this.salary = salary;
		this.subjectId = subjectId;
		this.joinedAt = joinedAt;
	}

	addTeacher = () => {
		return db().collection(collectionName).insertOne(this);
	};

    static getTeacherWithCondition = condition => {
		return db().collection(collectionName).findOne(condition);
	};

    static getTeachersWithCondition = condition => {
		return db().collection(collectionName).find(condition).toArray();
	};

	static getTeachers = () => {
		return db().collection(collectionName).find().toArray();
	};
}

module.exports = Teacher;