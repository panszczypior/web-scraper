var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const genCharArray = (startChar, endChar) => {
  const result = [];
  let i = startChar.charCodeAt(0);
  const j = endChar.charCodeAt(0);

  for (; i <= j ;i++) {
    result.push(String.fromCharCode(i));
  }

  return result;
};

const alphabet = genCharArray('a', 'z');

async function createPageFetcher(url) {
  try {
    const response = await fetch(url);
    if (response.status === 200) {
      return await response.text();
    } else if (response.status === 404) {
      throw new Error('Something went wrong');
    }
  } catch (e) {
    // console.log('errorix', e);
  }
};

async function fetchAll(promises) {
  return await Promise.all(promises);
};

router.get('/', function(req, res, next) {

  const phrases = [];
  const promises = [];
  alphabet.forEach(letter => {

      let index = 1;

        for (index; index < 4; index++) {
          const url = `http://slownik-wyrazowobcych.eu/category/${letter}/page/${index}`;
          const response = createPageFetcher(url);
          promises.push(response);
        }
  });

  const responses = fetchAll(promises);
  responses
    .then(values => {
      values.forEach(list => {
          const $ = cheerio.load(list);

          const wordList = $('.post-content');
          wordList.each((index, item) => {
              const self = $(item);
              const title = self.find('.title').text();
              const info = self.find('p').text();
              phrases
                .push({
                  title,
                  info,
                });
          });
      });
      res.json({
        success: 'success',
        phrases,
      })
    });
});

module.exports = router;
