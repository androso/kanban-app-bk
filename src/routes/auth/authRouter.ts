import express from "express";
import bcrypt from "bcrypt";
import { User } from "../../sql-orm/entity/User";
import { AppDataSource } from "../../sql-orm/data-source";
const authRouter = express.Router();
const UserRepository = AppDataSource.getRepository(User);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and create session
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 id:
 *                   type: number
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
authRouter.route("/login").post(async (req, res) => {
	const { email, password } = req.body;
	try {
		const record = await UserRepository.findOneBy({ email });
		if (!record) {
			res.sendStatus(404);
		} else {
			const passwordsMatch = await bcrypt.compare(password, record.password);
			if (!passwordsMatch) {
				res.sendStatus(401);
			} else {
				req.session.user = {
					username: record.username,
					email: record.email,
					id: record.id,
				};
				req.session.save((err) => {
					if (err) {
						res.sendStatus(500);
					} else {
						console.log("User saved", req.session.user);
						res.status(200).json({
							username: record.username,
							email: record.email,
							id: record.id,
						});
					}
				});
			}
		}
	} catch (e) {
		res.sendStatus(500);
	}
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user account
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mypassword123
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: User already exists with this email
 *       500:
 *         description: Server error
 */
authRouter.route("/register").post(async (req, res) => {
	const { email, username, password } = req.body;
	try {
		if (!email || !username || !password) {
			res.sendStatus(400);
			return;
		}

		const userExists = await UserRepository.findOneBy({ email });
		if (userExists) {
			res.statusMessage = "User already exists";
			res.status(409).end();
		} else {
			const newUser = new User();
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			newUser.password = hashedPassword;
			newUser.email = email;
			newUser.username = username;
			// save to db
			await AppDataSource.manager.save(newUser);
			// await UserRepository.save(newUser);
			res.sendStatus(201);
		}
	} catch (e) {
		if (e instanceof Error) {
			res.statusMessage = "Internal Error";
			res.status(500).end();
		}
	}
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: End user session and logout
 *     tags:
 *       - Authentication
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       500:
 *         description: Server error destroying session
 */
authRouter.route("/logout").post(async (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			res.statusMessage = "Internal Error";

			res.status(500).end();
		} else {
			res.sendStatus(200);
		}
	});
});

export default authRouter;
