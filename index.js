import axios from 'axios';
import jwtDecode from 'jwt-decode';

let localStorageKey, authenticationURL, refreshURL, getTokenFromResponse, setAxiosHeaders, cleanAxiosHeaders, decodedToken, setRefreshCredentials;

function init (config) {
	if (typeof config.localStorageKey !== 'string') throw 'localStorageKey is required';
	if (typeof config.authenticationURL !== 'string') throw 'authenticationURL is required';

	// Get the token from the Axios response
	getTokenFromResponse = config.getTokenFromResponse || (reponse) => {
		return response.data.jwt
	};

	// Set Axios headers for all API requests
	setAxiosHeaders = config.setAxiosHeaders || (token) => {
		axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
	}

	// Clean Axios headers
	cleanAxiosHeaders = config.cleanAxiosHeaders || () => {
		axios.defaults.headers.common['Authorization'] = null;
	}

	// Returns credentials object for token refresh
	setRefreshCredentials = config.setRefreshCredentials || (token) => {
		return {
			jwt: token
		};
	};
}

async function authenticate (credentials) {
	const response = await axios.post(authenticationURL, credentials);
	const token = getTokenFromResponse(response);
	decodedToken = jwtDecode(token);
	onAuthentication(token);
	return decodedToken;
}

async function refreshToken () {
	const previousToken = getJWT(false);
	const response = await axios.post(refreshURL || authenticationURL, setRefreshCredentials(previousToken));
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


async authenticate (username, password) {
	try {
		return await axios.post('users/authenticate', {
			username,
			password
		});
	} catch (error) {
		if (error.response) {
			throw 'Usuario o contraseña incorrectos';
		} else {
			throw error;
		}
	}

},
async reauthenticate (token) {
	return await axios.post('users/reauthenticate', {jwt: token});
}
