import React, { Component } from 'react';
import {
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Container,
  Content,
  Item,
  Input,
  Button,
  Text,
  Form,
  Toast,
  Icon,
  Label,
} from 'native-base';
import styles from './LoginStyle';
import {
  REGISTER_ROUTE,
  FORGOT_ROUTE,
  APP_ROUTE,
  VALIDATION_CODE_ROUTE,
  POSITION_ONBOARDING_ROUTE,
} from '../../constants/routes';
import * as accountActions from './actions';
import accountStore from './AccountStore';
import TouchID from 'react-native-touch-id';
import { I18n } from 'react-i18next';
import { LOG } from '../../shared';
import { CustomToast, Loading } from '../../shared/components';
import { FormView } from '../../shared/platform';
import firebase from 'react-native-firebase';
import { WHITE_MAIN, BLUE_DARK } from '../../shared/colorPalette';
import ValidationCodeScreen from './ValidationCodeScreen';

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  color: '#e00606', // Android,
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: false,
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
};
class LoginScreen extends Component {
  static navigationOptions = { header: null };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      email: props.navigation.getParam('email', ''),
      password: '',
      biometryType: '',
      biometrySupport: true,
      loginAuto: false,
    };
  }

  async componentDidMount() {
    TouchID.isSupported(optionalConfigObject)
      .then((biometryType) => {
        if (biometryType === 'FaceID') {
          console.log('FaceID is supported.');
        } else {
          console.log('TouchID is supported.');
        }
      })
      .catch((error) => {
        this.setState({
          biometrySupport: false,
        });
        console.log('errr catch support ', error);
      });
    const loginAuto = await AsyncStorage.getItem('@JobCoreCredential');
    if (loginAuto) {
      this.setState({
        loginAuto: true,
      });
    } else {
      this.setState({
        loginAuto: false,
      });
    }
    this.loginSubscription = accountStore.subscribe('Login', (user) =>
      this.loginHandler(user),
    );
    this.registerSubscription = accountStore.subscribe('Register', (user) =>
      this.registerHandler(user),
    );
    this.accountStoreError = accountStore.subscribe(
      'AccountStoreError',
      (err) => this.errorHandler(err),
    );
    this.accountStoreError = accountStore.subscribe('ValidationLink', () => {
      // Toast.show({
      //   text: 'You need to validate your email to log in the platform.',
      //   type: 'danger',
      //   duration: 180000,
      //   position: 'top',
      //   buttonText: 'Resend',
      //   onClose: () => {
      //     accountActions.requestSendValidationLink(email);
      //   },
      // });
      CustomToast('JobCore verification code sent! Check your phone.');
    });

    TouchID.isSupported().then((biometryType) => {
      this.setState({ biometryType });
    });
  }

  componentWillUnmount() {
    this.loginSubscription.unsubscribe();
    this.registerSubscription.unsubscribe();
    this.accountStoreError.unsubscribe();
  }

  pressHandler = async () => {
    const value = await AsyncStorage.getItem('@JobCoreCredential');
    TouchID.authenticate('Login', optionalConfigObject)
      .then(async (success) => {
        const dataCredential = JSON.parse(value);
        if (success) {
          if (value) {
            const { email, password } = dataCredential;
            this.loginWithTouchId(email, password);
          }
        }
      })
      .catch((error) => {
        console.log('errorr errr ', error);
        // Alert.alert('Authentication Failed');
      });
  };

  registerHandler = (user) => {
    this.isLoading(false);
    this.setState({
      email: user.email,
      password: '',
    });
  };

  alertSaveCredential = async () => {
    const { email, password } = this.state;
    let credentialUser = {
      email,
      password,
    };
    await AsyncStorage.setItem(
      '@JobCoreCredential',
      JSON.stringify(credentialUser),
    );
    this.props.navigation.navigate(APP_ROUTE);
  };

  loginHandler = async (response: any) => {
    const permissionTouchId = await AsyncStorage.getItem(
      '@JobCoreCredentialPermission',
    );
    let status;
    let token;

    try {
      token = response.token;
      status = response.user.profile.status;
      phoneNumber = response.user.profile.phone_number;
      email = response.user.email;
    } catch (e) {
      return LOG(this, e);
    }

    if (!status || status === 'PENDING_EMAIL_VALIDATION') {
      // const email = this.state.email.toLowerCase().trim();
      // Toast.show({
      //   text: 'You need to validate your email to log in the platform.',
      //   type: 'danger',
      //   duration: 180000,
      //   position: 'top',
      //   buttonText: 'Resend Email',
      //   buttonStyle: { width: 85, height: 60, backgroundColor: '#c3453c' },
      //   buttonTextStyle: { color: WHITE_MAIN, textAlign: 'center' },
      //   onClose: () => {
      //     accountActions.requestSendValidationLink(email);
      //   },
      // });

      // accountActions.requestSendValidationLink(email,phoneNumber);
      this.props.navigation.navigate(VALIDATION_CODE_ROUTE, {
        email: email,
        phone_number: phoneNumber,
      });
      this.isLoading(false);
      // const _storeData = async () => {
      //   try {
      //     await AsyncStorage.setItem('@JobCore:isFirstLogin', true);
      //   } catch (error) {
      //     // Error saving data
      //   }
      // };

      return;
    } else if (status == 'PAUSED') {
      this.props.navigation.navigate(POSITION_ONBOARDING_ROUTE);
      this.isLoading(false);
      return;
    }

    if (token) {
      console.log('token', token);
      this.isLoading(false);
      if (this.state.biometrySupport) {
        if (permissionTouchId) {
          //si el usuario coloco el permiso en true
          if (!this.state.loginAuto) {
            Toast.toastInstance._root.closeToast();
            Alert.alert(
              'JobCore Talent',
              'Activate Touch ID',
              [
                {
                  text: 'No',
                  style: 'cancel',
                  onPress: () => this.props.navigation.navigate(APP_ROUTE),
                },
                { text: 'Accept', onPress: () => this.alertSaveCredential() },
              ],
              { cancelable: false },
            );
          } else {
            this.props.navigation.navigate(APP_ROUTE);
          }
        } else {
          this.props.navigation.navigate(APP_ROUTE);
        }
      } else {
        this.props.navigation.navigate(APP_ROUTE);
      }
    } else {
      this.isLoading(false);
    }
  };

  errorHandler = (err) => {
    this.isLoading(false);
    // CustomToast(err, 'danger');
    this.setState({ error: err });
  };

  render() {
    const { loginAuto, biometrySupport } = this.state;
    // console.log('loginn autoo ',loginAuto)
    // console.log('biometry ', biometrySupport)
    return (
      <I18n>
        {(t) => (
          <Container>
            <Content contentContainerStyle={{ flexGrow: 1 }}>
              <View style={{ flex: 1, backgroundColor: 'white' }}>
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

                {this.state.isLoading ? <Loading /> : null}
                <View
                  style={{
                    paddingTop: 35,
                    paddingLeft: 35,
                    paddingBottom: 35,
                  }}>
                  <Text
                    style={{ fontSize: 24, fontFamily: 'UberMoveText-Light' }}>
                    Please sign in
                  </Text>
                </View>
                {/* <FormView> */}
                <Form>
                  {/* <Item style={styles.viewInput} inlineLabel rounded> */}
                  {/* <Input
                      keyboardType={'email-address'}
                      autoCapitalize={'none'}
                      style={{ color: 'black' }}
                      value={this.state.email}
                      placeholder={t('LOGIN.email')}
                      onChangeText={(text) => this.setState({ email: text })}
                    /> */}
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
                      autoCorrect={false}
                      style={{ fontSize: 20, fontFamily: 'UberMoveText-Light' }}
                      autoCapitalize={'none'}
                      keyboardType={'email-address'}
                      onChangeText={(text) =>
                        this.setState({ email: text, error: null })
                      }
                    />

                    {/* </Item> */}
                  </Item>
                  <Item
                    floatingLabel
                    style={{ marginLeft: 35, marginRight: 35, height: 60 }}>
                    <Label
                      style={{
                        fontFamily: 'UberMoveText-Light',
                        fontSize: 20,
                      }}>
                      Password
                    </Label>
                    <Input
                      clearButtonMode="always"
                      secureTextEntry={true}
                      autoCorrect={false}
                      style={{ fontSize: 20, fontFamily: 'UberMoveText-Light' }}
                      autoCapitalize={'none'}
                      keyboardType={'email-address'}
                      onChangeText={(text) =>
                        this.setState({ password: text, error: null })
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
                  {/* <Item style={styles.viewInput} inlineLabel rounded floatingLabel>
                    <Input
                      
                      autoCapitalize={'none'}
                      value={this.state.password}
                      style={{ color: 'black' }}
                      placeholder={t('LOGIN.password')}
                      onChangeText={(text) => this.setState({ password: text })}
                      secureTextEntry={true}
                    />
                    
                  </Item> */}
                </Form>
                {/* <View>
                  <TouchableOpacity
                    full
                    onPress={this.userForgot.bind(this)}
                    // style={styles.viewButtomSignUp}
                  >
                    <Text style={{ fontFamily:'UberMoveText-Light', paddingLeft: 35, paddingTop: 70, fontSize: 16, color:'#007bff' }}>
                      I forgot my password
                    </Text>
                  </TouchableOpacity>

                </View> */}

                {biometrySupport && loginAuto && (
                  <TouchableOpacity
                    full
                    onPress={() => this.pressHandler()}
                    style={styles.viewButtomSignUp}>
                    <Text style={styles.textButtomForgot}>
                      {t('LOGIN.loginTouch')}{' '}
                      {Platform.OS === 'android'
                        ? 'FingerPrint'
                        : this.state.biometryType}
                    </Text>
                  </TouchableOpacity>
                )}
                {/* <Button
                  full
                  onPress={this.login}
                  style={styles.viewButtomLogin}>
                  <Text style={styles.textButtom}>{t('LOGIN.signIn')}</Text>
                </Button>
                <Button
                  full
                  onPress={this.userRegister.bind(this)}
                  style={styles.viewButtomRegister}>
                  <Text style={styles.textButtomRegister}>
                    {t('LOGIN.signUp')}
                  </Text>
                </Button> */}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 30,
                    paddingTop: 50,
                  }}>
                  <View style={{ justifyContent: 'center' }}>
                    <TouchableOpacity full onPress={this.userForgot.bind(this)}>
                      <Text
                        style={{
                          fontFamily: 'UberMoveText-Light',
                          paddingLeft: 35,
                          fontSize: 16,
                          color: '#007bff',
                          textAlignVertical: 'center',
                        }}>
                        I forgot my password
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginRight: 35 }}>
                    <Button
                      dark
                      onPress={this.login}
                      disabled={!this.state.email || !this.state.password}
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
                {/* <TouchableOpacity
                  full
                  onPress={this.userRegister.bind(this)}
                  style={styles.viewButtomSignUp}>
                  <Text style={styles.textButtomSignUp}>
                    {`${t('LOGIN.dontHaveAnAccount')} `}
                    <Text style={styles.textButtomClick}>
                      {t('LOGIN.clickToSignUp')}
                    </Text>
                  </Text>
                </TouchableOpacity> */}
                {/* </FormView> */}
              </View>
            </Content>
          </Container>
        )}
      </I18n>
    );
  }

  userRegister() {
    this.props.navigation.navigate(REGISTER_ROUTE);
  }

  userForgot() {
    this.props.navigation.navigate(FORGOT_ROUTE);
  }

  login = async () => {
    this.isLoading(true);

    const fcmToken = await firebase.messaging().getToken();

    LOG(this, JSON.stringify(fcmToken));

    accountActions.login(
      this.state.email.toLowerCase().trim(),
      this.state.password,
      fcmToken,
    );
  };

  loginWithTouchId = async (email, password) => {
    this.isLoading(true);

    const fcmToken = await firebase.messaging().getToken();

    LOG(this, JSON.stringify(fcmToken));

    accountActions.login(email.toLowerCase().trim(), password, fcmToken);
  };

  isLoading = (isLoading) => {
    this.setState({ isLoading });
  };
}

export default LoginScreen;
