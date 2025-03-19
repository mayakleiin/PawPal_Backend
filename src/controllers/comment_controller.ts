import CommentModel, { IComment } from "../models/comment_model";
import createController from "./base_controller";

const commentController = createController<IComment>(CommentModel);

export default commentController;
