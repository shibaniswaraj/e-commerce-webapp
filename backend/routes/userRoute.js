const express=require("express");
const router=express.Router();
const {registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updateUserPassword, updateUserProfile, getSingleUser, getAllUser, updateUserRole, deleteUser}=require("../controllers/userController")
const {isAuthenticatedUser, authorizeRoles} = require("../middleware/auth")
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/password/forgot").post(forgotPassword)
router.route("/password/reset/:token").put(resetPassword)
router.route("/logout").get(logout)
router.route('/me').get(isAuthenticatedUser,getUserDetails)
router.route("/password/update").put(isAuthenticatedUser,updateUserPassword);
router.route("/me/update").put(isAuthenticatedUser,updateUserProfile);
router.route("/admin/user/:id").get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser)
.put(isAuthenticatedUser,authorizeRoles("admin"),updateUserRole)
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser);
router.route("/admin/users").get(isAuthenticatedUser,authorizeRoles("admin"),getAllUser);
module.exports=router