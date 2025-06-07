import app from './app';

const PORT = app.get('port');

//Start Express server.
const server = app.listen(PORT, () => {
  console.log(`App is up and running on PORT: ${PORT}`);
});

export default server;
