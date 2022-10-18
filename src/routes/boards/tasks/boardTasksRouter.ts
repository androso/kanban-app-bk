import { Router } from "express";
import { AppDataSource } from "../../../sql-orm/data-source";
import { Subtask } from "../../../sql-orm/entity/Subtask";
import {
	BoardRepository,
	StatusRepository,
	TaskRepository,
} from "../boardsRouter";
const boardTasksRouter = Router({ mergeParams: true });
const SubtaskRepository = AppDataSource.manager.getRepository(Subtask);

boardTasksRouter.route("/").post(async (req, res) => {
	const { description, statusId, title, subtasks } = req.body as {
		description: string;
		statusId: string;
		title: string;
		subtasks: { title: string }[];
	};
	const boardIdNumber = Number((req.params as any).boardId);
	const statusIdNumber = Number(statusId);
	if (!isNaN(boardIdNumber) && !isNaN(statusIdNumber)) {
		try {
			const boardFromDB = await BoardRepository.findOneOrFail({
				where: { id: boardIdNumber },
				relations: ["tasks"],
			});
			const statusFromDB = await StatusRepository.findOneByOrFail({
				id: statusIdNumber,
			});
			let newSubtasks = [] as Subtask[];
			// creating subtasks
			if (subtasks.length >= 1) {
				newSubtasks = subtasks.map((subtask) => {
					return SubtaskRepository.create({
						completed: false,
						title: subtask.title,
					});
				});
			}

			// creating tasks
			const newTask = TaskRepository.create({
				description,
				title,
				subtasks: newSubtasks,
				statusId: statusFromDB.id,
			});

			// appending tasks to board
			// boardFromDB.tasks = [...boardFromDB.tasks, newTask];
			boardFromDB.tasks.push(newTask);

			await BoardRepository.save(boardFromDB);
			res.status(201).json(newTask);
		} catch (e) {
			console.error(e);
			if (e instanceof Error) {
				res.sendStatus(500);
			}
		}
	} else {
		res.sendStatus(500);
	}
});
boardTasksRouter.route("/:taskId").patch(async (req, res) => {
	const { taskId } = req.params as { taskId: string };
	const { title } = req.body;
	if (taskId) {
		if (title) {
			try {
				const updated = await TaskRepository.update(taskId, { title });
				if (updated.affected) {
					res.sendStatus(200);
				}
			} catch (e) {
				console.error(e);
				res.sendStatus(500);
			}
		} else {
			res.sendStatus(400);
		}
	}
});
export default boardTasksRouter;
