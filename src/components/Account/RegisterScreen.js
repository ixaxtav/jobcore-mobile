import React, { Component } from 'react';
import {
  View,
  // SafeAreaView,
  Image,
  Linking,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Container,
  Item,
  Input,
  Button,
  Text,
  Label,
  Form,
  Content,
  Picker,
  Icon,
  CheckBox,
} from 'native-base';
import {
  LOGIN_ROUTE,
  TERMS_AND_CONDITIONS_ROUTE,
  SIGNIN_ROUTE,
} from '../../constants/routes';
import {
  BLACK_MAIN,
  BLUE_MAIN,
  BLUE_DARK,
  WHITE_MAIN,
} from '../../shared/colorPalette';

import styles from './RegisterStyle';
import * as actions from './actions';
import store from './AccountStore';
import { I18n } from 'react-i18next';
import { i18next } from '../../i18n';
import { FormView } from '../../shared/platform';
import { CustomToast, Loading, CenteredText } from '../../shared/components';
import { GOOGLE_API_KEY } from 'react-native-dotenv';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

class RegisterScreen extends Component {
  static navigationOptions = { header: null };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showPlacesList: false,
      email: '',
      password: '',
      firstName: '',
      phoneNumber: '',
      lastName: '',
      wroteCity: '',
      cities: [],
      city: 'others',
      profile_city: 'others',
      isRegisterOpen: true,
      passwordHelp: false,
      acceptTerms: store.getState('TermsAndCondition'),
    };
  }

  componentDidMount() {
    this.registerSubscription = store.subscribe('Register', (user) =>
      this.registerHandler(user),
    );
    this.getCitiesSubscription = store.subscribe('GetCities', (cities) =>
      this.setState({ cities }),
    );
    this.accountStoreError = store.subscribe('AccountStoreError', (err) =>
      this.errorHandler(err),
    );
    this.editTermsAndConditionsSubscription = store.subscribe(
      'TermsAndCondition',
      (bool) => {
        this.setState({ acceptTerms: bool });
      },
    );
    actions.getCities();
  }

  componentWillUnmount() {
    this.registerSubscription.unsubscribe();
    this.accountStoreError.unsubscribe();
    this.getCitiesSubscription.unsubscribe();
    this.editTermsAndConditionsSubscription.unsubscribe();
  }

  registerHandler = () => {
    this.isLoading(false);
    this.props.navigation.navigate(SIGNIN_ROUTE);
    CustomToast(i18next.t('REGISTER.youHaveRegistered'));
  };

  errorHandler = (err) => {
    this.isLoading(false);
    CustomToast(err, 'danger');
    this.setState({ error: err });
  };

  render() {
    const { cities, city, acceptTerms } = this.state;
    return (
      <I18n>
        {(t) => (
          <Container>
            <Content
              contentContainerStyle={{
                flexGrow: 1,
                backgroundColor: 'transparent',
                paddingRight: 15,
                paddingLeft: 15,
              }}>
              <View style={{ flex: 1, backgroundColor: 'white' }}>
                {this.state.isLoading ? <Loading /> : null}
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}>
                  <Icon
                    type="Ionicons"
                    style={{
                      color: 'black',
                      fontSize: 38,

                      paddingTop: 15,
                    }}
                    name="arrow-back-sharp"
                  />
                </TouchableOpacity>
                {/* <Image
                style={styles.viewBackground}
                source={require('../../assets/image/bg.jpg')}
              /> */}
                {/* <Image
                  style={styles.viewLogo}
                  source={require('../../assets/image/logo1.png')}
                /> */}
                <View
                  style={{
                    paddingTop: 35,
                    paddingLeft: 15,
                  }}>
                  <Text
                    style={{ fontSize: 26, fontFamily: 'UberMoveText-Light' }}>
                    {'Let\'s start by creating your account'}
                  </Text>
                </View>
                <View>
                  <Form>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                      }}>
                      <View style={{ flex: 1 }}>
                        <Item floatingLabel style={{ height: 60 }}>
                          <Label
                            style={{
                              fontFamily: 'UberMoveText-Light',
                              fontSize: 20,
                            }}>
                            {t('REGISTER.firstName')}
                          </Label>
                          <Input
                            clearButtonMode="always"
                            autoCorrect={false}
                            style={{
                              fontFamily: 'UberMoveText-Light',
                              fontSize: 20,
                            }}
                            value={this.state.firstName}
                            onChangeText={(text) =>
                              this.setState({ firstName: text, error: null })
                            }
                          />
                        </Item>
                        {this.state.error === 'Enter your first name' && (
                          <Text
                            style={{
                              color: 'red',
                              fontFamily: 'UberMoveText-Light',
                              paddingLeft: 15,
                            }}>
                            {this.state.error}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Item floatingLabel style={{ height: 60 }}>
                          <Label
                            style={{
                              fontFamily: 'UberMoveText-Light',
                              fontSize: 20,
                            }}>
                            {t('REGISTER.lastName')}
                          </Label>
                          <Input
                            clearButtonMode="always"
                            autoCorrect={false}
                            style={{
                              fontFamily: 'UberMoveText-Light',
                              fontSize: 20,
                            }}
                            value={this.state.lastName}
                            onChangeText={(text) =>
                              this.setState({ lastName: text, error: null })
                            }
                          />
                        </Item>
                        {this.state.error === 'Enter your last name' && (
                          <Text
                            style={{
                              color: 'red',
                              fontFamily: 'UberMoveText-Light',
                              paddingLeft: 15,
                            }}>
                            {this.state.error}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Item floatingLabel style={{ height: 60 }}>
                      <Label
                        style={{
                          fontFamily: 'UberMoveText-Light',
                          fontSize: 20,
                        }}>
                        {t('REGISTER.email')}
                      </Label>
                      <Input
                        autoCapitalize={'none'}
                        keyboardType={'email-address'}
                        clearButtonMode="always"
                        autoCorrect={false}
                        style={{
                          fontFamily: 'UberMoveText-Light',
                          fontSize: 20,
                        }}
                        value={this.state.email}
                        onChangeText={(text) =>
                          this.setState({ email: text, error: null })
                        }
                      />
                    </Item>
                    {this.state.error === 'This email already exist.' && (
                      <Text
                        style={{
                          color: 'red',
                          fontFamily: 'UberMoveText-Light',
                          paddingLeft: 15,
                        }}>
                        {this.state.error}
                      </Text>
                    )}

                    <Item floatingLabel style={{ height: 60 }}>
                      <Label
                        style={{
                          fontFamily: 'UberMoveText-Light',
                          fontSize: 20,
                        }}>
                        {t('REGISTER.phoneNumber')}
                      </Label>
                      <Input
                        autoCapitalize={'none'}
                        keyboardType={'number-pad'}
                        clearButtonMode="always"
                        maxLength={11}
                        autoCorrect={false}
                        style={{
                          fontSize: 20,
                          fontFamily: 'UberMoveText-Light',
                        }}
                        value={this.state.phoneNumber}
                        onChangeText={(text) =>
                          this.setState({ phoneNumber: text, error: null })
                        }
                      />
                    </Item>
                    <Item
                      floatingLabel
                      style={{ height: 60, marginBottom: 15 }}>
                      <Label
                        style={{
                          fontFamily: 'UberMoveText-Light',
                          fontSize: 20,
                        }}>
                        {t('REGISTER.password')}
                      </Label>
                      <Icon
                        type="FontAwesome"
                        style={{
                          color: 'black',
                          fontSize: 18,
                        }}
                        onPress={() =>
                          this.setState({
                            passwordHelp: !this.state.passwordHelp,
                          })
                        }
                        name="question-circle"
                      />
                      <Input
                        autoCapitalize={'none'}
                        clearButtonMode="always"
                        autoCorrect={false}
                        style={{
                          fontSize: 20,
                          fontFamily: 'UberMoveText-Light',
                        }}
                        secureTextEntry={true}
                        value={this.state.password}
                        onChangeText={(text) =>
                          this.setState({ password: text, error: null })
                        }
                      />
                    </Item>
                    {this.state.passwordHelp && (
                      <Item style={{ borderBottomWidth: 0 }}>
                        <Text
                          style={{
                            fontFamily: 'UberMoveText-Light',
                            fontSize: 14,
                            color: 'gray',
                          }}>
                          - Your password must be greater than 8 characters.
                          {'\n'}- At least 1 of the following: uppercase,
                          lowercase, numeric, or special characters.{'\n'}
                        </Text>
                      </Item>
                    )}

                    {/* <Item style={styles.viewInput} inlineLabel rounded>
                      <Input
                        keyboardType={'number-pad'}
                        autoCapitalize={'none'}
                        style={{ color: 'black' }}
                        value={this.state.phoneNumber}
                        placeholder={t('REGISTER.phoneNumber')}
                        onChangeText={(text) =>
                          this.setState({ phoneNumber: text })
                        }
                      />
                    </Item> */}
                    {/* <Item style={styles.viewInput} inlineLabel rounded> */}
                    {/* <Picker
                      mode="dropdown" 
                      iosHeader={t('REGISTER.city')}
                      placeholder={t('REGISTER.city')}
                      placeholderStyle={{ color: '#575757', paddingLeft: 7 }}
                      iosIcon={
                        <Icon style={{ color: '#27666F' }} name="arrow-down" />
                      }
                      style={{ width: 270, paddingLeft: 0 }}
                      selectedValue={this.state.city}
                      onValueChange={(text) =>
                        this.setState({ city: text, wroteCity: '' })
                      }>
                      {cities.map((city) => (
                        <Picker.Item
                          label={city.name}
                          value={city}
                          key={city.id}
                        />
                      ))}
                      <Picker.Item
                        label={t('REGISTER.others')}
                        value="others"
                        key={t('REGISTER.others')}
                      />
                    </Picker> */}
                    {/* </Item> */}
                    {/* {city == 'others' ? (
                    <Item style={styles.viewInput} inlineLabel rounded>
                      <Input
                        disabled={city !== 'others'}
                        value={this.state.wroteCity}
                        placeholder={t('REGISTER.wroteCity')}
                        onChangeText={(text) =>
                          this.setState({ wroteCity: text })
                        }
                      />
                    </Item>
                  ) : null} */}

                    <GooglePlacesAutocomplete
                      placeholder={t('REGISTER.wroteCity')}
                      placeholderTextColor="#606160"
                      minLength={2}
                      autoFocus={false}
                      returnKeyType={'default'}
                      listViewDisplayed={this.state.showPlacesList}
                      keyboardShouldPersistTaps={'handled'}
                      listUnderlayColor={'transparent'}
                      textInputProps={
                        {
                          // onFocus: () => this.setState({ showPlacesList: true }),
                          // onBlur: () => this.setState({ showPlacesList: false }),
                        }
                      }
                      onPress={(data, details = null) => {
                        this.setState({
                          wroteCity: data.description,
                        });
                      }}
                      query={{
                        key: GOOGLE_API_KEY,
                        language: 'en',
                        types: '(cities)',
                        components: 'country:us',
                      }}
                      styles={{
                        container: {
                          backgroundColor: 'transparent',
                          // borderColor: 'black',
                          borderRadius: 0,
                          paddingLeft: 15,
                          borderColor: '#D9D5DC',
                          color: 'black',
                          paddingTop: 0,
                          paddingRight: 10,
                          paddingBottom: 5,
                          marginBottom: 10,
                        },
                        textInputContainer: {
                          backgroundColor: 'transparent',
                          height: 50,
                          fontSize: 20,
                          borderTopWidth: 0,
                          paddingRight: 5,
                          top: 10,
                          borderColor: '#D9D5DC',
                          paddingTop: 3,
                          paddingBottom: 7,
                          color: 'black',
                          flex: 1,
                        },

                        textInput: {
                          // paddingLeft: 8,
                          fontSize: 20,
                          fontFamily: 'UberMoveText-Light',
                          height: 50,
                          color: 'black',
                          flex: 1,
                          top: 1.5,
                          paddingRight: 5,
                          fontSize: 20,
                          paddingLeft: 0,
                          marginTop: 0,
                          marginLeft: 0,
                          marginRight: 0,
                          paddingTop: 0,
                          borderColor: '#D9D5DC',
                          paddingBottom: 0,
                          backgroundColor: 'transparent',
                        },
                        row: {
                          backgroundColor: 'white',
                          paddingLeft: 3,
                          height: 44,
                          flexDirection: 'row',
                        },
                        // listView: {
                        //   position: 'absolute',
                        //   zIndex: 500,
                        //   flex: 1,
                        //   top: 50,
                        // },
                        // row: {
                        //   backgroundColor: 'white',
                        //   color: 'black',
                        //   zIndex: 500,
                        //   flex:1,
                        //   elevation: 3,
                        // },
                        // description: {
                        //   color: 'black',

                        // },
                      }}
                    />

                    {/* <Item style={styles.viewInput} inlineLabel rounded>
                      <Input
                        keyboardType={'email-address'}
                        autoCapitalize={'none'}
                        value={this.state.email}
                        style={{ color: 'black' }}
                        placeholder={t('REGISTER.email')}
                        onChangeText={(text) => this.setState({ email: text })}
                      />
                    </Item>
                    <Item style={styles.viewInput} inlineLabel rounded>
                      <Input
                        value={this.state.password}
                        style={{ color: 'black' }}
                        placeholder={t('REGISTER.password')}
                        onChangeText={(text) =>
                          this.setState({ password: text })
                        }
                        secureTextEntry={true}
                      />
                    </Item> */}
                    {this.state.error === 'Enter a city' && (
                      <Text
                        style={{
                          color: 'red',
                          paddingLeft: 15,
                          fontFamily: 'UberMoveText-Light',
                        }}>
                        {this.state.error}
                      </Text>
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 20,
                        marginBottom: 20,
                      }}>
                      {/* <CheckBox
                      checked={acceptTerms}
                      onPress={() =>
                        actions.editTermsAndCondition(!acceptTerms)
                      }
                    /> */}
                      <View
                        style={{
                          paddingLeft: 15,
                          paddingTop: 15,
                        }}>
                        {/* <Text>{t('TERMS_AND_CONDITIONS.accept')}</Text> */}
                        {/* <TouchableOpacity
                          onPress={() =>
                            this.props.navigation.navigate(
                              TERMS_AND_CONDITIONS_ROUTE,
                            )
                          }>
                          <Text>
                            <Text style={styles.termsAndConditionsTitle}>
                              {
                                'By proceeding, I agree to JobCore\'s Terms of Use '
                              }
                            </Text>
                            <Text style={styles.termsAndConditionsTermTitle}>
                              {t('TERMS_AND_CONDITIONS.title')}
                            </Text>
                          </Text>
                        </TouchableOpacity> */}
                        <Text style={{ fontFamily: 'UberMoveText-Light' }}>
                          {'By proceeding, I agree to JobCore\'s '}
                          <Text
                            style={{
                              fontFamily: 'UberMoveText-Light',
                              color: '#007bff',
                            }}
                            onPress={() => {
                              Linking.openURL('https://jobcore.co/legal');
                            }}>
                            {'Terms of Use '}
                          </Text>
                          <Text style={{ fontFamily: 'UberMoveText-Light' }}>
                            and acknowledge that I have read the
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'UberMoveText-Light',
                              color: '#007bff',
                            }}
                            onPress={() => {
                              Linking.openURL('https://jobcore.co/privacy');
                            }}>
                            {' Privacy Notice.'}
                          </Text>
                        </Text>
                      </View>
                    </View>
                    <Button
                      full
                      onPress={this.register}
                      style={{ margin: 15, backgroundColor: 'black' }}>
                      <Text
                        style={{
                          fontFamily: 'UberMoveText-Medium',
                          fontSize: 26,
                          color: 'white',
                        }}>
                        {t('REGISTER.signUp')}
                      </Text>
                    </Button>
                    {/* 
                    <TouchableOpacity
                      full
                      onPress={() => this.props.navigation.goBack()}
                      style={styles.viewButtomSignUp}>
                      <Text style={styles.textButtomSignUp}>
                        {t('REGISTER.goBack')}
                      </Text>
                    </TouchableOpacity> */}
                  </Form>
                </View>
              </View>
            </Content>
          </Container>
        )}
      </I18n>
    );
  }

  register = () => {
    this.isLoading(true);
    actions.register(
      this.state.email.toLowerCase(),
      this.state.password,
      this.state.firstName,
      this.state.lastName,
      this.state.phoneNumber,
      this.state.city,
      this.state.wroteCity,
      this.state.acceptTerms,
    );
  };

  isLoading = (isLoading) => {
    this.setState({ isLoading });
  };
}

export default RegisterScreen;
