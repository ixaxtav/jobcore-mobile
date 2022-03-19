import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  Platform,
} from 'react-native';
import {
  Item,
  Input,
  Button,
  Text,
  Form,
  Header,
  Left,
  Label,
  Content,
  Thumbnail,
  Body,
  Right,
  Title,
  Textarea,
  FooterTab,
  Footer,
  Container,
  Picker,
  H1,
  Icon,
} from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-community/async-storage';
import editProfileStyles from '../Account/EditProfileStyle';
import profileStyles from '../Account/PublicProfileStyle';
import * as actions from '../Account/actions';
import accountStore from '../Account/AccountStore';
import { I18n } from 'react-i18next';
import { i18next } from '../../i18n';
import { LOG, WARN } from '../../shared';
import TouchID from 'react-native-touch-id';
import { CustomToast, Loading } from '../../shared/components';
import * as ImagePicker from "react-native-image-picker"
import {PermissionsAndroid} from 'react-native';
import {
  RESUME_ONBOARDING_ROUTE,
  DOB_ONBOARDING_ROUTE,
} from '../../constants/routes';
import PROFILE_IMG from '../../assets/image/profile.png';
import CAMERA_IMG from '../../assets/image/camera.png';
import { GRAY_MAIN, BG_GRAY_LIGHT, BLUE_DARK } from '../../shared/colorPalette';
import { TabHeaderWhite } from '../../shared/components/TabHeaderWhite';
import moment from 'moment';
import preferencesStyles from '../Invite/JobPreferencesStyle';

const icon = require('../../assets/image/tab/profile.png');

const IMAGE_PICKER_OPTIONS = {
  mediaType: 'photo',
  noData: true,
  skipBackup: true,
};

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  color: '#e00606', // Android,
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: false,
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
};

