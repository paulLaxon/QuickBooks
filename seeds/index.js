const mongoose = require('mongoose');
const Book = require('../models/book');
const Order = require('../models/order');
const Item = require('../models/order_item');
const fs = require('fs');

mongoose.connect('mongodb://localhost:27017/book-orders');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDb = async () => {
  await Book.deleteMany({});

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
        type: 'hard cover'
      });
      process.stdout.write(`Downloading book ${i} of ${books.length}\r`);
      newBook.save();
      i++;
    }
    console.log('\nBook download complete.\n');
  });
  
  await Order.deleteMany({});
  await Item.deleteMany({});
  console.log('\nStarting Orders seed\n');

  const newBooks = await Book.find({});

  for (let i = 0; i < 10; i++) {
    const jMax = Math.floor(Math.random() * 10);
    let items = [];

    for (let j = 0; j < jMax; j++) {
      const randomBookIndex = Math.floor(Math.random() * newBooks.length);
      const price = Math.floor(Math.random() * 20.0 + 10.0);
      const quantity = Math.floor(Math.random() * 10 + 1);
      const item = new Item({
        quantity: quantity,
        vendor: 'Amazon',
        price: price,
        book: newBooks[randomBookIndex]
      });
      item.save();
      items.push(item);
    }

    const order = new Order({
      owner: '613d8e61be26c2e95a7e36b3',
      date: Date.now() - Math.floor(Math.random() * 1000 * 24 * 3600 * 365),
      books: items
    });
    order.save();
  }
  console.log('\nSeed data assigned.');
}

seedDb();
db.close(() => {
  console.log('Mongoose disconnected on app termination');
});