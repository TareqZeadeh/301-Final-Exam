const express = require('express');

const cors = require('cors');

const axios = require('axios');

require('dotenv').config();

const server = express();

server.use(cors());

server.use(express.json());
const PORT = process.env.PORT;
const mongoose = require('mongoose');
const { response } = require('express');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });


const flowerSchema = new mongoose.Schema({
    instructions: String,
    photo: String,
    name: String,

});
const userSchema = new mongoose.Schema({
    email: String,
    flowers: [flowerSchema],
});

const userModel = mongoose.model('favflower', userSchema);


const allFlowersHandler = (req, res) => {
    axios
        .get(process.env.API_URL)
        .then(result => {
            res.send(result.data.flowerslist);

        })
        .catch(err => {
            console.log(err);
        })
}

const addFlowerHandler = (req, res) => {
    const { email, fLowerObj } = req.body;
    userModel.findOne({ email: email }, (err, result) => {
        if (err) { console.log(err); }

        else if (!result) {
            const newUser = new userModel({
                email: email,
                flowers: [fLowerObj],
            })
            newUser.save();
        }
        else {
            result.flowers.push(fLowerObj);
            result.save();
        }
    })

}


const userFlowersHandler = (req, res) => {
    const { email } = req.query;
    userModel.findOne({ email: email }, (err, result) => {
        if (err) { console.log(err); }
        else {
            res.send(result.flowers)
        }
    })
}


const deleteFlowerHandler = (req, res) => {
    const { idx } = req.params;
    const { email } = req.query;
    userModel.findOne({ email: email }, (err, result) => {
        if (err) { console.log(err); }
        else {
            result.flowers.splice(idx, 1);
            result.save().then(() => {
                userModel.findOne({ email: email }, (err, result) => {
                    if (err) { console.log(err); }
                    else {
                        res.send(result.flowers)
                    }
                })
            })
        }

    })
}


const updateFlowerHandler =(req,res)=>{
    const { idx } = req.params;
    const { email, fLowerObj } = req.body;
    userModel.findOne({ email: email }, (err, result) => {
        if (err) { console.log(err); }
        else {
            result.flowers[idx]= fLowerObj;
            result.save().then(() => {
                userModel.findOne({ email: email }, (err, result) => {
                    if (err) { console.log(err); }
                    else {
                        res.send(result.flowers)
                    }
                })
            })
        }

    })
}

server.put('/updateFlower/:idx', updateFlowerHandler)
server.delete('/deleteFlower/:idx', deleteFlowerHandler)
server.post('/addFlower', addFlowerHandler)
server.get('/userFlowers', userFlowersHandler);
//http://localhost:3002/allFlowers
server.get('/allFlowers', allFlowersHandler);

server.listen(PORT, () => {
    console.log('listing to ', PORT)
})