class PictureOnboarding extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploaded: false,
      isLoading: true,
      picture: '',
      biometrySupport: true,
      selectedImage: null,
    };
  }

  async componentDidMount() {
    this.getUserSubscription = accountStore.subscribe('getUser', (user) => {
      console.log('user: ', user);
      this.setUserInfo(user);
    });
    this.editProfilePictureSubscription = accountStore.subscribe(
      'EditProfilePicture',
      this.editProfilePictureHandler,
    );
    this.accountStoreError = accountStore.subscribe(
      'AccountStoreError',
      this.errorHandler,
    );
    actions.getCities();
    actions.getUser();
  }

  componentWillUnmount() {
    this.getUserSubscription.unsubscribe();
    this.editProfilePictureSubscription.unsubscribe();
    this.accountStoreError.unsubscribe();
  }

  editProfilePictureHandler = (data) => {
    this.setUser(data);
    // this.editProfile();
  };

  errorHandler = (err) => {
    this.isLoading(false);
    CustomToast(err, 'danger');
  };

  render() {
    const { isLoading } = this.state;

    var picture = this.state.picture;
    var hasPicture = false;

    if (
      !picture ||
      picture ===
        'https://res.cloudinary.com/hq02xjols/image/upload/v1560365062/static/default_profile3.png' ||
      picture ===
        'https://res.cloudinary.com/hq02xjols/image/upload/v1560367698/static/default_profile2.png' ||
      picture ===
        'https://res.cloudinary.com/hq02xjols/image/upload/v1560365062/static/default_profile1.png'
    ) {
      picture =
        'https://res.cloudinary.com/hq02xjols/image/upload/v1626297800/example.jpg';
    } else hasPicture = true;

    console.log('estado', this.state);

    return (
      <I18n>
        {(t) => (
          <Container>
            {isLoading ? <Loading /> : null}
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
                  Upload your profile photo
                </H1>
                <Text
                  style={{
                    fontSize: 18,
                    marginTop: 10,
                    color: 'gray',
                    fontFamily: 'UberMoveText-Light',
                  }}>
                  1. Be as professional as possible
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    marginTop: 10,
                    color: 'gray',
                    fontFamily: 'UberMoveText-Light',
                  }}>
                  2. Show your whole face
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    marginTop: 10,
                    color: 'gray',
                    fontFamily: 'UberMoveText-Light',
                  }}>
                  3. Take your hat off and sunglasses
                </Text>
              </View>
              <View>
                <TouchableOpacity onPress={this.openImagePicker}>
                  <View style={profileStyles.viewProfileImgOnboarding}>
                    <Thumbnail
                      style={{ width: 160, height: 160, borderRadius: 80 }}
                      source={
                        this.state.selectedImage && this.state.selectedImage.uri
                          ? { uri: this.state.selectedImage.uri }
                          : picture
                            ? { uri: picture }
                            : 'https://res.cloudinary.com/hq02xjols/image/upload/v1626297800/example.jpg'
                      }
                    />
                    <View style={profileStyles.viewCameraCircleOnboarding}>
                      <Image
                        style={profileStyles.camera}
                        source={require('../../assets/image/camera.png')}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </Content>
            <Footer
              style={{
                backgroundColor: 'white',
                borderBottomWidth: 0,
                borderTopWidth: 0,
              }}>
              <FooterTab>
                {this.state.selectedImage || hasPicture ? (
                  <Button
                    full
                    style={{ backgroundColor: 'black', borderRadius: 0 }}
                    onPress={() => {
                      if (
                        this.state.selectedImage &&
                        Object.keys(this.state.selectedImage).length
                      )
                        actions.editProfilePicture(this.state.selectedImage);

                      this.props.navigation.navigate(RESUME_ONBOARDING_ROUTE);
                    }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>Next</Text>
                  </Button>
                ) : (
                  <Button full light disabled style={{ borderRadius: 0 }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>
                      To continue, upload picture
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

  setUserInfo = (user) => {
    const userBirthDate = moment(user.birth_date);
    this.setState({
      uploaded: true,
      firstName: user.user.first_name,
      lastName: user.user.last_name,
      email: user.user.email,
      picture: user.picture,
      bio: user.bio,
      profile_city_id: user.profile_city,
      wroteCity: user.city,
      last_4dig_ssn: user.last_4dig_ssn,
      userBirthDate: user.birth_date,
      _userBirthDate: userBirthDate.isValid()
        ? userBirthDate.toDate()
        : new Date(),
      isLoading: false,
    });
    if (user.city) {
      this.setState({
        city: 'others',
        profile_city: 'others',
      });
    }
  };

  setUser = (data) => {
    const session = accountStore.getState('Login');

    try {
      session.user.first_name = data.user.first_name;
      session.user.last_name = data.user.last_name;
      session.user.profile.picture = data.picture;
      session.user.profile.bio = data.bio;
    } catch (e) {
      return WARN(this, `${data} error updating user session`);
    }

    actions.setStoredUser(session);
  };

  editProfileAlert = () => {
    if (
      (this.state.selectedImage && this.state.selectedImage.uri) ||
      !this.state.picture.includes('default')
    ) {
      Alert.alert(
        i18next.t('EDIT_PROFILE.wantToEditProfile'),
        '',
        [
          {
            text: i18next.t('APP.cancel'),
            onPress: () => {
              LOG(this, 'Cancel edit profile');
            },
          },
          {
            text: i18next.t('EDIT_PROFILE.update'),
            onPress: () => {
              this.setState({ isLoading: true }, () => {
                LOG(this, this.state);
                if (this.state.selectedImage && this.state.selectedImage.uri) {
                  return actions.editProfilePicture(this.state.selectedImage);
                }
                // this.editProfile();
              });
            },
          },
        ],
        { cancelable: false },
      );
    } else {
      CustomToast('Please upload a profile picture', 'danger');
    }
  };

  openImagePicker = () => {
    ImagePicker.showImagePicker(
      IMAGE_PICKER_OPTIONS,
      this.handleImagePickerResponse
    );
  };

  /**
   * Handle react-native-image-picker response and set the selected image
   * @param  {object} response A react-native-image-picker response
   * with the uri, type & name
   */
  handleImagePickerResponse = (response) => {
    
    if (response.didCancel) {
      // for react-native-image-picker response
      LOG(this, 'User cancelled image picker');
    } else if (response.error) {
      // for react-native-image-picker response
      LOG(this, `ImagePicker Error: ${response.error}`);
    } else if (response.customButton) {
      // for react-native-image-picker response
      LOG(this, `User tapped custom button: ${response.customButton}`);
    } else {
      if (!response.uri) return;

      let type = response.type;

      if (type === undefined && response.fileName === undefined) {
        const pos = response.uri.lastIndexOf('.');
        type = response.uri.substring(pos + 1);
        if (type) type = `image/${type}`;
      }
      if (type === undefined) {
        const splitted = response.fileName.split('.');
        type = splitted[splitted.length - 1];
        if (type) type = `image/${type}`;
      }

      let name = response.fileName;
      if (name === undefined && response.fileName === undefined) {
        const pos = response.uri.lastIndexOf('/');
        name = response.uri.substring(pos + 1);
      }

      const selectedImage = {
        uri: response.uri,
        type: type.toLowerCase(),
        name,
      };

      this.setState({ selectedImage });
    }
  };

  isLoading = (isLoading) => {
    this.setState({ isLoading });
  };
}

PictureOnboarding.routeName = 'EditProfile';

export default PictureOnboarding;

