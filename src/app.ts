import initApp from "./server";

const port = process.env.PORT;
initApp()
  .then((app) => {
    if (!port) {
      console.error("PORT is not defined in environment variables.");
      process.exit(1);
    }

    app.listen(port, () => {
      console.log(`PawPal listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });
