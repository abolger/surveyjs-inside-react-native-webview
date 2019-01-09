const React = require('react-native');

const { StyleSheet, Dimensions,Image } = React;

const deviceHeight = Dimensions.get('window').height;


//Note: this is the template for displaying a survey., survey CSS is in webviews folder. 
 
export default {
  content: {
    flex:1,
    backgroundColor: '#FF0000'
  
  },
  webview: {
   flex: 1, // pushes the footer to the end of the screen
   backgroundColor: '#00ff00'
  },
  bottomButton: {

    
  }
}

