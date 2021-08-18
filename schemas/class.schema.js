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

}


module.exports = Class;