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

	static getTeacher = teacherId => {
		return db().collection(collectionName).findOne({ _id: new ObjectId(teacherId) });
	};

	static getTeachers = () => {
		return db().collection(collectionName).find().toArray();
	};

	static searchForTeacher = searchText => {
		
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

	static getTeacherAggregated = teacherId => {
		return db()
			.collection(collectionName)
			.aggregate([
				{ $match: { _id: new ObjectId(teacherId) } },
				{ $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } }
			])
			.next();
	};

	static updateTeacherWithConfigs = (filterObj, updateObj) => {
		return db().collection(collectionName).updateOne(filterObj, updateObj);
	};

	static updateTeachersWithConfigs = (filterObj, updateObj) => {
		return db().collection(collectionName).updateMany(filterObj, updateObj);
	};

	static deleteTeacher = teacherId => {
		return db().collection(collectionName).deleteOne({ _id: new ObjectId(teacherId) });
	};

	static getTeachersBySalary = () => {
		return db()
			.collection(collectionName)
			.aggregate([
				{ "$group": { _id: "$age", count: { $sum:1 } } }
			])
			.toArray();
	};

	
}

module.exports = Teacher;