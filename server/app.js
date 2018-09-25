//require('dotenv').config()
const express =  require("express"),
      mysql = require("mysql"),
      path = require('path'),
      cors = require('cors'),
      bodyParser = require("body-parser");

var app = express();
app.use(cors({

}));
const NODE_PORT = process.env.PORT;

const API_URI = "/api";

const sqlFindAllFilms = "SELECT * FROM film";

const sqlFindAllBooks = "SELECT * FROM books WHERE (name LIKE ?) || (author LIKE ?) LIMIT ? OFFSET ?"
const sqlFindOneBook = "SELECT idbooks, name, author, publish_year, isbn FROM books WHERE idbooks=? ";
console.log("DB USER : " + process.env.DB_USER);
console.log("DB NAME : " + process.env.DB_NAME);
//app.use(express.static(path.join(__dirname, "dist" , "day17-client")));
//app.use(express.static(__dirname + "../dist/day17-client"));
console.log(__dirname);
app.use(express.static(__dirname + "/../dist/day17-client"))

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT,
    debug: true
})

var makeQuery = (sql, pool)=>{
    console.log(sql);
    
    return  (args)=>{
        let queryPromsie = new Promise((resolve, reject)=>{
            pool.getConnection((err, connection)=>{
                if(err){
                    reject(err);
                    return;
                }
                console.log(args);
                
                connection.query(sql, args || [], (err, results)=>{
                    connection.release();
                    if(err){
                        reject(err);
                        return;
                    }
                    console.log(">>> "+ results);
                    resolve(results); 
                })
            });
        });
        return queryPromsie;
    }
}

var findAllFilms = makeQuery(sqlFindAllFilms, pool);
var findOneBookById = makeQuery(sqlFindOneBook, pool);
var findAllBooks = makeQuery(sqlFindAllBooks, pool);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get(API_URI + "/films", (req, res)=>{
    findAllFilms().then((results)=>{
        res.json(results);
    }).catch((error)=>{
        console.log(error);
        res.status(500).json(error);
    });
});


app.get(API_URI +  "/books/:bookId", (req, res)=>{
    console.log("/books params !");
    let bookId = req.params.bookId;
    console.log(bookId);
    findOneBookById([parseInt(bookId)]).then((results)=>{
        console.log(results);
        res.json(results);
    }).catch((error)=>{
        res.status(500).json(error);
    })
    
})

app.get(API_URI + "/books", (req, res)=>{
    console.log("/books query !");
    var bookId = req.query.bookId;
    console.log(bookId);
    
    if(typeof(bookId) === 'undefined' ){
        console.log(req.query);
        console.log(">>>" + bookId);
        var keyword = req.query.keyword;
        var selectionType = req.query.selectionType;
        console.log(keyword);
        console.log(selectionType);
        let finalCriteriaFromType = ['', '' ,parseInt(req.query.limit),parseInt(req.query.offset)];
        if(selectionType == 'BT'){
            finalCriteriaFromType = [keyword, '' ,parseInt(req.query.limit),parseInt(req.query.offset)]
        }

        if(selectionType == 'A'){
            finalCriteriaFromType = ['', keyword ,parseInt(req.query.limit),parseInt(req.query.offset)]
        }

        if(selectionType == 'B'){
            finalCriteriaFromType = [keyword, keyword ,parseInt(req.query.limit),parseInt(req.query.offset)]
        }
        
        findAllBooks(finalCriteriaFromType)
        .then((results)=>{
            console.log(results);
            res.json(results);
        }).catch((error)=>{
            res.status(500).json(error);
        });
    }else{
        findOneBookById([parseInt(bookId)]).then((results)=>{
            console.log(results);
            res.json(results);
        }).catch((error)=>{
            res.status(500).json(error);
        });
    }
    
})

app.listen(NODE_PORT, ()=>{
    console.log(`Listening to server at ${NODE_PORT}`)
})
