const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const genCharArray = (startChar, endChar) => {
  const result = [];
  let i = startChar.charCodeAt(0);
  const j = endChar.charCodeAt(0);

  while (i <= j) {
    result.push(String.fromCharCode(i));
    i++;
  }

  return result;
};

const alphabet = genCharArray('a', 'z');

const createPageFetcher =  async (url) => {
  try {
    const response = await fetch(url);
    if (response.status === 200) {
      return await response.text();
    } else if (response.status === 404) {
      throw new Error('Something went wrong');
    }
  } catch (e) {
    console.log('errorix', e);
  }
};

router.get('/', function(req, res, next) {

  const phrases = [];
  const promises = [];
  alphabet.forEach(letter => {

      let index = 1;

        for (index; index < 2; index++) {
          const url = `http://slownik-wyrazowobcych.eu/category/${letter}/page/${index}`;
          const response = createPageFetcher(url);
          promises.push(response);
        }
  });

  const responses = Promise.all(promises);
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
