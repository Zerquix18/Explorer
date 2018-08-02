import loginReducer from 'containers/Login/reducer';
import leaderboardUIReducer from 'containers/Leaderboard/reducer';
import profileUIReducer from 'containers/Profile/reducer';
import dashboardReducer from 'containers/Dashboard/reducer';

const reducers = {
  loginContainer: loginReducer,
  leaderboardUI: leaderboardUIReducer,
  profileUI: profileUIReducer,
  ...dashboardReducer
};

// Reducers not from public-modules
export default reducers;