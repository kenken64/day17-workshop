require('dotenv').config()
const express =  require("express"),
      mysql = require("mysql"),
      cors = require('cors'),
      multer = require('multer'),  
      request = require('request'),
      bodyParser = require("body-parser");

var app = express();
app.use(cors());
const NODE_PORT = process.env.PORT;


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/Users/phangty/Projects/day17-workshop/day17-client/server/uploads')
    },
    filename: function (req, file, cb) {
      console.log(JSON.stringify(file));
      var uploadFileTokens = file.originalname.split('.');
      console.log(uploadFileTokens);
      cb(null, uploadFileTokens[0] + '-' + Date.now() + '.'+ uploadFileTokens[uploadFileTokens.length-1])
    },
    fieldSize: 50 * 1024 * 1024
})

var upload = multer({ storage: storage })

const API_URI = "/api";

const sqlFindAllFilms = "SELECT * FROM film";

const sqlFindAllBooks = "SELECT * FROM books WHERE (name LIKE ?) || (author LIKE ?) LIMIT ? OFFSET ?"
const sqlFindOneBook = "SELECT idbooks, name, author, publish_year, isbn FROM books WHERE idbooks=? ";
const sqlFindCityOnWeatherTable = "SELECT city FROM weather where country = ?"

console.log("DB USER : " + process.env.DB_USER);
console.log("DB NAME : " + process.env.DB_NAME);
console.log(__dirname);

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
var findCityOnWeatherTable = makeQuery(sqlFindCityOnWeatherTable, pool);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get(API_URI + "/films", (req, res)=>{
    findAllFilms().then((results)=>{
        console.log();
        let finalResult = [];
        
        results.forEach((element)=>{
            let value  = { title: "", url: ""};
            value.title = element.title;
            value.url = `/films/${element.film_id}`
            finalResult.push(value);
        });
        res.json(finalResult);
    }).catch((error)=>{
        console.log(error);
        res.status(500).json(error);
    });
});

function logging(req, res, next){
    console.log("logging ");
    res.json({message:"value"})
    next();
    
}

function auth(req, res, next){
    console.log("auth ");
    next();
}

app.get(API_URI + "/stories", auth, logging, (req, res, next)=>{
    res.json({});
});

app.post(API_URI + '/upload', upload.single("profilephoto"), (req, res, next)=>{
    res.status(200).json({message: "upload ok!"});
});


app.get(API_URI + "/get-weather", (req, res)=>{
    let countryCode = req.query.country;
    findCityOnWeatherTable([countryCode]).then((results)=>{
        console.log(results);
        //res.json(results);
        let OPENWEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${results[0].city}&APPID=476e23fe1116f4e69d2a3e68672604e1`
        request(OPENWEATHER_API_URL, (error, response, body)=>{
            console.log(body);
            var b = JSON.parse(body);
            res.json(b);
        })
    }).catch((error)=>{
        res.status(500).json(error);
    })
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
        
        let finalCriteriaFromType = ['%', '%' , parseInt(req.query.limit), parseInt(req.query.offset)];
        if(selectionType == 'BT'){
            finalCriteriaFromType = ['%' + keyword + '%', '' ,parseInt(req.query.limit),parseInt(req.query.offset)]
        }

        if(selectionType == 'A'){
            finalCriteriaFromType = ['', '%' +keyword + '%',parseInt(req.query.limit),parseInt(req.query.offset)]
        }

        if(selectionType == 'B'){
            finalCriteriaFromType = ['%' + keyword + '%', '%' +keyword + '%' ,parseInt(req.query.limit),parseInt(req.query.offset)]
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
