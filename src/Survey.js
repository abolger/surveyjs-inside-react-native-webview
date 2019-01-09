import React, { Component } from 'react';
import { Dimensions, AsyncStorage } from 'react-native';
import WebViewBridge from 'react-native-webview-bridge';
import {
  StyleProvider,
  Container,
  Text,
  Button,
  Footer,
  Toast
} from 'native-base';
import { SourceCode } from 'NativeModules';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import uuid from 'react-native-uuid';

function prepareForBridge(message) {
  //Replaces the singlequote character with symbol we can fix on the other side.
  return JSON.stringify(message).replace(/'/g, '__@@__');
}

//Android/iOS specific file loading our html assets:
let VIEW;
const scriptURL = SourceCode.scriptURL;
if (scriptURL.indexOf('file://') > -1) {
  const _bundleSourcePath = scriptURL.substring(
    7,
    scriptURL.lastIndexOf('/') + 1
  );
  const name = require('./prodViewUri');
  const fileURI = `${_bundleSourcePath}${name}`;
  VIEW = { uri: fileURI };
} else {
  VIEW = require('../webviews/surveyIndex.html');
}

export default class Survey extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    actions: PropTypes.object,
    data: PropTypes.object.isRequired,
    errorMessage: PropTypes.string,
    surveyJSON: PropTypes.object.isRequired,
    title: PropTypes.string,
    onSurveyComplete: PropTypes.func,
    surveyResponseDateString: PropTypes.string.isRequired //Pass in existing response data if you want survey to show existing data.
  };

  constructor(props) {
    super(props);
    this.onLoad = this.onLoad.bind(this);
  }

  onLoad() {
    //Replace \n with <br/> to keep survey library happy:
    var surveyString1 = JSON.stringify(this.props.surveyJSON)
      .split('\\n')
      .join('<br/>');
    var surveyObj = JSON.parse(surveyString1);

    //Load response data for specified survey date if it exists:
    var surveyResponseObj = this.getResponseForDate(
      this.props.surveyResponseDateString
    );

    setTimeout(
      () =>
        this.refs.webviewbridge.sendToBridge(
          prepareForBridge({
            action: 'LOAD',
            survey: surveyObj,
            surveydata: surveyResponseObj
          })
        ),
      500
    );
  }

  onBridgeMessage = async msg => {
    const message = JSON.parse(msg);

    if (message.action && message.action === 'COMPLETESURVEY') {
      var singleSurveyMap = {};
      singleSurveyMap[this.props.title] = [message.surveydata];
      message.surveydata.CompletionDate = moment().toISOString();

      if (!message.surveydata.DataDate) {
        message.surveydata.DataDate = message.surveydata.CompletionDate;
      }
      try {
        const id = uuid.v1();

        // TODO: use optional chaining propsal to check for nulls
        const key = `@Responses:${id}${(message.surveydata &&
          message.surveydata.email) ||
          ''}`;
        await AsyncStorage.setItem(
          key,
          JSON.stringify({ ...message.surveydata, id })
        );
        const storedResponses = await AsyncStorage.getItem(key);

        if (storedResponses) {
          const responsesJSON = JSON.parse(storedResponses);
          Toast.show({
            text: `Successfully stored responsn with id ${
              responsesJSON.id
            } and user email ${responsesJSON.email}`,
            buttonText: 'Okay'
          });
        }
      } catch (error) {
        throw new Error('Error storing responses', error);
      }
      //TODO: Exercise left to the reader :)
    }
  };

  //Get saved survey response from user data if it exists already and survey versions are the same.
  getResponseForDate(dateString) {
    //TODO: If you want the survey to start auto filled out, a SurveyJS JSON response can be placed here.

    return {};
  }

  render() {
    const { height: screenHeight } = Dimensions.get('window');

    return (
      <WebViewBridge
        ref="webviewbridge"
        style={{ flex: 1, height: 500, justifyContent: 'center' }}
        source={VIEW}
        scalesPageToFit={false}
        scrollEnabled
        javaScriptEnabled
        onLoad={this.onLoad}
        onBridgeMessage={this.onBridgeMessage}
      />
    );
  }
}
