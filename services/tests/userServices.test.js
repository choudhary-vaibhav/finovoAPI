const userServices = require('../userServices');

const User = require('../../models/User');

jest.mock('../../models/User');

describe('create user', () => {
    let res;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    }); 

    test('should create a new user successfully if the email is not taken', async () => {

        User.exists.mockResolvedValue(null);
        User.prototype.save = jest.fn().mockResolvedValue(true);

        await userServices.createUser('John Doe', 'john@example.com', 'password123', res);

        expect(User.exists).toHaveBeenCalledWith({ email: 'john@example.com' });
        expect(User.prototype.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'User successfully registered!',
            _id: undefined,
        }));
    });

    test("should return 403 if user already exists", async () => {
    // Arrange
    User.exists.mockResolvedValue(true);

    // Act
    await userServices.createUser("John", "john@test.com", "123456", res);

    // Assert
    expect(User.exists).toHaveBeenCalledWith({ email: "john@test.com" });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "User Already Exists!"
    });
  });
});