import { Router } from "express";
import { BoardToStatus } from "../../sql-orm/entity/BoardToStatus";
const boardsRouter = Router();
import { AppDataSource } from "../../sql-orm/data-source";
import { Board } from "../../sql-orm/entity/Board";
import { Status } from "../../sql-orm/entity/Status";
import { initialStatuses } from "../../helpers/helpers";
const BoardRepository = AppDataSource.getRepository(Board);
const BoardToStatusRepository = AppDataSource.getRepository(BoardToStatus);
const StatusRepository = AppDataSource.getRepository(Status);

boardsRouter
	.route("/")
	.get(async (req, res) => {
		const boards = await BoardRepository.findBy({
			user: req.session.userId,
		});
		console.log(boards);
		res.json(boards);
	})
	.post(async (req, res) => {
		// For now we assume we have an authenticating middleware at app.ts that returns earlier if they're not logged in
		const { title, description } = req.body;
		if (req.session.user) {
			const newBoard = new Board();
			newBoard.description = description;
			newBoard.title = title;
			newBoard.user = req.session.user.id;
			try {
				// we should also link this board with the initial statuses
				const board = await BoardRepository.save(newBoard);
				const initialStatusesFromDB = await Promise.all(
					initialStatuses.map((status) => StatusRepository.findOneBy(status))
				);
				const initialStatusesAreCorrect = initialStatusesFromDB.every(
					(status) => status !== null && status !== undefined
				);

				if (initialStatusesAreCorrect && initialStatusesFromDB[0]) {
					await Promise.all(
						initialStatusesFromDB.map((status) => {
							const newBoardStatus = BoardToStatusRepository.create({
								board: board.id,
								status: status?.id as number,
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
