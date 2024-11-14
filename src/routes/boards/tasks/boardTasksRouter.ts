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


/**
 * @swagger
 * components:
 *   schemas:
 *     Subtask:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         completed:
 *           type: boolean
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         statusId:
 *           type: integer
 *         subtasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subtask'
 */

/**
 * @swagger
 * /user/boards/{boardId}/tasks:
 *   post:
 *     summary: Create a new task in a board
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - statusId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Task"
 *               description:
 *                 type: string
 *                 example: "Task description"
 *               statusId:
 *                 type: integer
 *               subtasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       500:
 *         description: Server error
 *     security:
 *       - cookieAuth: []
 */
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

/**
 * @swagger
 * /user/boards/{boardId}/tasks/{taskId}:
 *   patch:
 *     summary: Update a task's title, description or status
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the board
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated task title"
 *               description:
 *                 type: string
 *                 example: "Updated task description"
 *               statusId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       204:
 *         description: Task updated successfully
 *       400:
 *         description: No valid fields provided for update
 *       403:
 *         description: User does not own this board
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 *     security:
 *       - cookieAuth: []
 *   delete:
 *     summary: Delete a task
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the board
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task to delete
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       500:
 *         description: Server error
 *     security:
 *       - cookieAuth: []
 */
boardTasksRouter
	.route("/:taskId")
	.patch(async (req, res) => {
		const { taskId } = req.params as { taskId: string };
		const { title, description, statusId } = req.body;

		const task = await TaskRepository.findOneBy({ id: Number(taskId) });
		if (!task) {
			res.sendStatus(404);
		} else {
			const board = await BoardRepository.findOneBy({ id: Number(task.boardId) });
			if (board?.userId !== (req.user as { id: number }).id) {
				res.sendStatus(403);
			} else if (title) {
				const updated = await TaskRepository.update(taskId, { title });
				if (updated.affected) {
					res.sendStatus(204);
				} else {
					res.sendStatus(500);
				}
			} else if (description) {
				const updated = await TaskRepository.update(taskId, {
					description,
				});
				if (updated.affected) {
					res.sendStatus(204);
				} else {
					res.sendStatus(500);
				}
			} else if (statusId) {
				const updated = await TaskRepository.update(taskId, {
					statusId,
				});
				if (updated.affected) {
					res.sendStatus(204);
				} else {
					res.sendStatus(500);
				}
			} else {
				res.sendStatus(400);
			}
		}

	})
	.delete(async (req, res) => {
		const taskIdNumber = Number(req.params.taskId);
		if (!isNaN(taskIdNumber)) {
			try {
				const task = await TaskRepository.findOneOrFail({
					where: { id: taskIdNumber },
				});
				await TaskRepository.remove(task);
				res.sendStatus(204);
			} catch (e) {
				res.sendStatus(500);
			}
		}
	});

/**
 * @swagger
 * /api/tasks/{taskId}/subtasks:
 *   post:
 *     summary: Create a new subtask for a specific task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to add the subtask to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the subtask
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: The subtask was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 title:
 *                   type: string
 *                 completed:
 *                   type: boolean
 *       500:
 *         description: Server error or invalid task ID
 */
boardTasksRouter.route("/:taskId/subtasks").post(async (req, res) => {
	const { taskId } = req.params as { taskId: string };
	const taskIdNumber = Number(taskId);
	const { title } = req.body as { title: string };
	if (!isNaN(taskIdNumber)) {
		const taskFromDB = await TaskRepository.findOneOrFail({
			where: { id: taskIdNumber },
			relations: ["subtasks"],
		});
		const newSubtask = SubtaskRepository.create({
			completed: false,
			title,
		});
		taskFromDB.subtasks.push(newSubtask);
		await TaskRepository.save(taskFromDB);
		res.status(201).json(newSubtask);
	} else {
		res.sendStatus(500);
	}
});

/**
 * @swagger
 * /api/tasks/{taskId}/subtasks/{subtaskId}:
 *   patch:
 *     summary: Update a subtask's title or completion status
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the parent task
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subtask to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The new title for the subtask
 *               completed:
 *                 type: boolean
 *                 description: The completion status of the subtask
 *             oneOf:
 *               - required: [title]
 *               - required: [completed]
 *     responses:
 *       204:
 *         description: Subtask successfully updated
 *       400:
 *         description: Invalid task or subtask ID
 *       500:
 *         description: Server error while updating subtask
 */
boardTasksRouter
	.route("/:taskId/subtasks/:subtaskId")
	.patch(async (req, res) => {
		const { taskId, subtaskId } = req.params as {
			taskId: string;
			subtaskId: string;
		};
		const { title, completed } = req.body as {
			title: string;
			completed: boolean;
		};
		const taskIdNumber = Number(taskId);
		const subtaskIdNumber = Number(subtaskId);
		if (!isNaN(taskIdNumber) && !isNaN(subtaskIdNumber)) {
			if (title) {
				const updatedSubtask = await SubtaskRepository.update(subtaskIdNumber, {
					title,
				});
				if (updatedSubtask.affected) {
					res.sendStatus(204);
				}
			} else if (completed != null) {
				const updatedSubtask = await SubtaskRepository.update(subtaskIdNumber, {
					completed: completed,
				});
				if (updatedSubtask.affected) {
					res.sendStatus(204);
				}
			}
		}
	})
	.delete(async (req, res) => {
		const subtaskIdNumber = Number(req.params.subtaskId);
		if (!isNaN(subtaskIdNumber)) {
			const result = await SubtaskRepository.delete(subtaskIdNumber);
			if (result.affected) {
				res.sendStatus(204);
			} else {
				res.sendStatus(500);
			}
		}
	});
export default boardTasksRouter;
