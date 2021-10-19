if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}
const express = require('express'); // framework for middleware
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override'); // allow update, delete
const morgan = require('morgan'); // logging middleware
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/express_error');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const usersRoutes = require('./routes/users_routes');
const booksRoutes = require('./routes/books_routes');
const ordersRoutes = require('./routes/orders_routes');
const pagesRoutes = require('./routes/pages_routes');

const MongoStore = require('connect-mongo');

// const dbUrl = process.env.DB_URL;
const dbUrl = 'mongodb://localhost:27017/book-orders';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.use(morgan('tiny'));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(mongoSanitize());
app.use(express.json());

const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbUrl,
    secret: 'asecret',
    touchAfter: 24 * 60 * 60
  }),
  name: 'order-session',
  secret: 'asecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    maxAge: 1000 * 60 * 60 * 24
  }
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet({ contentSecurityPolicy: true }));

// const scriptSrcUrls = [
//   "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
//   "https://kit.fontawesome.com",
//   "https://cdnjs.cloudflare.com",
//   "https://cdn.jsdelivr.net"
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com",
//   "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js",
//   "https://fonts.googleapis.com",
//   "https://use.fontawesome.com"
// ];
// const connectSrcUrls = [];
// const fontSrcUrls = [];
// app.use(
//   helmet.contentSecurityPolicy({
//       directives: {
//           defaultSrc: [],
//           connectSrc: ["'self'", ...connectSrcUrls],
//           scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//           styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//           workerSrc: ["'self'", "blob:"],
//           childSrc: ["blob:"],
//           objectSrc: [],
//           imgSrc: [
//               "'self'",
//               "blob:",
//               "data:",
//               "https://images.unsplash.com"
//           ],
//           fontSrc: ["'self'", ...fontSrcUrls],
//       },
//   })
// );

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => { // middleware: before routes, whatever is in 'success' is available to locals 
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.use('/', usersRoutes);
app.use('/books', booksRoutes);
app.use('/orders', ordersRoutes);
app.use('/pages', pagesRoutes);

app.get('/', (req, res) => {
  res.render('home')
})

app.all('*', (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong!' 
  res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
  console.log('Serving on port 3000')
})