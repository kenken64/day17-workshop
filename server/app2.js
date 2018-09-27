var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "children_library",
    connectionLimit: 4
});

const findAllBooks = "SELECT id, title, cover_thumbnail, author_firstname, author_lastname FROM books LIMIT ? OFFSET ?";
const findOneBook = "SELECT * FROM books WHERE id = ?";
const saveOneBook = "UPDATE books SET title = ?, author_firstname = ?, author_lastname = ? WHERE id = ?";
const searchBooksByCriteria = "SELECT * FROM books WHERE (title LIKE ?) || author_firstname LIKE ? || author_lastname LIKE ?";
const searchBookByTitle = "SELECT * FROM books WHERE title LIKE ?";
const searchBookByName = "SELECT * FROM books WHERE author_firstname LIKE ? || author_lastname LIKE ?";

var makeQuery = function (sql, pool) {
    return function (args) {
        var sqlPromise = new Promise((resolve, reject)=>{
            pool.getConnection(function (err, conn) {
                if (err) {
                    reject(err);
                    return;
                }
                conn.query(sql, args || [], function (err, results) {
                    conn.release();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(results);
                });
            });
        })
        
        return defer.promise;
    }
};

var findAll = makeQuery(findAllBooks, pool);
var findOne = makeQuery(findOneBook, pool);
var saveOne = makeQuery(saveOneBook, pool);
var searchBooks = makeQuery(searchBooksByCriteria, pool);
var searchByTitle = makeQuery(searchBookByTitle, pool);
var searchByName = makeQuery(searchBookByName, pool);

app.get("/api/books", function (req, res) {
    console.log(req.query.limit);
    console.log(req.query.offset);
    var limit = parseInt(req.query.limit) || 50;
    var offset = parseInt(req.query.offset) || 0;
    findAll([limit, offset])
        .then(function (results) {
            res.status(200).json(results);
        })
        .catch(function (err) {
            res.status(500).end();
        });
});

app.get("/api/book/:bookId", function (req, res) {
    console.log(req.params.bookId);
    findOne([req.params.bookId])
        .then(function (results) {
            res.status(200).json(results[0]);
        })
        .catch(function (err) {
            res.status(500).end();
        });
});

app.post("/api/book/save", function (req, res) {
    console.log(req.body.params);
    saveOne([req.body.params.title, req.body.params.author_firstname, req.body.params.author_lastname, req.body.params.id])
        .then(function (results) {
            res.status(200).json(results);
            console.log(results);
        })
        .catch(function (err) {
            res.status(500).end();
        });
});

app.get("/api/books/search", function (req, res) {
    console.log(req.query);
    var searchType = req.query.searchType;
    var keyword = req.query.keyword;

    if(typeof searchType === 'string') {
        if(searchType=='Title'){
            console.log('search by title');
            var title = "%" + keyword + "%";
            searchByTitle([title])
                .then(function (results) {
                    res.status(200).json(results);
                    console.log(results);
                })
                .catch(function (err) {
                    console.log(err);
                    res.status(500).end();
                });
        }
        else {
            console.log('search by author');
            var authorName = keyword.split(' ');
            if(!authorName[1]) authorName[1] = authorName[0];
            var firstname = "%" + authorName[0] + "%";
            var lastname = "%" + authorName[1] + "%";
                searchByName([firstname, lastname])
                .then(function (results) {
                    res.status(200).json(results);
                    console.log(results);
                })
                .catch(function (err) {
                    console.log(err);
                    res.status(500).end();
                });
        }
    }
    else {
        console.log('search by both');
        var title = "%" + keyword + "%";
        var authorName = keyword.split(' ');
        if(!authorName[1]) authorName[1] = authorName[0];
        var firstname = "%" + authorName[0] + "%";
        var lastname = "%" + authorName[1] + "%";
        console.log(title);
        console.log(firstname);
        console.log(lastname);
        searchBooks([title, firstname, lastname])
            .then(function (results) {
                res.status(200).json(results);
                console.log(results);
            })
            .catch(function (err) {
                console.log(err);
                res.status(500).end();
            });
    }
});

app.use(express.static(__dirname + "/public"));

app.listen(3000, function () {
    console.info("App server started on port 3000");
});

