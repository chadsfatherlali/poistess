/**
 * Created by chadsfather on 25/9/15.
 */

var express = require('express'),
     swig = require('swig'),
     app = express();

app.set('port', (process.env.PORT || 5000));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/public'));
app.engine('html', swig.renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('view cache', false);

app.post('/', function(request, response) {
     var obj = {
          'min': request.headers.host === 'localhost:5000' ? '' : '.min',
     }

     response.render('pages/index', obj);
});

app.listen(app.get('port'), function() {
     console.log('Node app is running on port', app.get('port'));
});



