export function saveUserToLocalStorage(data) {
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('token', data.token);
}

export function getUserFromLocalStorage() {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  if (user && token) {
    return { user: JSON.parse(user), token };
  }
  return null;
}
