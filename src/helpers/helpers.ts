import { AppDataSource } from "../sql-orm/data-source";
import { Status } from "../sql-orm/entity/Status";
export const initialStatuses = [
	{ title: "Not Started", color: "#6e3630" },
	{ title: "In Progress", color: "#89632a" },
	{ title: "Completed", color: "#2b593f" },
];
export const initializeStatuses = async () => {
	const statusRepository = AppDataSource.getRepository(Status);

	try {
		const alreadyInitialized =
			(
				await Promise.all(
					initialStatuses.map((status) => statusRepository.findOneBy(status))
				)
			).every((status) => status !== null && status !== undefined) ?? false;

		if (alreadyInitialized) {
			console.log("already initialized");
			return;
		}
		await Promise.all(initialStatuses.map((status) => statusRepository.save(status)));
	} catch (e) {
		console.error("Error initializing statuses", e);
		return;
	}
};

