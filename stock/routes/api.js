'use strict';

const bcrypt = require('bcrypt');

const salt = "$2b$10$Da3BXEUbyJWzW0ut/hGhUe";
const hashIpAddr = async (ipAddr) => {
  const hash = await bcrypt.hash(ipAddr, salt);
  return hash;
}

module.exports = function (app, myDataBase) {

  const likeCol = myDataBase.collection('likes');

  const getLikeCount = async (stock) => {
    return await likeCol.countDocuments({
      stock: stock
    });
  };

  const isAlreadyLiked = async (stock, ipAddr) => {
    const hashedIpAddr = await hashIpAddr(ipAddr);
    const count = await likeCol.countDocuments({
      stock: stock,
      hash: hashedIpAddr
    });
    return 0 < count;
  };
  const addLike = async (stock, ipAddr) => {
    const hashedIpAddr = await hashIpAddr(ipAddr);
    const ret = await likeCol.insertOne({
      stock: stock,
      hash: hashedIpAddr
    });
  };

  const getStockInfo = async (ipAddr, stock, likeFlg) => {
    const res = await fetch(`https://stock-price-checker.freecodecamp.rocks/api/stock-prices?stock=${stock}`);
    if (!res.ok) {
      return "error";
    }
    const json = await res.json();
    if (!json.stockData) {
      return "error";
    }
    if (likeFlg) {
      let likedFlg = await isAlreadyLiked(stock, ipAddr);
      if (!likedFlg) {
        await addLike(stock, ipAddr);
      }
    }
    const likeCount = await getLikeCount(stock);
    if (json.stockData.error) {
      return {
        error:"invalid symbol",
        likes: likeCount
      };
    }
    return {
      stock: stock,
      price: json.stockData.price,
      likes: likeCount
    };
  };

  app.route('/api/stock-prices')
    .get(async (req, res) => {
      const stock = req.query.stock
      if (stock === undefined) {
        res.json("error");
        return;
      }
      const ipAddr = req.ip;
      let likeFlg = req.query.like === "true" ? true : false;
      let data;
      if (Array.isArray(stock)) {
        data = [];
        let tmp;
        // 先頭2つだけ実施
        const data1 = await getStockInfo(ipAddr, stock[0], likeFlg);
        const data2 = await getStockInfo(ipAddr, stock[1], likeFlg);
        data.push({
          stock: stock[0],
          price: data1.price,
          rel_likes: data1.likes - data2.likes
        });
        data.push({
          stock: stock[1],
          price: data2.price,
          rel_likes: data2.likes - data1.likes
        })

      } else {
        data = await getStockInfo(ipAddr, stock, likeFlg);
      }

      res.json({
        stockData: data
      });
    });

};
