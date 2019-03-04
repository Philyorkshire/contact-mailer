require('dotenv').config();

const sgMail = require('@sendgrid/mail');

var express = require('express');
var cors = require('cors')
var app = express();
var port = process.env.PORT || 8080;

app.use(cors())

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function generateContactFormFromRequestData(requestData) {
  let form = {
    to: 'philyorkshire@philyorkshire.uk',
    from: 'mail@philyorkshire.uk',
    subject: 'Contact Form - Philyorkshire.uk',
    text: `Email: ${requestData.email}\n
            Telephone: ${requestData.telephone}\n
            Name: ${requestData.name}\n\n\n
            Message: ${requestData.message}`
  };

  return form;
}

app.get('/', (request, response) => {
  response.send('Philyorkshire Limited');
});

app.post('/contact', cors(), (request, response) => {
  console.log('Contact Request received');

  if (request.method != 'POST') {
    response.send('Invalid Request');
  }

  let jsonBody = '';

  request.on('data', (data) => {
    jsonBody += data;
  });

  request.on('end', () => {
    var form = generateContactFormFromRequestData(JSON.parse(jsonBody));

    sgMail.send(form).then(() => {
      response.send('complete');
    });
  })
});

app.listen(port, function () {
  console.log('Our app is running on http://localhost:' + port);
});