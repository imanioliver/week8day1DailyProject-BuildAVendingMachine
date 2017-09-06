const express   = require("express");
const router    = express.Router();
const Item = require("../models/index").Item;
const Purchase = require("../models/index").Purchase;


function objectIt (a, b, c){
    let obj = {
        status: a,
        message: b,
        data: c
    };
    return obj
}

// GET /api/customer/items - get a list of items

router.get('/api/customer/items', function(req, res){

    Item.findAll({})
    .then(function(data){

        res.send(objectIt("success", "Here are all of the items in the machine", data));
    })
    .catch(function(err){
        res.send(objectIt("fail", "Error", err))
        // res.status(400).send(err)

    })
});

// POST /api/customer/items/:itemId/purchases - purchase an item

router.post('/api/customer/items/:itemId/purchases', function(req, res) {
    let theItemId = req.params.itemId

    Item.findById(theItemId)
    .then(function(item){
        // console.log(item);
        console.log("the cost of this item is: " + item.dataValues.cost );

        if (item.dataValues.quantity <= 0 || item.dataValues.quantity === null){
            // res.status(400).send("Sorry, we no longer have the item that you're looking for in the vending machine.")
            res.send(objectIt("fail", "Sorry, we no longer have the item that you're looking for in the vending machine.", item))
        } else if (req.body.moneyGiven < item.dataValues.cost) {
            // res.send(objectIt("fail", '"Sorry, you need " + (item.dataValues.cost - req.body.moneyGiven) + " more cents to purchase this item"',  ))
             res.status(402).send("Sorry, you need " + (item.dataValues.cost - req.body.moneyGiven) + " more cents to purchase this item", objectIt("fail", "see message above", item))
        }

        else if (req.body.moneyGiven >= item.dataValues.cost) {
            Purchase.create({
                itemId: theItemId,
                moneyGiven: req.body.moneyGiven,
                moneyRequired: item.dataValues.cost,
                changeTendered: req.body.moneyGiven - item.dataValues.cost
            })
            .then(function(success){
                Item.update({quantity: item.dataValues.quantity-1
                }, {
                    where: {
                        id : theItemId,
                    }
                })
                .then(function(data){
                    // res.json(status:"success", data: data)

                    res.send(objectIt("success", data))
                    // res.status(201).send("You have successfully purchased your item. Your change is " + (req.body.moneyGiven - item.dataValues.cost) + " cents")
                })
            })
        }
        else{
            res.status(400).send("please be sure to input values for moneyGiven")
        }
        // console.log(item.dataValues.quantity);
    })
    // .catch(function(err){
    //
    // })
    .catch(function(err){
        // res.status(400).send("Sorry, we don't have the item that you're looking for in the vending machine")
        res.send(objectIt("fail", "Sorry, we don't have the item that you're looking for in the vending machine", err))
    })
});

// GET /api/vendor/purchases - get a list of all purchases with their item and date/time
router.get('/api/vendor/purchases', function(req, res){
    Purchase.findAll({
    })
    .then(function(data){
        console.log(data);
        res.status(200).send(data)
    })
})

// GET /api/vendor/money - get a total amount of money accepted by the machine

router.get('/api/vendor/money', function(req, res){
    Purchase.sum('moneyRequired')
    .then(function(sum){
        console.log(sum);
        // res.status(200).send("The vending machine contains " + sum + " cents total.")
        res.send(objectIt("success", sum))
    })
});

// POST /api/vendor/items - add a new item not previously existing in the machine

router.post('/api/vendor/items', function(req, res){
    console.log(req.body);
    Item.create({
        description: req.body.description,
        cost: req.body.cost,
        quantity: req.body.quantity
    })
    .then(function(data) {
        res.status(201).send("you have added \"" + req.body.quantity + " " + req.body.description + "s\" to the vending machine!")
    })

});

// PUT /api/vendor/items/:itemId - update item quantity, description, and cost

router.put('/api/vendor/items/:itemId', function(req, res){
    let theCurrentId = req.params.itemId;

    Item.update({
        description: req.body.description,
        cost: req.body.cost,
        quantity: req.body.quantity
    },
    {
        where: {
            id: theCurrentId,
        }
    }
    )
    .then(function(data){
        console.log(data);
        res.status(201).json(data)

    })


})

module.exports = router;
