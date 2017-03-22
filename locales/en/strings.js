export default {
    "de": {
        "client": {
            header: {
                title: "CoasterCentral"
            }
        },
        "errorCodes": {
            authenticationUserNotFound: "Benutzer nicht gefunden",
            authenticationWrongPassword: "Kennwort ungültig",
            registrationFillAllFields: 'Bitte füllen Sie alle Felder aus',
            registrationUsernameOrEmailExists: 'Der Benutzername oder die E-Mail Adresse is bereits vergeben',
            internalError: "interner Serverfehler",
            operationNotAllowed: "Sie sind nicht berechtigt diese Aktion auszuführen. Fehlendes Recht: '{0}'"
        },
        permissions: {
        }
    },
    "en": {
        client: {
            header: {
                title: "CoasterCentral"
            }
        },
        email: {
            userActivation: {
                subject: "Account Activation on Keystone"
            }
        },
        errorCodes: {
            authenticationUserNotFound: "User not found",
            authenticationWrongPassword: "Password is invalid",
            authenticationUserInactive: "User is inactive",
            registrationFillAllFields: 'Please enter values on all fields',
            registrationUsernameOrEmailExists: 'Username or eMail address exists',
            internalError: "Internal Server Error",
            operationNotAllowed: "You are not allowed to perform this operation. Missing permission: `{0}`",
            userGroupNotFound: "The user group `{0}` not found",
            userModifyCantAssignGroupWithLessEqualLevelThanMe: "You can´t assign a group with a lower or equal level than your",
            userModifyCantModifyUserWithLessEqualLevelThanMe: "You can´t modify a user with a lower or equal group level than your",
            userCantSubscribeItSelf: "You can´t subscribe your self",
            userCantUnsubscribeItSelf: "You can´t unsubscribe your self",
            userCantBlockItSelf: "You can´t block your self",
            userCantUnblockItSelf: "You can´t unblock your self",
            userActivateFailed: "Failed to activate user account",
            userActivateTokenExpired: "Activation token is expired",
            userActivateUserAlreadyActive: "User account is already active",
            userNotFound: "The user `{0}` not found",
            mongooseValidationErrorRequired: "Field `{0}` is required",
            mongooseValidationErrorEnum: "Field `{0}` should only contain [{1}]",
            invalidObjectID: "Invalid ID `{0}`"
        },
        permissions: {
        }
    }
}