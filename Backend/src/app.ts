import initApp from "./server";
const port = process.env.PORT;

initApp()
  .then((app) => {
    app.listen(port, () => {
      console.log(`PawPal listening at http://localhost:${port}`);
    });
  })
  .catch(() => {
    console.error("Server failed to start");
  });
