const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;

const db = require('../helpers/db').getDb;
const collectionName = 'subjects';
class Subject {
	constructor(name,code,description,teachers) {
		this.name = name;
        this.code = code;
        this.description = description;
        this.teachers = teachers;
	}

	addSubject = () => {
		console.log(typeof this.name);
		return db().collection(collectionName).insertOne(this);
	};

    static getSingleSubjectAggregated = subjectId => {
		console.log('we made it here');

		return db()
			.collection(collectionName)
			.aggregate([
				{
					$match: { _id: new ObjectId(subjectId) }
				},
				{ $lookup: { from: 'teachers', localField: 'teachers', foreignField: '_id', as: 'realTeachers' } }
			])
			.next();
	};
	static getSubject = subjectId => {
		return db().collection(collectionName).findOne({ _id: new ObjectId(subjectId) });
	};

    static getSubjectWithCondition = condition => {
		return db().collection(collectionName).findOne(condition);
	};
	static getSubjects = () => {
		return db().collection(collectionName).find().toArray();
	};

	static getSubjectsAggregated = () => {
		return db()
			.collection(collectionName)
			.aggregate([
				{ $lookup: { from: 'teachers', localField: 'teachers', foreignField: '_id', as: 'realTeachers' } }
			])
			.next();
	};
	static removeSubject = subjectId => {
		return db().collection(collectionName).deleteOne({ _id: new ObjectId(subjectId) });
	};

	static editSubject = (subjectId, updatedSubject) => {
		return db().collection(collectionName).updateOne({ _id: new ObjectId(subjectId) }, { $set: updatedSubject });
	};

	static updateSubjectWithConfigs = (filterObj, updateObj) => {
		return db().collection(collectionName).updateOne(filterObj, updateObj);
	};

	static GetSearchForSubjects = searchText => {
		return db()
			.collection(collectionName)
			.find({ name:{ $regex: new RegExp(searchText), $options: "i" } })
			.toArray();
	};

	static GetSearchForSubjects = searchText => {
		return db()
			.collection(collectionName)
			.find({ name:{ $regex: new RegExp(searchText), $options: "i" } })
			.toArray();
	};

	static getTeachersBySubject = () => {
		return db()
			.collection(collectionName)
			.aggregate([
				{$project:{name: 1,count:{$size:"$teachers"}}}
			])
			.toArray();
	};

}

module.exports = Subject;