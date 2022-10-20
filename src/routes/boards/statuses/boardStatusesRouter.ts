import { Router } from "express";
import { Task } from "../../../sql-orm/entity/Task";
import { AppDataSource } from "../../../sql-orm/data-source";
import {
	BoardRepository,
	StatusRepository,
} from "../boardsRouter";
const boardStatusesRouter = Router({ mergeParams: true });

boardStatusesRouter.route("/").post(async (req, res) => {
	const { title, color } = req.body;
	const { boardId } = req.params as { boardId: string };
	const boardIdNumber = Number(boardId);
	if (!isNaN(boardIdNumber)) {
		if (title && color) {
			const statusAlreadyInDB = await StatusRepository.findOneBy({
				color,
				title,
			});
			const board = await BoardRepository.findOne({
				where: { id: boardIdNumber },
				relations: ["statuses"],
			});
			if (!board) {
				res.sendStatus(404);
			} else {
				if (statusAlreadyInDB) {
					if (
						board.statuses.find((status) => status.id === statusAlreadyInDB.id)
					) {
						// status is already created and connected to the board, doesn't make sense to repeat it
						res.sendStatus(409);
					} else {
						// we link the status to the board
						board.statuses.push(statusAlreadyInDB);
						await BoardRepository.save(board);
						res.sendStatus(201);
					}
				} else {
					try {
						const newStatus = StatusRepository.create({
							color,
							title,
						});
						board?.statuses.push(newStatus);
						await BoardRepository.save(board);
						res.status(201).json(newStatus);
					} catch (e) {
						res.sendStatus(500);
					}
				}
			}
		} else {
			res.sendStatus(400);
		}
	}
});
boardStatusesRouter.route("/:statusId").delete(async (req, res) => {
	const statusIdNumber = Number(req.params.statusId);
	const { boardId } = req.params as { boardId: string; statusId: string };
	const boardIdNumber = Number(boardId);
	console.log(typeof boardIdNumber, typeof statusIdNumber);
	if (!isNaN(statusIdNumber) && !isNaN(boardIdNumber)) {
		const status = await StatusRepository.findOne({
			where: { id: statusIdNumber },
			relations: ["boards"],
		});
		console.log(status);
		if (status) {
			// check if this is the last board subscribed to this status
			if (status.boards.length === 1) {
				// in that case we delete the status from the statuses table
				// and we delete it from the junction table
				// we also delete all of the tasks that are from this board and have this status id
				const board = await BoardRepository.findOne({
					where: { id: boardIdNumber },
					relations: ["statuses"],
				});
				if (!board) {
					res.sendStatus(404);
				} else {
					board.statuses = board.statuses.filter(
						(status) => status.id !== statusIdNumber
					);
					await BoardRepository.save(board);
					await StatusRepository.delete(statusIdNumber);
					await AppDataSource.createQueryBuilder()
						.delete()
						.from(Task)
						.where("statusId = :id", { id: statusIdNumber })
						.andWhere("boardId = :id", { id: boardIdNumber })
						.execute();
					res.sendStatus(204);
				}
			} else {
				// we just delete the connection between this board and the status
				// and any task from this board that has that status
				const board = await BoardRepository.findOne({
					where: { id: boardIdNumber },
					relations: ["statuses"],
				});
				if (!board) {
					res.sendStatus(404);
				} else {
					board.statuses = board.statuses.filter(
						(status) => status.id !== statusIdNumber
					);
					await BoardRepository.save(board);
					await AppDataSource.createQueryBuilder()
						.delete()
						.from(Task)
						.where("statusId = :id", { id: statusIdNumber })
						.andWhere("boardId = :id", { id: boardIdNumber })
						.execute();
					res.sendStatus(204);
				}
			}
		} else {
			res.sendStatus(404);
		}
	}
});
export default boardStatusesRouter;
