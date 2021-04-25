'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const method_override = require('method-override');
const cors = require('cors');
app.use(method_override('_method'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 5000;

app.get('/home', (req, res) => {
    let url = 'http://hp-api.herokuapp.com/api/characters';
    superagent.get(url)
        .then(result => {
            // console.log(result.body)
            let data = result.body.map(function (data) {
                return new Char(data);
            });
            res.render('home', { data: data });
        })
        .catch(err => {
            res.render('err', { err: err });
        });
});

app.get('/details/:id', (req, res) => {
    let sql = 'select * from charapp where id=$1';
    let safeVal = [req.params.id];
    client.query(sql, safeVal)
        .then(result => {
            res.render('detailsOfChar', { data: result.rows[0] });
        })
        .catch(err => {
            res.render('err', { err: err });
        });
});


app.post('/addtofav', (req, res) => {
    let SQL = 'insert into charapp (name,house,patronus,isAlive) values ($1,$2,$3,$4) returning *;';
    let { name, house, patronus, isAlive } = req.body;
    let safeVals = [name, house, patronus, isAlive];
    client.query(SQL, safeVals)
        .then(result => {
            // res.redirect(`/details/${result.rows.id}`);
            res.render('favChar', { data: result.rows });
        })
        .catch(err => {
            res.render('err', { err: err });
        });
});




app.get('/char/myfavchar', (req, res) => {
    let sql = 'select * from charapp;';
    client.query(sql)
        .then(result => {
            res.render('favChar', { data: result.rows });
        })
        .catch(err => {
            res.render('err', { err: err });
        });
});

app.put('/update/:id', (req, res) => {
    let sql = 'update charapp set name=$1, house=$2, patronus=$3, isAlive=$4 where id = $5;';
    let { name, house, patronus, isAlive } = req.body;
    let safeVals = [name, house, patronus, isAlive, req.params.id];
    console.log(req.body);
    client.query(sql, safeVals)
        .then(result => {
            res.redirect(`/details/${req.params.id}`);
        })
        .catch(err => {
            res.render('err', { err: err });
        });

});

app.delete('/delete/:id', (req, res) => {
    let sql = 'delete from charapp where id=$1;';
    let safeVal = [req.params.id];
    console.log(safeVal);
    client.query(sql, safeVal)
        .then(result => {
            console.log(result.rows.id);
            res.redirect('/char/myfavchar');
        })
        .catch(err => {
            res.render('err', { err: err });
        });
});

app.get('/showForm', (req, res) => {
    res.render('createChar');
});


app.post('/addchar', (req, res) => {
    // console.log(req.query)
    let sql = 'insert into charapp (name,house,patronus,isalive,createdby) values ($1,$2,$3,$4,$5) returning *;';
    let { name, house, patronus, isalive, createdby } = req.body;

    let safeVals = [name, house, patronus, isalive, createdby];
    client.query(sql, safeVals)
        .then(result => {
            res.redirect('/char/myfavchar');
        })
        .catch(err => {
            res.render('err', { err: err });
        });

});

function Char(char) {
    this.namec = char.name;
    this.house = char.house;
    this.patronus = char.patronus;
    this.isAlive = char.alive;
}

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`UP TO PORT ${PORT}`);
        });
    });
