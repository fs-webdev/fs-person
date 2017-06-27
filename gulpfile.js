const gulp = require('gulp');
const fs = require('fs');
const glob = require('glob');

gulp.task('build', function(done) {
  glob('locales/*.json', function(err, files) {
    if (err) done(err);

    let langObj = {};

    files.forEach(function(file) {
      const lang = file.substr(file.lastIndexOf('_')+1, 2);

      try {
        const contents = fs.readFileSync(file, 'utf-8');
        langObj[lang] = JSON.parse(contents);
      } catch(e) {
        done(e);
      }
    });

    // console.log(JSON.stringify(langObj,null,2));
    // done();

    fs.readFile('./src/fs-person.html', 'utf-8', function(err, file) {
      if (err) done(err);

      file = file.replace('/* LANG CODE */', JSON.stringify(langObj));

      fs.writeFile('./fs-person.html', file, 'utf-8', done);
    });
  });
});

gulp.task('default', ['build']);