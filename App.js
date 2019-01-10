/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, AsyncStorage } from 'react-native';
import uuid from 'react-native-uuid';
import { Toast, Root } from 'native-base';

import surveys from './src/default_surveys';
import Survey from './src/Survey';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu'
});

// @TODO: add specific types
type State = {
  survey: ?Object,
  error: ?Object
};

export default class App extends Component<{}, State> {
  state: State = {
    survey: null,
    error: null
  };

  async componentDidMount() {
    await this.getSurveyData();
  }

  getSurveyData = async () => {
    const remoteJSON = await fetch(
      'https://surveyjs-data-3cv0xvjbs.now.sh/questions-paged.json',
      {}
    )
      .then(response => response.json())
      .catch(error => {
        throw new Error('Error fetching a survey', error);
      });
    if (remoteJSON) {
      await this.storeData(remoteJSON.data);
    }
  };

  storeData = async survey => {
    try {
      const id = uuid.v1();
      const key = `@Surveys:${id}`;
      await AsyncStorage.setItem(key, JSON.stringify({ ...survey, id }));
      const storedSurvey = await AsyncStorage.getItem(key);
      const surveyJSON = JSON.parse(storedSurvey);
      Toast.show({
        text: `Successfully stored the survey with id ${
          surveyJSON.id
        } and title "${surveyJSON.title}"`,
        buttonText: 'Okay'
      });
      this.setState({ survey: surveyJSON });
    } catch (error) {
      throw new Error('Error storing a survey', error);
    }
  };

  onSurveyCompleted(ownProps, nextProps) {
    //TODO: Readers hooks go here.
    alert('Nested Survey was completed!');
  }

  render() {
    return (
      <Root>
        {this.state.survey ? (
          <Survey
            surveyJSON={this.state.survey}
            title={this.state.survey.title}
            navigation={this.props.navigation}
            surveyResponseDateString={''}
            onSurveyComplete={this.onSurveyCompleted}
            data={{}}
          />
        ) : (
          <Text>Loading survey...</Text>
        )}
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  }
});
