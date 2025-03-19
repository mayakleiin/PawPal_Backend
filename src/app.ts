import initApp from "./server";

const port = process.env.PORT || 3000; // Ensure default port if .env is missing

initApp()
  .then((app) => {
    if (!port) {
      console.error("PORT is not defined in environment variables.");
      process.exit(1); // Exit if no port is set
    }

    app.listen(port, () => {
      console.log(`PawPal listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Server failed to start:", error);
    process.exit(1); // Exit the process if server initialization fails
  });
