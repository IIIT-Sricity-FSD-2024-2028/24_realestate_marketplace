/**
 * Deliberately empty.
 *
 * Forgot-password emails a newly generated password directly to the account,
 * so there is nothing safe to hand back to the caller: the password itself
 * must never appear in an API response, and any field that were present only
 * when the account exists (the old `expiresInSeconds` was) would leak
 * account existence to anyone probing the endpoint.
 */
export class ForgotPasswordResponseDto {}
