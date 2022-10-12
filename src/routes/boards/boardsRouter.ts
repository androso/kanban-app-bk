import { Router } from "express";
const boardsRouter = Router();
import { AppDataSource } from "../../sql-orm/data-source";
import { Board } from "../../sql-orm/entity/Board";
const BoardRepository = AppDataSource.getRepository(Board);

boardsRouter
	.route("/")
	.get(async (req, res) => {
		const boards = await BoardRepository.findBy({
			user_id: req.session.userId,
		});
		res.json(boards);
	})
	.post(async (req, res) => {
		// For now we assume we have an authenticating middleware at app.ts that returns earlier if they're not logged in
		const { title, description } = req.body;
		if (req.session.user) {
			const newBoard = new Board();
			newBoard.description = description;
			newBoard.title = title;
			newBoard.user_id = req.session.user.id;
			try {
				await BoardRepository.save(newBoard);
				res.status(201).json(newBoard);
				// .json({ message: "Board created correctly", status: 201 });
			} catch (e) {
				if (e instanceof Error) {
					console.error(e);
				}
			}
		} else {
			res.status(401).json({ message: "Unauthorized", status: 401 });
		}
	});

boardsRouter.route("/:boardId").delete(async (req, res) => {
	const { boardId } = req.params;
	const board = await BoardRepository.findOneBy({ id: Number(boardId) });
	if (board?.user_id === req.session.userId) {
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
});

export default boardsRouter;
