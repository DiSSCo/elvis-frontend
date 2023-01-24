let kc = null;
let profile = null;
let permissions = [];

export function setKeycloak(keycloak) {
  kc = keycloak;
}

export function getKeycloak() {
  return kc;
}

export function kcLogin() {
  kc.login({
    redirectUri: process.env.VUE_APP_BASE_URL,
  });
}

export function kcLogout() {
  kc.logout({
    redirectUri: `${process.env.VUE_APP_BASE_URL}/welcome`,
  });
}

export function isAuthenticated() {
  return kc.authenticated;
}

export function getToken() {
  return kc.token;
}

export function getTokenParsed() {
  return kc.tokenParsed;
}

export function setPermissions(p) {
  permissions = p;
}

export function getPermissions() {
  return permissions;
}

export function getProfile() {
  return profile;
}

export function setProfile(newProfile) {
  profile = newProfile;
}

export function isAdmin() {
  return profile?.groups.includes('administrator');
}

export function isTafAdmin() {
  return profile?.groups.includes('taf admin');
}

export function isInstitutionMod() {
  return profile?.groups.includes('institution moderator');
}

export function isAllowed(permission) {
  return permissions.includes(permission) || isAdmin();
}

export function isOwnInstitution(instId) {
  const p = getProfile();
  return p?.attributes?.institutionId === instId || isAdmin();
}
