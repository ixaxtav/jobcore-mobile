import React, { Component } from 'react';
import {
  View,
  // SafeAreaView,
  Image,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
  H1,
  H3,
  H4,
  Container,
  Title,
  Header,
  Right,
  Body,
  Content,
  List,
  Button,
  Left,
  Icon,
  Text,
  FooterTab,
  Footer,
  Input,
  Label,
  Item,
} from 'native-base';
import {
  REGISTER_ROUTE,
  FORGOT_ROUTE,
  APP_ROUTE,
  VALIDATION_CODE_ROUTE,
  JOB_PREFERENCES_ONBOARDING_ROUTE,
  DASHBOARD_ROUTE,
  LOCATION_ONBOARDING_ROUTE,
} from '../../constants/routes';
import * as accountActions from '../Account/actions';
import * as jobActions from '../MyJobs/actions';
import editProfileStyles from '../Account/EditProfileStyle';
import DateTimePicker from '@react-native-community/datetimepicker';

import accountStore from '../Account/AccountStore';
import jobStore from '../MyJobs/JobStore';
import TouchID from 'react-native-touch-id';
import { I18n } from 'react-i18next';
import { i18next } from '../../i18n';
import { LOG } from '../../shared';
import { CustomToast, Loading } from '../../shared/components';
import { FormView } from '../../shared/platform';
import firebase from 'react-native-firebase';
import {
  WHITE_MAIN,
  BLUE_DARK,
  BLUE_MAIN,
  GRAY_LIGHT,
} from '../../shared/colorPalette';
import { ModalHeader } from '../../shared/components/ModalHeader';
import moment from 'moment';
import CustomPickerWhite from '../../shared/components/CustomPickerWhite';
import { TabHeaderWhite } from '../../shared/components/TabHeaderWhite';
import inviteStore from '../Invite/InviteStore';
import * as inviteActions from '../Invite/actions';
import preferencesStyles from '../Invite/JobPreferencesStyle';

class DOBOnboarding extends Component {
  static navigationOptions = { header: null };

  constructor(props) {
    super(props);
    this.state = {
      user: accountStore.getState('Login') || {} || {},

      isLoading: false,
      isRefreshing: false,
      showDatePicker: false,
      userBirthDate: null,
      chosenDate: new Date(),
      _userBirthDate: new Date(2000, 1, 1),
      positionList: inviteStore.getState('GetPositions') || [],
      positions: Object.assign(
        [],
        (inviteStore.getState('GetJobPreferences') || {}).positions,
      ),
    };
  }
  componentDidMount() {
    this.loginSubscription = accountStore.subscribe('Login', (user) => {
      console.log(user);
    });

    this.accountStoreError = accountStore.subscribe(
      'AccountStoreError',
      (err) => this.errorHandler(err),
    );
  }

  componentWillUnmount() {
    this.accountStoreError.unsubscribe();
    this.loginSubscription.unsubscribe();
  }
  setDate(newDate) {
    this.setState({ chosenDate: newDate });
  }

  render() {
    const { _userBirthDate, showDatePicker, isLoading } = this.state;
    console.log('dob state', this.state);
    return (
      <I18n>
        {(t) => (
          <Container>
            <Header
              androidStatusBarColor={'#FFFFFF'}
              style={{
                alignContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                justifyContent: 'center',
                borderBottomWidth: 0,
                paddingBottom: 0,
              }}>
              <Left>
                <Button
                  style={{ marginLeft: 10 }}
                  transparent
                  onPress={() => this.props.navigation.goBack()}>
                  <Icon
                    type="Ionicons"
                    style={{ color: 'black', fontSize: 38 }}
                    name="arrow-back-sharp"
                  />
                </Button>
              </Left>
              <Body style={{ flex: 0 }}>
                <Title></Title>
              </Body>
              <Right></Right>
            </Header>
            <Content>
              <View
                style={{
                  padding: 25,
                }}>
                <H1
                  style={{
                    marginBottom: 15,
                    fontWeight: '700',
                    fontSize: 32,
                    fontFamily: 'UberMoveText-Medium',
                    lineHeight: 45,
                  }}>
                  What is your date of birth?
                </H1>
                <Text
                  style={{
                    fontSize: 18,
                    color: 'gray',
                    fontFamily: 'UberMoveText-Light',
                  }}>
                  You must be at least 18 years old to work shifts on JobCore.
                </Text>
                <View style={{ marginTop: 30 }}>
                  <Item
                    style={editProfileStyles.viewInput}
                    inlineLabel
                    onPress={() => {
                      this.setState({ showDatePicker: !showDatePicker });
                    }}
                    rounded>
                    <Label>Birthday</Label>
                    <Input
                      style={{marginLeft: 40}}
                      keyboardType="numeric"
                      value={moment(_userBirthDate).format('MM-DD-YYYY')}
                      disabled={true}
                      on
                    />
                  </Item>

                  {(showDatePicker || Platform.OS === 'ios') && (
                    <View style={{ marginTop: 20 }}>
                      <Text style={preferencesStyles.sliderLabel}>
                        Select Birthday
                      </Text>
                      <DateTimePicker
                        value={_userBirthDate ? _userBirthDate : new Date()}
                        mode={'date'}
                        display="spinner"
                        minimumDate={new Date(1920, 1, 1)}
                        maximumDate={new Date()}
                        onChange={(_, date) => {
                          this.setState({
                            userBirthDate: moment(date).format('YYYY-MM-DD'),
                            _userBirthDate: date,
                            showDatePicker: false,
                          });
                        }}
                      />
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    color: 'gray',
                    fontFamily: 'UberMoveText-Light',
                    marginTop: 20,
                  }}>
                  Please click on the box above and enter your date of birth.
                </Text>
              </View>
            </Content>
            <Footer
              style={{
                backgroundColor: 'white',
                borderBottomWidth: 0,
                borderTopWidth: 0,
              }}>
              <FooterTab>
                {moment().diff(_userBirthDate, 'years') > 17 ? (
                  <Button
                    style={{ backgroundColor: 'black', borderRadius: 0 }}
                    onPress={() => {
                      accountActions.editStatus(
                        moment(_userBirthDate).format('YYYY-MM-DD'),
                        this.state.user,
                      );
                      this.props.navigation.navigate(DASHBOARD_ROUTE);
                    }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>Next</Text>
                  </Button>
                ) : (
                  <Button full light disabled style={{ borderRadius: 0 }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>
                      To continue, enter a date
                    </Text>
                  </Button>
                )}
              </FooterTab>
            </Footer>
          </Container>
        )}
      </I18n>
    );
  }
}

export default DOBOnboarding;
