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
module.exports = function(roles){
  return function(req, res, next) {

    /**
     * Default configuration
     */
    var noPermissionRedirect  = null;
    var noPermissionStatus    = 401;
    var role                  = 'role';

    /**
     * Default configuration is overriden
     */
    if (req.app.get('permission')){
      if ('noPermissionRedirect' in req.app.get('permission')) {
        noPermissionRedirect = req.app.get('permission').noPermissionRedirect;
      }
      if ('noPermissionStatus' in req.app.get('permission')) {
        noPermissionStatus = req.app.get('permission').noPermissionStatus;
      }
      if (req.app.get('permission').role){
        role = req.app.get('permission').role;
      }
    }

    if (req.isAuthenticated() && !req.user[role]) { throw new Error("User doesn't have property named: " +
                                                       role + ". See Advantage Start in docs") }


    // checks passport integrated function
    if (req.isAuthenticated()) {
      if (!roles){
        next();
      } else if (roles.indexOf(req.user[role]) > -1){
        next();
      } else if (noPermissionRedirect != null) {
        res.redirect(noPermissionRedirect);
      } else {
        res.status(noPermissionStatus).send(null);
      }
    }
    else if (noPermissionRedirect != null) {
      res.redirect(noPermissionRedirect);
    }
    else {
      res.status(noPermissionStatus).send(null);
    }
  }
}
