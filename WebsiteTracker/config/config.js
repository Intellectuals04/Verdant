require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  greenWebAPI: process.env.GREENWEB_API
};
