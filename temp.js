router.post("/addCart", function (req, res, next) {
    let userID = "100000077";
    let productId = req.body.productId;
  
    function errHandler(err) {
      res.json({
        status: "1",
        msg: err.message
      })
    }
  
    User.findOne({
      userId: userID
    }, function (err, userDoc) {
      if (err) {
        errHandler(err)
      } else {
        if (userDoc) {
          let goodsItem = '';
          userDoc.cartList.forEach(function (item) {
            if (item.productId == productId) {
              goodsItem = item;
              item.productNum++;
            }
          });
          if (goodsItem) {
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
          } else {
            Goods.findOne({
              productId: productId
            }, function (err1, doc) {
              if (err1) {
                errHandler(err1)
              } else {
                if (doc) {
                  doc.productNum = 1;
                  doc.checked = 1;
                  userDoc.cartList.push(doc)
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
              }
            })
          }
        }
      }
    })
  })