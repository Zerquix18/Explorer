import { put, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { currentRouteSelector } from 'utils/helpers';
import { actions } from 'public-modules/Bounties';
const { resetFilters } = actions;

export function* locationChanged(action) {
  const { pathname } = action.payload;

  yield put(resetFilters());
}

export function* watchRouter() {
  yield takeLatest(LOCATION_CHANGE, locationChanged);
}

export default [watchRouter];
