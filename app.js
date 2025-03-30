// const express = require("express");
// const app = express();
// const http = require("http").createServer(app); // Create HTTP server
// const socketIo = require('socket.io')(http);
// const swaggerDocs = require("./config/swaggerConfig");

// const bodyparser = require("body-parser");
// const helmet = require("helmet");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// const xss = require("xss-clean");
// const mongoose = require("mongoose");
// require("dotenv").config();
// const mongoconnect = require("./Config");
// const userRoute = require('./Routes/userRoutes')
// const path = require('path')
// app.use(cors()); // to follow cors policy
// app.use(xss()); // safety against XSS attack or Cross Site Scripting attacks
// app.use(helmet()); // safety against XSS attack
// app.use(express.json({ extended: false }));
// app.use(express.static(path.resolve(__dirname, 'public')));
// app.use(bodyparser.urlencoded({ extended: true }));
// app.use(bodyparser.json());

// const port = process.env.PORT || 5000;

// try {
//   mongoconnect
//     .connectToDatabase()
//     .then(() => {
//       app.listen(port, () =>
//         console.log(`Server is up and running at ${port}`)
//       );
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// } catch (err) {
//   console.log(err);
// }
// swaggerDocs(app); // Register Swagger docs

// app.use('/api/user', userRoute)
// app.use('/api/bet', authenticate, betRoute)
// app.use('/api/spinner', authenticate, spinnerRoute)
// app.use('/api/admin', adminRoute)
// socketIo.on('connection', (socket) => {
//   console.log('New client connected');

//   // Handle Socket.IO events here
//   socket.on('example_event', (data) => {
//     console.log('Received data from client:', data);
//     socket.emit('server_response', { message: 'Hello from server!' });
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });


// app.get("/", (req, res) => {
//   console.log("hello");
//   res.json("working");
// });
const mongoconnect = require("./Config");
const swaggerDocs = require("./config/swaggerConfig");
const express = require("express");
const userRoute = require('./Routes/userRoutes')
const productRoute = require('./Routes/productRoutes')
const orderRoute = require('./Routes/orderRoutes')
const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies
try {
  mongoconnect
    .connectToDatabase()
    .then(() => {
      app.listen(5000, () =>
        console.log(`Server is up and running at 3000`)
      );
    })
    .catch((err) => {
      console.log(err);
    });
} catch (err) {
  console.log(err);
}
swaggerDocs(app);
app.use('/api/user', userRoute)
app.use('/api/products', productRoute)
app.use('/api/orders', orderRoute)


// app.listen(3000, () => console.log("Server running on port 3000"));
