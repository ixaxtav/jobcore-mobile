import React, { Component } from 'react';
import {
  View,
  SafeAreaView,
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
  Body,
  Content,
  List,
  Button,
  Text,
  FooterTab,
  Footer,
  Icon,
  Left,
  Right,
  ListItem,
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
import styles from '../Invite/PositionStyle';

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
import BtnCancelSave from '../../shared/components/BtnCancelSave';
import CustomPickerWhite from '../../shared/components/CustomPickerWhite';
import { TabHeaderWhite } from '../../shared/components/TabHeaderWhite';
import inviteStore from '../Invite/InviteStore';
import * as inviteActions from '../Invite/actions';

class PositionOnboarding extends Component {
  static navigationOptions = { header: null };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showHospitality: true,
      showConstruction: false,
      showOther: false,
      showGeneral: false,
      showOffice: false,
      isRefreshing: false,
      positionList: inviteStore.getState('GetPositions') || [],
      positions: Object.assign(
        [],
        (inviteStore.getState('GetJobPreferences') || {}).positions,
      ),
    };
  }

  componentDidMount() {
    this.getPositionsSubscription = inviteStore.subscribe(
      'GetPositions',
      (positionList) => this.getPositionsHandler(positionList),
    );
    this.getJobPreferencesSubscription = inviteStore.subscribe(
      'GetJobPreferences',
      (data) => this.getJobPreferencesHandler(data),
    );
    this.editPositionsSubscription = inviteStore.subscribe(
      'EditPositions',
      (data) => this.editPositionsHandler(data),
    );
    this.logoutSubscription = accountStore.subscribe(
      'Logout',
      this.logoutHandler,
    );
    this.inviteStoreError = inviteStore.subscribe('InviteStoreError', (err) =>
      this.errorHandler(err),
    );

    if (!this.state.positionList.length) {
      this.isLoading(true);
      this.getPositions();
    }

    if (!this.state.positions.length) {
      this.isLoading(true);
      this.getJobPreferences();
    }
  }

  getPositionsHandler = (positionList) => {
    this.isLoading(false);
    this.setState({ positionList });
  };

  getJobPreferencesHandler = (data) => {
    this.isLoading(false);

    this.setState({
      positions: data.positions,
      isRefreshing: false,
    });
  };

  editPositionsHandler = () => {
    this.getJobPreferences();
    // CustomToast(i18next.t('JOB_PREFERENCES.positionUpdated'));
    this.props.navigation.navigate(LOCATION_ONBOARDING_ROUTE);
  };

  errorHandler = () => {
    this.setState({ isRefreshingInvites: false });
    this.isLoading(false);
  };

  componentWillUnmount() {
    this.logoutSubscription.unsubscribe();
    this.getPositionsSubscription.unsubscribe();
    this.getJobPreferencesSubscription.unsubscribe();
    this.editPositionsSubscription.unsubscribe();
    this.inviteStoreError.unsubscribe();
  }
  logout = () => {
    Alert.alert(i18next.t('SETTINGS.wantToLogout'), '', [
      {
        text: i18next.t('APP.cancel'),
        onPress: () => {
          LOG(this, 'Cancel logout');
        },
      },
      {
        text: i18next.t('SETTINGS.logout'),
        onPress: () => {
          this.setState({ isLoading: true }, accountActions.logout());
        },
      },
    ]);
  };

  logoutHandler = () => {
    this.setState({ isLoading: false });
  };
  render() {
    const hospitalityPositions = this.state.positionList.filter(
      (e) => e.meta_keywords === 'Hospitality',
    );
    const officePositions = this.state.positionList.filter(
      (e) => e.meta_keywords === 'Office',
    );
    const generalPositions = this.state.positionList.filter(
      (e) => e.meta_keywords === 'General Labor',
    );
    const constructionlPositions = this.state.positionList.filter(
      (e) => e.meta_keywords === 'Construction',
    );
    const otherPositions = this.state.positionList.filter(
      (e) => e.meta_keywords === 'Other',
    );
    return (
      <I18n>
        {(t) => (
          <Container>
            {/* <TabHeaderWhite
              goBack
              onPressBack={() => this.props.navigation.goBack()}
              // title={t('EDIT_PROFILE.editProfile')}
            /> */}
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
                  onPress={() => this.logout()}>
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
                    fontSize: 32,
                    lineHeight: 45,
                    fontFamily: 'UberMoveText-Medium',
                  }}>
                  What type of work are you interested in?
                </H1>
                <Text
                  style={{
                    fontSize: 18,
                    color: 'gray',
                    fontFamily: 'UberMoveText-Light',
                  }}>
                  Select all that apply
                </Text>
              </View>
              <>
                <List style={{ marginLeft: 10, marginRight: 10 }}>
                  <ListItem
                    onPress={() =>
                      this.setState({
                        showHospitality: !this.state.showHospitality,
                      })
                    }>
                    <Left>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: 'UberMoveText-Medium',
                        }}>
                        Hospitality
                      </Text>
                    </Left>
                    <Right>
                      <Icon
                        style={{ color: 'black' }}
                        name={
                          !this.state.showHospitality
                            ? 'arrow-forward'
                            : 'arrow-down'
                        }
                      />
                    </Right>
                  </ListItem>
                  {this.state.showHospitality && (
                    <View style={{ marginTop: 10 }}>
                      <CustomPickerWhite
                        refreshControl={
                          <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.refreshPositions}
                          />
                        }
                        data={hospitalityPositions}
                        onItemPress={(position) => {
                          const isPositionSelected = this.isPositionSelected(
                            position,
                          );
                          this.selectUnselectPosition(
                            position,
                            isPositionSelected,
                          );
                        }}
                        itemRendered={(position, key) => {
                          const isPositionSelected = this.isPositionSelected(
                            position,
                          );

                          return (
                            <View
                              key={position.id}
                              style={[
                                styles.itemSelectCheck,
                                { borderBottomWidth: 0, alignItems: 'center' },
                              ]}>
                              <View>
                                <Text
                                  style={{
                                    color: 'black',
                                    fontSize: 18,
                                    fontFamily: 'UberMoveText-Light',
                                  }}>
                                  {position.title}
                                </Text>
                              </View>
                              <View>
                                <Icon
                                  type="FontAwesome"
                                  name={
                                    isPositionSelected
                                      ? 'check-circle'
                                      : 'circle-o'
                                  }
                                  style={{ fontSize: 24, color: 'black' }}
                                />
                              </View>
                            </View>
                          );
                        }}
                      />
                    </View>
                  )}
                  <ListItem
                    onPress={() =>
                      this.setState({ showOffice: !this.state.showOffice })
                    }>
                    <Left>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: 'UberMoveText-Medium',
                        }}>
                        Office
                      </Text>
                    </Left>
                    <Right>
                      <Icon
                        style={{ color: 'black' }}
                        name={
                          !this.state.showOffice
                            ? 'arrow-forward'
                            : 'arrow-down'
                        }
                      />
                    </Right>
                  </ListItem>
                  {this.state.showOffice && (
                    <View style={{ marginTop: 10 }}>
                      <CustomPickerWhite
                        refreshControl={
                          <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.refreshPositions}
                          />
                        }
                        data={officePositions}
                        onItemPress={(position) => {
                          const isPositionSelected = this.isPositionSelected(
                            position,
                          );
                          this.selectUnselectPosition(
                            position,
                            isPositionSelected,
                          );
                        }}
                        itemRendered={(position, key) => {
                          const isPositionSelected = this.isPositionSelected(
                            position,
                          );

                          return (
                            <View
                              key={position.id}
                              style={[
                                styles.itemSelectCheck,
                                { borderBottomWidth: 0, alignItems: 'center' },
                              ]}>
                              <View>
                                <Text
                                  style={{
                                    color: 'black',
                                    fontSize: 18,
                                    fontFamily: 'UberMoveText-Light',
                                  }}>
                                  {position.title}
                                </Text>
                              </View>
                              <View>
                                <Icon
                                  type="FontAwesome"
                                  name={
                                    isPositionSelected
                                      ? 'check-circle'
                                      : 'circle-o'
                                  }
                                  style={{ fontSize: 24, color: 'black' }}
                                />
                              </View>
                            </View>
                          );
                        }}
                      />
                    </View>
                  )}
                  <ListItem
                    onPress={() =>
                      this.setState({ showGeneral: !this.state.showGeneral })
                    }>
                    <Left>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: 'UberMoveText-Medium',
                        }}>
                        General Labor
                      </Text>
                    </Left>
                    <Right>
                      <Icon
                        style={{ color: 'black' }}
                        name={
                          !this.state.showGeneral
                            ? 'arrow-forward'
                            : 'arrow-down'
                        }
                      />
                    </Right>
                  </ListItem>
                  {this.state.showGeneral && (
                    <View style={{ marginTop: 10 }}>
                      <CustomPickerWhite
                        refreshControl={
                          <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.refreshPositions}
                          />
                        }
                        data={generalPositions}
                        onItemPress={(position) => {
                          const isPositionSelected = this.isPositionSelected(
                            position,
                          );
                          this.selectUnselectPosition(
                            position,
                            isPositionSelected,
                          );
                        }}
                        itemRendered={(position, key) => {
                          const isPositionSelected = this.isPositionSelected(
                            position,
                          );

                          return (
                            <View
                              key={position.id}
                              style={[
                                styles.itemSelectCheck,
                                { borderBottomWidth: 0, alignItems: 'center' },
                              ]}>
                              <View>
                                <Text
                                  style={{
                                    color: 'black',
                                    fontSize: 18,
                                    fontFamily: 'UberMoveText-Light',
                                  }}>
                                  {position.title}
                                </Text>
                              </View>
                              <View>
                                <Icon
                                  type="FontAwesome"
                                  name={
                                    isPositionSelected
                                      ? 'check-circle'
                                      : 'circle-o'
                                  }
                                  style={{ fontSize: 24, color: 'black' }}
                                />
                              </View>
                            </View>
                          );
                        }}
                      />
                    </View>
                  )}
                  <ListItem
                    onPress={() =>
                      this.setState({
                        showConstruction: !this.state.showConstruction,
                      })
                    }>
                    <Left>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: 'UberMoveText-Medium',
                        }}>
                        Construction
                      </Text>
                    </Left>
                    <Right>
                      <Icon
                        style={{ color: 'black' }}
                        name={
                          !this.state.showConstruction
                            ? 'arrow-forward'
                            : 'arrow-down'
                        }
                      />
                    </Right>
                  </ListItem>
                  {this.state.showConstruction && (
                    <View style={{ marginTop: 10 }}>
                      <CustomPickerWhite
                        refreshControl={
                          <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.refreshPositions}
                          />
                        }
                        data={constructionlPositions}
                        onItemPress={(position) => {
                          const isPositionSelected = this.isPositionSelected(
                            position,
                          );
                          this.selectUnselectPosition(
                            position,
                            isPositionSelected,
                          );
                        }}
                        itemRendered={(position, key) => {
                          const isPositionSelected = this.isPositionSelected(
                            position,
                          );

                          return (
                            <View
                              key={position.id}
                              style={[
                                styles.itemSelectCheck,
                                { borderBottomWidth: 0, alignItems: 'center' },
                              ]}>
                              <View>
                                <Text
                                  style={{
                                    color: 'black',
                                    fontSize: 18,
                                    fontFamily: 'UberMoveText-Light',
                                  }}>
                                  {position.title}
                                </Text>
                              </View>
                              <View>
                                <Icon
                                  type="FontAwesome"
                                  name={
                                    isPositionSelected
                                      ? 'check-circle'
                                      : 'circle-o'
                                  }
                                  style={{ fontSize: 24, color: 'black' }}
                                />
                              </View>
                            </View>
                          );
                        }}
                      />
                    </View>
                  )}
                  <ListItem
                    onPress={() =>
                      this.setState({ showOther: !this.state.showOther })
                    }>
                    <Left>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: 'UberMoveText-Medium',
                        }}>
                        Other
                      </Text>
                    </Left>
                    <Right>
                      <Icon
                        style={{ color: 'black' }}
                        name={
                          !this.state.showOther ? 'arrow-forward' : 'arrow-down'
                        }
                      />
                    </Right>
                  </ListItem>
                  {this.state.showOther && (
                    <View style={{ marginTop: 10 }}>
                      <CustomPickerWhite
                        refreshControl={
                          <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.refreshPositions}
                          />
                        }
                        data={otherPositions}
                        onItemPress={(position) => {
                          const isPositionSelected = this.isPositionSelected(
                            position,
                          );
                          this.selectUnselectPosition(
                            position,
                            isPositionSelected,
                          );
                        }}
                        itemRendered={(position, key) => {
                          const isPositionSelected = this.isPositionSelected(
                            position,
                          );

                          return (
                            <View
                              key={position.id}
                              style={[
                                styles.itemSelectCheck,
                                { borderBottomWidth: 0, alignItems: 'center' },
                              ]}>
                              <View>
                                <Text
                                  style={{
                                    color: 'black',
                                    fontSize: 18,
                                    fontFamily: 'UberMoveText-Light',
                                  }}>
                                  {position.title}
                                </Text>
                              </View>
                              <View>
                                <Icon
                                  type="FontAwesome"
                                  name={
                                    isPositionSelected
                                      ? 'check-circle'
                                      : 'circle-o'
                                  }
                                  style={{ fontSize: 24, color: 'black' }}
                                />
                              </View>
                            </View>
                          );
                        }}
                      />
                    </View>
                  )}
                </List>
                {this.state.isLoading ? <Loading /> : null}

                {/* <BtnCancelSave t={t} onPressSave={this.editPosition} /> */}
              </>
            </Content>
            <Footer
              style={{
                backgroundColor: 'white',
                borderBottomWidth: 0,
                borderTopWidth: 0,
              }}>
              <FooterTab>
                {Array.isArray(this.state.positions) &&
                this.state.positions.length > 0 ? (
                    <Button
                      full
                      style={{ backgroundColor: 'black', borderRadius: 0 }}
                      onPress={this.editPosition}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 16,
                          fontFamily: 'UberMoveText-Medium',
                        }}>
                      Next
                      </Text>
                    </Button>
                  ) : (
                    <Button light full disabled style={{ borderRadius: 0 }}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 16,
                          fontFamily: 'UberMoveText-Medium',
                        }}>
                      To continue, add position(s)
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

  refreshPositions = () => {
    this.setState({ isRefreshing: false });
    this.getPositions();
    this.getJobPreferences();
  };

  getPositions = () => {
    inviteActions.getPositions();
  };

  /**
   * Select or unselect position based on isPositionSelected
   * @param  {object}  position           the position
   * @param  {Boolean} isPositionSelected if the position is selected
   */
  selectUnselectPosition = (position, isPositionSelected) => {
    let positionsCopy;

    if (isPositionSelected) {
      positionsCopy = this.state.positions.filter((e) => e.id !== position.id);
    }

    if (!isPositionSelected) {
      positionsCopy = this.state.positions;
      positionsCopy.push(position);
    }

    if (Array.isArray(positionsCopy)) {
      this.setState({ positions: positionsCopy });
    }
  };

  isPositionSelected = (position) => {
    if (!position || !Array.isArray(this.state.positionList)) {
      return false;
    }

    for (const pos of this.state.positions) {
      if (pos.id === position.id) return true;
    }

    return false;
  };

  getJobPreferences = () => {
    inviteActions.getJobPreferences();
  };

  editPosition = () => {
    inviteActions.editPositions(
      this.state.positions.map((position) => position.id),
    );
  };

  isLoading = (isLoading) => {
    this.setState({ isLoading });
  };
}

export default PositionOnboarding;
