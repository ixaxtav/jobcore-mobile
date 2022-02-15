import React, { Component } from 'react';
import { View, TouchableOpacity, Image, Linking } from 'react-native';
import {
  Container,
  Item,
  Input,
  Button,
  Text,
  Form,
  Icon,
  Label,
  Content,
} from 'native-base';
import styles from './ForgotStyle';
import * as accountActions from './actions';
import accountStore from './AccountStore';
import { I18n } from 'react-i18next';
import { i18next } from '../../i18n';
import { CustomToast, Loading } from '../../shared/components';
import { FormView } from '../../shared/platform';
import { BLACK_MAIN } from '../../shared/colorPalette';
import { REGISTER_ROUTE } from '../../constants/routes';
class ForgotScreen extends Component {
  static navigationOptions = { header: null };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      email: props.navigation.getParam('email', ''),
    };
  }

  componentDidMount() {
    this.passwordResetSubscription = accountStore.subscribe(
      'PasswordReset',
      (data) => this.passwordResetHandler(data),
    );
    this.accountStoreError = accountStore.subscribe(
      'AccountStoreError',
      (err) => this.errorHandler(err),
    );
  }

  componentWillUnmount() {
    this.passwordResetSubscription.unsubscribe();
    this.accountStoreError.unsubscribe();
  }

  passwordResetHandler = () => {
    this.isLoading(false);
    CustomToast(i18next.t('FORGOT.emailResetPassword'));
    this.props.navigation.goBack();
  };

  errorHandler = (err) => {
    this.isLoading(false);
    this.setState({ error: err });
    // CustomToast(err, 'danger');
  };
  userRegister() {
    this.props.navigation.navigate(REGISTER_ROUTE);
  }
  render() {
    return (
      <I18n>
        {(t) => (
          <Container>
            <Content contentContainerStyle={{ flexGrow: 1 }}>
              <View style={{ flex: 1, backgroundColor: 'white' }}>
                {this.state.isLoading ? <Loading /> : null}

                {/* <Image
                style={styles.viewBackground}
                source={require('../../assets/image/bg.jpg')}
              /> */}
                {/* <Image
                  style={styles.viewLogo}
                  source={require('../../assets/image/logo1.png')}
                /> */}
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}>
                  <Icon
                    type="Ionicons"
                    style={{
                      color: 'black',
                      fontSize: 38,
                      paddingRight: 35,
                      paddingLeft: 32,
                      paddingTop: 15,
                    }}
                    name="arrow-back-sharp"
                  />
                </TouchableOpacity>

                <View
                  style={{
                    paddingTop: 35,
                    paddingLeft: 35,
                    paddingBottom: 35,
                  }}>
                  <Text
                    style={{ fontSize: 24, fontFamily: 'UberMoveText-Light' }}>
                    Forgot Password
                  </Text>
                </View>
                {/* <FormView> */}
                <Form>
                  {/* <Item style={styles.viewInput} rounded inlineLabel>
                    <Input
                      keyboardType={'email-address'}
                      autoCapitalize={'none'}
                      value={this.state.email}
                      style={{ color: 'black' }}
                      placeholder={t('FORGOT.email')}
                      onChangeText={(text) => this.setState({ email: text })}
                    />
                  </Item> */}
                  <Item
                    floatingLabel
                    style={{ marginLeft: 35, marginRight: 35, height: 60 }}>
                    <Label
                      style={{
                        fontFamily: 'UberMoveText-Light',
                        fontSize: 20,
                      }}>
                      Email address
                    </Label>
                    <Input
                      autoFocus={true}
                      clearButtonMode="always"
                      value={this.state.email}
                      autoCorrect={false}
                      style={{ fontSize: 20 }}
                      autoCapitalize={'none'}
                      keyboardType={'email-address'}
                      onChangeText={(text) =>
                        this.setState({ email: text, error: null })
                      }
                    />

                    {/* </Item> */}
                  </Item>
                  {this.state.error && (
                    <Text
                      style={{
                        color: 'red',
                        paddingLeft: 35,
                        paddingTop: 15,
                        paddingRight: 35,
                      }}>
                      {this.state.error + '. Please try again.'}
                    </Text>
                  )}
                </Form>
                {/* <Button
                  full
                  onPress={() => this.passwordReset()}
                  style={styles.viewButtomLogin}>
                  <Text style={styles.textButtom}>
                    {t('FORGOT.sendInstructions')}
                  </Text>
                </Button> */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 30,
                    paddingTop: 50,
                  }}>
                  <View style={{ marginVertical: 'auto', paddingLeft: 35 }}>
                    <Text
                      style={{
                        fontFamily: 'UberMoveText-Light',
                        paddingBottom: 15,
                      }}>
                      {'Don\'t have an account ?'}
                      <Text
                        style={{
                          fontFamily: 'UberMoveText-Light',
                          color: '#007bff',
                        }}
                        onPress={this.userRegister.bind(this)}>
                        {' ' + 'Sign up'}
                      </Text>
                    </Text>
                    <Text style={{ fontFamily: 'UberMoveText-Light' }}>
                      Having trouble ?
                      <Text
                        style={{
                          fontFamily: 'UberMoveText-Light',
                          color: '#007bff',
                        }}
                        onPress={() => {
                          Linking.openURL('https://jobcore.co/contact');
                        }}>
                        {' ' + 'Get Help'}
                      </Text>
                    </Text>
                  </View>
                  <View style={{ marginRight: 35 }}>
                    <Button
                      dark
                      onPress={() => this.passwordReset()}
                      disabled={!this.state.email}
                      style={{ borderRadius: 0, height: 60 }}>
                      {/* <Text style={styles.textButtom}>{t('LOGIN.signUp')}</Text> */}
                      <Icon
                        type="Ionicons"
                        color="#ff0000"
                        style={{ fontSize: 32 }}
                        name="arrow-forward-sharp"
                      />
                    </Button>
                  </View>
                </View>
                {/* <Button
                  full
                  onPress={() => this.props.navigation.goBack()}
                  style={styles.viewButtomSignUp}>
                  <Text style={styles.textButtomSignUp}>
                    {t('REGISTER.goBack')}
                  </Text>
                </Button> */}
                {/* </FormView> */}
              </View>
            </Content>
          </Container>
        )}
      </I18n>
    );
  }

  passwordReset = () => {
    this.isLoading(true);
    accountActions.passwordReset(this.state.email.toLowerCase().trim());
  };

  isLoading = (isLoading) => {
    this.setState({ isLoading });
  };
}
export default ForgotScreen;
