const mongoose = require('mongoose');
const Book = require('../models/book');
const Order = require('../models/order');
const OrderItem = require('../models/order_item');

const fs = require('fs');

// const dbUrl = process.env.DB_URL;
const dbUrl = 'mongodb://localhost:27017/book-orders';
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
console.log('Seeding db');

const seedDb = async () => {
  await Book.deleteMany({});
  // isbns = 
  //   [
  //     9780399128967, 
  //     9780345296085, 
  //     9780441569595, 
  //     9781845761219, 
  //     9780786965625, 
  //     9780345317988,
  //     9780140065008,
  //     9780385539241,
  //     9780194230698,
  //     9780007119318,
  //     9780855277574,
  //     9780394502946,
  //     9780140008333,
  //     9780772011886,
  //     9780345535528
  //   ]

  fs.readFile('./seeds/nytimesbooks.json', (err, data) => {
    if (err) throw err;
    const books = JSON.parse(data);
    let i = 1;
    for (const book of books) {
      let newBook = new Book({ 
        title: book.title, 
        author: book.author,
        isbn: book.primary_isbn13,
        publisher: book.publisher,
        description: book.description,
        image: book.book_image,
        type: 'hard cover',
        genre: 'fiction',
      });
      process.stdout.write(`Downloading book ${i} of ${books.length}\r`);
      newBook.save();
      i++;
    }
    console.log('\nBook download complete.\n');
  });
  await Order.deleteMany({});
  await OrderItem.deleteMany({});

  console.log('\nStarting Orders seed\n');

  const newBooks = await Book.find({});

  for (let i = 0; i < 10; i++) {
    const jMax = Math.floor(Math.random() * 10);
    let items = [];

    for (let j = 0; j < jMax; j++) {
      const randomBookIndex = Math.floor(Math.random() * newBooks.length);
      const price = Math.floor(Math.random() * 20.0 + 10.0);
      const quantity = Math.floor(Math.random() * 10 + 1);
      const item = new OrderItem({
        quantity: quantity,
        vendor: 'Amazon',
        price: price,
        book: newBooks[randomBookIndex]
      });
      item.save();
      items.push(item);
    }

    const order = new Order({
      owner: '61694f50f02738ea9ae2a519',
      date: Date.now() - Math.floor(Math.random() * 1000 * 24 * 3600 * 365),
      books: items
    });
    order.save();
  }
  console.log('\nSeed data assigned.');
}

seedDb();
