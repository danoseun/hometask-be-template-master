class ProfileNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProfileNotFoundError";
    this.status = 400;
  }
}

module.exports = { ProfileNotFoundError };
