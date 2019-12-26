var express = require('express');
var router = express.Router();
var User = require('../models/user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

function errHandler(err) {
  res.json({
    status: "1",
    msg: err.message
  })
}

function saveUser(userDoc,res) {
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
        resolve(doc)
      }
    })
  })
}

router.post('/login',function(req,res,next){
  var param  = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  dataFindOne(User,param).then(
    function(doc){
      if(doc){
        res.cookie("userId",doc.userId,{
          path:'/',
          maxAge: 1000*60*60
        })
        res.cookie("userName",doc.userName,{
          path:'/',
          maxAge: 1000*60*60
        })
        res.json({
          status:'0',
          msg:'',
          result:{
            userName:doc.userName
          }
        })
      }
    }
  )
})

router.post("/logout", function(req,res,next){
  res.cookie("userId",'',{
    path:'/',
    maxAge: -1
  });
  res.json({
    status:'0',
    msg:'',
    result: ''
  })
})

router.get("/checkLogin", function(req,res,next){
  if(req.cookies.userId){
    res.json({
      status: '0',
      msg: '已经登录',
      result:req.cookies.userName
    })
  }else{
    res.json({
      status: '1',
      msg: '未登录',
      result: '',
    })
  }
})

// 查询当前用户的购物车
router.get('/cartList', function(req,res,next){
  let userId = req.cookies.userId;
  dataFindOne(User,{userId:userId}).then(function(doc){
    if(doc){
      res.json({
        status:'0',
        msg:'',
        result:doc.cartList
      })
    }
  })
})

router.post("/cartDel",function(req,res,next){
  let userId = req.cookies.userId;
  let productId = req.body.productId
  User.update({
    userId:userId
  },{
    $pull:{
      'cartList':{
        'productId':productId
      }
    }
  },function(err, doc){
    if(err){
      errHandler(err)
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      })
    }
  })
})


router.post("/cartEdit",function(req,res,next){
  let userId = req.cookies.userId;
  let productId = req.body.productId;
  let productNum = req.body.productNum;
  let checked = req.body.checked;
  User.update({
    "userId":userId,
    "cartList.productId":productId
  },{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked
  },function(err,doc){
    if(err){
      errHandler(err)
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      })
    }
  })
})

router.post("/editCheckAll",function(req,res,next){
  let userId = req.cookies.userId;
  let checkAll = req.body.checkAll?'1':"0";
  dataFindOne(User,{userId:userId}).then(function(doc){
    if(doc){
      doc.cartList.forEach((item)=>{
        item.checked = checkAll
      })
      saveUser(doc,res)
    }
  })
})
module.exports = router;
