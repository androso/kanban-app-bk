import { Router } from "express";
const boardsRouter = Router();
import { AppDataSource } from "../../sql-orm/data-source";
import { Board } from "../../sql-orm/entity/Board";
import { Status } from "../../sql-orm/entity/Status";
import { initialStatuses } from "../../helpers/helpers";
import { Task } from "../../sql-orm/entity/Task";
import { User } from "../../sql-orm/entity/User";
import boardTasksRouter from "./tasks/boardTasksRouter";
import boardStatusesRouter from "./statuses/boardStatusesRouter";
export const BoardRepository = AppDataSource.getRepository(Board);
export const StatusRepository = AppDataSource.getRepository(Status);
export const TaskRepository = AppDataSource.getRepository(Task);
export const UserRepository = AppDataSource.getRepository(User);

/**
 * @swagger
 * components:
 *   schemas:
 *     Board:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         userId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */


/**
 * @swagger
 * /user/boards:
 *   get:
 *     summary: Get all boards for authenticated user
 *     tags:
 *       - Boards
 *     responses:
 *       200:
 *         description: List of user's boards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Board'
 *       401:
 *         description: Unauthorized
 *     security:
 *       - cookieAuth: []
 *   post:
 *     summary: Create a new board
 *     tags:
 *       - Boards
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My New Board"
 *               description:
 *                 type: string
 *                 example: "Board description"
 *     responses:
 *       201:
 *         description: Board created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *     security:
 *       - cookieAuth: []
 */
boardsRouter
	.route("/")
	.get(async (req, res) => {
		if (req.session.user) {
			const boards = await BoardRepository.findBy({
				userId: req.session.user.id,
			});
			res.json(boards);
		} else {
			// send status for unathenticated
			res.sendStatus(401);
		}
	})
	.post(async (req, res) => {
		const { title, description } = req.body;
		const userFromDB = await UserRepository.findOneBy({
			id: (req.session.user as User).id,
		});

		if (userFromDB) {
			try {
				const initialStatusesFromDB = (await Promise.all(
					initialStatuses.map((status) =>
						StatusRepository.findOneBy({
							title: status.title,
							color: status.color,
						})
					)
				)) as Status[];

				const newBoard = BoardRepository.create({
					title,
					description,
					user: userFromDB,
					statuses: initialStatusesFromDB,
				});

				const { user, ...boardSaved } = await BoardRepository.save(newBoard);
				res.status(201).json(boardSaved);
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


/**
 * @swagger
 * /user/boards/{boardId}:
 *   get:
 *     summary: Get a specific board with its tasks and statuses
 *     tags:
 *       - Boards
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the board
 *     responses:
 *       200:
 *         description: Board details with tasks and statuses
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *     security:
 *       - cookieAuth: []
 *   put:
 *     summary: Update a board
 *     tags:
 *       - Boards
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Board Title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       204:
 *         description: Board updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 *     security:
 *       - cookieAuth: []
 *   delete:
 *     summary: Delete a board and its dependencies
 *     tags:
 *       - Boards
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the board
 *     responses:
 *       204:
 *         description: Board deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 *     security:
 *       - cookieAuth: []
 */
boardsRouter
	.route("/:boardId")
	.delete(async (req, res) => {
		// TODO: make sure cascade things are set up correctly
		// When i delete a board, i want to delete its dependencies
		// board, board_to_status, tasks, subtasks
		const { boardId } = req.params;
		const board = await BoardRepository.findOneBy({ id: Number(boardId) });
		if (!board) {
			res.sendStatus(404);
		} else if (board.userId === req.session.user?.id) {
			try {
				// first delete from BoardToStatus
				// then from Task and Subtask
				await BoardRepository.delete(Number(boardId));
				res.sendStatus(204);
			} catch (e) {
				console.error(e);
				res.sendStatus(500);
			}
		} else {
			res.sendStatus(401);
		}
	})
	.put(async (req, res) => {
		const { boardId } = req.params;
		const { title, description } = req.body;
		const board = await BoardRepository.findOneBy({ id: Number(boardId) });
		if (!board) {
			res.sendStatus(404);
		} else if (board.userId === req.session.user?.id) {
			try {
				await BoardRepository.update(Number(boardId), {
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
	})
	.get(async (req, res) => {
		const { boardId } = req.params;
		const board = await BoardRepository.findOne({
			where: { id: Number(boardId) },
			relations: ["statuses"],
		});
		if (board && req.session.user) {
			if (board.userId === req.session.user.id) {
				try {
					const boardTasks = await TaskRepository.find({
						where: { boardId: Number(boardId) },
						relations: ["subtasks"],
					});
					res.json({
						...board,
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

boardsRouter.use("/:boardId/tasks", boardTasksRouter);
boardsRouter.use("/:boardId/statuses", boardStatusesRouter);
export default boardsRouter;
