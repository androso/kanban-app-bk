import { Router } from "express";
import { BoardRepository, StatusRepository } from "../boardsRouter";
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
export default boardStatusesRouter;
