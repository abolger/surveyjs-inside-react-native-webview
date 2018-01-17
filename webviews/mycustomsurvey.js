/*
Enable text inputs from SurveyJS with type= 'date' to show a Jquery datepicker widget on click instead of user having to type in a date. 
*/
function enableDatePickerWidget(){
var widget = {
    name: "datepicker",
    htmlTemplate: "<input class='widget-datepicker' type='text' style='width: 100%;'>",
    isFit: function(question) {
        return question.getType() === 'text' && question.inputType === 'date';
    },
    afterRender: function(question, el) {
        var $el;

        $el = $(el).find('.widget-datepicker');

        var widget = $el.datepicker({
            dateFormat: question.dateFormat,
            onSelect: function(dateText) {
                question.value = dateText;
            }
        });
        question.valueChangedCallback = function() {
            widget.datepicker('setDate', new Date(question.value));
        }
        question.valueChangedCallback();
    },
    willUnmount: function(question, el) {

        $(el).find('.widget-datepicker').datepicker("destroy");

    }
}

Survey.CustomWidgetCollection.Instance.addCustomWidget(widget);


}

function loadMySurvey(surveyQuestions, existingSurveyData) {
   
   surveyQuestions.showCompletedPage = false; //No matter what survey was set up, we don't navigate away from the survey widget. 
    enableDatePickerWidget();

    Survey.Survey.cssType = 'bootstrap';
   
    var model = new Survey.Model(surveyQuestions);
    window.survey = model;
    ReactDOM.render(<Survey.Survey model={model} />, document.getElementById('surveyElement'));

    //Load any existing data into survey: 
    if (existingSurveyData){
        window.survey.data = existingSurveyData;
    }
    window.survey.render();
    window.survey.onComplete.add(completeSurvey);   


    
   
}



window.onerror = function(err) {
  if (window.WebViewBridge) {
    window.WebViewBridge.send(JSON.stringify({ error: err.stack || err }));
  } else {
    console.error(err);
  }
}

function webViewBridgeReady(cb) {
  if (window.WebViewBridge) {
    cb(window.WebViewBridge);
    return;
  }

  function handler() {
    document.removeEventListener('WebViewBridge', handler, false);
    cb(window.WebViewBridge);
  }
  document.addEventListener('WebViewBridge', handler, false);
}

function parseFromBridge(message) {
  return JSON.parse(message.replace(/__@@__/g, `'`));
}

webViewBridgeReady(function (webViewBridge) {
  webViewBridge.onMessage = function (msg) {
    const message = parseFromBridge(msg);
    if (message.text) document.getElementById('message').innerText = message.text;

    var response = {};
    if (message.action && message.action==='LOAD') {
        loadMySurvey(message.survey, message.surveydata);
    
    } else if (message.action==='COMPLETESURVEY'){
        completeSurvey(window.survey); //Get latest filled in survey data.
    }
  };
});


function completeSurvey(survey) {
	setTimeout(function() {
      window.WebViewBridge.send(JSON.stringify({ action:'COMPLETESURVEY', surveydata: survey.data }));
    }, 500);
   
}
