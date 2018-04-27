const fetchFile = require('./lib/fetchFile');
const path = require('path');

var dl = fetchFile();

dl
  .url('http://localhost:4000/notavideo.zip')
  .limit('20M')
  .mimes('application/zip')
  .dirname(path.join(__dirname))
  .filename('any.zip')
  .download()


dl.on('progress', (progress) => {
  console.log(progress.percent.toFixed(2));
});

dl.on('error', (path) => {
  console.log(path);
});

dl.on('error', (err) => {
  console.log(err);
});
