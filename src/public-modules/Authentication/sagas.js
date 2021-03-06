import request from 'utils/request';
import { call, put, takeLatest, select } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { addressSelector } from 'public-modules/Client/selectors';
import { actionTypes, actions } from 'public-modules/Authentication';
import { actionTypes as clientActionTypes } from 'public-modules/Client';
import { actionTypes as settingsActionTypes } from 'public-modules/Settings';
import { getWeb3Client } from 'public-modules/Client/sagas';
import { get } from 'lodash';

const { SET_INITIALIZED } = clientActionTypes;
const { LOGIN, LOGOUT } = actionTypes;
const {
  SAVE_SETTINGS_SUCCESS,
  SAVE_EMAIL_PREFERENCES_SUCCESS
} = settingsActionTypes;
const {
  getCurrentUserSuccess,
  getCurrentUserFail,
  loginSuccess,
  loginFail,
  logoutSuccess,
  logoutFail
} = actions;

export function* getCurrentUser(action) {
  const endpoint = 'auth/user/';
  try {
    const currentUser = yield call(request, endpoint, 'GET');
    yield put(getCurrentUserSuccess(currentUser));
  } catch (e) {
    if (get('errorStatus', e) === 401) {
      yield put(getCurrentUserSuccess());
    } else {
      yield put(getCurrentUserFail(e));
    }
  }
}

export function* login(action) {
  const address = yield select(addressSelector);
  const nonceEndpoint = `auth/${address}/nonce/`;
  const loginEndpoint = 'auth/login/';
  try {
    const nonceResponce = yield call(request, nonceEndpoint, 'GET');
    const nonce = nonceResponce.nonce;
    const signedUp = nonceResponce.has_signed_up;
    const { web3, proxiedWeb3 } = yield call(getWeb3Client);
    const message = web3.utils.fromUtf8(
      'Hi there! Your special nonce: ' + nonce
    );
    const signature = yield proxiedWeb3.eth.personal.sign(message, address);
    const loginOptions = {
      data: {
        public_address: address,
        signature
      }
    };
    const currentUser = yield call(
      request,
      loginEndpoint,
      'POST',
      loginOptions
    );
    yield put(loginSuccess(currentUser, signedUp));
  } catch (e) {
    yield put(loginFail(e));
  }
}

export function* logout(action) {
  const endpoint = 'auth/logout/';
  try {
    yield call(request, endpoint, 'GET');
    yield put(logoutSuccess());
    yield put(push('/explorer'));
  } catch (e) {
    yield put(logoutFail(e));
  }
}

export function* watchGetCurrentUser() {
  yield takeLatest(
    [SET_INITIALIZED, SAVE_SETTINGS_SUCCESS, SAVE_EMAIL_PREFERENCES_SUCCESS],
    getCurrentUser
  );
}

export function* watchLogin() {
  yield takeLatest(LOGIN, login);
}

export function* watchLogout() {
  yield takeLatest(LOGOUT, logout);
}

export default [watchLogin, watchLogout, watchGetCurrentUser];
