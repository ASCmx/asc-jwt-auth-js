import axios from 'axios';
import jwtDecode from 'jwt-decode';

let localStorageKey, authenticationURL, refreshTokenURL, getTokenFromResponse, setAxiosHeaders, cleanAxiosHeaders, decodedToken, setRefreshCredentials;

function init (config) {
	if (typeof config.localStorageKey !== 'string') throw 'localStorageKey is required';
	if (typeof config.authenticationURL !== 'string') throw 'authenticationURL is required';

	localStorageKey = config.localStorageKey;
	authenticationURL = config.authenticationURL;
	refreshTokenURL = config.refreshTokenURL;

	// Get the token from the Axios response
	if (config.getTokenFromResponse !== undefined) {
		getTokenFromResponse = config.getTokenFromResponse;
	} else {
		getTokenFromResponse = function (response) {
			return response.data.jwt;
		};
	}

	// Set Axios headers for all API requests
	if (config.setAxiosHeaders !== undefined) {
		setAxiosHeaders = config.setAxiosHeaders;
	} else {
		setAxiosHeaders = function (token) {
			axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
		};
	}

	// Clean Axios headers
	if (config.cleanAxiosHeaders !== undefined) {
		cleanAxiosHeaders = config.cleanAxiosHeaders;
	} else {
		cleanAxiosHeaders = function () {
			axios.defaults.headers.common['Authorization'] = null;
		};
	}

	// Returns credentials object for token refresh
	if (config.setRefreshCredentials !== undefined) {
		setRefreshCredentials = config.setRefreshCredentials;
	} else {
		setRefreshCredentials = function (token) {
			return {
				jwt: token
			};
		};
	}
}

async function authenticate (credentials) {
	const response = await axios.post(authenticationURL, credentials);
	console.log(response);
	const token = getTokenFromResponse(response);
	decodedToken = jwtDecode(token);
	onAuthentication(token);
	return decodedToken;
}

async function refreshToken () {
	const previousToken = getJWT(false);
	if (typeof previousToken !== 'string') throw 'No token in localStorage ' + localStorageKey;
	const response = await axios.post(refreshTokenURL || authenticationURL, setRefreshCredentials(previousToken));
	const newToken = getTokenFromResponse(response);
	decodedToken = jwtDecode(newToken);
	onAuthentication(newToken);
	return decodedToken;
}

function onAuthentication (token) {
	localStorage.setItem(localStorageKey, token);
	setAxiosHeaders(token);
}

function logout () {
	cleanAxiosHeaders();
	decodedToken = null;
	localStorage.removeItem(localStorageKey);
}

function getJWT (decoded = true) {
	if (decoded) return decodedToken;
	return localStorage.getItem(localStorageKey);
}

export default {
	init,
	authenticate,
	refreshToken,
	logout,
	getJWT
};
