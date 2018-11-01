import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwtDecode from "jwt-decode";

import { GET_ERRORS, SET_CURRENT_USER } from "./types";

export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData)
    .then(res => {
      // console.log(res);
      history.push("/login");
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//login Get User token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      //set token to auth header
      setAuthToken(token);
      //decode token to get user
      const decoded = jwtDecode(token);
      //set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

export const logoutUser = () => dispatch => {
  //remove token from localstorage
  localStorage.removeItem("jwtToken");
  //remove auth header for future request
  setAuthToken(false);
  //set current user false
  dispatch(setCurrentUser({}));
};
