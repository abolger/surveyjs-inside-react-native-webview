/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

import surveys from './survey/default_surveys';
import Survey from './survey';


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component<{}> {

  onSurveyCompleted(ownProps, nextProps) {
    //TODO: Readers hooks go here.
    alert("Nested Survey was completed!");
  }


  render() {
    return (
        <Survey
        surveyJSON={surveys.example3PagePatientSatisfactionSurvey}
        title="My Custom Survey Title"
        navigation={this.props.navigation}
        surveyResponseDateString={''}
        onSurveyComplete={this.onSurveyCompleted}
        data={{}}/>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
