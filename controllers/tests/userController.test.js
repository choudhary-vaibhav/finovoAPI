const userController = require('../userController');
const bcrypt = require('bcrypt');
const userServices = require('../../services/userServices');

jest.mock("bcrypt", () => ({
  genSalt: jest.fn(),
  hash: jest.fn()
}));

jest.mock('../../services/userServices', () => ({
    createUser: jest.fn()
}));

describe('signup', () => {
    let req, res;

    beforeEach(() =>{
        req = {
            body: { }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return 400 if name is not provided', async () => {
        req.body = {
            email: 'abc@xyz.com',
            password: 'password123'
        }

        await userController.signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Name not provided" });
    });

    test('should return 400 if email is not provided', async () => {
        req.body = {
            name: 'test123',
            password: 'password123'
        }

        await userController.signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Email not provided" });
    });

    test('should return 400 if password is not provided', async () => {
        req.body = {
            name: 'test123',
            email: 'abc@xyz.com'
        }

        await userController.signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Password not provided" });
    });

    test('should hash password and call createUser service', async () => {
        req.body = {
            name: 'test123',
            email: 'abc@xyz.com',
            password: 'password123'
        }

        // mock bcrypt.genSalt
        bcrypt.genSalt.mockImplementation((rounds, cb) => {
            cb(null, "fakeSalt");
        });

        // mock bcrypt.hash
        bcrypt.hash.mockImplementation((password, salt, cb) => {
            cb(null, "hashedPassword");
        });

        userServices.createUser.mockResolvedValue(true);

        await userController.signup(req, res);

        expect(bcrypt.genSalt).toHaveBeenCalledWith(10, expect.any(Function));
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'fakeSalt', expect.any(Function));
        expect(userServices.createUser).toHaveBeenCalledWith('test123', 'abc@xyz.com', 'hashedPassword', res);

    });
});