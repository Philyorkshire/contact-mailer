require('dotenv').config();

const sgMail = require('@sendgrid/mail');
var axios = require('axios');
var express = require('express');
var cors = require('cors');
var app = express();
var port = process.env.PORT || 8080;
var listId = process.env.CAMPAIGN_MANAGER_LIST_ID;
var apiKey = process.env.CAMPAIGN_MANAGER_API_KEY;

app.use(cors())

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function generateContactFormFromRequestData(requestData) {
  let form = {
    to: 'contact@averment.digital',
    from: 'mail@philyorkshire.uk',
    subject: 'Contact Form - Averment Website',
    text: `Email: ${requestData.email}\n
            Telephone: ${requestData.telephone}\n
            Name: ${requestData.name}\n\n\n
            Message: ${requestData.message}`
  };

  return form;
}

function generateSubscriberFormFromRequestData(requestData) {
  let form = {
    'ConsentToTrack': 'Yes',
    'EmailAddress': requestData.EmailAddress,
    'Name': requestData.Name,
    'Resubscribe': true,
    'RestartSubscriptionBasedAutoresponders': true,
  };

  return form;
}

app.get('/', (_request, response) => {
  response.send('Averment Digital Limited');
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

app.post('/subscribers', cors(), (request, response) => {
  let jsonBody = '';

  request.on('data', (data) => {
    jsonBody += data;
  });

  request.on('end', async () => {
    const emailSubscriber = generateSubscriberFormFromRequestData(JSON.parse(jsonBody));
    const requestConfig = {
      auth: {
        'username': `${apiKey}`,
        'password': ''
      },
      headers: {
      'Content-Type': 'application/json',
      }
    }  
    
    try {
      const request = await axios.post(`https://api.createsend.com/api/v3.2/subscribers/${listId}.json`, emailSubscriber, requestConfig);

      return response.status(200).json({
        success: true,
        result: request.data
      });
    } catch(err) {
      return response.status(400).json({
        success: false,
        error: 'Sorry, something went wrong.'
      });
    }
  })
});

app.listen(port, function () {
  console.log('Our app is running on http://localhost:' + port);
});
