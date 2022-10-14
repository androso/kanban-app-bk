import { Router } from "express";
import { BoardToStatus } from "../../sql-orm/entity/BoardToStatus";
const boardsRouter = Router();
import { AppDataSource } from "../../sql-orm/data-source";
import { Board } from "../../sql-orm/entity/Board";
import { Status } from "../../sql-orm/entity/Status";
import { initialStatuses } from "../../helpers/helpers";
import { Task } from "../../sql-orm/entity/Task";
const BoardRepository = AppDataSource.getRepository(Board);
const BoardToStatusRepository = AppDataSource.getRepository(BoardToStatus);
const StatusRepository = AppDataSource.getRepository(Status);
const TaskRepository = AppDataSource.getRepository(Task);

boardsRouter
	.route("/")
	.get(async (req, res) => {
		const boards = await BoardRepository.findBy({
			user: req.session.user,
		});
		// console.log(boards);
		res.json(boards);
	})
	.post(async (req, res) => {
		// For now we assume we have an authenticating middleware at app.ts that returns earlier if they're not logged in
		const { title, description } = req.body;
		if (req.session.user) {
			const newBoard = BoardRepository.create({
				title,
				description,
				user: req.session.user,
			});
			try {
				// we should also link this board with the initial statuses
				const board = await BoardRepository.save(newBoard);
				const initialStatusesFromDB = await Promise.all(
					initialStatuses.map((status) =>
						StatusRepository.findOneBy({
							title: status.title,
							color: status.color,
						})
					)
				);
				const initialStatusesAreCorrect = initialStatusesFromDB.every(
					(status) => status !== null && status !== undefined
				);

				if (initialStatusesAreCorrect) {
					await Promise.all(
						initialStatusesFromDB.map((status) => {
							const newBoardStatus = BoardToStatusRepository.create({
								board: board,
								status: status as Status,
							});
							return BoardToStatusRepository.save(newBoardStatus);
						})
					);
				}
				res.sendStatus(201);
			} catch (e) {
				if (e instanceof Error) {
					console.error(e);
					res.sendStatus(500);
				}
			}
		} else {
			res.sendStatus(401);
		}
	});

boardsRouter
	.route("/:boardId")
	.delete(async (req, res) => {
		const { boardId } = req.params;
		const board = await BoardRepository.findOneBy({ id: Number(boardId) });
		if (board?.user === req.session.userId) {
			try {
				await BoardRepository.delete(boardId);
				res.sendStatus(204);
			} catch (e) {
				if (e instanceof Error) {
					console.error(e);
					res.sendStatus(500);
				}
			}
		} else {
			res.status(401);
		}
	})
	.put(async (req, res) => {
		const { boardId } = req.params;
		const { title, description } = req.body;
		const board = await BoardRepository.findOneBy({ id: Number(boardId) });
		if (board?.user === req.session.userId) {
			try {
				await BoardRepository.update(boardId, {
					title,
					description,
				});
				res.sendStatus(204);
			} catch (e) {
				if (e instanceof Error) {
					console.error(e);
					res.sendStatus(500);
				}
			}
		} else {
			res.status(401);
		}
	});

// boardsRouter.route("/:boardId").get(async (req, res) => {
// 	const { boardId } = req.params;
// 	const board = await BoardRepository.findOneBy({ id: Number(boardId) });
// 	if (board?.user === req.session.userId) {
// 		try {
// 			const statusesIds = await BoardToStatusRepository.findBy({
// 				board: Number(boardId),
// 			});
// 			const statuses = await Promise.all(
// 				statusesIds.map((statusId) => StatusRepository.findOneBy(statusId))
// 			);

// 			const tasks = await TaskRepository.findBy({ board: Number(boardId) });

// 			const tasksWithStatus = tasks.map((task) => {
// 				console.log({ taskStatus: task.status });
// 				const status = statuses.find((status) => status?.id === task.status);
// 				return { ...task, status: status };
// 			});
// 			console.log({ tasksWithStatus, statuses, tasks });
// 			res.json({
// 				...board,
// 				statuses,
// 				tasks: tasksWithStatus,
// 			});
// 		} catch (e) {
// 			if (e instanceof Error) {
// 				console.error(e);
// 				res.sendStatus(500);
// 			}
// 		}
// 	}
// });

// boardsRouter.route("/:boardId/statuses").get(async (req, res) => {
// 	const { boardId } = req.params;
// 	const board = await BoardRepository.findOneBy({ id: Number(boardId) });
// 	if (board?.user === req.session.userId) {
// 		try {
// 			const statusesIds = await BoardToStatusRepository.findBy({
// 				board: Number(boardId),
// 			});
// 			const statuses = await Promise.all(
// 				statusesIds.map((statusId) => StatusRepository.findOneBy(statusId))
// 			);
// 			res.json(statuses);
// 		} catch (e) {
// 			if (e instanceof Error) {
// 				console.error(e);
// 				res.sendStatus(500);
// 			}
// 		}
// 	} else {
// 		res.status(401);
// 	}
// });

export default boardsRouter;
