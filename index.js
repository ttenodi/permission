/*!
 * permission
 * Copyright(c) 2015 Tomislav Tenodi
 * MIT Licensed
 */

/**
 * Function to be called after require!
 * @param {array} roles User roles that have authorization for the view.
 *            If undefined, any role can check the view.
 */
var permission = function (roles) {
  return function (req, res, next) {
    var options = req.app.get('permission') || {};

    /**
     * Setting default values if options are not set.
     * @define {string} role User's property name describing his role.
     */
    var role = options.role || 'role';

    /**
     * Both notAuthenticated and notAuthorized implement the same interface.
     * Interface contains 4 properties.
     * @property {string} flashType 1st argument of req.flash() (flash)
     * @property {string} message 2nd argument of req.flash() (flash)
     * @property {string} redirect Path argument of req.redirect() (express)
     * @property {number} status 1st argument of req.status() (express)
     *
     * @define {Object} notAuthenticated Defines properties when user is non authenticated.
     */
    var notAuthenticated = options.notAuthenticated || { status: 401, redirect: null };
    /** @define {Object} notAuthorized Defines properties when user is not authorized. */
    var notAuthorized = options.notAuthorized || { status: 403, redirect: null };

    /**
     * Function to be called after permission is done with checking ACL.
     * @enum {string} authorizedStatus : notAuthenticated, notAuthorized, authorized.
     */
    var after = options.after || function(req, res, next, authorizedStatus){
      if (authorizedStatus === permission.AUTHORIZED){
        next();
      } else {
        var state = authorizedStatus === permission.NOT_AUTHORIZED ? notAuthorized : notAuthenticated;

        if (state.redirect) {
          state.message && req.flash(state.flashType, state.message);
          res.redirect(state.redirect);
        }
        else {
          res.status(state.status).send(null);
        }
      }
    }

    if (req.isAuthenticated() && !req.user[role]) { throw new Error("User doesn't have property named: " +
                                                       role + ". See Advantage Start in docs") }

    if (req.isAuthenticated()) {
      if (!roles || roles.indexOf(req.user[role]) > -1) {
        after(req, res, next, permission.AUTHORIZED);
      } else if (Object.prototype.toString.call(req.user[role]) === '[object Array]') {
        var perm = permission.NOT_AUTHORIZED;
        for (var i = 0; i < req.user[role].length; i++) {
          if (roles.indexOf(req.user[role][i]) > -1) {
            perm = permission.AUTHORIZED;
            break;
          }
        }
        after(req, res, next, perm);
      } else {
        after(req, res, next, permission.NOT_AUTHORIZED);
      }
    }
    else {
      after(req, res, next, permission.NOT_AUTHENTICATED);
    }
  }
}

Object.defineProperty(permission, 'AUTHORIZED', { value: 'authorized' });
Object.defineProperty(permission, 'NOT_AUTHORIZED', { value: 'notAuthorized' });
Object.defineProperty(permission, 'NOT_AUTHENTICATED', { value: 'notAuthenticated' });

module.exports = permission;