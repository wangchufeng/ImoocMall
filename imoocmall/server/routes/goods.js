var express = require("express")
var router = express.Router()
var mongoose = require('mongoose')
var Goods = require('../models/goods')
var User = require('../models/user');

mongoose.connect('mongodb://127.0.0.1:27017/imoocmall')

mongoose.connection.on("connected", function () {
  console.log("MongoDB connected success")
})

mongoose.connection.on("error", function () {
  console.log("MongoDB connected fail")
})

mongoose.connection.on("disconnected", function () {
  console.log("MongoDB disconnected")
})
// 查询商品
router.get("/", function (req, res, next) {
  let sort = parseInt(req.param("sort"));
  let page = parseInt(req.param("page"))
  let pageSize = parseInt(req.param("pageSize"))
  let priceLevel = req.param("priceLevel")
  let skip = (page - 1) * pageSize
  let params = {};
  let priceGt = '';
  let priceLte = '';
  if (priceLevel != 'all') {
    switch (priceLevel) {
      case '0':
        priceGt = 0;
        priceLte = 500;
        break;
      case '1':
        priceGt = 500;
        priceLte = 1000;
        break;
      case '2':
        priceGt = 1000;
        priceLte = 2000;
        break;
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({
    'salePrice': sort
  })
  goodsModel.exec(function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: {
          count: doc.length,
          list: doc
        }
      })
    }
  })
})


// 加入购物车
router.post("/addCart", function (req, res, next) {
  let userID = "100000077";
  let productId = req.body.productId;

  function errHandler(err) {
    res.json({
      status: "1",
      msg: err.message
    })
  }

  function saveUser(userDoc) {
    userDoc.save(function (err2) {
      if (err2) {
        errHandler(err2)
      } else {
        res.json({
          status: '0',
          msg: '',
          result: 'suc'
        })
      }
    })
  }

  let dataFindOne = function (Models, selectField) {
    return new Promise(function (resolve, reject) {
      Models.findOne(selectField, function (err, doc) {
        if (err) {
          errHandler(err);
          reject(err);
        } else {
          console.log(doc)
          resolve(doc)
        }
      })
    })
  }

  dataFindOne(User, {
    userId: userID
  }).then(function (userDoc) {
    let goodsItem = '';
    userDoc.cartList.forEach(function (item) {
      if (item.productId == productId) {
        goodsItem = item;
        item.productNum++;
        saveUser(userDoc)
      }
    })
    if (goodsItem == '') {
      dataFindOne(Goods, {
        productId: productId
      }).then(function (doc) {
        doc.productNum = 1;
        doc.checked = 1;
        userDoc.cartList.push(doc)
        saveUser(userDoc)
      })
    }
  })

})


module.exports = router
