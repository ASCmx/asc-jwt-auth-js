# asc-jwt-auth-js

Minimal example:
```js
import auth from 'asc-jwt-auth-js';

auth.init({
	localStorageKey: 'my-app-jwt',
	authenticationURL: 'https://www.domain.com/authenticate'
});

await auth.authenticate({
	username: 'pepito',
	password: '12345'
});

await auth.refreshToken();
```

Full example:
```js
import auth from 'asc-jwt-auth-js';

// Init
auth.init({
	// REQUIRED
	localStorageKey: 'my-app-jwt',
	authenticationURL: 'https://www.domain.com/authenticate',

	// OPTIONAL
	refreshURL: 'https://www.domain.com/reauthenticate',
	setRefreshCredentials (token) {
		return {
			jwt: token
		};
	},
	getTokenFromResponse (response) {
		return response.data.something.something.jwt;
	},
	setAxiosHeaders (token) {
		axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
	},
	cleanAxiosHeaders () {
		axios.defaults.headers.common['Authorization'] = null;
	},
});

// Authenticates with server
// The object will be passed as-is to the server with Axios, you can use whatever format your API expects
auth.authenticate({
	username: 'pepito',
	password: '12345'
}).then((decodedToken) => {
	// Optional, do stuff after authentication
	console.log('Authenticated!');
	console.log(decodedToken);
});

// Tries to renew JWT with server
// The JWT from localStorage will be used
auth.refreshToken().then((decodedToken) => {
	// Optional, do stuff after reauthentication
	console.log('Authenticated!');
	console.log(decodedToken);
});

// Returns decoded JWT from localStorage
auth.getJWT();

// Returns raw JWT from localStorage
auth.getJWT(false);

// Deletes JWT from localStorage and removes 'Authorization' header from Axios
auth.logout();
```
