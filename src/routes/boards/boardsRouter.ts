import { Router } from "express";
import { BoardToStatus } from "../../sql-orm/entity/BoardToStatus";
const boardsRouter = Router();
import { AppDataSource } from "../../sql-orm/data-source";
import { Board } from "../../sql-orm/entity/Board";
import { Status } from "../../sql-orm/entity/Status";
import { initialStatuses } from "../../helpers/helpers";
import { Task } from "../../sql-orm/entity/Task";
import { User } from "../../sql-orm/entity/User";

const BoardRepository = AppDataSource.getRepository(Board);
const BoardToStatusRepository = AppDataSource.getRepository(BoardToStatus);
const StatusRepository = AppDataSource.getRepository(Status);
const TaskRepository = AppDataSource.getRepository(Task);
const UserRepository = AppDataSource.getRepository(User);
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
		const { title, description } = req.body;
		if (req.session.user) {
			const userFromDB = await UserRepository.findOneByOrFail({
				id: req.session.user.id,
			});
			const newBoard = BoardRepository.create({
				title,
				description,
				user: userFromDB,
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
		// TODO: make sure cascade things are set up correctly
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

boardsRouter.route("/:boardId").get(async (req, res) => {
	const { boardId } = req.params;
	const board = await BoardRepository.findOneByOrFail({
		id: Number(boardId),
	});
	if (board && req.session.user) {
		if (board.userId === req.session.user.id) {
			try {
				// find the statuses related to this board
				const boardStatuses = (
					await BoardToStatusRepository.find({
						relations: ["status"],
						where: { boardId: board.id },
					})
				).map((boardToStatus) => {
					return boardToStatus.status;
				});
				const boardTasks = await TaskRepository.findBy({
					boardId: board.id,
				});
				res.json({
					...board,
					statuses: boardStatuses,
					tasks: boardTasks,
				});
			} catch (e) {
				if (e instanceof Error) {
					console.error(e);
					res.sendStatus(500);
				}
			}
		}
	}
});
export default boardsRouter;
