export default class account {
  static deleteUsername () {
    sessionStorage.setItem('account-username', JSON.stringify({ username: null, expires: null }));
    document.getElementById('login-link').textContent = 'Log in';
    document.getElementById('login-link').href = '/user/login';
  }

  static async getUsername () {
    let data;
    try {
      data = sessionStorage.getItem('account-username');
      data = data ? JSON.parse(data) : {};
      data = data || {};
    } catch (e) {
      data = {};
      sessionStorage.setItem('account-username', JSON.stringify(data));
    }

    let { username, expires } = data;

    if (username === null) {
      return null;
    } else if (username === undefined) {
      const data = await fetch('/auth/get-username')
        .then(response => {
          if (response.status === 401) {
            return { username: null, expires: null };
          }
          return response.json();
        });
      username = data.username;
      sessionStorage.setItem('account-username', JSON.stringify(data));
    } else if (expires === null || expires < Date.now()) {
      username = null;
      sessionStorage.setItem('account-username', JSON.stringify({ username: null, expires: null }));
    }

    return username;
  }

  static setUsername (username, expires) {
    sessionStorage.setItem('account-username', JSON.stringify({ username, expires }));
  }
}
