var SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
var SPREAD_SHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREAD_SHEET_ID');
var SKILLS_SHEET = PropertiesService.getScriptProperties().getProperty('SKILLS_SHEET');


var POST_MESSAGE_ENDPOINT = 'https://slack.com/api/chat.postMessage';


function doPost(e) {
  //return ContentService.createTextOutput(JSON.parse(e.postData.contents).challenge);

  var event = JSON.parse(e.postData.contents).event;
  log('POST event: ' + JSON.stringify(event));

  if (event.hasOwnProperty('bot_id')) {
    log('in if statement');
    return;
  } else if (event.text.match(/git/)) {
    log('git');
    sendBackHelpers(event, 'git');
  } else if (event.text.match(/jira/)) {
    sendBackHelpers(event, 'jira');
  } else if (event.text.match(/drag queens/)) {
    sendBackHelpers(event, 'drag queens');
  } else if (event.text.match(/css/)) {
    sendBackHelpers(event, 'css');
  } else if (event.text.match(/DAM/)) {
    sendBackHelpers(event, 'dam');
  }
}


//match based on words coming in, if more than one person has the topic then put in array and randomly select 5 people to send off, 

function sendBackHelpers(event, keyword) {
  var people = findHelpers(keyword);

  log('Send back this ' + keyword, people);

  var payload = {
    token: SLACK_ACCESS_TOKEN,
    channel: event.channel,
    text: 'Here are some people who can help you with ' + keyword.toUpperCase() + '\n' + people + '\n'
  };
  UrlFetchApp.fetch(POST_MESSAGE_ENDPOINT, {
    method: 'post',
    payload: payload
  });

}


function findHelpers(keyword) {
  // look through the spreadsheet and create an object for each with their name, score, best contact 
  // if less than 5 print then print them and if more than five - display 5 

  var skill = keyword.toLowerCase();
  var skillSheet = SpreadsheetApp.openById(SPREAD_SHEET_ID).getSheetByName('Sheet2')
  var data = skillSheet.getDataRange().getValues();
  var top5 = 0
  var people = ''


  for (var i = 0; i < data.length; i++) {
    if (data[i][1] == skill && data[i][2] >= 3.5 && top5 <= 5) { //[1] because column B -> where skills are listed. 

      //if person has skill and has rated higher than push into the array push into array 

      var newPerson = data[i][0] + ' *Slack:* ' + '@' + data[i][3] + '\n';
      people += newPerson;
      top5++;

    }
  }

  log('people' + people)
  return people;

};

function log(text) {
  var sheet = SpreadsheetApp.openById(SPREAD_SHEET_ID).getSheetByName('Sheet1');
  sheet.appendRow([new Date(), text]);
}