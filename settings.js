var settings = {
  elastic: process.env.ELASTICSEARCH_HOST + ":" + process.env.ELASTICSEARCH_PORT,
  _index: process.env.ELASTICSEARCH_INDEX || "entities-prod",
  _type: 'entity',
  port: process.env.PORT || 3001,
}
module.exports = settings;



