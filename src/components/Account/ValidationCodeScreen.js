import React, { Component } from 'react';
import {
  View,
  // SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Container,
  Item,
  Input,
  Button,
  Text,
  Form,
  Content,
  Picker,
  Icon,
  CheckBox,
} from 'native-base';
import {
  LOGIN_ROUTE,
  APP_ROUTE,
  JOB_PREFERENCES_ROUTE,
  JOB_PREFERENCES_ONBOARDING_ROUTE,
  VALIDATION_CODE_ROUTE,
  DASHBOARD_ROUTE,
  TERMS_AND_CONDITIONS_ROUTE,
  POSITION_ONBOARDING_ROUTE,
} from '../../constants/routes';
import styles from './RegisterStyle';
import * as actions from './actions';
import store from './AccountStore';
import { I18n } from 'react-i18next';
import { i18next } from '../../i18n';
// import { FormView } from '../../shared/platform';
import { CustomToast, Loading } from '../../shared/components';
import ValidationCodeInput from '../../shared/components/ValidationCodeInput';

import LoginScreen from './LoginScreen';

class ValidationCodeScreen extends Component {
  static navigationOptions = { header: null };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      email: '',
      value: '',
      disableResend: false,
      phoneNumber: this.props.navigation.state.params.phone_number,
      email: this.props.navigation.state.params.email,
    };
  }

  componentDidMount() {
    this.loginSubscription = store.subscribe('Login', (user) =>
      console.log('login', user),
    );
    this.validationlinkSubscription = store.subscribe(
      'ValidationLink',
      (user) => {
        if (user.active) this.validateHandler();
      },
    );
    this.accountStoreError = store.subscribe('AccountStoreError', (err) =>
      this.errorHandler(err),
    );
  }

  componentWillUnmount() {
    this.validationlinkSubscription.unsubscribe();
    this.accountStoreError.unsubscribe();
  }

  validateHandler = () => {
    this.isLoading(false);
    this.props.navigation.navigate(POSITION_ONBOARDING_ROUTE);
  };

  errorHandler = (err) => {
    console.log(err);
    this.isLoading(false);
    this.setState({ value: '' });
    CustomToast(err, 'danger');
  };

  handleChangeValue = (code) => {
    this.setState({ value: code });
  };

  render() {
    const { phoneNumber, email } = this.state;

    return (
      <I18n>
        {(t) => (
          <Container>
            <Content contentContainerStyle={{ flexGrow: 1 }}>
              <View style={{ flex: 1, backgroundColor: 'white' }}>
                {this.state.isLoading ? <Loading /> : null}

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
                    paddingRight: 35,
                  }}>
                  {/* <View style={styles.formContainer}> */}
                  <Text
                    style={{
                      fontSize: 24,
                      fontFamily: 'UberMoveText-Light',
                      marginBottom: 30,
                    }}>
                    {t('VALIDATE_CODE.title') + ' ' + phoneNumber}.
                  </Text>

                  <Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: 'UberMoveText-Light',
                        color: '#007bff',
                      }}>
                      Didn't receive your code?{' '}
                    </Text>
                    {!this.state.disableResend ? (
                      <Text
                        style={styles.resendButtomClick}
                        onPress={this.resend}>
                        {t('VALIDATE_CODE.resend')}
                      </Text>
                    ) : (
                      <Text style={styles.resendButtomClick}>
                        {t('VALIDATE_CODE.sent')}
                      </Text>
                    )}
                  </Text>

                  <ValidationCodeInput
                    value={this.state.value}
                    change={this.handleChangeValue}
                    phoneNumber={phoneNumber}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                    }}>
                    <View style={{ justifyContent: 'flex-end' }}></View>
                    <View style={{ marginRight: 35 }}>
                      <Button
                        dark
                        onPress={this.validate}
                        disabled={this.state.value.length != 6}
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
                </View>
              </View>
            </Content>
          </Container>
        )}
      </I18n>
    );
  }

  validate = () => {
    this.isLoading(true);
    actions.validatePhoneNumber(
      this.state.email,
      this.state.phoneNumber,
      this.state.value,
    );
  };

  resend = () => {
    this.setState({ disableResend: true });
    actions.requestSendValidationLink(this.state.email, this.state.phoneNumber);
  };
  isLoading = (isLoading) => {
    this.setState({ isLoading });
  };
}

export default ValidationCodeScreen;
