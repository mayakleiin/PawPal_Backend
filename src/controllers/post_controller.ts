import PostModel, { IPost } from "../models/post_model";
import createController from "./base_controller";

const postsController = createController<IPost>(PostModel);

// Ensure that postsController has all methods (debugging)
console.log(Object.keys(postsController));

export default postsController;
