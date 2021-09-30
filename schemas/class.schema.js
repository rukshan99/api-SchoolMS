const db = require('../helpers/db').getDb;

const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;

const collectionName = 'classes';
class Class {
	constructor(name, code,description,students, schedule) {
		this.name = name;
        this.code = code;
        this.description = description;
		this.students = students;
	}


	addClass = () => {
		return db().collection(collectionName).insertOne(this);
	};

    static getClass = classId => {
		return db().collection(collectionName).findOne({ _id: new ObjectId(classId) });
	};
    
	static getClasses = () => {
		return db().collection(collectionName).find().project({ name: 1 }).toArray();
	};

    static getClassWithCondition = condition => {
		return db().collection(collectionName).findOne(condition);
	};

    static getClassAggregated = classId => {
		return db()
			.collection(collectionName)
			.aggregate([
				{ $match: { _id: new ObjectId(classId) } },
				{ $lookup: { from: 'students', localField: 'students', foreignField: '_id', as: 'realStudents' } },
				{ $project: { students: 0 } }
			])
			.next();
	};

    static editClassWithCondition = (filterObj, updatingObj) => {
		return db().collection(collectionName).updateOne(filterObj, updatingObj);
	};

	static searchForClass = searchText => {
		// to search efficintly, we have to add a searching index db.collection.createIndex({property: 'text'})... then we search using this text index and then for better output we need to add a score meta property and sort by it like that
		return db()
			.collection(collectionName)
			// .find({ name:{$regex: `^${searchText.toUpperCase()}`} })
			.find({ name:{ $regex: new RegExp(searchText), $options: "i" } })
			.toArray();
	};

	static removeClass = classId => {
		return db().collection(collectionName).deleteOne({ _id: new ObjectId(classId) });
	};

	static getStudentsByClass = () => {
		return db()
			.collection(collectionName)
			.aggregate([
				{$project:{name: 1,count:{$size:"$students"}}}
			])
			.toArray();
	};

	static editClass = (classId, updatedClass) => {
		return db().collection(collectionName).updateOne({ _id: new ObjectId(classId) }, { $set: updatedClass });
	};


}


module.exports = Class;