import fs from "fs";
import { User } from "../types/types";
import users from "../data/db.json";

const getNewId = (array: User[]) => {
	if (array.length > 0) {
		return array[array.length - 1].id + 1;
	} else {
		return 1;
	}
};

const userExists = async (username: string) => {
	return await users.find((user) => user.username === username);
};

const findById = function (
	id: number,
	cb: (err: Error | null, second?: any) => void
) {
	process.nextTick(function () {
		var idx = id - 1;
		if (users[idx]) {
			cb(null, users[idx]);
		} else {
			cb(new Error("User " + id + " does not exist"));
		}
	});
};

const findByUsername = function (username: string, cb: any) {
	process.nextTick(function () {
		for (var i = 0, len = users.length; i < len; i++) {
			var record = users[i];
			if (record.username === username) {
				console.log(`Username with username ${record.username} found!`);
				console.log(`${JSON.stringify(record)}`);
				return cb(null, record);
			}
		}
		return cb(null, null);
	});
};

function writeJSONFile(filename: string, content: User[]) {
	fs.writeFileSync(filename, JSON.stringify(content), "utf8");
}

export default {
	getNewId,
	writeJSONFile,
	userExists,
	findByUsername,
	findById,
};
